import axios from "axios";
import { SERVER_BASE_URL } from "./config";

const API = axios.create({
  baseURL: `${SERVER_BASE_URL}/api`,
});

API.interceptors.request.use((req) => {
  // Associate with global button spinner if request started within 150ms of button click
  if (window.__buttonSpinner && (Date.now() - window.__buttonSpinner.clickTime < 150)) {
    req._associatedSpinner = window.__buttonSpinner;
    window.__buttonSpinner.activeRequests++;
  }

  const ws = localStorage.getItem("workspaceContext") || "personal";
  req.headers["X-Workspace-Context"] = ws;

  if (req.url.includes("/admin")) {
    const adminToken = localStorage.getItem("adminToken");
    if (adminToken) {
      req.headers.Authorization = `Bearer ${adminToken}`;
    }
  } else {
    const token = localStorage.getItem("token");
    if (token) {
      req.headers.Authorization = `Bearer ${token}`;
    }
  }
  return req;
});

API.interceptors.response.use(
  (response) => {
    // Notify associated spinner of completion
    if (response.config && response.config._associatedSpinner) {
      const spinner = response.config._associatedSpinner;
      spinner.activeRequests = Math.max(0, spinner.activeRequests - 1);
      if (spinner.activeRequests === 0) {
        spinner.setNetworkFinished();
      }
    }
    return response;
  },
  (error) => {
    // Notify associated spinner of completion even on failure
    if (error.config && error.config._associatedSpinner) {
      const spinner = error.config._associatedSpinner;
      spinner.activeRequests = Math.max(0, spinner.activeRequests - 1);
      if (spinner.activeRequests === 0) {
        spinner.setNetworkFinished();
      }
    }

    if (error.response && error.response.status === 403) {
      const msg = error.response.data?.msg;
      if (msg === "Permission denied" || msg === "Template permission denied") {
        window.location.reload();
      }
    }
    return Promise.reject(error);
  }
);

// USER AUTH
export const loginUser = (credentials) => API.post("/auth/login", credentials);
export const signupUser = (userData) => API.post("/auth/register", userData);
export const verifyEmail = (verificationData) =>
  API.post("/auth/verify-email", verificationData);
export const resendVerificationEmail = (email) =>
  API.post("/auth/resend-verification", { email });
export const requestPasswordReset = (email) =>
  API.post("/auth/forgot-password", { email });
export const resetPassword = (token, password) =>
  API.post("/auth/reset-password", { token, password });

// ADMIN AUTH
export const adminLogin = (credentials) =>
  API.post("/admin/auth/login", credentials);
export const getAdminStatus = () => API.get("/admin/auth/status");
export const adminSignup = (userData) =>
  API.post("/admin/auth/signup", userData);
export const verifyAdmin = (verificationData) =>
  API.post("/admin/auth/verify", verificationData);
export const getAdminProfile = () => API.get("/admin/users/me");

