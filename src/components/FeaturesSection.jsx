import React from "react";
import { motion } from "motion/react";
import {
  Palette,
  UploadCloud,
  BarChart3,
  ShieldCheck,
  ArrowRight,
  Zap,
  Code,
} from "lucide-react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";

const features = [
  {
    id: "editor",
    title: "Visual Template Editor",
    subtitle: "DESIGN",
    description:
      "Create stunning credentials with our drag-and-drop editor. Choose from professionally designed templates or build your own from scratch. Real-time WYSIWYG preview guarantees what you see is what recipients get.",
    icon: Palette,
    image: "/images/landing_page_image/visual-editor.png",
    bgColor: "bg-indigo-50",
    accentColor: "text-indigo-600",
    iconBg: "bg-indigo-100",
    borderColor: "border-indigo-100",
    benefits: [
      "Drag & drop text, images, and signatures",
      "Real-time visual preview",
      "Custom background images & branding",
    ],
  },
  {
    id: "bulk",
    title: "Bulk Issuance Engine",
    subtitle: "SCALE",
    description:
      "Issue thousands of certificates or invitations in minutes. Upload a CSV list, map your columns, and let our engine handle the rest. We generate, sign, and email credentials automatically in the background.",
    icon: UploadCloud,
    image: "/images/landing_page_image/bulk_creation.png",
    bgColor: "bg-sky-50",
    accentColor: "text-sky-600",
    iconBg: "bg-sky-100",
    borderColor: "border-sky-100",
    benefits: [
      "One-click CSV/Excel upload",
      "Automatic attribute mapping",
      "Background processing for large batches",
    ],
  },
  {
    id: "analytics",
    title: "Visual & Real-Time Analytics",
    subtitle: "INSIGHTS",
    description:
      "Gain insights into your credentialing program. Track issuance rates, recipient engagement, and platform sharing metrics with our comprehensive real-time analytics dashboard.",
    icon: BarChart3,
    image: "/images/landing_page_image/analytics.png",
    bgColor: "bg-violet-50",
    accentColor: "text-violet-600",
    iconBg: "bg-violet-100",
    borderColor: "border-violet-100",
    benefits: [
      "Track email open & bounce rates",
      "Monitor certification performance",
      "Visual growth charts & exports",
    ],
  },
  {
    id: "verify",
    title: "Instant Verification",
    subtitle: "TRUST",
    description:
      "Every credential comes with a unique, tamper-proof verification page. Third parties can instantly verify authenticity by scanning a QR code or visiting the secure URL.",
    icon: ShieldCheck,
    image: "/images/landing_page_image/verification.png",
    bgColor: "bg-emerald-50",
    accentColor: "text-emerald-600",
    iconBg: "bg-emerald-100",
    borderColor: "border-emerald-100",
    benefits: [
      "Unique QR code per certificate",
      "Public verification pages",
      "Bank-grade fraud protection",
    ],
  },
  {
    id: "branding",
    title: "Custom Branding",
    subtitle: "BRANDING",
    description:
      "Configure custom domains, design custom emails, and brand public ledger portals so that recipients and verifiers enjoy a white-labeled experience under your brand name.",
    icon: Zap,
    bgColor: "bg-pink-50",
    accentColor: "text-pink-600",
    iconBg: "bg-pink-100",
    borderColor: "border-pink-100",
    benefits: [
      "White-label verification portals",
      "Custom email designs & sender info",
      "Issuer logos & profile configuration",
    ],
  },
  {
    id: "api",
    title: "Developer API Integration",
    subtitle: "INTEGRATION",
    description:
      "Connect ProofDeck directly to your LMS, HR tool, or payment gateway using our REST API. Automate generation and trigger webhooks upon successful delivery.",
    icon: Code,
    bgColor: "bg-amber-50",
    accentColor: "text-amber-600",
    iconBg: "bg-amber-100",
    borderColor: "border-amber-100",
    benefits: [
      "Easy-to-use REST API endpoints",
      "Real-time webhook updates",
      "Comprehensive developer documentation",
    ],
  },
];

