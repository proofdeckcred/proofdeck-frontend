import React from "react";
import { motion } from "framer-motion";
import {
  PaintBrushBroad,
  Stack,
  ChartLineUp,
  ShieldCheck,
  Code,
} from "@phosphor-icons/react";
import Tag from "./ui/Tag";
import CheckBadge from "./ui/CheckBadge";
import { Ring, DotGrid, QrFragment, Swirl, Seal } from "./ui/decor";

const features = [
  {
    id: "editor",
    title: "Visual Template Editor",
    subtitle: "Design",
    tone: "indigo",
    description:
      "Create credentials with our drag-and-drop editor. Choose from professionally designed templates or build your own from scratch. Real-time WYSIWYG preview guarantees what you see is what recipients get.",
    icon: PaintBrushBroad,
    image: "/images/landing_page_image/visual-editor.png",
    benefits: [
      "Drag & drop text, images, and signatures",
      "Real-time visual preview",
      "Custom background images & branding",
    ],
    decor: (
      <>
        <Ring
          size={240}
          strokeWidth={26}
          color="#5144E8"
          className="absolute -top-14 -right-14 opacity-20"
        />
        <div className="absolute inset-0 opacity-25 pointer-events-none">
          <DotGrid dotSize={1.2} gap={16} color="#5144E8" opacity={0.3} />
        </div>
      </>
    ),
  },
  {
    id: "bulk",
    title: "Bulk Issuance Engine",
    subtitle: "Scale",
    tone: "sky",
    description:
      "Issue thousands of certificates or invitations in minutes. Upload a CSV list, map your columns, and let our engine handle the rest. We generate, sign, and email credentials automatically in the background.",
    icon: Stack,
    image: "/images/landing_page_image/bulk_creation.png",
    benefits: [
      "One-click CSV/Excel upload",
      "Automatic attribute mapping",
      "Background processing for large batches",
    ],
    decor: (
      <QrFragment
        size={170}
        color="#0A9AF5"
        opacity={0.22}
        className="absolute -bottom-8 -right-8"
      />
    ),
  },
  {
    id: "analytics",
    title: "Visual & Real-Time Analytics",
    subtitle: "Insights",
    tone: "orange",
    description:
      "Gain insights into your credentialing program. Track issuance rates, recipient engagement, and platform sharing metrics with our real-time analytics dashboard.",
    icon: ChartLineUp,
    image: "/images/landing_page_image/analytics.png",
    benefits: [
      "Track email open & bounce rates",
      "Monitor certification performance",
      "Visual growth charts & exports",
    ],
    decor: (
      <Swirl
        size={190}
        strokeWidth={20}
        color="#F97316"
        className="absolute -bottom-10 -right-10 opacity-22"
      />
    ),
  },
  {
    id: "verify",
    title: "Instant Verification",
    subtitle: "Trust",
    tone: "green",
    description:
      "Every credential comes with a unique, tamper-proof verification page. Third parties can instantly verify authenticity by scanning a QR code or visiting the secure URL.",
    icon: ShieldCheck,
    image: "/images/landing_page_image/verification.png",
    benefits: [
      "Unique QR code per certificate",
      "Public verification pages",
      "Bank-grade fraud protection",
    ],
    decor: (
      <Seal
        size={180}
        color="#16A34A"
        opacity={0.26}
        className="absolute -bottom-10 -right-10"
      />
    ),
  },
  {
    id: "api",
    title: "Developer API Integration",
    subtitle: "Integration",
    tone: "ink",
    description:
      "Connect ProofDeck directly to your LMS, HR tool, or payment gateway using our REST API. Automate generation and trigger webhooks upon successful delivery.",
    icon: Code,
    image: "/images/landing_page_image/api-integration.png",
    benefits: [
      "Easy-to-use REST API endpoints",
      "Real-time webhook updates",
      "Comprehensive developer documentation",
    ],
    decor: (
      <Ring
        size={220}
        strokeWidth={24}
        color="#0B0B14"
        className="absolute -bottom-10 -right-10 opacity-12"
      />
    ),
  },
];

