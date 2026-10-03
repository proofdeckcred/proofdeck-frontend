import React, { useState } from "react";
import { Link } from "react-router-dom";
import PublicHeader from "../components/PublicHeader";
import PublicFooter from "../components/PublicFooter";
import { Check, ChevronDown, ChevronUp, Sparkles, MessageSquare } from "lucide-react";
import SEO from "../components/SEO";
import CustomPricingModal from "../components/CustomPricingModal";

const PricingCard = ({ plan, isPopular }) => {
  return (
    <div
      className={`relative flex flex-col p-8 rounded-2xl border transition-colors ${
        isPopular
          ? "border-[var(--pd-indigo)] z-10"
          : "border-[var(--pd-line)] bg-white hover:border-[var(--pd-mute)]/30"
      }`}
      style={{
        boxShadow: "var(--pd-shadow)",
        ...(isPopular ? { background: "linear-gradient(135deg, #f0edff 0%, #e8e4ff 50%, #f5f3ff 100%)" } : { background: "white" }),
      }}
    >
      {isPopular && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className="px-4 py-1.5 bg-[var(--pd-amber)] text-[var(--pd-ink)] rounded-full text-xs font-bold">
            Best value
          </span>
        </div>
      )}

      <h3 className="text-lg font-bold text-[var(--pd-ink)] mb-2">{plan.name}</h3>
      <p className="text-[var(--pd-mute)] text-sm mb-6 h-10 leading-relaxed">{plan.for}</p>

      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-4xl font-bold text-[var(--pd-ink)] tracking-tight tabular-nums">
          {plan.priceNGN}
        </span>
        <span className="text-sm font-medium text-[var(--pd-mute)] bg-[var(--pd-paper)] px-2 py-0.5 rounded-md border border-[var(--pd-line)]">
          {plan.priceUSD}
        </span>
      </div>
      <span className="text-[var(--pd-mute)] text-xs font-medium block mb-3">
        {plan.interval === "yearly" ? "Billed annually" : "One-time payment"}
      </span>
      <p className="text-xs font-medium text-[var(--pd-indigo)] bg-[var(--pd-paper)] inline-block py-1 px-2.5 rounded-full mb-4 w-max border border-[var(--pd-line)]">
        {plan.certs} Credits Included
      </p>

      {plan.rolloverNotice && (
        <div className="mb-6 p-2.5 bg-amber-50 border border-amber-200/80 rounded-xl text-[11px] text-amber-900 leading-snug">
          <span className="font-bold">Partial Rollover:</span> {plan.rolloverNotice}
        </div>
      )}

      <div className="bg-[var(--pd-paper)] rounded-xl py-3 px-4 mb-8 border border-[var(--pd-line)] flex items-center justify-between">
        <div>
          <p className="text-xs text-[var(--pd-mute)] font-medium">Cost per cert</p>
          <p className="font-bold text-[var(--pd-ink)] text-sm">{plan.costPerCert}</p>
        </div>
        <div className="h-8 w-px bg-[var(--pd-line)]"></div>
        <div className="text-right">
          <p className="text-xs text-[var(--pd-mute)] font-medium">Validity</p>
          <p className="font-bold text-[var(--pd-ink)] text-sm">{plan.validity || "Lifetime"}</p>
        </div>
      </div>

      <ul className="space-y-3.5 mb-8 flex-1">
        {plan.features.map((feat, idx) => (
          <li key={idx} className="flex items-start text-sm text-[var(--pd-ink)]">
            <Check size={14} className="text-[var(--pd-success)] shrink-0 mr-2.5 mt-0.5 stroke-[2.5]" />
            {feat}
          </li>
        ))}
      </ul>

      <Link
        to={`/signup?plan=${plan.name.toLowerCase()}`}
        className={`w-full py-3 px-4 rounded-full text-sm font-medium text-center transition-colors no-underline ${
          isPopular
            ? "bg-[var(--pd-indigo)] text-white hover:bg-[var(--pd-indigo-dark)]"
            : "bg-white text-[var(--pd-ink)] border border-[var(--pd-line)] hover:bg-[var(--pd-paper)]"
        }`}
      >
        Choose {plan.name}
      </Link>
    </div>
  );
};

