import React from "react";
import { Link } from "react-router-dom";
import PublicHeader from "../../components/PublicHeader";
import PublicFooter from "../../components/PublicFooter";
import SEO from "../../components/SEO";
import { ArrowLeft, Check, AlertTriangle, ShieldCheck, QrCode } from "lucide-react";

export default function VerifyCertificateGuidePage() {
  const breadcrumbSchema = {
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://www.proofdeck.app/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Blog",
        "item": "https://www.proofdeck.app/blog"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "How to Verify a Certificate Online",
        "item": "https://www.proofdeck.app/blog/how-to-verify-a-certificate-online"
      }
    ]
  };

  const articleSchema = {
    "@type": "Article",
    "headline": "How to Verify a Certificate Online (and Spot Fake Credentials in Nigeria)",
    "description": "Learn how modern employers and institutions verify certificate authenticity using dynamic QR codes, hosted verification portals, and cryptographic ledgers.",
    "author": {
      "@type": "Organization",
      "name": "ProofDeck"
    },
    "publisher": {
      "@type": "Organization",
      "name": "ProofDeck",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.proofdeck.app/logo.png"
      }
    },
    "datePublished": "2026-09-01",
    "dateModified": "2026-09-22"
  };

  return (
    <div className="bg-white font-sans text-[var(--pd-ink)] min-h-screen flex flex-col">
      <SEO
        title="How to Verify a Certificate Online & Spot Fake Credentials | ProofDeck Guide"
        description="A practical guide for employers, HR teams, and institutions on how to verify digital certificates online, spot Photoshop forgeries, and use QR code verification."
        keywords="how to verify a certificate online, check if certificate is fake Nigeria, how employers verify certificates, can a qr code verify a certificate, certificate fraud in Nigeria, online certificate verification"
        canonicalUrl="https://www.proofdeck.app/blog/how-to-verify-a-certificate-online"
        schemas={[breadcrumbSchema, articleSchema]}
      />
      <PublicHeader />

      <main className="flex-grow py-16">
        <article className="max-w-3xl mx-auto px-4 sm:px-6">
          <Link
            to="/blog"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--pd-mute)] hover:text-[var(--pd-ink)] transition-colors no-underline mb-8"
          >
            <ArrowLeft size={14} /> Back to Guides
          </Link>

          <header className="mb-10">
            <span className="text-xs font-bold text-[var(--pd-indigo)] bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 uppercase tracking-wider">
              Verification & Security
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[var(--pd-ink)] mt-4 mb-4 leading-tight">
              How to Verify a Certificate Online (and Spot Fake Credentials in Nigeria)
            </h1>
            <p className="text-sm text-[var(--pd-mute)]">
              Published by ProofDeck Insights &middot; 6 min read
            </p>
          </header>

          <div className="prose prose-slate max-w-none text-[var(--pd-ink)] space-y-6 leading-relaxed text-sm sm:text-base">
            <p className="text-lg font-medium text-slate-700 leading-relaxed">
              In an era where design tools like Canva and Photoshop make it easy to replicate document layouts, static PDF certificates are no longer proof of accomplishment. For employers, universities, and recruitment agencies across Nigeria and Africa, credential fraud is a serious risk.
            </p>

            <h2 className="text-2xl font-bold text-[var(--pd-ink)] pt-4">
              1. Why Traditional PDF Certificates Fail
            </h2>
            <p>
              When a training institute issues a regular PDF certificate via email, that PDF contains static vector text. Anyone with basic graphic design software can open the file, replace the recipient's name, alter the grade, or change the issue date in under two minutes. Because static PDFs lack an immutable third-party anchor, they are virtually impossible to verify at a glance.
            </p>

            <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 flex gap-3 text-amber-900 text-sm">
              <AlertTriangle size={20} className="shrink-0 text-amber-600 mt-0.5" />
              <div>
                <strong>Common red flag:</strong> If a certificate only exists as an image or PDF attachment without an official verification URL hosted on the issuing authority's domain, treat it with caution.
              </div>
            </div>

            <h2 className="text-2xl font-bold text-[var(--pd-ink)] pt-4">
              2. How Modern Online Certificate Verification Works
            </h2>
            <p>
              Modern digital credential platforms like ProofDeck replace unverified static attachments with <strong>tamper-evident, hosted credentials</strong>. Here is the verification sequence:
            </p>
            <ul className="space-y-3 pl-4">
              <li className="flex items-start gap-2">
                <Check size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Cryptographic Unique Identifier:</strong> Every certificate issued receives a unique, random credential ID stored in a tamper-resistant record.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Dynamic QR Code:</strong> A QR code printed on the physical or digital certificate points directly to the hosted verification page on ProofDeck.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Direct Domain Authority:</strong> Verifiers inspect the browser address bar to confirm the verification is served directly by <code>proofdeck.app</code> or the organization's verified custom domain.</span>
              </li>
            </ul>

            <h2 className="text-2xl font-bold text-[var(--pd-ink)] pt-4">
              3. Checklist for Employers: 3 Steps to Spot Fake Certificates
            </h2>
            <ol className="list-decimal pl-6 space-y-3">
              <li>
                <strong>Scan the QR Code:</strong> Use your smartphone camera to scan the QR code. Confirm that it redirects to an official verification portal (not a free file-hosting website or personal cloud folder).
              </li>
              <li>
                <strong>Match Ledger Data with the Resume:</strong> Check whether the name, course title, and completion date on the verification portal match the candidate's CV verbatim.
              </li>
              <li>
                <strong>Inspect the Issuing Organization:</strong> Ensure the issuing body has verified credentials and active contact information.
              </li>
            </ol>

            <div className="p-8 rounded-2xl bg-[var(--pd-paper)] border border-[var(--pd-line)] text-center my-10 space-y-4">
              <ShieldCheck size={36} className="text-[var(--pd-indigo)] mx-auto" />
              <h3 className="text-xl font-bold text-[var(--pd-ink)]">
                Issue Tamper-Proof Certificates for Your Organization
              </h3>
              <p className="text-sm text-[var(--pd-mute)] max-w-lg mx-auto">
                Protect your brand reputation and empower students with instantly verifiable credentials on ProofDeck.
              </p>
              <Link
                to="/signup"
                className="inline-flex items-center justify-center px-6 py-2.5 rounded-full text-sm font-medium text-white bg-[var(--pd-indigo)] hover:bg-[var(--pd-indigo-dark)] transition-colors no-underline"
              >
                Create Free Account
              </Link>
            </div>
          </div>
        </article>
      </main>
      <PublicFooter />
    </div>
  );
}
