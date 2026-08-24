import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Card,
  Form,
  Button,
  Spinner,
  Row,
  Col,
  InputGroup,
  Image,
  Container,
} from "react-bootstrap";
import {
  PlusCircle,
  ArrowLeft,
  Send,
  User,
  Paperclip,
  Trash2,
  MessageCircle,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  CornerDownRight,
  Shield,
} from "lucide-react";
import {
  createUserTicket,
  getUserTickets,
  getUserTicketDetails,
  replyToTicket,
  deleteUserTicket,
} from "../api";
import toast, { Toaster } from "react-hot-toast";

// Main component that decides whether to show the list or details
function ContactSupportPage() {
  const { ticketId } = useParams();
  if (ticketId) {
    return <TicketDetails />;
  }
  return <TicketList />;
}

// Component to show the list of tickets and the creation form
function TicketList() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await getUserTickets();
      setTickets(res.data);
    } catch (err) {
      toast.error("Failed to fetch support tickets.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      toast.error("Subject and message cannot be empty.");
      return;
    }
    setSubmitting(true);
    const formData = new FormData();
    formData.append("subject", subject);
    formData.append("message", message);
    if (file) {
      formData.append("file", file);
    }

    try {
      await createUserTicket(formData);
      toast.success("Support ticket created!");
      setSubject("");
      setMessage("");
      setFile(null);
      fetchTickets();
    } catch (err) {
      toast.error(
        err.response?.data?.msg || "Failed to create ticket. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    } else {
      setFile(null);
    }
    e.target.value = null;
  };

  const handleDelete = async (e, ticketId) => {
    e.stopPropagation();
    e.preventDefault();

    if (
      window.confirm(
        "Are you sure you want to delete this ticket? This action cannot be undone."
      )
    ) {
      try {
        await deleteUserTicket(ticketId);
        toast.success("Ticket deleted successfully!");
        setTickets((prevTickets) =>
          prevTickets.filter((ticket) => ticket.id !== ticketId)
        );
      } catch (err) {
        toast.error("Failed to delete the ticket.");
      }
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "open":
        return "bg-blue-100 text-blue-700";
      case "in_progress":
        return "bg-yellow-100 text-yellow-700";
      case "closed":
        return "bg-gray-100 text-gray-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "open":
        return <AlertCircle size={14} className="mr-1" />;
      case "in_progress":
        return <Clock size={14} className="mr-1" />;
      case "closed":
        return <CheckCircle size={14} className="mr-1" />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Support Tickets</h1>
          <p className="text-gray-500 text-sm mt-1">
            Track your inquiries and communicate with our team.
          </p>
        </div>
        <Link
          to="/dashboard/support"
          className="flex items-center text-gray-600 hover:text-indigo-600 transition-colors font-medium text-sm bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm"
        >
          <ArrowLeft size={16} className="mr-2" /> Back to Help Center
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* CREATE TICKET FORM */}
        <div className="lg:col-span-5 order-2 lg:order-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
            <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
              <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600">
                <PlusCircle size={20} />
              </div>
              <h2 className="text-lg font-bold text-gray-900">
                Create New Ticket
              </h2>
            </div>

            <Form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  placeholder="e.g., Issue with bulk upload"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  rows={5}
                  placeholder="Please describe your issue in detail..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Attachment (Optional)
                </label>
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 text-sm font-medium text-gray-700 transition-colors w-full">
                    <Paperclip size={16} className="mr-2" />
                    {file ? "Change File" : "Choose File"}
                    <input
                      type="file"
                      onChange={handleFileChange}
                      accept="image/png, image/jpeg, image/gif"
                      className="hidden"
                    />
                  </label>
                </div>
                {file && (
                  <p className="mt-2 text-xs text-green-600 flex items-center">
                    <CheckCircle size={12} className="mr-1" /> {file.name}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-lg transition-all shadow-sm flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                disabled={submitting}
              >
                {submitting ? <Spinner size="sm" /> : "Submit Ticket"}
              </button>
            </Form>
          </div>
        </div>

        {/* TICKET LIST */}
        <div className="lg:col-span-7 order-1 lg:order-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
              <h2 className="font-bold text-gray-700 flex items-center gap-2">
                <FileText size={18} /> Ticket History
              </h2>
              <span className="bg-gray-200 text-gray-600 text-xs font-bold px-2 py-1 rounded-full">
                {tickets.length}
              </span>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <Spinner animation="border" variant="primary" />
              </div>
            ) : tickets.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {tickets.map((ticket) => (
                  <Link
                    key={ticket.id}
                    to={`/dashboard/support/tickets/${ticket.id}`}
                    className="block p-4 hover:bg-indigo-50/30 transition-colors group text-decoration-none"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                        {ticket.subject}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span
                          className={`flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wide ${getStatusBadge(
                            ticket.status
                          )}`}
                        >
                          {getStatusIcon(ticket.status)}
                          {ticket.status.replace("_", " ")}
                        </span>
                        <button
                          onClick={(e) => handleDelete(e, ticket.id)}
                          className="text-gray-400 hover:text-red-500 p-1 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                          title="Delete Ticket"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span className="flex items-center">
                        <Clock size={12} className="mr-1" />
                        Last updated:{" "}
                        {new Date(ticket.updated_at).toLocaleDateString()}
                      </span>
                      <span className="flex items-center text-indigo-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0 duration-200">
                        View Details{" "}
                        <CornerDownRight size={12} className="ml-1" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 px-4">
                <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <MessageCircle size={32} className="text-gray-400" />
                </div>
                <h3 className="text-gray-900 font-medium">No tickets yet</h3>
                <p className="text-gray-500 text-sm mt-1">
                  Create a ticket if you need help with anything.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TicketDetails() {
  const { ticketId } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState("");
  const [file, setFile] = useState(null);
  const [sending, setSending] = useState(false);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    fetchTicket();
  }, [ticketId]);

  useEffect(scrollToBottom, [ticket]);

  const fetchTicket = async () => {
    setLoading(true);
    try {
      const res = await getUserTicketDetails(ticketId);
      setTicket(res.data);
    } catch (err) {
      toast.error("Could not fetch ticket details.");
      navigate("/dashboard/support/tickets");
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!reply.trim() && !file) {
      toast.error("Reply cannot be empty.");
      return;
    }
    setSending(true);

    const formData = new FormData();
    formData.append("message", reply);
    if (file) {
      formData.append("file", file);
    }

    try {
      await replyToTicket(ticketId, formData);
      setReply("");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      fetchTicket();
    } catch (err) {
      toast.error(err.response?.data?.msg || "Failed to send reply.");
    } finally {
      setSending(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      toast.success(`Attached: ${selectedFile.name}`);
    } else {
      setFile(null);
    }
    e.target.value = null;
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (!ticket) return null;

  const isClosed = ticket.status === "closed";

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 h-[calc(100vh-64px)] flex flex-col">
      <Toaster position="top-right" />

      {/* HEADER */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm z-10 rounded-t-xl border-x border-t">
        <div className="flex items-center gap-4">
          <Link
            to="/dashboard/support/tickets"
            className="text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-gray-900 line-clamp-1">
              {ticket.subject}
            </h1>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wide mt-1 ${
                ticket.status === "open"
                  ? "bg-blue-100 text-blue-700"
                  : ticket.status === "in_progress"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {ticket.status.replace("_", " ")}
            </span>
          </div>
        </div>
      </div>

      {/* CHAT AREA */}
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50 border-x border-gray-200 space-y-6">
        {ticket.messages.map((msg) => {
          const isUser = msg.sender_type === "user";
          return (
            <div
              key={msg.id}
              className={`flex ${isUser ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] ${
                  isUser ? "items-end" : "items-start"
                } flex flex-col`}
              >
                <div className="flex items-center gap-2 mb-1 px-1">
                  {isUser ? (
                    <>
                      <span className="text-xs font-bold text-gray-600">
                        {msg.sender_name}
                      </span>
                      <User size={12} className="text-gray-400" />
                    </>
                  ) : (
                    <>
                      <Shield size={12} className="text-indigo-600" />
                      <span className="text-xs font-bold text-indigo-600">
                        Support Team
                      </span>
                    </>
                  )}
                </div>

                <div
                  className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    isUser
                      ? "bg-indigo-600 text-white rounded-tr-none"
                      : "bg-white text-gray-800 border border-gray-200 rounded-tl-none"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  {msg.image_url && (
                    <a
                      href={msg.image_url}
                      target="_blank"
                      rel="noreferrer"
                      className="block mt-3"
                    >
                      <Image
                        src={msg.image_url}
                        thumbnail
                        className="max-w-full rounded-lg border-2 border-white/20"
                        style={{ maxHeight: "200px" }}
                      />
                    </a>
                  )}
                </div>

                <span className="text-[10px] text-gray-400 mt-1 px-1">
                  {new Date(msg.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT AREA */}
      <div className="bg-white p-4 border border-gray-200 rounded-b-xl shadow-sm">
        {isClosed ? (
          <div className="text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-gray-500">
            <Lock size={20} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm font-medium">This ticket has been closed.</p>
          </div>
        ) : (
          <Form onSubmit={handleReply} className="relative">
            {file && (
              <div className="absolute -top-12 left-0 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center border border-indigo-100 shadow-sm animate-in fade-in slide-in-from-bottom-2">
                <Paperclip size={12} className="mr-1.5" />
                {file.name}
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="ml-2 hover:bg-indigo-100 rounded-full p-0.5"
                >
                  <X size={12} />
                </button>
              </div>
            )}

            <div className="flex gap-2 items-end">
              <div className="flex-1 relative">
                <textarea
                  placeholder="Type your reply here..."
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none text-sm min-h-[50px] max-h-[120px]"
                  rows={2}
                  required={!file}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="absolute right-3 bottom-3 text-gray-400 hover:text-indigo-600 transition-colors p-1 rounded-md hover:bg-gray-100"
                  title="Attach File"
                >
                  <Paperclip size={18} />
                </button>
              </div>

              <button
                type="submit"
                disabled={sending}
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl w-12 h-12 flex items-center justify-center transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex-shrink-0"
              >
                {sending ? (
                  <Spinner size="sm" />
                ) : (
                  <Send size={20} className="ml-0.5" />
                )}
              </button>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/png, image/jpeg, image/gif"
              className="hidden"
            />
          </Form>
        )}
      </div>
    </div>
  );
}

// Helper components for missing imports if needed
const Lock = ({ size, className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </svg>
);

const X = ({ size, className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

export default ContactSupportPage;
