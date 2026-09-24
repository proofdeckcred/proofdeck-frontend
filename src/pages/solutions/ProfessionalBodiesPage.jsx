import React from "react";
import { Link } from "react-router-dom";
import PublicHeader from "../../components/PublicHeader";
import PublicFooter from "../../components/PublicFooter";
import SEO from "../../components/SEO";
import { Check, Award, Shield, FileCheck, ArrowRight, Building2 } from "lucide-react";

export default function ProfessionalBodiesPage() {
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
        "name": "Solutions",
        "item": "https://www.proofdeck.app/solutions/professional-bodies"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "Professional Bodies",
        "item": "https://www.proofdeck.app/solutions/professional-bodies"
      }
    ]
  };

  return (
    <div className="bg-white font-sans text-[var(--pd-ink)] min-h-screen flex flex-col">
      <SEO
        title="Digital Certificate Platform for Professional Bodies & Associations | ProofDeck"
        description="Issue verifiable annual membership certificates, induction credentials, and license renewals for Nigerian professional institutes and trade bodies."
        keywords="membership certificate platform Nigeria, association certificate management software, professional certification generator, digital membership certificate software nigeria, verifiable professional credentials"
        canonicalUrl="https://www.proofdeck.app/solutions/professional-bodies"
        schemas={[breadcrumbSchema]}
      />
      <PublicHeader />

      <main className="flex-grow">
        {/* Hero */}
        <section className="py-20 md:py-28 bg-[var(--pd-paper)] pd-dot-grid border-b border-[var(--pd-line)] text-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <span className="pd-pill-label mb-4 inline-flex">Institutes & Trade Associations</span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
              Membership Certificate Platform for Professional Bodies
            </h1>
            <p className="text-base sm:text-lg text-[var(--pd-mute)] max-w-2xl mx-auto leading-relaxed mb-8">
              Modernize your professional institute's induction, annual licensing, and certification processes with cryptographically secured, instantly verifiable digital credentials.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                className="inline-flex items-center justify-center px-6 py-3 rounded-full text-sm font-medium text-white bg-[var(--pd-indigo)] hover:bg-[var(--pd-indigo-dark)] transition-colors no-underline shadow-xs"
              >
                Start Issuing Credentials
                <ArrowRight size={16} className="ml-2" />
              </Link>
              <Link
                to="/pricing"
                className="inline-flex items-center justify-center px-6 py-3 rounded-full text-sm font-medium text-[var(--pd-ink)] bg-white border border-[var(--pd-line)] hover:bg-slate-50 transition-colors no-underline"
              >
                View Institutional Tiers
              </Link>
            </div>
          </div>
        </section>

        {/* Benefits Grid */}
        <section className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-bold tracking-tight mb-4">
                Uphold professional prestige and eliminate credential fraud
              </h2>
              <p className="text-[var(--pd-mute)] text-sm sm:text-base">
                Protect your council’s seal and give members credentials they can demonstrate to employers, regulators, and international clients.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-7 rounded-2xl border border-[var(--pd-line)] bg-[var(--pd-paper)] space-y-3">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-[var(--pd-line)] text-[var(--pd-indigo)] shadow-2xs">
                  <Building2 size={20} />
                </div>
                <h3 className="font-bold text-lg">Induction & Annual Renewals</h3>
                <p className="text-sm text-[var(--pd-mute)] leading-relaxed">
                  Bulk issue annual practicing certificates, fellow member awards, and induction credentials upon membership dues clearance.
                </p>
              </div>

              <div className="p-7 rounded-2xl border border-[var(--pd-line)] bg-[var(--pd-paper)] space-y-3">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-[var(--pd-line)] text-emerald-600 shadow-2xs">
                  <Shield size={20} />
                </div>
                <h3 className="font-bold text-lg">Instant Regulatory Verification</h3>
                <p className="text-sm text-[var(--pd-mute)] leading-relaxed">
                  Provide corporate employers and government agencies an instant mechanism to confirm active licensing via QR code scanning.
                </p>
              </div>

              <div className="p-7 rounded-2xl border border-[var(--pd-line)] bg-[var(--pd-paper)] space-y-3">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-[var(--pd-line)] text-amber-500 shadow-2xs">
                  <FileCheck size={20} />
                </div>
                <h3 className="font-bold text-lg">Official Seal & Digital Signatures</h3>
                <p className="text-sm text-[var(--pd-mute)] leading-relaxed">
                  Embed your official council seal, registrar signature, and presidential crest into tamper-proof vector templates.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Feature List */}
        <section className="py-20 bg-[var(--pd-paper)] border-y border-[var(--pd-line)]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12">
              Features built for Nigerian professional councils
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                "Bulk issuance for thousands of members in minutes",
                "High-resolution print-ready PDF generation",
                "Automated email delivery with verified badge link",
                "Custom license expiration and annual renewal dates",
                "Multi-admin access for council secretariat staff",
                "Developer API to integrate with membership databases",
                "Secure, hosted verification portal",
                "Transparent Naira billing with official invoices"
              ].map((feat, idx) => (
                <div key={idx} className="flex items-center gap-3 p-4 bg-white rounded-xl border border-[var(--pd-line)]">
                  <Check size={18} className="text-emerald-600 shrink-0 stroke-[2.5]" />
                  <span className="text-sm font-semibold">{feat}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 text-center">
          <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-3xl font-bold mb-4">Transform your institute's credentials</h2>
            <p className="text-[var(--pd-mute)] mb-8">
              Speak with our team or create a test account to experience ProofDeck.
            </p>
            <Link
              to="/signup"
              className="inline-flex items-center justify-center px-6 py-3 rounded-full text-sm font-medium text-white bg-[var(--pd-indigo)] hover:bg-[var(--pd-indigo-dark)] transition-colors no-underline"
            >
              Get Started Now
            </Link>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