const PricingPage = () => {
  const plans = [
    {
      name: "Starter",
      priceNGN: "₦15,000",
      priceUSD: "$11.35",
      certs: "100",
      costPerCert: "₦150 (~$0.11)",
      for: "Single event, small workshop, first-time test",
      features: [
        "100 Credits Included",
        "Unlimited Template Designs",
        "Secure Email Delivery",
        "High-Res PDF Downloads",
        "Basic Verification Portal",
      ],
    },
    {
      name: "Growth",
      priceNGN: "₦45,000",
      priceUSD: "$34.00",
      certs: "400",
      costPerCert: "₦112 (~$0.08)",
      for: "Regular training academies, secondary schools",
      features: [
        "400 Credits Included",
        "Unlimited Template Designs",
        "Bulk Issuance via CSV / Excel",
        "Batch ZIP Downloads",
        "Secure Email Delivery",
        "Priority Support Channel",
      ],
    },
    {
      name: "Pro",
      priceNGN: "₦90,000",
      priceUSD: "$68.00",
      certs: "1,200",
      costPerCert: "₦75 (~$0.05)",
      for: "Large bootcamps, institutes, multi-cohort schools",
      features: [
        "1,200 Credits Included",
        "Everything in Growth",
        "Developer REST API Access",
        "Custom Logo & Digital Signatures",
        "1-Click 'Add to LinkedIn' Sharing",
        "Team Workspace Collaboration",
      ],
    },
    {
      name: "Enterprise",
      priceNGN: "₦1,500,000",
      priceUSD: "$1,135.00",
      certs: "10,000",
      costPerCert: "₦150 (~$0.11)",
      for: "Universities, institutions, enterprise corporations",
      interval: "yearly",
      validity: "12 Months (Renewable)",
      rolloverNotice: "Unused credits roll over once when you renew, up to 25%. 60-day renewal grace period.",
      features: [
        "10,000 credentials per year",
        "Custom domain & 100% white-label (SSL included)",
        "Zero ProofDeck branding on certificates, emails and verification pages",
        "Everything in Pro (API, bulk processing, team workspace)",
        "Multi-seat organization access",
        "Onboarding assistance & priority support",
        "Previously issued credentials stay verifiable",
      ],
    },
  ];

  const [openFaq, setOpenFaq] = useState(null);
  const [openCustomModal, setOpenCustomModal] = useState(false);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const pricingFaqs = [
    {
      question: "How does the Enterprise annual plan and credit rollover work?",
      answer:
        "The Enterprise plan is billed annually at ₦1,500,000 / year and includes 10,000 credential credits valid for 12 months. Unused credits roll over once when you renew, up to 25% (up to 2,500 credits). If you choose not to renew, all previously issued credentials stay verifiable forever, and any remaining unused credits expire after a 60-day grace period.",
    },
    {
      question: "Can I use my own custom domain and branding for verification?",
      answer:
        "Yes! Enterprise plans include full custom domain support (e.g. credentials.yourcompany.com) with automated Cloudflare SSL certificates, custom logos, primary brand colors, and custom email sender names. The entire verification experience runs 100% under your brand identity with zero ProofDeck badges.",
    },
    {
      question: "Can I pay in Nigerian Naira (NGN) with a local debit card?",
      answer:
        "Yes! ProofDeck natively supports Nigerian debit cards (Mastercard, Visa, Verve), direct bank transfers, and USSD via our secure Paystack integration. No foreign currency conversion fees or virtual dollar card hassles.",
    },
    {
      question: "Do credential credits ever expire?",
      answer:
        "On Starter, Growth, and Pro tiers, credits never expire and have lifetime validity. On the Enterprise annual plan, credits are valid for 12 months, with up to 25% of unused credits rolling over into your new term when you renew.",
    },
    {
      question: "Are there any monthly subscriptions or recurring fees?",
      answer:
        "Starter, Growth, and Pro are strictly pay-as-you-go with no recurring subscriptions. Enterprise is an annual plan with 12-month validity that can be renewed or cancelled anytime.",
    },
    {
      question: "Can I issue certificates in bulk using CSV or Excel files?",
      answer:
        "Yes, our Growth, Pro, and Enterprise tiers include one-click bulk CSV/Excel upload with dynamic variable mapping (Recipient Name, Issue Date, Course Title, Custom IDs) and automated email delivery.",
    },
    {
      question: "What is included in the Developer REST API?",
      answer:
        "Pro and Enterprise plans include full API access, allowing automated credential creation, batch issuance, webhook notifications, and custom integrations with your LMS, HR system, or event software.",
    },
    {
      question: "How does QR code verification protect certificates?",
      answer:
        "Every certificate issued through ProofDeck includes a cryptographically unique verification code and QR code. Employers and verifiers can scan the QR code to confirm authenticity instantly without exposing your database.",
    },
  ];

  const productSchema = {
    "@type": "Product",
    "name": "ProofDeck Credential Credits",
    "description": "Digital certificate issuing plans and credits for Nigerian and African organizations.",
    "brand": {
      "@type": "Brand",
      "name": "ProofDeck"
    },
    "offers": {
      "@type": "AggregateOffer",
      "priceCurrency": "NGN",
      "lowPrice": "15000",
      "highPrice": "1500000",
      "offerCount": "4",
      "offers": plans.map(p => ({
        "@type": "Offer",
        "name": `${p.name} Plan (${p.certs} Credits)`,
        "price": p.priceNGN.replace(/[^0-9]/g, ""),
        "priceCurrency": "NGN",
        "availability": "https://schema.org/InStock",
        "url": "https://www.proofdeck.app/pricing"
      }))
    }
  };

  const faqSchema = {
    "@type": "FAQPage",
    "mainEntity": pricingFaqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

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
        "name": "Pricing",
        "item": "https://www.proofdeck.app/pricing"
      }
    ]
  };

  return (
    <div className="bg-white font-sans text-[var(--pd-ink)]">
      <SEO
        title="Pay-As-You-Go Certificate Generator Pricing in Naira (NGN) | ProofDeck"
        description="Affordable, pay-as-you-go digital certificate pricing in Nigerian Naira (NGN) and USD. Starting at ₦15,000 for 100 certificates. No monthly subscriptions, credits never expire. Pay via Paystack or card."
        keywords="certificate maker Nigeria price, cheap certificate generator pay in naira, certifier alternative with paystack, digital credential platform pricing in ngn, certificate generator in naira, buy digital certificate platform paystack"
        canonicalUrl="https://www.proofdeck.app/pricing"
        schemas={[productSchema, faqSchema, breadcrumbSchema]}
      />
      <PublicHeader />
      <main>
        {/* Hero Section */}
        <section className="relative py-24 text-center bg-[var(--pd-paper)]">
          <div className="max-w-4xl mx-auto px-6">
            <span className="pd-pill-label mb-4 inline-flex">Pricing</span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-[var(--pd-ink)] tracking-tight mb-6 leading-tight pt-4">
              Transparent Naira pricing.<br />
              Pay only for what you issue.
            </h1>
            <p className="text-base sm:text-lg text-[var(--pd-mute)] mb-8 max-w-2xl mx-auto leading-relaxed font-normal">
              ProofDeck uses a pay-as-you-go credit system. One certificate equals one
              credit. No recurring monthly fees. Credits never expire.
            </p>
          </div>
        </section>

        {/* Pricing Cards Section */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-4 gap-8 items-start">
              {plans.map((plan) => (
                <PricingCard
                  key={plan.name}
                  plan={plan}
                  isPopular={plan.name === "Pro"}
                />
              ))}
            </div>

            {/* Want Custom? Landscape Banner */}
            <div className="mt-12 bg-slate-900 text-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 border border-slate-800 shadow-sm">
              <div className="flex items-center gap-4 text-center sm:text-left">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 hidden sm:flex">
                  <Sparkles size={24} />
                </div>
                <div>
                  <div className="inline-flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
                      Tailored High-Volume
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-1">
                    Need more than 10,000 credentials or custom integrations?
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 mb-0">
                    Bespoke high-volume packs, custom SLAs, and specialized LMS/ERP integrations available.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpenCustomModal(true)}
                className="w-full sm:w-auto px-6 py-3 bg-white text-slate-900 hover:bg-slate-100 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm shrink-0 flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
              >
                Want custom? <span className="text-indigo-600 font-extrabold underline">Talk to Us</span>
              </button>
            </div>
          </div>
        </section>

        {/* Feature Comparison */}
        <section className="py-24 bg-[var(--pd-paper)] border-y border-[var(--pd-line)]">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-[var(--pd-ink)] mb-4">Everything needed to issue at scale</h2>
              <p className="text-lg text-[var(--pd-mute)]">Robust features included with every single plan.</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-2xl border border-[var(--pd-line)]" style={{ boxShadow: "var(--pd-shadow)" }}>
                <h3 className="font-bold text-[var(--pd-ink)] text-xl mb-6">
                  Available on All Plans
                </h3>
                <ul className="space-y-4">
                  {[
                    "Secure certificate verification", 
                    "PDF certificate downloads",
                    "Email delivery to recipients",
                    "Unlimited templates design",
                    "Fraud-resistant certificate IDs"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-[var(--pd-ink)] text-sm">
                      <Check size={16} className="text-[var(--pd-success)] shrink-0 stroke-[2.5]" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-[var(--pd-ink)] p-8 rounded-2xl text-white" style={{ boxShadow: "var(--pd-shadow)" }}>
                <h3 className="font-bold text-white text-xl mb-6">
                  Pro & Enterprise Exclusives
                </h3>
                <ul className="space-y-4">
                  {[
                    "Full API Access", 
                    "SLA-backed support guarantees",
                    "Custom onboarding & staff training",
                    "Onboarding Assistance & Priority Support",
                    "Advanced Analytics Dashboard"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-white/70 text-sm">
                      <Check size={16} className="text-[var(--pd-indigo)] shrink-0 stroke-[2.5]" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 md:py-24 bg-white border-b border-[var(--pd-line)]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <span className="pd-pill-label mb-4 inline-flex">Pricing FAQ</span>
              <h2 className="text-3xl font-bold text-[var(--pd-ink)] tracking-tight">
                Frequently Asked Pricing Questions
              </h2>
              <p className="mt-3 text-sm text-[var(--pd-mute)]">
                Everything you need to know about payments, credits, and billing in Nigeria and Africa.
              </p>
            </div>

            <div className="space-y-3">
              {pricingFaqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={idx}
                    className="border border-[var(--pd-line)] rounded-2xl p-5 bg-white transition-all shadow-2xs hover:border-slate-300"
                  >
                    <button
                      onClick={() => toggleFaq(idx)}
                      className="w-full flex items-center justify-between text-left font-bold text-[var(--pd-ink)] text-sm sm:text-base focus:outline-none"
                    >
                      <span>{faq.question}</span>
                      {isOpen ? (
                        <ChevronUp size={18} className="text-[var(--pd-indigo)] shrink-0 ml-4" />
                      ) : (
                        <ChevronDown size={18} className="text-slate-400 shrink-0 ml-4" />
                      )}
                    </button>
                    {isOpen && (
                      <p className="mt-3 text-xs sm:text-sm text-[var(--pd-mute)] leading-relaxed font-normal">
                        {faq.answer}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 bg-[var(--pd-paper)]">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold text-[var(--pd-ink)] mb-6">
              Start issuing certificates within minutes
            </h2>
            <p className="text-lg text-[var(--pd-mute)] mb-10 max-w-2xl mx-auto">
              No complex setup. No long onboarding. Choose a credit pack and start
              issuing verifiable certificates today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-white bg-[var(--pd-indigo)] rounded-full hover:bg-[var(--pd-indigo-dark)] transition-colors no-underline"
              >
                Get started with ProofDeck
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-[var(--pd-ink)] bg-white border border-[var(--pd-line)] hover:bg-[var(--pd-paper)] rounded-full transition-colors no-underline"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </section>

        <CustomPricingModal
          isOpen={openCustomModal}
          onClose={() => setOpenCustomModal(false)}
        />
      </main>
      <PublicFooter />
    </div>
  );
};

export default PricingPage;
