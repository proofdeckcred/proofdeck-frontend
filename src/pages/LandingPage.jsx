import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Check, ChatCircleDots, Plus, Minus, Buildings, Rocket, TrendUp, Crown } from "@phosphor-icons/react";
import PublicHeader from "../components/PublicHeader";
import PublicFooter from "../components/PublicFooter";
import { LandingHero } from "../components/ui/landing-hero";
import { FeaturesSection } from "../components/FeaturesSection";
import { BenefitsSection } from "../components/BenefitsSection";
import { TestimonialSection } from "../components/TestimonialSection";
import { TrustedBySection } from "../components/TrustedBySection";
import { ApiSection } from "../components/ApiSection";
import SEO from "../components/SEO";
import CustomPricingModal from "../components/CustomPricingModal";
import Tag from "../components/ui/Tag";
import CheckBadge from "../components/ui/CheckBadge";
import IconBadge from "../components/ui/IconBadge";
import { Wave, Ring } from "../components/ui/decor";

// --- REVERTED PRICING CARD GRID WITH BADGE + BENTO LANGUAGE ---

const PricingCard = ({
  title,
  price,
  suffix,
  features,
  isPopular,
  link,
  icon: TierIcon,
  tone = "indigo",
}) => (
  <div
    className={`relative flex flex-col p-7 bg-white rounded-3xl border transition-all duration-200 ${
      isPopular
        ? "border-[#5144E8] ring-2 ring-[#5144E8]/20 shadow-md z-10"
        : "border-[#E6E4ED] shadow-2xs hover:border-slate-300"
    }`}
  >
    {/* Tilted Sticker-Style "Most popular" Label (§5.2) */}
    {isPopular && (
      <div className="absolute -top-3.5 right-6 z-20">
        <span 
          className="inline-block px-3 py-1 bg-[#FDEC8C] text-[#0B0B14] rounded-full text-xs font-bold border border-amber-300/80 shadow-xs"
          style={{ transform: "rotate(3deg)" }}
        >
          Most popular
        </span>
      </div>
    )}

    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2.5">
        {TierIcon && (
          <IconBadge icon={TierIcon} tone={tone} size="sm" shape="squircle" />
        )}
        <span className="text-sm font-bold text-[#15131F]">
          {title}
        </span>
      </div>
    </div>

    <div className="my-4">
      <div className="flex items-baseline gap-1">
        <span className="text-3xl sm:text-4xl font-black text-[#15131F] tracking-tight">
          {price}
        </span>
        <span className="text-[#68647A] text-xs font-semibold">/ one-time</span>
      </div>
      <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-[#FAFAF9] text-[#68647A] border border-[#E6E4ED]">
        <Check size={12} weight="bold" className="text-[#5144E8]" />
        <span>{suffix}</span>
      </div>
    </div>

    <div className="h-px bg-[#E6E4ED] w-full mb-5" />

    <ul className="space-y-3 mb-8 flex-1">
      {features.map((feat, idx) => (
        <li
          key={idx}
          className="flex items-center gap-2.5 text-xs sm:text-sm text-[#15131F] font-semibold"
        >
          <CheckBadge tone={isPopular ? "indigo" : "green"} size={18} />
          <span>{feat}</span>
        </li>
      ))}
    </ul>

    <Link
      to={link}
      className={`w-full py-3 px-4 rounded-xl font-bold text-center transition-all no-underline text-xs tracking-wide cursor-pointer ${
        isPopular
          ? "bg-[#5144E8] hover:bg-[#4433E0] text-white shadow-xs"
          : "bg-[#FAFAF9] hover:bg-slate-100 text-[#15131F] border border-[#E6E4ED]"
      }`}
    >
      Choose {title}
    </Link>
  </div>
);

const Pricing = ({ onOpenCustomModal }) => (
  <section id="pricing" className="py-20 md:py-28 bg-[#FAFAF9] border-t border-[#E6E4ED]">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl mx-auto mb-14">
        <div className="mb-4">
          <Tag tone="sun" dot>Pricing</Tag>
        </div>
        <h2 className="text-3xl font-black text-[#15131F] sm:text-4xl leading-tight tracking-tight">
          Flexible pay-as-you-go
        </h2>
        <p className="mt-3 text-base text-[#68647A] font-medium leading-relaxed">
          No monthly subscriptions. Credits never expire. Upgrade only when you need to.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch pt-4">
        <PricingCard
          title="Starter"
          price="₦15,000"
          suffix="100 credential credits"
          icon={Rocket}
          tone="indigo-tint"
          features={[
            "100 Credits Included",
            "Unlimited Template Designs",
            "Secure Email Delivery",
            "High-Res PDF Downloads",
            "Basic Verification Portal",
          ]}
          link="/signup?plan=starter"
        />
        <PricingCard
          title="Growth"
          price="₦45,000"
          suffix="400 credential credits"
          icon={TrendUp}
          tone="sky"
          features={[
            "400 Credits Included",
            "Unlimited Template Designs",
            "Bulk Issuance (CSV / Excel)",
            "Batch ZIP Downloads",
            "Secure Email Delivery",
            "Priority Support Channel",
          ]}
          link="/signup?plan=growth"
        />
        <PricingCard
          title="Pro"
          price="₦90,000"
          suffix="1,200 credential credits"
          isPopular={true}
          icon={Crown}
          tone="indigo"
          features={[
            "1,200 Credits Included",
            "Everything in Growth",
            "Developer REST API Access",
            "Custom Logo & Digital Signatures",
            "1-Click 'Add to LinkedIn' Sharing",
            "Team Workspace Collaboration",
          ]}
          link="/signup?plan=pro"
        />
        <PricingCard
          title="Enterprise"
          price="₦1,500,000"
          suffix="10,000 credentials / year"
          icon={Buildings}
          tone="ink"
          features={[
            "10,000 credentials per year",
            "Custom domain & 100% white-label (SSL included)",
            "Zero ProofDeck branding on certificates, emails and verification pages",
            "Everything in Pro (API, bulk processing, team workspace)",
            "Multi-seat organization access",
            "Onboarding assistance & priority support",
            "Previously issued credentials stay verifiable",
            "Partial rollover: up to 25% on renewal",
          ]}
          link="/signup?plan=enterprise"
        />
      </div>

      {/* Flat Tone Custom Enterprise Banner (No gradient) */}
      <div className="mt-12 bg-[#E9E7FD]/85 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 border border-[#5144E8]/20 shadow-xs relative overflow-hidden">
        <Ring
          size={240}
          strokeWidth={24}
          color="#5144E8"
          className="absolute -top-16 -right-16 opacity-15"
        />
        <div className="flex items-center gap-4 text-center sm:text-left relative z-10">
          <div className="shrink-0 hidden sm:flex">
            <IconBadge icon={ChatCircleDots} tone="indigo" size="lg" shape="squircle" />
          </div>
          <div>
            <div className="inline-flex items-center gap-2 mb-1.5">
              <Tag tone="indigo" size="sm">Custom Enterprise</Tag>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-1">
              Need more than 10,000 credentials or bespoke integrations?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mb-0">
              Tailored volume discounts, custom SLAs, and specialized LMS/ERP integrations available.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onOpenCustomModal}
          className="w-full sm:w-auto px-6 py-3 bg-[#5144E8] hover:bg-[#4433E0] text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs shrink-0 flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap relative z-10"
        >
          Want custom? <span className="underline underline-offset-2 font-extrabold ml-0.5">Talk to Us</span>
        </button>
      </div>
    </div>
  </section>
);

