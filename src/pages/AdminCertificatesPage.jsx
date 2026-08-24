import React, { useState, useEffect } from "react";
import {
  FileText,
  Search,
  CheckCircle,
  XCircle,
  Calendar,
  User,
  Award,
  ChevronLeft,
  ChevronRight,
  Filter,
  Eye,
  Trash2,
  FileCheck,
} from "lucide-react";
import {
  getAdminCertificatesOverview,
  getAdminCertificates,
  revokeAdminCertificate,
} from "../api";

function AdminCertificatesPage() {
  const [overview, setOverview] = useState({
    total: 0,
    by_user: [],
    by_template: [],
  });

  const [certificates, setCertificates] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [listLoading, setListLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState({
    start_date: "",
    end_date: "",
  });

  useEffect(() => {
    fetchOverview();
  }, []);

  useEffect(() => {
    fetchCertificates();
  }, [currentPage, search, statusFilter, dateFilter]);

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const res = await getAdminCertificatesOverview();
      setOverview(res.data);
    } catch (err) {
      setError(
        "Failed to fetch overview data. The certificate list may still work."
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchCertificates = async () => {
    setListLoading(true);
    try {
      const params = {
        page: currentPage,
        search,
        status: statusFilter,
        start_date: dateFilter.start_date || null,
        end_date: dateFilter.end_date || null,
        limit: 10,
      };
      const filteredParams = Object.fromEntries(
        Object.entries(params).filter(([_, v]) => v != null && v !== "")
      );
      const res = await getAdminCertificates(filteredParams);
      setCertificates(res.data.certificates || []);
      setTotalPages(res.data.pages || 1);
    } catch (err) {
      setError((prev) => prev + "\nFailed to fetch certificate list.");
    } finally {
      setListLoading(false);
    }
  };

  const handleFilterChange = (setter) => (e) => {
    setCurrentPage(1);
    setter(e.target.value);
  };

  const handleDateChange = (e) => {
    setCurrentPage(1);
    setDateFilter({ ...dateFilter, [e.target.name]: e.target.value });
  };

  const handleRevoke = async (certId) => {
    if (window.confirm("Are you sure you want to revoke this certificate?")) {
      try {
        await revokeAdminCertificate(certId);
        fetchCertificates();
      } catch (err) {
        alert("Failed to revoke certificate.");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Certificates Management</h1>
          <p className="text-sm text-gray-500">
            Audit and manage issued certificates
          </p>
        </div>
      </div>

      {error && !loading && (
          <div className="p-4 bg-yellow-50 text-yellow-800 rounded-lg">{error}</div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-center items-center text-center">
             <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 mb-3">
                <FileCheck size={28}/>
             </div>
             <h3 className="text-3xl font-bold text-gray-900">{overview.total.toLocaleString()}</h3>
             <p className="text-gray-500">Total Issued</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Top Users by Volume</h4>
            <div className="space-y-2">
                {overview.by_user.slice(0, 5).map((u) => (
                    <div key={u.user_id} className="flex justify-between items-center text-sm">
                        <span className="text-gray-700 truncate">{u.user_name}</span>
                        <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full text-xs font-semibold">{u.count}</span>
                    </div>
                ))}
                {overview.by_user.length === 0 && <span className="text-xs text-gray-400">No data available</span>}
            </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Top Templates</h4>
            <div className="space-y-2">
                 {overview.by_template.slice(0, 5).map((t) => (
                    <div key={t.template_id} className="flex justify-between items-center text-sm">
                        <span className="text-gray-700 truncate">{t.title}</span>
                        <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded-full text-xs font-semibold">{t.count}</span>
                    </div>
                ))}
                 {overview.by_template.length === 0 && <span className="text-xs text-gray-400">No data available</span>}
            </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                <input
                  type="text"
                  placeholder="Search recipient, course..."
                  value={search}
                  onChange={handleFilterChange(setSearch)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
             </div>
             <div className="relative">
                <select
                    value={statusFilter}
                    onChange={handleFilterChange(setStatusFilter)}
                    className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white appearance-none"
                >
                    <option value="">All Statuses</option>
                    <option value="valid">Valid</option>
                    <option value="revoked">Revoked</option>
                </select>
                <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16}/>
             </div>
             <div>
                <input
                    type="date"
                    name="start_date"
                    value={dateFilter.start_date}
                    onChange={handleDateChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
             </div>
             <div>
                 <input
                    type="date"
                    name="end_date"
                    value={dateFilter.end_date}
                    onChange={handleDateChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
             </div>
        </div>
      </div>

      {/* Certificates Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
         {listLoading ? (
             <div className="p-12 text-center text-gray-500">Loading certificates...</div>
         ) : (
            <>
            <div className="overflow-x-auto min-h-[400px]">
                 <table className="w-full text-left border-collapse">
                     <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Recipient</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Course</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Issuer</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Issued Date</th>
                            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                     </thead>
                      <tbody className="divide-y divide-gray-100">
                        {certificates.map((cert) => (
                            <tr key={cert.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-medium text-gray-900">{cert.recipient_name}</td>
                                <td className="px-6 py-4 text-gray-600">{cert.course_title}</td>
                                <td className="px-6 py-4 text-gray-600">{cert.issuer_name}</td>
                                <td className="px-6 py-4">
                                     <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
                                        ${cert.status === 'revoked' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                        {cert.status === 'revoked' ? <XCircle size={12}/> : <CheckCircle size={12}/>}
                                        {cert.status}
                                     </span>
                                </td>
                                <td className="px-6 py-4 text-gray-500">{new Date(cert.issue_date).toLocaleDateString()}</td>
                                <td className="px-6 py-4 text-right">
                                    <a
                                        href={`/verify/${cert.verification_id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 text-indigo-600 hover:text-indigo-800 transition-colors inline-block mr-2"
                                        title="View Certificate"
                                    >
                                        <Eye size={18}/>
                                    </a>
                                    {cert.status !== "revoked" && (
                                        <button
                                            onClick={() => handleRevoke(cert.id)}
                                            className="p-2 text-red-400 hover:text-red-600 transition-colors"
                                            title="Revoke Certificate"
                                        >
                                            <Trash2 size={18}/>
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                         {certificates.length === 0 && (
                            <tr>
                                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                    No certificates found.
                                </td>
                            </tr>
                        )}
                      </tbody>
                 </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50">
                    <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="flex items-center gap-1 px-3 py-1 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft size={16} /> Previous
                    </button>
                    <span className="text-sm text-gray-600">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="flex items-center gap-1 px-3 py-1 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next <ChevronRight size={16} />
                    </button>
                </div>
            )}
            </>
         )}
      </div>
    </div>
  );
}

export default AdminCertificatesPage;
