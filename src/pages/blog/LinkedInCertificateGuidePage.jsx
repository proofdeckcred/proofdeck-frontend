import React from "react";
import { Link } from "react-router-dom";
import PublicHeader from "../../components/PublicHeader";
import PublicFooter from "../../components/PublicFooter";
import SEO from "../../components/SEO";
import { ArrowLeft, Check, Linkedin, Share2, Award } from "lucide-react";

export default function LinkedInCertificateGuidePage() {
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
        "name": "Blog",
        "item": "https://www.proofdeck.app/blog"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "Add Certificate to LinkedIn Profile",
        "item": "https://www.proofdeck.app/blog/how-to-add-certificate-to-linkedin"
      }
    ]
  };

  const articleSchema = {
    "@type": "Article",
    "headline": "How to Add a Verifiable Certificate to Your LinkedIn Profile (Step-by-Step Guide)",
    "description": "A complete walkthrough on adding digital credentials, license numbers, and 1-click verification URLs to your LinkedIn Licenses & Certifications section.",
    "author": {
      "@type": "Organization",
      "name": "ProofDeck"
    },
    "publisher": {
      "@type": "Organization",
      "name": "ProofDeck",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.proofdeck.app/logo.png"
      }
    },
    "datePublished": "2026-09-05",
    "dateModified": "2026-09-22"
  };

  return (
    <div className="bg-white font-sans text-[var(--pd-ink)] min-h-screen flex flex-col">
      <SEO
        title="How to Add a Certificate to Your LinkedIn Profile | ProofDeck Guide"
        description="Learn how to add digital certificates and verifiable credentials to your LinkedIn Licenses & Certifications profile section using 1-click verification URLs."
        keywords="how to add certificate to linkedin, add certificate to linkedin profile link, linkedin certificate sharing Nigeria, 1-click linkedin certificate sharing, digital credentials on linkedin"
        canonicalUrl="https://www.proofdeck.app/blog/how-to-add-certificate-to-linkedin"
        schemas={[breadcrumbSchema, articleSchema]}
      />
      <PublicHeader />

      <main className="flex-grow py-16">
        <article className="max-w-3xl mx-auto px-4 sm:px-6">
          <Link
            to="/blog"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--pd-mute)] hover:text-[var(--pd-ink)] transition-colors no-underline mb-8"
          >
            <ArrowLeft size={14} /> Back to Guides
          </Link>

          <header className="mb-10">
            <span className="text-xs font-bold text-[#0A66C2] bg-blue-50 px-3 py-1 rounded-full border border-blue-100 uppercase tracking-wider flex items-center gap-1.5 w-max">
              <Linkedin size={13} /> LinkedIn Credentials
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[var(--pd-ink)] mt-4 mb-4 leading-tight">
              How to Add a Verifiable Certificate to Your LinkedIn Profile (Step-by-Step)
            </h1>
            <p className="text-sm text-[var(--pd-mute)]">
              Published by ProofDeck Insights &middot; 5 min read
            </p>
          </header>

          <div className="prose prose-slate max-w-none text-[var(--pd-ink)] space-y-6 leading-relaxed text-sm sm:text-base">
            <p className="text-lg font-medium text-slate-700 leading-relaxed">
              Adding your achievements to LinkedIn is one of the most effective ways to build professional credibility and catch the eye of recruiters. When your certificate includes a verifiable link, it proves your skills are authentic.
            </p>

            <h2 className="text-2xl font-bold text-[var(--pd-ink)] pt-4">
              Method 1: 1-Click "Add to LinkedIn" via ProofDeck (Fastest)
            </h2>
            <p>
              If your academy, employer, or bootcamp issued your credential through ProofDeck, adding it to LinkedIn takes only one click:
            </p>
            <ol className="list-decimal pl-6 space-y-2.5">
              <li>Open your certificate email or your unique certificate link.</li>
              <li>Click the blue <strong>"Add to LinkedIn Profile"</strong> button.</li>
              <li>A pre-filled LinkedIn modal will open automatically with your <strong>Certification Name</strong>, <strong>Issuing Organization</strong>, <strong>Issue Date</strong>, <strong>Credential ID</strong>, and <strong>Credential URL</strong> already entered.</li>
              <li>Click <strong>Save</strong>. The credential is now permanently featured on your profile with the official company logo!</li>
            </ol>

            <h2 className="text-2xl font-bold text-[var(--pd-ink)] pt-4">
              Method 2: Manual Addition to LinkedIn
            </h2>
            <p>
              If you prefer adding it manually from your LinkedIn profile:
            </p>
            <ol className="list-decimal pl-6 space-y-2.5">
              <li>Navigate to your LinkedIn profile and click the <strong>Add profile section</strong> button under your header.</li>
              <li>Select <strong>Recommended</strong> &gt; <strong>Add licenses & certifications</strong>.</li>
              <li>Enter the exact course or award title in the <strong>Name</strong> field.</li>
              <li>Type the name of the issuing company or academy in the <strong>Issuing organization</strong> field.</li>
              <li>Select your issue month and year. Check "This credential does not expire" if applicable.</li>
              <li>Paste your unique verification code into the <strong>Credential ID</strong> field.</li>
              <li>Paste the full URL into the <strong>Credential URL</strong> field.</li>
              <li>Click <strong>Save</strong>.</li>
            </ol>

            <div className="p-8 rounded-2xl bg-[var(--pd-paper)] border border-[var(--pd-line)] text-center my-10 space-y-4">
              <Award size={36} className="text-[#0A66C2] mx-auto" />
              <h3 className="text-xl font-bold text-[var(--pd-ink)]">
                Issue 1-Click LinkedIn Certificates to Your Students
              </h3>
              <p className="text-sm text-[var(--pd-mute)] max-w-lg mx-auto">
                Turn your graduates into brand ambassadors. When they add your certificates to LinkedIn, your academy's logo is shown to their entire professional network.
              </p>
              <Link
                to="/signup"
                className="inline-flex items-center justify-center px-6 py-2.5 rounded-full text-sm font-medium text-white bg-[var(--pd-indigo)] hover:bg-[var(--pd-indigo-dark)] transition-colors no-underline"
              >
                Start Issuing with ProofDeck
              </Link>
            </div>
          </div>
        </article>
      </main>
      <PublicFooter />
    </div>
  );
}
