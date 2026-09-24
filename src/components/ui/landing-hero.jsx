import React from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { 
  Check, 
  Award, 
  Linkedin, 
  Mail, 
  Code 
} from "lucide-react";

export function LandingHero() {
  return (
    <section className="relative overflow-hidden pd-dot-grid pt-16 sm:pt-20 pb-20 sm:pb-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        
        {/* ========================================================
            STICKER 1: Top-Left (Yellow Sticky Note + Blue Check Tile)
            Matches ChronoTask Image 1 top-left note
           ======================================================== */}
        <motion.div
          className="hidden lg:block absolute top-10 xl:top-14 left-2 xl:left-6 z-20 pointer-events-none select-none"
          initial={{ opacity: 0, y: -20, rotate: -8 }}
          animate={{ opacity: 1, y: 0, rotate: -6 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="relative">
            {/* Sticky Note */}
            <div 
              className="bg-[#FEF08A] text-[#713F12] p-5 rounded-sm w-[210px] xl:w-[230px] border border-amber-300/40 relative text-left"
              style={{ boxShadow: "0 10px 25px -5px rgba(11,11,18,0.12)" }}
            >
              {/* Red Pushpin */}
              <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-30">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="drop-shadow-sm">
                  <circle cx="12" cy="10" r="5" fill="#EF4444" />
                  <circle cx="10" cy="8" r="1.5" fill="#FCA5A5" />
                  <path d="M12 15 L12 21" stroke="#991B1B" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>

              <p className="text-[12px] font-medium leading-relaxed font-sans pt-1 text-[#854D0E]">
                Issue tamper-proof credentials in seconds. Automate delivery and verify certificates with zero paperwork.
              </p>
            </div>

            {/* Overlapping Floating Blue Checkmark Tile */}
            <motion.div
              className="absolute -bottom-5 -right-4 w-12 h-12 rounded-xl bg-white flex items-center justify-center border border-black/5"
              style={{ 
                boxShadow: "0 12px 24px -4px rgba(11,11,18,0.18)",
                transform: "rotate(6deg)"
              }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <div className="w-8 h-8 rounded-lg bg-[var(--pd-indigo)] flex items-center justify-center text-white">
                <Check size={18} className="stroke-[3]" />
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* ========================================================
            STICKER 2: Top-Right (Verified Credential Folder + Award Badge)
            Matches ChronoTask Image 1 top-right reminders card
           ======================================================== */}
        <motion.div
          className="hidden lg:block absolute top-10 xl:top-14 right-2 xl:right-6 z-20 pointer-events-none select-none"
          initial={{ opacity: 0, y: -20, rotate: 7 }}
          animate={{ opacity: 1, y: 0, rotate: 5 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="relative">
            {/* Card Container */}
            <div 
              className="bg-white rounded-2xl p-5 w-[240px] xl:w-[260px] border border-[var(--pd-line)] text-left relative"
              style={{ boxShadow: "0 14px 30px -8px rgba(11,11,18,0.14)" }}
            >
              <div className="flex items-center justify-between border-b border-[var(--pd-line)] pb-2.5 mb-3">
                <span className="text-[11px] font-bold text-[var(--pd-ink)] tracking-tight">Verified Credential</span>
                <span className="text-[10px] font-mono text-[var(--pd-mute)]">#PD-8492</span>
              </div>

              <div className="space-y-1.5">
                <p className="text-xs font-bold text-[var(--pd-ink)]">Full-Stack Development</p>
                <p className="text-[11px] text-[var(--pd-mute)]">Jane Doe · ProofDeck Academy</p>
                <div className="pt-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Authentic & Valid
                  </span>
                </div>
              </div>
            </div>

            {/* Overlapping Floating Award Badge */}
            <motion.div
              className="absolute -top-3.5 -left-3.5 w-11 h-11 rounded-xl bg-white flex items-center justify-center border border-black/5"
              style={{ 
                boxShadow: "0 10px 20px -4px rgba(11,11,18,0.16)",
                transform: "rotate(-10deg)"
              }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center text-[var(--pd-amber)]">
                <Award size={16} className="stroke-[2.5]" />
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* ========================================================
            CENTER CONTENT: Headline, Subtitle, CTA & Stats
           ======================================================== */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto pt-4 sm:pt-8 pb-4">
          
          {/* Headline (Line 1 in ink, Line 2 in muted gray, exactly like Image 1) */}
          <motion.h1
            className="text-4xl sm:text-5xl lg:text-[3.85rem] font-bold tracking-tight leading-[1.12] mb-5"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <span className="text-[var(--pd-ink)] block">
              Issue, verify, and track
            </span>
            <span className="text-[#9CA3AF] block font-semibold">
              all in one place
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            className="text-sm sm:text-base text-[var(--pd-mute)] max-w-lg mx-auto leading-relaxed mb-7"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Effortlessly issue tamper-proof digital credentials, prevent fraud, and boost organization credibility.
          </motion.p>

          {/* Primary CTA button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <Link
              to="/signup"
              className="inline-flex items-center justify-center h-11 px-8 rounded-full text-sm font-medium text-white bg-[var(--pd-indigo)] hover:bg-[var(--pd-indigo-dark)] transition-colors shadow-sm no-underline cursor-pointer"
            >
              Get started
            </Link>
          </motion.div>

          {/* Micro Stats (500+ Certs Verified) */}
          <motion.div
            className="flex items-center justify-center gap-6 sm:gap-8 pt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div>
              <p className="text-xl font-bold text-[var(--pd-ink)] tabular-nums">10+</p>
              <p className="text-[11px] font-medium text-[var(--pd-mute)]">Companies</p>
            </div>
            <div className="w-px h-6 bg-[var(--pd-line)]"></div>
            <div>
              <p className="text-xl font-bold text-[var(--pd-ink)] tabular-nums">500+</p>
              <p className="text-[11px] font-medium text-[var(--pd-mute)]">Certs Verified</p>
            </div>
            <div className="w-px h-6 bg-[var(--pd-line)]"></div>
            <div>
              <p className="text-xl font-bold text-[var(--pd-ink)] tabular-nums">99.9%</p>
              <p className="text-[11px] font-medium text-[var(--pd-mute)]">Uptime</p>
            </div>
          </motion.div>
        </div>

        {/* ========================================================
            CENTERPIECE: Dashboard Mockup + 2 Floating Cards
            Vibrant blue showcase container matching Image 3
           ======================================================== */}
        <motion.div
          className="relative mt-12 sm:mt-16 w-full max-w-5xl mx-auto"
          initial={{ opacity: 0, y: 35, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          {/* Floating Card 1: Recent Batches (Left) */}
          <motion.div
            className="hidden sm:block absolute -left-4 md:-left-8 lg:-left-12 bottom-12 md:bottom-20 z-20 pointer-events-none select-none"
            initial={{ opacity: 0, x: -30, rotate: -4 }}
            animate={{ opacity: 1, x: 0, rotate: -2 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <div 
              className="bg-white rounded-2xl md:rounded-3xl p-4 sm:p-5 w-[230px] sm:w-[260px] md:w-[280px] border border-slate-100/90 shadow-2xl shadow-slate-900/10"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs sm:text-sm font-bold text-slate-900">
                  Recent Batches
                </span>
                <span className="text-[10px] sm:text-xs font-semibold px-2 sm:px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100">
                  Active
                </span>
              </div>

              <div className="space-y-4">
                {/* Batch 1 */}
                <div>
                  <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-slate-800 mb-1.5">
                    <span>AI Cohort 2026</span>
                    <span className="text-indigo-600 font-extrabold text-xs">100%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-1">
                    <div className="h-full bg-indigo-600 rounded-full w-full"></div>
                  </div>
                  <div className="text-[10px] sm:text-[11px] font-medium text-slate-400">
                    140 / 140 Issued
                  </div>
                </div>

                {/* Batch 2 */}
                <div>
                  <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-slate-800 mb-1.5">
                    <span>Design Masterclass</span>
                    <span className="text-indigo-600 font-extrabold text-xs">100%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-1">
                    <div className="h-full bg-indigo-600 rounded-full w-full"></div>
                  </div>
                  <div className="text-[10px] sm:text-[11px] font-medium text-slate-400">
                    45 / 45 Issued
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Floating Card 2: 1-Click Sharing & APIs (Right) */}
          <motion.div
            className="hidden sm:block absolute -right-4 md:-right-8 lg:-right-12 bottom-6 md:bottom-12 z-20 pointer-events-none select-none"
            initial={{ opacity: 0, x: 30, rotate: 4 }}
            animate={{ opacity: 1, x: 0, rotate: 2 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <div 
              className="bg-white rounded-2xl md:rounded-3xl p-4 sm:p-6 w-[230px] sm:w-[260px] md:w-[280px] border border-slate-100/90 shadow-2xl shadow-slate-900/10 text-center"
            >
              <div className="text-xs sm:text-sm font-bold text-slate-900 mb-4">
                1-Click Sharing & APIs
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {/* LinkedIn */}
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl border border-slate-100 bg-slate-50/50 flex items-center justify-center shadow-xs hover:border-slate-200 transition-colors">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#0077b5] flex items-center justify-center text-white shadow-xs">
                      <Linkedin size={16} className="fill-current" />
                    </div>
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-medium text-slate-600 mt-1.5">
                    Linkedin
                  </span>
                </div>

                {/* Email */}
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl border border-slate-100 bg-slate-50/50 flex items-center justify-center shadow-xs hover:border-slate-200 transition-colors">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center text-red-500 shadow-xs">
                      <Mail size={16} className="stroke-[2.2]" />
                    </div>
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-medium text-slate-600 mt-1.5">
                    Email
                  </span>
                </div>

                {/* REST API */}
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl border border-slate-100 bg-slate-50/50 flex items-center justify-center shadow-xs hover:border-slate-200 transition-colors">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white shadow-xs">
                      <Code size={16} className="stroke-[2.5]" />
                    </div>
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-medium text-slate-600 mt-1.5">
                    REST API
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          <div 
            className="rounded-3xl sm:rounded-[32px] p-4 sm:p-8 md:p-12 relative overflow-hidden shadow-2xl"
            style={{
              background: "linear-gradient(180deg, #00A3FF 0%, #0284C7 100%)"
            }}
          >
            {/* Center Dashboard Mockup */}
            <div className="relative rounded-xl sm:rounded-2xl overflow-hidden bg-white shadow-2xl border border-white/20">
              <img
                src="/images/features-page/dashboard.png"
                alt="ProofDeck Dashboard Mockup"
                className="w-full h-auto object-cover object-top"
              />
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
