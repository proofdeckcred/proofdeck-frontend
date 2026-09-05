import React, { useState } from "react";
import {
  Clock,
  GraduationCap,
  Megaphone,
  Linkedin,
  ChevronDown,
  QrCode,
  CheckCircle,
  Mail,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const benefits = [
  {
    id: "save-time",
    icon: Clock,
    title: "Save time and resources",
    description:
      "Ditch the paperwork and manual PDF creation. Streamline credential issuance, verification, and management with automated certificate software.",
  },
  {
    id: "skills",
    icon: GraduationCap,
    title: "Drive skill development",
    description:
      "Encourage continuous learning by delivering instant, verifiable proof of course completion and skill milestones.",
  },
  {
    id: "engagement",
    icon: CheckCircle,
    title: "Ignite recipient engagement",
    description:
      "Boost engagement by enabling recipients to proudly share their credentials across social media platforms, increasing visibility for both the earner and your brand.",
  },
  {
    id: "brand",
    icon: Megaphone,
    title: "Boost your brand",
    description:
      "Every shared credential is organic marketing for your organization. Branded certificates and verification pages reinforce trust and authority in your space.",
  },
  {
    id: "linkedin",
    icon: Linkedin,
    title: "Share credentials on LinkedIn",
    description:
      "Recipients can add verified credentials directly to their LinkedIn profile Licenses & Certifications with one click.",
  },
];

const AccordionItem = ({ item, isOpen, onToggle }) => (
  <div
    className={`border rounded-xl transition-all duration-200 cursor-pointer ${
      isOpen
        ? "border-[#4A3AA8] bg-white shadow-2xs"
        : "border-[#E6E4ED] bg-white hover:border-slate-300"
    }`}
    onClick={onToggle}
  >
    <div className="flex items-center justify-between p-4 md:p-5">
      <div className="flex items-center gap-3.5">
        {/* Bare monoline icon without tinted pastel background box */}
        <div className="shrink-0 flex items-center justify-center">
          <item.icon
            size={20}
            className={`transition-colors stroke-[1.75] ${
              isOpen ? "text-[#4A3AA8]" : "text-[#68647A]"
            }`}
          />
        </div>
        <h4
          className={`font-bold text-sm md:text-base transition-colors ${
            isOpen ? "text-[#15131F]" : "text-slate-800"
          }`}
        >
          {item.title}
        </h4>
      </div>
      <ChevronDown
        size={18}
        className={`text-slate-400 transition-transform duration-300 shrink-0 ${
          isOpen ? "rotate-180 text-[#4A3AA8]" : ""
        }`}
      />
    </div>
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="overflow-hidden"
        >
          <p className="px-5 pb-5 text-sm text-[#68647A] leading-relaxed pl-12">
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
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none hidden sm:block"
      style={{ zIndex: 0 }}
    >
      <path
        d="M 210 65 L 270 115"
        fill="none"
        stroke="#E6E4ED"
        strokeWidth="2"
        strokeDasharray="4 4"
      />
      <path
        d="M 330 145 L 330 200 L 140 200 L 140 255"
        fill="none"
        stroke="#E6E4ED"
        strokeWidth="2"
        strokeDasharray="4 4"
      />
      <path
        d="M 200 275 L 270 325"
        fill="none"
        stroke="#E6E4ED"
        strokeWidth="2"
        strokeDasharray="4 4"
      />
    </svg>

    {/* Left Column: Certificate & Verified */}
    <div className="flex flex-col gap-14 items-center relative z-10">
      {/* Certificate Card */}
      <motion.div
        className="bg-white border border-[#E6E4ED] rounded-xl p-4 shadow-sm w-full max-w-[210px] text-left relative"
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
      >
        <div className="border border-[#E6E4ED] rounded p-2.5 mb-2 bg-[#FAFAF9]">
          <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
            Certificate of
          </p>
          <p className="text-[10px] font-black text-[#15131F] leading-tight mb-1">
            Professional Development
          </p>
          <p className="text-[8px] text-[#68647A] font-bold mb-0">
            Roland Roberts
          </p>
        </div>
        <div className="flex items-center justify-between pt-1 border-t border-[#E6E4ED] text-[7px] font-mono text-slate-400">
          <span>ID: 000000</span>
          <QrCode size={12} className="text-[#15131F]" />
        </div>
      </motion.div>

      {/* Verified Pill */}
      <motion.div
        className="flex items-center gap-3 bg-white border border-[#E6E4ED] rounded-xl p-3 shadow-2xs w-full max-w-[200px]"
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <div className="shrink-0">
          <CheckCircle size={18} className="text-[#2F6B4F] stroke-[1.75]" />
        </div>
        <span className="text-xs font-bold text-[#15131F]">Verified</span>
      </motion.div>
    </div>

    {/* Right Column: Email Sent & Added to LinkedIn */}
    <div className="flex flex-col gap-14 items-center justify-center pt-6 sm:pt-16 relative z-10">
      {/* Email Sent Pill */}
      <motion.div
        className="flex items-center gap-3 bg-white border border-[#E6E4ED] rounded-xl p-3 shadow-2xs w-full max-w-[200px]"
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        <div className="shrink-0">
          <Mail size={18} className="text-[#4A3AA8] stroke-[1.75]" />
        </div>
        <span className="text-xs font-bold text-[#15131F]">Email Sent</span>
      </motion.div>

      {/* Added to LinkedIn Pill */}
      <motion.div
        className="flex items-center gap-3 bg-white border border-[#E6E4ED] rounded-xl p-3 shadow-2xs w-full max-w-[200px]"
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.45 }}
      >
        <div className="shrink-0">
          <Linkedin size={18} className="text-[#0A66C2] stroke-[1.75]" />
        </div>
        <span className="text-xs font-bold text-[#15131F]">Added to LinkedIn</span>
      </motion.div>
    </div>
  </div>
);

export function BenefitsSection() {
  const [openId, setOpenId] = useState("save-time");

  return (
    <section className="py-20 md:py-28 bg-[#FAFAF9] border-t border-[#E6E4ED]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header - Solid Ink Headline without gradient fill */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <span className="pd-pill-label mb-4 inline-flex">Benefits</span>
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--pd-ink)] leading-tight tracking-tight">
            Real tangible benefits of credential automation
          </h2>
          <p className="text-sm text-[#68647A] font-semibold mt-3 max-w-xl mx-auto">
            Turn informal achievements into instantly verifiable documents.
          </p>
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

          {/* Right: Flow Diagram Container */}
          <div className="bg-white rounded-2xl border border-[#E6E4ED] p-6 md:p-10 shadow-2xs">
            <FlowDiagram />
          </div>
        </div>
      </div>
    </section>
  );
}

export default BenefitsSection;
