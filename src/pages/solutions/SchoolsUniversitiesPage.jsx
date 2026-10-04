import React from "react";
import { Link } from "react-router-dom";
import PublicHeader from "../../components/PublicHeader";
import PublicFooter from "../../components/PublicFooter";
import SEO from "../../components/SEO";
import { LockSimple, ShieldCheck, GraduationCap, ArrowRight } from "@phosphor-icons/react";
import Tag from "../../components/ui/Tag";
import IconBadge from "../../components/ui/IconBadge";
import CheckBadge from "../../components/ui/CheckBadge";
import { Ring, Guilloche, Seal, Swirl } from "../../components/ui/decor";

export default function SchoolsUniversitiesPage() {
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
        "item": "https://www.proofdeck.app/solutions/schools-universities"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "Schools & Universities",
        "item": "https://www.proofdeck.app/solutions/schools-universities"
      }
    ]
  };

  return (
    <div className="bg-white font-sans text-[var(--pd-ink)] min-h-screen flex flex-col">
      <SEO
        title="Digital Certificate & Verification Platform for Nigerian Schools & Universities | ProofDeck"
        description="Prevent academic credential forgery and automate graduation certificate issuance with tamper-proof QR codes and digital transcripts for Nigerian schools and tertiary institutions."
        keywords="digital certificate for Nigerian university, school certificate verification platform, academic credential verification Nigeria, tertiary institution certificate maker, prevent certificate forgery"
        canonicalUrl="https://www.proofdeck.app/solutions/schools-universities"
        schemas={[breadcrumbSchema]}
      />
      <PublicHeader />

      <main className="flex-grow">
        {/* Hero */}
        <section className="py-20 md:py-28 bg-[var(--pd-paper)] pd-dot-grid border-b border-[var(--pd-line)] text-center relative overflow-hidden">
          <Ring size={320} className="absolute -top-16 -right-16 text-indigo-50 pointer-events-none" />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
            <Tag tone="indigo" dot className="mb-4">Tertiary & Secondary Education</Tag>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
              School & University Certificate Verification Platform
            </h1>
            <p className="text-base sm:text-lg text-[var(--pd-mute)] max-w-2xl mx-auto leading-relaxed mb-8">
              Protect your institution's academic reputation. Issue tamper-evident diplomas, graduation degrees, and short-course certificates with instant QR verification.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                className="inline-flex items-center justify-center px-6 py-3 rounded-full text-sm font-medium text-white bg-[var(--pd-indigo)] hover:bg-[var(--pd-indigo-dark)] transition-colors no-underline shadow-xs"
              >
                Register Institution Account
                <ArrowRight size={16} weight="bold" className="ml-2" />
              </Link>
              <Link
                to="/pricing"
                className="inline-flex items-center justify-center px-6 py-3 rounded-full text-sm font-medium text-[var(--pd-ink)] bg-white border border-[var(--pd-line)] hover:bg-slate-50 transition-colors no-underline"
              >
                View Institutional Pricing
              </Link>
            </div>
          </div>
        </section>

        {/* Benefits Grid */}
        <section className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-bold tracking-tight mb-4">
                Safeguard academic integrity and combat forged credentials
              </h2>
              <p className="text-[var(--pd-mute)] text-sm sm:text-base">
                Manual registrar verification calls and physical seal verification waste weeks. ProofDeck delivers instant, tamper-proof verification.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-7 rounded-2xl border border-[var(--pd-line)] bg-[var(--pd-paper)] space-y-4 relative overflow-hidden">
                <Ring size={160} className="absolute -bottom-8 -right-8 text-indigo-50 pointer-events-none" />
                <div className="relative z-10 space-y-3">
                  <IconBadge tone="indigo" size="md" icon={<LockSimple weight="duotone" />} />
                  <h3 className="font-bold text-lg">Combat Credential Forgery</h3>
                  <p className="text-sm text-[var(--pd-mute)] leading-relaxed">
                    Prevent Photoshop tampering. Each certificate generated by ProofDeck links to a cryptographic ledger verifying student name, degree class, and graduation year.
                  </p>
                </div>
              </div>

              <div className="p-7 rounded-2xl border border-[var(--pd-line)] bg-[var(--pd-paper)] space-y-4 relative overflow-hidden">
                <Seal size={160} className="absolute -bottom-8 -right-8 text-emerald-50 pointer-events-none" />
                <div className="relative z-10 space-y-3">
                  <IconBadge tone="green" size="md" icon={<ShieldCheck weight="duotone" />} />
                  <h3 className="font-bold text-lg">Instant Employer Screening</h3>
                  <p className="text-sm text-[var(--pd-mute)] leading-relaxed">
                    Employers and international embassies can scan the printed diploma's QR code to verify authenticity in seconds without contacting registrar archives.
                  </p>
                </div>
              </div>

              <div className="p-7 rounded-2xl border border-[var(--pd-line)] bg-[var(--pd-paper)] space-y-4 relative overflow-hidden">
                <Guilloche size={160} className="absolute -bottom-8 -right-8 text-amber-50 pointer-events-none" />
                <div className="relative z-10 space-y-3">
                  <IconBadge tone="sun" size="md" icon={<GraduationCap weight="duotone" />} />
                  <h3 className="font-bold text-lg">Graduation Class Bulk Issuance</h3>
                  <p className="text-sm text-[var(--pd-mute)] leading-relaxed">
                    Upload an entire graduating class spreadsheet. ProofDeck renders individualized high-resolution certificates with matriculation numbers and official seals.
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
              Institutional academic capabilities
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                "Bulk issuance for thousands of graduating students",
                "High-resolution vector PDF downloads for ceremonial printing",
                "Automated email delivery with verified credential links",
                "Unique QR codes that remain valid on physical printouts",
                "Restricted privacy controls protecting student records",
                "Official seal and multi-signature design tools",
                "Pay-as-you-go Naira billing with lifetime credit validity",
                "Developer API to sync with student information systems (SIS)"
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
              <h2 className="text-3xl font-bold mb-4 text-white">Protect your institution’s degrees</h2>
              <p className="text-indigo-100 mb-8 leading-relaxed">
                Experience the modern standard for issuing verifiable academic credentials.
              </p>
              <Link
                to="/signup"
                className="inline-flex items-center justify-center px-6 py-3 rounded-full text-sm font-semibold text-[var(--pd-ink)] bg-white hover:bg-slate-100 transition-colors no-underline shadow-sm"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
