import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getCertificates,
  getTemplates,
  deleteCertificate,
  getCertificatePDF,
  sendCertificateEmail,
  sendBulkEmails,
  getCurrentUser,
} from "../api";
import {
  Pencil,
  Trash,
  PlusCircle,
  Download,
  Eye,
  Mail,
  Send,
  HelpCircle,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  FileText,
  CheckCircle,
  CreditCard,
  LayoutTemplate,
  Upload,
  AlertCircle,
  Award
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

function ErrorBoundary({ children }) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const errorHandler = (error) => {
      console.error(
        "Error caught by ErrorBoundary in MyCertificatesPage:",
        error
      );
      setHasError(true);
    };
    const originalError = console.error;
    console.error = (...args) => {
      if (/The above error occurred in the <.*> component/.test(args[0])) {
        errorHandler(args[0]);
      }
      originalError(...args);
    };

    return () => {
      console.error = originalError;
    };
  }, []);

  if (hasError) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded m-4">
        Something went wrong while rendering this page. Please refresh or try
        logging in again.
      </div>
    );
  }
  return children;
}

function MyCertificatesPage() {
  const [certificates, setCertificates] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCert, setSelectedCert] = useState(null);
  const [loading, setLoading] = useState(true);

  // Action States
  const [downloadingId, setDownloadingId] = useState(null);
  const [sendingId, setSendingId] = useState(null);
  const [isBulkSending, setIsBulkSending] = useState(false);
  const [selectedCertIds, setSelectedCertIds] = useState(new Set());

  // Filter & Pagination States
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // all, sent, not_sent
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [certResponse, templateResponse, userResponse] = await Promise.all([
        getCertificates(),
        getTemplates(),
        getCurrentUser(),
      ]);
      // Sort by newest first
      const sortedCertificates = certResponse.data.sort(
        (a, b) =>
          new Date(b.issue_date).getTime() - new Date(a.issue_date).getTime()
      );
      setCertificates(sortedCertificates);
      setTemplates(templateResponse.data.templates);
      setUser(userResponse.data);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(
        "Could not fetch dashboard data. Your session might have expired. Please try logging in again."
      );
    } finally {
      setLoading(false);
    }
  };

  // --- Derived State for Filtering & Pagination ---
  const filteredCertificates = useMemo(() => {
    return certificates.filter((cert) => {
      const matchesSearch =
        cert.recipient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.course_title.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        filterStatus === "all"
          ? true
          : filterStatus === "sent"
          ? !!cert.sent_at
          : !cert.sent_at;

      return matchesSearch && matchesStatus;
    });
  }, [certificates, searchTerm, filterStatus]);

  const totalPages = Math.ceil(filteredCertificates.length / itemsPerPage);
  const paginatedCertificates = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredCertificates.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredCertificates, currentPage]);

  // --- Handlers ---

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleSendEmail = (certId) => {
    setSendingId(certId);
    const promise = sendCertificateEmail(certId);

    toast.promise(promise, {
      loading: "Sending email...",
      success: (res) => {
        setCertificates((certs) =>
          certs.map((c) =>
            c.id === certId ? { ...c, sent_at: new Date().toISOString() } : c
          )
        );
        return res.data.msg || "Email sent successfully!";
      },
      error: (err) => err.response?.data?.msg || "Failed to send email.",
    });

    promise.finally(() => setSendingId(null));
  };

  const handleSelectOne = (certId) => {
    const newSelection = new Set(selectedCertIds);
    if (newSelection.has(certId)) newSelection.delete(certId);
    else newSelection.add(certId);
    setSelectedCertIds(newSelection);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      // Select all currently filtered certificates
      const allIds = filteredCertificates.map((c) => c.id);
      setSelectedCertIds(new Set(allIds));
    } else {
      setSelectedCertIds(new Set());
    }
  };

  const handleBulkSend = () => {
    if (selectedCertIds.size === 0) {
      toast.error("Please select at least one certificate to send.");
      return;
    }
    setIsBulkSending(true);
    const ids = Array.from(selectedCertIds);
    const promise = sendBulkEmails(ids);

    toast.promise(promise, {
      loading: `Sending ${ids.length} emails...`,
      success: (res) => {
        fetchData();
        setSelectedCertIds(new Set());
        const { sent, failed } = res.data;
        return `Process complete! Sent: ${sent.length}, Failed: ${
          failed?.length || 0
        }.`;
      },
      error: (err) => err.response?.data?.msg || "Bulk send failed.",
    });

    promise.finally(() => setIsBulkSending(false));
  };

  const handleDelete = async () => {
    if (!selectedCert) return;
    const promise = deleteCertificate(selectedCert.id);
    toast.promise(promise, {
      loading: "Deleting certificate...",
      success: () => {
        setCertificates(
          certificates.filter((cert) => cert.id !== selectedCert.id)
        );
        setShowDeleteModal(false);
        setSelectedCert(null);
        // Clear from selection if it was selected
        if (selectedCertIds.has(selectedCert.id)) {
          const newSet = new Set(selectedCertIds);
          newSet.delete(selectedCert.id);
          setSelectedCertIds(newSet);
        }
        return "Certificate deleted successfully.";
      },
      error: (err) =>
        err.response?.data?.msg || "Failed to delete certificate.",
    });
  };

  const handleDownload = (cert) => {
    setDownloadingId(cert.id);
    const promise = getCertificatePDF(cert.id);
    toast.promise(promise, {
      loading: "Generating PDF...",
      success: (response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          `certificate_${cert.verification_id}.pdf`
        );
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);
        return "Download started!";
      },
      error: (err) => err.response?.data?.msg || "Failed to download PDF.",
    });
    promise.finally(() => setDownloadingId(null));
  };

  // --- Premium Stats Configuration ---
  const stats = [
    {
      title: "Certificates Issued",
      value: certificates.length,
      icon: <FileText className="w-5 h-5 text-blue-600" />,
      bg: "bg-white",
      text: "text-gray-900",
      border: "border-blue-100",
      iconBg: "bg-blue-50"
    },
    {
      title: "Active Templates",
      value: templates.length,
      icon: <LayoutTemplate className="w-5 h-5 text-emerald-600" />,
      bg: "bg-white",
      text: "text-gray-900",
      border: "border-emerald-100",
      iconBg: "bg-emerald-50"
    },
  ];

  return (
    <ErrorBoundary>
      <div className="max-w-7xl mx-auto pb-20 px-4 sm:px-6 lg:px-8">
        <Toaster position="top-right" />

        {/* --- 1. Header Section --- */}
        <div className="py-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Dashboard
            </h1>
            <p className="text-gray-500 mt-2 text-lg">
              Welcome back, <span className="font-semibold text-gray-900">{user?.name?.split(" ")[0]}</span>. Here's your activity overview.
            </p>
          </div>
          <div className="flex gap-3">
             <Link
              to="/dashboard/bulk-create"
              className="inline-flex items-center justify-center bg-white border border-gray-200 text-gray-700 rounded-lg py-2.5 px-5 hover:bg-gray-50 hover:border-gray-300 transition-all font-semibold shadow-sm text-sm"
            >
              <Upload className="w-4 h-4 mr-2" />
              Bulk Import
            </Link>
            <Link
              to="/dashboard/create"
              className="inline-flex items-center justify-center bg-gray-900 text-white rounded-lg py-2.5 px-5 hover:bg-black transition-all font-semibold shadow-lg shadow-gray-200 text-sm"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Create Certificate
            </Link>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-8 shadow-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {/* --- 2. Stats Grid --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          
          {/* Badge Card */}
          <div className="relative overflow-hidden rounded-lg p-4 shadow-lg bg-[#1e293b] text-white flex flex-col justify-between group border border-gray-700">
             {/* Decorative 'Guilloche' Pattern element */}
             <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/5 rounded-full border-[20px] border-white/5 blur-sm pointer-events-none"></div>
             
             <div className="relative z-10 flex justify-between items-start">
                <div>
                   <div className="flex items-center gap-2 mb-1">
                      <div className="p-1 bg-indigo-500/20 rounded border border-indigo-400/30">
                        <Award className="w-3.5 h-3.5 text-indigo-300" />
                      </div>
                      <span className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest">Authorized Issuer</span>
                   </div>
                   <h3 className="text-3xl font-serif font-medium text-white tracking-tight mt-1">
                    {user?.cert_quota?.toLocaleString() || 0}
                  </h3>
                   <p className="text-xs text-gray-400">Available Credits</p>
                </div>
             </div>

             <div className="relative z-10 flex justify-between items-end mt-2 pt-3 border-t border-white/10">
               <div>
                  <p className="font-serif text-sm tracking-wide text-white">{user?.name || "Authorized Member"}</p>
               </div>
               
               <Link to="/dashboard/settings" className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold py-1.5 px-3 rounded-md transition-all shadow-sm flex items-center gap-1.5 decoration-0">
                  <PlusCircle size={12}/> Top Up
               </Link>
             </div>
          </div>

          {/* Other Stats */}
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`relative overflow-hidden rounded-lg p-6 shadow-sm transition-all duration-200 hover:shadow-md group ${
                stat.bg === 'bg-white' ? 'bg-gradient-to-br from-white to-slate-50 border border-gray-200' : stat.bg + ' ' + stat.text
              }`}
            >
              <div className="flex items-start justify-between relative z-10">
                <div>
                   <p className={`text-sm font-medium mb-1 ${stat.bg === 'bg-white' ? 'text-gray-500' : 'text-indigo-100'}`}>
                    {stat.title}
                  </p>
                  <h3 className={`text-3xl font-bold tracking-tight ${stat.bg === 'bg-white' ? 'text-gray-900' : 'text-white'}`}>
                    {stat.value}
                  </h3>
                  {stat.subtext && (
                       <p className="text-indigo-100 text-xs mt-2 opacity-80">{stat.subtext}</p>
                  )}
                </div>
                <div className={`p-3 rounded-lg ${stat.iconBg || 'bg-white/20'}`}>
                    {stat.icon}
                </div>
              </div>

              {/* Decorative Background Icon */}
              {stat.bg === 'bg-white' && (
                  <>
                    <div className="absolute -bottom-6 -right-6 text-indigo-900/5 transform rotate-12 group-hover:scale-110 group-hover:-rotate-12 transition-all duration-500">
                        {React.cloneElement(stat.icon, { className: "w-32 h-32" })}
                    </div>
                  </>
              )}
            </div>
          ))}
        </div>

        {/* --- 3. Main Content Card --- */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden min-h-[500px] flex flex-col">
          
          {/* Toolbar */}
          <div className="p-5 border-b border-gray-100">
             <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
                 
                 {/* Left: Tabs */}
                 <div className="flex p-1 bg-gray-100/80 rounded-xl self-start w-full lg:w-auto">
                    {["all", "sent", "not_sent"].map((status) => (
                      <button
                        key={status}
                        onClick={() => {
                          setFilterStatus(status);
                          setCurrentPage(1);
                        }}
                        className={`flex-1 lg:flex-none px-6 py-2 text-sm font-semibold rounded-lg transition-all ${
                          filterStatus === status
                            ? "bg-white text-gray-900 shadow-sm"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                         {status === "all" ? "All Certificates" : status === "sent" ? "Issued" : "Drafts"}
                      </button>
                    ))}
                 </div>

                 {/* Right: Search & Bulk */}
                 <div className="flex items-center gap-3 w-full lg:w-auto">
                    <div className="relative flex-1 lg:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search recipient or course..."
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all text-sm outline-none"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                    </div>
                    {selectedCertIds.size > 0 && (
                        <button
                            onClick={handleBulkSend}
                            disabled={isBulkSending}
                            className="whitespace-nowrap inline-flex items-center bg-indigo-600 text-white text-sm font-semibold rounded-xl py-2 px-4 hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-70"
                        >
                            {isBulkSending ? <div className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full mr-2"/> : <Send className="w-4 h-4 mr-2" />}
                            Send ({selectedCertIds.size})
                        </button>
                    )}
                 </div>
             </div>
          </div>

          {/* Table Content */}
          <div className="flex-1 relative">
            {loading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
                    <div className="flex flex-col items-center gap-3">
                        <div className="animate-spin h-8 w-8 text-indigo-600 border-2 border-indigo-100 border-t-indigo-600 rounded-full"></div>
                        <p className="text-sm font-medium text-gray-500">Loading records...</p>
                    </div>
                </div>
            ) : null}

            {filteredCertificates.length === 0 && !loading ? (
                <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                    <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                        <Search className="w-10 h-10 text-gray-300" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">No certificates found</h3>
                    <p className="text-gray-500 max-w-sm mx-auto mb-6">
                        {searchTerm ? "No results match your search criteria. Try a different keyword." : "Get started by creating your first certificate."}
                    </p>
                    {(!searchTerm && filterStatus === "all") && (
                        <Link to="/dashboard/create" className="text-indigo-600 font-semibold hover:text-indigo-800 text-sm">
                            Create new certificate &rarr;
                        </Link>
                    )}
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th scope="col" className="px-6 py-4 text-left w-10">
                                    <input
                                        type="checkbox"
                                        onChange={handleSelectAll}
                                        checked={paginatedCertificates.length > 0 && paginatedCertificates.every((c) => selectedCertIds.has(c.id))}
                                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                    />
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Recipient</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Course Detail</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Issued</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-50">
                            {paginatedCertificates.map((cert) => {
                                const isSelected = selectedCertIds.has(cert.id);
                                return (
                                    <tr key={cert.id} className={`group hover:bg-gray-50/80 transition-colors ${isSelected ? "bg-indigo-50/40" : ""}`}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => handleSelectOne(cert.id)}
                                                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                 <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-600 font-bold text-xs uppercase border border-gray-200">
                                                     {cert.recipient_name.charAt(0)}
                                                 </div>
                                                 <div>
                                                     <p className="text-sm font-semibold text-gray-900">{cert.recipient_name}</p>
                                                     <p className="text-xs text-gray-500">{cert.recipient_email}</p>
                                                 </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                                            {cert.course_title}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(cert.issue_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric'})}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cert.sent_at ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-gray-50 text-gray-600 border-gray-200"}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${cert.sent_at ? "bg-emerald-500" : "bg-gray-400"}`} />
                                                {cert.sent_at ? "Emailed" : "Draft"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                            <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                                 {/* Action Buttons */}
                                                 <button
                                                    onClick={() => handleSendEmail(cert.id)}
                                                    disabled={!!cert.sent_at}
                                                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                                    title="Send Email"
                                                 >
                                                    {sendingId === cert.id ? <div className="animate-spin h-4 w-4 border-2 border-indigo-600 border-t-transparent rounded-full" /> : <Mail className="w-4 h-4" />}
                                                 </button>
                                                 <button
                                                    onClick={() => handleDownload(cert)}
                                                    className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
                                                    title="Download"
                                                 >
                                                    {downloadingId === cert.id ? <div className="animate-spin h-4 w-4 border-2 border-gray-600 border-t-transparent rounded-full" /> : <Download className="w-4 h-4" />}
                                                 </button>
                                                 <Link
                                                    to={`/dashboard/view/${cert.id}`}
                                                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                                    title="View Details"
                                                 >
                                                    <Eye className="w-4 h-4" />
                                                 </Link>
                                                 <Link
                                                    to={`/dashboard/edit/${cert.id}`}
                                                    className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
                                                    title="Edit"
                                                 >
                                                    <Pencil className="w-4 h-4" />
                                                 </Link>
                                                 <button
                                                     onClick={() => { setSelectedCert(cert); setShowDeleteModal(true); }}
                                                     className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                     title="Delete"
                                                 >
                                                     <Trash className="w-4 h-4" />
                                                 </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination Footer */}
            {!loading && filteredCertificates.length > itemsPerPage && (
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/30">
                     <p className="text-xs text-gray-500 font-medium">
                        Page {currentPage} of {totalPages}
                     </p>
                     <div className="flex gap-2">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="p-2 bg-white border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="p-2 bg-white border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                     </div>
                </div>
            )}
           </div>
        </div>

        {/* Delete Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full border border-gray-100">
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                  <Trash className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Delete Certificate?</h3>
                <p className="text-gray-500 text-sm mt-2">
                    Are you sure? This will permanently remove the certificate for <strong>{selectedCert?.recipient_name}</strong>.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2.5 text-white bg-red-600 hover:bg-red-700 rounded-xl font-semibold transition-colors shadow-sm text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}

export default MyCertificatesPage;
