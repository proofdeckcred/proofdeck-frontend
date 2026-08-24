import React, { useState } from "react";
import { Link } from "react-router-dom";
import PublicHeader from "../components/PublicHeader";
import PublicFooter from "../components/PublicFooter";
import toast, { Toaster } from "react-hot-toast";
import { motion } from "motion/react";
import { sendContactMessage } from "../api";
import {
  Mail,
  User,
  MessageSquare,
  Send,
  Loader2,
  CheckCircle2,
  MapPin,
  Phone,
} from "lucide-react";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await sendContactMessage(formData);
      setSubmitted(true);
    } catch (error) {
      toast.error(error.response?.data?.msg || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen flex flex-col font-sans overflow-x-hidden">
      <Toaster position="top-right" />
      <PublicHeader />

      <main className="flex-grow relative bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">
                {/* Left Column: Content */}
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="space-y-10"
                >
                    <div>
                         <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 border border-gray-200 text-gray-800 text-sm font-semibold mb-6">
                            <Mail size={14} /> Contact Us
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">
                            Let's start a conversation
                        </h1>
                        <p className="mt-6 text-xl text-gray-500 leading-relaxed">
                            Whether you need a custom enterprise plan, have technical questions, or just want to say hello, our team is here to help.
                        </p>
                    </div>

                    <div className="space-y-8">
                        <ContactInfoRow 
                            icon={Mail}
                            title="Email Us"
                            link="mailto:hello@proofdeck.app"
                            desc="For general inquiries and support."
                        />
                        <ContactInfoRow 
                            icon={MapPin}
                            title="Headquarters"
                            content="Abuja, Nigeria"
                            desc="Building the future of digital credentials."
                        />
                        <ContactInfoRow 
                            icon={Phone}
                            title="Support"
                            content="Mon-Fri from 9am to 6pm GMT+1"
                            desc="We aim to respond to all tickets within 24 hours."
                        />
                    </div>
                </motion.div>

                {/* Right Column: Form */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8 md:p-10 relative overflow-hidden"
                >
                    {submitted ? (
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-center py-12"
                        >
                            <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle2 size={40} />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-3">Message Received!</h2>
                            <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                                Thanks for reaching out. We've sent a confirmation to your email and will be in touch shortly.
                            </p>
                            <button 
                                onClick={() => setSubmitted(false)}
                                className="text-indigo-600 font-semibold hover:text-indigo-700"
                            >
                                Send another message
                            </button>
                        </motion.div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Send a Message</h3>
                                <p className="text-gray-500 text-sm">Fill out the form below and we'll get back to you.</p>
                            </div>

                            <FormInput
                                label="Full Name"
                                name="name"
                                icon={User}
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                            <FormInput
                                label="Email Address"
                                name="email"
                                type="email"
                                icon={Mail}
                                placeholder="john@company.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />

                            <div>
                                <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                    <MessageSquare size={16} className="text-indigo-500" /> Your Message
                                </label>
                                <textarea
                                    id="message"
                                    name="message"
                                    rows="4"
                                    required
                                    value={formData.message}
                                    onChange={handleChange}
                                    className="block w-full rounded-xl border-gray-200 bg-gray-50 focus:bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200 outline-none resize-none"
                                    placeholder="Tell us how we can help..."
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full relative group overflow-hidden rounded-xl bg-indigo-600 px-8 py-4 text-white font-bold transition-all hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/20 disabled:bg-indigo-400 disabled:cursor-not-allowed"
                            >
                                <div className="relative z-10 flex items-center justify-center gap-2">
                                    {loading ? (
                                        <>
                                            <Loader2 className="animate-spin" size={20} />
                                            <span>Sending...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Send Message</span>
                                            <Send size={18} className="group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </div>
                            </button>
                        </form>
                    )}
                </motion.div>
            </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
};

const ContactInfoRow = ({ icon: Icon, title, content, link, desc }) => (
    <div className="flex gap-5 group">
        <div className="flex-shrink-0 w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-sm">
            <Icon size={24} />
        </div>
        <div>
            <h3 className="font-bold text-gray-900 text-lg mb-1">{title}</h3>
            {link ? (
                <a href={link} className="block text-indigo-600 font-medium hover:text-indigo-800 transition-colors mb-1 text-lg">
                    {content}
                </a>
            ) : (
                <p className="text-gray-900 font-medium mb-1 text-lg">{content}</p>
            )}
            <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
        </div>
    </div>
);

const FormInput = ({ label, icon: Icon, required, ...props }) => (
  <div>
    <label
      htmlFor={props.name}
      className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"
    >
      <Icon size={16} className="text-indigo-500" /> {label}
    </label>
    <div className="relative">
        <input
        id={props.name}
        required={required}
        {...props}
        className="block w-full rounded-xl border-gray-200 bg-gray-50 focus:bg-white pl-4 pr-4 py-3 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200 outline-none"
        />
    </div>
  </div>
);

export default ContactPage;
