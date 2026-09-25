import React from "react";
import { Link } from "react-router-dom";
import { Linkedin, Youtube, ArrowUpRight, Instagram } from "lucide-react";

const PublicFooter = () => {
  return (
    <footer className="pd-dot-grid border-t border-[var(--pd-line)] bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-y-10 gap-x-8 lg:gap-x-12 mb-16">
          {/* Brand Column */}
          <div>
            <Link to="/" className="flex items-center gap-2.5 h-9 mb-5 no-underline">
              <img
                src="/logo.png"
                alt="ProofDeck"
                className="w-9 h-9 rounded-lg shadow-2xs"
              />
              <span className="text-lg font-bold text-slate-900 tracking-tight">
                ProofDeck
              </span>
            </Link>
            <p className="text-sm text-slate-500 mb-6 max-w-sm leading-relaxed">
              The modern standard for issuing verifiable digital credentials.
              Built for speed, security, and scale.
            </p>
            <div className="flex items-center space-x-3">
              <SocialLink
                href="https://x.com/proofdeck"
                icon={() => (
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                )}
              />
              <SocialLink href="https://www.linkedin.com/company/proofdeckhq/" icon={Linkedin} />
              <SocialLink href="https://www.youtube.com/@proofdeck" icon={Youtube} />
              <SocialLink href="https://www.proofdeck.app" icon={Instagram} />
            </div>
          </div>

          {/* Product */}
          <div>
            <div className="h-9 flex items-center mb-5">
              <h4 className="font-bold text-slate-900 text-sm m-0">
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
              <h4 className="font-bold text-slate-900 text-sm m-0">
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
              <h4 className="font-bold text-slate-900 text-sm m-0">
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

        {/* Footer CTA - Exactly matching Image 1 */}
        <div className="text-center my-14">
          <p className="text-xl font-bold text-slate-900 mb-1.5">Stay credible.</p>
          <p className="text-sm text-slate-500 mb-6">Issue your first certificate today.</p>
          <Link
            to="/signup"
            className="inline-flex items-center justify-center px-7 py-2.5 rounded-full text-sm font-semibold text-white bg-[var(--pd-indigo)] hover:bg-[var(--pd-indigo-dark)] transition-colors no-underline shadow-xs cursor-pointer"
          >
            Get started
          </Link>
        </div>

        {/* Bottom Bar - Exactly matching Image 1 */}
        <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <p className="text-xs text-slate-400 font-medium m-0">
            &copy; 2026 ProofDeck &middot; A BMDL Technologies Ltd. product &middot; RC 9840518
          </p>
          <div className="flex items-center gap-8 text-xs font-medium !text-slate-400">
            <Link to="/legal?tab=privacy" className="!text-slate-400 hover:!text-slate-600 transition-colors no-underline">Privacy</Link>
            <Link to="/legal?tab=terms" className="!text-slate-400 hover:!text-slate-600 transition-colors no-underline">Terms</Link>
            <Link to="/legal?tab=security" className="!text-slate-400 hover:!text-slate-600 transition-colors no-underline">Security</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

const FooterLink = ({ to, href, children, isExternal }) => {
  const className =
    "!text-slate-500 hover:!text-slate-900 transition-colors text-sm font-medium flex items-center gap-1 group no-underline";

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
            size={11}
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

const SocialLink = ({ href, icon: Icon }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="w-9 h-9 rounded-full bg-slate-200/60 text-slate-500 flex items-center justify-center hover:bg-indigo-100 hover:text-indigo-600 transition-all"
  >
    <Icon size={16} />
  </a>
);

export default PublicFooter;
