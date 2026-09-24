import React, { useEffect, Suspense, lazy } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

// Context providers
import { UserProvider } from "./context/UserContext";
import { AdminAuthProvider } from "./context/AdminAuthContext";

// Core Public pages (Direct imports for fastest SSR/SSG & initial render)
import LandingPage from "./pages/LandingPage";
import FeaturesPage from "./pages/FeaturesPage";
import PricingPage from "./pages/PricingPage";
import ContactPage from "./pages/ContactPage";
import LegalPage from "./pages/LegalPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import VerifyCertificatePage from "./pages/VerifyCertificatePage";
import KasiLandingPage from "./pages/KasiLandingPage";

// Solution Vertical pages
import CoursesBootcampsPage from "./pages/solutions/CoursesBootcampsPage";
import NgosPage from "./pages/solutions/NgosPage";
import ProfessionalBodiesPage from "./pages/solutions/ProfessionalBodiesPage";
import CorporateTrainingPage from "./pages/solutions/CorporateTrainingPage";
import SchoolsUniversitiesPage from "./pages/solutions/SchoolsUniversitiesPage";

// Blog / Guides
import BlogIndexPage from "./pages/blog/BlogIndexPage";
import VerifyCertificateGuidePage from "./pages/blog/VerifyCertificateGuidePage";
import LinkedInCertificateGuidePage from "./pages/blog/LinkedInCertificateGuidePage";

// Protected & System routes
import ProtectedRoute from "./components/ProtectedRoute";
import AdminProtectedRoute from "./components/AdminProtectedRoute";

