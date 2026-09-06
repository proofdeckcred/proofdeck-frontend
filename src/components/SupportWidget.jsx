import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MessageSquare, X, Send, Loader, ChevronLeft } from 'lucide-react';
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

  // Auto-detect if user has existing conversation
  useEffect(() => {
    if (sessionId && localStorage.getItem('support_email')) {
      setView('chat');
    }
  }, [sessionId]);

  const fetchHistory = useCallback(async () => {
    if (!sessionId) return;
    try {
      const res = await getChatHistory({ session_id: sessionId });
      const newHistory = res.data.history;
      setHistory(newHistory);

      // Check for unread admin replies
      const adminReplies = newHistory.filter(m => m.sender === 'admin');
      if (!isOpen && adminReplies.length > prevHistoryLenRef.current) {
        setHasUnread(true);
      }
      prevHistoryLenRef.current = adminReplies.length;
    } catch (error) {
      // Silent error for polling
    }
  }, [sessionId, isOpen]);

  // Poll for new messages every 8 seconds when open
  useEffect(() => {
    let interval;
    if (isOpen && view === 'chat') {
      setLoadingHistory(true);
      fetchHistory().finally(() => setLoadingHistory(false));
      interval = setInterval(fetchHistory, 8000);
    }
    return () => clearInterval(interval);
  }, [isOpen, view, fetchHistory]);

  // Scroll to bottom when history changes
  useEffect(() => {
    if (history.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [history]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && view === 'chat') {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, view]);

  const handleStartChat = () => {
    if (!name.trim() || !email.trim()) {
      toast.error("Please enter your name and email.");
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
      // Optimistic update
      const tempMsg = {
        id: 'temp_' + Date.now(),
        message: message,
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

      // Refresh history to get real ID
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
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="mb-4 bg-white rounded-2xl shadow-2xl w-[370px] sm:w-[400px] overflow-hidden border border-gray-100 pointer-events-auto flex flex-col"
            style={{ maxHeight: 'min(580px, calc(100vh - 120px))', boxShadow: '0 25px 60px -12px rgba(0,0,0,0.15)' }}
          >
            {/* Header */}
            <div className="bg-[#0B0B12] p-5 text-white shrink-0 relative overflow-hidden">
              {/* Subtle gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-transparent" />

              <div className="relative z-10">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    {view === 'chat' && history.length > 0 && (
                      <button
                        onClick={() => setView('welcome')}
                        className="p-1 -ml-1 hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <ChevronLeft size={18} />
                      </button>
                    )}
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                        PD
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-[#0B0B12] rounded-full" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[15px] leading-tight">ProofDeck Support</h3>
                      <span className="text-white/50 text-xs">Usually replies within a few hours</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white/60 hover:text-white"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* Body */}
            {view === 'welcome' ? (
              /* ==================== WELCOME SCREEN ==================== */
              <div className="flex-1 overflow-y-auto">
                <div className="p-6 space-y-5">
                  {/* Greeting */}
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-1">
                      Hey 👋
                    </h2>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      Got a question about ProofDeck? We're here to help. Start a conversation and we'll get back to you.
                    </p>
                  </div>

                  {/* Quick info cards */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-900">Typical reply time</p>
                        <p className="text-[11px] text-gray-500">Within a few hours during business hours</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-900">Email notification</p>
                        <p className="text-[11px] text-gray-500">You'll get replies in your inbox too</p>
                      </div>
                    </div>
                  </div>

                  {/* Name + Email form */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">Your name</label>
                      <input
                        type="text"
                        placeholder="e.g. John Doe"
                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none transition-all placeholder:text-gray-400"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">Your email</label>
                      <input
                        type="email"
                        placeholder="you@company.com"
                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none transition-all placeholder:text-gray-400"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <button
                      onClick={handleStartChat}
                      className="w-full py-2.5 bg-[#0B0B12] hover:bg-[#1a1a2e] text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      <MessageSquare size={15} />
                      Start a conversation
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* ==================== CHAT VIEW ==================== */
              <>
                {/* Chat History */}
                <div className="flex-1 overflow-y-auto px-4 py-4 bg-gray-50/70 space-y-1" style={{ minHeight: '260px' }}>
                  {loadingHistory && history.length === 0 ? (
                    <div className="flex justify-center items-center h-full">
                      <Loader className="animate-spin text-indigo-400" size={20} />
                    </div>
                  ) : history.length === 0 ? (
                    <div className="text-center text-gray-400 mt-12 space-y-2">
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
                        <MessageSquare size={20} className="text-gray-300" />
                      </div>
                      <p className="text-sm font-medium text-gray-500">Send your first message</p>
                      <p className="text-xs text-gray-400">We'll get back to you as soon as possible</p>
                    </div>
                  ) : (
                    groupMessagesByDate(history).map((item, idx) => {
                      if (item.type === 'date') {
                        return (
                          <div key={`date-${idx}`} className="flex items-center justify-center py-3">
                            <span className="text-[10px] font-medium text-gray-400 bg-white px-3 py-1 rounded-full border border-gray-100 shadow-sm">
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
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white text-[9px] font-bold mr-2 mt-1 shrink-0">
                              PD
                            </div>
                          )}
                          <div className={`
                            max-w-[78%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed
                            ${isUser
                              ? 'bg-[#0B0B12] text-white rounded-br-md'
                              : 'bg-white text-gray-800 border border-gray-100 rounded-bl-md shadow-sm'}
                          `}>
                            {item.message}
                            <div className={`text-[10px] mt-1.5 ${isUser ? 'text-white/40' : 'text-gray-400'}`}>
                              {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message input */}
                <div className="p-3 bg-white border-t border-gray-100 shrink-0">
                  <form onSubmit={handleSend} className="flex gap-2">
                    <input
                      ref={inputRef}
                      type="text"
                      placeholder="Type a message..."
                      className="flex-1 px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none transition-all placeholder:text-gray-400"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                    <button
                      type="submit"
                      disabled={sending || !message.trim()}
                      className="bg-[#0B0B12] hover:bg-[#1a1a2e] text-white rounded-xl px-3.5 py-2.5 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center justify-center shrink-0"
                    >
                      {sending ? <Loader size={16} className="animate-spin" /> : <Send size={16} />}
                    </button>
                  </form>
                </div>
              </>
            )}

            {/* Footer */}
            <div className="text-center py-2 border-t border-gray-50 shrink-0">
              <p className="text-[10px] text-gray-400">
                Powered by <span className="font-semibold text-gray-500">ProofDeck</span>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <button
        onClick={handleToggle}
        className={`pointer-events-auto relative h-14 w-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 ${
          isOpen ? 'bg-[#0B0B12]' : 'bg-[#0B0B12] hover:bg-[#1a1a2e]'
        } text-white`}
        style={{ boxShadow: '0 8px 24px -4px rgba(11,11,18,0.3)' }}
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
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <MessageSquare size={22} fill="currentColor" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Unread notification dot — only shows when there are actual admin replies */}
        {!isOpen && hasUnread && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full border-2 border-white pointer-events-none flex items-center justify-center"
          >
            <span className="w-1.5 h-1.5 bg-white rounded-full" />
          </motion.span>
        )}
      </button>
    </div>
  );
};

export default SupportWidget;
