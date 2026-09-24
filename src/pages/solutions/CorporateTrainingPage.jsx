import React from "react";
import { Link } from "react-router-dom";
import PublicHeader from "../../components/PublicHeader";
import PublicFooter from "../../components/PublicFooter";
import SEO from "../../components/SEO";
import { Check, Briefcase, Award, TrendingUp, ArrowRight, ShieldCheck } from "lucide-react";

export default function CorporateTrainingPage() {
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
        "item": "https://www.proofdeck.app/solutions/corporate-training"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "Corporate L&D",
        "item": "https://www.proofdeck.app/solutions/corporate-training"
      }
    ]
  };

  return (
    <div className="bg-white font-sans text-[var(--pd-ink)] min-h-screen flex flex-col">
      <SEO
        title="Corporate Training & Employee Certificate Platform | ProofDeck"
        description="Automate employee recognition, compliance training certifications, and internal upskilling credentials for enterprise teams and HR departments in Nigeria."
        keywords="employee training certificate platform Nigeria, HR certificate management Africa, corporate certificate generator, bulk employee training certificates, digital credentials corporate HR"
        canonicalUrl="https://www.proofdeck.app/solutions/corporate-training"
        schemas={[breadcrumbSchema]}
      />
      <PublicHeader />

      <main className="flex-grow">
        {/* Hero */}
        <section className="py-20 md:py-28 bg-[var(--pd-paper)] pd-dot-grid border-b border-[var(--pd-line)] text-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <span className="pd-pill-label mb-4 inline-flex">Corporate L&D & HR Teams</span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
              Employee Training & Corporate Certificate Platform
            </h1>
            <p className="text-base sm:text-lg text-[var(--pd-mute)] max-w-2xl mx-auto leading-relaxed mb-8">
              Recognize employee achievements, automate mandatory compliance certification, and track workforce upskilling with professional digital credentials.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                className="inline-flex items-center justify-center px-6 py-3 rounded-full text-sm font-medium text-white bg-[var(--pd-indigo)] hover:bg-[var(--pd-indigo-dark)] transition-colors no-underline shadow-xs"
              >
                Start Issuing Employee Credentials
                <ArrowRight size={16} className="ml-2" />
              </Link>
              <Link
                to="/pricing"
                className="inline-flex items-center justify-center px-6 py-3 rounded-full text-sm font-medium text-[var(--pd-ink)] bg-white border border-[var(--pd-line)] hover:bg-slate-50 transition-colors no-underline"
              >
                View Enterprise Packages
              </Link>
            </div>
          </div>
        </section>

        {/* Benefits Grid */}
        <section className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-bold tracking-tight mb-4">
                Streamline internal training recognition
              </h2>
              <p className="text-[var(--pd-mute)] text-sm sm:text-base">
                Equip your People & Culture team with tools to incentivize professional growth and celebrate employee milestones.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-7 rounded-2xl border border-[var(--pd-line)] bg-[var(--pd-paper)] space-y-3">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-[var(--pd-line)] text-[var(--pd-indigo)] shadow-2xs">
                  <Briefcase size={20} />
                </div>
                <h3 className="font-bold text-lg">Mandatory Compliance Training</h3>
                <p className="text-sm text-[var(--pd-mute)] leading-relaxed">
                  Automate certificate delivery for AML, cyber hygiene, data privacy, and workplace safety training with verifiable completion records.
                </p>
              </div>

              <div className="p-7 rounded-2xl border border-[var(--pd-line)] bg-[var(--pd-paper)] space-y-3">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-[var(--pd-line)] text-emerald-600 shadow-2xs">
                  <Award size={20} />
                </div>
                <h3 className="font-bold text-lg">Employee Recognition & Awards</h3>
                <p className="text-sm text-[var(--pd-mute)] leading-relaxed">
                  Boost morale with quarterly high-performer certificates, hackathon trophies, leadership program completions, and tenure milestones.
                </p>
              </div>

              <div className="p-7 rounded-2xl border border-[var(--pd-line)] bg-[var(--pd-paper)] space-y-3">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-[var(--pd-line)] text-indigo-500 shadow-2xs">
                  <TrendingUp size={20} />
                </div>
                <h3 className="font-bold text-lg">Employer Brand Amplification</h3>
                <p className="text-sm text-[var(--pd-mute)] leading-relaxed">
                  When employees share their ProofDeck credentials on LinkedIn, your company branding and reputation as a great place to learn expands organically.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Feature List */}
        <section className="py-20 bg-[var(--pd-paper)] border-y border-[var(--pd-line)]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12">
              Enterprise features for modern HR
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                "Bulk CSV department uploads for simultaneous issuing",
                "Automated email dispatch to corporate mailboxes",
                "Executive signatures and high-res company branding",
                "Full API integration with internal HRMS and LMS platforms",
                "Audit logs and timestamped issuance ledgers",
                "Direct Paystack Naira card checkout or corporate invoices",
                "No expiration on purchased credential credits",
                "Role-based multi-user workspace access for HR coordinators"
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
            <h2 className="text-3xl font-bold mb-4">Upskill and recognize your team today</h2>
            <p className="text-[var(--pd-mute)] mb-8">
              Join forward-thinking corporate HR teams using ProofDeck for learning recognition.
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
