import React from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import {
  Check,
  SealCheck,
  Medal,
  Buildings,
  Pulse,
  EnvelopeSimple,
  Code,
} from "@phosphor-icons/react";
import IconBadge from "./IconBadge";
import BrandIcon from "./BrandIcon";
import {
  Ring,
  Seal,
  DotGrid,
  TapeStrip,
  CertCorner,
  GuillocheRosette,
  GuillocheWaveBand,
  Guilloche,
} from "./decor";

export function LandingHero() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden pd-dot-grid pt-14 sm:pt-18 pb-20 sm:pb-28 z-0">
      {/* ========================================================
          DIPLOMA CORNER FLOURISHES (ADD §1)
          Four ornate double-line corner brackets with inner scroll curl
          Inset 20-28px, indigo-tint at ~14% visibility
         ======================================================== */}
      <div className="absolute top-5 sm:top-7 left-5 sm:left-7 z-0 pointer-events-none select-none" aria-hidden="true">
        <CertCorner className="w-7 h-7 sm:w-10 sm:h-10 lg:w-14 lg:h-14" color="#5144E8" opacity={0.14} />
      </div>
      <div className="absolute top-5 sm:top-7 right-5 sm:right-7 z-0 pointer-events-none select-none" aria-hidden="true">
        <CertCorner className="w-7 h-7 sm:w-10 sm:h-10 lg:w-14 lg:h-14 -scale-x-100" color="#5144E8" opacity={0.14} />
      </div>
      <div className="absolute bottom-5 sm:bottom-7 left-5 sm:left-7 z-0 pointer-events-none select-none" aria-hidden="true">
        <CertCorner className="w-7 h-7 sm:w-10 sm:h-10 lg:w-14 lg:h-14 -scale-y-100" color="#5144E8" opacity={0.14} />
      </div>
      <div className="absolute bottom-5 sm:bottom-7 right-5 sm:right-7 z-0 pointer-events-none select-none" aria-hidden="true">
        <CertCorner className="w-7 h-7 sm:w-10 sm:h-10 lg:w-14 lg:h-14 -scale-100" color="#5144E8" opacity={0.14} />
      </div>

      {/* ========================================================
          GUILLOCHE SECURITY BANDS & ROSETTE (ADD §2)
          Interlaced sine wave bands + central banknote spirograph rosette
         ======================================================== */}
      {/* Wave bands along top and bottom inner edges */}
      <GuillocheWaveBand className="hidden sm:block absolute top-0 left-0 right-0 z-0" color="#5144E8" opacity={0.055} />
      <GuillocheWaveBand className="hidden sm:block absolute bottom-0 left-0 right-0 z-0" color="#5144E8" opacity={0.055} />

      {/* Central Banknote Guilloche Rosette behind headline area */}
      <div 
        className="absolute left-1/2 -translate-x-1/2 top-4 sm:top-6 lg:top-8 pointer-events-none select-none z-0" 
        aria-hidden="true"
      >
        <GuillocheRosette
          className="w-[340px] h-[340px] sm:w-[480px] sm:h-[480px] lg:w-[820px] lg:h-[820px]"
          color="#5144E8"
          opacity={0.055}
        />
      </div>

      {/* ========================================================
          BACKGROUND DECOR MOTIFS (KEPT EXACTLY AS THEY ARE)
          Left lavender ring + Right scalloped seal
         ======================================================== */}
      {/* Left Ring (deliberate, large, partially cropped full ring centered vertically behind sticky note) */}
      <div 
        className="absolute top-10 sm:top-14 -left-32 sm:-left-40 md:-left-44 pointer-events-none select-none z-0" 
        aria-hidden="true"
      >
        <Ring
          size={420}
          strokeWidth={38}
          color="#5144E8"
          className="text-indigo-500 opacity-[0.09] max-w-none transform scale-75 sm:scale-85 lg:scale-100 origin-center"
        />
      </div>

      {/* Right Counterweight (cropped Seal rosette behind credential card in sky-tint, balanced but not mirrored) */}
      <div 
        className="hidden sm:block absolute top-20 sm:top-24 -right-24 sm:-right-28 md:-right-32 pointer-events-none select-none z-0" 
        aria-hidden="true"
      >
        <Seal
          size={320}
          color="#0A9AF5"
          opacity={0.09}
          className="max-w-none transform scale-75 md:scale-85 lg:scale-100 origin-center"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        
        {/* ========================================================
            STICKER CLUSTER 1: Top-Left (Yellow Sticky Note + Check Tile + Round Rosette Sticker)
            Matches Change Request 02 §2.2
           ======================================================== */}
        <motion.div
          className="hidden lg:block absolute top-8 xl:top-12 left-2 xl:left-6 z-20 pointer-events-none select-none"
          initial={shouldReduceMotion ? false : { opacity: 0, y: -14, rotate: -9 }}
          animate={{ opacity: 1, y: 0, rotate: -6 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
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
              className="absolute -bottom-5 -right-4 w-12 h-12 rounded-xl bg-white flex items-center justify-center border border-black/5 z-20"
              style={{ 
                boxShadow: "0 12px 24px -4px rgba(11,11,18,0.18)",
                transform: "rotate(6deg)"
              }}
              initial={shouldReduceMotion ? false : { scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.25, delay: shouldReduceMotion ? 0 : 0.35 }}
            >
              <div className="w-8 h-8 rounded-lg bg-[var(--pd-indigo)] flex items-center justify-center text-white">
                <Check size={18} weight="bold" />
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* ========================================================
            STICKER CLUSTER 2: Top-Right (Verified Credential Card + Award Badge + QR Sticker)
            Matches Change Request 02 §2.2
           ======================================================== */}
        <motion.div
          className="hidden lg:block absolute top-8 xl:top-12 right-2 xl:right-6 z-20 pointer-events-none select-none"
          initial={shouldReduceMotion ? false : { opacity: 0, y: -14, rotate: 7.5 }}
          animate={{ opacity: 1, y: 0, rotate: 5 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: shouldReduceMotion ? 0 : 0.1 }}
        >
          <div className="relative">
            {/* Tactile tape motif attached to top edge */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-30">
              <TapeStrip width={60} height={18} tilt={2} color="rgba(255,255,255,0.85)" />
            </div>

            {/* Card Container */}
            <div 
              className="bg-white rounded-2xl p-5 w-[240px] xl:w-[260px] border border-[var(--pd-line)] text-left relative overflow-hidden"
              style={{ boxShadow: "0 14px 30px -8px rgba(11,11,18,0.14)" }}
            >
              {/* Hairline Inset Double Border & Corner Ticks (ADD §4) */}
              <div 
                className="absolute inset-2 sm:inset-2.5 rounded-xl border border-[#5144E8]/[0.12] pointer-events-none select-none z-0"
                aria-hidden="true"
              >
                <div className="absolute inset-[3px] rounded-lg border border-[#5144E8]/[0.08]" />
                <span className="absolute -top-[1px] -left-[1px] w-2 h-2 border-t-2 border-l-2 border-[#5144E8]/25 rounded-tl-sm" />
                <span className="absolute -top-[1px] -right-[1px] w-2 h-2 border-t-2 border-r-2 border-[#5144E8]/25 rounded-tr-sm" />
                <span className="absolute -bottom-[1px] -left-[1px] w-2 h-2 border-b-2 border-l-2 border-[#5144E8]/25 rounded-bl-sm" />
                <span className="absolute -bottom-[1px] -right-[1px] w-2 h-2 border-b-2 border-r-2 border-[#5144E8]/25 rounded-br-sm" />
              </div>

              {/* Faint Guilloche Watermark behind card text (ADD §4, ~5% opacity) */}
              <div className="absolute -right-8 -bottom-8 pointer-events-none select-none z-0" aria-hidden="true">
                <Guilloche size={135} color="#5144E8" opacity={0.05} />
              </div>

              <div className="relative z-10">
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
            </div>

            {/* Small tilted QR-pattern sticker (§2.2, visible >=1280px) */}
            <div
              className="hidden xl:block absolute -bottom-3.5 -right-3.5 z-20 pointer-events-none select-none rounded-xl bg-white border border-slate-200/90 p-1.5 shadow-md"
              style={{ transform: "rotate(8deg)" }}
              aria-hidden="true"
            >
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                {/* Decorative non-scannable QR pattern */}
                <rect x="2" y="2" width="10" height="10" rx="1.5" fill="#0B0B14" />
                <rect x="4" y="4" width="6" height="6" fill="#FFFFFF" />
                <rect x="5.5" y="5.5" width="3" height="3" fill="#0B0B14" />
                <rect x="20" y="2" width="10" height="10" rx="1.5" fill="#0B0B14" />
                <rect x="22" y="4" width="6" height="6" fill="#FFFFFF" />
                <rect x="23.5" y="5.5" width="3" height="3" fill="#0B0B14" />
                <rect x="2" y="20" width="10" height="10" rx="1.5" fill="#0B0B14" />
                <rect x="4" y="22" width="6" height="6" fill="#FFFFFF" />
                <rect x="5.5" y="23.5" width="3" height="3" fill="#0B0B14" />
                <rect x="14" y="3" width="3" height="3" rx="0.5" fill="#0B0B14" />
                <rect x="14" y="8" width="3" height="3" rx="0.5" fill="#0B0B14" />
                <rect x="14" y="14" width="4" height="4" rx="0.5" fill="#0B0B14" />
                <rect x="20" y="14" width="3" height="3" rx="0.5" fill="#0B0B14" />
                <rect x="25" y="14" width="3" height="3" rx="0.5" fill="#0B0B14" />
                <rect x="14" y="20" width="3" height="3" rx="0.5" fill="#0B0B14" />
                <rect x="20" y="20" width="4" height="4" rx="0.5" fill="#0B0B14" />
                <rect x="26" y="25" width="4" height="4" rx="0.5" fill="#0B0B14" />
                <rect x="15" y="26" width="3" height="3" rx="0.5" fill="#0B0B14" />
              </svg>
            </div>

            {/* Overlapping Floating Award Badge with Medal Ribbon Tails (ADD §3) */}
            <motion.div
              className="absolute -top-3.5 -left-3.5 z-20 pointer-events-none select-none"
              style={{ transform: "rotate(-10deg)" }}
              initial={shouldReduceMotion ? false : { scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.25, delay: shouldReduceMotion ? 0 : 0.45 }}
            >
              <div className="relative">
                {/* Ribbon tails hanging beneath medal */}
                <svg
                  width="26"
                  height="16"
                  viewBox="0 0 26 16"
                  fill="none"
                  className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 pointer-events-none -z-10"
                  aria-hidden="true"
                >
                  <path
                    d="M 5 0 L 1.5 13 L 6 10.5 L 10.5 13 L 8.5 0 Z"
                    fill="#FBBF24"
                    stroke="#D97706"
                    strokeWidth="1"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M 17.5 0 L 15.5 13 L 20 10.5 L 24.5 13 L 21 0 Z"
                    fill="#F59E0B"
                    stroke="#D97706"
                    strokeWidth="1"
                    strokeLinejoin="round"
                  />
                </svg>

                {/* Badge tile (unchanged) */}
                <div 
                  className="w-11 h-11 rounded-xl bg-white flex items-center justify-center border border-black/5 relative z-10"
                  style={{ boxShadow: "0 10px 20px -4px rgba(11,11,18,0.16)" }}
                >
                  <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center text-[var(--pd-amber)]">
                    <Medal size={16} weight="duotone" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* ========================================================
            CENTER CONTENT: Headline, Subtitle, CTA & Stats
           ======================================================== */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto pt-2 sm:pt-6 pb-2">
          
          {/* Headline (Line 1 in ink, Line 2 in muted gray) */}
          <motion.h1
            className="text-4xl sm:text-5xl lg:text-[3.85rem] font-bold tracking-tight leading-[1.12] mb-5"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
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
            initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Effortlessly issue tamper-proof digital credentials, prevent fraud, and boost organization credibility.
          </motion.p>

          {/* Primary CTA button */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.25 }}
          >
            <Link
              to="/signup"
              className="inline-flex items-center justify-center h-11 px-8 rounded-full text-sm font-medium text-white bg-[var(--pd-indigo)] hover:bg-[var(--pd-indigo-dark)] transition-colors shadow-sm no-underline cursor-pointer"
            >
              Get started
            </Link>
          </motion.div>

          {/* Micro Stats (10+, 500+, 99.9%) (§2.3: 36px squircles, tint bg with deeper icon, optically centered) */}
          <motion.div
            className="flex flex-col items-center pt-8 sm:pt-10"
            initial={shouldReduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.35 }}
          >
            <div className="flex items-center justify-center gap-6 sm:gap-8">
              {/* Stat 1: 10+ Companies */}
              <div className="flex items-center gap-3 text-left">
                <div className="w-9 h-9 min-w-[36px] rounded-xl bg-[#E9E7FD] text-[#5144E8] ring-1 ring-inset ring-[#5144E8]/15 flex items-center justify-center shrink-0">
                  <Buildings size={18} weight="duotone" />
                </div>
                <div className="flex flex-col justify-center">
                  <span className="text-xl font-bold text-[var(--pd-ink)] tabular-nums leading-tight">10+</span>
                  <span className="text-[11px] font-medium text-[var(--pd-mute)] leading-tight mt-0.5">Companies</span>
                </div>
              </div>

              {/* Divider 1 (1px, ~32px tall, low contrast, vertically centered) */}
              <div className="w-px h-8 bg-slate-200/80 shrink-0 self-center" aria-hidden="true" />

              {/* Stat 2: 500+ Certs Verified */}
              <div className="flex items-center gap-3 text-left">
                <div className="w-9 h-9 min-w-[36px] rounded-xl bg-[#DDF1FD] text-[#0A9AF5] ring-1 ring-inset ring-[#0A9AF5]/15 flex items-center justify-center shrink-0">
                  <SealCheck size={18} weight="duotone" />
                </div>
                <div className="flex flex-col justify-center">
                  <span className="text-xl font-bold text-[var(--pd-ink)] tabular-nums leading-tight">500+</span>
                  <span className="text-[11px] font-medium text-[var(--pd-mute)] leading-tight mt-0.5">Certs Verified</span>
                </div>
              </div>

              {/* Divider 2 (1px, ~32px tall, low contrast, vertically centered) */}
              <div className="w-px h-8 bg-slate-200/80 shrink-0 self-center" aria-hidden="true" />

              {/* Stat 3: 99.9% Uptime */}
              <div className="flex items-center gap-3 text-left">
                <div className="w-9 h-9 min-w-[36px] rounded-xl bg-[#DDF5E6] text-[#16A34A] ring-1 ring-inset ring-[#16A34A]/15 flex items-center justify-center shrink-0">
                  <Pulse size={18} weight="duotone" />
                </div>
                <div className="flex flex-col justify-center">
                  <span className="text-xl font-bold text-[var(--pd-ink)] tabular-nums leading-tight">99.9%</span>
                  <span className="text-[11px] font-medium text-[var(--pd-mute)] leading-tight mt-0.5">Uptime</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ========================================================
            CENTERPIECE: Dashboard Mockup + 2 Floating Cards
            Vibrant flat sky-blue frame matching Section 5.2 (no gradients)
           ======================================================== */}
        <motion.div
          className="relative mt-10 sm:mt-14 w-full max-w-5xl mx-auto"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: shouldReduceMotion ? 0 : 0.3 }}
        >
          {/* Peeking Certificate Sheet 1: Top-Left (ADD §5, visible >=1280px, tilted -4deg) */}
          <div
            className="hidden xl:flex flex-col justify-between absolute -top-6 left-6 xl:left-10 w-[180px] h-[125px] rounded-lg bg-white border border-[#5144E8]/20 shadow-md p-3 pointer-events-none select-none z-0 overflow-hidden"
            style={{ transform: "rotate(-4deg)" }}
            aria-hidden="true"
          >
            <div className="border border-[#5144E8]/10 rounded p-2 h-full flex flex-col justify-between">
              <div>
                <div className="w-16 h-1.5 bg-[#5144E8]/20 rounded-full mb-2" />
                <div className="w-28 h-1 bg-slate-200/80 rounded-full mb-1" />
                <div className="w-20 h-1 bg-slate-200/80 rounded-full mb-1" />
                <div className="w-24 h-1 bg-slate-200/80 rounded-full" />
              </div>
              <div className="flex items-end justify-between pt-1">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="#5144E8" strokeWidth="1" strokeOpacity="0.25" strokeDasharray="2 2" />
                  <circle cx="12" cy="12" r="5" stroke="#5144E8" strokeWidth="1" strokeOpacity="0.2" />
                </svg>
                <div className="w-12 h-1 bg-slate-200/70 rounded-full" />
              </div>
            </div>
          </div>

          {/* Peeking Certificate Sheet 2: Top-Right (ADD §5, visible >=1280px, tilted +3deg) */}
          <div
            className="hidden xl:flex flex-col justify-between absolute -top-7 right-6 xl:right-12 w-[190px] h-[130px] rounded-lg bg-white border border-[#5144E8]/20 shadow-md p-3 pointer-events-none select-none z-0 overflow-hidden"
            style={{ transform: "rotate(3deg)" }}
            aria-hidden="true"
          >
            <div className="border border-[#5144E8]/10 rounded p-2 h-full flex flex-col justify-between">
              <div>
                <div className="w-20 h-1.5 bg-[#5144E8]/20 rounded-full mb-2" />
                <div className="w-32 h-1 bg-slate-200/80 rounded-full mb-1" />
                <div className="w-24 h-1 bg-slate-200/80 rounded-full mb-1" />
                <div className="w-28 h-1 bg-slate-200/80 rounded-full" />
              </div>
              <div className="flex items-end justify-between pt-1">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="#0A9AF5" strokeWidth="1" strokeOpacity="0.25" />
                  <path d="M 9 19 L 12 16 L 15 19" stroke="#0A9AF5" strokeWidth="1" strokeOpacity="0.25" />
                </svg>
                <div className="w-14 h-1 bg-slate-200/70 rounded-full" />
              </div>
            </div>
          </div>

          {/* Ambient dot pattern outside frame */}
          <div className="absolute -inset-4 pointer-events-none opacity-40">
            <DotGrid dotSize={1.2} gap={18} color="#0A9AF5" opacity={0.25} />
          </div>

          {/* Floating Card 1: Recent Batches (Left) */}
          <motion.div
            className="hidden sm:block absolute -left-4 md:-left-8 lg:-left-12 bottom-12 md:bottom-20 z-20 pointer-events-none select-none"
            initial={shouldReduceMotion ? false : { opacity: 0, x: -30, rotate: -4 }}
            animate={{ opacity: 1, x: 0, rotate: -2 }}
            transition={{ duration: 0.5, delay: shouldReduceMotion ? 0 : 0.45 }}
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
            initial={shouldReduceMotion ? false : { opacity: 0, x: 30, rotate: 4 }}
            animate={{ opacity: 1, x: 0, rotate: 2 }}
            transition={{ duration: 0.5, delay: shouldReduceMotion ? 0 : 0.5 }}
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
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl border border-slate-100 bg-slate-50 flex items-center justify-center">
                    <BrandIcon name="linkedin" size={22} useBrandColor />
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-medium text-slate-600 mt-1.5">
                    LinkedIn
                  </span>
                </div>

                {/* Email */}
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl border border-slate-100 bg-slate-50 flex items-center justify-center">
                    <IconBadge icon={EnvelopeSimple} tone="sky" size="sm" shape="squircle" />
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-medium text-slate-600 mt-1.5">
                    Email
                  </span>
                </div>

                {/* REST API */}
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl border border-slate-100 bg-slate-50 flex items-center justify-center">
                    <IconBadge icon={Code} tone="ink" size="sm" shape="squircle" />
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-medium text-slate-600 mt-1.5">
                    REST API
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Flat Sky-Blue Showcase Container (no linear gradient) */}
          <div 
            className="rounded-3xl sm:rounded-[32px] p-4 sm:p-8 md:p-12 relative z-10 overflow-hidden bg-[#0A9AF5] shadow-2xl"
          >
            {/* Tone cropped ring on frame */}
            <Ring
              size={320}
              strokeWidth={36}
              color="#0880CC"
              className="absolute -bottom-24 -left-20 opacity-30"
            />

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

export default LandingHero;