const TONE_SURFACES = {
  indigo: "bg-[#E9E7FD]/80",
  sky: "bg-[#DDF1FD]/80",
  orange: "bg-[#FFE3CC]/75",
  green: "bg-[#DDF5E6]/75",
  ink: "bg-[#F1F1F5]/85",
};

const FeatureCard = ({ feature, index }) => {
  const topOffset = 80 + index * 30;
  const toneBg = TONE_SURFACES[feature.tone] || "bg-white";

  return (
    <div
      className="sticky mb-8 last:mb-0"
      style={{ top: `${topOffset}px` }}
    >
      <motion.div
        className="bg-white rounded-2xl sm:rounded-3xl border border-[#E6E4ED] shadow-sm overflow-hidden"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.4 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 items-stretch">
          {/* Left Column: Text Content with Tone Surface and Credential Motif (§5.2) */}
          <div className={`p-6 sm:p-8 md:p-12 flex flex-col justify-center relative overflow-hidden ${toneBg}`}>
            {/* Tone-on-tone decorative ambient shape */}
            <div className="absolute inset-0 pointer-events-none select-none z-0" aria-hidden="true">
              {feature.decor}
            </div>

            <div className="relative z-10">
              <div className="mb-4 sm:mb-5">
                <Tag tone={feature.tone} icon={feature.icon}>
                  {feature.subtitle}
                </Tag>
              </div>

              <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-[#15131F] mb-3 sm:mb-4 leading-tight tracking-tight">
                {feature.title}
              </h3>

              <p className="text-[#68647A] leading-relaxed mb-5 sm:mb-6 text-sm md:text-[15px] font-medium">
                {feature.description}
              </p>

              <ul className="space-y-2.5 sm:space-y-3">
                {feature.benefits.map((benefit, i) => (
                  <li key={i} className="flex items-center gap-3 text-[#15131F]">
                    <CheckBadge tone={feature.tone} size={20} />
                    <span className="text-sm font-semibold">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column: Visual Preview Cover (Flat surface, no gradients) */}
          <div className="relative overflow-hidden bg-[#FAFAF9] border-t md:border-t-0 md:border-l border-[#E6E4ED] p-4 sm:p-6 md:p-0 min-h-[200px] sm:min-h-[260px] md:min-h-[380px] flex items-center justify-center">
            {feature.image ? (
              <>
                {/* Mobile Preview Frame */}
                <div className="w-full md:hidden relative rounded-xl sm:rounded-2xl overflow-hidden shadow-lg border border-[#E0DDF0] bg-white">
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="w-full h-auto max-h-[240px] sm:max-h-[300px] object-cover object-top"
                    loading="lazy"
                  />
                </div>

                {/* Desktop Full Cover */}
                <img
                  src={feature.image}
                  alt={feature.title}
                  className="hidden md:block absolute inset-0 w-full h-full object-cover transform hover:scale-102 transition-transform duration-500 object-left-top"
                />
              </>
            ) : (
              <div className="flex items-center justify-center p-6 sm:p-8 w-full">
                <span className="text-xs font-semibold text-[var(--pd-mute)]">Preview unavailable</span>
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
    <section className="py-20 md:py-28 bg-[var(--pd-paper)] border-b border-[var(--pd-line)] relative pd-dot-grid" id="features">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
          <div className="mb-3">
            <Tag tone="indigo">Features</Tag>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[var(--pd-ink)] tracking-tight leading-tight mb-4">
            Everything you need to automate credentials
          </h2>
          <p className="text-base sm:text-lg text-[var(--pd-mute)] leading-relaxed max-w-2xl mx-auto">
            From visual template creation to bulk distribution and instant verification.
          </p>
        </div>

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
