import React from "react";
import { Wave } from "./ui/decor";

export function TrustedBySection() {
  return (
    <div className="relative bg-[#F7F7FA] border-b border-slate-100 overflow-hidden py-10 md:py-16">
      <Wave height={24} fill="#FFFFFF" flip className="opacity-90 absolute top-0 left-0 right-0" />
      <div className="py-2 max-w-6xl mx-auto px-4 relative z-10">
        <p className="text-center text-sm font-medium text-[var(--pd-mute)] mb-8 md:mb-12">
          Trusted by forward-thinking organizations
        </p>

        {/* Desktop Layout: ProofDeck in the Center, Partners Surrounding */}
        <div className="hidden md:flex flex-col items-center gap-7 lg:gap-8">
          {/* Top Row: Zitopy (Left) & The AI Nexus (Right) */}
          <div className="flex items-center justify-center gap-20 lg:gap-32">
            <a
              href="https://zitopy.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:scale-105 transition-all duration-300 flex items-center no-underline"
              title="Zitopy"
            >
              <img
                src="/images/partners/zitopy.png"
                alt="Zitopy"
                className="h-12 lg:h-14 w-auto object-contain rounded-xl drop-shadow-[0_6px_14px_rgba(0,0,0,0.14)] hover:drop-shadow-[0_10px_20px_rgba(91,76,245,0.3)] transition-all"
              />
            </a>

            <div
              className="hover:scale-105 transition-all duration-300 flex items-center"
              title="The AI Nexus"
            >
              <img
                src="/images/partners/ai-nexus.png"
                alt="The AI Nexus"
                className="h-8 lg:h-10 w-auto object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.12)] hover:drop-shadow-[0_8px_18px_rgba(91,76,245,0.25)] transition-all"
              />
            </div>
          </div>

          {/* Middle Row: Staunch Analytics (Left) — ProofDeck (Center Hub, Bigger) — Nile University (Right) */}
          <div className="flex items-center justify-center gap-16 lg:gap-24">
            <div
              className="hover:scale-105 transition-all duration-300 flex items-center"
              title="Staunch Analytics"
            >
              <img
                src="/images/partners/staunch-analytics.png"
                alt="Staunch Analytics"
                className="h-16 lg:h-20 w-auto object-contain drop-shadow-[0_6px_14px_rgba(0,0,0,0.12)] hover:drop-shadow-[0_10px_20px_rgba(91,76,245,0.25)] transition-all"
              />
            </div>

            {/* ProofDeck Logo (Prominent Center Anchor) */}
            <div className="hover:scale-105 transition-all duration-300 flex items-center justify-center px-4">
              <img
                src="/logo.png"
                alt="ProofDeck"
                className="h-24 lg:h-32 w-auto object-contain drop-shadow-[0_12px_28px_rgba(91,76,245,0.38)] transition-all"
              />
            </div>

            <a
              href="https://nileuniversity.edu.ng/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:scale-105 transition-all duration-300 flex items-center no-underline"
              title="Nile University of Nigeria"
            >
              <img
                src="/images/partners/nile-university.png"
                alt="Nile University of Nigeria"
                className="h-12 lg:h-14 w-auto object-contain drop-shadow-[0_6px_14px_rgba(0,0,0,0.1)] hover:drop-shadow-[0_10px_20px_rgba(91,76,245,0.25)] transition-all"
              />
            </a>
          </div>

          {/* Bottom Row: Thrive Initiative */}
          <div className="flex items-center justify-center">
            <div
              className="hover:scale-105 transition-all duration-300 flex items-center"
              title="Thrive Initiative"
            >
              <img
                src="/images/partners/thrive-initiative.png"
                alt="Thrive Initiative"
                className="h-18 lg:h-22 w-auto object-contain drop-shadow-[0_6px_16px_rgba(0,0,0,0.12)] hover:drop-shadow-[0_10px_22px_rgba(91,76,245,0.25)] transition-all"
              />
            </div>
          </div>
        </div>

        {/* Mobile Layout (< md) */}
        <div className="md:hidden flex flex-col items-center gap-6">
          {/* ProofDeck Logo in Center */}
          <div className="flex items-center justify-center">
            <img
              src="/logo.png"
              alt="ProofDeck"
              className="h-20 w-auto object-contain drop-shadow-[0_8px_20px_rgba(91,76,245,0.35)]"
            />
          </div>

          {/* Surrounding Partners in Clean Grid */}
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 pt-2">
            <a
              href="https://zitopy.com/"
              target="_blank"
              rel="noopener noreferrer"
              title="Zitopy"
            >
              <img
                src="/images/partners/zitopy.png"
                alt="Zitopy"
                className="h-11 w-auto object-contain rounded-lg drop-shadow-[0_4px_10px_rgba(0,0,0,0.14)]"
              />
            </a>
            <img
              src="/images/partners/ai-nexus.png"
              alt="The AI Nexus"
              className="h-6 w-auto object-contain drop-shadow-[0_3px_8px_rgba(0,0,0,0.1)]"
            />
            <img
              src="/images/partners/staunch-analytics.png"
              alt="Staunch Analytics"
              className="h-12 w-auto object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.12)]"
            />
            <a
              href="https://nileuniversity.edu.ng/"
              target="_blank"
              rel="noopener noreferrer"
              title="Nile University of Nigeria"
            >
              <img
                src="/images/partners/nile-university.png"
                alt="Nile University of Nigeria"
                className="h-8 w-auto object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.1)]"
              />
            </a>
            <img
              src="/images/partners/thrive-initiative.png"
              alt="Thrive Initiative"
              className="h-14 w-auto object-contain drop-shadow-[0_5px_12px_rgba(0,0,0,0.12)]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default TrustedBySection;