const FeatureCard = ({ feature, index }) => {
  // Each card sticks at a progressively lower top offset
  const topOffset = 80 + index * 40;

  return (
    <div
      className="sticky mb-8 last:mb-0"
      style={{ top: `${topOffset}px` }}
    >
      <motion.div
        className={`${feature.bgColor} rounded-3xl border ${feature.borderColor} shadow-lg overflow-hidden`}
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 items-stretch">
          {/* Left Column: Text Content */}
          <div className="p-8 md:p-12 flex flex-col justify-center">
            <div
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/95 ${feature.accentColor} text-xs font-bold tracking-widest mb-5 w-fit border ${feature.borderColor}`}
            >
              <feature.icon size={13} />
              {feature.subtitle}
            </div>

            <h3 className="text-2xl md:text-3xl font-extrabold text-slate-850 mb-4 leading-tight">
              {feature.title}
            </h3>

            <p className="text-slate-650 leading-relaxed mb-6 text-sm md:text-[15px] font-medium">
              {feature.description}
            </p>

            <ul className="space-y-3">
              {feature.benefits.map((benefit, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-700">
                  <div
                    className={`w-5 h-5 rounded-full ${feature.iconBg} flex items-center justify-center ${feature.accentColor} shrink-0`}
                  >
                    <ArrowRight size={10} className="stroke-[2.5]" />
                  </div>
                  <span className="text-sm font-semibold">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right Column: Visual Portrait Cover Split */}
          <div className="relative hidden md:block overflow-hidden min-h-[380px] bg-slate-200/20 border-l border-slate-200/20">
            {feature.image ? (
              <img
                src={feature.image}
                alt={feature.title}
                className="absolute inset-0 w-full h-full object-cover transform hover:scale-103 transition-transform duration-700 object-left-top"
              />
            ) : (
              /* Abstract visual placeholder centered */
              <div className="absolute inset-0 flex items-center justify-center p-8 bg-white/40">
                <div className="relative w-full max-w-xs flex flex-col items-center">
                  <div className={`aspect-square rounded-2xl bg-white/90 border border-white shadow-md flex items-center justify-center relative overflow-hidden w-40 h-40`}>
                    <feature.icon
                      size={80}
                      strokeWidth={0.8}
                      className={`${feature.accentColor} opacity-30`}
                    />
                    {/* Floating decoration cards */}
                    <div className="absolute bottom-3 left-3 bg-white p-2 rounded-lg shadow-sm border border-slate-100 flex items-center gap-1.5">
                      <div className={`p-1 rounded-md ${feature.iconBg} ${feature.accentColor}`}>
                        <feature.icon size={10} />
                      </div>
                      <span className="text-[9px] font-bold text-slate-800">Verified</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export function FeaturesSection() {
  const navigate = useNavigate();

  return (
    <section id="features" className="bg-white py-16 md:py-24 relative overflow-visible">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-xs font-bold text-indigo-600 tracking-widest uppercase mb-3">
            Features Library
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight">
            Everything you need to
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
              issue credentials
            </span>
          </h2>
        </motion.div>

        {/* Stacking Cards Container */}
        <div className="relative">
          {features.map((feature, index) => (
            <FeatureCard key={feature.id} feature={feature} index={index} />
          ))}
        </div>

        {/* Bottom CTA Pill Button */}
        <div className="text-center mt-16 flex justify-center">
          <motion.button
            onClick={() => navigate("/signup")}
            whileHover={{ scale: 1.02, translateY: -2 }}
            whileTap={{ scale: 0.98 }}
            className="group px-10 py-4 bg-gradient-to-r from-indigo-600 via-indigo-650 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-full text-sm font-bold tracking-wide uppercase shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300/40 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer border border-transparent"
          >
            <span>Start Using These Features Free</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform stroke-[2.5]" />
          </motion.button>
        </div>
      </div>
    </section>
  );
}