// --- FAQ ACCORDION ---

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <div className="border-b border-slate-100 py-4 last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between items-center w-full text-left font-bold text-slate-800 hover:text-[#5144E8] transition-colors py-2 text-sm sm:text-base focus:outline-none"
      >
        <span>{question}</span>
        <span className="text-slate-400 pl-4">
          {isOpen ? <Minus size={18} weight="bold" /> : <Plus size={18} weight="bold" />}
        </span>
      </button>
      {isOpen && (
        <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed font-medium">
          {answer}
        </p>
      )}
    </div>
  );
};

const FAQ = () => (
  <section className="py-20 md:py-24 bg-slate-50/60 border-t border-slate-100">
    <div className="max-w-3xl mx-auto px-4 sm:px-6">
      <div className="text-center mb-12">
        <div className="mb-4">
          <Tag tone="indigo">FAQ</Tag>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
          Frequently Asked Questions
        </h2>
      </div>
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 md:p-10 shadow-3xs space-y-1">
        <FAQItem
          question="How do credential credits work?"
          answer="Credits are pay-as-you-go. 1 credit = 1 issued certificate, invitation card, or payment receipt. Credits never expire, meaning you can use them whenever you need."
        />
        <FAQItem
          question="Can I customize the templates?"
          answer="Yes, you can use our drag-and-drop template editor to customize layouts, text fonts, signatures, and backgrounds to perfectly match your brand identity."
        />
        <FAQItem
          question="How do third parties verify credentials?"
          answer="Every certificate has a unique secure URL and QR code. Anyone can scan or click the verification link to check its ledger authenticity instantly."
        />
        <FAQItem
          question="Is there a subscription fee?"
          answer="Starter, Growth, and Pro are strictly pay-as-you-go with lifetime validity and no monthly subscriptions. Enterprise is an annual plan with 12-month validity, custom domain white-labeling, and up to 25% rollover on renewal."
        />
        <FAQItem
          question="How does the Enterprise annual plan and credit rollover work?"
          answer="The Enterprise plan is billed annually at ₦1,500,000 / year and includes 10,000 credential credits valid for 12 months. Unused credits roll over once when you renew, up to 25% (up to 2,500 credits). If you choose not to renew, all previously issued credentials stay verifiable forever, and any unused credits expire after a 60-day renewal grace period."
        />
        <FAQItem
          question="Do you offer developer API access?"
          answer="Yes, developer API access is available on Pro and Enterprise tiers, allowing programmatic issuance from your LMS, Event App, or billing portal."
        />
      </div>
    </div>
  </section>
);

