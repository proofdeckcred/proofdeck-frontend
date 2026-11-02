import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useUser } from "./UserContext";

const TourContext = createContext(null);

export const PAGE_TOUR_DEFINITIONS = {
  overview: {
    pageName: "Overview",
    steps: [
      {
        id: "overview-metrics",
        target: '[data-tour="overview-metrics"]',
        title: "Track Credits & Issuance Volume",
        description:
          "Monitor your remaining credential credits, total issued credentials, and active templates in real time. Each credential you issue uses 1 credit.",
      },
      {
        id: "overview-quick-actions",
        target: '[data-tour="overview-quick-actions"]',
        title: "Quick Actions Launchpad",
        description:
          "Start here to issue a single credential right away, upload a CSV/Excel spreadsheet for bulk cohort issuance, or jump into template design.",
      },
      {
        id: "overview-recent-table",
        target: '[data-tour="overview-recent-table"]',
        title: "Manage & Dispatch Credentials",
        description:
          "Filter between Issued credentials and Drafts. Use the row actions to send verification emails, download high-res PDFs, inspect the ledger, or edit details.",
      },
      {
        id: "overview-quotas",
        target: '[data-tour="overview-quotas"]',
        title: "Account Quotas & Plan",
        description:
          "Keep an eye on your credit usage and template capacity. You can top up credits or upgrade your workspace plan anytime from Settings.",
      },
      {
        id: "sidebar-nav",
        target: '[data-tour="sidebar-nav"]',
        title: "Switch Workspaces & Modules",
        description:
          "Switch between your personal and organization workspaces at the top, and navigate between Groups, Templates, Official A4 Documents, and Analytics.",
      },
    ],
  },

  groups_list: {
    pageName: "Groups & Cohorts",
    steps: [
      {
        id: "groups-create-btn",
        target: '[data-tour="groups-create-btn"]',
        title: "Create a Cohort or Batch Group",
        description:
          "Group credentials by graduation class, training cohort, or event so you can manage, export, and email an entire batch together.",
      },
      {
        id: "groups-folders",
        target: '[data-tour="groups-folders"]',
        title: "Batch Folders & Bulk Spreadsheet Edit",
        description:
          "Click any group folder to open batch actions, or hover over a folder and click 'Bulk Edit' to edit all recipients inside an interactive spreadsheet.",
      },
      {
        id: "groups-all-credentials",
        target: '[data-tour="groups-all-credentials"]',
        title: "Visual Credentials Explorer",
        description:
          "Browse all your credentials with live visual previews. Hover over any credential card to email the recipient, download the PDF, view verification details, or edit.",
      },
    ],
  },

  groups_detail: {
    pageName: "Group Batch Controls",
    steps: [
      {
        id: "group-detail-analytics",
        target: '[data-tour="group-detail-analytics"]',
        title: "Live External Verification Scans",
        description:
          "Track how many times recipients and employers have scanned QR codes or opened verification links for credentials in this batch.",
      },
      {
        id: "group-detail-actions",
        target: '[data-tour="group-detail-actions"]',
        title: "Batch Dispatch & Bulk Export",
        description:
          "Open the whole group in a spreadsheet with 'Bulk Edit', download all PDFs as a ZIP or to a local folder, or click 'Send to Unsent' to email everyone at once.",
      },
      {
        id: "group-detail-cards",
        target: '[data-tour="group-detail-cards"]',
        title: "Cohort Credentials Grid",
        description:
          "Inspect individual credentials in this group. Hover over any card to resend its email, download its PDF, or update recipient details.",
      },
    ],
  },

  templates: {
    pageName: "Templates",
    steps: [
      {
        id: "templates-studio-btns",
        target: '[data-tour="templates-studio-btns"]',
        title: "Visual Studio & A4 Document Editor",
        description:
          "Click 'New certificate' to upload your own Canva/Figma design and drag-and-drop dynamic variables, or 'New document' to build A4 transcripts and letters.",
      },
      {
        id: "templates-preset-creator",
        target: '[data-tour="templates-preset-creator"]',
        title: "Fast Preset Customizer",
        description:
          "Need a polished certificate in seconds? Pick a preset layout style, customize brand colors and typography, and upload your logo and background.",
      },
      {
        id: "templates-live-preview",
        target: '[data-tour="templates-live-preview"]',
        title: "Real-Time WYSIWYG Preview",
        description:
          "Every adjustment to layout, colors, and headings updates live here. Click the expand icon in the corner to inspect at full screen.",
      },
      {
        id: "templates-library",
        target: '[data-tour="templates-library"]',
        title: "Your Saved Template Library",
        description:
          "All your custom visual templates and presets are stored here. Hover over any card to edit its design or copy its Template ID for API integrations.",
      },
    ],
  },

  documents: {
    pageName: "Documents",
    steps: [
      {
        id: "documents-new-btn",
        target: '[data-tour="documents-new-btn"]',
        title: "Create Official A4 Documents",
        description:
          "Open the multi-page A4 Document Editor to design academic transcripts, statements of result, or attestation letters with verification QR seals.",
      },
      {
        id: "documents-presets",
        target: '[data-tour="documents-presets"]',
        title: "Start from Ready-Made A4 Presets",
        description:
          "Launch a Blank A4 sheet or start with pre-structured Statement of Result, English Proficiency, or Letter of Attestation templates with merge variables already set up.",
      },
      {
        id: "documents-recent",
        target: '[data-tour="documents-recent"]',
        title: "Manage & Duplicate Document Templates",
        description:
          "Reopen, duplicate, or delete your saved A4 document templates. Once saved, you can issue them to single recipients or bulk cohorts just like certificates.",
      },
    ],
  },

  create_single: {
    pageName: "Issue Credentials",
    steps: [
      {
        id: "create-mode-toggle",
        target: '[data-tour="create-mode-toggle"]',
        title: "Single vs. Bulk Issuance Mode",
        description:
          "Switch between issuing to a single recipient or importing a CSV/Excel spreadsheet to issue hundreds of credentials in one batch.",
      },
      {
        id: "create-template-select",
        target: '[data-tour="create-template-select"]',
        title: "Select Your Template",
        description:
          "Choose any saved certificate, receipt, invitation, or A4 document template. The form fields below automatically adapt to your template's placeholders.",
      },
      {
        id: "create-recipient-form",
        target: '[data-tour="create-recipient-form"]',
        title: "Enter Recipient & Custom Details",
        description:
          "Fill in the recipient's name, email address, program title, issue date, signature, and any custom merge fields defined in your template.",
      },
      {
        id: "create-style-customizer",
        target: '[data-tour="create-style-customizer"]',
        title: "Fine-Tune Font Size & Positioning",
        description:
          "Have a recipient with an unusually long name? Expand this tool to adjust font sizes, text wrapping, or position offsets for this credential.",
      },
      {
        id: "create-live-preview",
        target: '[data-tour="create-live-preview"]',
        title: "Live Verification Preview & Issue",
        description:
          "Verify that every detail and the dynamic QR code look right in the real-time preview, then click 'Issue credential' to generate and record it on the ledger.",
      },
    ],
  },

  create_bulk: {
    pageName: "Bulk Issuance",
    steps: [
      {
        id: "create-mode-toggle",
        target: '[data-tour="create-mode-toggle"]',
        title: "Bulk Cohort Issuance Mode",
        description:
          "Issue credentials to an entire class or event cohort at once using a CSV/Excel file or the built-in interactive spreadsheet.",
      },
      {
        id: "create-bulk-setup",
        target: '[data-tour="create-bulk-setup"]',
        title: "Choose Template & Cohort Group",
        description:
          "Select the visual template for this batch and assign it to an existing or newly created Group folder so all generated credentials stay organized.",
      },
      {
        id: "create-bulk-upload",
        target: '[data-tour="create-bulk-upload"]',
        title: "Upload Spreadsheet or Open Grid Editor",
        description:
          "Drop a CSV/Excel file to auto-map columns to your template's {{variables}}, or click 'Spreadsheet editor' to type, paste, and validate rows directly in the browser.",
      },
      {
        id: "create-bulk-actions",
        target: '[data-tour="create-bulk-actions"]',
        title: "Save Draft (0 Credits) or Generate Batch",
        description:
          "You can save your work as a draft for 0 credits anytime, or click 'Generate Bulk Documents' when all rows are ready.",
      },
    ],
  },

  view_certificate: {
    pageName: "Credential Details",
    steps: [
      {
        id: "view-cert-actions",
        target: '[data-tour="view-cert-actions"]',
        title: "Export, Edit or Revoke Credential",
        description:
          "Download print-ready PDF or PNG copies, click 'Edit & Customize' to fix recipient details or font sizes, or revoke/re-validate the credential on the public ledger.",
      },
      {
        id: "view-cert-preview",
        target: '[data-tour="view-cert-preview"]',
        title: "Rendered Credential Preview",
        description:
          "Inspect the exact credential as recipients and verifiers see it. Click 'View Fullscreen' for a closer look.",
      },
      {
        id: "view-cert-verification",
        target: '[data-tour="view-cert-verification"]',
        title: "Tamper-Proof Verification QR & Ledger Link",
        description:
          "Copy the public verification URL or scan the QR code to open the live verification portal confirming this credential's authenticity.",
      },
    ],
  },

  analytics: {
    pageName: "Analytics",
    steps: [
      {
        id: "analytics-kpis",
        target: '[data-tour="analytics-kpis"]',
        title: "Issuance & Verification KPIs",
        description:
          "Measure total issued credentials, email delivery rate, verification scan speed, and social sharing clicks across your workspace.",
      },
      {
        id: "analytics-charts",
        target: '[data-tour="analytics-charts"]',
        title: "Conversion Funnel & Verification Traffic",
        description:
          "See how recipients progress from receiving their email to opening, sharing on LinkedIn, and generating external QR/link verification scans.",
      },
      {
        id: "analytics-programs",
        target: '[data-tour="analytics-programs"]',
        title: "Program Performance & Goal Tracking",
        description:
          "Compare credential volume and engagement across your courses and track progress toward your verification benchmarks.",
      },
    ],
  },

  settings: {
    pageName: "Settings",
    steps: [
      {
        id: "settings-tabs",
        target: '[data-tour="settings-tabs"]',
        title: "Workspace, Billing & API Tabs",
        description:
          "Switch between Profile & Signatures, Appearance, Referral Rewards, Team Members, White-Label Custom Domain, Billing/Credits, and Developer API keys.",
      },
      {
        id: "settings-content",
        target: '[data-tour="settings-content"]',
        title: "Configure Your Workspace",
        description:
          "Upload your transparent PNG signature for automatic placement on certificates, upgrade to a Company workspace, or top up your credential credits.",
      },
    ],
  },

  support: {
    pageName: "Support Hub",
    steps: [
      {
        id: "support-kb",
        target: '[data-tour="support-kb"]',
        title: "Search Step-by-Step Guides",
        description:
          "Browse guides on bulk CSV column mapping, designing templates, custom domains, and API integration.",
      },
      {
        id: "support-ticket-cta",
        target: '[data-tour="support-ticket-cta"]',
        title: "Open a Priority Support Ticket",
        description:
          "Need hands-on help from our team? Click 'New Support Ticket' to send a direct request with attachments.",
      },
    ],
  },

  support_tickets: {
    pageName: "Support Tickets",
    steps: [
      {
        id: "tickets-create-form",
        target: '[data-tour="tickets-create-form"]',
        title: "Submit a Support Request",
        description:
          "Describe what you need help with and attach screenshots or files so our support team can resolve your issue quickly.",
      },
      {
        id: "tickets-history",
        target: '[data-tour="tickets-history"]',
        title: "Track Your Ticket Conversations",
        description:
          "Click any ticket in your history to view replies from our support team and continue the conversation.",
      },
    ],
  },

  upload_template: {
    pageName: "Certificate Studio",
    steps: [
      {
        id: "studio-import-btn",
        target: '[data-tour="studio-import-btn"]',
        title: "Import Your Own Certificate Design",
        description:
          "Have a certificate background designed in Canva, Figma, or Illustrator? Click 'Import image' to upload it—ProofDeck auto-fits the canvas for you.",
      },
      {
        id: "studio-left-tools",
        target: '[data-tour="studio-left-tools"]',
        title: "Add Dynamic Variables & Elements",
        description:
          "Click any variable like {{recipient_name}}, {{course_title}}, {{signature}}, or {{qr_code}} to drop it onto your canvas. ProofDeck fills these automatically when you issue.",
      },
      {
        id: "studio-canvas",
        target: '[data-tour="studio-canvas"]',
        title: "Position & Style on the Canvas",
        description:
          "Drag, resize, and align placeholders anywhere on your certificate. Click any text element to customize its font family, size, color, and alignment.",
      },
      {
        id: "studio-preview-save",
        target: '[data-tour="studio-preview-save"]',
        title: "Preview with Sample Data & Save",
        description:
          "Click 'Preview' to test how real recipient names and QR codes look on your design, then click 'Save template' to use it for single or bulk issuance.",
      },
    ],
  },

  document_editor: {
    pageName: "A4 Document Editor",
    steps: [
      {
        id: "doc-editor-header",
        target: '[data-tour="doc-editor-header"]',
        title: "Document Name, Word (.docx) Import & Toolbar",
        description:
          "Name your document template, import an existing Microsoft Word (.docx) file from the File menu, and format text using the A4 toolbar.",
      },
      {
        id: "doc-editor-sidebar",
        target: '[data-tour="doc-editor-sidebar"]',
        title: "Insert Merge Variables & QR Verification",
        description:
          "Click any {{variable}} in the left panel to insert it at your cursor position, or switch to the Security tab to configure the verification QR seal.",
      },
      {
        id: "doc-editor-canvas",
        target: '[data-tour="doc-editor-canvas"]',
        title: "Multi-Page A4 Sheet Canvas",
        description:
          "Write and format official transcripts, statements of result, or attestation letters. Add new A4 pages or page breaks as needed.",
      },
      {
        id: "doc-editor-actions",
        target: '[data-tour="doc-editor-actions"]',
        title: "Preview Merged Output & Save",
        description:
          "Toggle 'Preview' to see how sample student/recipient records render inside your document, then click 'Save template'.",
      },
    ],
  },
};

