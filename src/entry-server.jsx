import React from "react";
import ReactDOMServer from "react-dom/server";
import { StaticRouter, Routes, Route } from "react-router";
import { HelmetProvider } from "react-helmet-async";

// Public Marketing Pages
import LandingPage from "./pages/LandingPage";
import FeaturesPage from "./pages/FeaturesPage";
import PricingPage from "./pages/PricingPage";
import ContactPage from "./pages/ContactPage";
import LegalPage from "./pages/LegalPage";

// Solution Verticals
import CoursesBootcampsPage from "./pages/solutions/CoursesBootcampsPage";
import NgosPage from "./pages/solutions/NgosPage";
import ProfessionalBodiesPage from "./pages/solutions/ProfessionalBodiesPage";
import CorporateTrainingPage from "./pages/solutions/CorporateTrainingPage";
import SchoolsUniversitiesPage from "./pages/solutions/SchoolsUniversitiesPage";

// Blog / Guides
import BlogIndexPage from "./pages/blog/BlogIndexPage";
import VerifyCertificateGuidePage from "./pages/blog/VerifyCertificateGuidePage";
import LinkedInCertificateGuidePage from "./pages/blog/LinkedInCertificateGuidePage";

export function render(url) {
  const helmetContext = {};
  const html = ReactDOMServer.renderToString(
    <HelmetProvider context={helmetContext}>
      <StaticRouter location={url}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/legal" element={<LegalPage />} />

          <Route path="/solutions/courses-bootcamps" element={<CoursesBootcampsPage />} />
          <Route path="/solutions/ngos" element={<NgosPage />} />
          <Route path="/solutions/professional-bodies" element={<ProfessionalBodiesPage />} />
          <Route path="/solutions/corporate-training" element={<CorporateTrainingPage />} />
          <Route path="/solutions/schools-universities" element={<SchoolsUniversitiesPage />} />

          <Route path="/blog" element={<BlogIndexPage />} />
          <Route path="/blog/how-to-verify-a-certificate-online" element={<VerifyCertificateGuidePage />} />
          <Route path="/blog/how-to-add-certificate-to-linkedin" element={<LinkedInCertificateGuidePage />} />
        </Routes>
      </StaticRouter>
    </HelmetProvider>
  );

  return {
    html,
    helmet: helmetContext.helmet,
  };
}
