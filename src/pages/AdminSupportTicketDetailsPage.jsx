import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Send,
  User,
  Paperclip,
  CheckCircle,
  Clock,
  AlertTriangle,
  Loader2,
  X,
  UserCircle,
  Shield,
  HelpCircle,
} from "lucide-react";
import {
  getAdminTicketDetails,
  adminReplyToTicket,
  updateTicketStatus,
} from "../api";
import toast, { Toaster } from "react-hot-toast";

function AdminSupportTicketDetailsPage() {
  const { ticketId } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState("");
  const [file, setFile] = useState(null);
  const [sending, setSending] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImageUrl, setModalImageUrl] = useState("");
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    fetchTicket();
  }, [ticketId]);

  useEffect(() => {
    // Scroll to bottom of chat when messages load or update
    if (chatEndRef.current) {
        chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [ticket?.messages]);

  const fetchTicket = async () => {
    setLoading(true);
    try {
      const res = await getAdminTicketDetails(ticketId);
      setTicket(res.data);
    } catch (err) {
      toast.error("Could not fetch ticket details.");
      navigate("/admin/support");
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if((!reply.trim() && !file)) return;

    setSending(true);
    const promise = adminReplyToTicket(ticketId, reply, file);

    toast.promise(promise, {
      loading: "Sending reply...",
      success: () => {
        setReply("");
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        fetchTicket(); // Refresh messages
        return "Reply sent successfully!";
      },
      error: (err) => err.response?.data?.msg || "Failed to send reply.",
    });

    promise.finally(() => setSending(false));
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
    } else {
      setFile(null);
    }
  };

  const openImageModal = (imageUrl) => {
    setModalImageUrl(imageUrl);
    setShowImageModal(true);
  };

  const handleStatusChange = async (newStatus) => {
    const promise = updateTicketStatus(ticketId, newStatus);
    toast.promise(promise, {
      loading: "Updating status...",
      success: (res) => {
        fetchTicket(); // Refresh ticket details
        return res.data.msg;
      },
      error: (err) => err.response?.data?.msg || "Failed to update status.",
    });
  };

  if (loading) {
     return <div className="flex justify-center items-center h-[60vh] text-indigo-600"><Loader2 className="animate-spin" size={40}/></div>
  }

  if (!ticket) return null;

  return (
    <>
      <Toaster position="top-center" />
      <div className="h-[calc(100vh-100px)] flex flex-col">
         {/* Layout */}
         <div className="mb-4 flex items-center justify-between">
            <Link to="/admin/support" className="inline-flex items-center text-sm text-gray-500 hover:text-indigo-600 transition-colors">
                <ArrowLeft size={16} className="mr-1" /> Back to Tickets
            </Link>
         </div>

         <div className="flex flex-col lg:flex-row gap-6 h-full overflow-hidden">
            {/* Chat Area */}
            <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
                <div className="border-b border-gray-100 p-4 bg-gray-50 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-indigo-100 flex items-center justify-center text-indigo-600">
                           <HelpCircle size={20}/>
                        </div>
                        <div>
                            <h2 className="font-bold text-gray-900 line-clamp-1">{ticket.subject}</h2>
                            <p className="text-xs text-gray-500">Ticket #{ticket.id} • {new Date(ticket.created_at).toLocaleString()}</p>
                        </div>
                    </div>
                     <span className={`px-2 py-1 rounded-full text-xs font-semibold uppercase ${
                        ticket.status === 'open' ? 'bg-blue-100 text-blue-700' :
                        ticket.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-600'
                     }`}>
                        {ticket.status.replace("_", " ")}
                    </span>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
                     {ticket.messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] rounded-2xl p-4 shadow-sm relative ${
                                msg.sender_type === 'admin' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-gray-100 text-gray-900 rounded-tl-none'
                            }`}>
                                <div className="flex items-center gap-2 mb-1 opacity-80 text-xs">
                                     {msg.sender_type === 'admin' ? <Shield size={12}/> : <UserCircle size={12}/>}
                                     <span className="font-semibold">{msg.sender_name}</span>
                                     <span>•</span>
                                     <span>{new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                </div>
                                <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                                {msg.image_url && (
                                    <div className="mt-3">
                                        <img 
                                            src={msg.image_url} 
                                            alt="Attachment" 
                                            className="rounded-lg max-h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity border-2 border-white/20"
                                            onClick={() => openImageModal(msg.image_url)}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                     ))}
                     <div ref={chatEndRef} />
                </div>

                <div className="p-4 bg-gray-50 border-t border-gray-200">
                    <form onSubmit={handleReply}>
                         <div className="relative flex items-end gap-2 bg-white border border-gray-300 rounded-xl p-2 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all shadow-sm">
                            <button 
                                type="button"
                                onClick={() => fileInputRef.current.click()}
                                className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-gray-50 rounded-lg transition-colors"
                                title="Attach Image"
                            >
                                <Paperclip size={20}/>
                            </button>
                            <textarea
                                value={reply}
                                onChange={(e) => setReply(e.target.value)}
                                placeholder="Type your reply..."
                                className="flex-1 resize-none border-0 focus:ring-0 max-h-32 py-2 text-gray-900 placeholder-gray-400"
                                rows={1}
                                style={{minHeight: '40px'}}
                                onKeyDown={(e) => {
                                    if(e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleReply(e);
                                    }
                                }}
                            />
                            <button
                                type="submit"
                                disabled={sending || (!reply.trim() && !file)}
                                className={`p-2 rounded-lg transition-all ${
                                    (!reply.trim() && !file) 
                                    ? 'text-gray-300 cursor-not-allowed bg-gray-50' 
                                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
                                }`}
                            >
                                {sending ? <Loader2 size={20} className="animate-spin"/> : <Send size={20}/>}
                            </button>
                         </div>
                         <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/png, image/jpeg, image/gif"
                            className="hidden"
                        />
                         {file && (
                             <div className="mt-2 text-xs text-indigo-600 flex items-center gap-1 bg-indigo-50 px-2 py-1 rounded inline-flex">
                                <Paperclip size={10}/> Attachment: {file.name}
                                <button type="button" onClick={() => {setFile(null); if(fileInputRef.current) fileInputRef.current.value='';}} className="ml-2 hover:text-red-500"><X size={12}/></button>
                             </div>
                         )}
                    </form>
                </div>
            </div>

            {/* Sidebar Details */}
            <div className="w-full lg:w-80 space-y-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                    <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide mb-4 border-b border-gray-100 pb-2">Ticket Info</h3>
                    
                    <div className="space-y-4 text-sm">
                        <div>
                             <label className="text-gray-500 text-xs block mb-1">Status</label>
                             <div className="relative">
                                <select 
                                    value={ticket.status} 
                                    onChange={(e) => handleStatusChange(e.target.value)}
                                    className="w-full appearance-none bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 pr-8"
                                >
                                    <option value="open">Open</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="closed">Closed</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                                </div>
                             </div>
                        </div>

                        <div>
                             <label className="text-gray-500 text-xs block mb-1">Customer</label>
                             <Link to={`/admin/users/${ticket.user.id}`} className="flex items-center gap-2 font-medium text-indigo-600 hover:underline">
                                 <User size={16}/> {ticket.user.name}
                             </Link>
                             <div className="text-gray-500 mt-1 pl-6">{ticket.user.email}</div>
                        </div>

                         <div>
                             <label className="text-gray-500 text-xs block mb-1">Plan</label>
                             <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded uppercase font-semibold">
                                 {ticket.user.role}
                             </span>
                        </div>
                    </div>
                </div>
            </div>
         </div>
      </div>

       {/* Image Preview Modal */}
        {showImageModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setShowImageModal(false)}>
                <div className="relative max-w-4xl w-full max-h-screen">
                     <button className="absolute -top-10 right-0 text-white hover:text-gray-300" onClick={() => setShowImageModal(false)}>
                        <X size={24}/>
                    </button>
                    <img src={modalImageUrl} className="rounded-lg max-h-[90vh] mx-auto object-contain shadow-2xl" alt="Preview"/>
                </div>
            </div>
        )}
    </>
  );
}

export default AdminSupportTicketDetailsPage;
