import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building,
  Search,
  Trash2,
  Eye,
  Users,
  Calendar,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { getAdminCompanies, deleteAdminCompany } from "../api";

function AdminCompaniesPage() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCompanies();
  }, [search, page]);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const params = { search, page, limit: 10 };
      const res = await getAdminCompanies(params);
      setCompanies(res.data.companies || []);
      setTotalPages(res.data.pages || 1);
    } catch (err) {
      setError("Failed to fetch companies");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (companyId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this company? All members will be converted to individual accounts. This action cannot be undone."
      )
    ) {
      try {
        const res = await deleteAdminCompany(companyId);
        alert(res.data.msg);
        fetchCompanies();
      } catch (err) {
        alert(err.response?.data?.msg || "Failed to delete company.");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Company Management</h1>
          <p className="text-sm text-gray-500">
            Manage registered companies and their members
          </p>
        </div>
      </div>

       {/* Filters Section */}
       <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="relative max-w-md">
                <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                />
                <input
                    type="text"
                    placeholder="Search by company or owner name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
            </div>
       </div>

       {/* Companies Table */}
       <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading && companies.length === 0 ? (
            <div className="flex justify-center items-center h-64 text-gray-500">
                <Loader2 className="animate-spin mr-2" /> Loading companies...
            </div>
        ) : error ? (
            <div className="p-8 text-center text-red-500 bg-red-50 m-4 rounded flex items-center justify-center gap-2">
                <AlertTriangle size={20}/> {error}
            </div>
        ) : (
            <>
            <div className="overflow-x-auto min-h-[400px]">
                <table className="w-full text-left border-collapse">
                     <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Company Name</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Owner</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Members</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date Created</th>
                            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-100">
                        {companies.map((company) => (
                            <tr key={company.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                     <div className="flex items-center gap-3">
                                         <div className="w-8 h-8 rounded bg-blue-50 text-blue-600 flex items-center justify-center">
                                             <Building size={16}/>
                                         </div>
                                         <span className="font-medium text-gray-900">{company.name}</span>
                                     </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                    {company.owner_name}
                                </td>
                                <td className="px-6 py-4">
                                     <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 gap-1">
                                        <Users size={12}/> {company.member_count}
                                     </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    <div className="flex items-center gap-1">
                                        <Calendar size={14} className="text-gray-400"/>
                                        {new Date(company.created_at).toLocaleDateString()}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => navigate(`/admin/companies/${company.id}`)}
                                        className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                                        title="View Details"
                                    >
                                        <Eye size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(company.id)}
                                        className="p-2 text-gray-400 hover:text-red-600 transition-colors ml-2"
                                        title="Delete Company"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                         {companies.length === 0 && (
                            <tr>
                                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                    No companies found matching your search.
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
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="flex items-center gap-1 px-3 py-1 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft size={16} /> Previous
                    </button>
                    <span className="text-sm text-gray-600">
                        Page {page} of {totalPages}
                    </span>
                    <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
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

export default AdminCompaniesPage;