// Lazy-loaded routes for performance & Core Web Vitals (prevents bundling Konva, Chart.js, etc. into marketing pages)
const DocsPage = lazy(() => import("./pages/DocsPage"));
const OpenLedgerPage = lazy(() => import("./pages/OpenLedgerPage"));
const VerifyEmailPage = lazy(() => import("./pages/VerifyEmailPage"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const JoinPage = lazy(() => import("./pages/JoinPage"));
const UnsubscribePage = lazy(() => import("./pages/UnsubscribePage"));

// Lazy Dashboard pages
const DashboardLayout = lazy(() => import("./layouts/DashboardLayout"));
const MyCertificatesPage = lazy(() => import("./pages/MyCertificatesPage"));
const CreateCertificatePage = lazy(() => import("./pages/CreateCertificatePage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const TemplatesPage = lazy(() => import("./pages/TemplatesPage"));
const ViewCertificatePage = lazy(() => import("./pages/ViewCertificatePage"));
const GroupsPage = lazy(() => import("./pages/GroupsPage"));
const AnalyticsPage = lazy(() => import("./pages/AnalyticsPage"));
const UploadTemplatePage = lazy(() => import("./pages/UploadTemplatePage"));
const SupportHubPage = lazy(() => import("./pages/SupportHubPage"));
const HelpArticlePage = lazy(() => import("./pages/HelpArticlePage"));
const ContactSupportPage = lazy(() => import("./pages/ContactSupportPage"));

// Lazy Admin pages
const AdminPortalPage = lazy(() => import("./pages/AdminPortalPage"));
const AdminVerifyPage = lazy(() => import("./pages/AdminVerifyPage"));
const AdminLayout = lazy(() => import("./layouts/AdminLayout"));
const AdminDashboardPage = lazy(() => import("./pages/AdminDashboardPage"));
const AdminUserManagementPage = lazy(() => import("./pages/AdminUserManagementPage"));
const AdminUserDetailsPage = lazy(() => import("./pages/AdminUserDetailsPage"));
const AdminPaymentsPage = lazy(() => import("./pages/AdminPaymentsPage"));
const AdminPaymentDetailsPage = lazy(() => import("./pages/AdminPaymentDetailsPage"));
const AdminCertificatesPage = lazy(() => import("./pages/AdminCertificatesPage"));
const AdminAnalyticsPage = lazy(() => import("./pages/AdminAnalyticsPage"));
const AdminSupportPage = lazy(() => import("./pages/AdminSupportPage"));
const AdminSupportTicketDetailsPage = lazy(() => import("./pages/AdminSupportTicketDetailsPage"));
const AdminCompaniesPage = lazy(() => import("./pages/AdminCompaniesPage"));
const AdminCompanyDetailsPage = lazy(() => import("./pages/AdminCompanyDetailsPage"));
const AdminMessagingPage = lazy(() => import("./pages/AdminMessagingPage"));
const AdminBroadcastsPage = lazy(() => import("./pages/AdminBroadcastsPage"));
const AdminTeamPage = lazy(() => import("./pages/AdminTeamPage"));
const AdminBlogPage = lazy(() => import("./pages/AdminBlogPage"));
const AdminBlogEditorPage = lazy(() => import("./pages/AdminBlogEditorPage"));

const NotFoundPage = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
    <h1 className="text-4xl font-bold text-slate-900 mb-2">404</h1>
    <p className="text-slate-500 mb-6">The page you are looking for does not exist.</p>
    <a href="/" className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold no-underline">
      Return Home
    </a>
  </div>
);

const PageLoader = () => (
  <div className="min-h-[50vh] flex items-center justify-center p-12">
    <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  // Initialize Lenis smooth scroll on public-facing pages only
  useEffect(() => {
    const isAppPage = pathname.startsWith("/dashboard") || pathname.startsWith("/admin");
    if (isAppPage) return;

    const lenis = new Lenis({
      autoRaf: true,
      duration: 1.5,
      smoothWheel: true,
      wheelMultiplier: 0.85,
      touchMultiplier: 1.2,
    });

    return () => {
      lenis.destroy();
    };
  }, [pathname]);

  return null;
}

function App() {
  return (
    <UserProvider>
      <AdminAuthProvider>
        <ScrollToTop />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Core Public Marketing routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/features" element={<FeaturesPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/legal" element={<LegalPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/kasi" element={<KasiLandingPage />} />

            {/* Solution Verticals */}
            <Route path="/solutions/courses-bootcamps" element={<CoursesBootcampsPage />} />
            <Route path="/solutions/ngos" element={<NgosPage />} />
            <Route path="/solutions/professional-bodies" element={<ProfessionalBodiesPage />} />
            <Route path="/solutions/corporate-training" element={<CorporateTrainingPage />} />
            <Route path="/solutions/schools-universities" element={<SchoolsUniversitiesPage />} />

            {/* Blog & Educational Guides */}
            <Route path="/blog" element={<BlogIndexPage />} />
            <Route path="/blog/how-to-verify-a-certificate-online" element={<VerifyCertificateGuidePage />} />
            <Route path="/blog/how-to-add-certificate-to-linkedin" element={<LinkedInCertificateGuidePage />} />

            {/* Auth & System Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
            <Route path="/join/:token" element={<JoinPage />} />
            <Route path="/verify" element={<VerifyCertificatePage />} />
            <Route path="/verify/:verificationId" element={<VerifyCertificatePage />} />
            <Route path="/search" element={<OpenLedgerPage />} />
            <Route path="/docs" element={<DocsPage />} />
            <Route path="/email/unsubscribe" element={<UnsubscribePage />} />

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminPortalPage />} />
            <Route path="/admin/verify" element={<AdminVerifyPage />} />
            <Route element={<AdminProtectedRoute />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route path="dashboard" element={<AdminDashboardPage />} />
                <Route path="users" element={<AdminUserManagementPage />} />
                <Route path="users/:userId" element={<AdminUserDetailsPage />} />
                <Route path="payments" element={<AdminPaymentsPage />} />
                <Route path="payments/:paymentId" element={<AdminPaymentDetailsPage />} />
                <Route path="certificates" element={<AdminCertificatesPage />} />
                <Route path="analytics" element={<AdminAnalyticsPage />} />
                <Route path="support" element={<AdminSupportPage />} />
                <Route path="support/:ticketId" element={<AdminSupportTicketDetailsPage />} />
                <Route path="companies" element={<AdminCompaniesPage />} />
                <Route path="companies/:companyId" element={<AdminCompanyDetailsPage />} />
                <Route path="messaging" element={<AdminMessagingPage />} />
                <Route path="broadcasts" element={<AdminBroadcastsPage />} />
                <Route path="team" element={<AdminTeamPage />} />
                <Route path="blog" element={<AdminBlogPage />} />
                <Route path="blog/editor" element={<AdminBlogEditorPage />} />
                <Route path="blog/editor/:id" element={<AdminBlogEditorPage />} />
              </Route>
            </Route>

            {/* Protected User Dashboard Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardLayout />}>
                <Route index element={<MyCertificatesPage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="templates" element={<TemplatesPage />} />
                <Route path="groups" element={<GroupsPage />} />
                <Route path="create" element={<CreateCertificatePage />} />
                <Route path="edit/:certId" element={<CreateCertificatePage />} />
                <Route path="view/:certId" element={<ViewCertificatePage />} />
                <Route path="bulk-create" element={<CreateCertificatePage />} />
                <Route path="settings" element={<SettingsPage />} />

                <Route path="support">
                  <Route index element={<SupportHubPage />} />
                  <Route path="articles/:slug" element={<HelpArticlePage />} />
                  <Route path="tickets" element={<ContactSupportPage />} />
                  <Route path="tickets/:ticketId" element={<ContactSupportPage />} />
                </Route>

                <Route path="upload-template" element={<UploadTemplatePage />} />
                <Route path="upload-template/:templateId" element={<UploadTemplatePage />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </AdminAuthProvider>
    </UserProvider>
  );
}

export default App;
