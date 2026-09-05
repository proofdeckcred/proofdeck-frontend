import React from "react";
import { Link } from "react-router-dom";
import PublicHeader from "../components/PublicHeader";
import PublicFooter from "../components/PublicFooter";
import { Check } from "lucide-react";

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
      <span className="text-[var(--pd-mute)] text-xs font-medium block mb-3">One-time payment</span>
      <p className="text-xs font-medium text-[var(--pd-indigo)] bg-[var(--pd-paper)] inline-block py-1 px-2.5 rounded-full mb-8 w-max border border-[var(--pd-line)]">
        {plan.certs} Credits Included
      </p>

      <div className="bg-[var(--pd-paper)] rounded-xl py-3 px-4 mb-8 border border-[var(--pd-line)] flex items-center justify-between">
        <div>
          <p className="text-xs text-[var(--pd-mute)] font-medium">Cost per cert</p>
          <p className="font-bold text-[var(--pd-ink)] text-sm">{plan.costPerCert}</p>
        </div>
        <div className="h-8 w-px bg-[var(--pd-line)]"></div>
        <div className="text-right">
          <p className="text-xs text-[var(--pd-mute)] font-medium">Validity</p>
          <p className="font-bold text-[var(--pd-ink)] text-sm">Lifetime</p>
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
      priceNGN: "₦25,000",
      priceUSD: "$18.00",
      certs: "500",
      costPerCert: "₦50 (~$0.03)",
      for: "Perfect for workshops, bootcamps, and small cohorts.",
      features: [
        "500 Credits Included",
        "Unlimited Template Designs",
        "Secure Email Delivery",
        "High-Res PDF Downloads",
        "Basic Verification Portal",
      ],
    },
    {
      name: "Growth",
      priceNGN: "₦60,000",
      priceUSD: "$42.00",
      certs: "2,000",
      costPerCert: "₦30 (~$0.02)",
      for: "Ideal for schools and training centers issuing regularly.",
      features: [
        "2,000 Credits Included",
        "Unlimited Template Designs",
        "Secure Email Delivery",
        "Priority Support Channel",
        "Basic Verification Portal",
      ],
    },
    {
      name: "Pro",
      priceNGN: "₦100,000",
      priceUSD: "$70.00",
      certs: "5,000",
      costPerCert: "₦20 (~$0.014)",
      for: "For institutions needing automation and deeper integration.",
      features: [
        "5,000 Credits Included",
        "Everything in Growth",
        "Developer API Access",
        "Custom Logo & Branding",
        "Custom Domain URL",
      ],
    },
    {
      name: "Enterprise",
      priceNGN: "₦300,000",
      priceUSD: "$200.00",
      certs: "20,000",
      costPerCert: "₦15 (~$0.01)",
      for: "For universities, exam bodies, and large organizations.",
      features: [
        "20,000 Credits Included",
        "Dedicated Account Manager",
        "SLA Support Guarantee",
        "Developer API Access",
        "Unlimited Webhooks & API",
      ],
    },
  ];

  return (
    <div className="bg-white font-sans text-[var(--pd-ink)]">
      <PublicHeader />
      <main>
        {/* Hero Section */}
        <section className="relative py-24 text-center bg-[var(--pd-paper)]">
          <div className="max-w-4xl mx-auto px-6">
            <span className="pd-pill-label mb-4 inline-flex">Pricing</span>
            <h1 className="text-5xl md:text-6xl font-bold text-[var(--pd-ink)] tracking-tight mb-6 leading-tight pt-4">
              Simple pricing.<br />
              Pay only for what you issue.
            </h1>
            <p className="text-lg text-[var(--pd-mute)] mb-8 max-w-2xl mx-auto leading-relaxed">
              ProofDeck uses a credit-based system. One certificate equals one
              credit. No hidden fees. No surprises.
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
                    "Dedicated Account Manager",
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

        {/* Final CTA */}
        <section className="py-24 bg-[var(--pd-paper)] border-t border-[var(--pd-line)]">
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
      </main>
      <PublicFooter />
    </div>
  );
};

export default PricingPage;
