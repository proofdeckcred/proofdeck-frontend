// frontend/src/pages/CreateCertificatePage.jsx

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useParams, Link, useLocation } from "react-router-dom";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import {
  getTemplates,
  createCertificate,
  getCertificate,
  updateCertificate,
  bulkCreateCertificates,
  downloadBulkTemplate,
  getGroups,
  createGroup,
  getGroupDetails,
  bulkUpdateGroupCertificates,
  pullStudentsFromUniversityDb,
} from "../api";
import TemplateRenderer from "../components/templates/TemplateRenderer";
import { SERVER_BASE_URL } from "../config";
import {
  Calendar,
  Maximize2,
  X,
  ArrowLeft,
  Save,
  User,
  Type,
  FileText,
  PenTool,
  Loader2,
  Info,
  DollarSign,
  Plus,
  Trash2,
  UploadCloud,
  Download,
  Users,
  Pencil,
  Columns3,
  SlidersHorizontal,
  Table,
  FileSpreadsheet,
  Minimize2,
  Minus,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Zap,
  Lock,
  Send,
  RotateCcw,
  FolderOpen,
  Database,
} from "lucide-react";
import { Spinner } from "react-bootstrap";
import toast, { Toaster } from "react-hot-toast";
import { useUser } from "../context/UserContext";
import TemplateSelector from "../components/TemplateSelector";
import HelpGuide from "../components/HelpGuide";
import SpreadsheetGrid, {
  ensureMinimumRows,
  MIN_STARTER_ROWS,
} from "../components/bulk/SpreadsheetGrid";
import ColumnMappingModal from "../components/bulk/ColumnMappingModal";
import BulkLockedState from "../components/bulk/BulkLockedState";
import {
  cleanScatteredSheet,
  inferMappingLayerA,
  getSavedMapping,
  saveMappingMemory,
  isRowNonEmpty,
  validateRow,
  looksLikeEmail,
  formatExcelDate,
  parseExcelOrStringDate,
  looksLikeDate,
} from "../utils/columnMapping";

// --- REUSABLE UI COMPONENTS ---
const FormInput = ({ label, icon: Icon, required, ...props }) => (
  <div className="space-y-1">
    <label className="block text-xs font-semibold text-slate-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative group">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
          <Icon size={14} />
        </div>
      )}
      <input
        {...props}
        className={`block w-full rounded border border-slate-200 bg-white py-1.5 text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none transition-all duration-200 text-xs shadow-sm ${
          Icon ? "pl-8" : "px-2.5"
        }`}
      />
    </div>
  </div>
);

