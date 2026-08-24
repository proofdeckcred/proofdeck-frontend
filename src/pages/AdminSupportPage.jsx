import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  HelpCircle,
  Filter,
  Eye,
  AlertCircle,
  CheckCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Ticket,
  Mail
} from "lucide-react";
import { getAdminSupportTickets } from "../api";
import AdminWidgetMessages from "../components/AdminWidgetMessages";

function AdminSupportPage() {
  const [activeTab, setActiveTab] = useState("tickets"); // 'tickets' or 'widget'
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    if (activeTab === 'tickets') {
        fetchTickets();
    }
  }, [statusFilter, page, activeTab]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const params = { status: statusFilter, page, limit: 10 };
      const res = await getAdminSupportTickets(params);
      setTickets(res.data.tickets);
      setTotalPages(res.data.pages);
    } catch (err) {
      setError("Failed to fetch support tickets.");
    } finally {
      setLoading(false);
    }
  };

  const getPriorityStyle = (role) => {
    const priorities = {
      enterprise: "bg-red-100 text-red-800 border-red-200",
      pro: "bg-orange-100 text-orange-800 border-orange-200",
      growth: "bg-blue-100 text-blue-800 border-blue-200",
      starter: "bg-green-100 text-green-800 border-green-200",
      free: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return priorities[role] || "bg-gray-50 text-gray-600 border-gray-200";
  };

  const getStatusStyle = (status) => {
    const styles = {
      open: "bg-blue-50 text-blue-700 border-blue-100",
      in_progress: "bg-amber-50 text-amber-700 border-amber-100",
      closed: "bg-gray-50 text-gray-600 border-gray-100",
    };
    return styles[status] || "bg-gray-50 text-gray-600 border-gray-100";
  };

  const getStatusIcon = (status) => {
    switch(status) {
        case 'open': return <AlertCircle size={14} className="mr-1"/>;
        case 'in_progress': return <Clock size={14} className="mr-1"/>;
        case 'closed': return <CheckCircle size={14} className="mr-1"/>;
        default: return null;
    }
  }

  return (
    <div className="space-y-6">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Support Center</h1>
          <p className="text-sm text-gray-500">
            Manage user tickets and inquiries
          </p>
        </div>
      </div>

       {/* Tabs */}
       <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-200 inline-flex">
           <button
              onClick={() => setActiveTab('tickets')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'tickets' ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
           >
              <Ticket size={18} />
              Support Tickets
           </button>
           <button
              onClick={() => setActiveTab('widget')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'widget' ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
           >
              <Mail size={18} />
              Widget Messages
           </button>
       </div>

       {activeTab === 'widget' ? (
           <AdminWidgetMessages />
       ) : (
           <>
               {/* Filters */}
               <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
                    <div className="relative">
                         <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none appearance-none bg-white font-medium text-gray-700"
                          >
                            <option value="">All Statuses</option>
                            <option value="open">Open</option>
                            <option value="in_progress">In Progress</option>
                            <option value="closed">Closed</option>
                          </select>
                           <Filter
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                            size={16}
                          />
                    </div>
               </div>

               {/* Tickets Table */}
               <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {loading && tickets.length === 0 ? (
                     <div className="p-12 text-center text-gray-500">Loading tickets...</div>
                ) : error ? (
                    <div className="p-8 text-center text-red-500 bg-red-50 m-4 rounded">{error}</div>
                ) : (
                    <>
                    <div className="overflow-x-auto min-h-[400px]">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Priority</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Subject</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Updated</th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {tickets.map((ticket) => (
                                    <tr key={ticket.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                             <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityStyle(ticket.user_role)}`}>
                                                {ticket.user_role === 'enterprise' ? 'Highest' : 
                                                 ticket.user_role === 'pro' ? 'High' : 
                                                 ticket.user_role === 'growth' ? 'Medium' : 
                                                 ticket.user_role === 'starter' ? 'Normal' : 'Low'}
                                             </span>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900">{ticket.subject}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-gray-900">{ticket.user_name}</span>
                                                <span className="text-xs text-gray-400 capitalize">{ticket.user_role} Plan</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                             <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusStyle(ticket.status)}`}>
                                                {getStatusIcon(ticket.status)}
                                                {ticket.status.replace("_", " ").toUpperCase()}
                                             </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{new Date(ticket.updated_at).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => navigate(`/admin/support/${ticket.id}`)}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 border border-indigo-200 text-indigo-700 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors text-sm font-medium"
                                            >
                                                <MessageSquare size={14}/> Reply
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                 {tickets.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                            No support tickets found.
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
           </>
       )}
    </div>
  );
}

export default AdminSupportPage;
