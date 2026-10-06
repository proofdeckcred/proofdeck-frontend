import React from "react";
import { Wave } from "./ui/decor";

// Partner data configuration
const PARTNERS = [
  {
    id: "001",
    name: "Zitopy Technologies",
    logo: "/images/partners/zitopy.png",
    alt: "Zitopy Technologies logo",
    url: "https://zitopy.com/",
    type: "square",
  },
  {
    id: "002",
    name: "Thrive Initiative",
    logo: "/images/partners/thrive-initiative.png",
    alt: "Thrive Initiative logo",
    url: "https://www.thriveinitiativeafrica.com/",
    type: "stacked",
  },
  {
    id: "003",
    name: "The AI Nexus",
    logo: "/images/partners/ai-nexus.png",
    alt: "The AI Nexus logo",
    url: null,
    type: "wide",
  },
  {
    id: "004",
    name: "Nile University of Nigeria, Collective Labs",
    logo: "/images/partners/nile-university.png",
    alt: "Nile University of Nigeria logo",
    url: null,
    type: "wide",
  },
  {
    id: "005",
    name: "Staunch Analytics",
    logo: "/images/partners/staunch-analytics.png",
    alt: "Staunch Analytics logo",
    url: null,
    type: "stacked",
  },
];

/**
 * Normalized logo sizing helpers to balance optical weight across
 * wide wordmarks, square marks, and stacked emblems.
 */
function getLogoSizeClasses(type) {
  switch (type) {
    case "square":
      return "max-h-[46px] sm:max-h-[50px] max-w-[46px] sm:max-w-[50px] rounded-md";
    case "stacked":
      return "max-h-[54px] sm:max-h-[60px] max-w-[82%]";
    case "wide":
    default:
      return "max-h-[38px] sm:max-h-[44px] max-w-[90%]";
  }
}

/**
 * Single Partner Cell Component
 */
function PartnerCard({ partner, borderClasses = "" }) {
  const isInteractive = Boolean(partner.url);
  const TagName = isInteractive ? "a" : "div";
  const interactiveProps = isInteractive
    ? {
        href: partner.url,
        target: "_blank",
        rel: "noopener noreferrer",
      }
    : {};

  return (
    <TagName
      {...interactiveProps}
      className={`group relative flex flex-col justify-between p-3.5 sm:p-5 md:p-6 bg-white aspect-[4/3] w-full transition-colors duration-200 select-none ${
        isInteractive
          ? "cursor-pointer hover:bg-[#F2F1F8] focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--pd-indigo)] focus-visible:ring-offset-2 z-10"
          : "cursor-default hover:bg-[#F8F7FC]"
      } ${borderClasses}`}
    >
      {/* 1. Top-Left: Partner Name */}
      <div className="flex items-start justify-between min-h-[24px] sm:min-h-[30px]">
        <span
          className="text-[9px] sm:text-[10px] md:text-[11px] font-semibold uppercase tracking-wider text-[var(--pd-ink)] leading-tight line-clamp-2 max-w-[90%]"
          title={partner.name}
        >
          {partner.name}
        </span>
      </div>

      {/* 2. Center: Logo in normalized fixed-size box */}
      <div className="w-[75%] h-[52px] sm:h-[64px] md:h-[72px] mx-auto flex items-center justify-center my-auto">
        <img
          src={partner.logo}
          alt={partner.alt}
          className={`w-auto object-contain grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-200 ${getLogoSizeClasses(
            partner.type
          )}`}
        />
      </div>

      {/* 3. Bottom Row: Link & Index */}
      <div className="flex items-center justify-between text-xs pt-1">
        {isInteractive ? (
          <span className="text-[10px] sm:text-xs font-medium text-[var(--pd-indigo)] group-hover:underline flex items-center gap-0.5 sm:gap-1">
            View website ↗
          </span>
        ) : (
          <span aria-hidden="true" />
        )}
        <span className="font-mono text-[9px] sm:text-[11px] font-medium text-[var(--pd-mute)]/70">
          [{partner.id}]
        </span>
      </div>
    </TagName>
  );
}

