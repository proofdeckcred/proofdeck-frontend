import React, { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

// User-facing imports
import DashboardLayout from "./layouts/DashboardLayout";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import { UserProvider } from "./context/UserContext";
import { AdminAuthProvider } from "./context/AdminAuthContext";
import SignupPage from "./pages/SignupPage";
import MyCertificatesPage from "./pages/MyCertificatesPage";
import CreateCertificatePage from "./pages/CreateCertificatePage";
import SettingsPage from "./pages/SettingsPage";
import TemplatesPage from "./pages/TemplatesPage";
import ViewCertificatePage from "./pages/ViewCertificatePage";
import VerifyCertificatePage from "./pages/VerifyCertificatePage";
import SendInvitationPage from "./pages/SendInvitationPage";
import ProtectedRoute from "./components/ProtectedRoute";
import GroupsPage from "./pages/GroupsPage";
import ContactSupportPage from "./pages/ContactSupportPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import JoinPage from "./pages/JoinPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import UploadTemplatePage from "./pages/UploadTemplatePage";
import OpenLedgerPage from "./pages/OpenLedgerPage";
import SupportHubPage from "./pages/SupportHubPage";
import HelpArticlePage from "./pages/HelpArticlePage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import PricingPage from "./pages/PricingPage"; // Import new page
import ContactPage from "./pages/ContactPage"; // Import new page
import LegalPage from "./pages/LegalPage";
import SupportWidget from "./components/SupportWidget"; // Global Support Widget

// Admin imports
import AdminPortalPage from "./pages/AdminPortalPage";
import AdminVerifyPage from "./pages/AdminVerifyPage";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminUserManagementPage from "./pages/AdminUserManagementPage";
import AdminPaymentsPage from "./pages/AdminPaymentsPage";
import AdminCertificatesPage from "./pages/AdminCertificatesPage";
import AdminAnalyticsPage from "./pages/AdminAnalyticsPage";
import AdminUserDetailsPage from "./pages/AdminUserDetailsPage";
import AdminPaymentDetailsPage from "./pages/AdminPaymentDetailsPage";
import AdminSupportPage from "./pages/AdminSupportPage";
import AdminSupportTicketDetailsPage from "./pages/AdminSupportTicketDetailsPage";
import AdminCompaniesPage from "./pages/AdminCompaniesPage";
import AdminCompanyDetailsPage from "./pages/AdminCompanyDetailsPage";
import AdminMessagingPage from "./pages/AdminMessagingPage";
import AdminTeamPage from "./pages/AdminTeamPage"; // New Route

import DocsPage from "./pages/DocsPage";
import KasiLandingPage from "./pages/KasiLandingPage";

const NotFoundPage = () => <h1 className="p-5">404: Page Not Found</h1>;

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  return (
    <UserProvider>
      <AdminAuthProvider>
        <ScrollToTop />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/kasi" element={<KasiLandingPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/legal" element={<LegalPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          <Route path="/join/:token" element={<JoinPage />} />
          <Route path="/verify" element={<VerifyCertificatePage />} />
          <Route
            path="/verify/:verificationId"
            element={<VerifyCertificatePage />}
          />
          <Route path="/search" element={<OpenLedgerPage />} />
          <Route path="/docs" element={<DocsPage />} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminPortalPage />} />
          <Route path="/admin/verify" element={<AdminVerifyPage />} />
          <Route element={<AdminProtectedRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="dashboard" element={<AdminDashboardPage />} />
              <Route path="users" element={<AdminUserManagementPage />} />
              <Route path="users/:userId" element={<AdminUserDetailsPage />} />
              <Route path="payments" element={<AdminPaymentsPage />} />
              <Route
                path="payments/:paymentId"
                element={<AdminPaymentDetailsPage />}
              />
              <Route path="certificates" element={<AdminCertificatesPage />} />
              <Route path="analytics" element={<AdminAnalyticsPage />} />
              <Route path="support" element={<AdminSupportPage />} />
              <Route
                path="support/:ticketId"
                element={<AdminSupportTicketDetailsPage />}
              />
              <Route path="companies" element={<AdminCompaniesPage />} />
              <Route
                path="companies/:companyId"
                element={<AdminCompanyDetailsPage />}
              />
              <Route path="messaging" element={<AdminMessagingPage />} />
              <Route path="team" element={<AdminTeamPage />} /> {/* New Route */}
            </Route>
          </Route>

          {/* Protected User Routes */}
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
              <Route path="send-invitation" element={<SendInvitationPage />} />
              <Route path="settings" element={<SettingsPage />} />

              <Route path="support">
                <Route index element={<SupportHubPage />} />
                <Route path="articles/:slug" element={<HelpArticlePage />} />
                <Route path="tickets" element={<ContactSupportPage />} />
                <Route path="tickets/:ticketId" element={<ContactSupportPage />} />
              </Route>

              <Route path="upload-template" element={<UploadTemplatePage />} />
              <Route
                path="upload-template/:templateId"
                element={<UploadTemplatePage />}
              />
            </Route>
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <SupportWidget />
      </AdminAuthProvider>
    </UserProvider>
  );
}

export default App;
