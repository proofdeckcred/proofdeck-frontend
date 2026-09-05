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
            STICKER 3: Bottom-Left (Live Batches Card)
            Matches ChronoTask Image 1 bottom-left tasks card
           ======================================================== */}
        <motion.div
          className="hidden xl:block absolute bottom-28 left-2 xl:left-4 z-20 pointer-events-none select-none"
          initial={{ opacity: 0, y: 20, rotate: 1 }}
          animate={{ opacity: 1, y: 0, rotate: 3 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div 
            className="bg-white rounded-2xl p-5 w-[230px] xl:w-[250px] border border-[var(--pd-line)] text-left"
            style={{ boxShadow: "0 14px 30px -8px rgba(11,11,18,0.14)" }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-[var(--pd-ink)]">Recent Batches</span>
              <span className="text-[10px] font-bold text-[var(--pd-indigo)] bg-indigo-50 px-2 py-0.5 rounded-full">
                Active
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-[11px] mb-1 font-medium">
                  <span className="text-[var(--pd-ink)] font-semibold truncate">AI Cohort 2026</span>
                  <span className="text-emerald-600 font-bold">100%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[var(--pd-indigo)] rounded-full w-full"></div>
                </div>
                <span className="text-[9px] text-[var(--pd-mute)]">140 / 140 issued</span>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1 font-medium">
                  <span className="text-[var(--pd-ink)] font-semibold truncate">Design Masterclass</span>
                  <span className="text-emerald-600 font-bold">100%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[var(--pd-indigo)] rounded-full w-full"></div>
                </div>
                <span className="text-[9px] text-[var(--pd-mute)]">45 / 45 issued</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ========================================================
            STICKER 4: Bottom-Right (1-Click Integrations Card)
            Matches ChronoTask Image 1 bottom-right 100+ Integrations card
           ======================================================== */}
        <motion.div
          className="hidden xl:block absolute bottom-28 right-2 xl:right-4 z-20 pointer-events-none select-none"
          initial={{ opacity: 0, y: 20, rotate: -2 }}
          animate={{ opacity: 1, y: 0, rotate: -4 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div 
            className="bg-white rounded-2xl p-5 w-[240px] xl:w-[260px] border border-[var(--pd-line)] text-left"
            style={{ boxShadow: "0 14px 30px -8px rgba(11,11,18,0.14)" }}
          >
            <div className="mb-3">
              <span className="text-[11px] font-bold text-[var(--pd-ink)]">1-Click Sharing & APIs</span>
            </div>

            <div className="flex items-center justify-between gap-2 pt-1">
              {/* LinkedIn Tile */}
              <div className="flex-1 flex flex-col items-center p-2.5 rounded-xl bg-white border border-[var(--pd-line)] shadow-2xs">
                <div className="w-8 h-8 rounded-lg bg-[#0A66C2] flex items-center justify-center text-white mb-1">
                  <Linkedin size={16} />
                </div>
                <span className="text-[9px] font-bold text-[var(--pd-ink)]">LinkedIn</span>
              </div>

              {/* Email Delivery Tile */}
              <div className="flex-1 flex flex-col items-center p-2.5 rounded-xl bg-white border border-[var(--pd-line)] shadow-2xs">
                <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center mb-1 border border-red-100">
                  <Mail size={16} />
                </div>
                <span className="text-[9px] font-bold text-[var(--pd-ink)]">Email</span>
              </div>

              {/* REST API Tile */}
              <div className="flex-1 flex flex-col items-center p-2.5 rounded-xl bg-white border border-[var(--pd-line)] shadow-2xs">
                <div className="w-8 h-8 rounded-lg bg-[var(--pd-ink)] text-emerald-400 flex items-center justify-center mb-1">
                  <Code size={16} />
                </div>
                <span className="text-[9px] font-bold text-[var(--pd-ink)]">REST API</span>
              </div>
            </div>
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
            CENTERPIECE: Dashboard Mockup
            Beautifully framed, crisp card container with subtle shadow
           ======================================================== */}
        <motion.div
          className="relative mt-12 sm:mt-16 w-full max-w-5xl mx-auto"
          initial={{ opacity: 0, y: 35, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          <div 
            className="rounded-2xl sm:rounded-3xl p-2 sm:p-3.5 bg-white/80 backdrop-blur-xs border border-[var(--pd-line)] relative z-10"
            style={{ boxShadow: "0 25px 65px -15px rgba(11,11,18,0.16)" }}
          >
            <div className="rounded-xl sm:rounded-2xl overflow-hidden border border-gray-100 max-h-[440px] sm:max-h-[560px] md:max-h-[620px]">
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
