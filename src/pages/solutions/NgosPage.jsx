import React from "react";
import { Link } from "react-router-dom";
import PublicHeader from "../../components/PublicHeader";
import PublicFooter from "../../components/PublicFooter";
import SEO from "../../components/SEO";
import { Check, Heart, Users, ShieldCheck, Mail, ArrowRight, Globe } from "lucide-react";

export default function NgosPage() {
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
        "item": "https://www.proofdeck.app/solutions/ngos"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "NGOs & Nonprofits",
        "item": "https://www.proofdeck.app/solutions/ngos"
      }
    ]
  };

  return (
    <div className="bg-white font-sans text-[var(--pd-ink)] min-h-screen flex flex-col">
      <SEO
        title="NGO Certificate Generator Africa — Verifiable Workshop & Volunteer Credentials | ProofDeck"
        description="Issue tamper-proof certificates of participation for NGO workshops, donor-funded trainings, and webinars across Nigeria and Africa. Transparent pay-as-you-go Naira billing."
        keywords="NGO certificate generator Africa, certificate of participation for webinar, certificate maker for training program, verifiable attendance certificate for ngos nigeria, digital certificate for workshop attendees, volunteer certificate maker"
        canonicalUrl="https://www.proofdeck.app/solutions/ngos"
        schemas={[breadcrumbSchema]}
      />
      <PublicHeader />

      <main className="flex-grow">
        {/* Hero */}
        <section className="py-20 md:py-28 bg-[var(--pd-paper)] pd-dot-grid border-b border-[var(--pd-line)] text-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <span className="pd-pill-label mb-4 inline-flex">Nonprofits & Impact Programs</span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
              NGO Certificate Generator for Africa
            </h1>
            <p className="text-base sm:text-lg text-[var(--pd-mute)] max-w-2xl mx-auto leading-relaxed mb-8">
              Issue verifiable certificates of participation and completion for grant programs, virtual summits, workshops, and volunteer cohorts with zero paperwork and instant auditability.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                className="inline-flex items-center justify-center px-6 py-3 rounded-full text-sm font-medium text-white bg-[var(--pd-indigo)] hover:bg-[var(--pd-indigo-dark)] transition-colors no-underline shadow-xs"
              >
                Create Free NGO Account
                <ArrowRight size={16} className="ml-2" />
              </Link>
              <Link
                to="/pricing"
                className="inline-flex items-center justify-center px-6 py-3 rounded-full text-sm font-medium text-[var(--pd-ink)] bg-white border border-[var(--pd-line)] hover:bg-slate-50 transition-colors no-underline"
              >
                Explore Pricing in Naira
              </Link>
            </div>
          </div>
        </section>

        {/* Benefits Grid */}
        <section className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-bold tracking-tight mb-4">
                Designed for grassroots and international NGOs
              </h2>
              <p className="text-[var(--pd-mute)] text-sm sm:text-base">
                Ensure your training and grant initiatives meet strict donor compliance with auditable, fraud-resistant credentials.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-7 rounded-2xl border border-[var(--pd-line)] bg-[var(--pd-paper)] space-y-3">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-[var(--pd-line)] text-red-500 shadow-2xs">
                  <Heart size={20} />
                </div>
                <h3 className="font-bold text-lg">Webinar & Workshop Certificates</h3>
                <p className="text-sm text-[var(--pd-mute)] leading-relaxed">
                  Easily generate certificates of participation for 50 to 5,000+ attendees following virtual summits, community development seminars, or vocational workshops.
                </p>
              </div>

              <div className="p-7 rounded-2xl border border-[var(--pd-line)] bg-[var(--pd-paper)] space-y-3">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-[var(--pd-line)] text-[var(--pd-indigo)] shadow-2xs">
                  <Globe size={20} />
                </div>
                <h3 className="font-bold text-lg">Donor Reporting & Compliance</h3>
                <p className="text-sm text-[var(--pd-mute)] leading-relaxed">
                  Provide verified proof of training delivery to funding partners. Export detailed issuance logs with recipient timestamps and verification status.
                </p>
              </div>

              <div className="p-7 rounded-2xl border border-[var(--pd-line)] bg-[var(--pd-paper)] space-y-3">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-[var(--pd-line)] text-emerald-600 shadow-2xs">
                  <ShieldCheck size={20} />
                </div>
                <h3 className="font-bold text-lg">Fraud & Forgery Protection</h3>
                <p className="text-sm text-[var(--pd-mute)] leading-relaxed">
                  Prevent malicious actors from editing certificates in Photoshop. Each credential includes a secure verification QR code linked to ProofDeck's ledger.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Feature List */}
        <section className="py-20 bg-[var(--pd-paper)] border-y border-[var(--pd-line)]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12">
              Key advantages for non-profit teams
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                "Affordable pay-as-you-go packs — no monthly commitment",
                "Automated email dispatch to all participants",
                "Custom co-branding with donor & partner logos",
                "High-resolution PDF generation ready for printing",
                "Pay directly in Naira with local invoice/receipt generation",
                "Credits never expire — carry over between grant cycles",
                "CSV participant list upload in seconds",
                "Dedicated volunteer recognition certificates"
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
            <h2 className="text-3xl font-bold mb-4">Empower your training participants</h2>
            <p className="text-[var(--pd-mute)] mb-8">
              Issue professional, verifiable certificates for your next community program.
            </p>
            <Link
              to="/signup"
              className="inline-flex items-center justify-center px-6 py-3 rounded-full text-sm font-medium text-white bg-[var(--pd-indigo)] hover:bg-[var(--pd-indigo-dark)] transition-colors no-underline"
            >
              Get Started with ProofDeck
            </Link>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