// TEMPLATES
export const getTemplates = () => API.get("/templates/");
export const getTemplate = (templateId) => API.get(`/templates/${templateId}`);
export const createTemplate = (formData) =>
  API.post("/templates/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const updateTemplate = (templateId, formData) =>
  API.put(`/templates/${templateId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const deleteTemplate = (templateId) =>
  API.delete(`/templates/${templateId}`);
export const createCustomTemplate = (formData) =>
  API.post("/templates/upload-custom", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const updateCustomTemplate = (templateId, formData) =>
  API.put(`/templates/upload-custom/${templateId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// CERTIFICATES
export const getCertificates = () => API.get("/certificates/");
export const createCertificate = (certData) =>
  API.post("/certificates/", certData);
export const getCertificate = (certId) => API.get(`/certificates/${certId}`);
export const updateCertificate = (certId, certData) =>
  API.put(`/certificates/${certId}`, certData);
export const deleteCertificate = (certId) =>
  API.delete(`/certificates/${certId}`);
export const verifyCertificate = (verificationId) =>
  API.get(`/certificates/verify/${verificationId}`);
export const bulkCreateCertificates = (formData) =>
  API.post("/certificates/bulk", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const updateCertificateStatus = (certId, status) =>
  API.put(`/certificates/${certId}/status`, { status });
export const advancedSearchCertificates = (params) => {
  const cleanedParams = Object.entries(params).reduce((acc, [key, value]) => {
    if (value !== null && value !== "" && value !== undefined) acc[key] = value;
    return acc;
  }, {});
  return API.get(
    `/certificates/advanced-search?${new URLSearchParams(
      cleanedParams
    ).toString()}`
  );
};
export const getCertificatePDF = (certId) =>
  API.get(`/certificates/${certId}/pdf`, { responseType: "blob" });

// EMAILING
export const sendCertificateEmail = (certId) =>
  API.post(`/certificates/${certId}/send`);
export const sendBulkEmails = (certificateIds) =>
  API.post("/certificates/bulk-send", { certificate_ids: certificateIds });

// USER PROFILE & SETTINGS
export const getCurrentUser = () => API.get("/users/me");
export const uploadUserSignature = (formData) =>
  API.post("/users/me/signature", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const switchToCompany = (companyName) =>
  API.post("/users/me/switch-to-company", { company_name: companyName });
export const generateApiKey = () => API.post("/users/me/api-key");
export const updateUserProfile = (data) => API.put("/users/me", data);

// PAYMENTS
export const initializePayment = (plan) =>
  API.post("/payments/initialize", { plan });
export const verifyPayment = (reference) =>
  API.get(`/payments/verify/${reference}`);

// USER ANALYTICS
export const getUserAnalytics = () => API.get("/analytics/dashboard");

// REFERRALS
export const getReferralStats = () => API.get("/referrals/stats");

// GROUPS
export const getGroups = (page = 1) => API.get(`/groups/?page=${page}`);
export const createGroup = (name) => API.post("/groups/", { name });
export const getGroupDetails = (groupId) => API.get(`/groups/${groupId}`);
export const deleteGroup = (groupId) => API.delete(`/groups/${groupId}`);
export const sendGroupBulkEmail = (groupId) =>
  API.post(`/groups/${groupId}/send-bulk-email`);
export const downloadGroupBulkPDF = (groupId) =>
  API.get(`/groups/${groupId}/download-bulk-pdf`, { responseType: "blob" });

// SUPPORT TICKETS
export const createUserTicket = (formData) =>
  API.post("/support/tickets", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const getUserTickets = () => API.get("/support/tickets");
export const getUserTicketDetails = (ticketId) =>
  API.get(`/support/tickets/${ticketId}`);
export const replyToTicket = (ticketId, formData) =>
  API.post(`/support/tickets/${ticketId}/reply`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const deleteUserTicket = (ticketId) =>
  API.delete(`/support/tickets/${ticketId}`);

// CANVA
export const getCanvaAuthUrl = () => API.get("/canva/auth");

// CONTACT
export const sendContactMessage = (contactData) =>
  API.post("/contact/", contactData);

// MISC
export const downloadBulkTemplate = () =>
  API.get("/certificates/bulk-template", { responseType: "blob" });
export const uploadEditorImage = (formData) =>
  API.post("/uploads/editor-images", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// ADMIN API
export const getAdminUsers = (params = {}) =>
  API.get(`/admin/users?${new URLSearchParams(params).toString()}`);
export const getAdminUserDetails = (userId) =>
  API.get(`/admin/users/${userId}`);
export const adjustUserQuota = (userId, adjustment, reason) =>
  API.post(`/admin/users/${userId}/adjust-quota`, { adjustment, reason });
export const suspendAdminUser = (userId) =>
  API.post(`/admin/users/${userId}/suspend`);
export const unsuspendAdminUser = (userId) =>
  API.post(`/admin/users/${userId}/unsuspend`);
export const updateAdminUserPlan = (userId, plan) =>
  API.put(`/admin/users/${userId}/plan`, { plan });
export const deleteAdminUser = (userId) =>
  API.delete(`/admin/users/${userId}/delete`);
export const getAdminCompanies = (params = {}) =>
  API.get(`/admin/companies?${new URLSearchParams(params).toString()}`);
export const getAdminCompanyDetails = (companyId) =>
  API.get(`/admin/companies/${companyId}`);
export const adjustCompanyQuota = (companyId, adjustment, reason) =>
  API.post(`/admin/companies/${companyId}/adjust-quota`, { adjustment, reason });
export const deleteAdminCompany = (companyId) =>
  API.delete(`/admin/companies/${companyId}/delete`);
export const getEmailRecipients = () => API.get("/admin/messaging/recipients");
export const sendAdminBulkEmail = (emailData) =>
  API.post("/admin/messaging/send-email", emailData);
export const getAdminTransactions = (params = {}) =>
  API.get(
    `/admin/payments/transactions?${new URLSearchParams(params).toString()}`
  );
export const getAdminTransactionDetails = (paymentId) =>
  API.get(`/admin/payments/transactions/${paymentId}`);
export const getAdminCertificatesOverview = () =>
  API.get("/admin/certificates/overview");
export const getAdminCertificates = (params = {}) =>
  API.get(`/admin/certificates?${new URLSearchParams(params).toString()}`);
export const revokeAdminCertificate = (certId) =>
  API.post(`/admin/certificates/${certId}/revoke`);
export const getAdminAnalytics = (period = "1y") =>
  API.get(`/admin/analytics/insights?period=${period}`);
export const getAdminDashboardStats = () => API.get("/admin/dashboard-stats");
export const getOpenTicketsCount = () =>
  API.get("/admin/support/tickets/open-count");
export const getAdminSupportTickets = (params = {}) =>
  API.get(`/admin/support/tickets?${new URLSearchParams(params).toString()}`);
export const getAdminTicketDetails = (ticketId) =>
  API.get(`/admin/support/tickets/${ticketId}`);
export const adminReplyToTicket = (ticketId, message, file) => {
  const formData = new FormData();
  formData.append("message", message);
  if (file) formData.append("file", file);
  return API.post(`/admin/support/tickets/${ticketId}/reply`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
export const updateTicketStatus = (ticketId, status) =>
  API.put(`/admin/support/tickets/${ticketId}/status`, { status });

// WIDGET MESSAGES
export const getWidgetMessages = (params = {}) =>
  API.get(`/admin/support/widget-messages?${new URLSearchParams(params).toString()}`);

export const deleteWidgetMessage = (msgId) =>
  API.delete(`/admin/support/widget-messages/${msgId}`);

export const updateWidgetMessageStatus = (msgId, status) =>
  API.put(`/admin/support/widget-messages/${msgId}/status`, { status });

export const replyToWidgetMessage = (data) =>
  API.post(`/admin/support/widget-messages/reply`, data);

// PUBLIC WIDGET API
export const getChatHistory = (params = {}) =>
  API.get(`/support/history?${new URLSearchParams(params).toString()}`);

export const sendSupportMessage = (data) => API.post("/support/message", data);

// TEAM MULTI-TENANCY API
export const getTeamMembers = () => API.get("/team/members");
export const sendTeamInvite = (email) => API.post("/team/invite", { email });
export const cancelTeamInvite = (inviteId) => API.delete(`/team/invites/${inviteId}`);
export const removeTeamMember = (memberId) => API.delete(`/team/members/${memberId}`);
export const getInvitationDetails = (token) => API.get(`/team/invite/${token}`);
export const acceptInvitation = (data) => API.post("/team/accept", data);
