import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "@phosphor-icons/react";
import BrandIcon from "./ui/BrandIcon";
import { Seal, Ring, Swirl } from "./ui/decor";

const PublicFooter = () => {
  return (
    <footer className="relative bg-[#0B0B14] text-white rounded-t-[32px] sm:rounded-t-[44px] overflow-hidden pt-16 pb-12 mt-12 border-t border-slate-800">
      {/* Decorative Seal Watermark cropped at bottom right (§5.2) */}
      <Seal
        size={360}
        color="#5144E8"
        opacity={0.06}
        className="absolute -bottom-24 -right-16 pointer-events-none"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Footer CTA: Flat indigo rounded panel with large cropped Rings/Swirl (§5.2) */}
        <div className="mb-20 rounded-[28px] sm:rounded-[36px] bg-[#5144E8] text-white p-8 sm:p-12 relative overflow-hidden text-center shadow-lg">
          <Ring
            size={280}
            strokeWidth={32}
            color="#3B2FC9"
            className="absolute -top-16 -right-16 opacity-40 pointer-events-none"
          />
          <Swirl
            size={200}
            strokeWidth={20}
            color="#3B2FC9"
            className="absolute -bottom-12 -left-12 opacity-35 pointer-events-none"
          />

          <div className="relative z-10 max-w-xl mx-auto">
            <p className="text-2xl sm:text-3xl font-bold text-white mb-2">Stay credible.</p>
            <p className="text-sm sm:text-base text-white/80 mb-6">Issue your first certificate today.</p>
            <Link
              to="/signup"
              className="inline-flex items-center justify-center px-8 py-3 rounded-full text-sm font-semibold text-[#0B0B14] bg-white hover:bg-slate-100 transition-colors no-underline shadow-xs cursor-pointer"
            >
              Get started
            </Link>
          </div>
        </div>

        {/* 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-y-10 gap-x-8 lg:gap-x-12 mb-16">
          {/* Brand Column */}
          <div>
            <Link to="/" className="flex items-center gap-2.5 h-9 mb-5 no-underline">
              <img
                src="/logo.png"
                alt="ProofDeck"
                className="w-9 h-9 rounded-lg shadow-2xs"
              />
              <span className="text-lg font-bold text-white tracking-tight">
                ProofDeck
              </span>
            </Link>
            <p className="text-sm text-slate-400 mb-6 max-w-sm leading-relaxed">
              The modern standard for issuing verifiable digital credentials.
              Built for speed, security, and scale.
            </p>
            {/* Real Brand Icons in circular buttons with brand color on hover (§5.2) */}
            <div className="flex items-center space-x-3">
              <SocialLink href="https://x.com/proofdeck" name="x" label="X (formerly Twitter)" />
              <SocialLink href="https://www.linkedin.com/company/proofdeckhq/" name="linkedin" label="LinkedIn" />
              <SocialLink href="https://www.youtube.com/@proofdeck" name="youtube" label="YouTube" />
              <SocialLink href="https://www.proofdeck.app" name="instagram" label="Instagram" />
            </div>
          </div>

          {/* Product */}
          <div>
            <div className="h-9 flex items-center mb-5">
              <h4 className="font-bold text-white text-sm m-0">
                Product
              </h4>
            </div>
            <ul className="space-y-3.5 list-none !p-0 !m-0 !pl-0">
              <FooterLink to="/dashboard">Dashboard</FooterLink>
              <FooterLink to="/features">Features</FooterLink>
              <FooterLink to="/pricing">Pricing</FooterLink>
              <FooterLink to="/contact">Support</FooterLink>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <div className="h-9 flex items-center mb-5">
              <h4 className="font-bold text-white text-sm m-0">
                Resources
              </h4>
            </div>
            <ul className="space-y-3.5 list-none !p-0 !m-0 !pl-0">
              <FooterLink to="/docs">Documentation</FooterLink>
              <FooterLink to="/search">Public Ledger</FooterLink>
              <FooterLink to="/verify">Verification Portal</FooterLink>
              <FooterLink href="https://blog.proofdeck.app" isExternal>
                Blog
              </FooterLink>
            </ul>
          </div>

          {/* Company */}
          <div>
            <div className="h-9 flex items-center mb-5">
              <h4 className="font-bold text-white text-sm m-0">
                Company
              </h4>
            </div>
            <ul className="space-y-3.5 list-none !p-0 !m-0 !pl-0">
              <FooterLink href="https://www.bolaji.tech/" isExternal>
                About / Founder
              </FooterLink>
              <FooterLink to="/contact">Contact</FooterLink>
              <FooterLink to="/legal?tab=privacy">Privacy Policy</FooterLink>
              <FooterLink to="/legal?tab=terms">Terms of Service</FooterLink>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <p className="text-xs text-slate-500 font-medium m-0">
            &copy; 2026 ProofDeck &middot; A BMDL Technologies Ltd. product &middot; RC 9840518
          </p>
          <div className="flex items-center gap-8 text-xs font-medium !text-slate-400">
            <Link to="/legal?tab=privacy" className="!text-slate-400 hover:!text-white transition-colors no-underline">Privacy</Link>
            <Link to="/legal?tab=terms" className="!text-slate-400 hover:!text-white transition-colors no-underline">Terms</Link>
            <Link to="/legal?tab=security" className="!text-slate-400 hover:!text-white transition-colors no-underline">Security</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

const FooterLink = ({ to, href, children, isExternal }) => {
  const className =
    "!text-slate-400 hover:!text-white transition-colors text-sm font-medium flex items-center gap-1 group no-underline";

  if (isExternal) {
    return (
      <li>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={className}
        >
          {children}
          <ArrowUpRight
            size={12}
            weight="bold"
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          />
        </a>
      </li>
    );
  }
  return (
    <li>
      <Link to={to} className={className}>
        {children}
      </Link>
    </li>
  );
};

const SocialLink = ({ href, name, label }) => {
  const [hovered, setHovered] = React.useState(false);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="w-9 h-9 rounded-full bg-slate-900 border border-slate-800 text-slate-400 flex items-center justify-center hover:bg-white transition-all duration-200"
    >
      <BrandIcon name={name} size={16} useBrandColor={hovered} />
    </a>
  );
};

export default PublicFooter;
