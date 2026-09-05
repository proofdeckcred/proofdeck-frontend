import React from "react";
import { motion } from "framer-motion";
import {
  Palette,
  UploadCloud,
  BarChart3,
  ShieldCheck,
  Code,
} from "lucide-react";

const features = [
  {
    id: "editor",
    title: "Visual Template Editor",
    subtitle: "Design",
    description:
      "Create credentials with our drag-and-drop editor. Choose from professionally designed templates or build your own from scratch. Real-time WYSIWYG preview guarantees what you see is what recipients get.",
    icon: Palette,
    image: "/images/landing_page_image/visual-editor.png",
    benefits: [
      "Drag & drop text, images, and signatures",
      "Real-time visual preview",
      "Custom background images & branding",
    ],
  },
  {
    id: "bulk",
    title: "Bulk Issuance Engine",
    subtitle: "Scale",
    description:
      "Issue thousands of certificates or invitations in minutes. Upload a CSV list, map your columns, and let our engine handle the rest. We generate, sign, and email credentials automatically in the background.",
    icon: UploadCloud,
    image: "/images/landing_page_image/bulk_creation.png",
    benefits: [
      "One-click CSV/Excel upload",
      "Automatic attribute mapping",
      "Background processing for large batches",
    ],
  },
  {
    id: "analytics",
    title: "Visual & Real-Time Analytics",
    subtitle: "Insights",
    description:
      "Gain insights into your credentialing program. Track issuance rates, recipient engagement, and platform sharing metrics with our real-time analytics dashboard.",
    icon: BarChart3,
    image: "/images/landing_page_image/analytics.png",
    benefits: [
      "Track email open & bounce rates",
      "Monitor certification performance",
      "Visual growth charts & exports",
    ],
  },
  {
    id: "verify",
    title: "Instant Verification",
    subtitle: "Trust",
    description:
      "Every credential comes with a unique, tamper-proof verification page. Third parties can instantly verify authenticity by scanning a QR code or visiting the secure URL.",
    icon: ShieldCheck,
    image: "/images/landing_page_image/verification.png",
    benefits: [
      "Unique QR code per certificate",
      "Public verification pages",
      "Bank-grade fraud protection",
    ],
  },
  /* 
  // Commented out per user request - Custom Branding feature
  {
    id: "branding",
    title: "Custom Branding",
    subtitle: "Branding",
    description:
      "Configure custom domains, design custom emails, and brand public ledger portals so that recipients and verifiers enjoy a white-labeled experience under your brand name.",
    icon: Zap,
    benefits: [
      "White-label verification portals",
      "Custom email designs & sender info",
      "Issuer logos & profile configuration",
    ],
  },
  */
  {
    id: "api",
    title: "Developer API Integration",
    subtitle: "Integration",
    description:
      "Connect ProofDeck directly to your LMS, HR tool, or payment gateway using our REST API. Automate generation and trigger webhooks upon successful delivery.",
    icon: Code,
    image: "/images/landing_page_image/api-integration.png",
    benefits: [
      "Easy-to-use REST API endpoints",
      "Real-time webhook updates",
      "Comprehensive developer documentation",
    ],
  },
];

const FeatureCard = ({ feature, index }) => {
  const topOffset = 80 + index * 30;

  return (
    <div
      className="sticky mb-8 last:mb-0"
      style={{ top: `${topOffset}px` }}
    >
      <motion.div
        className="bg-white rounded-2xl border border-[#E6E4ED] shadow-sm overflow-hidden"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.4 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 items-stretch">
          {/* Left Column: Text Content */}
          <div className="p-8 md:p-12 flex flex-col justify-center bg-white">
            <span className="pd-pill-label mb-5">{feature.subtitle}</span>

            <h3 className="text-2xl md:text-3xl font-black text-[#15131F] mb-4 leading-tight tracking-tight">
              {feature.title}
            </h3>

            <p className="text-[#68647A] leading-relaxed mb-6 text-sm md:text-[15px] font-medium">
              {feature.description}
            </p>

            <ul className="space-y-3">
              {feature.benefits.map((benefit, i) => (
                <li key={i} className="flex items-center gap-3 text-[#15131F]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--pd-indigo)] shrink-0 mt-1.5" />
                  <span className="text-sm font-semibold">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right Column: Visual Preview Cover */}
          <div className="relative hidden md:block overflow-hidden min-h-[380px] bg-[#FAFAF9] border-l border-[#E6E4ED]">
            {feature.image ? (
              <img
                src={feature.image}
                alt={feature.title}
                className="absolute inset-0 w-full h-full object-cover transform hover:scale-102 transition-transform duration-500 object-left-top"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center p-8 bg-[#FAFAF9]">
                <div className="relative w-full max-w-xs flex flex-col items-center">
                  <div className="aspect-square rounded-2xl bg-white border border-[#E6E4ED] shadow-2xs flex items-center justify-center relative overflow-hidden w-40 h-40">
                    <feature.icon
                      size={64}
                      strokeWidth={1.2}
                      className="text-[#4A3AA8] opacity-40"
                    />
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
  return (
    <section className="py-20 md:py-28 bg-[#FAFAF9] relative" id="features">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="pd-pill-label mb-4 inline-flex">Features</span>
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--pd-ink)] leading-tight tracking-tight mb-4">
            Everything you need to automate credentials
          </h2>
          <p className="text-base text-[#68647A] font-medium">
            From visual template creation to bulk distribution and instant verification.
          </p>
        </div>

        {/* Stacking Cards */}
        <div className="relative">
          {features.map((feature, index) => (
            <FeatureCard key={feature.id} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeaturesSection;
