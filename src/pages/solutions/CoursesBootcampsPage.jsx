import React from "react";
import { Link } from "react-router-dom";
import PublicHeader from "../../components/PublicHeader";
import PublicFooter from "../../components/PublicFooter";
import SEO from "../../components/SEO";
import { Check, GraduationCap, Award, ShieldCheck, Zap, ArrowRight, Linkedin } from "lucide-react";

export default function CoursesBootcampsPage() {
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
        "item": "https://www.proofdeck.app/solutions/courses-bootcamps"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "Courses & Bootcamps",
        "item": "https://www.proofdeck.app/solutions/courses-bootcamps"
      }
    ]
  };

  return (
    <div className="bg-white font-sans text-[var(--pd-ink)] min-h-screen flex flex-col">
      <SEO
        title="Certificate Maker for Online Courses & Coding Bootcamps | ProofDeck"
        description="Issue verifiable digital certificates for course cohorts and tech bootcamps in Nigeria and Africa. Bulk CSV generation, 1-click LinkedIn credentials, and instant QR verification."
        keywords="certificate for online course Nigeria, certificate maker for coding bootcamp, issue certificates for cohort-based course, LMS certificate integration Nigeria, bulk certificate generator for tech cohorts, verifiable credentials edtech"
        canonicalUrl="https://www.proofdeck.app/solutions/courses-bootcamps"
        schemas={[breadcrumbSchema]}
      />
      <PublicHeader />

      <main className="flex-grow">
        {/* Hero */}
        <section className="py-20 md:py-28 bg-[var(--pd-paper)] pd-dot-grid border-b border-[var(--pd-line)] text-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <span className="pd-pill-label mb-4 inline-flex">EdTech & Cohorts</span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
              Certificate Maker for Online Courses & Coding Bootcamps
            </h1>
            <p className="text-base sm:text-lg text-[var(--pd-mute)] max-w-2xl mx-auto leading-relaxed mb-8">
              Empower your graduates with tamper-proof certificates they can proudly add to LinkedIn in one click. Automate cohort certificate generation from Excel/CSV in under 3 minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                className="inline-flex items-center justify-center px-6 py-3 rounded-full text-sm font-medium text-white bg-[var(--pd-indigo)] hover:bg-[var(--pd-indigo-dark)] transition-colors no-underline shadow-xs"
              >
                Issue Cohort Certificates Free
                <ArrowRight size={16} className="ml-2" />
              </Link>
              <Link
                to="/pricing"
                className="inline-flex items-center justify-center px-6 py-3 rounded-full text-sm font-medium text-[var(--pd-ink)] bg-white border border-[var(--pd-line)] hover:bg-slate-50 transition-colors no-underline"
              >
                View Naira Pricing
              </Link>
            </div>
          </div>
        </section>

        {/* Benefits Grid */}
        <section className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-bold tracking-tight mb-4">
                Built specifically for African tech educators
              </h2>
              <p className="text-[var(--pd-mute)] text-sm sm:text-base">
                Stop designing certificates manually in Canva or dealing with Photoshop templates. ProofDeck automates the entire delivery pipeline.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-7 rounded-2xl border border-[var(--pd-line)] bg-[var(--pd-paper)] space-y-3">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-[var(--pd-line)] text-[var(--pd-indigo)] shadow-2xs">
                  <GraduationCap size={20} />
                </div>
                <h3 className="font-bold text-lg">Bulk Issue 500+ Certificates</h3>
                <p className="text-sm text-[var(--pd-mute)] leading-relaxed">
                  Export your student cohort spreadsheet from Google Sheets, LMS, or Notion. Upload it to ProofDeck, map the names, and issue the entire batch at once.
                </p>
              </div>

              <div className="p-7 rounded-2xl border border-[var(--pd-line)] bg-[var(--pd-paper)] space-y-3">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-[var(--pd-line)] text-[#0A66C2] shadow-2xs">
                  <Linkedin size={20} />
                </div>
                <h3 className="font-bold text-lg">1-Click LinkedIn Sharing</h3>
                <p className="text-sm text-[var(--pd-mute)] leading-relaxed">
                  Graduates receive an automated email with a direct button that populates their LinkedIn "Licenses & Certifications" profile section with your academy's name and ID.
                </p>
              </div>

              <div className="p-7 rounded-2xl border border-[var(--pd-line)] bg-[var(--pd-paper)] space-y-3">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-[var(--pd-line)] text-emerald-600 shadow-2xs">
                  <ShieldCheck size={20} />
                </div>
                <h3 className="font-bold text-lg">Tamper-Proof QR Code</h3>
                <p className="text-sm text-[var(--pd-mute)] leading-relaxed">
                  Every certificate carries a cryptographic QR code that allows employers and recruiters to verify graduation authenticity in 1 second.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Feature List */}
        <section className="py-20 bg-[var(--pd-paper)] border-y border-[var(--pd-line)]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12">
              Everything course creators need
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                "Bulk CSV and Excel cohort upload",
                "Instant PDF downloads for students",
                "Automated email dispatch with custom branding",
                "Developer REST API for LMS webhook integration",
                "Naira card billing via Paystack (No dollar limits)",
                "Custom instructor signatures and academy logos",
                "Lifetime validity — credits never expire",
                "Custom credential IDs & completion dates"
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
            <h2 className="text-3xl font-bold mb-4">Ready to issue your next cohort?</h2>
            <p className="text-[var(--pd-mute)] mb-8">
              Join leading tech bootcamps and academies issuing credentials on ProofDeck.
            </p>
            <Link
              to="/signup"
              className="inline-flex items-center justify-center px-6 py-3 rounded-full text-sm font-medium text-white bg-[var(--pd-indigo)] hover:bg-[var(--pd-indigo-dark)] transition-colors no-underline"
            >
              Start Issuing Today
            </Link>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
