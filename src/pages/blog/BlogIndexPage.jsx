import React from "react";
import { Link } from "react-router-dom";
import PublicHeader from "../../components/PublicHeader";
import PublicFooter from "../../components/PublicFooter";
import SEO from "../../components/SEO";
import { ArrowRight, BookOpen, Clock, Calendar } from "lucide-react";

export default function BlogIndexPage() {
  const articles = [
    {
      slug: "how-to-verify-a-certificate-online",
      title: "How to Verify a Certificate Online (and Spot Fake Credentials in Nigeria)",
      description:
        "Learn how modern employers and institutions verify certificate authenticity using dynamic QR codes, hosted verification portals, and cryptographic ledgers.",
      date: "September 2026",
      readTime: "6 min read",
      category: "Verification & Fraud Prevention",
    },
    {
      slug: "how-to-add-certificate-to-linkedin",
      title: "How to Add a Verifiable Certificate to Your LinkedIn Profile (Step-by-Step Guide)",
      description:
        "A complete walkthrough on adding digital credentials, license numbers, and 1-click verification URLs to your LinkedIn Licenses & Certifications section.",
      date: "September 2026",
      readTime: "5 min read",
      category: "Career & Credentials",
    },
  ];

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
        "name": "Blog & Guides",
        "item": "https://www.proofdeck.app/blog"
      }
    ]
  };

  return (
    <div className="bg-white font-sans text-[var(--pd-ink)] min-h-screen flex flex-col">
      <SEO
        title="ProofDeck Blog — Digital Credential Guides, Verification & Fraud Prevention"
        description="Read comprehensive guides on digital certificates, credential verification, fraud prevention, and issuing verifiable credentials in Nigeria and Africa."
        keywords="digital certificates in Nigeria, how to verify a certificate online, fake certificate checker, add certificate to linkedin profile, credential fraud Nigeria"
        canonicalUrl="https://www.proofdeck.app/blog"
        schemas={[breadcrumbSchema]}
      />
      <PublicHeader />

      <main className="flex-grow">
        {/* Hero */}
        <section className="py-20 md:py-28 bg-[var(--pd-paper)] pd-dot-grid border-b border-[var(--pd-line)] text-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <span className="pd-pill-label mb-4 inline-flex">Resources & Insights</span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
              ProofDeck Guides & Credential Insights
            </h1>
            <p className="text-base sm:text-lg text-[var(--pd-mute)] max-w-2xl mx-auto leading-relaxed">
              Explore best practices, step-by-step guides, and industry analysis on digital credentials, verification infrastructure, and combating certificate forgery in Africa.
            </p>
          </div>
        </section>

        {/* Articles List */}
        <section className="py-20 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="grid md:grid-cols-2 gap-8">
              {articles.map((art, idx) => (
                <article
                  key={idx}
                  className="flex flex-col p-8 rounded-2xl border border-[var(--pd-line)] bg-[var(--pd-paper)] hover:border-slate-300 transition-all shadow-2xs hover:shadow-sm"
                >
                  <div className="flex items-center gap-3 text-xs font-semibold text-[var(--pd-indigo)] mb-4">
                    <span className="bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
                      {art.category}
                    </span>
                    <span className="text-[var(--pd-mute)] flex items-center gap-1 font-normal">
                      <Clock size={12} /> {art.readTime}
                    </span>
                  </div>

                  <h2 className="text-xl font-bold text-[var(--pd-ink)] mb-3 leading-snug">
                    <Link
                      to={`/blog/${art.slug}`}
                      className="hover:text-[var(--pd-indigo)] transition-colors no-underline text-inherit"
                    >
                      {art.title}
                    </Link>
                  </h2>

                  <p className="text-sm text-[var(--pd-mute)] leading-relaxed mb-6 flex-1 font-normal">
                    {art.description}
                  </p>

                  <div className="pt-4 border-t border-[var(--pd-line)] flex items-center justify-between">
                    <span className="text-xs text-[var(--pd-mute)] font-medium flex items-center gap-1">
                      <Calendar size={13} /> {art.date}
                    </span>
                    <Link
                      to={`/blog/${art.slug}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--pd-indigo)] hover:text-[var(--pd-indigo-dark)] transition-colors no-underline"
                    >
                      Read Guide <ArrowRight size={14} />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
