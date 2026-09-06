import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MessageSquare, X, Send, Loader, ChevronLeft, Sparkles, Clock, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { sendSupportMessage, getChatHistory } from '../api';
import toast from 'react-hot-toast';

const SupportWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState('welcome'); // 'welcome' | 'chat'
  const [message, setMessage] = useState('');
  const [name, setName] = useState(localStorage.getItem('support_name') || '');
  const [email, setEmail] = useState(localStorage.getItem('support_email') || '');
  const [sending, setSending] = useState(false);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [sessionId, setSessionId] = useState(localStorage.getItem('support_session_id'));
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const prevHistoryLenRef = useRef(0);

  // Initialize Session ID
  useEffect(() => {
    if (!sessionId) {
      const newId = 'sess_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('support_session_id', newId);
      setSessionId(newId);
    }
  }, []);

  // Auto-switch to chat view if user has an existing session with messages or email
  useEffect(() => {
    if (sessionId && localStorage.getItem('support_email')) {
      setView('chat');
    }
  }, [sessionId]);

  const fetchHistory = useCallback(async () => {
    if (!sessionId) return;
    try {
      const res = await getChatHistory({ session_id: sessionId });
      const newHistory = res.data.history || [];
      setHistory(newHistory);

      // If user already has messages, default to chat view
      if (newHistory.length > 0) {
        setView('chat');
      }

      // Check for unread admin replies
      const adminReplies = newHistory.filter(m => m.sender === 'admin');
      if (!isOpen && adminReplies.length > prevHistoryLenRef.current) {
        setHasUnread(true);
      }
      prevHistoryLenRef.current = adminReplies.length;
    } catch (error) {
      // Silent polling failure
    }
  }, [sessionId, isOpen]);

  // Poll for messages when chat is open
  useEffect(() => {
    let interval;
    if (isOpen) {
      setLoadingHistory(true);
      fetchHistory().finally(() => setLoadingHistory(false));
      interval = setInterval(fetchHistory, 6000);
    }
    return () => clearInterval(interval);
  }, [isOpen, fetchHistory]);

  // Scroll to bottom when history changes
  useEffect(() => {
    if (history.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && view === 'chat') {
      setTimeout(() => inputRef.current?.focus(), 250);
    }
  }, [isOpen, view]);

  const handleStartChat = () => {
    if (!name.trim() || !email.trim()) {
      toast.error("Please enter your name and email to start.");
      return;
    }
    localStorage.setItem('support_name', name.trim());
    localStorage.setItem('support_email', email.trim());
    setView('chat');
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const finalEmail = email || localStorage.getItem('support_email') || 'guest@proofdeck.app';

    setSending(true);
    try {
      const tempMsg = {
        id: 'temp_' + Date.now(),
        message: message.trim(),
        sender: 'user',
        created_at: new Date().toISOString()
      };
      setHistory(prev => [...prev, tempMsg]);
      setMessage('');

      await sendSupportMessage({
        email: finalEmail,
        message: tempMsg.message,
        session_id: sessionId
      });

      // Refresh to sync real DB record
      fetchHistory();
    } catch (error) {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setHasUnread(false);
    }
  };

  // Group messages by date
  const groupMessagesByDate = (msgs) => {
    const groups = [];
    let currentDate = '';
    msgs.forEach(msg => {
      const date = new Date(msg.created_at);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const yesterday = new Date(Date.now() - 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      let label = dateStr;
      if (dateStr === today) label = 'Today';
      else if (dateStr === yesterday) label = 'Yesterday';

      if (label !== currentDate) {
        currentDate = label;
        groups.push({ type: 'date', label });
      }
      groups.push({ type: 'message', ...msg });
    });
    return groups;
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="mb-4 bg-white rounded-3xl shadow-2xl w-[360px] sm:w-[390px] overflow-hidden border border-slate-200/80 pointer-events-auto flex flex-col"
            style={{
              maxHeight: 'min(620px, calc(100vh - 110px))',
              boxShadow: '0 25px 60px -15px rgba(15, 23, 42, 0.25), 0 0 1px rgba(15, 23, 42, 0.1)'
            }}
          >
            {/* Header: Vibrant ProofDeck Indigo with crisp white text */}
            <div
              className="p-5 text-white shrink-0 relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #3730A3 0%, #4F46E5 60%, #6366F1 100%)' }}
            >
              {/* Decorative background glow */}
              <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none" />

              <div className="relative z-10">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    {view === 'chat' && (
                      <button
                        onClick={() => setView('welcome')}
                        className="p-1.5 -ml-2 rounded-xl text-white/80 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
                        title="Back to menu"
                      >
                        <ChevronLeft size={20} />
                      </button>
                    )}
                    <div className="relative">
                      <div className="w-10 h-10 rounded-2xl bg-white text-indigo-700 font-bold text-sm flex items-center justify-center shadow-md border-2 border-white/40">
                        PD
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-400 border-2 border-indigo-700" />
                      </span>
                    </div>
                    <div>
                      <h3
                        className="text-[16px] font-bold leading-tight tracking-tight !text-white"
                        style={{ color: '#ffffff', margin: 0 }}
                      >
                        ProofDeck Support
                      </h3>
                      <p
                        className="text-xs text-indigo-100/90 font-medium mt-0.5 !text-indigo-100"
                        style={{ color: 'rgba(224, 231, 255, 0.95)', margin: 0 }}
                      >
                        Usually replies within minutes
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
                    title="Close chat"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* Body */}
            {view === 'welcome' ? (
              /* ==================== WELCOME SCREEN ==================== */
              <div className="flex-1 overflow-y-auto bg-white p-6 space-y-5">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-3">
                    <Sparkles size={13} /> Live Support
                  </div>
                  <h2
                    className="text-xl font-bold text-slate-900 tracking-tight"
                    style={{ color: '#0f172a' }}
                  >
                    How can we help today?
                  </h2>
                  <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                    Have questions about templates, bulk issuance, or our REST API? Reach out directly to our team.
                  </p>
                </div>

                {/* Features Highlights */}
                <div className="space-y-2.5">
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center shrink-0">
                      <Clock size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">Quick Turnaround</p>
                      <p className="text-[11px] text-slate-500">We receive your inquiry in real-time</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="w-8 h-8 rounded-xl bg-indigo-100/80 text-indigo-700 flex items-center justify-center shrink-0">
                      <ShieldCheck size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">Direct Founder & Engineering</p>
                      <p className="text-[11px] text-slate-500">Replies sent to your email inbox too</p>
                    </div>
                  </div>
                </div>

                {/* Contact Capture Form */}
                <div className="space-y-3 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Your Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Alex Johnson"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all placeholder:text-slate-400"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Your Email</label>
                    <input
                      type="email"
                      placeholder="alex@company.com"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all placeholder:text-slate-400"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <button
                    onClick={handleStartChat}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 cursor-pointer mt-2"
                  >
                    <MessageSquare size={16} />
                    Start conversation
                  </button>
                </div>
              </div>
            ) : (
              /* ==================== CHAT VIEW ==================== */
              <>
                {/* Chat History */}
                <div
                  className="flex-1 overflow-y-auto px-4 py-4 space-y-2"
                  style={{ minHeight: '300px', backgroundColor: '#F8FAFC' }}
                >
                  {loadingHistory && history.length === 0 ? (
                    <div className="flex flex-col justify-center items-center h-full py-16 text-slate-400 gap-2">
                      <Loader className="animate-spin text-indigo-600" size={24} />
                      <span className="text-xs">Loading conversation...</span>
                    </div>
                  ) : history.length === 0 ? (
                    <div className="text-center text-slate-400 py-16 space-y-2">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                        <MessageSquare size={22} />
                      </div>
                      <p className="text-sm font-bold text-slate-700">Start the conversation</p>
                      <p className="text-xs text-slate-400 max-w-[220px] mx-auto">
                        Ask any question below and our team will get right back to you.
                      </p>
                    </div>
                  ) : (
                    groupMessagesByDate(history).map((item, idx) => {
                      if (item.type === 'date') {
                        return (
                          <div key={`date-${idx}`} className="flex items-center justify-center py-2.5">
                            <span className="text-[11px] font-semibold text-slate-500 bg-white px-3 py-0.5 rounded-full border border-slate-200/80 shadow-xs">
                              {item.label}
                            </span>
                          </div>
                        );
                      }
                      const isUser = item.sender === 'user';
                      return (
                        <div
                          key={item.id}
                          className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-2`}
                        >
                          {!isUser && (
                            <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white text-[10px] font-bold mr-2 mt-0.5 shrink-0 shadow-xs">
                              PD
                            </div>
                          )}
                          <div
                            className={`
                              max-w-[80%] rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed shadow-xs
                              ${isUser
                                ? 'bg-indigo-600 text-white rounded-br-xs'
                                : 'bg-white text-slate-800 border border-slate-200/90 rounded-bl-xs'}
                            `}
                            style={isUser ? { backgroundColor: '#4F46E5', color: '#ffffff' } : { backgroundColor: '#ffffff', color: '#1e293b' }}
                          >
                            <p className="m-0 break-words whitespace-pre-wrap">{item.message}</p>
                            <div
                              className={`text-[10px] mt-1 text-right font-medium ${
                                isUser ? 'text-indigo-200' : 'text-slate-400'
                              }`}
                              style={{ color: isUser ? '#C7D2FE' : '#94A3B8' }}
                            >
                              {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input Box */}
                <div className="p-3 bg-white border-t border-slate-200/80 shrink-0">
                  <form onSubmit={handleSend} className="relative flex items-center">
                    <input
                      ref={inputRef}
                      type="text"
                      placeholder="Type a message..."
                      className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all placeholder:text-slate-400"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                    <button
                      type="submit"
                      disabled={sending || !message.trim()}
                      className="absolute right-1.5 w-9 h-9 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center transition-all shadow-sm active:scale-95 cursor-pointer"
                      title="Send message"
                    >
                      {sending ? <Loader size={16} className="animate-spin" /> : <Send size={15} />}
                    </button>
                  </form>
                </div>
              </>
            )}

            {/* Footer */}
            <div className="text-center py-2 bg-slate-50 border-t border-slate-100 shrink-0">
              <p className="text-[10px] text-slate-400 font-medium">
                Powered by <span className="font-bold text-slate-600">ProofDeck</span>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Launcher Button */}
      <button
        onClick={handleToggle}
        className={`pointer-events-auto relative h-14 w-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer ${
          isOpen
            ? 'bg-slate-900 text-white'
            : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/30'
        }`}
        style={{
          boxShadow: isOpen
            ? '0 10px 25px -5px rgba(15, 23, 42, 0.4)'
            : '0 10px 25px -5px rgba(79, 70, 229, 0.5)'
        }}
        title="ProofDeck Support"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X size={22} />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <MessageSquare size={22} fill="currentColor" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Unread indicator */}
        {!isOpen && hasUnread && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full border-2 border-white pointer-events-none flex items-center justify-center shadow-sm"
          >
            <span className="w-1.5 h-1.5 bg-white rounded-full" />
          </motion.span>
        )}
      </button>
    </div>
  );
};

export default SupportWidget;
