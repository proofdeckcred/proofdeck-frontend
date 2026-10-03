import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ShieldCheck, ArrowRight } from "lucide-react";
import { APP_NAME } from "../config";
import MobileWarning from "../components/MobileWarning";
import { useWhiteLabel } from "../context/WhiteLabelContext";

const AuthLayout = ({ children, title, subtitle, linkText, linkTo, linkLabel }) => {
  const location = useLocation();
  const { isWhiteLabel, brand } = useWhiteLabel();

  // Subtle animated background pattern for the left panel
  const Pattern = () => (
    <div className="absolute inset-0 opacity-10">
      <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    </div>
  );

  const leftBgStyle = isWhiteLabel && brand?.primary_color
    ? { backgroundColor: brand.primary_color }
    : {};

  return (
    <div className="h-screen flex bg-white font-sans selection:bg-indigo-100 selection:text-indigo-700 overflow-hidden">
      <MobileWarning />
      {/* Left Panel - Visual Branding (Desktop only) */}
      <div
        style={leftBgStyle}
        className="hidden lg:flex w-1/2 relative bg-indigo-600 overflow-hidden flex-col justify-between p-12 text-white"
      >
        {/* Background Gradients & Shapes */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-black/40 z-0"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 opacity-20 rounded-full blur-2xl translate-y-1/3 -translate-x-1/3"></div>
        <Pattern />

        {/* Brand Header */}
        <Link to="/" className="relative z-10 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-700 hover:opacity-90 transition-opacity no-underline">
          {isWhiteLabel && brand?.logo_url ? (
            <div className="bg-white p-2 rounded-xl shadow-xs border border-white/20">
              <img src={brand.logo_url} alt={brand.company_name} className="h-8 max-w-[160px] object-contain rounded" />
            </div>
          ) : (
            <div className="bg-white/20 backdrop-blur-md p-1.5 rounded-lg border border-white/10">
              <img src="/logo.png" alt="ProofDeck" className="w-10 h-10 object-contain" />
            </div>
          )}
          <span className="text-2xl font-bold tracking-tight text-white">
            {isWhiteLabel && brand ? brand.company_name : APP_NAME}
          </span>
        </Link>

        {/* Authority / Testimonial */}
        {isWhiteLabel && brand ? (
          <div className="relative z-10 max-w-md animate-in fade-in slide-in-from-left-4 duration-1000 delay-150">
            <blockquote className="text-xl font-medium leading-relaxed mb-6 font-serif italic text-white/95">
              "Official Credential & Verification Portal for {brand.company_name}."
            </blockquote>
            <div className="flex items-center gap-3.5 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15">
              <div className="p-2 rounded-xl bg-white/20 text-white">
                <ShieldCheck size={24} />
              </div>
              <div>
                <p className="text-white font-bold text-sm mb-0">Authorized Issuer Portal</p>
                <p className="text-white/80 text-xs mb-0">Sign in to manage and issue authentic digital credentials.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative z-10 max-w-md animate-in fade-in slide-in-from-left-4 duration-1000 delay-150">
            <blockquote className="text-xl font-medium leading-relaxed mb-6 font-serif italic text-indigo-50">
              "ProofDeck is a game changer. The ability to custom my certificates and issue them in bulk made all the difference."
            </blockquote>
            <div className="flex items-center gap-4">
              <img 
                 src="/images/chibuzor-azodo.png" 
                 alt="Chibuzor Azodo" 
                 className="w-12 h-12 rounded-full object-cover border-2 border-indigo-400"
              />
              <div>
                 <p className="text-white font-bold text-sm">Chibuzor Azodo, PhD</p>
                 <p className="text-indigo-200 text-xs">Founder, Staunch Analytics Ltd</p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="relative z-10 text-sm text-white/80 flex justify-between items-center animate-in fade-in duration-700 delay-300">
             <p className="mb-0">
               © {new Date().getFullYear()} {isWhiteLabel && brand ? brand.company_name : `${APP_NAME} · A BMDL Technologies Ltd. product · RC 9840518`}
             </p>
             {(!isWhiteLabel || !brand?.hide_badge) && (
               <div className="flex gap-4">
                  <Link to="/legal?tab=privacy" className="hover:text-white transition-colors no-underline">Privacy</Link>
                  <Link to="/legal?tab=terms" className="hover:text-white transition-colors no-underline">Terms</Link>
               </div>
             )}
        </div>
      </div>

      {/* Right Panel - Form Content */}
      <div className="w-full lg:w-1/2 flex flex-col relative h-full overflow-y-auto">
        {/* Desktop Quick Nav to Public Portal */}
        <div className="hidden lg:flex justify-between items-center px-8 pt-6 pb-2 shrink-0">
          <Link
            to="/"
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors no-underline flex items-center gap-1.5"
          >
            <span>←</span>
            <span>Public Verification Portal</span>
          </Link>
          {isWhiteLabel && brand?.website_url && (
            <a
              href={brand.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors no-underline"
            >
              {brand.company_name} Website ↗
            </a>
          )}
        </div>

        {/* Mobile Header */}
        <div className="lg:hidden p-6 flex items-center justify-between shrink-0 border-b border-gray-100">
          <Link to="/" className="flex items-center gap-2 no-underline">
            {isWhiteLabel && brand?.logo_url ? (
              <img src={brand.logo_url} alt={brand.company_name} className="h-8 max-w-[140px] object-contain rounded" />
            ) : (
              <img src="/logo.png" alt="ProofDeck" className="w-8 h-8 object-contain" />
            )}
            <span className="font-bold text-lg text-gray-900">
              {isWhiteLabel && brand ? brand.company_name : APP_NAME}
            </span>
          </Link>
          <Link to="/" className="text-xs font-semibold text-slate-500 hover:text-slate-800 no-underline">
            ← Verification
          </Link>
        </div>

        <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-12 xl:px-24 min-h-min">
           <div className="w-full max-w-md mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
               {/* Header Content */}
               <div className="mb-10">
                   {title && <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">{title}</h2>}
                   {subtitle && <p className="text-gray-500 text-lg">{subtitle}</p>}
               </div>

               {/* Main Form Content */}
               {children}

               {/* Footer Link */}
               {(linkTo && linkText) && (
                   <p className="mt-8 text-center text-sm text-gray-500">
                       {linkLabel} {' '}
                       <Link to={linkTo} className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors inline-flex items-center gap-1">
                           {linkText} <ArrowRight size={14} />
                       </Link>
                   </p>
               )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
