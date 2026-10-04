import React from "react";
import { Link } from "react-router-dom";
import PublicHeader from "../../components/PublicHeader";
import PublicFooter from "../../components/PublicFooter";
import SEO from "../../components/SEO";
import { Buildings, ShieldCheck, Certificate, ArrowRight } from "@phosphor-icons/react";
import Tag from "../../components/ui/Tag";
import IconBadge from "../../components/ui/IconBadge";
import CheckBadge from "../../components/ui/CheckBadge";
import { Ring, Guilloche, Seal, Swirl } from "../../components/ui/decor";

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
        <section className="py-20 md:py-28 bg-[var(--pd-paper)] pd-dot-grid border-b border-[var(--pd-line)] text-center relative overflow-hidden">
          <Ring size={320} className="absolute -top-16 -right-16 text-indigo-50 pointer-events-none" />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
            <Tag tone="indigo" dot className="mb-4">Institutes & Trade Associations</Tag>
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
                <ArrowRight size={16} weight="bold" className="ml-2" />
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
              <div className="p-7 rounded-2xl border border-[var(--pd-line)] bg-[var(--pd-paper)] space-y-4 relative overflow-hidden">
                <Ring size={160} className="absolute -bottom-8 -right-8 text-indigo-50 pointer-events-none" />
                <div className="relative z-10 space-y-3">
                  <IconBadge tone="indigo" size="md" icon={<Buildings weight="duotone" />} />
                  <h3 className="font-bold text-lg">Induction & Annual Renewals</h3>
                  <p className="text-sm text-[var(--pd-mute)] leading-relaxed">
                    Bulk issue annual practicing certificates, fellow member awards, and induction credentials upon membership dues clearance.
                  </p>
                </div>
              </div>

              <div className="p-7 rounded-2xl border border-[var(--pd-line)] bg-[var(--pd-paper)] space-y-4 relative overflow-hidden">
                <Seal size={160} className="absolute -bottom-8 -right-8 text-emerald-50 pointer-events-none" />
                <div className="relative z-10 space-y-3">
                  <IconBadge tone="green" size="md" icon={<ShieldCheck weight="duotone" />} />
                  <h3 className="font-bold text-lg">Instant Regulatory Verification</h3>
                  <p className="text-sm text-[var(--pd-mute)] leading-relaxed">
                    Provide corporate employers and government agencies an instant mechanism to confirm active licensing via QR code scanning.
                  </p>
                </div>
              </div>

              <div className="p-7 rounded-2xl border border-[var(--pd-line)] bg-[var(--pd-paper)] space-y-4 relative overflow-hidden">
                <Guilloche size={160} className="absolute -bottom-8 -right-8 text-amber-50 pointer-events-none" />
                <div className="relative z-10 space-y-3">
                  <IconBadge tone="sun" size="md" icon={<Certificate weight="duotone" />} />
                  <h3 className="font-bold text-lg">Official Seal & Digital Signatures</h3>
                  <p className="text-sm text-[var(--pd-mute)] leading-relaxed">
                    Embed your official council seal, registrar signature, and presidential crest into tamper-proof vector templates.
                  </p>
                </div>
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
                  <CheckBadge tone="green" className="shrink-0" />
                  <span className="text-sm font-semibold">{feat}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto rounded-3xl bg-[var(--pd-indigo)] text-white p-10 md:p-14 text-center relative overflow-hidden">
            <Ring size={320} className="absolute -top-16 -right-16 text-white/10 pointer-events-none" />
            <Swirl size={260} className="absolute -bottom-16 -left-16 text-white/10 pointer-events-none" />
            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold mb-4 text-white">Transform your institute's credentials</h2>
              <p className="text-indigo-100 mb-8 leading-relaxed">
                Speak with our team or create a test account to experience ProofDeck.
              </p>
              <Link
                to="/signup"
                className="inline-flex items-center justify-center px-6 py-3 rounded-full text-sm font-semibold text-[var(--pd-ink)] bg-white hover:bg-slate-100 transition-colors no-underline shadow-sm"
              >
                Get Started Now
              </Link>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
