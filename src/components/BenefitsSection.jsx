import React from "react";
import { motion } from "motion/react";

export function BenefitsSection() {
  const steps = [
    {
      id: "design",
      stepNumber: "01 / 04",
      title: "Design certificates in minutes",
      subtitle: "Drag & Drop Designer",
      image: "/images/features-page/canva.png",
      description:
        "Choose from beautiful pre-made templates or start with a blank canvas. Easily add your company logo, recipient names, course details, and authorized signatures without needing a designer.",
      features: [
        "Pick from polished, ready-to-use certificate designs",
        "Easily customize fonts, brand colors, seals, and signatures",
        "Download high-resolution print-ready PDFs or send digitally",
      ],
      detail: "No graphic design experience required—customize in just a few clicks.",
    },
    {
      id: "bulk",
      stepNumber: "02 / 04",
      title: "Create hundreds in a single click",
      subtitle: "Bulk Excel & CSV Import",
      image: "/images/landing_page_image/bulk_creation.png",
      description:
        "Issuing certificates for an entire graduating class or conference? Simply upload your Excel spreadsheet. ProofDeck automatically generates personalized credentials for all recipients at once.",
      features: [
        "Upload your Excel or CSV list of recipient names",
        "Automatically fills in each person's name, date, and award title",
        "Generate hundreds of certificates in seconds with zero manual typing",
      ],
      detail: "Say goodbye to copying and pasting names one by one.",
    },
    {
      id: "analytics",
      stepNumber: "03 / 04",
      title: "Deliver straight to recipient inboxes",
      subtitle: "Automated Email Delivery",
      image: "/images/features-page/analytics.png",
      description:
        "Send certificates directly to recipients' email inboxes with your personalized message. Keep track of who received their certificate, who opened it, and who downloaded their copy.",
      features: [
        "Automatic email delivery with your custom message and branding",
        "See in real time when recipients open and view their certificate",
        "Easily resend with one click if someone ever misplaces their email",
      ],
      detail: "Know with certainty that every recipient received their credential.",
    },
    {
      id: "linkedin",
      stepNumber: "04 / 04",
      title: "Prove authenticity & share to LinkedIn",
      subtitle: "Instant QR Verification",
      image: "/images/features-page/proofdeck-share-to-linkedin.png",
      description:
        "Each certificate includes a unique QR code. Anyone can scan it with a smartphone to instantly verify it is 100% genuine. Recipients can also showcase their achievement on LinkedIn with a single click.",
      features: [
        "Unique QR code on every certificate for instant phone scanning",
        "1-click 'Add to Profile' for LinkedIn Licenses & Certifications",
        "Protects your organization and graduates from fake or forged copies",
      ],
      detail: "Empower your recipients to showcase verified achievements to employers.",
    },
  ];

  return (
    <section className="py-24 md:py-32 bg-[var(--pd-paper)] border-t border-b border-[var(--pd-line)] relative pd-dot-grid">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
          <span className="pd-pill-label mb-3 inline-flex">How ProofDeck Works</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--pd-ink)] tracking-tight leading-tight mb-4">
            Simple, automated credentials from start to finish
          </h2>
          <p className="text-base sm:text-lg text-[var(--pd-mute)] leading-relaxed max-w-2xl mx-auto">
            From picking a template to sending bulk certificates and instant verification, ProofDeck takes the hassle out of credentialing.
          </p>
        </div>

        {/* ========================================================
            STICKY STACKING WORKFLOW CARDS:
            Each card sticks to top with offset, creating layered deck motion.
            Alternating layout:
              - Card 0: Text Left / Image Right
              - Card 1: Image Left / Text Right
              - Card 2: Text Left / Image Right
              - Card 3: Image Left / Text Right
           ======================================================== */}
        <div className="relative">
          {steps.map((step, index) => {
            const isReversed = index % 2 === 1;
            const topOffset = 80 + index * 24;

            return (
              <div
                key={step.id}
                className="sticky mb-10 last:mb-0"
                style={{ top: `${topOffset}px` }}
              >
                <div 
                  className="bg-white rounded-3xl border border-[var(--pd-line)] p-6 sm:p-8 md:p-10 shadow-xl"
                  style={{ boxShadow: "0 20px 40px -15px rgba(11,11,18,0.08)" }}
                >
                  <div
                    className={`grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center ${
                      isReversed ? "lg:grid-flow-dense" : ""
                    }`}
                  >
                    {/* TEXT CONTENT COLUMN */}
                    <div
                      className={`space-y-5 text-left ${
                        isReversed ? "lg:col-span-5 lg:col-start-8" : "lg:col-span-5"
                      }`}
                    >
                      <div className="flex items-center justify-between border-b border-[var(--pd-line)] pb-3">
                        <span className="text-xs font-mono font-bold text-[var(--pd-ink)]">
                          {step.stepNumber}
                        </span>
                        <span className="text-xs font-semibold text-[var(--pd-indigo)] bg-[var(--pd-paper)] px-2.5 py-1 rounded-full border border-[var(--pd-line)]">
                          {step.subtitle}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-2xl sm:text-3xl font-bold text-[var(--pd-ink)] tracking-tight mb-3">
                          {step.title}
                        </h3>
                        <p className="text-sm sm:text-base text-[var(--pd-mute)] leading-relaxed">
                          {step.description}
                        </p>
                      </div>

                      {/* Clean bullet items with dot indicator (no circle checkmarks) */}
                      <ul className="space-y-2.5 pt-1">
                        {step.features.map((feat, i) => (
                          <li
                            key={i}
                            className="text-sm text-[var(--pd-ink)] flex items-start gap-3"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--pd-indigo)] shrink-0 mt-2" />
                            <span className="leading-relaxed font-medium">{feat}</span>
                          </li>
                        ))}
                      </ul>

                      {/* Real one-line detail specific to this step */}
                      <div className="pt-2 border-t border-[var(--pd-line)]">
                        <p className="text-xs text-[var(--pd-mute)] font-medium">
                          {step.detail}
                        </p>
                      </div>
                    </div>

                    {/* VIBRANT BLUE SHOWCASE IMAGE PANEL — alternating side */}
                    <div
                      className={`${
                        isReversed ? "lg:col-span-7 lg:col-start-1" : "lg:col-span-7"
                      }`}
                    >
                      <div
                        className="rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 relative overflow-hidden shadow-xl"
                        style={{
                          background: "linear-gradient(180deg, #00A3FF 0%, #0284C7 100%)",
                        }}
                      >
                        {/* Crisp white rounded frame holding the authentic screenshot */}
                        <div className="relative rounded-xl sm:rounded-2xl overflow-hidden bg-white shadow-2xl border border-white/25">
                          <img
                            src={step.image}
                            alt={step.title}
                            className="w-full h-auto object-cover object-top"
                          />
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

export default BenefitsSection;