const CreateCertificatePage = () => {
  const { certId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEditMode = !!certId;

  // Active Handoff Modes: "single" or "bulk"
  const [creationMode, setCreationMode] = useState("single");
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [showBatchDefaults, setShowBatchDefaults] = useState(false);
  const [bulkActiveTab, setBulkActiveTab] = useState("upload"); // "upload" | "paste" | "database"
  const [previewRowIndex, setPreviewRowIndex] = useState(0);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [quickPasteText, setQuickPasteText] = useState("");
  const [templateSearchQuery, setTemplateSearchQuery] = useState("");

  // Core Form State
  const [formData, setFormData] = useState({
    template_id: "",
    recipient_name: "",
    recipient_email: "",
    course_title: "",
    issuer_name: "",
    issue_date: new Date().toLocaleDateString("en-CA"),
    signature: "",
    extra_fields: {},
  });

  const [customFields, setCustomFields] = useState([]);
  const [amount, setAmount] = useState("");

  // Bulk States
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [newGroupName, setNewGroupName] = useState("");
  const [bulkFile, setBulkFile] = useState(null);
  const [bulkSubmitting, setBulkSubmitting] = useState(false);

  // Batch Defaults applied across the whole batch
  const [batchDefaults, setBatchDefaults] = useState({
    course_title: "",
    issuer_name: "",
    issue_date: new Date().toLocaleDateString("en-CA"),
    signature: "",
  });

  // In-Page Spreadsheet Rows (Initialized with starter rows like a real spreadsheet)
  const [spreadsheetRows, setSpreadsheetRows] = useState(() =>
    ensureMinimumRows([], MIN_STARTER_ROWS, {
      course_title: "",
      issuer_name: "",
      issue_date: new Date().toLocaleDateString("en-CA"),
      signature: "",
    })
  );
  const [sheetName, setSheetName] = useState("Untitled Sheet");
  const [userCustomColumns, setUserCustomColumns] = useState([]);
  const [savedSheets, setSavedSheets] = useState([]);
  const [lastAutoSavedAt, setLastAutoSavedAt] = useState(null);
  const hasRestoredDraftRef = React.useRef(false);

  // Column Mapping Modal State
  const [isMappingModalOpen, setIsMappingModalOpen] = useState(false);
  const [detectedHeaders, setDetectedHeaders] = useState([]);
  const [rawUploadedRows, setRawUploadedRows] = useState([]);
  const [activeMapping, setActiveMapping] = useState({});
  const [splitNamesInfo, setSplitNamesInfo] = useState(null);

  // In-Page Spreadsheet Docked Widget States (Persisted for session)
  const [isSpreadsheetOpen, setIsSpreadsheetOpen] = useState(() => {
    try {
      return sessionStorage.getItem("pd_bulk_sheet_open") === "true";
    } catch (e) {
      return false;
    }
  });
  const [isSpreadsheetExpanded, setIsSpreadsheetExpanded] = useState(() => {
    try {
      return sessionStorage.getItem("pd_bulk_sheet_size") === "expanded";
    } catch (e) {
      return false;
    }
  });

  const launcherButtonRef = React.useRef(null);
  const panelRef = React.useRef(null);

  // Sync session storage when open or size state changes
  useEffect(() => {
    try {
      sessionStorage.setItem("pd_bulk_sheet_open", isSpreadsheetOpen ? "true" : "false");
    } catch (e) {}
  }, [isSpreadsheetOpen]);

  useEffect(() => {
    try {
      sessionStorage.setItem("pd_bulk_sheet_size", isSpreadsheetExpanded ? "expanded" : "compact");
    } catch (e) {}
  }, [isSpreadsheetExpanded]);

  const handleClosePanel = () => {
    setIsSpreadsheetOpen(false);
    launcherButtonRef.current?.focus();
  };

  const handlePanelKeyDown = (e) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      handleClosePanel();
    }
  };

  // Import Conflict Confirmation Modal State
  const [importConflictModal, setImportConflictModal] = useState({
    isOpen: false,
    matrix: null,
    fileName: "",
    existingCount: 0,
  });

  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showFullscreen, setShowFullscreen] = useState(false);

  // Bulk Group Edit Mode (?edit_group=<id>)
  const editGroupId = useMemo(
    () => new URLSearchParams(location.search).get("edit_group"),
    [location.search]
  );
  const isBulkGroupEditMode = Boolean(editGroupId);
  const [editingGroupInfo, setEditingGroupInfo] = useState(null);

  // Per-Certificate Font Size & Layout Customizer State
  const [showCertStyleEditor, setShowCertStyleEditor] = useState(isEditMode);
  const [activeStyleField, setActiveStyleField] = useState("recipient_name");
  const styleEditorRef = React.useRef(null);

  const { user, workspace } = useUser();
  const sheetStorageScope = `${user?.id || "anon"}_${workspace || "personal"}`;
  const activeDraftKey = `pd_active_sheet_${sheetStorageScope}`;
  const savedSheetsKey = `pd_saved_sheets_${sheetStorageScope}`;

  // Restore active spreadsheet draft & saved sheets list on load / workspace switch
  useEffect(() => {
    try {
      const rawList = localStorage.getItem(savedSheetsKey);
      if (rawList) {
        const parsedList = JSON.parse(rawList);
        if (Array.isArray(parsedList)) setSavedSheets(parsedList);
      } else {
        setSavedSheets([]);
      }

      if (!isBulkGroupEditMode) {
        const rawDraft = localStorage.getItem(activeDraftKey);
        if (rawDraft) {
          const draft = JSON.parse(rawDraft);
          if (draft && Array.isArray(draft.rows)) {
            // Strip any ghost starter rows that have no recipient_name and no recipient_email
            const sanitizedRows = draft.rows.filter(
              (r) =>
                (r?.recipient_name && String(r.recipient_name).trim()) ||
                (r?.recipient_email && String(r.recipient_email).trim())
            );
            setSpreadsheetRows(
              ensureMinimumRows(sanitizedRows, MIN_STARTER_ROWS, {})
            );
            if (draft.batchDefaults && typeof draft.batchDefaults === "object") {
              setBatchDefaults((prev) => ({ ...prev, ...draft.batchDefaults }));
            }
            if (draft.sheetName) setSheetName(draft.sheetName);
            if (Array.isArray(draft.userCustomColumns)) {
              setUserCustomColumns(draft.userCustomColumns);
            }
            if (draft.group_id) setSelectedGroupId(String(draft.group_id));
            if (draft.template_id) {
              setFormData((prev) => ({ ...prev, template_id: draft.template_id }));
            }
            setLastAutoSavedAt(draft.updatedAt || new Date().toISOString());
          }
        } else {
          setSpreadsheetRows(ensureMinimumRows([], MIN_STARTER_ROWS, {}));
        }
      }
    } catch (e) {}
    hasRestoredDraftRef.current = true;
  }, [activeDraftKey, savedSheetsKey, isBulkGroupEditMode]);

  // Auto-save working spreadsheet draft whenever rows, batchDefaults, sheetName, or custom columns change
  useEffect(() => {
    if (!hasRestoredDraftRef.current || isBulkGroupEditMode) return;
    try {
      const nowIso = new Date().toISOString();
      const payload = {
        sheetName,
        rows: spreadsheetRows,
        batchDefaults,
        userCustomColumns,
        template_id: formData.template_id,
        group_id: selectedGroupId,
        updatedAt: nowIso,
      };
      localStorage.setItem(activeDraftKey, JSON.stringify(payload));
      setLastAutoSavedAt(nowIso);
    } catch (e) {}
  }, [
    spreadsheetRows,
    batchDefaults,
    sheetName,
    userCustomColumns,
    formData.template_id,
    selectedGroupId,
    activeDraftKey,
    isBulkGroupEditMode,
  ]);

  const effectiveRole = user?.effective_role || user?.role || "free";
  const isBulkAllowed = true; // Bulk issuance is available on all plans (including Free)
  const isSpreadsheetAllowed = true; // Spreadsheet & Draft Saving enabled for all users
  const isProOrEnterprise = ["pro", "enterprise"].includes(effectiveRole);
  const isPro = isProOrEnterprise;
  const hasUploadedSignature = Boolean(user?.signature_image_url);
  const [useUploadedSignature, setUseUploadedSignature] = useState(true);
  const uploadedSignatureFullUrl = useMemo(() => {
    const raw = user?.signature_image_url;
    if (!raw) return null;
    if (raw.startsWith("http") || raw.startsWith("blob:") || raw.startsWith("data:")) return raw;
    const cleanBase = (SERVER_BASE_URL || "").replace(/\/+$/, "");
    return `${cleanBase}${raw.startsWith("/") ? raw : `/${raw}`}`;
  }, [user?.signature_image_url]);

  const [isSpreadsheetUpgradeModalOpen, setIsSpreadsheetUpgradeModalOpen] = useState(false);

  // University Database Connector ("Pull by Student ID") Modal State
  const [showDbPullModal, setShowDbPullModal] = useState(false);
  const [dbStudentIdsInput, setDbStudentIdsInput] = useState("");
  const [dbFacultyFilter, setDbFacultyFilter] = useState("");
  const [dbDepartmentFilter, setDbDepartmentFilter] = useState("");
  const [pullingFromDb, setPullingFromDb] = useState(false);

  const handlePullFromUniversityDb = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setPullingFromDb(true);
    try {
      const res = await pullStudentsFromUniversityDb({
        student_ids: dbStudentIdsInput,
        faculty: dbFacultyFilter,
        department: dbDepartmentFilter,
      });
      const pulledRows = res.data?.rows || [];
      const customCols = res.data?.custom_columns || [];
      if (pulledRows.length === 0) {
        toast.error("No matching student records found for those Student IDs / filters.");
        setPullingFromDb(false);
        return;
      }

      if (customCols.length > 0) {
        setUserCustomColumns((prev) => {
          const existingKeys = new Set(prev.map((c) => c.key));
          const merged = [...prev];
          customCols.forEach((cc) => {
            if (!existingKeys.has(cc.key)) {
              merged.push(cc);
            }
          });
          return merged;
        });
      }

      setSpreadsheetRows(ensureMinimumRows(pulledRows, MIN_STARTER_ROWS, batchDefaults));
      setSheetName(
        dbDepartmentFilter
          ? `${dbDepartmentFilter} Batch`
          : dbFacultyFilter
          ? `${dbFacultyFilter} Batch`
          : `SIS Database Pull (${pulledRows.length} Students)`
      );
      setShowDbPullModal(false);
      setIsSpreadsheetOpen(true);
      toast.success(
        `Pulled ${pulledRows.length} student ${
          pulledRows.length === 1 ? "record" : "records"
        } from University Database!`
      );
    } catch (err) {
      toast.error(err.response?.data?.msg || "Failed to pull records from database.");
    } finally {
      setPullingFromDb(false);
    }
  };

  const handleOpenSpreadsheet = () => {
    if (!isSpreadsheetAllowed) {
      setIsSpreadsheetUpgradeModalOpen(true);
      return;
    }
    setIsSpreadsheetOpen(true);
  };

  const activeWsObj =
    workspace !== "personal" && user?.workspaces
      ? user.workspaces.find((ws) => String(ws.id) === String(workspace))
      : null;
  const userCredits = activeWsObj?.cert_quota ?? user?.personal_cert_quota ?? user?.cert_quota ?? 0;

  // Toggle Mode via Query params or Paths
  useEffect(() => {
    if (
      location.pathname.includes("bulk-create") ||
      location.search.includes("mode=bulk") ||
      location.search.includes("edit_group=")
    ) {
      setCreationMode("bulk");
    } else {
      setCreationMode("single");
    }
  }, [location]);

  // Initial Data fetch (Templates, Groups, Single Certificate Edit, or Bulk Group Edit)
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [templateResponse, groupResponse] = await Promise.all([
          getTemplates(),
          getGroups(),
        ]);
        
        // Filter out invitation templates
        const filteredTemplates = templateResponse.data.templates.filter((t) => {
          if (t.layout_style === "visual" && t.layout_data) {
            try {
              const data = typeof t.layout_data === "string" ? JSON.parse(t.layout_data) : t.layout_data;
              return data.type !== "invitation";
            } catch (e) {}
          }
          return true;
        });

        setTemplates(filteredTemplates);
        setGroups(groupResponse.data.groups);

        if (isEditMode) {
          const certResponse = await getCertificate(certId);
          const cert = certResponse.data.certificate;
          const certUseUploadedSig =
            cert.use_uploaded_signature !== undefined
              ? Boolean(cert.use_uploaded_signature)
              : cert.extra_fields?.use_uploaded_signature !== undefined
              ? Boolean(cert.extra_fields.use_uploaded_signature)
              : true;
          setUseUploadedSignature(certUseUploadedSig);
          setFormData({
            template_id: certResponse.data.template.id,
            recipient_name: cert.recipient_name,
            recipient_email: cert.recipient_email,
            course_title: cert.course_title,
            issuer_name: cert.issuer_name,
            issue_date: new Date(cert.issue_date).toLocaleDateString("en-CA"),
            signature: cert.signature || "",
            use_uploaded_signature: certUseUploadedSig,
            extra_fields: cert.extra_fields || {},
          });
          setSelectedTemplate(certResponse.data.template);

          if (cert.extra_fields?.amount) setAmount(cert.extra_fields.amount);

          const fields = Object.entries(cert.extra_fields || {})
            .filter(
              ([key]) =>
                key !== "amount" &&
                key !== "use_uploaded_signature" &&
                key !== "cert_styles"
            )
            .map(([key, value]) => ({ key, value }));
          setCustomFields(fields);
        } else if (editGroupId) {
          const groupDetailRes = await getGroupDetails(editGroupId);
          const rawGroupData = groupDetailRes.data || {};
          const grp = rawGroupData.group || rawGroupData;
          const grpCerts = rawGroupData.certificates || grp?.certificates || [];
          if (grp && (grp.id || grpCerts.length > 0)) {
            setEditingGroupInfo(grp);
            setCreationMode("bulk");
            setSelectedGroupId(String(grp.id || editGroupId));
            setSheetName(grp.name || "Batch Edit");
            setGroups((prev) =>
              prev.some((g) => String(g.id) === String(grp.id || editGroupId))
                ? prev
                : [{ id: grp.id || editGroupId, name: grp.name || "Selected Batch" }, ...prev]
            );

            let fallbackCert = null;
            let fallbackTemplate = null;
            if (
              grpCerts.length > 0 &&
              (!grp.template_id && !grpCerts[0]?.template_id)
            ) {
              try {
                const firstCertRes = await getCertificate(
                  grpCerts[0].verification_id || grpCerts[0].id
                );
                fallbackCert = firstCertRes.data?.certificate || null;
                fallbackTemplate = firstCertRes.data?.template || null;
              } catch (e) {}
            }

            const tplId =
              grp.template_id ||
              grpCerts[0]?.template_id ||
              fallbackTemplate?.id ||
              fallbackCert?.template_id ||
              "";
            const matchedTpl =
              filteredTemplates.find((t) => String(t.id) === String(tplId)) ||
              fallbackTemplate ||
              null;
            if (tplId) {
              setFormData((prev) => ({ ...prev, template_id: tplId }));
              setSelectedTemplate(matchedTpl);
            }

            // Detect custom columns across certificates in this group
            const customColSet = new Map();
            grpCerts.forEach((c) => {
              const ex = c.extra_fields && typeof c.extra_fields === "object" ? c.extra_fields : {};
              Object.keys(ex).forEach((k) => {
                if (
                  k !== "use_uploaded_signature" &&
                  k !== "cert_styles" &&
                  k !== "amount" &&
                  !customColSet.has(k)
                ) {
                  const label = k
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (ch) => ch.toUpperCase());
                  customColSet.set(k, { key: k, label });
                }
              });
            });
            if (customColSet.size > 0) {
              setUserCustomColumns(Array.from(customColSet.values()));
            }

            const firstCert = grpCerts[0];
            const derivedDefaults = {
              course_title:
                firstCert?.course_title || fallbackCert?.course_title || "",
              issuer_name:
                firstCert?.issuer_name || fallbackCert?.issuer_name || "",
              issue_date: (firstCert?.issue_date || fallbackCert?.issue_date)
                ? new Date(
                    firstCert?.issue_date || fallbackCert?.issue_date
                  ).toLocaleDateString("en-CA")
                : new Date().toLocaleDateString("en-CA"),
              signature: firstCert?.signature || fallbackCert?.signature || "",
            };
            setBatchDefaults((prev) => ({ ...prev, ...derivedDefaults }));

            const loadedRows = grpCerts.map((c) => {
              const ex =
                c.extra_fields && typeof c.extra_fields === "object" ? c.extra_fields : {};
              const customVals = {};
              Object.entries(ex).forEach(([k, v]) => {
                if (
                  k !== "use_uploaded_signature" &&
                  k !== "cert_styles" &&
                  k !== "amount" &&
                  v !== undefined &&
                  v !== null
                ) {
                  customVals[k] = String(v);
                }
              });
              return {
                id: c.id,
                verification_id: c.verification_id,
                recipient_name: c.recipient_name || "",
                recipient_email: c.recipient_email || "",
                course_title: c.course_title || derivedDefaults.course_title || "",
                issuer_name: c.issuer_name || derivedDefaults.issuer_name || "",
                issue_date: c.issue_date
                  ? new Date(c.issue_date).toLocaleDateString("en-CA")
                  : derivedDefaults.issue_date,
                signature: c.signature || derivedDefaults.signature || "",
                ...customVals,
              };
            });

            setSpreadsheetRows(
              ensureMinimumRows(loadedRows, MIN_STARTER_ROWS, derivedDefaults)
            );
            setIsSpreadsheetOpen(true);
          }
        } else {
          // Restore selectedTemplate if draft had a template_id
          setFormData((prev) => {
            if (prev.template_id) {
              const matched = filteredTemplates.find(
                (t) => String(t.id) === String(prev.template_id)
              );
              if (matched) setSelectedTemplate(matched);
            }
            return prev;
          });
        }
      } catch (err) {
        setError("Could not fetch data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [certId, isEditMode, editGroupId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleTemplateChange = (e) => {
    const templateId = e.target.value;
    const template = templates.find((t) => String(t.id) === String(templateId));
    
    if (template?.is_premium && !isPro) {
      toast.error("This is a Premium Template. Please upgrade your account to use it.");
      return;
    }

    setFormData({ ...formData, template_id: templateId });
    setSelectedTemplate(template || null);
  };

  // Custom Fields Logic
  const addCustomField = () => {
    setCustomFields([...customFields, { key: "", value: "" }]);
  };

  const removeCustomField = (index) => {
    const newFields = [...customFields];
    newFields.splice(index, 1);
    setCustomFields(newFields);
  };

  const handleCustomFieldChange = (index, field, value) => {
    const newFields = [...customFields];
    newFields[index][field] = value;
    setCustomFields(newFields);
  };

  // Detect template-specific custom placeholders (e.g. {{assistant_signature}})
  const templateCustomPlaceholders = useMemo(() => {
    if (!selectedTemplate || selectedTemplate.layout_style !== "visual") return [];
    let layoutData = selectedTemplate.layout_data;
    if (typeof layoutData === "string") {
      try { layoutData = JSON.parse(layoutData); } catch (e) { layoutData = {}; }
    }
    const standard = new Set([
      "recipient_name", "course_title", "issue_date", "issuer_name",
      "signature", "verification_id", "qr_code", "amount"
    ]);
    const detected = [];
    (layoutData?.elements || []).forEach((el) => {
      if (el.text) {
        const matches = el.text.match(/{{([^}]+)}}/g);
        if (matches) {
          matches.forEach((m) => {
            const rawKey = m.replace(/[{}]/g, "").trim();
            const lowerKey = rawKey.toLowerCase();
            if (!standard.has(lowerKey) && !detected.some((d) => d.key === lowerKey)) {
              const label = rawKey
                .replace(/_/g, " ")
                .split(" ")
                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(" ");
              detected.push({ key: lowerKey, label });
            }
          });
        }
      }
    });
    (layoutData?.custom_fields || []).forEach((cf) => {
      const cleanKey = cf.value.replace(/[{}]/g, "").trim().toLowerCase();
      if (!standard.has(cleanKey) && !detected.some((d) => d.key === cleanKey)) {
        detected.push({ key: cleanKey, label: cf.name || cleanKey });
      }
    });
    return detected;
  }, [selectedTemplate]);

  // Detect whether the selected template actually has a signature field/placeholder
  // (Some users import custom certificate templates that already have the signature baked into the design)
  const templateHasSignatureField = useMemo(() => {
    if (!selectedTemplate) return true;
    if (selectedTemplate.layout_style !== "visual") return true;
    let layoutData = selectedTemplate.layout_data;
    if (typeof layoutData === "string") {
      try {
        layoutData = JSON.parse(layoutData);
      } catch (e) {
        layoutData = {};
      }
    }
    return (layoutData?.elements || []).some(
      (el) => el.visible !== false && typeof el.text === "string" && /\{\{\s*signature\s*\}\}/i.test(el.text)
    );
  }, [selectedTemplate]);

  // Sync custom fields, amount & uploaded signature preference
  useEffect(() => {
    const extras = { ...(formData.extra_fields || {}) };
    if (amount) extras.amount = amount;
    if (hasUploadedSignature) {
      extras.use_uploaded_signature = Boolean(useUploadedSignature);
    }

    customFields.forEach((field) => {
      if (field.key.trim()) {
        extras[field.key.trim()] = field.value;
      }
    });

    setFormData((prev) => ({
      ...prev,
      use_uploaded_signature: hasUploadedSignature ? Boolean(useUploadedSignature) : false,
      extra_fields: extras,
    }));
    setBatchDefaults((prev) => ({
      ...prev,
      use_uploaded_signature: hasUploadedSignature ? Boolean(useUploadedSignature) : false,
    }));
  }, [amount, customFields, useUploadedSignature, hasUploadedSignature]);

  const isReceipt = selectedTemplate?.layout_style === "receipt";
  const isInvitation = selectedTemplate?.layout_style === "invitation";

  // Per-Certificate Style Override Helpers
  const certStyles = useMemo(() => {
    const raw = formData.extra_fields?.cert_styles;
    if (raw && typeof raw === "object") {
      return {
        autoFit: raw.autoFit !== false,
        fields: raw.fields && typeof raw.fields === "object" ? raw.fields : {},
        elements: raw.elements && typeof raw.elements === "object" ? raw.elements : {},
      };
    }
    return { autoFit: true, fields: {}, elements: {} };
  }, [formData.extra_fields?.cert_styles]);

  const customizableStyleFields = useMemo(() => {
    const base = [
      { key: "recipient_name", label: isInvitation ? "Guest Name" : isReceipt ? "Payer Name" : "Recipient Name", defaultSize: 32 },
      { key: "course_title", label: isInvitation ? "Event Title" : isReceipt ? "Payment Description" : "Course / Event Title", defaultSize: 22 },
      { key: "issuer_name", label: "Issuer Name", defaultSize: 16 },
      { key: "issue_date", label: "Issue Date", defaultSize: 15 },
      { key: "signature", label: "Signature Text", defaultSize: 24 },
      { key: "title", label: "Certificate Title", defaultSize: 36 },
    ];
    templateCustomPlaceholders.forEach((cp) => {
      if (!base.some((b) => b.key === cp.key)) {
        base.push({ key: cp.key, label: cp.label, defaultSize: 18 });
      }
    });
    return base;
  }, [isInvitation, isReceipt, templateCustomPlaceholders]);

  const handleToggleAutoFit = (checked) => {
    setFormData((prev) => {
      const currentStyles =
        prev.extra_fields?.cert_styles && typeof prev.extra_fields.cert_styles === "object"
          ? prev.extra_fields.cert_styles
          : { autoFit: true, fields: {}, elements: {} };
      return {
        ...prev,
        extra_fields: {
          ...(prev.extra_fields || {}),
          cert_styles: {
            ...currentStyles,
            autoFit: Boolean(checked),
          },
        },
      };
    });
  };

  const handleFieldStyleChange = (fieldKey, prop, value) => {
    setFormData((prev) => {
      const currentStyles =
        prev.extra_fields?.cert_styles && typeof prev.extra_fields.cert_styles === "object"
          ? prev.extra_fields.cert_styles
          : { autoFit: true, fields: {}, elements: {} };
      const currentFields =
        currentStyles.fields && typeof currentStyles.fields === "object"
          ? currentStyles.fields
          : {};
      const fieldObj = { ...(currentFields[fieldKey] || {}) };
      if (value === "" || value === null || value === undefined) {
        delete fieldObj[prop];
      } else {
        fieldObj[prop] = value;
      }
      return {
        ...prev,
        extra_fields: {
          ...(prev.extra_fields || {}),
          cert_styles: {
            ...currentStyles,
            fields: {
              ...currentFields,
              [fieldKey]: fieldObj,
            },
          },
        },
      };
    });
  };

  const handleResetFieldStyle = (fieldKey) => {
    setFormData((prev) => {
      const currentStyles =
        prev.extra_fields?.cert_styles && typeof prev.extra_fields.cert_styles === "object"
          ? prev.extra_fields.cert_styles
          : { autoFit: true, fields: {}, elements: {} };
      const nextFields = { ...(currentStyles.fields || {}) };
      delete nextFields[fieldKey];
      return {
        ...prev,
        extra_fields: {
          ...(prev.extra_fields || {}),
          cert_styles: {
            ...currentStyles,
            fields: nextFields,
          },
        },
      };
    });
    toast.success("Field styling reset to template default");
  };

  const handleResetAllCertStyles = () => {
    setFormData((prev) => {
      const nextExtra = { ...(prev.extra_fields || {}) };
      delete nextExtra.cert_styles;
      return {
        ...prev,
        extra_fields: nextExtra,
      };
    });
    toast.success("All styling overrides reset to template defaults");
  };

  // Single Form submission
  const handleSubmit = async (e, resendEmail = false) => {
    if (e && e.preventDefault) e.preventDefault();
    setSubmitting(true);
    setError("");

    const payload = {
      ...formData,
      resend_email: Boolean(resendEmail),
      use_uploaded_signature: hasUploadedSignature ? Boolean(useUploadedSignature) : false,
      extra_fields: {
        ...(formData.extra_fields || {}),
        ...(hasUploadedSignature ? { use_uploaded_signature: Boolean(useUploadedSignature) } : {}),
      },
    };

    const promise = isEditMode
      ? updateCertificate(certId, payload)
      : createCertificate(payload);

    toast.promise(promise, {
      loading: isEditMode
        ? resendEmail
          ? "Updating & resending email..."
          : "Updating..."
        : "Issuing...",
      success: (response) => {
        setTimeout(() => navigate(-1), 1200);
        return response.data.msg;
      },
      error: (err) => {
        setSubmitting(false);
        return err.response?.data?.msg || "An error occurred.";
      },
    });
  };

  const allCustomColumnKeys = useMemo(
    () => [
      ...templateCustomPlaceholders.map((cf) => cf.key),
      ...userCustomColumns.map((uc) => uc.key),
    ],
    [templateCustomPlaceholders, userCustomColumns]
  );

  // Single Source of Truth for Spreadsheet Row Validation & Counts
  const {
    nonEmptyRows,
    readyRows,
    invalidRows,
    readyRowsCount,
    invalidRowsCount,
    nonEmptyRowsCount,
  } = useMemo(() => {
    const nonEmpty = [];
    const ready = [];
    const invalid = [];

    const emailCounts = new Map();
    spreadsheetRows.forEach((r) => {
      if (isRowNonEmpty(r, allCustomColumnKeys)) {
        const email = String(r.recipient_email || "").trim().toLowerCase();
        if (email && looksLikeEmail(email)) {
          emailCounts.set(email, (emailCounts.get(email) || 0) + 1);
        }
      }
    });

    spreadsheetRows.forEach((r, idx) => {
      if (isRowNonEmpty(r, allCustomColumnKeys)) {
        nonEmpty.push({ row: r, index: idx });
        const { isValid, cellErrors } = validateRow(r, emailCounts);
        if (isValid) {
          ready.push({ row: r, index: idx });
        } else {
          invalid.push({ row: r, index: idx, errors: cellErrors });
        }
      }
    });

    return {
      nonEmptyRows: nonEmpty,
      readyRows: ready,
      invalidRows: invalid,
      readyRowsCount: ready.length,
      invalidRowsCount: invalid.length,
      nonEmptyRowsCount: nonEmpty.length,
    };
  }, [spreadsheetRows, allCustomColumnKeys]);

  // Save current spreadsheet to named Saved Sheets list in localStorage
  const handleSaveSheet = useCallback(
    (customName) => {
      const targetName = (customName || sheetName || "Untitled Sheet").trim();
      setSheetName(targetName);
      const nonEmpty = spreadsheetRows.filter((r) =>
        isRowNonEmpty(r, allCustomColumnKeys)
      );
      const nowIso = new Date().toISOString();

      setSavedSheets((prev) => {
        const existingIdx = prev.findIndex(
          (s) => s.name.toLowerCase() === targetName.toLowerCase()
        );
        const entry = {
          id: existingIdx !== -1 ? prev[existingIdx].id : `sheet_${Date.now()}`,
          name: targetName,
          rows: spreadsheetRows,
          batchDefaults,
          userCustomColumns,
          template_id: formData.template_id,
          group_id: selectedGroupId,
          rowCount: nonEmpty.length,
          updatedAt: nowIso,
        };
        const updated =
          existingIdx !== -1
            ? prev.map((s, i) => (i === existingIdx ? entry : s))
            : [entry, ...prev];
        try {
          localStorage.setItem(savedSheetsKey, JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });

      toast.success(`Saved draft "${targetName}" (${nonEmpty.length} rows)`);
    },
    [
      sheetName,
      spreadsheetRows,
      allCustomColumnKeys,
      batchDefaults,
      userCustomColumns,
      formData.template_id,
      selectedGroupId,
      savedSheetsKey,
    ]
  );

  const handleLoadSavedSheet = useCallback(
    (sheetObj) => {
      if (!sheetObj) return;
      setSheetName(sheetObj.name || "Untitled Sheet");
      if (sheetObj.batchDefaults) {
        setBatchDefaults((prev) => ({ ...prev, ...sheetObj.batchDefaults }));
      }
      if (Array.isArray(sheetObj.userCustomColumns)) {
        setUserCustomColumns(sheetObj.userCustomColumns);
      }
      if (sheetObj.group_id) {
        setSelectedGroupId(String(sheetObj.group_id));
      }
      if (sheetObj.template_id) {
        setFormData((prev) => ({ ...prev, template_id: sheetObj.template_id }));
        const matched = templates.find(
          (t) => String(t.id) === String(sheetObj.template_id)
        );
        if (matched) setSelectedTemplate(matched);
      }
      setSpreadsheetRows(
        ensureMinimumRows(
          sheetObj.rows || [],
          MIN_STARTER_ROWS,
          sheetObj.batchDefaults || {}
        )
      );
      toast.success(`Loaded draft "${sheetObj.name}"`);
    },
    [templates]
  );

  const handleDeleteSavedSheet = useCallback(
    (sheetId) => {
      setSavedSheets((prev) => {
        const updated = prev.filter((s) => s.id !== sheetId);
        try {
          localStorage.setItem(savedSheetsKey, JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });
      toast.success("Removed saved spreadsheet");
    },
    [savedSheetsKey]
  );

  const handleNewSheet = useCallback(() => {
    const todayStr = new Date().toLocaleDateString("en-CA");
    const cleanDefaults = {
      course_title: "",
      issuer_name: "",
      issue_date: todayStr,
      signature: "",
    };
    setSheetName("Untitled Sheet");
    setBatchDefaults(cleanDefaults);
    setUserCustomColumns([]);
    setBulkFile(null);
    setDetectedHeaders([]);
    setRawUploadedRows([]);
    setSpreadsheetRows(ensureMinimumRows([], MIN_STARTER_ROWS, cleanDefaults));
    try {
      localStorage.removeItem(activeDraftKey);
    } catch (e) {}
    toast.success("Started new blank spreadsheet");
  }, [activeDraftKey]);

  // Apply Mappings to convert raw 2D sheet rows into standardized ProofDeck row objects
  const applyMappingsToRows = useCallback(
    (headers, rows, mapping, splitNames, currentDefaults) => {
      return rows
        .map((r) => {
          const rowObj = {
            recipient_name: "",
            recipient_email: "",
            course_title: currentDefaults?.course_title || "",
            issuer_name: currentDefaults?.issuer_name || "",
            issue_date: currentDefaults?.issue_date || new Date().toLocaleDateString("en-CA"),
            signature: currentDefaults?.signature || "",
          };

          // 1. Recipient Name: Split vs Direct
          if (splitNames?.firstNameColumn && splitNames?.lastNameColumn) {
            const fIdx = headers.indexOf(splitNames.firstNameColumn);
            const lIdx = headers.indexOf(splitNames.lastNameColumn);
            const fVal = fIdx !== -1 && r[fIdx] !== undefined ? String(r[fIdx]).trim() : "";
            const lVal = lIdx !== -1 && r[lIdx] !== undefined ? String(r[lIdx]).trim() : "";
            rowObj.recipient_name = `${fVal} ${lVal}`.trim();
          } else if (mapping.recipient_name?.sourceColumn) {
            const idx = headers.indexOf(mapping.recipient_name.sourceColumn);
            if (idx !== -1 && r[idx] !== undefined) {
              rowObj.recipient_name = String(r[idx]).trim();
            }
          }

          // 2. Core Fields (Auto-convert Excel serial numbers and dates)
          ["recipient_email", "course_title", "issuer_name", "issue_date", "signature"].forEach((key) => {
            const srcCol = mapping[key]?.sourceColumn;
            if (srcCol) {
              const idx = headers.indexOf(srcCol);
              if (idx !== -1 && r[idx] !== undefined) {
                const val = String(r[idx]).trim();
                if (val) {
                  rowObj[key] = key === "issue_date" ? formatExcelDate(val) : val;
                }
              }
            } else if (currentDefaults[key]) {
              rowObj[key] = key === "issue_date" ? formatExcelDate(currentDefaults[key]) : currentDefaults[key];
            }
          });

          // 3. Custom Template Placeholders & User Custom Columns
          [...templateCustomPlaceholders, ...userCustomColumns].forEach((cf) => {
            const srcCol = mapping[cf.key]?.sourceColumn;
            if (srcCol) {
              const idx = headers.indexOf(srcCol);
              if (idx !== -1 && r[idx] !== undefined) {
                const val = String(r[idx]).trim();
                if (val) rowObj[cf.key] = val;
              }
            }
          });

          return rowObj;
        })
        .filter((rowObj) => isRowNonEmpty(rowObj, allCustomColumnKeys));
    },
    [templateCustomPlaceholders, userCustomColumns, allCustomColumnKeys]
  );

  // Proceed with parsed import (mode = "replace" or "append")
  const proceedWithImport = useCallback(
    (matrix, fileName, mode = "replace") => {
      const { cleanedHeaders, cleanedRows } = cleanScatteredSheet(matrix);
      if (!cleanedRows || cleanedRows.length === 0) {
        toast.error("No data rows found in the uploaded spreadsheet.");
        return;
      }

      setDetectedHeaders(cleanedHeaders);
      setRawUploadedRows(cleanedRows);
      if (fileName) {
        const cleanTitle = fileName.replace(/\.(csv|xlsx|xls|ods)$/i, "");
        if (cleanTitle) setSheetName(cleanTitle);
      }

      // Check saved mapping memory in localStorage for 1-click repeat uploads
      const savedMapping = getSavedMapping(cleanedHeaders);

      // Run Layer A rule-based & cell value heuristic mapping
      const layerA = inferMappingLayerA(cleanedHeaders, cleanedRows);

      const mappingToUse = savedMapping?.currentMapping || layerA.mappings;
      const splitToUse = savedMapping?.isSplitNameMode
        ? { firstNameColumn: savedMapping.splitFirstCol, lastNameColumn: savedMapping.splitLastCol }
        : layerA.splitNames;

      setActiveMapping(mappingToUse);
      setSplitNamesInfo(splitToUse);

      // If saved mapping exists OR Layer A is confident:
      if (savedMapping || layerA.isConfident) {
        const converted = applyMappingsToRows(
          cleanedHeaders,
          cleanedRows,
          mappingToUse,
          splitToUse,
          batchDefaults
        );

        setSpreadsheetRows((prev) => {
          if (mode === "append") {
            const existingNonEmpty = prev.filter((r) =>
              isRowNonEmpty(r, allCustomColumnKeys)
            );
            return ensureMinimumRows(
              [...existingNonEmpty, ...converted],
              MIN_STARTER_ROWS,
              batchDefaults
            );
          }
          return ensureMinimumRows(converted, MIN_STARTER_ROWS, batchDefaults);
        });

        // Sync first row into WYSIWYG preview
        if (converted.length > 0) {
          const first = converted[0];
          setFormData((prev) => ({
            ...prev,
            recipient_name: first.recipient_name || prev.recipient_name,
            recipient_email: first.recipient_email || prev.recipient_email,
            course_title: first.course_title || prev.course_title,
            issuer_name: first.issuer_name || prev.issuer_name,
            issue_date: first.issue_date || prev.issue_date,
            signature: first.signature || prev.signature,
          }));
        }

        toast.success(
          mode === "append"
            ? `Appended ${converted.length} rows from ${fileName}!`
            : `${fileName} mapped! ${converted.length} rows loaded into editor.`
        );
      } else {
        // Low confidence or messy headers -> Open mapping modal for easy review
        setIsMappingModalOpen(true);
        toast("Please review the column mappings for your sheet.", { icon: "ℹ️" });
      }
    },
    [applyMappingsToRows, batchDefaults, allCustomColumnKeys]
  );

  // Process raw matrix (array of rows) through Scattered Cleaner & Layer A Rules
  const handleParsedMatrix = useCallback(
    (matrix, fileName) => {
      if (nonEmptyRowsCount > 0) {
        setImportConflictModal({
          isOpen: true,
          matrix,
          fileName,
          existingCount: nonEmptyRowsCount,
        });
        return;
      }
      proceedWithImport(matrix, fileName, "replace");
    },
    [nonEmptyRowsCount, proceedWithImport]
  );

  // Bulk File Upload Parsing (CSV & Excel)
  const handleBulkFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    setBulkFile(selectedFile);

    const fileName = selectedFile.name.toLowerCase();
    if (fileName.endsWith(".csv")) {
      Papa.parse(selectedFile, {
        header: false,
        skipEmptyLines: false,
        complete: (result) => {
          if (result.errors?.length > 0 && (!result.data || result.data.length === 0)) {
            toast.error("Could not parse CSV file.");
            return;
          }
          handleParsedMatrix(result.data, selectedFile.name);
        },
        error: () => toast.error("Failed to parse CSV file."),
      });
    } else if (
      fileName.endsWith(".xlsx") ||
      fileName.endsWith(".xls") ||
      fileName.endsWith(".ods")
    ) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const data = new Uint8Array(evt.target.result);
          const workbook = XLSX.read(data, { type: "array" });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const matrix = XLSX.utils.sheet_to_json(worksheet, { header: 1, blankrows: false });
          handleParsedMatrix(matrix, selectedFile.name);
        } catch (err) {
          toast.error("Failed to parse Excel file.");
        }
      };
      reader.onerror = () => toast.error("Failed to read Excel file.");
      reader.readAsArrayBuffer(selectedFile);
    } else {
      toast.error("Unsupported file format. Please upload CSV or Excel (.xlsx, .xls).");
    }
  };

  // Live callback from ColumnMappingModal: updates grid and live preview immediately
  const handleLiveMappingUpdate = useCallback(
    ({ mapping, splitNames, batchDefaults: newDefaults }) => {
      if (newDefaults) {
        setBatchDefaults((prev) => ({ ...prev, ...newDefaults }));
      }
      if (mapping) setActiveMapping(mapping);
      if (splitNames !== undefined) setSplitNamesInfo(splitNames);

      if (detectedHeaders.length > 0 && rawUploadedRows.length > 0) {
        const converted = applyMappingsToRows(
          detectedHeaders,
          rawUploadedRows,
          mapping || activeMapping,
          splitNames !== undefined ? splitNames : splitNamesInfo,
          newDefaults || batchDefaults
        );
        setSpreadsheetRows(
          ensureMinimumRows(converted, MIN_STARTER_ROWS, newDefaults || batchDefaults)
        );

        if (converted.length > 0) {
          const first = converted[0];
          setFormData((prev) => ({
            ...prev,
            recipient_name: first.recipient_name || prev.recipient_name,
            recipient_email: first.recipient_email || prev.recipient_email,
            course_title: first.course_title || prev.course_title,
            issuer_name: first.issuer_name || prev.issuer_name,
            issue_date: first.issue_date || prev.issue_date,
            signature: first.signature || prev.signature,
          }));
        }
      }
    },
    [detectedHeaders, rawUploadedRows, applyMappingsToRows, activeMapping, splitNamesInfo, batchDefaults]
  );

  // Callback from ColumnMappingModal when user confirms mappings
  const handleConfirmMappingFromModal = ({ mapping, splitNames, batchDefaults: newDefaults }) => {
    handleLiveMappingUpdate({ mapping, splitNames, batchDefaults: newDefaults });
    setIsMappingModalOpen(false);
    saveMappingMemory(detectedHeaders, mapping, splitNames);
    toast.success("Column mappings applied.");
  };

  // Sync spreadsheet first row into WYSIWYG Live Preview when rows change
  useEffect(() => {
    if (creationMode === "bulk" && spreadsheetRows.length > 0) {
      const firstRow =
        spreadsheetRows.find((r) => isRowNonEmpty(r, allCustomColumnKeys)) ||
        spreadsheetRows[0];
      setFormData((prev) => ({
        ...prev,
        recipient_name: firstRow.recipient_name || "Recipient Name",
        recipient_email: firstRow.recipient_email || "",
        course_title:
          firstRow.course_title ||
          batchDefaults.course_title ||
          prev.course_title ||
          "Course Title",
        issuer_name: firstRow.issuer_name || batchDefaults.issuer_name || prev.issuer_name || "",
        issue_date: firstRow.issue_date || batchDefaults.issue_date || prev.issue_date,
        signature: firstRow.signature || batchDefaults.signature || prev.signature || "",
      }));
    }
  }, [spreadsheetRows, creationMode, batchDefaults, allCustomColumnKeys]);

  // Create group inline
  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return toast.error("Please enter a group name.");
    try {
      const res = await createGroup(newGroupName);
      const newGroup = res.data.group;
      setGroups((prev) => [newGroup, ...prev]);
      setSelectedGroupId(newGroup.id);
      setNewGroupName("");
      toast.success("Group created!");
    } catch (err) {
      toast.error("Failed to create group.");
    }
  };

  // Download CSV sample template
  const handleDownloadTemplate = async () => {
    try {
      const response = await downloadBulkTemplate(formData.template_id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "proofdeck_bulk_template.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      window.open(
        `${SERVER_BASE_URL}/api/certificates/bulk-template${
          formData.template_id ? `?template_id=${formData.template_id}` : ""
        }`,
        "_blank"
      );
    }
  };

  // Count how many rows in Bulk Group Edit Mode are newly added (without an existing certificate ID)
  const newGroupRowsCount = useMemo(
    () => (isBulkGroupEditMode ? readyRows.filter(({ row }) => !row.id).length : readyRowsCount),
    [isBulkGroupEditMode, readyRows, readyRowsCount]
  );

  // Bulk Group Edit Submission (Save or Save & Resend)
  const handleBulkGroupUpdate = async (resendEmails = false) => {
    if (!editGroupId) return;
    if (!formData.template_id) {
      toast.error("Please select a Template.");
      return;
    }
    if (invalidRowsCount > 0) {
      toast.error(
        `${invalidRowsCount} ${
          invalidRowsCount === 1 ? "row needs" : "rows need"
        } attention before saving. Please fix the highlighted errors in the spreadsheet.`
      );
      return;
    }
    if (readyRowsCount === 0) {
      toast.error("Please keep at least one valid recipient row in the group.");
      return;
    }
    if (newGroupRowsCount > 0 && userCredits < newGroupRowsCount) {
      toast.error(
        `Insufficient credits for ${newGroupRowsCount} new ${
          newGroupRowsCount === 1 ? "row" : "rows"
        } (you have ${userCredits} credits). Updating existing rows is free.`
      );
      return;
    }

    setBulkSubmitting(true);
    try {
      const cleanRowsToSubmit = readyRows.map(({ row: r }) => {
        const extraMap = {};
        allCustomColumnKeys.forEach((ck) => {
          if (r[ck] !== undefined && r[ck] !== null && String(r[ck]).trim() !== "") {
            extraMap[ck] = String(r[ck]).trim();
          }
        });
        return {
          id: r.id || undefined,
          recipient_name: String(r.recipient_name || "").trim(),
          recipient_email: r.recipient_email
            ? String(r.recipient_email).trim().toLowerCase()
            : "",
          course_title: String(r.course_title || batchDefaults.course_title || "").trim(),
          issuer_name: (r.issuer_name || batchDefaults.issuer_name || "").trim(),
          issue_date: (
            r.issue_date ||
            batchDefaults.issue_date ||
            new Date().toLocaleDateString("en-CA")
          ).trim(),
          signature: (r.signature || batchDefaults.signature || "").trim(),
          extra_fields: extraMap,
        };
      });

      const promise = bulkUpdateGroupCertificates(editGroupId, {
        template_id: formData.template_id,
        rows: cleanRowsToSubmit,
        certificates: cleanRowsToSubmit,
        batch_defaults: batchDefaults,
        delete_missing: true,
        resend_emails: Boolean(resendEmails),
      });

      toast.promise(promise, {
        loading: resendEmails
          ? "Saving changes & queuing emails..."
          : "Saving batch changes...",
        success: (response) => {
          setBulkSubmitting(false);
          setTimeout(() => navigate("/dashboard/certificates"), 1200);
          return response.data?.msg || "Group updated successfully!";
        },
        error: (err) => {
          setBulkSubmitting(false);
          return err.response?.data?.msg || "Failed to update group.";
        },
      });
    } catch (err) {
      setBulkSubmitting(false);
      toast.error("Failed to prepare group update.");
    }
  };

  // Bulk Form submission (Uses canonical readyRows and credit check)
  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    if (isBulkGroupEditMode) {
      await handleBulkGroupUpdate(false);
      return;
    }
    if (!formData.template_id || !selectedGroupId) {
      toast.error("Please select a Template and a Group Folder.");
      return;
    }

    if (nonEmptyRowsCount === 0) {
      toast.error("Please enter at least one recipient row in the spreadsheet.");
      return;
    }

    if (invalidRowsCount > 0) {
      toast.error(
        `${invalidRowsCount} ${
          invalidRowsCount === 1 ? "row needs" : "rows need"
        } attention before you can generate documents. Please fix the highlighted errors in the spreadsheet.`
      );
      return;
    }

    if (readyRowsCount === 0) {
      toast.error("Please enter at least one valid recipient row in the spreadsheet.");
      return;
    }

    // Check user credit balance against readyRowsCount
    if (userCredits < readyRowsCount) {
      toast.error(
        `Insufficient credits: Batch requires ${readyRowsCount} credits, but you only have ${userCredits} available. Please purchase credits to continue.`
      );
      return;
    }

    setBulkSubmitting(true);

    try {
      // Build clean CSV array from canonical readyRows with batch defaults and custom columns applied
      const cleanRowsToSubmit = readyRows.map(({ row: r }) => {
        const rowData = {
          recipient_name: String(r.recipient_name || "").trim(),
          recipient_email: r.recipient_email
            ? String(r.recipient_email).trim().toLowerCase()
            : "",
          course_title: String(r.course_title || batchDefaults.course_title || "").trim(),
          issuer_name: (r.issuer_name || batchDefaults.issuer_name || "").trim(),
          issue_date: (
            r.issue_date ||
            batchDefaults.issue_date ||
            new Date().toLocaleDateString("en-CA")
          ).trim(),
          signature: (r.signature || batchDefaults.signature || "").trim(),
        };
        allCustomColumnKeys.forEach((ck) => {
          if (r[ck] !== undefined && r[ck] !== null && String(r[ck]).trim() !== "") {
            rowData[ck] = String(r[ck]).trim();
          }
        });
        return rowData;
      });

      const csvContent = Papa.unparse(cleanRowsToSubmit);
      const csvBlob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const batchFile = new File([csvBlob], "proofdeck_batch.csv", { type: "text/csv" });

      const data = new FormData();
      data.append("template_id", formData.template_id);
      data.append("file", batchFile);
      data.append("group_id", selectedGroupId);
      data.append("batch_defaults", JSON.stringify(batchDefaults));

      const promise = bulkCreateCertificates(data);
      toast.promise(promise, {
        loading: "Initiating background creation...",
        success: (response) => {
          const jobId = response.data?.job_id;
          if (jobId) {
            localStorage.setItem("proofdeck_active_job_id", jobId.toString());
            window.dispatchEvent(
              new CustomEvent("proofdeck-job-started", { detail: { jobId } })
            );
          }
          setTimeout(() => navigate("/dashboard"), 1500);
          return response.data?.msg || "Processing started in background!";
        },
        error: (err) => {
          setBulkSubmitting(false);
          return err.response?.data?.msg || "Bulk creation failed.";
        },
      });
    } catch (err) {
      setBulkSubmitting(false);
      toast.error("Failed to prepare batch data.");
    }
  };


  // Derived active rows and preview row data for Bulk & Single parity
  const activeNonEmptyRows = useMemo(
    () => spreadsheetRows.filter((r) => isRowNonEmpty(r, allCustomColumnKeys)),
    [spreadsheetRows, allCustomColumnKeys]
  );

  const currentPreviewRowData = useMemo(() => {
    if (creationMode !== "bulk") {
      return formData;
    }
    const safeIdx = Math.min(previewRowIndex, Math.max(0, activeNonEmptyRows.length - 1));
    const selectedRow = activeNonEmptyRows[safeIdx] || activeNonEmptyRows[0] || {};
    return {
      ...formData,
      recipient_name: selectedRow.recipient_name || formData.recipient_name || "Jane Doe",
      recipient_email: selectedRow.recipient_email || formData.recipient_email || "",
      course_title: selectedRow.course_title || batchDefaults.course_title || formData.course_title || "Course Title",
      issuer_name: selectedRow.issuer_name || batchDefaults.issuer_name || formData.issuer_name || "Issuer Name",
      issue_date: selectedRow.issue_date || batchDefaults.issue_date || formData.issue_date || new Date().toISOString().split("T")[0],
      signature: selectedRow.signature || batchDefaults.signature || formData.signature || "",
      extra_fields: { ...(formData.extra_fields || {}), ...(selectedRow.extra_fields || {}) },
    };
  }, [creationMode, formData, activeNonEmptyRows, previewRowIndex, batchDefaults, allCustomColumnKeys]);

  // Handle inline cell edits in the 5-row table with auto-save & date parsing
  const handleInlineCellChange = (displayRowIdx, colKey, val) => {
    setSpreadsheetRows((prev) => {
      const next = [...prev];
      const targetRow = activeNonEmptyRows[displayRowIdx] || next[displayRowIdx];
      if (targetRow) {
        const globalIdx = next.indexOf(targetRow);
        if (globalIdx !== -1) {
          let cleanVal = val;
          if (colKey === "issue_date") {
            cleanVal = formatExcelDate(val);
          }
          next[globalIdx] = { ...next[globalIdx], [colKey]: cleanVal };
        }
      }
      return next;
    });
  };

  // Import pasted data from "Type or paste" tab
  const handleImportPastedText = () => {
    if (!quickPasteText.trim()) {
      toast.error("Please paste recipient lines first");
      return;
    }
    const lines = quickPasteText.split(/\r\n|\n|\r/).filter((l) => l.trim() !== "");
    if (lines.length === 0) return;
    const matrix = lines.map((line) => (line.includes("\t") ? line.split("\t") : line.split(",")));
    handleParsedMatrix(matrix, "Pasted recipients");
    setQuickPasteText("");
    toast.success(`Imported ${matrix.length} rows`);
  };

  // Clear loaded recipients
  const handleClearRecipients = () => {
    if (window.confirm("Are you sure you want to clear all loaded recipients?")) {
      handleNewSheet();
      setBulkFile(null);
      setPreviewRowIndex(0);
      toast.success("Recipients cleared");
    }
  };

  // Resume saved draft
  const handleResumeDraft = (draft) => {
    handleLoadSavedSheet(draft || savedSheets[0]);
    toast.success("Draft resumed");
  };

  // Single mode save draft
  const handleSaveSingleDraft = () => {
    try {
      localStorage.setItem(`pd_single_draft_${user?.id || "anon"}`, JSON.stringify(formData));
      toast.success("Draft saved");
    } catch (e) {
      toast.error("Failed to save draft");
    }
  };

  if (loading) {
    return (
      <div className="w-full pb-12 animate-pulse">
        {/* Navigation Header Skeleton */}
        <div className="border-b border-slate-200/80 bg-white mb-6 -mt-6 px-4 py-3 rounded-b-lg">
          <div className="flex justify-between items-center max-w-[1600px] mx-auto h-8">
            <div className="w-1/3 bg-gray-200 h-4 rounded" />
            <div className="w-1/4 bg-gray-200 h-6 rounded" />
          </div>
        </div>
        {/* Body Skeletons */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-4 bg-gray-100 border border-gray-200 rounded-xl h-96" />
          <div className="lg:col-span-8 bg-gray-100 border border-gray-200 rounded-xl h-96" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full pb-32">
      <Toaster position="top-right" />

      {/* --- Top Bar & 3-Step Indicator (Matching Wireframes) --- */}
      <div className="border-b border-slate-200/80 bg-white mb-6 -mt-6 px-4 sm:px-6 py-3.5 rounded-b-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 max-w-[1600px] mx-auto">
          {/* Breadcrumb Title */}
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs hover:bg-black transition-colors"
              aria-label="Back to dashboard"
            >
              PD
            </Link>
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-800">
              <span className="font-bold">ProofDeck</span>
              <span className="text-slate-400">/</span>
              <span className="text-slate-500 font-medium">Issue credentials</span>
            </div>
          </div>

          {/* 3-Step Indicator */}
          <nav aria-label="Issuance steps" className="flex items-center gap-6 sm:gap-8">
            <button
              type="button"
              onClick={() => setIsTemplateModalOpen(true)}
              className="flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors cursor-pointer min-h-[44px]"
            >
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold">
                1
              </span>
              <span>Template</span>
            </button>

            <div className="flex items-center gap-2 text-xs font-bold text-sky-600">
              <span className="w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center text-[10px] font-bold">
                2
              </span>
              <span>{creationMode === "single" ? "Details" : "Recipients"}</span>
            </div>

            <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
              <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[10px] font-bold">
                3
              </span>
              <span>Review &amp; issue</span>
            </div>
          </nav>

          <HelpGuide type="certificates" />
        </div>
      </div>

      {/* --- Main 2-Column Bento Layout --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start max-w-[1600px] mx-auto">
        
        {/* ================= LEFT COLUMN: FORM & RECIPIENTS ================= */}
        <div className="lg:col-span-6 space-y-4">
          
          {/* Top Row: Mode Switcher & Bulk Template Link */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Mode Switcher Pill */}
            {!isEditMode && (
              <div
                role="tablist"
                aria-label="Credential mode"
                className="bg-slate-100 p-1 rounded-xl flex gap-1 border border-slate-200/60"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={creationMode === "single"}
                  onClick={() => setCreationMode("single")}
                  className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all min-h-[44px] cursor-pointer flex items-center gap-2 ${
                    creationMode === "single"
                      ? "bg-white text-slate-900 shadow-xs border border-slate-200/80 font-bold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <User size={14} />
                  <span>One person</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={creationMode === "bulk"}
                  onClick={() => setCreationMode("bulk")}
                  className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all min-h-[44px] cursor-pointer flex items-center gap-2 ${
                    creationMode === "bulk"
                      ? "bg-white text-slate-900 shadow-xs border border-slate-200/80 font-bold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Users size={14} />
                  <span>Many people (bulk)</span>
                </button>
              </div>
            )}

            {/* Bulk Mode Compact Template Link */}
            {creationMode === "bulk" && (
              <div className="text-xs text-slate-600 flex items-center gap-1.5">
                <span>Template:</span>
                <span className="font-bold text-slate-900 truncate max-w-[150px]">
                  {selectedTemplate?.name || "Pro Certified"}
                </span>
                <span className="text-slate-300">·</span>
                <button
                  type="button"
                  onClick={() => setIsTemplateModalOpen(true)}
                  className="font-semibold text-sky-600 hover:text-sky-800 hover:underline cursor-pointer"
                >
                  Change
                </button>
              </div>
            )}
          </div>

          {/* ================= SINGLE PERSON MODE ================= */}
          {creationMode === "single" ? (
            <div className="space-y-4">
              {/* Selected Template Compact Row */}
              <div className="bg-white rounded-xl border border-slate-200 p-3.5 sm:p-4 shadow-xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-14 h-11 bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                    {selectedTemplate?.thumbnail_url || selectedTemplate?.background_url ? (
                      <img
                        src={selectedTemplate.thumbnail_url || selectedTemplate.background_url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <LayoutTemplate size={20} className="text-slate-400" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-800 truncate">
                      {selectedTemplate?.name || "Pro Certified"}
                    </h3>
                    <p className="text-[11px] text-slate-400 truncate">
                      {selectedTemplate?.category || "Certificate of completion"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsTemplateModalOpen(true)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-xs transition-colors shrink-0 cursor-pointer min-h-[44px] flex items-center justify-center"
                >
                  Change template
                </button>
              </div>

              {/* Card 1: Who is it for? */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
                <h2 className="text-sm font-bold text-slate-800">Who is it for?</h2>
                
                <div className="space-y-1.5">
                  <label htmlFor="single_recipient_name" className="block text-xs font-semibold text-slate-700">
                    Recipient name <span className="text-slate-400 font-normal">(required)</span>
                  </label>
                  <input
                    id="single_recipient_name"
                    name="recipient_name"
                    type="text"
                    required
                    placeholder="e.g. Jane Doe"
                    value={formData.recipient_name}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent min-h-[44px]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="single_recipient_email" className="block text-xs font-semibold text-slate-700">
                    Email <span className="text-slate-400 font-normal">(optional)</span>
                  </label>
                  <input
                    id="single_recipient_email"
                    name="recipient_email"
                    type="email"
                    placeholder="jane@example.com"
                    value={formData.recipient_email}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent min-h-[44px]"
                  />
                  <p className="text-xs text-slate-400">
                    We&apos;ll email them their credential link.
                  </p>
                </div>
              </div>

              {/* Card 2: What is it for? */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
                <h2 className="text-sm font-bold text-slate-800">What is it for?</h2>

                <div className="space-y-1.5">
                  <label htmlFor="single_course_title" className="block text-xs font-semibold text-slate-700">
                    Course or event title
                  </label>
                  <input
                    id="single_course_title"
                    name="course_title"
                    type="text"
                    placeholder="e.g. Advanced React Workshop"
                    value={formData.course_title}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent min-h-[44px]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="single_issue_date" className="block text-xs font-semibold text-slate-700">
                      Issue date
                    </label>
                    <input
                      id="single_issue_date"
                      name="issue_date"
                      type="text"
                      placeholder="YYYY-MM-DD or Oct 22, 2024"
                      value={formData.issue_date}
                      onChange={handleChange}
                      onBlur={(e) => {
                        const formatted = formatExcelDate(e.target.value);
                        if (formatted) {
                          setFormData((prev) => ({ ...prev, issue_date: formatted }));
                        }
                      }}
                      className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent min-h-[44px]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="single_issuer_name" className="block text-xs font-semibold text-slate-700">
                      Issued by
                    </label>
                    <input
                      id="single_issuer_name"
                      name="issuer_name"
                      type="text"
                      placeholder="e.g. Acme Inc"
                      value={formData.issuer_name}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent min-h-[44px]"
                    />
                  </div>
                </div>
              </div>

              {/* Card 3: Signature Row */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs">
                <div className="flex items-center justify-between gap-3">
                  <label
                    htmlFor="single_signature_check"
                    className="flex items-center gap-3 cursor-pointer select-none min-h-[44px]"
                  >
                    <input
                      id="single_signature_check"
                      type="checkbox"
                      checked={useUploadedSignature}
                      onChange={(e) => setUseUploadedSignature(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-2 focus:ring-slate-900 cursor-pointer"
                    />
                    <span className="text-sm font-semibold text-slate-800">
                      Add my saved signature
                    </span>
                  </label>
                  <div className="w-16 h-10 border border-slate-200 rounded-lg bg-slate-50 flex items-center justify-center p-1 overflow-hidden shrink-0">
                    {uploadedSignatureFullUrl ? (
                      <img
                        src={uploadedSignatureFullUrl}
                        alt="Signature thumbnail"
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <PenTool size={16} className="text-slate-400" />
                    )}
                  </div>
                </div>
                {!useUploadedSignature && (
                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
                    <label htmlFor="single_signature_text" className="block text-xs font-semibold text-slate-700">
                      Signature name or title (optional)
                    </label>
                    <input
                      id="single_signature_text"
                      name="signature"
                      type="text"
                      placeholder="e.g. Dr. John Smith"
                      value={formData.signature}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent min-h-[44px]"
                    />
                  </div>
                )}
              </div>

              {/* Card 4: Collapsed "More options" */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowMoreOptions(!showMoreOptions)}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors cursor-pointer min-h-[44px]"
                  aria-expanded={showMoreOptions}
                >
                  <span className="text-sm font-bold text-slate-800">More options</span>
                  <span className="text-slate-500 text-lg font-light">
                    {showMoreOptions ? "−" : "+"}
                  </span>
                </button>

                {showMoreOptions && (
                  <div className="p-4 pt-1 border-t border-slate-100 space-y-4">
                    {isReceipt && (
                      <div className="space-y-1.5">
                        <label htmlFor="receipt_amount" className="block text-xs font-semibold text-slate-700">
                          Amount (Total)
                        </label>
                        <input
                          id="receipt_amount"
                          type="text"
                          placeholder="e.g. $500.00"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                        />
                      </div>
                    )}

                    {/* Template Custom Placeholders */}
                    {templateCustomPlaceholders.length > 0 && (
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Template Custom Fields
                        </label>
                        {templateCustomPlaceholders.map(({ key, label }) => (
                          <div key={key} className="space-y-1">
                            <label htmlFor={`cf_${key}`} className="block text-[11px] font-semibold text-slate-600">
                              {label}
                            </label>
                            <input
                              id={`cf_${key}`}
                              type="text"
                              placeholder={`Enter ${label}...`}
                              value={formData.extra_fields?.[key] || ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                setFormData((prev) => ({
                                  ...prev,
                                  extra_fields: { ...(prev.extra_fields || {}), [key]: val },
                                }));
                              }}
                              className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Additional Custom Fields */}
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700">Custom Fields</span>
                        <button
                          type="button"
                          onClick={addCustomField}
                          className="text-xs font-semibold text-sky-600 hover:text-sky-800 cursor-pointer flex items-center gap-1"
                        >
                          <Plus size={13} /> Add field
                        </button>
                      </div>
                      {customFields.map((field, index) => (
                        <div key={index} className="flex gap-2 items-center">
                          <input
                            aria-label={`Custom field ${index + 1} label`}
                            placeholder="Label"
                            value={field.key}
                            onChange={(e) => handleCustomFieldChange(index, "key", e.target.value)}
                            className="w-1/3 px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg"
                          />
                          <input
                            aria-label={`Custom field ${index + 1} value`}
                            placeholder="Value"
                            value={field.value}
                            onChange={(e) => handleCustomFieldChange(index, "value", e.target.value)}
                            className="flex-1 px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeCustomField(index)}
                            className="text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                            aria-label="Remove field"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* ================= BULK IMPORT MODE ================= */
            <div className="space-y-4">
              {/* Card 1: Group Selector */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-2.5">
                <label htmlFor="bulk_group_select" className="block text-sm font-bold text-slate-800">
                  Group (keeps this batch together)
                </label>
                <div className="flex gap-2.5 items-center">
                  <select
                    id="bulk_group_select"
                    value={selectedGroupId}
                    onChange={(e) => setSelectedGroupId(e.target.value)}
                    disabled={isBulkGroupEditMode}
                    className="flex-1 px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent min-h-[44px] bg-white cursor-pointer"
                  >
                    <option value="">Select a group...</option>
                    {groups.map((g) => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                  {!isBulkGroupEditMode && (
                    <button
                      type="button"
                      onClick={() => setShowCreateGroupModal(true)}
                      className="px-4 py-2 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-xs transition-colors shrink-0 min-h-[44px] flex items-center gap-1.5 cursor-pointer"
                    >
                      + New group
                    </button>
                  )}
                </div>
              </div>

              {/* Card 2: Add your recipients */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <h2 className="text-sm font-bold text-slate-800">Add your recipients</h2>
                  
                  {/* Tabs */}
                  <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200/60">
                    <button
                      type="button"
                      onClick={() => setBulkActiveTab("upload")}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors min-h-[36px] cursor-pointer ${
                        bulkActiveTab === "upload"
                          ? "bg-white text-slate-900 shadow-2xs font-bold"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      Upload a file
                    </button>
                    <button
                      type="button"
                      onClick={() => setBulkActiveTab("paste")}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors min-h-[36px] cursor-pointer ${
                        bulkActiveTab === "paste"
                          ? "bg-white text-slate-900 shadow-2xs font-bold"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      Type or paste
                    </button>
                    <button
                      type="button"
                      onClick={() => setBulkActiveTab("database")}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors min-h-[36px] cursor-pointer ${
                        bulkActiveTab === "database"
                          ? "bg-white text-slate-900 shadow-2xs font-bold"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      From database
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleDownloadTemplate}
                    className="text-xs text-slate-500 hover:text-slate-900 underline cursor-pointer shrink-0"
                  >
                    Download sample file
                  </button>
                </div>

                {/* Tab 1: File Upload */}
                {bulkActiveTab === "upload" && (
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center bg-slate-50 hover:bg-slate-100/60 transition-colors relative cursor-pointer group">
                    <input
                      type="file"
                      aria-label="Upload spreadsheet"
                      accept=".csv, .xlsx, .xls, .ods"
                      onChange={handleBulkFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <UploadCloud className="mx-auto text-slate-400 group-hover:text-slate-600 mb-2" size={26} />
                    <span className="block text-xs font-bold text-slate-800">
                      {bulkFile ? bulkFile.name : "Choose spreadsheet"}
                    </span>
                    <span className="block text-[11px] text-slate-400 mt-1">
                      Drag &amp; drop or click to browse &amp; auto-map (.csv, .xlsx, .xls)
                    </span>
                  </div>
                )}

                {/* Tab 2: Type or Paste */}
                {bulkActiveTab === "paste" && (
                  <div className="space-y-2.5">
                    <label htmlFor="quick_paste_box" className="block text-xs font-semibold text-slate-700">
                      Paste table data (copied from Excel or Google Sheets):
                    </label>
                    <textarea
                      id="quick_paste_box"
                      rows={4}
                      placeholder="Jane Doe	jane@example.com	Web Development	Oct 22, 2024&#10;Liam Johnson	liam@example.com	Full Stack Dev	Jan 15, 2024"
                      value={quickPasteText}
                      onChange={(e) => setQuickPasteText(e.target.value)}
                      className="w-full p-3 font-mono text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={handleImportPastedText}
                        className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-black rounded-lg transition-colors cursor-pointer min-h-[44px]"
                      >
                        Import pasted rows
                      </button>
                    </div>
                  </div>
                )}

                {/* Tab 3: University Database */}
                {bulkActiveTab === "database" && (
                  <div className="p-3.5 bg-emerald-50/50 border border-emerald-200/80 rounded-xl space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                      <Database size={15} className="text-emerald-700" />
                      <span>Direct Database Connector (SIS Pull)</span>
                    </div>
                    <p className="text-[11px] text-emerald-800">
                      Query student records directly into this batch by student ID or department.
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowDbPullModal(true)}
                      className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
                    >
                      <Database size={14} />
                      <span>Query Database &amp; Pull Students</span>
                    </button>
                  </div>
                )}

                {/* Status Line */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                    <CheckCircle2 size={15} className="text-emerald-600" />
                    <span className="text-emerald-700 font-bold">{readyRowsCount} ready</span>
                    <span className="text-slate-300">·</span>
                    <span className={invalidRowsCount > 0 ? "text-amber-600 font-bold" : "text-slate-500"}>
                      {invalidRowsCount} need fixing
                    </span>
                    {(bulkFile?.name || sheetName) && (
                      <>
                        <span className="text-slate-300">·</span>
                        <span className="text-slate-500 truncate max-w-[200px]">
                          {bulkFile?.name || sheetName}
                        </span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleOpenSpreadsheet}
                      className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors min-h-[38px] cursor-pointer"
                    >
                      Open full editor
                    </button>
                    <button
                      type="button"
                      onClick={handleClearRecipients}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-red-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors min-h-[38px] cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {/* Inline 5-Row Table with Per-Row Status */}
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3 w-10 text-center">#</th>
                        <th className="py-2.5 px-3">Recipient</th>
                        <th className="py-2.5 px-3">Email</th>
                        <th className="py-2.5 px-3">Course</th>
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3 w-24 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(() => {
                        const rowsToDisplay =
                          activeNonEmptyRows.length > 0
                            ? activeNonEmptyRows.slice(0, 5)
                            : spreadsheetRows.slice(0, 5);

                        return rowsToDisplay.map((r, idx) => {
                          const isSelected = idx === previewRowIndex;
                          const emailCounts = new Map();
                          const valResult = validateRow(r, emailCounts);
                          const isRowValid = valResult.isValid;

                          return (
                            <tr
                              key={idx}
                              onClick={() => setPreviewRowIndex(idx)}
                              className={`cursor-pointer transition-colors ${
                                isSelected ? "bg-sky-50/70 border-l-4 border-l-sky-600" : "hover:bg-slate-50"
                              }`}
                            >
                              <td className="py-2 px-3 text-center text-slate-400 font-mono">
                                {idx + 1}
                              </td>
                              <td className="py-1 px-2">
                                <input
                                  type="text"
                                  aria-label={`Row ${idx + 1} recipient name`}
                                  value={r.recipient_name || ""}
                                  placeholder="Recipient name"
                                  onChange={(e) => handleInlineCellChange(idx, "recipient_name", e.target.value)}
                                  className="w-full px-2 py-1 bg-transparent hover:bg-white focus:bg-white rounded border border-transparent hover:border-slate-200 focus:border-slate-900 focus:outline-none"
                                />
                              </td>
                              <td className="py-1 px-2">
                                <input
                                  type="email"
                                  aria-label={`Row ${idx + 1} recipient email`}
                                  value={r.recipient_email || ""}
                                  placeholder="Email"
                                  onChange={(e) => handleInlineCellChange(idx, "recipient_email", e.target.value)}
                                  className="w-full px-2 py-1 bg-transparent hover:bg-white focus:bg-white rounded border border-transparent hover:border-slate-200 focus:border-slate-900 focus:outline-none"
                                />
                              </td>
                              <td className="py-1 px-2">
                                <input
                                  type="text"
                                  aria-label={`Row ${idx + 1} course title`}
                                  value={r.course_title || ""}
                                  placeholder="Course"
                                  onChange={(e) => handleInlineCellChange(idx, "course_title", e.target.value)}
                                  className="w-full px-2 py-1 bg-transparent hover:bg-white focus:bg-white rounded border border-transparent hover:border-slate-200 focus:border-slate-900 focus:outline-none"
                                />
                              </td>
                              <td className="py-1 px-2">
                                <input
                                  type="text"
                                  aria-label={`Row ${idx + 1} issue date`}
                                  value={r.issue_date || ""}
                                  placeholder="Date"
                                  onChange={(e) => handleInlineCellChange(idx, "issue_date", e.target.value)}
                                  onBlur={(e) => {
                                    const formatted = formatExcelDate(e.target.value);
                                    if (formatted) handleInlineCellChange(idx, "issue_date", formatted);
                                  }}
                                  className="w-full px-2 py-1 bg-transparent hover:bg-white focus:bg-white rounded border border-transparent hover:border-slate-200 focus:border-slate-900 focus:outline-none"
                                />
                              </td>
                              <td className="py-2 px-3 text-right">
                                {isRowValid ? (
                                  <span className="font-semibold text-emerald-600">Ready</span>
                                ) : (
                                  <span
                                    className="font-semibold text-amber-600"
                                    title={Object.values(valResult.cellErrors || {}).join(", ")}
                                  >
                                    Need fixing
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                </div>

                <p className="text-xs text-slate-400">
                  Showing {Math.min(5, nonEmptyRowsCount || 5)} of {nonEmptyRowsCount || 5} rows · click a cell to edit · Changes auto-save
                </p>
              </div>

              {/* Card 3: Fill in blanks for everyone (Batch Defaults) */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowBatchDefaults(!showBatchDefaults)}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors cursor-pointer min-h-[44px]"
                  aria-expanded={showBatchDefaults}
                >
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">
                      Fill in blanks for everyone
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Default course, issuer, date and signature. Only used where a row is empty.
                    </p>
                  </div>
                  <span className="text-slate-500 text-lg font-light shrink-0 ml-3">
                    {showBatchDefaults ? "−" : "+"}
                  </span>
                </button>

                {showBatchDefaults && (
                  <div className="p-4 pt-1 border-t border-slate-100 space-y-3">
                    <div className="space-y-1">
                      <label htmlFor="batch_default_course" className="block text-xs font-semibold text-slate-700">
                        Default course or event title
                      </label>
                      <input
                        id="batch_default_course"
                        type="text"
                        placeholder="e.g. Full Stack Web Development"
                        value={batchDefaults.course_title || ""}
                        onChange={(e) => setBatchDefaults((prev) => ({ ...prev, course_title: e.target.value }))}
                        className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                      />
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="batch_default_issuer" className="block text-xs font-semibold text-slate-700">
                        Default issuer name
                      </label>
                      <input
                        id="batch_default_issuer"
                        type="text"
                        placeholder="e.g. Acme Tech Academy"
                        value={batchDefaults.issuer_name || ""}
                        onChange={(e) => setBatchDefaults((prev) => ({ ...prev, issuer_name: e.target.value }))}
                        className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                      />
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="batch_default_date" className="block text-xs font-semibold text-slate-700">
                        Default issue date
                      </label>
                      <input
                        id="batch_default_date"
                        type="text"
                        placeholder="YYYY-MM-DD or Oct 22, 2024"
                        value={batchDefaults.issue_date || ""}
                        onChange={(e) => setBatchDefaults((prev) => ({ ...prev, issue_date: e.target.value }))}
                        onBlur={(e) => {
                          const formatted = formatExcelDate(e.target.value);
                          if (formatted) setBatchDefaults((prev) => ({ ...prev, issue_date: formatted }));
                        }}
                        className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                      />
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="batch_default_signature" className="block text-xs font-semibold text-slate-700">
                        Default signature text
                      </label>
                      <input
                        id="batch_default_signature"
                        type="text"
                        placeholder="e.g. Dr. John Smith"
                        value={batchDefaults.signature || ""}
                        onChange={(e) => setBatchDefaults((prev) => ({ ...prev, signature: e.target.value }))}
                        className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Card 4: Saved Drafts Row */}
              {savedSheets.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 truncate">
                    <FolderOpen size={15} className="text-slate-500 shrink-0" />
                    <span className="truncate">
                      Saved drafts ({savedSheets.length}) · {savedSheets[0]?.name || sheetName} · {savedSheets[0]?.rowCount || nonEmptyRowsCount} rows
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleResumeDraft(savedSheets[0])}
                    className="px-3.5 py-1.5 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors shrink-0 min-h-[38px] cursor-pointer"
                  >
                    Resume
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ================= RIGHT COLUMN: LIVE PREVIEW ================= */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs">
            {/* Header: Title + Edit layout + Expand */}
            <div className="flex items-center justify-between gap-3 mb-4">
              <h2 className="text-sm font-bold text-slate-800">
                {creationMode === "bulk"
                  ? `Preview of row ${previewRowIndex + 1}`
                  : "Live preview"}
              </h2>

              <div className="flex items-center gap-2">
                {creationMode === "single" && (
                  <button
                    type="button"
                    onClick={() => setShowCertStyleEditor(!showCertStyleEditor)}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer min-h-[38px]"
                  >
                    <SlidersHorizontal size={13} />
                    <span>Edit layout</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowFullscreen(true)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer min-h-[38px]"
                >
                  <Maximize2 size={13} />
                  <span>Expand</span>
                </button>
              </div>
            </div>

            {/* Preview Frame */}
            <div className="w-full bg-slate-100/70 rounded-xl border border-slate-200/80 p-4 sm:p-6 flex items-center justify-center min-h-[380px]">
              <div className="w-full max-w-xl shadow-md rounded-lg overflow-hidden bg-white border border-slate-200">
                <TemplateRenderer
                  template={selectedTemplate}
                  formData={creationMode === "bulk" ? currentPreviewRowData : formData}
                />
              </div>
            </div>

            {/* Subtitle Under Preview */}
            <p className="text-center text-xs text-slate-400 mt-3">
              {creationMode === "bulk"
                ? "Pick a row in the table to preview it"
                : "Updates as you type"}
            </p>

            {/* Merged "Edit layout" style editor panel when opened in Single Mode */}
            {creationMode === "single" && showCertStyleEditor && (
              <div className="mt-4 pt-4 border-t border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Layout &amp; Font Adjustments
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowCertStyleEditor(false)}
                    className="text-xs text-slate-400 hover:text-slate-600"
                  >
                    Close
                  </button>
                </div>

                {/* Auto-fit toggle */}
                <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer">
                  <span className="text-xs font-semibold text-slate-700">Auto-fit long names &amp; text</span>
                  <input
                    type="checkbox"
                    checked={certStyles.autoFit !== false}
                    onChange={(e) => handleToggleAutoFit(e.target.checked)}
                    className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 h-4 w-4 cursor-pointer"
                  />
                </label>

                {/* Field selector pills */}
                <div className="flex flex-wrap gap-1.5">
                  {customizableStyleFields.map((f) => (
                    <button
                      key={f.key}
                      type="button"
                      onClick={() => setActiveStyleField(f.key)}
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold border transition-all cursor-pointer ${
                        activeStyleField === f.key
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                {/* Controls for active field */}
                {(() => {
                  const activeFieldMeta =
                    customizableStyleFields.find((f) => f.key === activeStyleField) ||
                    customizableStyleFields[0];
                  const fKey = activeFieldMeta.key;
                  const activeOvr = certStyles.fields?.[fKey] || {};
                  const currentFontSize =
                    activeOvr.fontSize !== undefined && activeOvr.fontSize !== ""
                      ? Number(activeOvr.fontSize)
                      : "";

                  return (
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2.5">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                        <span>{activeFieldMeta.label} Font Size</span>
                        <span className="font-mono">{currentFontSize ? `${currentFontSize}px` : "Default"}</span>
                      </div>
                      <input
                        type="range"
                        min="12"
                        max="72"
                        value={currentFontSize || activeFieldMeta.defaultSize || 24}
                        onChange={(e) => handleFieldStyleChange(fKey, "fontSize", e.target.value)}
                        className="w-full accent-slate-900 cursor-pointer"
                      />
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleResetFieldStyle(fKey)}
                          className="text-[11px] font-semibold text-slate-500 hover:text-slate-800"
                        >
                          Reset to default
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* --- Sticky Bottom Bar (Full-Width Matching Wireframes) --- */}
      <aside aria-label="Issuance summary and actions" className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-slate-200 px-4 sm:px-8 py-3.5 shadow-lg">
        <div className="max-w-[1600px] mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Balance & Cost Info */}
          <div className="text-xs sm:text-sm font-semibold text-slate-800">
            {creationMode === "single" ? (
              <span>
                1 credential{" "}
                <span className="text-slate-400 font-normal">
                  · uses 1 credit · {userCredits.toLocaleString()} credits available
                </span>
              </span>
            ) : (
              <span>
                {readyRowsCount} credentials{" "}
                <span className="text-slate-400 font-normal">
                  · uses {readyRowsCount} credits · {userCredits.toLocaleString()} credits available
                </span>
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={creationMode === "single" ? handleSaveSingleDraft : () => handleSaveSheet(sheetName || "Untitled Sheet")}
              className="px-4 py-2.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-xs transition-colors cursor-pointer min-h-[44px]"
            >
              Save draft (free)
            </button>

            {creationMode === "single" ? (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting || !formData.recipient_name || !formData.template_id}
                className="px-5 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-black rounded-lg shadow-sm transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer min-h-[44px]"
              >
                {submitting && <Loader2 size={14} className="animate-spin" />}
                <span>{isEditMode ? "Update credential" : "Issue credential"}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleBulkSubmit}
                disabled={
                  bulkSubmitting ||
                  !formData.template_id ||
                  !selectedGroupId ||
                  readyRowsCount === 0 ||
                  invalidRowsCount > 0 ||
                  userCredits < readyRowsCount
                }
                className="px-5 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-black rounded-lg shadow-sm transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer min-h-[44px]"
              >
                {bulkSubmitting && <Loader2 size={14} className="animate-spin" />}
                <span>Issue {readyRowsCount} credentials</span>
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* --- Template Selector Modal --- */}
      {isTemplateModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="template_modal_title"
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setIsTemplateModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0">
              <div>
                <h3 id="template_modal_title" className="text-base font-bold text-slate-800">Choose a template</h3>
                <p className="text-xs text-slate-400 mt-0.5">Select a layout design for your credentials</p>
              </div>
              <button
                type="button"
                onClick={() => setIsTemplateModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Search */}
            <div className="px-6 py-3 border-b border-slate-100 bg-slate-50/50">
              <input
                type="text"
                placeholder="Search templates..."
                value={templateSearchQuery}
                onChange={(e) => setTemplateSearchQuery(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            {/* Template Grid */}
            <div className="p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {templates
                .filter((t) =>
                  templateSearchQuery
                    ? t.name?.toLowerCase().includes(templateSearchQuery.toLowerCase()) ||
                      t.layout_style?.toLowerCase().includes(templateSearchQuery.toLowerCase())
                    : true
                )
                .map((tmpl) => {
                  const isSelected = String(tmpl.id) === String(formData.template_id);
                  return (
                    <div
                      key={tmpl.id}
                      onClick={() => {
                        handleTemplateChange({ target: { value: tmpl.id } });
                        setIsTemplateModalOpen(false);
                      }}
                      className={`group border rounded-xl p-3 flex flex-col justify-between cursor-pointer transition-all hover:shadow-md ${
                        isSelected
                          ? "border-sky-600 bg-sky-50/30 ring-2 ring-sky-600"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <div className="aspect-[16/11] bg-slate-100 rounded-lg border border-slate-200/80 mb-3 overflow-hidden flex items-center justify-center">
                        {tmpl.thumbnail_url || tmpl.background_url ? (
                          <img
                            src={tmpl.thumbnail_url || tmpl.background_url}
                            alt=""
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <LayoutTemplate size={28} className="text-slate-300" />
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-800 truncate">{tmpl.name}</h4>
                          <span className="text-[10px] text-slate-400 capitalize">{tmpl.layout_style || "Certificate"}</span>
                        </div>
                        <button
                          type="button"
                          className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-colors ${
                            isSelected
                              ? "bg-sky-600 text-white"
                              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                          }`}
                        >
                          {isSelected ? "Selected" : "Select"}
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* --- New Group Modal --- */}
      {showCreateGroupModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="create_group_modal_title"
          className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4"
          onClick={() => setShowCreateGroupModal(false)}
        >
          <div
            className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-sm w-full p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <h3 id="create_group_modal_title" className="text-sm font-bold text-slate-800">Create new group</h3>
              <p className="text-xs text-slate-400 mt-0.5">Groups keep recipient batches organized</p>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="new_group_name_input" className="block text-xs font-semibold text-slate-700">
                Group name
              </label>
              <input
                id="new_group_name_input"
                type="text"
                placeholder="e.g. October 2024 Graduates"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCreateGroupModal(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async (e) => {
                  await handleCreateGroup(e);
                  setShowCreateGroupModal(false);
                }}
                className="px-4 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-black rounded-lg"
              >
                Create group
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Modal */}
      {showFullscreen && (
        <div
          className="fixed inset-0 bg-slate-950/90 flex items-center justify-center z-[9999] p-4"
          onClick={() => setShowFullscreen(false)}
        >
          <button
            onClick={() => setShowFullscreen(false)}
            className="absolute top-6 right-6 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-all"
          >
            <X size={24} />
          </button>

          <div
            className="w-full max-w-6xl max-h-[90vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <TemplateRenderer
              template={selectedTemplate}
              formData={formData}
              isFullscreen={true}
            />
          </div>
        </div>
      )}

      {/* Smart Column Mapping Modal */}
      <ColumnMappingModal
        isOpen={isMappingModalOpen}
        onClose={() => setIsMappingModalOpen(false)}
        headers={detectedHeaders}
        rawRows={rawUploadedRows}
        initialMapping={activeMapping}
        splitNames={splitNamesInfo}
        batchDefaults={batchDefaults}
        onConfirmMapping={handleConfirmMappingFromModal}
        onLiveMappingChange={handleLiveMappingUpdate}
        isProOrEnterprise={isProOrEnterprise}
        templateCustomFields={[...templateCustomPlaceholders, ...userCustomColumns]}
      />

      {/* Floating Action Button for In-Page Spreadsheet Editor (Offset from SupportWidget at bottom-6 right-6) */}
      {creationMode === "bulk" && (
        <div className="fixed bottom-6 right-20 sm:right-24 z-40">
          <button
            ref={launcherButtonRef}
            type="button"
            onClick={handleOpenSpreadsheet}
            className="flex items-center gap-2.5 px-3.5 sm:px-4 py-2.5 sm:py-3 bg-slate-900 hover:bg-black text-white rounded-full shadow-xl hover:scale-105 active:scale-95 transition-all text-xs font-bold border border-slate-700/80 group cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            title={
              isSpreadsheetOpen
                ? "Collapse Spreadsheet Editor"
                : "Open Spreadsheet Editor"
            }
            aria-label="Toggle Spreadsheet Editor"
            aria-expanded={isSpreadsheetOpen}
          >
            <div className="relative flex items-center justify-center">
              <FileSpreadsheet size={16} className="text-indigo-400 group-hover:text-indigo-300 transition-colors" />
              {nonEmptyRowsCount > 0 && (
                <span
                  className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${
                    invalidRowsCount > 0 ? "bg-amber-500 animate-pulse" : "bg-emerald-500 animate-pulse"
                  }`}
                />
              )}
            </div>
            <span className="hidden xs:inline">Spreadsheet</span>
            <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full text-[10px] font-mono border border-slate-700">
              {nonEmptyRowsCount === 0
                ? "0 rows"
                : invalidRowsCount > 0
                ? `${readyRowsCount}/${nonEmptyRowsCount} ready`
                : `${readyRowsCount} ready`}
            </span>
          </button>
        </div>
      )}

      {/* Docked In-Page Spreadsheet Widget Panel (Floating, non-modal, interactive background) */}
      {isSpreadsheetOpen && isSpreadsheetAllowed && (
        <div
          ref={panelRef}
          tabIndex={-1}
          onKeyDown={handlePanelKeyDown}
          aria-label="In-Page Spreadsheet Editor Panel"
          role="region"
          className={`fixed z-40 bg-white dark:bg-[#18181b] rounded-2xl shadow-2xl border border-slate-200/90 dark:border-[#2b2b31] flex flex-col overflow-hidden transition-all duration-300 ease-in-out pointer-events-auto ${
            /* Mobile styles (screens < 640px): bottom sheet */
            isSpreadsheetExpanded
              ? "inset-x-2 bottom-2 h-[92vh] max-h-[92vh] sm:inset-x-auto sm:bottom-20 sm:right-6 md:right-20 sm:w-[calc(100vw-48px)] md:w-[94vw] sm:max-w-[1260px] sm:h-[calc(100vh-100px)] sm:max-h-[840px]"
              : "inset-x-2 bottom-2 h-[60vh] max-h-[480px] sm:inset-x-auto sm:bottom-20 sm:right-6 md:right-20 sm:w-[460px] sm:max-w-[calc(100vw-32px)] sm:h-[580px] sm:max-h-[calc(100vh-100px)]"
          }`}
        >
          {/* Panel Header */}
          <div className="px-4 py-3 border-b border-slate-200 dark:border-[#28282d] bg-white dark:bg-[#18181b] flex items-center justify-between gap-2 shrink-0 select-none">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-200/80 flex items-center justify-center text-indigo-650 shrink-0">
                <Table size={15} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-0 truncate">
                    {isBulkGroupEditMode
                      ? `Bulk Edit: ${editingGroupInfo?.name || "Group"}`
                      : "Spreadsheet Editor"}
                  </h3>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${
                      nonEmptyRowsCount === 0
                        ? "text-slate-500 bg-slate-100 border-slate-200"
                        : invalidRowsCount > 0
                        ? "text-amber-700 bg-amber-50 border-amber-200 flex items-center gap-1"
                        : "text-emerald-700 bg-emerald-50 border-emerald-200"
                    }`}
                  >
                    {nonEmptyRowsCount === 0 ? (
                      "0 rows"
                    ) : invalidRowsCount > 0 ? (
                      <>
                        <AlertTriangle size={10} className="text-amber-600" />
                        <span>
                          {readyRowsCount} ready, {invalidRowsCount} need attention
                        </span>
                      </>
                    ) : (
                      `${readyRowsCount} ready`
                    )}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mb-0 truncate hidden sm:block">
                  {isBulkGroupEditMode
                    ? "Edit group rows below, then click Save Changes or Save & Resend"
                    : "Type cells or paste from Excel (Ctrl+V) • Save as Draft anytime"}
                </p>
              </div>
            </div>

            {/* Header Controls: Re-map, Expand/Compact, Minimize, Close */}
            <div className="flex items-center gap-1 shrink-0">
              {detectedHeaders.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsMappingModalOpen(true)}
                  className="px-2 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-[11px] font-semibold flex items-center gap-1 transition-all shadow-2xs"
                  title="Review Column Mapping"
                >
                  <Columns3 size={12} />
                  <span className="hidden md:inline">Mapping</span>
                </button>
              )}

              {/* Expand / Compact Toggle */}
              <button
                type="button"
                onClick={() => setIsSpreadsheetExpanded((prev) => !prev)}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-all cursor-pointer"
                title={isSpreadsheetExpanded ? "Compact View" : "Expand Panel"}
                aria-label={isSpreadsheetExpanded ? "Compact View" : "Expand Panel"}
              >
                {isSpreadsheetExpanded ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
              </button>

              {/* Minimize Control */}
              <button
                type="button"
                onClick={handleClosePanel}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-all cursor-pointer"
                title="Minimize to floating pill"
                aria-label="Minimize spreadsheet panel"
              >
                <Minus size={13} />
              </button>

              {/* Close Control */}
              <button
                type="button"
                onClick={handleClosePanel}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
                title="Close spreadsheet panel"
                aria-label="Close spreadsheet panel"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Panel Body: Scrollable Spreadsheet Grid */}
          <div className="flex-1 p-3 sm:p-4 overflow-auto bg-slate-50/50 dark:bg-[#121214]">
            <SpreadsheetGrid
              rows={spreadsheetRows}
              onChangeRows={setSpreadsheetRows}
              userQuota={userCredits}
              batchDefaults={batchDefaults}
              onChangeBatchDefaults={setBatchDefaults}
              onOpenMappingModal={() => setIsMappingModalOpen(true)}
              templateCustomFields={templateCustomPlaceholders}
              userCustomColumns={userCustomColumns}
              onChangeUserCustomColumns={setUserCustomColumns}
              sheetName={sheetName}
              onChangeSheetName={setSheetName}
              savedSheets={savedSheets}
              onSaveSheet={handleSaveSheet}
              onLoadSavedSheet={handleLoadSavedSheet}
              onDeleteSavedSheet={handleDeleteSavedSheet}
              onNewSheet={handleNewSheet}
              lastAutoSavedAt={lastAutoSavedAt}
              isProOrEnterprise={isProOrEnterprise}
            />
          </div>

          {/* Panel Footer: Summary, Save Draft / Bulk Update & Done */}
          <div className="px-4 py-2.5 border-t border-slate-200 dark:border-[#28282d] bg-white dark:bg-[#18181b] flex flex-wrap items-center justify-between gap-2 shrink-0">
            <div className="text-[11px] text-slate-500 truncate flex items-center gap-1.5">
              {invalidRowsCount > 0 ? (
                <span className="text-amber-600 font-medium flex items-center gap-1">
                  <AlertTriangle size={12} />
                  <span>Fix {invalidRowsCount} highlighted rows before saving</span>
                </span>
              ) : !isBulkGroupEditMode && userCredits < readyRowsCount ? (
                <span className="text-amber-700 font-medium">
                  Needs {readyRowsCount} credits to issue (you can still Save Draft for free)
                </span>
              ) : (
                <span className="text-slate-400 flex items-center gap-1">
                  <Info size={12} />
                  <span>Changes auto-sync with the Live Preview</span>
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {isBulkGroupEditMode ? (
                <>
                  <button
                    type="button"
                    disabled={
                      bulkSubmitting ||
                      !formData.template_id ||
                      readyRowsCount === 0 ||
                      invalidRowsCount > 0
                    }
                    onClick={() => handleBulkGroupUpdate(false)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all shadow-xs flex items-center gap-1 disabled:opacity-50 cursor-pointer"
                  >
                    <Save size={12} />
                    <span>Save Changes</span>
                  </button>
                  <button
                    type="button"
                    disabled={
                      bulkSubmitting ||
                      !formData.template_id ||
                      readyRowsCount === 0 ||
                      invalidRowsCount > 0
                    }
                    onClick={() => handleBulkGroupUpdate(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all shadow-xs flex items-center gap-1 disabled:opacity-50 cursor-pointer"
                  >
                    <Send size={12} />
                    <span>Save &amp; Resend</span>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSaveSheet(sheetName)}
                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                  title="Save spreadsheet as a draft without creating certificates yet"
                >
                  <Save size={12} />
                  <span>Save Draft</span>
                </button>
              )}
              <button
                type="button"
                onClick={handleClosePanel}
                className="bg-slate-900 hover:bg-black text-white text-xs font-bold px-3.5 py-1.5 rounded-lg transition-all shadow-xs cursor-pointer shrink-0"
              >
                Done &amp; Minimize
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Conflict Confirmation Modal */}
      {importConflictModal.isOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 max-w-md w-full animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                <FileSpreadsheet size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800 mb-0">Replace or Append Data?</h3>
                <p className="text-xs text-slate-500 mb-0">
                  You already have {importConflictModal.existingCount} data {importConflictModal.existingCount === 1 ? "row" : "rows"} in the editor.
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-600 mb-5 leading-relaxed">
              How would you like to handle the incoming data from <strong>{importConflictModal.fileName}</strong>?
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-end">
              <button
                type="button"
                onClick={() => setImportConflictModal({ isOpen: false, matrix: null, fileName: "", existingCount: 0 })}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors order-3 sm:order-1"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const { matrix, fileName } = importConflictModal;
                  setImportConflictModal({ isOpen: false, matrix: null, fileName: "", existingCount: 0 });
                  proceedWithImport(matrix, fileName, "append");
                }}
                className="px-3.5 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors order-2"
              >
                Append to Existing
              </button>
              <button
                type="button"
                onClick={() => {
                  const { matrix, fileName } = importConflictModal;
                  setImportConflictModal({ isOpen: false, matrix: null, fileName: "", existingCount: 0 });
                  proceedWithImport(matrix, fileName, "replace");
                }}
                className="px-3.5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-black rounded-lg transition-colors shadow-sm order-1 sm:order-3"
              >
                Replace All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* University Database Pull by Student ID Modal */}
      {showDbPullModal && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150"
          onClick={() => setShowDbPullModal(false)}
        >
          <div
            className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Database size={18} className="text-emerald-400" />
                <div>
                  <h3 className="text-xs font-bold mb-0 text-white">
                    Pull Student Records from University Database
                  </h3>
                  <p className="text-[10px] text-slate-400 mb-0">
                    Query by Student IDs or Department to auto-populate the spreadsheet
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDbPullModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handlePullFromUniversityDb} className="p-5 space-y-3.5">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    Student IDs (Comma or newline separated — leave blank to pull by Faculty/All)
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setDbStudentIdsInput("20220001, 20220002, 20220003, 20220004, 20220005")
                    }
                    className="text-[10px] font-bold text-indigo-600 hover:underline cursor-pointer"
                  >
                    Insert Sample IDs
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={dbStudentIdsInput}
                  onChange={(e) => setDbStudentIdsInput(e.target.value)}
                  placeholder="e.g. 20220001, 20220002, 20220003..."
                  className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Filter by Faculty (Optional)
                  </label>
                  <select
                    value={dbFacultyFilter}
                    onChange={(e) => setDbFacultyFilter(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">All Faculties</option>
                    <option value="Computing Studies">Computing Studies</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Management Sciences">Management Sciences</option>
                    <option value="College of Health Sciences">College of Health Sciences</option>
                    <option value="Arts & Social Sciences">Arts &amp; Social Sciences</option>
                    <option value="Law">Law</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Department Filter (Optional)
                  </label>
                  <input
                    type="text"
                    value={dbDepartmentFilter}
                    onChange={(e) => setDbDepartmentFilter(e.target.value)}
                    placeholder="e.g. Software Engineering"
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 text-[11px] text-slate-600">
                Pulls <strong>student_id</strong>, <strong>recipient_name</strong>, <strong>recipient_email</strong>,{" "}
                <strong>course_title</strong>, <strong>department</strong>, <strong>cgpa</strong>, and{" "}
                <strong>degree_class</strong> directly into the Spreadsheet Editor.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDbPullModal(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={pullingFromDb}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  {pullingFromDb ? <Loader2 size={13} className="animate-spin" /> : <Database size={13} />}
                  <span>{pullingFromDb ? "Querying Database..." : "Pull Records into Spreadsheet"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Spreadsheet Editor Growth Upgrade Modal */}
      <BulkLockedState
        isOpen={isSpreadsheetUpgradeModalOpen}
        onClose={() => setIsSpreadsheetUpgradeModalOpen(false)}
      />
    </div>
  );
};

export default CreateCertificatePage;
