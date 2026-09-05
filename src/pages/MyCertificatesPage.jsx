import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
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
  Award,
  FileBadge,
  Bell,
  Settings,
  ArrowUpRight,
  Activity,
  TrendingUp,
  Users,
  Folder
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
  const [hoveredDay, setHoveredDay] = useState(null);
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
        const saneName = cert.recipient_name?.replace(/[\W_]+/g, "_").replace(/^_+|_+$/g, "");
        const filename = saneName ? `${saneName}.pdf` : `doc_${cert.verification_id}.pdf`;
        link.setAttribute("download", filename);
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

  const location = useLocation();

  const navLinks = [
    { name: "Overview", path: "/dashboard" },
    { name: "Templates", path: "/dashboard/templates" },
    { name: "Groups", path: "/dashboard/groups" },
    { name: "Analytics", path: "/dashboard/analytics" },
    { name: "Settings", path: "/dashboard/settings" },
  ];

  const quickActions = [
    {
      title: "Issue Certificate",
      description: "Create a single certificate manually",
      buttonText: "Issue",
      icon: <Award className="w-4 h-4 text-slate-600" />,
      onClick: () => navigate("/dashboard/create"),
    },
    {
      title: "Bulk Import Excel",
      description: "Issue certificates from spreadsheets",
      buttonText: "Import",
      icon: <Upload className="w-4 h-4 text-slate-600" />,
      onClick: () => navigate("/dashboard/bulk-create"),
    },
    {
      title: "Visual Templates",
      description: "Design and customize certificate layouts",
      buttonText: "Design",
      icon: <LayoutTemplate className="w-4 h-4 text-slate-600" />,
      onClick: () => navigate("/dashboard/templates"),
    },
    {
      title: "Certificate Groups",
      description: "Organize credentials in batches",
      buttonText: "Groups",
      icon: <Folder className="w-4 h-4 text-slate-600" />,
      onClick: () => navigate("/dashboard/groups"),
    },
    {
      title: "System Settings",
      description: "Configure profile and API keys",
      buttonText: "Settings",
      icon: <Settings className="w-4 h-4 text-slate-600" />,
      onClick: () => navigate("/dashboard/settings"),
    },
  ];

  // Activity Chart Data
  const chartData = useMemo(() => {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const counts = { Monday: 0, Tuesday: 0, Wednesday: 0, Thursday: 0, Friday: 0, Saturday: 0, Sunday: 0 };
    
    certificates.forEach(c => {
      if (c.issue_date || c.created_at) {
        const date = new Date(c.issue_date || c.created_at);
        const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
        if (counts[dayName] !== undefined) {
          counts[dayName]++;
        }
      }
    });

    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    
    // Fallback default distribution (for premium placeholder/aesthetic look)
    const baseMock = { Monday: 3, Tuesday: 2, Wednesday: 6, Thursday: 1, Friday: 4, Saturday: 0, Sunday: 1 };
    
    return days.map(d => {
      const count = total > 0 ? counts[d] : baseMock[d];
      return {
        day: d,
        shortDay: d.substring(0, 3),
        count: count,
      };
    });
  }, [certificates]);

  // Find max count to scale the bars
  const maxCount = useMemo(() => {
    const counts = chartData.map(d => d.count);
    const max = Math.max(...counts);
    return max > 0 ? max : 10;
  }, [chartData]);

  const maxDayIndex = useMemo(() => {
    const counts = chartData.map(d => d.count);
    const max = Math.max(...counts);
    if (max <= 0) return -1;
    return chartData.findIndex(d => d.count === max);
  }, [chartData]);

  return (
    <ErrorBoundary>
      <div className="w-full pb-20">
        <Toaster position="top-right" />

        {/* --- 1. Top Navigation Bar (Header) --- */}
        <div className="border-b border-slate-200/80 bg-white mb-6 -mt-6 -mx-4 sm:-mx-6 md:-mx-8 px-4 sm:px-6 md:px-8 py-3">
          <div className="flex items-center justify-between gap-4 max-w-[1600px] mx-auto">
            {/* Left: Page Title */}
            <h1 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-0">Overview</h1>

            {/* Right: Search, Import, Avatar */}
            <div className="flex items-center gap-4 self-end md:self-auto">
              <div className="relative w-48 sm:w-60">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
                <input
                  type="text"
                  placeholder="Search or ask AI..."
                  className="w-full pl-8 pr-10 py-1.5 bg-slate-50 border border-slate-200/60 rounded-lg focus:bg-white focus:border-slate-400 transition-all text-xs outline-none"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] font-semibold text-slate-400 bg-white border border-slate-200 px-1 py-0.5 rounded shadow-sm">
                  ⌘K
                </span>
              </div>

              <Link
                to="/dashboard/bulk-create"
                className="inline-flex items-center justify-center bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg py-1.5 px-3 transition-all font-semibold text-xs shadow-sm decoration-none"
              >
                Import
              </Link>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded text-xs mb-6 shadow-sm flex items-center gap-3">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {/* --- 2. Bento-Grid Layout --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 border border-slate-200/80 bg-white rounded-xl overflow-hidden shadow-sm divide-y lg:divide-y-0 lg:divide-x divide-slate-200/80">
          
          {/* LEFT COLUMN PANEL (lg:col-span-8) */}
          <div className="lg:col-span-8 flex flex-col divide-y divide-slate-200/80">
            
            {/* Metrics Sub-grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-200/80">
              {/* Available Credits Card */}
              <div className="p-4 sm:p-5 bg-white hover:bg-slate-50/20 transition-colors">
                <div className="flex items-center justify-between mb-1.5 gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">Available Credits</span>
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded text-[9px] font-bold shrink-0">
                    Active
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 mt-1">
                  {user?.cert_quota?.toLocaleString() || 0}
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Credits left in active plan</p>
              </div>

              {/* Certificates Issued Card */}
              <div className="p-4 sm:p-5 bg-white hover:bg-slate-50/20 transition-colors">
                <div className="flex items-center justify-between mb-1.5 gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">Issued Documents</span>
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded text-[9px] font-bold shrink-0">
                    Active
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 mt-1">
                  {certificates.length}
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Total generated certificates</p>
              </div>

              {/* Active Templates Card */}
              <div className="p-4 sm:p-5 bg-white hover:bg-slate-50/20 transition-colors">
                <div className="flex items-center justify-between mb-1.5 gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">Active Templates</span>
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-100 rounded text-[9px] font-bold shrink-0">
                    Active
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 mt-1">
                  {templates.length}
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Design presets available</p>
              </div>
            </div>

            {/* Issuance Activity Chart Panel */}
            <div className="p-4 sm:p-6 bg-white">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Activity Overview</h3>
                  <p className="text-[10px] text-slate-400">Weekly certificate issuance statistics</p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-50 shadow-sm flex items-center gap-1">
                    Customize
                  </button>
                  <button className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-50 shadow-sm flex items-center gap-1">
                    This week
                  </button>
                  <button className="p-1 bg-white border border-slate-200 rounded-md hover:bg-slate-50 shadow-sm">
                    <Filter className="w-3.5 h-3.5 text-slate-500" />
                  </button>
                </div>
              </div>

              {/* Chart */}
              <div className="flex items-end justify-between h-48 pt-6 pb-2 px-4 relative border-b border-slate-100">
                {chartData.map((data, index) => {
                  const heightPercent = (data.count / maxCount) * 80; // scale to max 80% height
                  
                  // Filter certificates for this day
                  const dayCertificates = certificates.filter(c => {
                    if (c.issue_date || c.created_at) {
                      const date = new Date(c.issue_date || c.created_at);
                      const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
                      return dayName === data.day;
                    }
                    return false;
                  });

                  const avatars = dayCertificates.slice(0, 3).map(c => {
                    return (c.recipient_name || "G").charAt(0).toUpperCase();
                  });

                  const showTooltip = hoveredDay === data.day || (hoveredDay === null && maxCount > 0 && index === maxDayIndex);
                  
                  return (
                    <div key={index} className="flex flex-col items-center justify-end flex-1 h-full group/bar relative">
                      {/* Tooltip Card */}
                      {showTooltip && (
                        <div className="absolute top-0 z-20 bg-white border border-slate-200/80 rounded-lg py-1.5 px-2.5 shadow-md flex items-center gap-2 mb-2 animate-in fade-in slide-in-from-bottom-2 duration-300 pointer-events-none">
                          <span className="text-[11px] font-bold text-slate-850">{data.count}</span>
                          <span className="text-[9px] font-semibold text-slate-400">
                            {certificates.length > 0 
                              ? `${(data.count / certificates.length * 100).toFixed(0)}% Issued` 
                              : "0% Issued"}
                          </span>
                          {/* Little dynamic avatars */}
                          {avatars.length > 0 && (
                            <div className="flex -space-x-1 overflow-hidden">
                              {avatars.map((initial, i) => (
                                <div key={i} className={`w-3.5 h-3.5 rounded-full ring-1 ring-white text-[6px] text-white flex items-center justify-center font-bold ${
                                  i === 0 ? "bg-indigo-500" : i === 1 ? "bg-emerald-500" : "bg-amber-500"
                                }`}>
                                  {initial}
                                </div>
                              ))}
                            </div>
                          )}
                          {/* Small tooltip arrow */}
                          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white border-b border-r border-slate-200/80 rotate-45"></div>
                        </div>
                      )}

                      {/* Bar Container with definite height so CSS percentage heights render properly */}
                      <div className="w-full h-34 flex items-end justify-center relative">
                        <div 
                          onMouseEnter={() => setHoveredDay(data.day)}
                          onMouseLeave={() => setHoveredDay(null)}
                          style={{ height: `${Math.max(heightPercent, 8)}%` }}
                          className={`w-9 sm:w-11 rounded-t-md transition-all duration-300 relative cursor-pointer
                            ${showTooltip 
                              ? "bg-gradient-to-t from-indigo-600 to-indigo-500 shadow-sm shadow-indigo-500/10 scale-x-105" 
                              : "bg-indigo-100/70 hover:bg-indigo-200/80"
                            }`}
                        />
                      </div>
                      
                      {/* Day Label */}
                      <span className="text-[10px] font-semibold text-slate-400 mt-2.5 tracking-wider">{data.shortDay}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Certificates / Listing Panel */}
            <div className="p-6 bg-white flex flex-col flex-1">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Recent Credentials</h3>
                  <p className="text-[10px] text-slate-400">Manage and verify issued certificates</p>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="flex p-0.5 bg-slate-100 border border-slate-200/60 rounded w-full sm:w-auto">
                    {["all", "sent", "not_sent"].map((status) => (
                      <button
                        key={status}
                        onClick={() => {
                          setFilterStatus(status);
                          setCurrentPage(1);
                        }}
                        className={`flex-1 sm:flex-none px-3 py-1 text-[10px] font-bold rounded transition-all ${
                          filterStatus === status
                            ? "bg-white text-slate-800 shadow-sm border border-slate-200/20"
                            : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        {status === "all" ? "All" : status === "sent" ? "Issued" : "Drafts"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Table Area */}
              <div className="flex-1 relative border border-slate-100 rounded-lg overflow-hidden bg-white">
                {loading ? (
                  <div className="w-full divide-y divide-slate-100 animate-pulse">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-white">
                        <div className="flex items-center gap-3 w-1/3">
                          <div className="w-4 h-4 bg-gray-200 rounded" />
                          <div className="h-3.5 bg-gray-200 rounded w-full" />
                        </div>
                        <div className="h-3 bg-gray-200 rounded w-1/4" />
                        <div className="h-3 bg-gray-200 rounded w-1/6" />
                        <div className="h-4 bg-gray-200 rounded w-12" />
                      </div>
                    ))}
                  </div>
                ) : null}

                {filteredCertificates.length === 0 && !loading ? (
                  <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3 border border-slate-100">
                      <Search className="w-5 h-5 text-slate-300" />
                    </div>
                    <h3 className="text-xs font-bold text-slate-900 mb-0.5">No certificates found</h3>
                    <p className="text-slate-500 text-[10px] max-w-sm mx-auto mb-3">
                      {searchTerm ? "No results match your search." : "Get started by creating your first certificate."}
                    </p>
                    {(!searchTerm && filterStatus === "all") && (
                      <Link to="/dashboard/create" className="text-indigo-600 font-semibold hover:text-indigo-800 text-[11px] decoration-none">
                        Create new certificate &rarr;
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-100">
                      <thead className="bg-slate-50/50">
                        <tr>
                          <th scope="col" className="px-4 py-2 text-left w-10">
                            <input
                              type="checkbox"
                              onChange={handleSelectAll}
                              checked={paginatedCertificates.length > 0 && paginatedCertificates.every((c) => selectedCertIds.has(c.id))}
                              className="h-3 w-3 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                            />
                          </th>
                          <th className="px-4 py-2 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">Recipient</th>
                          <th className="px-4 py-2 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">Course Detail</th>
                          <th className="px-4 py-2 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">Issued</th>
                          <th className="px-4 py-2 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                          <th className="px-4 py-2 text-right text-[10px] font-bold text-slate-400 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-50">
                        {paginatedCertificates.map((cert) => {
                          const isSelected = selectedCertIds.has(cert.id);
                          return (
                            <tr key={cert.id} className={`group hover:bg-slate-50/30 transition-colors ${isSelected ? "bg-indigo-50/30" : ""}`}>
                              <td className="px-4 py-3 align-middle whitespace-nowrap">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => handleSelectOne(cert.id)}
                                  className="h-3.5 w-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                />
                              </td>
                              <td className="px-4 py-3 align-middle">
                                <div className="flex items-center gap-3">
                                  {(() => {
                                    const colors = [
                                      "bg-indigo-50 text-indigo-700 border-indigo-150",
                                      "bg-emerald-50 text-emerald-700 border-emerald-150",
                                      "bg-sky-50 text-sky-700 border-sky-150",
                                      "bg-violet-50 text-violet-700 border-violet-150",
                                      "bg-pink-50 text-pink-700 border-pink-150",
                                      "bg-amber-50 text-amber-700 border-amber-150",
                                    ];
                                    const colorIndex = (cert.recipient_name || "G").charCodeAt(0) % colors.length;
                                    const avatarColorClass = colors[colorIndex];
                                    return (
                                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs uppercase border flex-shrink-0 shadow-xs ${avatarColorClass}`}>
                                        {(cert.recipient_name || "G").charAt(0)}
                                      </div>
                                    );
                                  })()}
                                  <div className="flex flex-col justify-center">
                                    <p className="text-xs font-bold text-slate-800 leading-normal mb-0.5">{cert.recipient_name}</p>
                                    <p className="text-[10px] text-slate-400 font-medium leading-none">{cert.recipient_email}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3 align-middle text-xs text-slate-700 font-bold">
                                {cert.course_title}
                              </td>
                              <td className="px-4 py-3 align-middle text-xs text-slate-500 font-medium">
                                {new Date(cert.issue_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric'})}
                              </td>
                              <td className="px-4 py-3 align-middle whitespace-nowrap">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[9px] font-bold ${cert.sent_at ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-slate-50 text-slate-650 border-slate-200"}`}>
                                  <span className={`w-1 h-1 rounded-full ${cert.sent_at ? "bg-emerald-500" : "bg-slate-400"}`} />
                                  {cert.sent_at ? "Emailed" : "Draft"}
                                </span>
                              </td>
                              <td className="px-4 py-2.5 whitespace-nowrap text-right text-xs">
                                <div className="flex items-center justify-end gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={() => handleSendEmail(cert.id)}
                                    disabled={!!cert.sent_at}
                                    className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-all"
                                    title="Send Email"
                                  >
                                    {sendingId === cert.id ? <div className="animate-spin h-3 w-3 border-2 border-indigo-600 border-t-transparent rounded-full" /> : <Mail className="w-3.5 h-3.5" />}
                                  </button>
                                  <button
                                    onClick={() => handleDownload(cert)}
                                    className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded transition-all"
                                    title="Download"
                                  >
                                    {downloadingId === cert.id ? <div className="animate-spin h-3.5 w-3.5 border-2 border-slate-600 border-t-transparent rounded-full" /> : <Download className="w-3.5 h-3.5" />}
                                  </button>
                                  <Link
                                    to={`/dashboard/view/${cert.id}`}
                                    className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-all"
                                    title="View Details"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </Link>
                                  <Link
                                    to={`/dashboard/edit/${cert.id}`}
                                    className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded transition-all"
                                    title="Edit"
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </Link>
                                  <button
                                    onClick={() => { setSelectedCert(cert); setShowDeleteModal(true); }}
                                    className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-all"
                                    title="Delete"
                                  >
                                    <Trash className="w-3.5 h-3.5" />
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
                  <div className="px-4 py-2 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
                    <p className="text-[10px] text-slate-500 font-medium">
                      Page {currentPage} of {totalPages}
                    </p>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-1 bg-white border border-slate-200 rounded text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                      >
                        <ChevronLeft className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="p-1 bg-white border border-slate-200 rounded text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                      >
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN PANEL (lg:col-span-4) */}
          <div className="lg:col-span-4 bg-slate-50/20 flex flex-col divide-y divide-slate-200/80">
            
            {/* Quick Actions Action Checklist */}
            <div className="p-6 bg-white">
              <div className="mb-4">
                <h3 className="text-sm font-bold text-slate-800">Start issuing certificates</h3>
                <p className="text-[10px] text-slate-400">Get started with templates and credentials</p>
              </div>

              {/* Large primary issue button */}
              <button 
                onClick={() => navigate("/dashboard/create")}
                className="w-full bg-slate-900 hover:bg-black text-white text-xs font-semibold py-2.5 px-4 rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5 mb-5 animate-pulse-subtle"
              >
                <FileBadge size={13} className="text-indigo-450" />
                <span>Issue Certificate</span>
              </button>

              {/* List Actions */}
              <div className="space-y-3.5">
                {quickActions.map((action, index) => (
                  <div key={index} className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200/40 flex items-center justify-center text-slate-500 shadow-inner">
                        {action.icon}
                      </div>
                      <div>
                        <h4 className="text-[11px] font-bold text-slate-800 leading-tight">{action.title}</h4>
                        <p className="text-[9px] text-slate-400 leading-tight mt-0.5">{action.description}</p>
                      </div>
                    </div>
                    <button 
                      onClick={action.onClick}
                      className="px-2.5 py-1 text-[10px] font-bold text-slate-600 bg-white border border-slate-250 rounded hover:bg-slate-50 transition-colors shadow-sm animate-none"
                    >
                      {action.buttonText}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Quotas & Credit Limits Panel */}
            <div className="p-6 bg-white flex flex-col gap-6">
              <div className="space-y-4">
                <div className="mb-2">
                  <h3 className="text-xs font-bold text-slate-850 uppercase tracking-wider">Account Quotas</h3>
                  <p className="text-[9px] text-slate-400">Plan usage metrics and balance</p>
                </div>

                {/* Quota Progress Bar 1 */}
                <div>
                  <div className="flex justify-between items-center mb-1 text-[10px] font-semibold">
                    <span className="text-slate-500">Certificate Credits Used</span>
                    <span className="text-slate-800">
                      {certificates.length} / {(certificates.length + (user?.cert_quota || 0))}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      style={{ width: `${(certificates.length / (certificates.length + (user?.cert_quota || 0) || 1) * 100)}%` }} 
                      className="h-full bg-blue-500 rounded-full transition-all duration-500"
                    />
                  </div>
                </div>

                {/* Quota Progress Bar 2 */}
                <div>
                  <div className="flex justify-between items-center mb-1 text-[10px] font-semibold">
                    <span className="text-slate-500">Templates Active</span>
                    <span className="text-slate-800">
                      {templates.length} / 50
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      style={{ width: `${(templates.length / 50 * 100)}%` }} 
                      className="h-full bg-blue-500 rounded-full transition-all duration-500"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-100 flex flex-col gap-3">
                <div className="text-[9px] text-slate-400 font-medium flex items-center justify-between">
                  <span>Usage resets on:</span>
                  <span className="text-slate-600 font-bold">
                    {user?.subscription_expiry 
                      ? new Date(user.subscription_expiry).toLocaleDateString()
                      : "Never (Lifetime)"
                    }
                  </span>
                </div>
                
                <Link 
                  to="/dashboard/settings" 
                  className="w-full bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold py-2 px-4 rounded-lg border border-slate-200 text-center shadow-sm transition-all decoration-none"
                >
                  Upgrade Account
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Bulk Action Bar */}
        {selectedCertIds.size > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-800 text-white rounded px-4 py-2.5 shadow-xl flex items-center gap-3.5 z-40 animate-in slide-in-from-bottom duration-300">
            <span className="text-[11px] font-medium text-slate-300">
              {selectedCertIds.size} {selectedCertIds.size === 1 ? 'certificate' : 'certificates'} selected
            </span>
            <div className="h-4 w-px bg-slate-800" />
            <div className="flex gap-2">
              <button
                onClick={handleBulkSend}
                disabled={isBulkSending}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-semibold py-1 px-3 rounded flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                {isBulkSending ? (
                  <div className="animate-spin h-3 w-3 border-2 border-white/30 border-t-white rounded-full" />
                ) : (
                  <Send className="w-3 h-3" />
                )}
                Send Emails
              </button>
              <button
                onClick={() => setSelectedCertIds(new Set())}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold py-1 px-3 rounded border border-slate-700 transition-colors"
              >
                Deselect
              </button>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded shadow-2xl p-5 max-w-sm w-full border border-slate-100">
              <div className="text-center mb-5">
                <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3 text-red-600 border border-red-100">
                  <Trash className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Delete Certificate?</h3>
                <p className="text-slate-500 text-xs mt-1.5">
                    Are you sure? This will permanently remove the certificate for <strong>{selectedCert?.recipient_name}</strong>.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-3 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded font-semibold transition-colors text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-3 py-2 text-white bg-red-600 hover:bg-red-700 rounded font-semibold transition-colors shadow-sm text-xs"
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
