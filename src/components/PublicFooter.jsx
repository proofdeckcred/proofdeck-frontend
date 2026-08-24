import React from "react";
import { Link } from "react-router-dom";
import { Linkedin, Github, Globe, ArrowUpRight, Instagram } from "lucide-react";

const PublicFooter = () => {
  return (
    <footer className="bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-y-10 gap-x-8 mb-14">
          {/* Brand Column */}
          <div className="col-span-2 lg:col-span-2 pr-8">
            <Link to="/" className="flex items-center gap-2.5 mb-5 no-underline">
              <img
                src="/logo.png"
                alt="ProofDeck"
                className="w-9 h-9 rounded-lg"
              />
              <span className="text-lg font-bold text-slate-900 tracking-tight">
                ProofDeck
              </span>
            </Link>
            <p className="text-sm text-slate-500 mb-6 max-w-xs leading-relaxed">
              The modern standard for issuing verifiable digital credentials.
              Built for speed, security, and scale.
            </p>
            <div className="flex space-x-3">
              <SocialLink
                href="https://x.com/proofdeck"
                icon={() => (
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                )}
              />
              <SocialLink href="https://www.linkedin.com/company/proofdeck" icon={Linkedin} />
              <SocialLink href="https://github.com/OmobolajiDurojaiye/CertifyMe" icon={Github} />
              <SocialLink href="#" icon={Instagram} />
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-5">
              Product
            </h4>
            <ul className="space-y-3">
              <FooterLink to="/dashboard">Dashboard</FooterLink>
              <FooterLink to="/#features">Features</FooterLink>
              <FooterLink to="/pricing">Pricing</FooterLink>
              <FooterLink to="/contact">Support</FooterLink>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-5">
              Resources
            </h4>
            <ul className="space-y-3">
              <FooterLink to="/docs">Documentation</FooterLink>
              <FooterLink to="/search">Public Ledger</FooterLink>
              <FooterLink to="/verify">Verification Portal</FooterLink>
              <FooterLink href="https://www.bolaji.tech/blog" isExternal>
                Blog
              </FooterLink>
            </ul>
          </div>

          {/* Company & Legal */}
          <div>
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-5">
              Company
            </h4>
            <ul className="space-y-3">
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
        <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-400 font-medium">
            &copy; {new Date().getFullYear()} ProofDeck. All rights reserved.
          </p>
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
            <span>Built by</span>
            <a
              href="https://www.bolaji.tech/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-indigo-500 hover:text-indigo-600 transition-colors font-bold no-underline"
            >
              Bolaji <Globe size={12} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

const FooterLink = ({ to, href, children, isExternal }) => {
  const className =
    "text-slate-500 hover:text-slate-900 transition-colors text-sm font-medium flex items-center gap-1 group no-underline";

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
