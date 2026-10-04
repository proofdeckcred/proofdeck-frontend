import React, { useState } from "react";
import { Link } from "react-router-dom";
import PublicHeader from "../components/PublicHeader";
import PublicFooter from "../components/PublicFooter";
import {
  Check,
  CaretDown,
  CaretUp,
  ChatCircleDots,
  Rocket,
  TrendUp,
  Crown,
  Buildings,
} from "@phosphor-icons/react";
import SEO from "../components/SEO";
import CustomPricingModal from "../components/CustomPricingModal";
import Tag from "../components/ui/Tag";
import CheckBadge from "../components/ui/CheckBadge";
import IconBadge from "../components/ui/IconBadge";
import { Ring, Swirl } from "../components/ui/decor";

const TIER_ICONS = {
  Starter: Rocket,
  Growth: TrendUp,
  Pro: Crown,
  Enterprise: Buildings,
};

const TIER_TONES = {
  Starter: "indigo-tint",
  Growth: "sky",
  Pro: "indigo",
  Enterprise: "ink",
};

const PricingCard = ({ plan, isPopular }) => {
  const isEnterprise = plan.name === "Enterprise";
  const TierIcon = TIER_ICONS[plan.name] || Rocket;
  const tierTone = TIER_TONES[plan.name] || "indigo";

  return (
    <div
      className={`relative flex flex-col p-8 rounded-3xl border transition-all ${
        isEnterprise
          ? "bg-[#0B0B14] text-white border-slate-800 shadow-xl overflow-hidden"
          : isPopular
          ? "bg-[#E9E7FD]/90 border-[#5144E8] ring-2 ring-[#5144E8]/20 shadow-lg z-10 text-[var(--pd-ink)]"
          : "bg-white border-[var(--pd-line)] hover:border-[var(--pd-mute)]/30 text-[var(--pd-ink)]"
      }`}
      style={{ boxShadow: "var(--pd-shadow)" }}
    >
      {/* Enterprise Cropped Indigo Ring Motif (§5.2) */}
      {isEnterprise && (
        <Ring
          size={260}
          strokeWidth={28}
          color="#5144E8"
          className="absolute -bottom-16 -right-16 opacity-30 pointer-events-none"
        />
      )}

      {/* Tilted Sticker-Style "Best value" Label (§5.2) */}
      {isPopular && (
        <div className="absolute -top-3.5 right-6 z-20">
          <span
            className="inline-block px-3.5 py-1 bg-[#FDEC8C] text-[#0B0B14] rounded-full text-xs font-bold border border-amber-300/80 shadow-xs"
            style={{ transform: "rotate(3deg)" }}
          >
            Best value
          </span>
        </div>
      )}

      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-2.5">
          <IconBadge
            icon={TierIcon}
            tone={tierTone}
            size="md"
            shape="squircle"
            tilt={isPopular ? -2 : 0}
          />
          <h3 className={`text-xl font-bold ${isEnterprise ? "text-white" : "text-[var(--pd-ink)]"} mb-0`}>
            {plan.name}
          </h3>
        </div>
      </div>

      <p className={`${isEnterprise ? "text-slate-300" : "text-[var(--pd-mute)]"} text-sm mb-6 h-10 leading-relaxed relative z-10`}>
        {plan.for}
      </p>

      <div className="flex items-baseline gap-2 mb-2 relative z-10">
        <span className={`text-4xl font-bold tracking-tight tabular-nums ${isEnterprise ? "text-white" : "text-[var(--pd-ink)]"}`}>
          {plan.priceNGN}
        </span>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-md border ${
          isEnterprise
            ? "text-slate-300 bg-slate-900 border-slate-700"
            : "text-[var(--pd-mute)] bg-[var(--pd-paper)] border-[var(--pd-line)]"
        }`}>
          {plan.priceUSD}
        </span>
      </div>

      <span className={`${isEnterprise ? "text-slate-400" : "text-[var(--pd-mute)]"} text-xs font-medium block mb-3 relative z-10`}>
        {plan.interval === "yearly" ? "Billed annually" : "One-time payment"}
      </span>

      <div className="mb-4 relative z-10">
        <Tag tone={isEnterprise ? "ink" : isPopular ? "indigo" : "sky"} size="sm">
          {plan.certs} Credits Included
        </Tag>
      </div>

      {plan.rolloverNotice && (
        <div className={`mb-6 p-2.5 rounded-xl text-[11px] leading-snug border relative z-10 ${
          isEnterprise
            ? "bg-slate-900 border-slate-800 text-amber-200"
            : "bg-amber-50 border-amber-200/80 text-amber-900"
        }`}>
          <span className="font-bold">Partial Rollover:</span> {plan.rolloverNotice}
        </div>
      )}

      <div className={`rounded-2xl py-3 px-4 mb-8 border flex items-center justify-between relative z-10 ${
        isEnterprise
          ? "bg-slate-900/90 border-slate-800"
          : "bg-[var(--pd-paper)] border-[var(--pd-line)]"
      }`}>
        <div>
          <p className={`text-xs font-medium ${isEnterprise ? "text-slate-400" : "text-[var(--pd-mute)]"}`}>Cost per cert</p>
          <p className={`font-bold text-sm ${isEnterprise ? "text-white" : "text-[var(--pd-ink)]"}`}>{plan.costPerCert}</p>
        </div>
        <div className={`h-8 w-px ${isEnterprise ? "bg-slate-800" : "bg-[var(--pd-line)]"}`}></div>
        <div className="text-right">
          <p className={`text-xs font-medium ${isEnterprise ? "text-slate-400" : "text-[var(--pd-mute)]"}`}>Validity</p>
          <p className={`font-bold text-sm ${isEnterprise ? "text-white" : "text-[var(--pd-ink)]"}`}>{plan.validity || "Lifetime"}</p>
        </div>
      </div>

      <ul className="space-y-3.5 mb-8 flex-1 relative z-10">
        {plan.features.map((feat, idx) => (
          <li key={idx} className={`flex items-start text-sm ${isEnterprise ? "text-slate-200" : "text-[var(--pd-ink)]"}`}>
            <CheckBadge
              tone={isEnterprise ? "indigo" : isPopular ? "indigo" : "green"}
              size={18}
              className="mr-2.5 mt-0.5"
            />
            <span>{feat}</span>
          </li>
        ))}
      </ul>

      <Link
        to={`/signup?plan=${plan.name.toLowerCase()}`}
        className={`w-full py-3 px-4 rounded-full text-sm font-medium text-center transition-colors no-underline relative z-10 ${
          isEnterprise
            ? "bg-[#5144E8] text-white hover:bg-[#4433E0]"
            : isPopular
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
        <section className="relative py-24 text-center bg-[var(--pd-paper)] pd-dot-grid border-b border-[var(--pd-line)] overflow-hidden">
          <Ring
            size={360}
            strokeWidth={36}
            color="#5144E8"
            className="absolute -top-24 -left-20 opacity-[0.08]"
          />
          <div className="max-w-4xl mx-auto px-6 relative z-10">
            <Tag tone="sun" dot>Pricing</Tag>
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

            {/* Want Custom? Flat Tone Landscape Banner (§5.2) */}
            <div className="mt-14 bg-[#E9E7FD]/85 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 border border-[#5144E8]/20 shadow-xs relative overflow-hidden">
              <Ring
                size={240}
                strokeWidth={24}
                color="#5144E8"
                className="absolute -bottom-16 -right-16 opacity-15"
              />
              <div className="flex items-center gap-4 text-center sm:text-left relative z-10">
                <div className="shrink-0 hidden sm:flex">
                  <IconBadge icon={ChatCircleDots} tone="indigo" size="lg" shape="squircle" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-2 mb-1.5">
                    <Tag tone="indigo" size="sm">Tailored High-Volume</Tag>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-1">
                    Need more than 10,000 credentials or custom integrations?
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 mb-0">
                    Bespoke high-volume packs, custom SLAs, and specialized LMS/ERP integrations available.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpenCustomModal(true)}
                className="w-full sm:w-auto px-6 py-3 bg-[#5144E8] hover:bg-[#4433E0] text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs shrink-0 flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap relative z-10"
              >
                Want custom? <span className="underline underline-offset-2 font-extrabold ml-0.5">Talk to Us</span>
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
              <div className="bg-white p-8 rounded-3xl border border-[var(--pd-line)]" style={{ boxShadow: "var(--pd-shadow)" }}>
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
                    <li key={i} className="flex items-center gap-3 text-[var(--pd-ink)] text-sm font-medium">
                      <CheckBadge tone="green" size={20} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-[#0B0B14] p-8 rounded-3xl text-white border border-slate-800 relative overflow-hidden" style={{ boxShadow: "var(--pd-shadow)" }}>
                <Ring
                  size={200}
                  strokeWidth={22}
                  color="#5144E8"
                  className="absolute -bottom-10 -right-10 opacity-30"
                />
                <h3 className="font-bold text-white text-xl mb-6 relative z-10">
                  Pro & Enterprise Exclusives
                </h3>
                <ul className="space-y-4 relative z-10">
                  {[
                    "Full API Access", 
                    "SLA-backed support guarantees",
                    "Custom onboarding & staff training",
                    "Onboarding Assistance & Priority Support",
                    "Advanced Analytics Dashboard"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-slate-200 text-sm font-medium">
                      <CheckBadge tone="indigo" size={20} />
                      <span>{item}</span>
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
              <div className="mb-4">
                <Tag tone="indigo">Pricing FAQ</Tag>
              </div>
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
                        <CaretUp size={18} weight="bold" className="text-[var(--pd-indigo)] shrink-0 ml-4" />
                      ) : (
                        <CaretDown size={18} weight="bold" className="text-slate-400 shrink-0 ml-4" />
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

        {/* Final CTA (§5.2: Flat indigo/ink rounded panel with cropped Rings/Swirl in tone-on-tone) */}
        <section className="py-20 md:py-28 bg-[var(--pd-paper)] pd-dot-grid">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="rounded-[32px] sm:rounded-[40px] bg-[#5144E8] text-white p-8 sm:p-14 relative overflow-hidden text-center shadow-xl">
              <Ring
                size={340}
                strokeWidth={36}
                color="#3B2FC9"
                className="absolute -top-24 -right-20 opacity-40 pointer-events-none"
              />
              <Swirl
                size={220}
                strokeWidth={22}
                color="#3B2FC9"
                className="absolute -bottom-16 -left-16 opacity-35 pointer-events-none"
              />

              <div className="relative z-10 max-w-2xl mx-auto space-y-4">
                <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
                  Start issuing certificates within minutes
                </h2>
                <p className="text-base sm:text-lg text-white/80 mb-8 max-w-xl mx-auto leading-relaxed">
                  No complex setup. No long onboarding. Choose a credit pack and start
                  issuing verifiable certificates today.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
                  <Link
                    to="/signup"
                    className="inline-flex items-center justify-center px-7 py-3 text-sm font-semibold text-[#0B0B14] bg-white rounded-full hover:bg-slate-100 transition-colors no-underline shadow-sm"
                  >
                    Get started with ProofDeck
                  </Link>
                  <Link
                    to="/contact"
                    className="inline-flex items-center justify-center px-7 py-3 text-sm font-semibold text-white border border-white/30 hover:bg-white/10 rounded-full transition-colors no-underline"
                  >
                    Contact Sales
                  </Link>
                </div>
              </div>
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
