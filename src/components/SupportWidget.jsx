import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, User, Bot, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { sendSupportMessage, getChatHistory } from '../api';
import toast from 'react-hot-toast';

const SupportWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [sessionId, setSessionId] = useState(localStorage.getItem('support_session_id'));
  const messagesEndRef = useRef(null);

  // Initialize Session ID
  useEffect(() => {
    if (!sessionId) {
      const newId = 'sess_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('support_session_id', newId);
      setSessionId(newId);
    }
  }, []);

  const fetchHistory = async () => {
    if (!sessionId) return;
    try {
      const res = await getChatHistory({ session_id: sessionId });
      setHistory(res.data.history);
      scrollToBottom();
    } catch (error) {
      // Silent error for polling
      console.log("Polling error", error);
    }
  };

  // Poll for new messages every 5 seconds when open
  useEffect(() => {
    let interval;
    if (isOpen) {
      setLoadingHistory(true);
      fetchHistory().finally(() => setLoadingHistory(false));
      interval = setInterval(fetchHistory, 5000);
    }
    return () => clearInterval(interval);
  }, [isOpen, sessionId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    // For first message, require email if not logged in (simplified check)
    // We can assume if no history, ask for email. 
    // But for better UX, let's just ask for email if it's not saved locally or provided
    const storedEmail = localStorage.getItem('support_email');
    const finalEmail = email || storedEmail;

    if (!finalEmail && history.length === 0) {
        toast.error("Please enter your email to start the chat.");
        return;
    }

    setSending(true);
    try {
      if (email) localStorage.setItem('support_email', email);

      // Optimistic update
      const tempMsg = {
          id: 'temp_' + Date.now(),
          message: message,
          sender: 'user',
          created_at: new Date().toISOString()
      };
      setHistory(prev => [...prev, tempMsg]);
      setMessage('');
      scrollToBottom();

      await sendSupportMessage({
        email: finalEmail || 'guest@proofdeck.app', // Fallback if lost
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

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="mb-4 bg-white rounded-2xl shadow-2xl w-[350px] sm:w-[380px] overflow-hidden border border-gray-100 pointer-events-auto flex flex-col max-h-[600px]"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white flex justify-between items-center shadow-md shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative">
                   <img 
                      src="/support-avatar.jpg" 
                      alt="Support" 
                      className="w-10 h-10 rounded-full border-2 border-white/30 object-cover shadow-sm"
                   />
                   <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-blue-600 rounded-full"></span>
                </div>
                <div>
                   <h3 className="font-bold text-base leading-tight">Chat with us</h3>
                   <span className="text-blue-100 text-xs text-opacity-90">
                     We reply immediately
                   </span>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/20 p-1.5 rounded-lg transition-colors text-white/90"
              >
                <X size={20} />
              </button>
            </div>

            {/* Chat History */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4 min-h-[300px]">
                {loadingHistory && history.length === 0 ? (
                    <div className="flex justify-center items-center h-full">
                        <Loader className="animate-spin text-blue-500" />
                    </div>
                ) : history.length === 0 ? (
                    <div className="text-center text-gray-400 mt-10 space-y-2">
                        <MessageSquare size={48} className="mx-auto opacity-20" />
                        <p className="text-sm">Start a conversation with our team.</p>
                    </div>
                ) : (
                    history.map((msg) => (
                        <div 
                            key={msg.id} 
                            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`
                                max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-sm
                                ${msg.sender === 'user' 
                                    ? 'bg-blue-600 text-white rounded-br-none' 
                                    : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'}
                            `}>
                                {msg.message}
                                <div className={`text-[10px] mt-1 ${msg.sender === 'user' ? 'text-blue-200' : 'text-gray-400'}`}>
                                    {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </div>
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* User Input Form (Email only if needed) */}
            <div className="p-4 bg-white border-t border-gray-100 shrink-0">
               <form onSubmit={handleSend} className="space-y-3">
                  {history.length === 0 && !localStorage.getItem('support_email') && (
                       <input
                        type="email"
                        placeholder="Your email address..."
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required={history.length === 0}
                      />
                  )}
                  
                  <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                      />
                      <button 
                        type="submit"
                        disabled={sending || !message.trim()}
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow active:scale-95 flex items-center justify-center"
                      >
                         {sending ? <Loader size={18} className="animate-spin" /> : <Send size={18} />}
                      </button>
                  </div>
               </form>
               <div className="text-center mt-2">
                   <p className="text-[10px] text-gray-400 flex items-center justify-center gap-1">
                       Powered by <span className="font-bold text-gray-500">ProofDeck</span>
                   </p>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`pointer-events-auto h-14 w-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 ${isOpen ? 'bg-gray-800 rotate-90' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
      >
         {isOpen ? <X size={24} /> : <MessageSquare size={24} fill="currentColor" />}
      </button>
      
      {/* Notification Dot if unread messages exist (future enhancement) */}
      {!isOpen && (
          <span className="absolute top-0 right-0 -mt-1 -mr-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white pointer-events-none"></span>
      )}
    </div>
  );
};

export default SupportWidget;
