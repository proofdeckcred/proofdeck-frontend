// frontend/src/pages/LandingPage.jsx

import React from "react";
import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import PublicHeader from "../components/PublicHeader";
import PublicFooter from "../components/PublicFooter";
import { LandingHero } from "../components/ui/landing-hero";
import { FeaturesSection } from "../components/FeaturesSection";
import { BenefitsSection } from "../components/BenefitsSection";
import { TestimonialSection } from "../components/TestimonialSection";
import { ApiSection } from "../components/ApiSection";

// --- REVERTED PRICING CARD GRID ---

const PricingCard = ({
  title,
  price,
  suffix,
  features,
  isPopular,
  link,
}) => (
  <div
    className={`relative flex flex-col p-7 bg-white rounded-2xl border transition-all duration-200 ${
      isPopular
        ? "border-[#4A3AA8] border-t-4 shadow-sm z-10"
        : "border-[#E6E4ED] shadow-2xs hover:border-slate-300"
    }`}
  >
    <div className="flex items-center justify-between mb-4">
      <span className="text-xs font-bold text-[#15131F]">
        {title}
      </span>
      {isPopular && (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-[#4A3AA8] border border-indigo-100">
          Most popular
        </span>
      )}
    </div>

    <div className="my-4">
      <div className="flex items-baseline gap-1">
        <span className="text-3xl sm:text-4xl font-black text-[#15131F] tracking-tight">
          {price}
        </span>
        <span className="text-[#68647A] text-xs font-semibold">/ one-time</span>
      </div>
      <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-[#FAFAF9] text-[#68647A] border border-[#E6E4ED]">
        <Check size={12} className="stroke-[2.5] text-[#4A3AA8]" />
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
          <Check size={15} className="text-[#4A3AA8] shrink-0 stroke-[2.5]" />
          <span>{feat}</span>
        </li>
      ))}
    </ul>

    <Link
      to={link}
      className={`w-full py-3 px-4 rounded-xl font-bold text-center transition-all no-underline text-xs tracking-wide cursor-pointer ${
        isPopular
          ? "bg-[#4A3AA8] hover:bg-[#3b2e88] text-white shadow-xs"
          : "bg-[#FAFAF9] hover:bg-slate-100 text-[#15131F] border border-[#E6E4ED]"
      }`}
    >
      Choose {title}
    </Link>
  </div>
);

const Pricing = () => (
  <section id="pricing" className="py-20 md:py-28 bg-[#FAFAF9] border-t border-[#E6E4ED]">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl mx-auto mb-14">
        <p className="text-xs font-bold text-[#4A3AA8] tracking-wider uppercase mb-2">
          Pricing plans
        </p>
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
          price="₦25,000"
          suffix="500 credential credits"
          features={[
            "500 Credits Included",
            "Unlimited Template Designs",
            "Secure Email Delivery",
            "High-Res PDF Downloads",
            "Basic Verification Portal",
          ]}
          link="/signup?plan=starter"
        />
        <PricingCard
          title="Growth"
          price="₦60,000"
          suffix="2,000 credential credits"
          features={[
            "2,000 Credits Included",
            "Unlimited Template Designs",
            "Secure Email Delivery",
            "Priority Support Channel",
            "Basic Verification Portal",
          ]}
          link="/signup?plan=growth"
        />
        <PricingCard
          title="Pro"
          price="₦100,000"
          suffix="5,000 credential credits"
          isPopular={true}
          features={[
            "5,000 Credits Included",
            "Everything in Growth",
            "Developer API Access",
            "Custom Logo & Branding",
            "Custom Domain URL",
          ]}
          link="/signup?plan=pro"
        />
        <PricingCard
          title="Enterprise"
          price="₦300,000"
          suffix="20,000 credential credits"
          features={[
            "20,000 Credits Included",
            "Dedicated Account Manager",
            "SLA Support Guarantee",
            "Developer API Access",
            "Unlimited Webhooks & API",
          ]}
          link="/signup?plan=enterprise"
        />
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
        className="flex justify-between items-center w-full text-left font-bold text-slate-800 hover:text-indigo-650 transition-colors py-2 text-sm sm:text-base focus:outline-none"
      >
        <span>{question}</span>
        <span className="text-slate-400 text-xl font-light pl-4">{isOpen ? "−" : "+"}</span>
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
        <p className="text-xs font-bold text-indigo-600 tracking-widest uppercase mb-3">
          FAQ
        </p>
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
          answer="No, ProofDeck is strictly pay-as-you-go. You only pay for credits, with no recurring monthly subscriptions or setup fees."
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
  return (
    <div className="font-sans text-slate-900 bg-white">
      <PublicHeader />
      <main>
        {/* 1. Hero with integrated stats */}
        <LandingHero />

        {/* 2. Trusted By Logos Bar */}
        <div className="py-12 border-b border-slate-100 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <p className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest mb-8">
              Trusted by forward-thinking organizations
            </p>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-75 hover:opacity-100 transition-all duration-500">
              <a
                href="https://zitopy.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:scale-105 transition-transform flex items-center gap-2 no-underline group"
                title="Zitopy"
              >
                <img
                  src="/zitopy-logo.jpeg"
                  className="h-8 md:h-10 object-contain rounded shadow-xs border border-slate-200/80 group-hover:border-indigo-300"
                  alt="Zitopy"
                />
              </a>
              <img
                src="/images/partners/logo1.png"
                className="h-8 md:h-10 object-contain grayscale hover:grayscale-0"
                alt="Partner"
              />
              <img
                src="/images/partners/logo2.png"
                className="h-8 md:h-10 object-contain grayscale hover:grayscale-0"
                alt="Partner"
              />
              <img
                src="/images/partners/logo3.png"
                className="h-8 md:h-10 object-contain grayscale hover:grayscale-0"
                alt="Partner"
              />
            </div>
          </div>
        </div>

        {/* 3. Features (Sticky Stacking Cards) */}
        <FeaturesSection />

        {/* 4. Benefits & Social Sharing Accordion */}
        <BenefitsSection />

        {/* 5. Testimonials */}
        <TestimonialSection />

        {/* 6. Pricing (Naira Grid) */}
        <Pricing />

        {/* 7. FAQ Section */}
        <FAQ />

        {/* 8. API / Developer Section */}
        <ApiSection />
      </main>
      <PublicFooter />
    </div>
  );
}

export default LandingPage;
