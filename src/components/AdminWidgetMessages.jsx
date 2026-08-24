import React, { useState, useEffect } from "react";
import { Search, Loader, Trash2, Mail, User, Clock, CheckCircle, AlertCircle, MessageSquare } from "lucide-react";
import { getWidgetMessages, deleteWidgetMessage, updateWidgetMessageStatus, replyToWidgetMessage } from "../api";
import toast from "react-hot-toast";

const AdminWidgetMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "",
    page: 1,
    limit: 20
  });
  const [totalPages, setTotalPages] = useState(1);
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [selectedMsg, setSelectedMsg] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const response = await getWidgetMessages(filters);
      setMessages(response.data.messages);
      setTotalPages(response.data.pages);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
      toast.error("Could not load support messages.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [filters]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this message?")) return;
    try {
      await deleteWidgetMessage(id);
      setMessages(prev => prev.filter(m => m.id !== id));
      toast.success("Message deleted");
    } catch (error) {
      toast.error("Failed to delete message");
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await updateWidgetMessageStatus(id, newStatus);
      setMessages(prev => prev.map(m => m.id === id ? { ...m, status: newStatus } : m));
      toast.success("Status updated");
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleOpenReply = (msg) => {
      setSelectedMsg(msg);
      setReplyText("");
      setReplyModalOpen(true);
  }

  const handleSendReply = async () => {
      if (!replyText.trim()) return;
      setSendingReply(true);
      try {
          await replyToWidgetMessage({
              message_id: selectedMsg.id,
              message: replyText
          });
          toast.success("Reply sent successfully");
          setReplyModalOpen(false);
          // Update local state to show as replied
          handleStatusUpdate(selectedMsg.id, 'replied');
      } catch (error) {
          toast.error("Failed to send reply");
      } finally {
          setSendingReply(false);
      }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'read': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'replied': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden relative">
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50/50">
            <div>
                 <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                     <Mail size={20} className="text-blue-600"/>
                     Widget Inquiries
                 </h2>
                 <p className="text-sm text-gray-500">Messages sent via the public support chat</p>
            </div>
            
            <div className="flex items-center gap-3">
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    {['', 'new', 'read', 'replied'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilters({ ...filters, status: status, page: 1 })}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                                filters.status === status
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {status === '' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                    ))}
                </div>
                 <button onClick={fetchMessages} className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-gray-200 text-gray-500 transition-all">
                    <Clock size={16} />
                 </button>
            </div>
        </div>

        <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                        <th className="p-4 font-medium w-1/4">User / Email</th>
                        <th className="p-4 font-medium w-1/2">Message</th>
                        <th className="p-4 font-medium w-1/12">Status</th>
                        <th className="p-4 font-medium w-1/12 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 ring-1 ring-gray-100 ring-opacity-5">
                    {loading ? (
                        <tr>
                            <td colSpan="4" className="p-8 text-center text-gray-400">
                                <Loader className="animate-spin mx-auto mb-2" />
                                Loading messages...
                            </td>
                        </tr>
                    ) : messages.length === 0 ? (
                        <tr>
                            <td colSpan="4" className="p-12 text-center">
                                <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Mail className="text-gray-300" size={32} />
                                </div>
                                <h3 className="text-gray-900 font-medium mb-1">No messages found</h3>
                                <p className="text-gray-500 text-sm">Waiting for new inquiries from the widget.</p>
                            </td>
                        </tr>
                    ) : (
                        messages.map((msg) => (
                            <tr key={msg.id} className={`group transition-colors hover:bg-gray-50/80 ${msg.status === 'new' ? 'bg-blue-50/30' : ''}`}>
                                <td className="p-4 align-top">
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0 mt-1">
                                            <User size={14} />
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900 text-sm">{msg.sender_name}</div>
                                            <div className="text-xs text-gray-500 font-mono mt-0.5">{msg.email || 'No email provided'}</div>
                                            <div className="text-[10px] text-gray-400 mt-1">
                                                {new Date(msg.created_at).toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4 align-top">
                                    <div className="text-sm text-gray-700 leading-relaxed max-w-xl">
                                        {msg.message}
                                    </div>
                                </td>
                                <td className="p-4 align-top">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(msg.status)}`}>
                                        {msg.status === 'new' && <AlertCircle size={10} className="mr-1" />}
                                        {msg.status === 'replied' && <CheckCircle size={10} className="mr-1" />}
                                        {msg.status.charAt(0).toUpperCase() + msg.status.slice(1)}
                                    </span>
                                </td>
                                <td className="p-4 align-top text-right">
                                    <div className="flex items-center justify-end gap-2 text-right">
                                        <button 
                                            onClick={() => handleOpenReply(msg)}
                                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                                            title="Reply"
                                        >
                                            <MessageSquare size={16} />
                                        </button>
                                        
                                        {msg.status === 'new' && (
                                             <button 
                                                onClick={() => handleStatusUpdate(msg.id, 'read')}
                                                className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg"
                                                title="Mark as Read"
                                            >
                                                <Clock size={16} />
                                            </button>
                                        )}
                                        <button 
                                            onClick={() => handleDelete(msg.id)}
                                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                                            title="Delete Message"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
        
        {/* Pagination */ }
        {totalPages > 1 && (
             <div className="p-4 border-t border-gray-100 flex justify-center gap-2">
                 <button 
                    disabled={filters.page <= 1}
                    onClick={() => setFilters(prev => ({...prev, page: prev.page - 1}))}
                    className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50"
                 >
                    Previous
                 </button>
                 <span className="px-3 py-1 text-sm text-gray-600">
                    Page {filters.page} of {totalPages}
                 </span>
                 <button 
                    disabled={filters.page >= totalPages}
                    onClick={() => setFilters(prev => ({...prev, page: prev.page + 1}))}
                    className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50"
                 >
                    Next
                 </button>
             </div>
        )}

        {/* Reply Modal */}
        {replyModalOpen && selectedMsg && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                    <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <h3 className="font-semibold text-gray-900">Reply to {selectedMsg.sender_name}</h3>
                        <button onClick={() => setReplyModalOpen(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800 border border-blue-100 mb-4">
                            <span className="font-semibold block mb-1 text-xs uppercase tracking-wide opacity-70">User Message:</span>
                            "{selectedMsg.message}"
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Your Reply</label>
                            <textarea
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none min-h-[120px]"
                                placeholder="Type your response here..."
                                autoFocus
                            />
                        </div>
                    </div>
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                        <button
                            onClick={() => setReplyModalOpen(false)}
                            className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSendReply}
                            disabled={sendingReply || !replyText.trim()}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 flex items-center gap-2"
                        >
                            {sendingReply ? <Loader size={14} className="animate-spin" /> : <MessageSquare size={14} />}
                            Send Reply
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default AdminWidgetMessages;
