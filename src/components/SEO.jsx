import React from "react";
import { Helmet } from "react-helmet-async";

const DEFAULT_TITLE = "ProofDeck — Certificate Maker Nigeria & Online Certificate Verifier";
const DEFAULT_DESCRIPTION =
  "ProofDeck is Nigeria and Africa's leading digital credential platform. Design, bulk issue, and verify tamper-proof certificates with QR codes, 1-click LinkedIn sharing, and Naira pricing.";
const DEFAULT_IMAGE = "https://www.proofdeck.app/og-image.png";
const SITE_URL = "https://www.proofdeck.app";

export default function SEO({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  keywords = "",
  canonicalUrl,
  ogType = "website",
  ogImage = DEFAULT_IMAGE,
  noIndex = false,
  schemas = [],
}) {
  const fullTitle = title.includes("ProofDeck") ? title : `${title} | ProofDeck`;
  const canonical = canonicalUrl || (typeof window !== "undefined" ? window.location.href.split("?")[0] : SITE_URL);

  const defaultSchemaGraph = [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "ProofDeck",
      url: SITE_URL,
      logo: `${SITE_URL}/logo.png`,
      sameAs: [
        "https://www.linkedin.com/company/proofdeckhq/",
        "https://x.com/proofdeck",
      ],
      founder: {
        "@type": "Person",
        name: "Omobolaji Durojaiye",
        url: "https://www.bolaji.tech/",
      },
      contactPoint: {
        "@type": "ContactPoint",
        email: "support@proofdeck.app",
        contactType: "customer support",
        availableLanguage: ["English"],
      },
    },
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": schemas.length > 0 ? [...defaultSchemaGraph, ...schemas] : defaultSchemaGraph,
  };

  return (
    <Helmet>
      {/* Standard metadata */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={canonical} />

      {/* Robots directives */}
      {noIndex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      )}

      {/* Open Graph */}
      <meta property="og:site_name" content="ProofDeck" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@proofdeck" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* Schema.org Structured Data */}
      <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
    </Helmet>
  );
}
