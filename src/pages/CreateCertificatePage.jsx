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
} from "lucide-react";
import { Spinner } from "react-bootstrap";
import toast, { Toaster } from "react-hot-toast";
import { useUser } from "../context/UserContext";
import TemplateSelector from "../components/TemplateSelector";
import HelpGuide from "../components/HelpGuide";
import SpreadsheetGrid from "../components/bulk/SpreadsheetGrid";
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

  // In-Page Spreadsheet Rows (Starts strictly EMPTY with zero rows)
  const [spreadsheetRows, setSpreadsheetRows] = useState([]);

  // Batch Defaults applied across the whole batch
  const [batchDefaults, setBatchDefaults] = useState({
    issuer_name: "",
    issue_date: new Date().toLocaleDateString("en-CA"),
    signature: "",
  });

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
  
  const { user, workspace } = useUser();
  const effectiveRole = user?.effective_role || user?.role || "free";
  const isBulkAllowed = true; // Bulk issuance is available on all plans (including Free)
  const isSpreadsheetAllowed = ["growth", "pro", "enterprise"].includes(effectiveRole);
  const isProOrEnterprise = ["pro", "enterprise"].includes(effectiveRole);
  const isPro = isProOrEnterprise;

  const [isSpreadsheetUpgradeModalOpen, setIsSpreadsheetUpgradeModalOpen] = useState(false);

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
    if (location.pathname.includes("bulk-create") || location.search.includes("mode=bulk")) {
      setCreationMode("bulk");
    } else {
      setCreationMode("single");
    }
  }, [location]);

  // Initial Data fetch (Templates and Groups)
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
          setFormData({
            template_id: certResponse.data.template.id,
            recipient_name: cert.recipient_name,
            recipient_email: cert.recipient_email,
            course_title: cert.course_title,
            issuer_name: cert.issuer_name,
            issue_date: new Date(cert.issue_date).toLocaleDateString("en-CA"),
            signature: cert.signature,
            extra_fields: cert.extra_fields || {},
          });
          setSelectedTemplate(certResponse.data.template);

          if (cert.extra_fields?.amount) setAmount(cert.extra_fields.amount);

          const fields = Object.entries(cert.extra_fields || {})
            .filter(([key]) => key !== "amount")
            .map(([key, value]) => ({ key, value }));
          setCustomFields(fields);
        }
      } catch (err) {
        setError("Could not fetch data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [certId, isEditMode]);

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

  // Sync custom fields & amount
  useEffect(() => {
    const extras = { ...(formData.extra_fields || {}) };
    if (amount) extras.amount = amount;

    customFields.forEach((field) => {
      if (field.key.trim()) {
        extras[field.key.trim()] = field.value;
      }
    });

    setFormData((prev) => ({ ...prev, extra_fields: extras }));
  }, [amount, customFields]);

  // Single Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const promise = isEditMode
      ? updateCertificate(certId, formData)
      : createCertificate(formData);

    toast.promise(promise, {
      loading: isEditMode ? "Updating..." : "Issuing...",
      success: (response) => {
        setTimeout(() => navigate("/dashboard"), 1500);
        return response.data.msg;
      },
      error: (err) => {
        setSubmitting(false);
        return err.response?.data?.msg || "An error occurred.";
      },
    });
  };

  // Single Source of Truth for Spreadsheet Row Validation & Counts
  const {
    nonEmptyRows,
    readyRows,
    invalidRows,
    readyRowsCount,
    invalidRowsCount,
    nonEmptyRowsCount,
  } = useMemo(() => {
    const customKeys = templateCustomPlaceholders.map((cf) => cf.key);
    const nonEmpty = [];
    const ready = [];
    const invalid = [];

    const emailCounts = new Map();
    spreadsheetRows.forEach((r) => {
      if (isRowNonEmpty(r, customKeys)) {
        const email = String(r.recipient_email || "").trim().toLowerCase();
        if (email && looksLikeEmail(email)) {
          emailCounts.set(email, (emailCounts.get(email) || 0) + 1);
        }
      }
    });

    spreadsheetRows.forEach((r, idx) => {
      if (isRowNonEmpty(r, customKeys)) {
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
  }, [spreadsheetRows, templateCustomPlaceholders]);

  // Apply Mappings to convert raw 2D sheet rows into standardized ProofDeck row objects
  const applyMappingsToRows = useCallback(
    (headers, rows, mapping, splitNames, currentDefaults) => {
      const customKeys = templateCustomPlaceholders.map((cf) => cf.key);
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

          // 2. Core Fields
          ["recipient_email", "course_title", "issuer_name", "issue_date", "signature"].forEach((key) => {
            const srcCol = mapping[key]?.sourceColumn;
            if (srcCol) {
              const idx = headers.indexOf(srcCol);
              if (idx !== -1 && r[idx] !== undefined) {
                const val = String(r[idx]).trim();
                if (val) rowObj[key] = val;
              }
            } else if (currentDefaults[key]) {
              rowObj[key] = currentDefaults[key];
            }
          });

          // 3. Custom Template Placeholders
          templateCustomPlaceholders.forEach((cf) => {
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
        .filter((rowObj) => isRowNonEmpty(rowObj, customKeys));
    },
    [templateCustomPlaceholders]
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
            const customKeys = templateCustomPlaceholders.map((cf) => cf.key);
            const existingNonEmpty = prev.filter((r) => isRowNonEmpty(r, customKeys));
            return [...existingNonEmpty, ...converted];
          }
          return converted;
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
    [applyMappingsToRows, batchDefaults, templateCustomPlaceholders]
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
        setSpreadsheetRows(converted);

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
      const firstRow = spreadsheetRows[0];
      setFormData((prev) => ({
        ...prev,
        recipient_name: firstRow.recipient_name || "Recipient Name",
        recipient_email: firstRow.recipient_email || "",
        course_title: firstRow.course_title || prev.course_title || "Course Title",
        issuer_name: firstRow.issuer_name || batchDefaults.issuer_name || prev.issuer_name || "",
        issue_date: firstRow.issue_date || batchDefaults.issue_date || prev.issue_date,
        signature: firstRow.signature || batchDefaults.signature || prev.signature || "",
      }));
    }
  }, [spreadsheetRows, creationMode, batchDefaults]);

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

  // Bulk Form submission (Uses canonical readyRows and credit check)
  const handleBulkSubmit = async (e) => {
    e.preventDefault();
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
      // Build clean CSV array from canonical readyRows with batch defaults applied
      const cleanRowsToSubmit = readyRows.map(({ row: r }) => ({
        recipient_name: String(r.recipient_name).trim(),
        recipient_email: String(r.recipient_email).trim().toLowerCase(),
        course_title: String(r.course_title).trim(),
        issuer_name: (r.issuer_name || batchDefaults.issuer_name || "").trim(),
        issue_date: (r.issue_date || batchDefaults.issue_date || new Date().toLocaleDateString("en-CA")).trim(),
        signature: (r.signature || batchDefaults.signature || "").trim(),
      }));

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

  const isReceipt = selectedTemplate?.layout_style === "receipt";
  const isInvitation = selectedTemplate?.layout_style === "invitation";

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
    <div className="w-full pb-12">
      <Toaster position="top-right" />

      {/* --- 1. Top Navigation Bar (Header - Locked to Top) --- */}
      <div className="border-b border-slate-200/80 bg-white mb-4 sm:mb-6 -mt-6 px-4 py-3 rounded-b-lg">
        <div className="flex items-center justify-between gap-3 max-w-[1600px] mx-auto">
          {/* Left: Page Title */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <Link
              to="/dashboard"
              className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 transition-colors shrink-0"
              aria-label="Back to dashboard"
            >
              <ArrowLeft size={16} />
            </Link>
            <div>
              <h1 className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wider mb-0 truncate">
                {isEditMode ? "Edit Credential" : "Issue Credentials"}
              </h1>
            </div>
          </div>
          
          <HelpGuide type="certificates" />
        </div>
      </div>

      {/* --- 2. Main Content (Bento Grid) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: FORM DETAILS (col-span-4) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            
            {/* Segmented Mode Selector Pills */}
            {!isEditMode && (
              <div className="bg-slate-100/80 p-1 rounded-xl flex gap-1 mb-5 border border-slate-200/40">
                <button
                  type="button"
                  onClick={() => setCreationMode("single")}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-xs font-bold rounded-lg transition-all decoration-none ${
                    creationMode === "single"
                      ? "bg-white text-slate-900 shadow-sm border border-slate-200/30"
                      : "text-slate-500 hover:text-slate-850"
                  }`}
                >
                  <User size={13} className="shrink-0" />
                  <span>Single</span>
                  <span className="hidden xs:inline">Recipient</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCreationMode("bulk")}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-xs font-bold rounded-lg transition-all decoration-none ${
                    creationMode === "bulk"
                      ? "bg-white text-slate-900 shadow-sm border border-slate-200/30"
                      : "text-slate-500 hover:text-slate-850"
                  }`}
                >
                  <Users size={13} className="shrink-0" />
                  <span>Bulk</span>
                  <span className="hidden xs:inline">Import</span>
                </button>
              </div>
            )}

            {/* Render Form based on Active Mode */}
            {creationMode === "single" ? (
              <form onSubmit={handleSubmit} className="space-y-3.5">
                <TemplateSelector
                  value={formData.template_id}
                  onChange={(val) => handleTemplateChange({ target: { value: val } })}
                  options={templates}
                />

                <div className="border-t border-slate-100 my-3.5"></div>

                <FormInput
                  name="recipient_name"
                  label={isInvitation ? "Guest Name" : isReceipt ? "Payer Name" : "Recipient Name"}
                  icon={User}
                  placeholder="e.g., Jane Doe"
                  required
                  value={formData.recipient_name}
                  onChange={handleChange}
                />

                <FormInput
                  name="recipient_email"
                  label="Email (Optional)"
                  icon={Type}
                  type="email"
                  placeholder="jane@example.com"
                  value={formData.recipient_email}
                  onChange={handleChange}
                />

                <FormInput
                  name="course_title"
                  label={isInvitation ? "Event Title" : isReceipt ? "Payment Description" : "Course / Event Title"}
                  icon={FileText}
                  placeholder={isInvitation ? "e.g. Annual Gala" : isReceipt ? "e.g. Web Dev Course" : "e.g., Advanced React Workshop"}
                  required
                  value={formData.course_title}
                  onChange={handleChange}
                />

                {isReceipt && (
                  <FormInput
                    name="amount"
                    label="Amount (Total)"
                    icon={DollarSign}
                    placeholder="e.g. $500.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                )}

                <div className="grid grid-cols-2 gap-3">
                  <FormInput
                    name="issue_date"
                    label={isInvitation ? "Event Date" : isReceipt ? "Payment Date" : "Issue Date"}
                    icon={Calendar}
                    type="date"
                    required
                    value={formData.issue_date}
                    onChange={handleChange}
                  />
                  <FormInput
                    name="issuer_name"
                    label="Issuer Name"
                    icon={User}
                    placeholder="e.g. Acme Inc"
                    value={formData.issuer_name}
                    onChange={handleChange}
                  />
                </div>

                <FormInput
                  name="signature"
                  label="Signature Text (Optional)"
                  icon={PenTool}
                  placeholder="e.g., Dr. John Smith"
                  value={formData.signature}
                  onChange={handleChange}
                />

                {/* TEMPLATE CUSTOM PLACEHOLDERS (Auto-mapped) */}
                {templateCustomPlaceholders.length > 0 && (
                  <div className="pt-3.5 border-t border-slate-100">
                    <div className="flex items-center gap-1.5 mb-2.5">
                      <SlidersHorizontal size={13} className="text-indigo-600" />
                      <label className="block text-xs font-bold text-slate-800">
                        Template Custom Fields
                      </label>
                    </div>
                    <div className="space-y-2 bg-indigo-50/40 p-2.5 rounded-xl border border-indigo-100/70">
                      {templateCustomPlaceholders.map(({ key, label }) => (
                        <div key={key}>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center justify-between">
                            <span>{label}</span>
                            <span className="text-[9px] font-mono text-indigo-500 font-normal">{`{{${key}}}`}</span>
                          </label>
                          <input
                            type="text"
                            placeholder={`Enter ${label}...`}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs focus:outline-none focus:border-indigo-500 shadow-xs"
                            value={formData.extra_fields?.[key] || ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              setFormData((prev) => ({
                                ...prev,
                                extra_fields: {
                                  ...(prev.extra_fields || {}),
                                  [key]: val,
                                },
                              }));
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* DYNAMIC FIELDS SECTION */}
                <div className="pt-3.5 border-t border-slate-100">
                  <div className="flex justify-between items-center mb-2.5">
                    <label className="block text-xs font-semibold text-slate-700">
                      Additional Fields
                    </label>
                    <button
                      type="button"
                      onClick={addCustomField}
                      className="text-[11px] flex items-center gap-0.5 text-indigo-650 font-bold hover:text-indigo-850"
                    >
                      <Plus size={12} /> Add Field
                    </button>
                  </div>

                  {customFields.length > 0 ? (
                    <div className="space-y-2">
                      {customFields.map((field, index) => (
                        <div key={index} className="flex gap-2 items-center">
                          <input
                            placeholder="Label"
                            className="w-1/3 px-2 py-1 bg-white border border-slate-200 rounded text-xs focus:outline-none focus:border-indigo-500 shadow-sm"
                            value={field.key}
                            onChange={(e) =>
                              handleCustomFieldChange(index, "key", e.target.value)
                            }
                          />
                          <input
                            placeholder="Value"
                            className="flex-1 px-2 py-1 bg-white border border-slate-200 rounded text-xs focus:outline-none focus:border-indigo-500 shadow-sm"
                            value={field.value}
                            onChange={(e) =>
                              handleCustomFieldChange(index, "value", e.target.value)
                            }
                          />
                          <button
                            type="button"
                            onClick={() => removeCustomField(index)}
                            className="text-slate-400 hover:text-red-650 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-400 italic">
                      No custom fields added.
                    </p>
                  )}
                </div>

                {error && (
                  <div className="bg-red-50 text-red-650 p-2 rounded text-xs flex items-start gap-1.5 border border-red-100">
                    <Info size={14} className="mt-0.5 flex-shrink-0" />
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-slate-900 border border-slate-900 hover:bg-black text-white text-xs font-bold py-2 px-4 rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5 disabled:opacity-75 disabled:cursor-not-allowed mt-3.5"
                >
                  {submitting ? (
                    <Loader2 className="animate-spin" size={14} />
                  ) : (
                    <Save size={14} />
                  )}
                  <span>{isEditMode ? "Update Document" : "Generate Document"}</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleBulkSubmit} className="space-y-4">
                <TemplateSelector
                  value={formData.template_id}
                  onChange={(val) => handleTemplateChange({ target: { value: val } })}
                  options={templates}
                />

                <div className="border-t border-slate-100 my-3.5"></div>

                {/* Group Selector */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">Select Group Folder *</label>
                  <select
                    value={selectedGroupId}
                    onChange={(e) => setSelectedGroupId(e.target.value)}
                    className="block w-full rounded border border-slate-200 bg-white py-1.5 px-2.5 text-slate-850 focus:border-indigo-500 focus:outline-none transition-all duration-200 text-xs shadow-sm"
                    required
                  >
                    <option value="">-- Choose Folder --</option>
                    {groups.map((g) => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </div>

                {/* Quick group creation inline */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60 space-y-2">
                  <label className="block text-[9px] font-bold text-slate-405 uppercase tracking-wider">Or Create Folder</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Python Cohort A"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      className="flex-1 px-2.5 py-1.5 border border-slate-200 bg-white rounded-lg text-xs focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={handleCreateGroup}
                      className="bg-slate-900 hover:bg-black text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
                    >
                      Create
                    </button>
                  </div>
                </div>

                {/* File Upload Box */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="block text-xs font-semibold text-slate-700">Import Spreadsheet File</label>
                    {detectedHeaders.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setIsMappingModalOpen(true)}
                        className="text-[10px] text-indigo-650 hover:underline font-bold flex items-center gap-1"
                      >
                        <Columns3 size={11} /> Re-map Columns
                      </button>
                    )}
                  </div>
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-5 text-center bg-slate-50 hover:bg-slate-100/50 hover:border-slate-350 transition-all relative cursor-pointer">
                    <input
                      type="file"
                      accept=".csv, .xlsx, .xls, .ods"
                      onChange={handleBulkFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <UploadCloud className="mx-auto text-slate-400 mb-2" size={24} />
                    <span className="block text-xs font-bold text-slate-800">
                      {bulkFile ? bulkFile.name : "Choose CSV or Excel File"}
                    </span>
                    <span className="block text-[9px] text-slate-400 mt-1">
                      Drag & drop or click to browse & auto-map
                    </span>
                  </div>
                </div>

                {/* In-Page Spreadsheet Shortcut Button in Form */}
                <button
                  type="button"
                  onClick={handleOpenSpreadsheet}
                  className="w-full py-2.5 px-3 rounded-xl border border-indigo-200/80 bg-gradient-to-r from-indigo-50/70 to-slate-50 hover:from-indigo-100/80 hover:to-slate-100 text-slate-800 transition-all flex items-center justify-between shadow-2xs group"
                >
                  <div className="flex items-center gap-2">
                    <Table size={16} className="text-indigo-600 group-hover:scale-110 transition-transform" />
                    <div className="text-left">
                      <span className="block text-xs font-bold text-slate-800">In-Page Spreadsheet</span>
                      <span className="block text-[10px] text-slate-400">
                        Type or paste directly from Excel/Sheets
                      </span>
                    </div>
                  </div>
                  {isSpreadsheetAllowed ? (
                    <span className="text-[10px] font-mono font-semibold bg-white text-indigo-700 px-2.5 py-1 rounded-full border border-indigo-200 shadow-2xs">
                      {nonEmptyRowsCount === 0 ? "0 rows" : `${readyRowsCount} ready`} &rarr;
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold bg-amber-50 text-amber-800 px-2.5 py-1 rounded-full border border-amber-200 shadow-2xs flex items-center gap-1">
                      <Lock size={10} className="text-amber-600" />
                      <span>Growth</span>
                    </span>
                  )}
                </button>

                <div className="flex justify-between items-center text-[10px]">
                  <button
                    type="button"
                    onClick={handleDownloadTemplate}
                    className="text-indigo-650 font-bold hover:underline flex items-center gap-1"
                  >
                    <Download size={12} /> Download Sample Spreadsheet
                  </button>
                </div>

                {/* Batch Defaults */}
                <div className="pt-3 border-t border-slate-150 space-y-2">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Batch Defaults (Optional)
                  </label>
                  <p className="text-[10px] text-slate-400 mb-2">
                    Applied automatically to all rows that have empty cells
                  </p>
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Batch Issuer Name (e.g. Acme Inc)"
                      value={batchDefaults.issuer_name || ""}
                      onChange={(e) =>
                        setBatchDefaults((prev) => ({ ...prev, issuer_name: e.target.value }))
                      }
                      className="w-full px-2.5 py-1.5 border border-slate-200 bg-white rounded-lg text-xs focus:outline-none focus:border-indigo-500 shadow-2xs"
                    />
                    <input
                      type="date"
                      value={batchDefaults.issue_date || ""}
                      onChange={(e) =>
                        setBatchDefaults((prev) => ({ ...prev, issue_date: e.target.value }))
                      }
                      className="w-full px-2.5 py-1.5 border border-slate-200 bg-white rounded-lg text-xs focus:outline-none focus:border-indigo-500 shadow-2xs"
                    />
                    <input
                      type="text"
                      placeholder="Batch Signatory (e.g. Dr. John Smith)"
                      value={batchDefaults.signature || ""}
                      onChange={(e) =>
                        setBatchDefaults((prev) => ({ ...prev, signature: e.target.value }))
                      }
                      className="w-full px-2.5 py-1.5 border border-slate-200 bg-white rounded-lg text-xs focus:outline-none focus:border-indigo-500 shadow-2xs"
                    />
                  </div>
                </div>

                {/* Submit button with credit check */}
                <button
                  type="submit"
                  disabled={
                    bulkSubmitting ||
                    !formData.template_id ||
                    !selectedGroupId ||
                    readyRowsCount === 0 ||
                    invalidRowsCount > 0 ||
                    userCredits < readyRowsCount
                  }
                  className="w-full bg-slate-900 border border-slate-900 hover:bg-black text-white text-xs font-bold py-2.5 px-4 rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed mt-3"
                >
                  {bulkSubmitting ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                  <span>
                    Generate Bulk Documents ({readyRowsCount} {readyRowsCount === 1 ? "document" : "documents"})
                  </span>
                </button>

                {userCredits < readyRowsCount && readyRowsCount > 0 && (
                  <p className="text-[10px] text-red-600 text-center font-semibold mt-1">
                    You need {readyRowsCount} credits but have {userCredits}. Please purchase more credits.
                  </p>
                )}
                {invalidRowsCount > 0 && (
                  <p className="text-[10px] text-amber-600 text-center font-semibold mt-1">
                    {invalidRowsCount} {invalidRowsCount === 1 ? "row needs" : "rows need"} attention in the spreadsheet before issuing.
                  </p>
                )}
              </form>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: WYSIWYG LIVE PREVIEW (col-span-8) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-slate-700 text-xs flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-status-pulse" />
                <span>WYSIWYG Live Preview</span>
              </h3>
              <div className="flex items-center gap-1.5">
                {selectedTemplate && selectedTemplate.layout_style === "visual" && !selectedTemplate.is_public && (
                  <button
                    type="button"
                    onClick={() => navigate(`/dashboard/upload-template/${selectedTemplate.id}`)}
                    className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 border border-indigo-200 rounded transition-all shadow-xs flex items-center gap-1 text-xs font-semibold"
                    title="Edit Template Layout in Visual Editor"
                  >
                    <Pencil size={12} />
                    <span>Edit Template</span>
                  </button>
                )}
                {selectedTemplate && (
                  <button
                    className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-white border border-transparent hover:border-slate-200 rounded transition-all shadow-sm bg-white/50 flex items-center gap-1.5 text-xs font-medium"
                    onClick={() => setShowFullscreen(true)}
                  >
                    <Maximize2 size={14} />
                    <span>Expand</span>
                  </button>
                )}
              </div>
            </div>

            <div className="w-full bg-slate-50 rounded-xl border border-slate-200/60 overflow-hidden flex items-center justify-center p-4 min-h-[350px] shadow-inner">
              <div className="w-full shadow-md border border-slate-200/50 max-w-2xl transition-all duration-300">
                <TemplateRenderer
                  template={selectedTemplate}
                  formData={formData}
                />
              </div>
            </div>

            <p className="text-center text-slate-400 text-[10px] mt-3 flex items-center justify-center gap-1.5">
              <Info size={12} />
              Preview updates in real-time as you type or upload files
            </p>
          </div>

            {/* In-Page Spreadsheet Status Bar in Bulk Mode */}
            {creationMode === "bulk" && (
              <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200/80 flex items-center justify-center text-indigo-650">
                    <Table size={16} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
                      <span>In-Page Spreadsheet:</span>
                      <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full font-mono text-[10px]">
                        {nonEmptyRowsCount === 0
                          ? "0 rows"
                          : invalidRowsCount > 0
                          ? `${readyRowsCount} ready, ${invalidRowsCount} need attention`
                          : `${readyRowsCount} ready`}
                      </span>
                    </span>
                    <span className="block text-[10px] text-slate-400">
                      Type directly, paste from Excel, or review mapped columns
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleOpenSpreadsheet}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                >
                  <Table size={13} />
                  <span>Open Spreadsheet Editor</span>
                  {!isSpreadsheetAllowed && (
                    <span className="text-[9px] font-semibold bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-400/30 flex items-center gap-0.5 ml-1">
                      <Lock size={9} /> Growth
                    </span>
                  )}
                </button>
              </div>
            )}
          </div>

      </div>

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
        templateCustomFields={templateCustomPlaceholders}
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
              !isSpreadsheetAllowed
                ? "In-Page Spreadsheet (Growth Plan)"
                : isSpreadsheetOpen
                ? "Collapse Spreadsheet Editor"
                : "Open Spreadsheet Editor"
            }
            aria-label="Toggle Spreadsheet Editor"
            aria-expanded={isSpreadsheetOpen}
          >
            <div className="relative flex items-center justify-center">
              <FileSpreadsheet size={16} className="text-indigo-400 group-hover:text-indigo-300 transition-colors" />
              {isSpreadsheetAllowed && nonEmptyRowsCount > 0 && (
                <span
                  className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${
                    invalidRowsCount > 0 ? "bg-amber-500 animate-pulse" : "bg-emerald-500 animate-pulse"
                  }`}
                />
              )}
            </div>
            <span className="hidden xs:inline">Spreadsheet</span>
            {isSpreadsheetAllowed ? (
              <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full text-[10px] font-mono border border-slate-700">
                {nonEmptyRowsCount === 0
                  ? "0 rows"
                  : invalidRowsCount > 0
                  ? `${readyRowsCount}/${nonEmptyRowsCount} ready`
                  : `${readyRowsCount} ready`}
              </span>
            ) : (
              <span className="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full text-[10px] font-medium border border-amber-400/30 flex items-center gap-1">
                <Lock size={10} /> Growth
              </span>
            )}
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
          className={`fixed z-40 bg-white rounded-2xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden transition-all duration-300 ease-in-out pointer-events-auto ${
            /* Mobile styles (screens < 640px): bottom sheet */
            isSpreadsheetExpanded
              ? "inset-x-2 bottom-2 h-[92vh] max-h-[92vh] sm:inset-x-auto sm:bottom-20 sm:right-6 md:right-20 sm:w-[calc(100vw-48px)] md:w-[94vw] sm:max-w-[1260px] sm:h-[calc(100vh-100px)] sm:max-h-[840px]"
              : "inset-x-2 bottom-2 h-[60vh] max-h-[480px] sm:inset-x-auto sm:bottom-20 sm:right-6 md:right-20 sm:w-[460px] sm:max-w-[calc(100vw-32px)] sm:h-[580px] sm:max-h-[calc(100vh-100px)]"
          }`}
        >
          {/* Panel Header */}
          <div className="px-4 py-3 border-b border-slate-200 bg-white flex items-center justify-between gap-2 shrink-0 select-none">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-200/80 flex items-center justify-center text-indigo-650 shrink-0">
                <Table size={15} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-0 truncate">
                    Spreadsheet Editor
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
                  Type cells or paste from Excel (Ctrl+V) &bull; Live updates preview
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
          <div className="flex-1 p-3 sm:p-4 overflow-auto bg-slate-50/50">
            <SpreadsheetGrid
              rows={spreadsheetRows}
              onChangeRows={setSpreadsheetRows}
              userQuota={userCredits}
              batchDefaults={batchDefaults}
              onChangeBatchDefaults={setBatchDefaults}
              onOpenMappingModal={() => setIsMappingModalOpen(true)}
              templateCustomFields={templateCustomPlaceholders}
              isProOrEnterprise={isProOrEnterprise}
            />
          </div>

          {/* Panel Footer: Summary & Done */}
          <div className="px-4 py-2.5 border-t border-slate-200 bg-white flex items-center justify-between gap-2 shrink-0">
            <div className="text-[11px] text-slate-500 truncate flex items-center gap-1.5">
              {invalidRowsCount > 0 ? (
                <span className="text-amber-600 font-medium flex items-center gap-1">
                  <AlertTriangle size={12} />
                  <span>Fix {invalidRowsCount} highlighted rows before issuing</span>
                </span>
              ) : userCredits < readyRowsCount ? (
                <span className="text-red-600 font-medium">
                  Needs {readyRowsCount} credits (you have {userCredits})
                </span>
              ) : (
                <span className="text-slate-400 flex items-center gap-1">
                  <Info size={12} />
                  <span>Changes auto-sync with the Live Preview</span>
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={handleClosePanel}
              className="bg-slate-900 hover:bg-black text-white text-xs font-bold px-3.5 py-1.5 rounded-lg transition-all shadow-xs cursor-pointer shrink-0"
            >
              Done & Minimize
            </button>
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

      {/* Spreadsheet Editor Growth Upgrade Modal */}
      <BulkLockedState
        isOpen={isSpreadsheetUpgradeModalOpen}
        onClose={() => setIsSpreadsheetUpgradeModalOpen(false)}
      />
    </div>
  );
};

export default CreateCertificatePage;
