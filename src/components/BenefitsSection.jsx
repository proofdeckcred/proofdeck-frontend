import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Clock,
  GraduationCap,
  Sparkles,
  Megaphone,
  Linkedin,
  ChevronDown,
  Mail,
  CheckCircle,
  Award,
  QrCode,
  Check,
} from "lucide-react";

const benefits = [
  {
    id: "save-time",
    icon: Clock,
    title: "Save time and resources",
    description:
      "Ditch the paperwork and the hassle of manually creating PDF certificates. Streamline credential issuance, verification, and management — all possible with our certificate generator software.",
  },
  {
    id: "drive-skills",
    icon: GraduationCap,
    title: "Drive skill development",
    description:
      "Motivate learners and employees by recognizing their achievements with verifiable digital credentials. Track progress and incentivize continuous professional development.",
  },
  {
    id: "engagement",
    icon: Sparkles,
    title: "Ignite recipient engagement",
    description:
      "Boost engagement by enabling recipients to proudly share their credentials across social media platforms, increasing visibility for both the earner and your brand.",
  },
  {
    id: "brand",
    icon: Megaphone,
    title: "Boost your brand",
    description:
      "Every shared credential is organic marketing for your organization. Custom-branded certificates and verification pages reinforce trust and authority in your space.",
  },
  {
    id: "linkedin",
    icon: Linkedin,
    title: "Share credentials on LinkedIn",
    description:
      "Recipients can add verified credentials directly to their LinkedIn profiles with one click. Coming soon: deep LinkedIn integration for seamless professional showcasing.",
  },
];

const AccordionItem = ({ item, isOpen, onToggle }) => (
  <div
    className={`border rounded-2xl transition-all duration-300 cursor-pointer ${
      isOpen
        ? "border-amber-200 bg-white shadow-md shadow-amber-50"
        : "border-slate-200 bg-white hover:border-slate-300"
    }`}
    onClick={onToggle}
  >
    <div className="flex items-center justify-between p-4 md:p-5">
      <div className="flex items-center gap-3.5">
        <div
          className={`p-2.5 rounded-xl shrink-0 border transition-colors ${
            isOpen
              ? "bg-[#FAF7F2] text-[#8C6D53] border-amber-100"
              : "bg-slate-50 text-slate-400 border-slate-100"
          }`}
        >
          <item.icon size={18} />
        </div>
        <h4
          className={`font-bold text-sm md:text-base transition-colors ${
            isOpen ? "text-slate-800" : "text-slate-700"
          }`}
        >
          {item.title}
        </h4>
      </div>
      <ChevronDown
        size={18}
        className={`text-slate-400 transition-transform duration-300 shrink-0 ${
          isOpen ? "rotate-180 text-[#8C6D53]" : ""
        }`}
      />
    </div>
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <p className="px-5 pb-5 text-sm text-slate-500 leading-relaxed pl-16">
            {item.description}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

const FlowDiagram = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-12 items-center relative py-6 px-4">
    {/* SVG Connector Lines */}
    <svg className="absolute inset-0 w-full h-full pointer-events-none hidden sm:block" style={{ zIndex: 0 }}>
      {/* Certificate to Email Sent */}
      <path d="M 210 65 L 270 115" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4 4" />
      {/* Email Sent to Verified */}
      <path d="M 330 145 L 330 200 L 140 200 L 140 255" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4 4" />
      {/* Verified to Added to LinkedIn */}
      <path d="M 200 275 L 270 325" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4 4" />
    </svg>

    {/* Left Column: Certificate & Verified */}
    <div className="flex flex-col gap-14 items-center relative z-10">
      {/* Certificate Card */}
      <motion.div
        className="bg-white border border-[#A855F7]/30 rounded-xl p-4 shadow-sm w-full max-w-[210px] text-left relative"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
      >
        <div className="border border-slate-100 rounded p-2 mb-2 bg-[#FAF7F2]/20">
          <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Certificate of</p>
          <p className="text-[10px] font-black text-slate-800 leading-tight mb-1">Professional Development</p>
          <p className="text-[8px] text-slate-500 font-bold mb-0">Roland Roberts</p>
        </div>
        <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[7px] font-mono text-slate-450">
          <span>ID: 000000</span>
          <QrCode size={12} />
        </div>
      </motion.div>

      {/* Verified Pill */}
      <motion.div
        className="flex items-center gap-3 bg-white border border-slate-200/80 rounded-xl p-3 shadow-xs w-full max-w-[200px]"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <div className="p-2.5 bg-[#FAF7F2] text-[#8C6D53] rounded-lg shrink-0 border border-amber-100">
          <CheckCircle size={16} />
        </div>
        <span className="text-xs font-bold text-slate-700">Verified</span>
      </motion.div>
    </div>

    {/* Right Column: Email Sent & Added to LinkedIn */}
    <div className="flex flex-col gap-14 items-center justify-center pt-6 sm:pt-16 relative z-10">
      {/* Email Sent Pill */}
      <motion.div
        className="flex items-center gap-3 bg-white border border-slate-200/80 rounded-xl p-3 shadow-xs w-full max-w-[200px]"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <div className="p-2.5 bg-[#FAF7F2] text-[#8C6D53] rounded-lg shrink-0 border border-amber-100">
          <Mail size={16} />
        </div>
        <span className="text-xs font-bold text-slate-700">Email Sent</span>
      </motion.div>

      {/* Added to LinkedIn Pill */}
      <motion.div
        className="flex items-center gap-3 bg-white border border-slate-200/80 rounded-xl p-3 shadow-xs w-full max-w-[200px]"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.6 }}
      >
        <div className="p-2.5 bg-[#FAF7F2] text-[#8C6D53] rounded-lg shrink-0 border border-amber-100">
          <Linkedin size={16} />
        </div>
        <span className="text-xs font-bold text-slate-700">Added to LinkedIn</span>
      </motion.div>
    </div>
  </div>
);

export function BenefitsSection() {
  const [openId, setOpenId] = useState("save-time");

  return (
    <section className="py-20 md:py-28 bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight">
            Real tangible benefits of
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8C6D53] to-slate-800">
              credential automation
            </span>
          </h2>
        </motion.div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Accordion */}
          <div className="space-y-3">
            {benefits.map((item) => (
              <AccordionItem
                key={item.id}
                item={item}
                isOpen={openId === item.id}
                onToggle={() =>
                  setOpenId(openId === item.id ? null : item.id)
                }
              />
            ))}
          </div>

          {/* Right: Flow Diagram */}
          <div className="bg-[#FAF7F2]/60 rounded-3xl border border-[#FAF7F2] p-6 md:p-10 shadow-inner">
            <FlowDiagram />
          </div>
        </div>
      </div>
    </section>
  );
}
