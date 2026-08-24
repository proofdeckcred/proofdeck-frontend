import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Users,
  Filter,
  MoreVertical,
  Eye,
  Trash2,
  Ban,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Download,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import {
  getAdminUsers,
  suspendAdminUser,
  unsuspendAdminUser,
  updateAdminUserPlan,
  deleteAdminUser,
} from "../api";

function AdminUserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState({
    start_date: "",
    end_date: "",
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Sorting State
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");
  
  // Action Menu State
  const [activeMenu, setActiveMenu] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter, statusFilter, page, dateFilter, sortBy, sortOrder]);

  // Click outside to close menus
  useEffect(() => {
    const handleClickOutside = () => setActiveMenu(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {
        search,
        role: roleFilter,
        status: statusFilter,
        page,
        limit: 10,
        start_date: dateFilter.start_date || null,
        end_date: dateFilter.end_date || null,
        sort_by: sortBy,
        sort_order: sortOrder,
      };
      
      // Filter out null/empty values
      const filteredParams = Object.fromEntries(
        Object.entries(params).filter(([_, v]) => v != null && v !== "")
      );

      const res = await getAdminUsers(filteredParams);
      setUsers(res.data.users || []);
      setTotalPages(res.data.pages || 1);
    } catch (err) {
      setError("Failed to fetch users");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e) => {
    setPage(1); // Reset to page 1 on filter change
    setDateFilter({ ...dateFilter, [e.target.name]: e.target.value });
  };

  const handleSort = (field) => {
    if (sortBy === field) {
        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
        setSortBy(field);
        setSortOrder("desc"); // Default to desc for new field (e.g. latest date)
    }
  };

  const getSortIcon = (field) => {
      if (sortBy !== field) return <ArrowUpDown size={14} className="text-gray-400 ml-1"/>;
      return sortOrder === "asc" ? <ArrowUp size={14} className="text-indigo-600 ml-1"/> : <ArrowDown size={14} className="text-indigo-600 ml-1"/>;
  };

  const handleSuspend = async (userId) => {
    if (window.confirm("Are you sure you want to suspend this user?")) {
      try {
        await suspendAdminUser(userId);
        fetchUsers();
      } catch (err) {
        alert("Failed to suspend user");
      }
    }
  };

  const handleUnsuspend = async (userId) => {
    try {
      await unsuspendAdminUser(userId);
      fetchUsers();
    } catch (err) {
      alert("Failed to unsuspend user");
    }
  };

  const handlePlanChange = async (userId, newPlan) => {
    try {
      await updateAdminUserPlan(userId, newPlan);
      fetchUsers();
    } catch (err) {
      alert("Failed to update plan");
    }
  };

  const handleDelete = async (userId) => {
    if (
      window.confirm(
        "DANGER: Are you sure you want to permanently delete this user? This action cannot be undone."
      )
    ) {
      try {
        const res = await deleteAdminUser(userId);
        alert(res.data.msg);
        fetchUsers();
      } catch (err) {
        alert(err.response?.data?.msg || "Failed to delete user.");
      }
    }
  };

  const toggleMenu = (e, userId) => {
    e.stopPropagation();
    setActiveMenu(activeMenu === userId ? null : userId);
  };

  // Helper to generate page numbers
  const getPageNumbers = () => {
    const delta = 2; // Number of pages to show around current page
    const range = [];
    const rangeWithDots = [];
    
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= page - delta && i <= page + delta)) {
            range.push(i);
        }
    }

    let l;
    for (let i of range) {
        if (l) {
            if (i - l === 2) {
                rangeWithDots.push(l + 1);
            } else if (i - l !== 1) {
                rangeWithDots.push('...');
            }
        }
        rangeWithDots.push(i);
        l = i;
    }
    return rangeWithDots;
  };


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-sm text-gray-500">
            Monitor and manage user accounts and subscriptions
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
          <Download size={18} />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filters Section */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative lg:col-span-2">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>

          <div className="relative">
            <select
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none appearance-none bg-white"
            >
              <option value="">All Roles</option>
              <option value="free">Free</option>
              <option value="starter">Starter</option>
              <option value="growth">Growth</option>
              <option value="pro">Pro</option>
              <option value="enterprise">Enterprise</option>
            </select>
            <Filter
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              size={16}
            />
          </div>

          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none appearance-none bg-white"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Suspended</option>
            </select>
            <Filter
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              size={16}
            />
          </div>

          <div className="flex gap-2">
             <div className="relative flex-1">
                <input 
                    type="date"
                    name="start_date"
                    value={dateFilter.start_date}
                    onChange={handleDateChange}
                    className="w-full px-2 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
             </div>
             <div className="relative flex-1">
                <input 
                    type="date"
                    name="end_date"
                    value={dateFilter.end_date}
                    onChange={handleDateChange}
                    className="w-full px-2 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
             </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading && users.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            Loading users...
          </div>
        ) : error ? (
            <div className="p-8 text-center text-red-500 bg-red-50 m-4 rounded">
                {error}
            </div>
        ) : (
          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th 
                    className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center">User {getSortIcon('name')}</div>
                  </th>
                  <th 
                    className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none"
                    onClick={() => handleSort('role')}
                  >
                     <div className="flex items-center">Role & Company {getSortIcon('role')}</div>
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th 
                    className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none"
                    onClick={() => handleSort('created_at')}
                  >
                     <div className="flex items-center">Joined {getSortIcon('created_at')}</div>
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium uppercase
                            ${user.role === 'pro' ? 'bg-indigo-100 text-indigo-800' : 
                              user.role === 'free' ? 'bg-gray-100 text-gray-800' : 'bg-blue-100 text-blue-800'}`}>
                            {user.role}
                        </span>
                        {user.company_name && (
                            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                <Users size={12}/> {user.company_name}
                            </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          user.role === "suspended"
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {user.role === "suspended" ? (
                          <>
                            <Ban size={12} /> Suspended
                          </>
                        ) : (
                          <>
                            <CheckCircle size={12} /> Active
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(user.signup_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right relative">
                      <button
                        onClick={() => navigate(`/admin/users/${user.id}`)}
                        className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                         onClick={(e) => toggleMenu(e, user.id)}
                         className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <MoreVertical size={18} />
                      </button>

                      {/* Dropdown Menu */}
                      {activeMenu === user.id && (
                        <div className="absolute right-8 top-8 w-48 bg-white rounded-lg shadow-xl border border-gray-100 z-10 py-1 text-left">
                            {user.role !== "suspended" ? (
                                <button
                                    onClick={() => handleSuspend(user.id)}
                                    className="w-full text-left px-4 py-2 text-sm text-yellow-600 hover:bg-yellow-50 flex items-center gap-2"
                                >
                                    <Ban size={14}/> Suspend User
                                </button>
                            ) : (
                                <button
                                    onClick={() => handleUnsuspend(user.id)}
                                    className="w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-green-50 flex items-center gap-2"
                                >
                                    <CheckCircle size={14} /> Unsuspend User
                                </button>
                            )}
                            <button
                                onClick={() => handleDelete(user.id)}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                                <Trash2 size={14} /> Delete User
                            </button>
                            <div className="border-t border-gray-100 my-1"></div>
                            <div className="px-4 py-1 text-xs text-gray-400 uppercase tracking-wider font-semibold">Change Plan</div>
                            {["free", "starter", "growth", "pro", "enterprise"].map((plan) => (
                                <button
                                    key={plan}
                                    onClick={() => handlePlanChange(user.id, plan)}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 capitalize"
                                >
                                    {plan}
                                </button>
                            ))}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && !loading && (
                    <tr>
                        <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                            No users found matching your filters.
                        </td>
                    </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Improved Pagination */}
        {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50 gap-4">
                <div className="text-sm text-gray-500">
                    Showing page <span className="font-medium text-gray-900">{page}</span> of <span className="font-medium text-gray-900">{totalPages}</span>
                </div>
                
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronLeft size={16} /> Previous
                    </button>
                    
                    {/* Numbered Buttons */}
                    <div className="hidden sm:flex items-center gap-1">
                        {getPageNumbers().map((pageNum, idx) => (
                            pageNum === '...' ? (
                                <span key={`dots-${idx}`} className="px-2 text-gray-400">...</span>
                            ) : (
                                <button
                                    key={pageNum}
                                    onClick={() => setPage(pageNum)}
                                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                                        page === pageNum
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
                                    }`}
                                >
                                    {pageNum}
                                </button>
                            )
                        ))}
                    </div>

                    <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Next <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}

export default AdminUserManagementPage;
