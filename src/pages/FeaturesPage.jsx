import React from "react";
import { Link } from "react-router-dom";
import PublicHeader from "../components/PublicHeader";
import PublicFooter from "../components/PublicFooter";
import { ShieldCheck, Layers, Award, Check } from "lucide-react";
import { motion } from "motion/react";

export default function FeaturesPage() {
  return (
    <div className="bg-white font-sans text-[var(--pd-ink)] min-h-screen flex flex-col selection:bg-[var(--pd-indigo)] selection:text-white">
      <PublicHeader />

      <main className="flex-grow">
        {/* SECTION 1: SOLUTIONS (Matches top half of Image 1) */}
        <section className="py-20 md:py-28 bg-[var(--pd-paper)] border-b border-[var(--pd-line)] pd-dot-grid relative overflow-hidden">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            
            {/* Pill label */}
            <div className="mb-4">
              <span className="pd-pill-label">Solutions</span>
            </div>

            {/* Section Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--pd-ink)] tracking-tight max-w-3xl mx-auto mb-12 sm:mb-16 leading-[1.15]">
              Solve your team's biggest challenges
            </h1>

            {/* 3-Up Value Props */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-14 text-center md:text-left">
              <div className="space-y-2.5">
                <div className="w-8 h-8 rounded-lg bg-white border border-[var(--pd-line)] flex items-center justify-center mx-auto md:mx-0 shadow-2xs">
                  <ShieldCheck size={18} className="text-[var(--pd-indigo)]" />
                </div>
                <h3 className="font-bold text-sm text-[var(--pd-ink)]">Tamper-Proof Verification</h3>
                <p className="text-xs sm:text-sm text-[var(--pd-mute)] leading-relaxed font-normal">
                  Ensure your team and recipients are always on the same page with real-time verification and transparent credential ledgers.
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="w-8 h-8 rounded-lg bg-white border border-[var(--pd-line)] flex items-center justify-center mx-auto md:mx-0 shadow-2xs">
                  <Layers size={18} className="text-[var(--pd-indigo)]" />
                </div>
                <h3 className="font-bold text-sm text-[var(--pd-ink)]">Automate Issuance at Scale</h3>
                <p className="text-xs sm:text-sm text-[var(--pd-mute)] leading-relaxed font-normal">
                  Prioritize and automate bulk issuing effectively so your organization can focus on what matters most.
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="w-8 h-8 rounded-lg bg-white border border-[var(--pd-line)] flex items-center justify-center mx-auto md:mx-0 shadow-2xs">
                  <Award size={18} className="text-[var(--pd-indigo)]" />
                </div>
                <h3 className="font-bold text-sm text-[var(--pd-ink)]">Boost Organic Credibility</h3>
                <p className="text-xs sm:text-sm text-[var(--pd-mute)] leading-relaxed font-normal">
                  Hold credentials accountable without the need for manual confirmation calls or slow paperwork checks.
                </p>
              </div>
            </div>

            {/* Blue/Indigo Panel with floating mockup & stickers */}
            <div className="relative max-w-5xl mx-auto">
              <div 
                className="rounded-3xl sm:rounded-[32px] p-4 sm:p-8 md:p-12 relative overflow-hidden bg-[#00A3FF] shadow-2xl"
                style={{
                  background: "linear-gradient(180deg, #00A3FF 0%, #0284C7 100%)"
                }}
              >
                {/* Floating Badge 1 (Left - sticker '20k+') */}
                <motion.div 
                  className="hidden sm:flex absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-20 bg-white rounded-2xl p-3 sm:p-4 shadow-xl border border-white/40 flex-col items-center justify-center"
                  style={{ transform: "rotate(-8deg)" }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <span className="text-2xl sm:text-3xl font-bold text-[var(--pd-ink)] tracking-tight">20k+</span>
                  <span className="text-[10px] font-medium text-[var(--pd-mute)] uppercase tracking-wider mt-0.5">Credentials</span>
                </motion.div>

                {/* Floating Badge 2 (Right - checkmark pill sticker) */}
                <motion.div 
                  className="hidden sm:flex absolute right-4 sm:right-6 top-1/3 z-20 bg-white rounded-2xl p-3 sm:p-4 shadow-xl border border-white/40 items-center gap-2"
                  style={{ transform: "rotate(6deg)" }}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                    <Check size={16} className="text-emerald-600 stroke-[3]" />
                  </div>
                  <span className="text-xs font-bold text-[var(--pd-ink)]">Verified</span>
                </motion.div>

                {/* Center Dashboard Mockup */}
                <div className="relative rounded-xl sm:rounded-2xl overflow-hidden bg-white shadow-2xl border border-white/20">
                  <img
                    src="/images/features-page/dashboard.png"
                    alt="ProofDeck Solutions Dashboard"
                    className="w-full h-auto object-cover"
                  />
                </div>
              </div>
            </div>

          </div>
        </section>


        {/* SECTION 2: FEATURES (Matches bottom half of Image 1) */}
        <section className="py-20 md:py-28 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

            {/* Pill label */}
            <div className="text-center mb-3">
              <span className="pd-pill-label">Features</span>
            </div>

            {/* Heading & Subtitle */}
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--pd-ink)] tracking-tight mb-4">
                Keep everything in one place
              </h2>
              <p className="text-base sm:text-lg text-[var(--pd-mute)] leading-relaxed">
                Forget complex spreadsheets, manual PDF editing, and unverified credentials.
              </p>
            </div>

            {/* 4-Card Feature Grid (2x2 layout strictly following Image 1) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-14 items-stretch">

              {/* CARD 1: Seamless Collaboration (Top Left) */}
              <div 
                className="bg-white rounded-2xl sm:rounded-3xl border border-[var(--pd-line)] p-6 sm:p-8 flex flex-col justify-between transition-all hover:border-[var(--pd-indigo)]/40 group"
                style={{ boxShadow: "var(--pd-shadow)" }}
              >
                <div className="bg-[#F7F7FA] rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-[var(--pd-line)] mb-6 overflow-hidden flex items-center justify-center min-h-[220px] sm:min-h-[260px] group-hover:bg-[#F3F2FC] transition-colors">
                  <img
                    src="/images/features-page/invite-team.png"
                    alt="Seamless Collaboration"
                    className="w-full h-auto max-h-[280px] object-contain rounded-lg shadow-sm"
                  />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-[var(--pd-ink)] mb-2">
                    Seamless Collaboration
                  </h3>
                  <p className="text-sm text-[var(--pd-mute)] leading-relaxed">
                    Work together with your team effortlessly, share templates, invite staff, and manage issuance roles in real-time.
                  </p>
                </div>
              </div>

              {/* CARD 2: Real-Time Analytics (Top Right) */}
              <div 
                className="bg-white rounded-2xl sm:rounded-3xl border border-[var(--pd-line)] p-6 sm:p-8 flex flex-col justify-between transition-all hover:border-[var(--pd-indigo)]/40 group"
                style={{ boxShadow: "var(--pd-shadow)" }}
              >
                <div className="bg-[#F7F7FA] rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-[var(--pd-line)] mb-6 overflow-hidden flex items-center justify-center min-h-[220px] sm:min-h-[260px] group-hover:bg-[#F3F2FC] transition-colors">
                  <img
                    src="/images/features-page/analytics.png"
                    alt="Time Management Tools & Analytics"
                    className="w-full h-auto max-h-[280px] object-contain rounded-lg shadow-sm"
                  />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-[var(--pd-ink)] mb-2">
                    Real-Time Analytics & Tracking
                  </h3>
                  <p className="text-sm text-[var(--pd-mute)] leading-relaxed">
                    Gain actionable insights into recipient engagement, delivery rates, verification scans, and credential program growth.
                  </p>
                </div>
              </div>

              {/* CARD 3: 1-Click LinkedIn Sharing (Bottom Left) */}
              <div 
                className="bg-white rounded-2xl sm:rounded-3xl border border-[var(--pd-line)] p-6 sm:p-8 flex flex-col justify-between transition-all hover:border-[var(--pd-indigo)]/40 group"
                style={{ boxShadow: "var(--pd-shadow)" }}
              >
                <div className="bg-[#F7F7FA] rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-[var(--pd-line)] mb-6 overflow-hidden flex items-center justify-center min-h-[220px] sm:min-h-[260px] group-hover:bg-[#F3F2FC] transition-colors">
                  <img
                    src="/images/features-page/proofdeck-share-to-linkedin.png"
                    alt="1-Click LinkedIn and Social Sharing"
                    className="w-full h-auto max-h-[280px] object-contain rounded-lg shadow-sm"
                  />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-[var(--pd-ink)] mb-2">
                    1-Click LinkedIn & Social Verification
                  </h3>
                  <p className="text-sm text-[var(--pd-mute)] leading-relaxed">
                    Recipients add verified credentials directly to their LinkedIn Licenses & Certifications with automated issuer verification.
                  </p>
                </div>
              </div>

              {/* CARD 4: Visual Template Designer (Bottom Right) */}
              <div 
                className="bg-white rounded-2xl sm:rounded-3xl border border-[var(--pd-line)] p-6 sm:p-8 flex flex-col justify-between transition-all hover:border-[var(--pd-indigo)]/40 group"
                style={{ boxShadow: "var(--pd-shadow)" }}
              >
                <div className="bg-[#F7F7FA] rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-[var(--pd-line)] mb-6 overflow-hidden flex items-center justify-center min-h-[220px] sm:min-h-[260px] group-hover:bg-[#F3F2FC] transition-colors">
                  <img
                    src="/images/features-page/canva.png"
                    alt="Customizable Template Designer"
                    className="w-full h-auto max-h-[280px] object-contain rounded-lg shadow-sm"
                  />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-[var(--pd-ink)] mb-2">
                    Customizable Template Designer
                  </h3>
                  <p className="text-sm text-[var(--pd-mute)] leading-relaxed">
                    Build and customize certificates with dynamic recipient tags, custom signatures, official logos, and high-resolution PDF exports.
                  </p>
                </div>
              </div>

            </div>

            {/* "and a lot more features..." & CTA */}
            <div className="text-center pt-4">
              <p className="text-sm font-medium text-[var(--pd-mute)] mb-6">
                and a lot more features...
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/signup"
                  className="inline-flex items-center justify-center px-8 py-3.5 rounded-full text-sm font-medium text-white bg-[var(--pd-indigo)] hover:bg-[var(--pd-indigo-dark)] transition-colors no-underline shadow-sm"
                >
                  Get started
                </Link>
                <Link
                  to="/docs"
                  className="inline-flex items-center justify-center px-8 py-3.5 rounded-full text-sm font-medium text-[var(--pd-ink)] bg-white border border-[var(--pd-line)] hover:bg-[var(--pd-paper)] transition-colors no-underline"
                >
                  Explore Developer API
                </Link>
              </div>
            </div>

          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