export function TrustedBySection() {
  const row1Partners = PARTNERS.slice(0, 3); // Zitopy [001], Thrive [002], AI Nexus [003]
  const row2Partners = PARTNERS.slice(3, 5); // Nile University [004], Staunch [005]

  return (
    <section
      aria-labelledby="partners-heading"
      className="relative bg-[#F7F7FA] border-b border-[var(--pd-line)] overflow-hidden py-10 md:py-20"
    >
      <Wave height={24} fill="#FFFFFF" flip className="opacity-90 absolute top-0 left-0 right-0 pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 pt-4">
        {/* ============================================================== */}
        {/* DESKTOP (lg+): Staggered 3 + 2 layout with shared borders     */}
        {/* ============================================================== */}
        <div className="hidden lg:flex lg:flex-col">
          {/* Row 1: Header in Col 0, then 3 partner cells (Cols 1, 2, 3) */}
          <div className="flex w-full items-stretch">
            {/* Top-Left Empty Space with Section Header */}
            <div className="w-1/4 aspect-[4/3] flex flex-col justify-end p-6 pr-8 pb-8 select-none">
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--pd-mute)] mb-2">
                Partners
              </p>
              <h2
                id="partners-heading"
                className="text-base xl:text-lg font-bold text-[var(--pd-ink)] tracking-tight leading-snug"
              >
                Trusted by forward-thinking organizations
              </h2>
            </div>

            {/* 3 Partner Cells Pushed to the Right */}
            <div className="flex w-3/4">
              <div className="w-1/3">
                <PartnerCard
                  partner={row1Partners[0]}
                  borderClasses="border border-[var(--pd-line)] rounded-tl-2xl"
                />
              </div>
              <div className="w-1/3">
                <PartnerCard
                  partner={row1Partners[1]}
                  borderClasses="border-y border-r border-[var(--pd-line)]"
                />
              </div>
              <div className="w-1/3">
                <PartnerCard
                  partner={row1Partners[2]}
                  borderClasses="border-y border-r border-[var(--pd-line)] rounded-tr-2xl rounded-br-2xl"
                />
              </div>
            </div>
          </div>

          {/* Row 2: 2 partner cells aligned to the left (Cols 0, 1), overlapping top row by 1px */}
          <div className="flex w-full -mt-[1px]">
            <div className="flex w-2/4">
              <div className="w-1/2">
                <PartnerCard
                  partner={row2Partners[0]}
                  borderClasses="border border-[var(--pd-line)] rounded-tl-2xl rounded-bl-2xl"
                />
              </div>
              <div className="w-1/2">
                <PartnerCard
                  partner={row2Partners[1]}
                  borderClasses="border-y border-r border-[var(--pd-line)] rounded-br-2xl"
                />
              </div>
            </div>
            {/* Cols 2 & 3: Empty space */}
            <div className="w-2/4" aria-hidden="true" />
          </div>
        </div>

        {/* ============================================================== */}
        {/* TABLET & MOBILE (< lg): 2-column compact table grid           */}
        {/* ============================================================== */}
        <div className="lg:hidden">
          {/* Header above grid */}
          <div className="mb-5 sm:mb-6 px-1 select-none">
            <p className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-[var(--pd-mute)] mb-1">
              Partners
            </p>
            <h2 className="text-base sm:text-xl font-bold text-[var(--pd-ink)] tracking-tight">
              Trusted by forward-thinking organizations
            </h2>
          </div>

          <ul role="list" className="grid grid-cols-2">
            {/* Row 1 */}
            <li className="list-none">
              <PartnerCard
                partner={PARTNERS[0]}
                borderClasses="border border-[var(--pd-line)] rounded-tl-2xl"
              />
            </li>
            <li className="list-none">
              <PartnerCard
                partner={PARTNERS[1]}
                borderClasses="border-y border-r border-[var(--pd-line)] rounded-tr-2xl"
              />
            </li>

            {/* Row 2 */}
            <li className="list-none -mt-[1px]">
              <PartnerCard
                partner={PARTNERS[2]}
                borderClasses="border-x border-b border-[var(--pd-line)]"
              />
            </li>
            <li className="list-none -mt-[1px]">
              <PartnerCard
                partner={PARTNERS[3]}
                borderClasses="border-r border-b border-[var(--pd-line)]"
              />
            </li>

            {/* Row 3 */}
            <li className="list-none -mt-[1px]">
              <PartnerCard
                partner={PARTNERS[4]}
                borderClasses="border-x border-b border-[var(--pd-line)] rounded-bl-2xl rounded-br-2xl"
              />
            </li>
            <li className="list-none" aria-hidden="true" />
          </ul>
        </div>
      </div>
    </section>
  );
}

export default TrustedBySection;