// --- MAIN PAGE ---

function LandingPage() {
  const [openCustomModal, setOpenCustomModal] = useState(false);

  const faqSchema = {
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How do credential credits work?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Credits are pay-as-you-go. 1 credit = 1 issued certificate, invitation card, or payment receipt. Credits never expire, meaning you can use them whenever you need."
        }
      },
      {
        "@type": "Question",
        "name": "Can I customize the templates?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, you can use our drag-and-drop template editor to customize layouts, text fonts, signatures, and backgrounds to perfectly match your brand identity."
        }
      },
      {
        "@type": "Question",
        "name": "How do third parties verify credentials?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Every certificate has a unique secure URL and QR code. Anyone can scan or click the verification link to check its authenticity instantly without exposing private database records."
        }
      },
      {
        "@type": "Question",
        "name": "Is there a subscription fee?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Starter, Growth, and Pro are strictly pay-as-you-go with lifetime validity and no monthly subscriptions. Enterprise is an annual plan with 12-month validity and custom domain white-labeling."
        }
      },
      {
        "@type": "Question",
        "name": "How does the Enterprise annual plan and credit rollover work?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The Enterprise plan is billed annually at ₦1,500,000 / year and includes 10,000 credential credits valid for 12 months. Unused credits roll over once when you renew, up to 25% (up to 2,500 credits). If you choose not to renew, all previously issued credentials stay verifiable forever, and any unused credits expire after a 60-day renewal grace period."
        }
      },
      {
        "@type": "Question",
        "name": "Do you offer developer API access?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, developer API access is available on Pro and Enterprise tiers, allowing programmatic issuance from your LMS, Event App, or billing portal."
        }
      }
    ]
  };

  const softwareSchema = {
    "@type": "SoftwareApplication",
    "@id": "https://www.proofdeck.app/#software",
    "name": "ProofDeck",
    "url": "https://www.proofdeck.app/",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "description": "ProofDeck is Nigeria and Africa's #1 digital credential platform. Bulk issue and verify tamper-proof certificates with QR codes, 1-click LinkedIn sharing, and Naira pricing.",
    "offers": {
      "@type": "Offer",
      "price": "15000",
      "priceCurrency": "NGN"
    }
  };

  return (
    <div className="font-sans text-slate-900 bg-white">
      <SEO
        title="ProofDeck — Issue, Verify, and Track Verifiable Credentials Online"
        description="Effortlessly issue tamper-proof digital credentials, prevent fraud, and boost organization credibility with instant QR code verification and 1-click LinkedIn sharing."
        keywords="certificate maker, verifiable credentials, digital certificate platform, online certificate verifier, bulk certificate generator, tamper-proof certificates, issue certificates online, digital badges"
        canonicalUrl="https://www.proofdeck.app/"
        schemas={[softwareSchema, faqSchema]}
      />
      <PublicHeader />
      <main>
        {/* 1. Hero with integrated stats */}
        <LandingHero />

        {/* 2. Trusted By Organizations Section (Focal Hub + Partner Constellation) */}
        <TrustedBySection />

        {/* 3. Features (Sticky Stacking Cards) */}
        <FeaturesSection />

        {/* 4. Benefits & Social Sharing Accordion */}
        <BenefitsSection />

        {/* 5. Testimonials */}
        <TestimonialSection />

        {/* 6. Pricing (Naira Grid) */}
        <Pricing onOpenCustomModal={() => setOpenCustomModal(true)} />

        {/* 7. FAQ Section */}
        <FAQ />

        {/* 8. API / Developer Section */}
        <ApiSection />

        <CustomPricingModal
          isOpen={openCustomModal}
          onClose={() => setOpenCustomModal(false)}
        />
      </main>
      <PublicFooter />
    </div>
  );
}

export default LandingPage;