function resolvePageTourKey(pathname) {
  if (!pathname.startsWith("/dashboard")) return null;

  if (pathname === "/dashboard" || pathname === "/dashboard/") {
    return "overview";
  }
  if (pathname.startsWith("/dashboard/groups")) {
    // Check if group detail view is currently open in DOM
    if (
      typeof document !== "undefined" &&
      document.querySelector('[data-tour="group-detail-actions"]')
    ) {
      return "groups_detail";
    }
    return "groups_list";
  }
  if (pathname.startsWith("/dashboard/templates")) {
    return "templates";
  }
  if (pathname.startsWith("/dashboard/documents/editor")) {
    return "document_editor";
  }
  if (pathname.startsWith("/dashboard/documents")) {
    return "documents";
  }
  if (
    pathname.startsWith("/dashboard/create") ||
    pathname.startsWith("/dashboard/bulk-create") ||
    pathname.startsWith("/dashboard/edit")
  ) {
    if (
      typeof document !== "undefined" &&
      document.querySelector('[data-tour="create-bulk-setup"]')
    ) {
      return "create_bulk";
    }
    return "create_single";
  }
  if (pathname.startsWith("/dashboard/view/")) {
    return "view_certificate";
  }
  if (pathname.startsWith("/dashboard/analytics")) {
    return "analytics";
  }
  if (pathname.startsWith("/dashboard/settings")) {
    return "settings";
  }
  if (pathname.startsWith("/dashboard/support/tickets")) {
    return "support_tickets";
  }
  if (pathname.startsWith("/dashboard/support")) {
    return "support";
  }
  if (pathname.startsWith("/dashboard/upload-template")) {
    return "upload_template";
  }
  return "overview";
}

