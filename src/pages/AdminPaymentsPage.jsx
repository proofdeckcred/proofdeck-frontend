import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CreditCard,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Download,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { getAdminTransactions } from "../api";

function AdminPaymentsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({ total_revenue: 0, revenue_by_plan: {} });
  const navigate = useNavigate();

  useEffect(() => {
    fetchTransactions();
  }, [statusFilter, page]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = { status: statusFilter, page, limit: 10 };
      const res = await getAdminTransactions(params);
      setTransactions(res.data.transactions || []);
      setTotalPages(res.data.pages || 1);
      setStats(res.data.stats || { total_revenue: 0, revenue_by_plan: {} });
    } catch (err) {
      setError("Failed to fetch transactions");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments & Subscriptions</h1>
          <p className="text-sm text-gray-500">
            Track revenue and manage transaction history
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
          <Download size={18} />
          <span>Export Report</span>
        </button>
      </div>

       {/* Stats Grid */}
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
                        <TrendingUp size={24} />
                    </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">${stats.total_revenue.toLocaleString()}</h3>
                <p className="text-sm text-gray-500">Total Revenue</p>
            </div>
             {Object.entries(stats.revenue_by_plan).map(([plan, amount]) => (
                <div key={plan} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                            <CreditCard size={24} />
                        </div>
                         <span className="text-xs font-semibold uppercase bg-gray-100 px-2 py-1 rounded text-gray-600">{plan}</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">${amount.toLocaleString()}</h3>
                    <p className="text-sm text-gray-500">{plan} Revenue</p>
                </div>
            ))}
       </div>

       {/* Filters */}
       <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
            <div className="relative">
                 <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none appearance-none bg-white font-medium text-gray-700"
                  >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="failed">Failed</option>
                  </select>
                   <Filter
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    size={16}
                  />
            </div>
       </div>

       {/* Transactions Table */}
       <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading && transactions.length === 0 ? (
             <div className="p-12 text-center text-gray-500">Loading transactions...</div>
        ) : error ? (
            <div className="p-8 text-center text-red-500 bg-red-50 m-4 rounded">{error}</div>
        ) : (
            <>
            <div className="overflow-x-auto min-h-[400px]">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Plan</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Provider</th>
                            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {transactions.map((t) => (
                            <tr key={t.id} className={`hover:bg-gray-50 transition-colors ${t.status === 'failed' ? 'bg-red-50' : ''}`}>
                                <td className="px-6 py-4 text-sm font-medium text-gray-900">{t.user_name}</td>
                                <td className="px-6 py-4 text-sm text-gray-600 font-mono">{t.amount} {t.currency}</td>
                                <td className="px-6 py-4">
                                     <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 uppercase">
                                        {t.plan}
                                     </span>
                                </td>
                                <td className="px-6 py-4">
                                     <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
                                        ${t.status === 'paid' ? 'bg-green-100 text-green-700' : 
                                          t.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-800'}`}>
                                        {t.status === 'paid' && <CheckCircle size={12}/>}
                                        {t.status === 'failed' && <XCircle size={12}/>}
                                        {t.status === 'pending' && <AlertCircle size={12}/>}
                                        {t.status}
                                     </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">{new Date(t.date).toLocaleDateString()}</td>
                                <td className="px-6 py-4 text-sm text-gray-500 capitalize">{t.provider}</td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => navigate(`/admin/payments/${t.id}`)}
                                        className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                                    >
                                        <Eye size={18}/>
                                    </button>
                                </td>
                            </tr>
                        ))}
                         {transactions.length === 0 && (
                            <tr>
                                <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                                    No transactions found.
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

export default AdminPaymentsPage;
