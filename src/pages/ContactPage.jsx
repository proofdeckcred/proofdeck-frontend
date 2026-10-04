import React, { useState } from "react";
import { Link } from "react-router-dom";
import PublicHeader from "../components/PublicHeader";
import PublicFooter from "../components/PublicFooter";
import toast, { Toaster } from "react-hot-toast";
import { motion } from "motion/react";
import { sendContactMessage } from "../api";
import {
  EnvelopeSimple,
  User,
  ChatCircleDots,
  PaperPlaneTilt,
  CircleNotch,
  CheckCircle,
  MapPin,
  Phone,
} from "@phosphor-icons/react";
import SEO from "../components/SEO";
import Tag from "../components/ui/Tag";
import IconBadge from "../components/ui/IconBadge";
import { Ring, Guilloche } from "../components/ui/decor";

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
      <SEO
        title="Contact ProofDeck Support & Sales | ProofDeck"
        description="Get in touch with ProofDeck for sales, customer support, custom enterprise API onboarding, or partnership inquiries in Nigeria."
        canonicalUrl="https://www.proofdeck.app/contact"
      />
      <Toaster position="top-right" />
      <PublicHeader />

      <main className="flex-grow relative bg-[var(--pd-paper)] pd-dot-grid overflow-hidden">
        {/* Ambient Ring & Guilloche Decor (§5.2) */}
        <Ring
          size={380}
          strokeWidth={38}
          color="#5144E8"
          className="absolute -top-24 -left-20 opacity-[0.07] pointer-events-none"
        />
        <Guilloche
          size={300}
          color="#0A9AF5"
          opacity={0.1}
          className="absolute -bottom-20 -right-20 pointer-events-none"
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            {/* Left Column: Content */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              <div>
                <div className="mb-4">
                  <Tag tone="indigo" icon={ChatCircleDots}>Contact</Tag>
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--pd-ink)] tracking-tight leading-tight mb-4">
                  Let's start a conversation
                </h1>
                <p className="text-base sm:text-lg text-[var(--pd-mute)] leading-relaxed max-w-lg">
                  Whether you need a custom enterprise plan, have technical questions, or just want to say hello, our team is here to help.
                </p>
              </div>

              <div className="space-y-6 pt-2">
                <ContactInfoRow 
                  icon={EnvelopeSimple}
                  tone="indigo"
                  title="Email Us"
                  content="support@proofdeck.app"
                  link="mailto:support@proofdeck.app"
                  desc="For general inquiries and support."
                />
                <ContactInfoRow 
                  icon={MapPin}
                  tone="sky"
                  title="Headquarters"
                  content="Abuja, Nigeria"
                  desc="Building the modern standard for verifiable digital credentials."
                />
                <ContactInfoRow 
                  icon={Phone}
                  tone="green"
                  title="Support Hours"
                  content="Mon - Fri from 9am to 6pm GMT+1"
                  desc="We aim to respond to all inquiries within 24 hours."
                />
              </div>
            </motion.div>

            {/* Right Column: Form */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="bg-white rounded-3xl border border-[var(--pd-line)] p-6 sm:p-8 md:p-10 shadow-xl relative overflow-hidden"
              style={{ boxShadow: "0 20px 40px -15px rgba(11,11,18,0.08)" }}
            >
              {submitted ? (
                <motion.div 
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-16 h-16 bg-[#DDF5E6] text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-200/50">
                    <CheckCircle size={32} weight="duotone" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[var(--pd-ink)] mb-2">Message Received!</h2>
                  <p className="text-sm text-[var(--pd-mute)] mb-6 max-w-xs mx-auto leading-relaxed">
                    Thanks for reaching out. We've received your message and will get back to you shortly.
                  </p>
                  <button 
                    onClick={() => setSubmitted(false)}
                    className="text-xs font-semibold text-[var(--pd-indigo)] hover:text-[var(--pd-indigo-dark)] cursor-pointer"
                  >
                    Send another message
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-[var(--pd-ink)] mb-1">Send a message</h3>
                    <p className="text-xs sm:text-sm text-[var(--pd-mute)]">Fill out the form below and we'll reply via email.</p>
                  </div>

                  <FormInput 
                    label="Your Name" 
                    icon={User}
                    name="name" 
                    type="text" 
                    placeholder="Jane Doe" 
                    value={formData.name} 
                    onChange={handleChange} 
                    required 
                  />

                  <FormInput 
                    label="Email Address" 
                    icon={EnvelopeSimple}
                    name="email" 
                    type="email" 
                    placeholder="jane@example.com" 
                    value={formData.email} 
                    onChange={handleChange} 
                    required 
                  />

                  <div>
                    <label 
                      htmlFor="message" 
                      className="block text-xs font-semibold text-[var(--pd-ink)] mb-1.5 flex items-center gap-1.5"
                    >
                      <ChatCircleDots size={13} weight="bold" className="text-[var(--pd-indigo)]" /> Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows="4"
                      required
                      placeholder="Tell us how we can help..."
                      value={formData.message}
                      onChange={handleChange}
                      className="block w-full rounded-xl border border-[var(--pd-line)] bg-[var(--pd-paper)]/60 focus:bg-white p-3.5 text-xs sm:text-sm text-[var(--pd-ink)] placeholder-[var(--pd-mute)]/60 focus:border-[var(--pd-indigo)] focus:ring-2 focus:ring-[var(--pd-indigo)]/10 transition-all outline-none resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-sm font-semibold text-white bg-[var(--pd-indigo)] hover:bg-[var(--pd-indigo-dark)] disabled:opacity-70 transition-all shadow-sm cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <CircleNotch size={16} className="animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Message</span>
                        <PaperPlaneTilt size={15} weight="bold" />
                      </>
                    )}
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

const ContactInfoRow = ({ icon, tone = "indigo", title, content, link, desc }) => (
  <div className="flex gap-4 items-start group">
    <IconBadge icon={icon} tone={tone} size="md" shape="squircle" className="mt-0.5" />
    <div>
      <h3 className="font-bold text-sm text-[var(--pd-ink)] mb-0.5">{title}</h3>
      {link ? (
        <a href={link} className="block text-xs sm:text-sm font-medium text-[var(--pd-indigo)] hover:underline mb-0.5 no-underline">
          {content}
        </a>
      ) : (
        <p className="text-xs sm:text-sm font-medium text-[var(--pd-ink)] mb-0.5">{content}</p>
      )}
      <p className="text-xs text-[var(--pd-mute)] leading-relaxed">{desc}</p>
    </div>
  </div>
);

const FormInput = ({ label, icon: Icon, required, ...props }) => (
  <div>
    <label
      htmlFor={props.name}
      className="block text-xs font-semibold text-[var(--pd-ink)] mb-1.5 flex items-center gap-1.5"
    >
      <Icon size={13} weight="bold" className="text-[var(--pd-indigo)]" /> {label}
    </label>
    <div className="relative">
      <input
        id={props.name}
        required={required}
        {...props}
        className="block w-full rounded-xl border border-[var(--pd-line)] bg-[var(--pd-paper)]/60 focus:bg-white px-3.5 py-2.5 text-xs sm:text-sm text-[var(--pd-ink)] placeholder-[var(--pd-mute)]/60 focus:border-[var(--pd-indigo)] focus:ring-2 focus:ring-[var(--pd-indigo)]/10 transition-all outline-none"
      />
    </div>
  </div>
);

export default ContactPage;