function isElementVisible(selector) {
  if (typeof document === "undefined" || !selector) return false;
  const el = document.querySelector(selector);
  if (!el) return false;
  const rect = el.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

export function TourProvider({ children }) {
  const location = useLocation();
  const { user } = useUser();
  const [isActive, setIsActive] = useState(false);
  const [activeSteps, setActiveSteps] = useState([]);
  const [activePageName, setActivePageName] = useState("");
  const [activeTourKey, setActiveTourKey] = useState(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const retryTimerRef = useRef(null);

  const stopTour = useCallback(
    (dismissOnboarding = false) => {
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }
      if (activeTourKey) {
        try {
          const userKey = user?.id ? `_${user.id}` : "";
          localStorage.setItem(`pd_tour_seen${userKey}_${activeTourKey}`, "1");
          localStorage.setItem("pd_initial_tour_shown", "1");
          if (dismissOnboarding) {
            localStorage.removeItem("pd_new_signup_tour");
          }
        } catch {
          // ignore storage errors
        }
      }
      setIsActive(false);
      setActiveSteps([]);
      setCurrentStepIndex(0);
    },
    [activeTourKey, user?.id]
  );

  const startPageTour = useCallback(
    (attempt = 0) => {
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }

      const tourKey = resolvePageTourKey(location.pathname);
      if (!tourKey) return;

      const def = PAGE_TOUR_DEFINITIONS[tourKey];
      if (!def || !def.steps?.length) return;

      const visibleSteps = def.steps.filter((s) => isElementVisible(s.target));

      if (visibleSteps.length === 0) {
        // Page might still be fetching data / rendering skeleton; retry up to 6 times
        if (attempt < 6) {
          retryTimerRef.current = setTimeout(() => {
            startPageTour(attempt + 1);
          }, 350);
        }
        return;
      }

      setActiveTourKey(tourKey);
      setActivePageName(def.pageName);
      setActiveSteps(visibleSteps);
      setCurrentStepIndex(0);
      setIsActive(true);
    },
    [location.pathname]
  );

  const nextStep = useCallback(() => {
    setCurrentStepIndex((prev) => {
      if (prev + 1 < activeSteps.length) {
        return prev + 1;
      }
      stopTour(false);
      return 0;
    });
  }, [activeSteps.length, stopTour]);

  const prevStep = useCallback(() => {
    setCurrentStepIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const goToStep = useCallback(
    (idx) => {
      if (idx >= 0 && idx < activeSteps.length) {
        setCurrentStepIndex(idx);
      }
    },
    [activeSteps.length]
  );

  // Stop active tour when route changes, and auto-trigger for new signups on unseen pages
  useEffect(() => {
    setIsActive(false);
    setActiveSteps([]);
    setCurrentStepIndex(0);

    if (!location.pathname.startsWith("/dashboard") || !user) return;

    const tourKey = resolvePageTourKey(location.pathname);
    if (!tourKey) return;

    const userKey = user?.id ? `_${user.id}` : "";
    const hasSeenPageTour = localStorage.getItem(`pd_tour_seen${userKey}_${tourKey}`) === "1";
    const isNewSignup = localStorage.getItem("pd_new_signup_tour") === "1";
    const neverSeenInitialTour = !localStorage.getItem("pd_initial_tour_shown");

    // Auto-start tour if user just signed up and hasn't seen this page's tour yet,
    // OR if it's their very first visit to the Overview dashboard.
    if ((isNewSignup && !hasSeenPageTour) || (tourKey === "overview" && neverSeenInitialTour && !hasSeenPageTour)) {
      const timer = setTimeout(() => {
        startPageTour(0);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [location.pathname, user, startPageTour]);

  return (
    <TourContext.Provider
      value={{
        isActive,
        steps: activeSteps,
        pageName: activePageName,
        currentStepIndex,
        currentStep: activeSteps[currentStepIndex] || null,
        startPageTour,
        stopTour,
        nextStep,
        prevStep,
        goToStep,
      }}
    >
      {children}
    </TourContext.Provider>
  );
}

export const useTour = () => {
  const ctx = useContext(TourContext);
  if (!ctx) {
    throw new Error("useTour must be used within a TourProvider");
  }
  return ctx;
};
