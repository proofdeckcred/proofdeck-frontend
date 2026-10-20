import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import {
  ArrowLeft,
  Save,
  UploadCloud,
  RotateCcw,
  RotateCw,
  Grid,
  FileBadge,
  Receipt,
  Mail,
  Maximize2,
  Sparkles,
  Settings,
  Type,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Check,
  Square,
  Circle as CircleIcon,
  Minus,
  Star as StarIcon,
  Award,
  Layers,
  Palette,
  Image as ImageIcon,
  Copy,
  FolderOpen,
  Layout,
  RefreshCw,
  Shapes,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Download,
  FileUp,
  AlignHorizontalSpaceAround,
  AlignVerticalSpaceAround,
  ArrowUp,
  ArrowDown,
  PenTool,
  QrCode,
  X,
} from "lucide-react";
import { Spinner } from "react-bootstrap";
import {
  createCustomTemplate,
  getTemplate,
  updateCustomTemplate,
} from "../api";
import CustomTemplateEditor from "../components/CustomTemplateEditor";
import TextElementControls from "../components/TextElementControls";
import { SERVER_BASE_URL } from "../config";

// --- PLACEHOLDER CONFIGURATIONS ---
const CERTIFICATE_PLACEHOLDERS = [
  { name: "Recipient Name", value: "{{recipient_name}}", defaultWidth: 350 },
  { name: "Course Title", value: "{{course_title}}", defaultWidth: 400 },
  { name: "Issue Date", value: "{{issue_date}}", defaultWidth: 200 },
  { name: "Issuer Name", value: "{{issuer_name}}", defaultWidth: 250 },
  { name: "Verification ID", value: "{{verification_id}}", defaultWidth: 300 },
  { name: "Signature", value: "{{signature}}", defaultWidth: 200 },
  { name: "QR Code", value: "{{qr_code}}", isQr: true },
];

const RECEIPT_PLACEHOLDERS = [
  { name: "Payer Name", value: "{{recipient_name}}", defaultWidth: 300 },
  { name: "Total Amount", value: "{{amount}}", defaultWidth: 150 },
  { name: "Payment Date", value: "{{issue_date}}", defaultWidth: 200 },
  { name: "Description", value: "{{course_title}}", defaultWidth: 350 },
  { name: "Receipt / Txn ID", value: "{{verification_id}}", defaultWidth: 250 },
  { name: "Issuer Name", value: "{{issuer_name}}", defaultWidth: 250 },
  { name: "Auth Signature", value: "{{signature}}", defaultWidth: 200 },
  { name: "QR Code", value: "{{qr_code}}", isQr: true },
];

const INVITATION_PLACEHOLDERS = [
  { name: "Guest Name", value: "{{recipient_name}}", defaultWidth: 350 },
  { name: "Event Title", value: "{{course_title}}", defaultWidth: 400 },
  { name: "Event Date", value: "{{issue_date}}", defaultWidth: 200 },
  { name: "Venue / Location", value: "{{issuer_name}}", defaultWidth: 250 },
  { name: "Event Time", value: "{{signature}}", defaultWidth: 200 },
  { name: "Ticket / RSVP ID", value: "{{verification_id}}", defaultWidth: 300 },
  { name: "Check-in QR Code", value: "{{qr_code}}", isQr: true },
];

// --- CANVAS SIZE PRESETS ---
const CANVAS_SIZE_PRESETS = [
  { name: "A4 Landscape", width: 842, height: 595, icon: "▭" },
  { name: "A4 Portrait", width: 595, height: 842, icon: "▯" },
  { name: "US Letter", width: 792, height: 612, icon: "▭" },
  { name: "Square", width: 600, height: 600, icon: "□" },
];

// --- BACKGROUND PALETTES ---
const LUXURY_COLORS = [
  { name: "Pure White", value: "#ffffff" },
  { name: "Warm Ivory", value: "#fdfbf7" },
  { name: "Cream Parchment", value: "#fef9ee" },
  { name: "Soft Linen", value: "#f8fafc" },
  { name: "Ice Blue", value: "#f0f9ff" },
  { name: "Emerald Mist", value: "#f0fdf4" },
  { name: "Royal Navy", value: "#0f172a" },
  { name: "Midnight Indigo", value: "#1e1b4b" },
  { name: "Slate Charcoal", value: "#1e293b" },
  { name: "Deep Forest", value: "#064e3b" },
];

// --- PRESET TEMPLATES ---
const PRESET_TEMPLATES = [
  {
    name: "Classic Navy & Gold",
    url: "data:image/svg+xml;utf8," + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="842" height="595" viewBox="0 0 842 595">
        <rect width="842" height="595" fill="#fcfcfc" />
        <rect x="20" y="20" width="802" height="555" fill="none" stroke="#1e3a8a" stroke-width="6" />
        <rect x="32" y="32" width="778" height="531" fill="none" stroke="#d97706" stroke-width="2" />
        <path d="M 20 50 L 50 20 M 792 20 L 822 50 M 822 545 L 792 575 M 50 575 L 20 545" stroke="#d97706" stroke-width="2" />
      </svg>
    `),
    canvasSize: { width: 842, height: 595 },
  },
  {
    name: "Modern Emerald",
    url: "data:image/svg+xml;utf8," + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="842" height="595" viewBox="0 0 842 595">
        <rect width="842" height="595" fill="#f8fafc" />
        <rect x="0" y="0" width="30" height="595" fill="#059669" />
        <circle cx="100" cy="80" r="22" fill="#facc15" opacity="0.8" />
      </svg>
    `),
    canvasSize: { width: 842, height: 595 },
  },
  {
    name: "Corporate Minimal",
    url: "data:image/svg+xml;utf8," + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="842" height="595" viewBox="0 0 842 595">
        <rect width="842" height="595" fill="#ffffff" />
        <rect x="25" y="25" width="792" height="545" fill="none" stroke="#e2e8f0" stroke-width="2" />
      </svg>
    `),
    canvasSize: { width: 842, height: 595 },
  },
  {
    name: "Tech Dark Neon",
    url: "data:image/svg+xml;utf8," + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="842" height="595" viewBox="0 0 842 595">
        <rect width="842" height="595" fill="#0f172a" />
        <rect x="0" y="0" width="10" height="595" fill="#06b6d4" />
      </svg>
    `),
    canvasSize: { width: 842, height: 595 },
  },
];

// --- DEFAULT BLANK CERTIFICATE STARTER ELEMENTS ---
const DEFAULT_CERTIFICATE_ELEMENTS = [
  {
    id: "el_title",
    type: "text",
    text: "Certificate of Completion",
    x: 171,
    y: 75,
    width: 500,
    height: 45,
    fontSize: 32,
    fontFamily: "Playfair Display",
    fill: "#1e3a8a",
    align: "center",
    fontStyle: "bold",
    rotation: 0,
    verticalAlign: "middle",
    isQr: false,
  },
  {
    id: "el_subtitle",
    type: "text",
    text: "This is proudly presented to",
    x: 221,
    y: 130,
    width: 400,
    height: 25,
    fontSize: 14,
    fontFamily: "Georgia",
    fill: "#4b5eaa",
    align: "center",
    fontStyle: "italic",
    rotation: 0,
    verticalAlign: "middle",
    isQr: false,
  },
  {
    id: "el_recipient",
    type: "placeholder",
    text: "{{recipient_name}}",
    x: 121,
    y: 170,
    width: 600,
    height: 50,
    fontSize: 36,
    fontFamily: "Georgia",
    fill: "#111827",
    align: "center",
    fontStyle: "bold",
    rotation: 0,
    verticalAlign: "middle",
    isQr: false,
  },
  {
    id: "el_rule",
    type: "line",
    x: 271,
    y: 235,
    width: 300,
    height: 10,
    stroke: "#d97706",
    strokeWidth: 2,
    rotation: 0,
  },
  {
    id: "el_body",
    type: "text",
    text: "for successfully completing the course curriculum and demonstrating exceptional achievement in",
    x: 171,
    y: 255,
    width: 500,
    height: 35,
    fontSize: 13,
    fontFamily: "Arial",
    fill: "#475569",
    align: "center",
    fontStyle: "normal",
    rotation: 0,
    verticalAlign: "middle",
    isQr: false,
  },
  {
    id: "el_course",
    type: "placeholder",
    text: "{{course_title}}",
    x: 121,
    y: 295,
    width: 600,
    height: 35,
    fontSize: 22,
    fontFamily: "Playfair Display",
    fill: "#1e3a8a",
    align: "center",
    fontStyle: "bold",
    rotation: 0,
    verticalAlign: "middle",
    isQr: false,
  },
  {
    id: "el_date",
    type: "placeholder",
    text: "{{issue_date}}",
    x: 90,
    y: 410,
    width: 180,
    height: 25,
    fontSize: 13,
    fontFamily: "Georgia",
    fill: "#1e293b",
    align: "center",
    fontStyle: "bold",
    rotation: 0,
    verticalAlign: "middle",
    isQr: false,
  },
  {
    id: "el_date_label",
    type: "text",
    text: "Date of Issue",
    x: 90,
    y: 440,
    width: 180,
    height: 20,
    fontSize: 9,
    fontFamily: "Arial",
    fill: "#94a3b8",
    align: "center",
    fontStyle: "normal",
    rotation: 0,
    verticalAlign: "middle",
    isQr: false,
  },
  {
    id: "el_signature",
    type: "placeholder",
    text: "{{signature}}",
    x: 572,
    y: 410,
    width: 180,
    height: 25,
    fontSize: 16,
    fontFamily: "Georgia",
    fill: "#1e293b",
    align: "center",
    fontStyle: "italic",
    rotation: 0,
    verticalAlign: "middle",
    isQr: false,
  },
  {
    id: "el_signature_label",
    type: "text",
    text: "Authorized Signature",
    x: 572,
    y: 440,
    width: 180,
    height: 20,
    fontSize: 9,
    fontFamily: "Arial",
    fill: "#94a3b8",
    align: "center",
    fontStyle: "normal",
    rotation: 0,
    verticalAlign: "middle",
    isQr: false,
  },
  {
    id: "el_qr",
    type: "qr",
    text: "{{qr_code}}",
    x: 396,
    y: 400,
    width: 50,
    height: 50,
    align: "center",
    fontStyle: "normal",
    rotation: 0,
    verticalAlign: "middle",
    isQr: true,
  },
];

const UploadTemplatePage = () => {
  const { templateId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [templateTitle, setTemplateTitle] = useState(templateId ? "" : "Untitled Certificate");
  const [templateType, setTemplateType] = useState("certificate");
  const [templateImageFile, setTemplateImageFile] = useState(null);
  const [templateImageUrl, setTemplateImageUrl] = useState(null);
  const [importedTemplateMeta, setImportedTemplateMeta] = useState(null);
  const [isDraggingOverImport, setIsDraggingOverImport] = useState(false);
  const [backgroundConfig, setBackgroundConfig] = useState({
    fill: "#ffffff",
    border: true,
    borderColor: "#1e3a8a",
    borderAccent: "#d97706",
    borderWidth: 4,
  });

  const [elements, setElements] = useState(templateId ? [] : DEFAULT_CERTIFICATE_ELEMENTS);
  const [history, setHistory] = useState([templateId ? [] : DEFAULT_CERTIFICATE_ELEMENTS]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [canvasSize, setCanvasSize] = useState({ width: 842, height: 595 });
  const [customVariables, setCustomVariables] = useState([]);
  const [newVarName, setNewVarName] = useState("");
  const [uploadedAssets, setUploadedAssets] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(!!templateId);
  const [showGrid, setShowGrid] = useState(true);
  const [zoomScale, setZoomScale] = useState(0.75);
  const [leftTab, setLeftTab] = useState(
    location.search.includes("mode=import") ? "background" : "text"
  ); // 'text', 'elements', 'background', 'uploads', 'layers'
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);
  const [previewMode, setPreviewMode] = useState(false);
  const [isDraggingTemplate, setIsDraggingTemplate] = useState(false);
  const [sampleData, setSampleData] = useState({
    recipient_name: "Alabi Ezekiel",
    course_title: "Build in Public for 30 Days Program",
    issue_date: "20th October, 2026",
    issuer_name: "ProofDeck Academy",
    verification_id: "PD-2026-84920",
    signature: "Ezekiel Alabi",
  });
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmButtonText: "Confirm",
    onConfirm: null,
  });

  const fileInputRef = useRef(null);
  const assetInputRef = useRef(null);
  const stageRef = useRef(null);
  const workspaceRef = useRef(null);
  const [zoomMode, setZoomMode] = useState("fit");

  const handleFitScreen = useCallback(() => {
    if (!workspaceRef.current) return;
    const rect = workspaceRef.current.getBoundingClientRect();
    const padding = 64;
    const availableWidth = rect.width - padding;
    const availableHeight = rect.height - padding;
    if (availableWidth <= 0 || availableHeight <= 0) return;

    const scaleX = availableWidth / canvasSize.width;
    const scaleY = availableHeight / canvasSize.height;
    let fitScale = Math.min(scaleX, scaleY);
    fitScale = Math.max(0.25, Math.min(2.0, Math.round(fitScale * 100) / 100));
    setZoomScale(fitScale);
  }, [canvasSize]);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleFitScreen();
    }, 200);
    return () => clearTimeout(timer);
  }, [canvasSize, handleFitScreen]);

  useEffect(() => {
    if (zoomMode === "fit") {
      const timer = setTimeout(() => {
        handleFitScreen();
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isLeftSidebarOpen, isRightSidebarOpen, zoomMode, handleFitScreen]);

  // Load template if editing existing
  useEffect(() => {
    if (templateId) {
      const fetchTemplateData = async () => {
        try {
          const response = await getTemplate(templateId);
          const { title } = response.data;
          setTemplateTitle(title || "Custom Template");

          let layoutData = response.data.layout_data;
          if (typeof layoutData === "string") {
            try {
              layoutData = JSON.parse(layoutData);
            } catch (e) {
              layoutData = {};
            }
          }
          layoutData = layoutData || {};

          if (layoutData.type) setTemplateType(layoutData.type);
          if (layoutData.canvas) setCanvasSize(layoutData.canvas);

          if (layoutData.background) {
            setBackgroundConfig({
              fill: layoutData.background.fill || "#ffffff",
              border: !!layoutData.background.border,
              borderColor: layoutData.background.borderColor || "#1e3a8a",
              borderAccent: layoutData.background.borderAccent || "#d97706",
              borderWidth: layoutData.background.borderWidth || 4,
            });
          }

          const loadedElements = (layoutData.elements || []).map((el, index) => ({
            ...el,
            id: el.id || `el_${Math.random().toString(36).substring(2, 11)}_${index}`,
            verticalAlign: el.verticalAlign || "middle",
            align: el.align || (el.isQr ? "center" : "left"),
            visible: el.visible !== false,
            locked: !!el.locked,
          }));
          setElements(loadedElements);

          // Custom variables
          const customVars = layoutData.custom_fields || [];
          setCustomVariables(customVars);

          const rawBg = layoutData.background?.image || response.data.background_url;
          if (rawBg) {
            let fullBgUrl = rawBg;
            if (!rawBg.startsWith("data:") && !rawBg.startsWith("blob:") && !rawBg.startsWith("http://") && !rawBg.startsWith("https://")) {
              const cleanBase = SERVER_BASE_URL.replace(/\/+$/, "");
              const cleanPath = rawBg.startsWith("/") ? rawBg : `/${rawBg}`;
              fullBgUrl = `${cleanBase}${cleanPath}`;
            }
            setTemplateImageUrl(fullBgUrl);
            setImportedTemplateMeta({
              name: rawBg.split("/").pop() || "Imported Certificate Template",
              width: layoutData.canvas?.width || 842,
              height: layoutData.canvas?.height || 595,
              aspectRatio: (layoutData.canvas?.width || 842) / (layoutData.canvas?.height || 595),
            });
          }

          setHistory([loadedElements]);
          setCurrentStep(0);
        } catch (error) {
          console.error("Fetch template error:", error);
          toast.error("Failed to load template data.");
          navigate("/dashboard/templates");
        } finally {
          setIsLoading(false);
        }
      };
      fetchTemplateData();
    }
  }, [templateId, navigate]);

  // Undo / Redo history tracking
  useEffect(() => {
    if (!isLoadingHistory) {
      const newHistory = history.slice(0, currentStep + 1);
      newHistory.push(elements);
      setHistory(newHistory);
      setCurrentStep(newHistory.length - 1);
    } else {
      setIsLoadingHistory(false);
    }
  }, [elements]);

  const handleUndo = useCallback(() => {
    if (currentStep > 0) {
      setIsLoadingHistory(true);
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      setElements(history[prevStep]);
    }
  }, [currentStep, history]);

  const handleRedo = useCallback(() => {
    if (currentStep < history.length - 1) {
      setIsLoadingHistory(true);
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      setElements(history[nextStep]);
    }
  }, [currentStep, history]);

  // --- Add Text Elements (Heading, Subheading, Body) ---
  const handleAddText = (kind) => {
    const cx = Math.round(canvasSize.width / 2);
    const cy = Math.round(canvasSize.height / 2);

    let newEl = {
      id: `el_text_${Math.random().toString(36).substring(2, 9)}`,
      type: "text",
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: false,
    };

    if (kind === "heading") {
      newEl = {
        ...newEl,
        text: "CERTIFICATE OF RECOGNITION",
        x: Math.max(20, cx - 250),
        y: Math.max(20, cy - 25),
        width: 500,
        height: 50,
        fontSize: 32,
        fontFamily: "Playfair Display",
        fill: "#1e3a8a",
        align: "center",
        fontStyle: "bold",
      };
    } else if (kind === "subheading") {
      newEl = {
        ...newEl,
        text: "In Recognition of Outstanding Excellence",
        x: Math.max(20, cx - 200),
        y: Math.max(20, cy - 15),
        width: 400,
        height: 30,
        fontSize: 18,
        fontFamily: "Georgia",
        fill: "#4b5eaa",
        align: "center",
        fontStyle: "italic",
      };
    } else {
      newEl = {
        ...newEl,
        text: "This document is awarded in appreciation of active participation and demonstrated commitment.",
        x: Math.max(20, cx - 250),
        y: Math.max(20, cy - 20),
        width: 500,
        height: 40,
        fontSize: 13,
        fontFamily: "Arial",
        fill: "#475569",
        align: "center",
        fontStyle: "normal",
      };
    }

    setElements((prev) => [...prev, newEl]);
    setSelectedId(newEl.id);
    setPreviewMode(false);
    setIsRightSidebarOpen(true);
  };

  // --- Add Shape Elements ---
  const handleAddShape = (shapeType) => {
    const cx = Math.round(canvasSize.width / 2);
    const cy = Math.round(canvasSize.height / 2);
    const id = `el_${shapeType}_${Math.random().toString(36).substring(2, 9)}`;

    let newEl = {
      id,
      type: shapeType,
      x: cx - 60,
      y: cy - 60,
      width: 120,
      height: 120,
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: false,
    };

    if (shapeType === "rect") {
      newEl = {
        ...newEl,
        x: cx - 100,
        y: cy - 60,
        width: 200,
        height: 120,
        fill: "#3b82f6",
        stroke: "#1d4ed8",
        strokeWidth: 2,
        cornerRadius: 8,
      };
    } else if (shapeType === "circle") {
      newEl = {
        ...newEl,
        width: 120,
        height: 120,
        fill: "#f59e0b",
        stroke: "#d97706",
        strokeWidth: 2,
      };
    } else if (shapeType === "line") {
      newEl = {
        ...newEl,
        x: cx - 150,
        y: cy,
        width: 300,
        height: 10,
        stroke: "#1e293b",
        strokeWidth: 2,
      };
    } else if (shapeType === "star") {
      newEl = {
        ...newEl,
        width: 70,
        height: 70,
        fill: "#f59e0b",
        stroke: "#d97706",
        strokeWidth: 1,
        numPoints: 5,
      };
    } else if (shapeType === "badge") {
      newEl = {
        ...newEl,
        width: 90,
        height: 110,
        fill: "#d97706",
        stroke: "#b45309",
        strokeWidth: 2,
      };
    } else if (shapeType === "border") {
      newEl = {
        ...newEl,
        x: 25,
        y: 25,
        width: canvasSize.width - 50,
        height: canvasSize.height - 50,
        fill: "transparent",
        stroke: "#1e3a8a",
        strokeWidth: 4,
        cornerRadius: 4,
      };
    }

    setElements((prev) => [...prev, newEl]);
    setSelectedId(newEl.id);
    setPreviewMode(false);
    setIsRightSidebarOpen(true);
  };

  // --- Add Dynamic Variable Placeholder ---
  const handleAddPlaceholder = (placeholder) => {
    const defaultWidth = placeholder.defaultWidth || 250;
    const isQr = placeholder.isQr || false;
    const cx = Math.round(canvasSize.width / 2);
    const cy = Math.round(canvasSize.height / 2);

    const newElement = {
      id: `el_var_${Math.random().toString(36).substring(2, 9)}`,
      type: isQr ? "qr" : "placeholder",
      text: placeholder.value,
      x: isQr ? cx - 35 : Math.max(20, Math.round(cx - defaultWidth / 2)),
      y: isQr ? cy - 35 : Math.max(20, cy - 18),
      width: isQr ? 70 : defaultWidth,
      height: isQr ? 70 : 36,
      fontSize: placeholder.value === "{{recipient_name}}" ? 28 : 18,
      fontFamily: "Inter",
      fill: "#111827",
      align: "center",
      fontStyle: isQr ? "normal" : "bold",
      rotation: 0,
      verticalAlign: "middle",
      isQr,
      visible: true,
      locked: false,
    };

    setElements((prev) => [...prev, newElement]);
    setSelectedId(newElement.id);
    setPreviewMode(false);
    setIsRightSidebarOpen(true);
    toast.success(`Added ${placeholder.name} to canvas`);
  };

  // --- Add Custom Uploaded Image to Canvas ---
  const handleAddImageToCanvas = (imgSrc, naturalW = 120, naturalH = 120) => {
    const cx = Math.round(canvasSize.width / 2);
    const cy = Math.round(canvasSize.height / 2);
    const ratio = naturalW && naturalH ? naturalW / naturalH : 1;
    const targetW = 130;
    const targetH = Math.max(40, Math.round(targetW / ratio));
    const newEl = {
      id: `el_img_${Math.random().toString(36).substring(2, 9)}`,
      type: "image",
      src: imgSrc,
      x: Math.round(cx - targetW / 2),
      y: Math.round(cy - targetH / 2),
      width: targetW,
      height: targetH,
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: false,
    };
    setElements((prev) => [...prev, newEl]);
    setSelectedId(newEl.id);
    setPreviewMode(false);
    setIsRightSidebarOpen(true);
  };

  // Handle uploading logo / graphic / seal
  const handleAssetUpload = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    const isValidImage =
      file.type.startsWith("image/") ||
      ["png", "jpg", "jpeg", "webp", "svg"].includes(ext);

    if (!isValidImage) {
      toast.error("Please upload a PNG, JPG, WEBP, or SVG image.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const MAX_DIM = 1000;
        let w = img.width || 300;
        let h = img.height || 300;
        if (w > MAX_DIM || h > MAX_DIM) {
          if (w > h) {
            h = Math.round((h * MAX_DIM) / w);
            w = MAX_DIM;
          } else {
            w = Math.round((w * MAX_DIM) / h);
            h = MAX_DIM;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);
        const mimeType =
          file.type === "image/jpeg" || ext === "jpg" || ext === "jpeg"
            ? "image/jpeg"
            : "image/png";
        const optimizedDataUrl = canvas.toDataURL(mimeType, 0.9);
        setUploadedAssets((prev) => [...prev, { name: file.name, src: optimizedDataUrl, width: w, height: h }]);
        handleAddImageToCanvas(optimizedDataUrl, w, h);
        toast.success(`Added "${file.name}" to canvas!`);
      };
      img.onerror = () => {
        toast.error("Could not read image file. Please try another PNG or JPG.");
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // --- Process & Optimize Imported Certificate Template Image ---
  const processCertTemplateFile = (file) => {
    if (!file) return;
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    const isValid =
      file.type.startsWith("image/") ||
      ["png", "jpg", "jpeg", "webp", "svg"].includes(ext);

    if (!isValid) {
      toast.error("Please upload a valid certificate image (PNG, JPG, WEBP, or SVG).");
      return;
    }

    const loadingToast = toast.loading("Importing & optimizing your certificate template...");
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const naturalW = img.width || 842;
        const naturalH = img.height || 595;
        const aspectRatio = naturalW / naturalH;
        const canvasWidth = 842;
        const canvasHeight = Math.max(300, Math.min(1400, Math.round(canvasWidth / aspectRatio)));

        // Compress high-res certificate design (up to 2200px) so upload never hits 413 Request Entity Too Large
        const MAX_CERT_DIM = 2200;
        let outW = naturalW;
        let outH = naturalH;
        if (outW > MAX_CERT_DIM || outH > MAX_CERT_DIM) {
          if (outW > outH) {
            outH = Math.round((outH * MAX_CERT_DIM) / outW);
            outW = MAX_CERT_DIM;
          } else {
            outW = Math.round((outW * MAX_CERT_DIM) / outH);
            outH = MAX_CERT_DIM;
          }
        }

        const offCanvas = document.createElement("canvas");
        offCanvas.width = outW;
        offCanvas.height = outH;
        const ctx = offCanvas.getContext("2d");
        // Fill white base in case transparent certificate image is exported to JPEG
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, outW, outH);
        ctx.drawImage(img, 0, 0, outW, outH);

        // Use high-quality JPEG (0.90) to guarantee compact payload (< 600KB) even for 4K Canva exports
        const previewDataUrl = offCanvas.toDataURL("image/jpeg", 0.90);
        offCanvas.toBlob(
          (blob) => {
            toast.dismiss(loadingToast);
            const cleanBaseName = file.name.replace(/\.[^/.]+$/, "") || "certificate_template";
            const optimizedFile = blob
              ? new File([blob], `${cleanBaseName}.jpg`, { type: "image/jpeg" })
              : file;

            setCanvasSize({ width: canvasWidth, height: canvasHeight });
            setTemplateImageUrl(previewDataUrl);
            setTemplateImageFile(optimizedFile);
            setImportedTemplateMeta({
              name: file.name,
              width: naturalW,
              height: naturalH,
              aspectRatio,
            });
            setBackgroundConfig((prev) => ({ ...prev, border: false }));

            // Check if current elements are still the untouched starter elements
            const isStillDefaultStarter =
              elements.length === DEFAULT_CERTIFICATE_ELEMENTS.length &&
              elements.every((el, i) => el.id === DEFAULT_CERTIFICATE_ELEMENTS[i]?.id);

            if (isStillDefaultStarter) {
              // First-time import over starter template: clear starter clutter and place {{recipient_name}} ready to position
              const starterRecipient = {
                id: `el_recipient_${Math.random().toString(36).substring(2, 8)}`,
                type: "placeholder",
                text: "{{recipient_name}}",
                x: Math.round((canvasWidth - 380) / 2),
                y: Math.round(canvasHeight * 0.48),
                width: 380,
                height: 44,
                fontSize: 32,
                fontFamily: "Inter",
                fill: "#111827",
                align: "center",
                fontStyle: "bold",
                rotation: 0,
                verticalAlign: "middle",
                isQr: false,
                visible: true,
                locked: false,
              };
              setElements([starterRecipient]);
              setSelectedId(starterRecipient.id);
              toast.success("Certificate template imported! Drag {{recipient_name}} into position or add more variables.");
            } else {
              // Replacing existing template or user already customized elements -> preserve their elements!
              toast.success("Certificate template updated! Your placed elements were preserved.");
            }
          },
          "image/jpeg",
          0.90
        );
      };
      img.onerror = () => {
        toast.dismiss(loadingToast);
        toast.error("Failed to load certificate image. Please try another PNG or JPG file.");
      };
      img.src = event.target.result;
    };
    reader.onerror = () => {
      toast.dismiss(loadingToast);
      toast.error("Failed to read file.");
    };
    reader.readAsDataURL(file);
  };

  // Handle file input change for importing certificate template
  const handleBackgroundUpload = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) {
      processCertTemplateFile(file);
    }
  };

  // Convert an uploaded logo/image element on canvas into the Full Certificate Template
  const handleConvertElementToTemplate = (imgElement) => {
    if (!imgElement?.src) return;
    const img = new Image();
    img.onload = () => {
      const aspectRatio = (img.width || 842) / (img.height || 595);
      const canvasWidth = 842;
      const canvasHeight = Math.max(300, Math.min(1400, Math.round(canvasWidth / aspectRatio)));
      setCanvasSize({ width: canvasWidth, height: canvasHeight });
      setTemplateImageUrl(imgElement.src);
      setTemplateImageFile(null);
      setImportedTemplateMeta({
        name: "Converted Certificate Design",
        width: img.width || 842,
        height: img.height || 595,
        aspectRatio,
      });
      setBackgroundConfig((prev) => ({ ...prev, border: false }));
      setElements((prev) => prev.filter((el) => el.id !== imgElement.id));
      setSelectedId(null);
      toast.success("Set image as your full Certificate Template!");
    };
    img.src = imgElement.src;
  };

  const handleRemoveImportedTemplate = () => {
    setTemplateImageUrl(null);
    setTemplateImageFile(null);
    setImportedTemplateMeta(null);
    toast.success("Removed imported certificate template.");
  };

  // Export Studio Canvas as High-Res PNG
  const handleExportPng = () => {
    if (!stageRef.current) return;
    const prevSelected = selectedId;
    setSelectedId(null);
    setTimeout(() => {
      try {
        const stage = stageRef.current;
        const dataUrl = stage.toDataURL({
          pixelRatio: 2 / zoomScale,
          mimeType: "image/png",
        });
        const link = document.createElement("a");
        link.download = `${(templateTitle || "certificate-design").replace(/\s+/g, "-").toLowerCase()}.png`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Downloaded high-res PNG preview!");
      } catch (err) {
        console.error("Export PNG error:", err);
        toast.error("Could not export PNG preview.");
      } finally {
        if (prevSelected) setSelectedId(prevSelected);
      }
    }, 100);
  };

  const handleClearAllLayers = () => {
    if (elements.length === 0) return;
    setConfirmModal({
      isOpen: true,
      title: "Clear All Layers?",
      message: "Are you sure you want to clear all layers from the canvas? Your imported certificate template background will remain.",
      confirmButtonText: "Clear Layers",
      onConfirm: () => {
        setElements([]);
        setSelectedId(null);
        toast.success("All layers cleared!");
      },
    });
  };

  const handleApplyColorToAllText = (color) => {
    setElements((prev) =>
      prev.map((el) => {
        if (el.type === "text" || el.type === "placeholder") {
          return { ...el, fill: color };
        }
        return el;
      })
    );
    toast.success("Updated color for all text!", { id: "text-color-all" });
  };

  const handleSelectPreset = (preset) => {
    setTemplateImageUrl(preset.url);
    setTemplateImageFile(null);
    setImportedTemplateMeta(null);
    if (preset.canvasSize) {
      setCanvasSize(preset.canvasSize);
    }
    toast.success(`Applied ${preset.name}`);
  };

  const handleClearCanvas = () => {
    setConfirmModal({
      isOpen: true,
      title: "Reset Canvas Blank?",
      message: "Are you sure you want to clear all elements and imported template to start completely blank?",
      confirmButtonText: "Reset Blank",
      onConfirm: () => {
        setElements([]);
        setSelectedId(null);
        setTemplateImageUrl(null);
        setTemplateImageFile(null);
        setImportedTemplateMeta(null);
        setBackgroundConfig({
          fill: "#ffffff",
          border: false,
          borderColor: "#1e3a8a",
          borderAccent: "#d97706",
          borderWidth: 4,
        });
        toast.success("Canvas cleared. Start designing from scratch!");
      },
    });
  };

  const handleAddCustomVariable = () => {
    if (!newVarName.trim()) return;
    const cleanTag = newVarName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, "_")
      .replace(/^_+|_+$/g, "");
    if (!cleanTag) return;
    const value = `{{${cleanTag}}}`;

    if (customVariables.some((cv) => cv.value === value)) {
      toast.error("A variable with this name already exists.");
      return;
    }

    const formattedName = newVarName.trim();
    const newVar = {
      name: formattedName,
      value,
      defaultWidth: 250,
      isCustom: true,
    };

    setCustomVariables((prev) => [...prev, newVar]);
    setNewVarName("");
    toast.success(`Created variable "${formattedName}"`);
  };

  // --- Save Template ---
  const handleSaveTemplate = async () => {
    if (!templateTitle.trim()) {
      return toast.error("Please provide a name for your certificate.");
    }
    if (elements.length === 0) {
      return toast.error("Please add at least one variable or text element (e.g. Recipient Name) to your design.");
    }

    setIsSubmitting(true);

    // IMPORTANT: Do NOT embed huge base64 data URL inside layout_data when templateImageFile is being uploaded as a file!
    let bgImageForJson = null;
    if (!templateImageFile && templateImageUrl) {
      let relativePath = templateImageUrl;
      if (!relativePath.startsWith("data:") && !relativePath.startsWith("blob:")) {
        try {
          const urlObj = new URL(relativePath);
          relativePath = urlObj.pathname;
        } catch (e) {
          const cleanServer = SERVER_BASE_URL.replace(/\/+$/, "");
          relativePath = relativePath.replace(cleanServer, "");
        }
      }
      bgImageForJson = relativePath;
    }

    const layoutData = {
      type: templateType,
      canvas: canvasSize,
      custom_fields: customVariables,
      background: {
        fill: backgroundConfig.fill || "#ffffff",
        border: !!backgroundConfig.border,
        borderColor: backgroundConfig.borderColor || "#1e3a8a",
        borderAccent: backgroundConfig.borderAccent || "#d97706",
        borderWidth: backgroundConfig.borderWidth || 4,
        image: bgImageForJson,
      },
      elements: elements.map((el) => ({
        id: el.id,
        type: el.type || (el.isQr ? "qr" : "text"),
        text: el.text,
        src: el.src,
        x: Math.round(el.x || 0),
        y: Math.round(el.y || 0),
        width: Math.round(el.width || 100),
        height: Math.round(el.height || 30),
        fontSize: el.fontSize,
        fontFamily: el.fontFamily,
        fill: el.fill,
        stroke: el.stroke,
        strokeWidth: el.strokeWidth,
        dash: el.dash,
        cornerRadius: el.cornerRadius,
        numPoints: el.numPoints,
        align: el.align || "left",
        fontStyle: el.fontStyle || "normal",
        textDecoration: el.textDecoration || "",
        letterSpacing: el.letterSpacing || 0,
        lineHeight: el.lineHeight || 1,
        opacity: el.opacity != null ? el.opacity : 1,
        rotation: Math.round(el.rotation || 0),
        verticalAlign: el.verticalAlign || "middle",
        isQr: !!el.isQr,
        visible: el.visible !== false,
        locked: !!el.locked,
      })),
    };

    const formData = new FormData();
    formData.append("title", templateTitle);
    formData.append("layout_data", JSON.stringify(layoutData));
    if (templateImageFile) {
      formData.append("template_image", templateImageFile);
    }

    const promise = templateId
      ? updateCustomTemplate(templateId, formData)
      : createCustomTemplate(formData);

    toast.promise(promise, {
      loading: templateId ? "Updating design..." : "Saving certificate template...",
      success: () => {
        setTimeout(() => navigate("/dashboard/templates"), 1200);
        return `Certificate template saved successfully!`;
      },
      error: (err) => err.response?.data?.msg || `Failed to save template.`,
    });
    promise.finally(() => setIsSubmitting(false));
  };

  const selectedElement = elements.find((el) => el.id === selectedId);
  const activePlaceholders =
    templateType === "receipt"
      ? RECEIPT_PLACEHOLDERS
      : templateType === "invitation"
      ? INVITATION_PLACEHOLDERS
      : CERTIFICATE_PLACEHOLDERS;

  return (
    <div className="h-full flex flex-col font-sans bg-slate-100 text-gray-800 select-none">
      <Toaster position="top-center" />

      {/* Root-Mounted File Inputs (Always in DOM regardless of active tab so uploads work every time) */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml"
        onChange={handleBackgroundUpload}
      />
      <input
        type="file"
        ref={assetInputRef}
        className="hidden"
        accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml"
        onChange={handleAssetUpload}
      />

      {/* --- STUDIO TOP HEADER --- */}
      <header className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between sticky top-0 z-50 h-12 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/dashboard/templates")}
            className="text-gray-500 hover:text-gray-900 transition-colors p-1.5 rounded-full hover:bg-gray-100 cursor-pointer"
            title="Back to Templates"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="h-5 w-px bg-gray-200" />
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded uppercase tracking-wider">
              Studio
            </span>
            <input
              type="text"
              value={templateTitle}
              onChange={(e) => setTemplateTitle(e.target.value)}
              placeholder="Untitled Certificate"
              className="text-sm font-bold text-gray-800 border-none focus:ring-0 placeholder-gray-400 bg-transparent w-48 lg:w-64 hover:bg-gray-50 px-1.5 py-0.5 rounded transition-colors"
            />
          </div>
        </div>

        {/* Studio Toolbar */}
        <div className="flex items-center gap-1.5">
          {/* Prominent Import Cert Template CTA */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-semibold py-1.5 px-2.5 rounded-lg flex items-center gap-1.5 text-xs transition-all cursor-pointer shadow-2xs"
            title="Import your own pre-designed certificate template (Canva, Photoshop, Figma, etc.)"
          >
            <FileUp size={13} />
            <span className="hidden md:inline">
              {templateImageUrl ? "Replace Cert Template" : "Import Cert Template"}
            </span>
          </button>

          {/* Live Sample Data Preview Toggle */}
          <button
            type="button"
            onClick={() => {
              setPreviewMode((prev) => !prev);
              if (!previewMode) setSelectedId(null);
            }}
            className={`py-1.5 px-2.5 rounded-lg flex items-center gap-1.5 text-xs font-semibold border transition-all cursor-pointer ${
              previewMode
                ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
            }`}
            title="Preview certificate with real sample recipient names and dates instead of {{placeholders}}"
          >
            {previewMode ? <EyeOff size={13} /> : <Eye size={13} />}
            <span className="hidden sm:inline">
              {previewMode ? "Exit Preview" : "Live Preview"}
            </span>
          </button>

          {/* Grid Toggle */}
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`p-1.5 rounded-md transition-colors border cursor-pointer ${
              showGrid
                ? "bg-indigo-50 border-indigo-200 text-indigo-600"
                : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
            }`}
            title="Toggle Alignment Grid"
          >
            <Grid size={14} />
          </button>

          <div className="h-5 w-px bg-gray-200 mx-0.5" />

          {/* Undo / Redo */}
          <button
            onClick={handleUndo}
            disabled={currentStep <= 0}
            className="text-gray-600 hover:text-gray-900 disabled:opacity-30 p-1.5 rounded-md hover:bg-gray-100 border border-transparent cursor-pointer"
            title="Undo (Ctrl+Z)"
          >
            <RotateCcw size={14} />
          </button>
          <button
            onClick={handleRedo}
            disabled={currentStep >= history.length - 1}
            className="text-gray-600 hover:text-gray-900 disabled:opacity-30 p-1.5 rounded-md hover:bg-gray-100 border border-transparent cursor-pointer"
            title="Redo (Ctrl+Y)"
          >
            <RotateCw size={14} />
          </button>

          <div className="h-5 w-px bg-gray-200 mx-0.5" />

          {/* Export PNG */}
          <button
            type="button"
            onClick={handleExportPng}
            className="text-gray-600 hover:text-indigo-600 p-1.5 rounded-md hover:bg-indigo-50 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
            title="Download high-resolution PNG preview"
          >
            <Download size={13} />
            <span className="hidden xl:inline">Export PNG</span>
          </button>

          {/* Clear / Blank Button */}
          <button
            onClick={handleClearCanvas}
            className="text-gray-500 hover:text-red-600 p-1.5 rounded-md hover:bg-red-50 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
            title="Clear all elements and start blank"
          >
            <RefreshCw size={13} />
            <span className="hidden xl:inline">Reset Blank</span>
          </button>

          {/* Save Button */}
          <button
            onClick={handleSaveTemplate}
            disabled={isSubmitting}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-1.5 px-4 rounded-lg flex items-center gap-1.5 disabled:opacity-70 shadow-sm transition-all ml-1 text-xs cursor-pointer"
          >
            {isSubmitting ? (
              <Spinner animation="border" size="sm" style={{ width: 12, height: 12 }} />
            ) : (
              <Save size={14} />
            )}
            <span>Save Certificate</span>
          </button>
        </div>
      </header>

      {/* --- STUDIO BODY: 3 COLUMNS --- */}
      <div className="flex-grow flex overflow-hidden">
        {/* 1. LEFT SIDEBAR: Canva-Style Tools */}
        {isLeftSidebarOpen && (
          <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0 overflow-hidden animate-in slide-in-from-left duration-200 shadow-sm">
            {/* Canva Tab Strip */}
            <div className="grid grid-cols-5 border-b border-gray-100 p-1 bg-gray-50/70 text-center">
              <button
                onClick={() => setLeftTab("text")}
                className={`py-1.5 flex flex-col items-center justify-center rounded transition-all cursor-pointer ${
                  leftTab === "text"
                    ? "bg-white text-indigo-600 shadow-xs font-bold"
                    : "text-gray-500 hover:text-gray-800"
                }`}
                title="Add Text & Variables"
              >
                <Type size={14} />
                <span className="text-[9px] mt-0.5">Text</span>
              </button>

              <button
                onClick={() => setLeftTab("elements")}
                className={`py-1.5 flex flex-col items-center justify-center rounded transition-all cursor-pointer ${
                  leftTab === "elements"
                    ? "bg-white text-indigo-600 shadow-xs font-bold"
                    : "text-gray-500 hover:text-gray-800"
                }`}
                title="Add Shapes & Elements"
              >
                <Shapes size={14} />
                <span className="text-[9px] mt-0.5">Shapes</span>
              </button>

              <button
                onClick={() => setLeftTab("background")}
                className={`py-1.5 flex flex-col items-center justify-center rounded transition-all cursor-pointer ${
                  leftTab === "background"
                    ? "bg-white text-indigo-600 shadow-xs font-bold"
                    : "text-gray-500 hover:text-gray-800"
                }`}
                title="Import Cert Template & Canvas Setup"
              >
                <Palette size={14} />
                <span className="text-[9px] mt-0.5">Canvas</span>
              </button>

              <button
                onClick={() => setLeftTab("uploads")}
                className={`py-1.5 flex flex-col items-center justify-center rounded transition-all cursor-pointer ${
                  leftTab === "uploads"
                    ? "bg-white text-indigo-600 shadow-xs font-bold"
                    : "text-gray-500 hover:text-gray-800"
                }`}
                title="Import Cert Template & Upload Logos"
              >
                <UploadCloud size={14} />
                <span className="text-[9px] mt-0.5">Uploads</span>
              </button>

              <button
                onClick={() => setLeftTab("layers")}
                className={`py-1.5 flex flex-col items-center justify-center rounded transition-all cursor-pointer ${
                  leftTab === "layers"
                    ? "bg-white text-indigo-600 shadow-xs font-bold"
                    : "text-gray-500 hover:text-gray-800"
                }`}
                title="Layers Stack"
              >
                <Layers size={14} />
                <span className="text-[9px] mt-0.5">Layers</span>
              </button>
            </div>

            {/* Left Tab Content */}
            <div className="flex-grow overflow-y-auto p-3">
              {isLoading ? (
                <div className="text-center py-10">
                  <Spinner variant="primary" size="sm" />
                </div>
              ) : leftTab === "text" ? (
                /* TAB 1: TEXT & VARIABLES */
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">
                      Add New Text
                    </p>
                    <div className="space-y-1.5">
                      <button
                        onClick={() => handleAddText("heading")}
                        className="w-full text-left p-2.5 rounded-lg border border-gray-200 hover:border-indigo-500 hover:bg-indigo-50/20 transition-all group cursor-pointer flex items-center justify-between"
                      >
                        <span className="font-serif font-bold text-base text-gray-800 group-hover:text-indigo-600">
                          Add a Heading
                        </span>
                        <Plus size={14} className="text-gray-400 group-hover:text-indigo-600" />
                      </button>

                      <button
                        onClick={() => handleAddText("subheading")}
                        className="w-full text-left p-2 rounded-lg border border-gray-200 hover:border-indigo-500 hover:bg-indigo-50/20 transition-all group cursor-pointer flex items-center justify-between"
                      >
                        <span className="font-sans font-semibold text-xs text-gray-700 group-hover:text-indigo-600">
                          Add a Subheading
                        </span>
                        <Plus size={14} className="text-gray-400 group-hover:text-indigo-600" />
                      </button>

                      <button
                        onClick={() => handleAddText("body")}
                        className="w-full text-left p-2 rounded-lg border border-gray-200 hover:border-indigo-500 hover:bg-indigo-50/20 transition-all group cursor-pointer flex items-center justify-between"
                      >
                        <span className="font-sans text-[11px] text-gray-500 group-hover:text-indigo-600">
                          Add body descriptive text
                        </span>
                        <Plus size={14} className="text-gray-400 group-hover:text-indigo-600" />
                      </button>
                    </div>
                  </div>

                  {/* Bulk Text Color: Apply to All Texts */}
                  <div className="pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0 flex items-center gap-1">
                        <Palette size={12} className="text-indigo-600" /> All Texts Color
                      </p>
                      <input
                        type="color"
                        defaultValue="#1e3a8a"
                        onChange={(e) => handleApplyColorToAllText(e.target.value)}
                        className="w-5 h-5 rounded cursor-pointer border border-gray-200 p-0"
                        title="Pick custom color to apply to all text elements"
                      />
                    </div>
                    <p className="text-[9px] text-gray-400 mb-2 leading-relaxed">
                      Change the color of all texts at once, or select any text to customize individually.
                    </p>
                    <div className="grid grid-cols-6 gap-1.5">
                      {[
                        { name: "Black", value: "#111827" },
                        { name: "Navy", value: "#1e3a8a" },
                        { name: "ProofDeck Blue", value: "#2563eb" },
                        { name: "Gold", value: "#d97706" },
                        { name: "Emerald", value: "#065f46" },
                        { name: "Burgundy", value: "#881337" },
                        { name: "Charcoal", value: "#334155" },
                        { name: "Purple", value: "#581c87" },
                        { name: "Amber", value: "#b45309" },
                        { name: "Slate", value: "#64748b" },
                        { name: "Light Gray", value: "#94a3b8" },
                        { name: "White", value: "#ffffff" },
                      ].map((swatch) => (
                        <button
                          key={swatch.value}
                          type="button"
                          onClick={() => handleApplyColorToAllText(swatch.value)}
                          className="h-6 rounded border border-gray-200 hover:scale-110 hover:border-indigo-600 transition-all cursor-pointer shadow-2xs"
                          style={{ backgroundColor: swatch.value }}
                          title={`Apply ${swatch.name} to all texts`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Dynamic Certificate Variables */}
                  <div className="pt-3 border-t border-gray-100">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">
                      Certificate Variables
                    </p>
                    <div className="space-y-1">
                      {activePlaceholders.map((p) => (
                        <div
                          key={p.value}
                          onClick={() => handleAddPlaceholder(p)}
                          className="text-[11px] bg-white border border-gray-200 hover:border-indigo-500 hover:shadow-xs text-gray-700 p-2 rounded-lg cursor-pointer transition-all flex items-center justify-between group select-none"
                          title="Click to add to canvas"
                        >
                          <span className="font-semibold group-hover:text-indigo-600">
                            {p.name}
                          </span>
                          <span className="text-[9px] text-gray-400 bg-gray-50 px-1 py-0.5 rounded border border-gray-100 font-mono">
                            {p.value.replace(/[{}]/g, "")}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Custom Fields */}
                  <div className="pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                        Custom Fields
                      </span>
                      <span className="text-[8px] text-indigo-600 font-bold">
                        + Dynamic
                      </span>
                    </div>
                    <div className="flex gap-1 mb-2">
                      <input
                        type="text"
                        placeholder="e.g. Dean Signature"
                        value={newVarName}
                        onChange={(e) => setNewVarName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddCustomVariable();
                          }
                        }}
                        className="flex-1 px-2 py-1 text-[11px] border border-gray-200 rounded focus:outline-none focus:border-indigo-500 bg-white"
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomVariable}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-1 rounded text-xs font-bold transition-all shrink-0 cursor-pointer"
                        title="Add Custom Variable"
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    {customVariables.length > 0 && (
                      <div className="space-y-1">
                        {customVariables.map((cv) => (
                          <div
                            key={cv.value}
                            onClick={() => handleAddPlaceholder(cv)}
                            className="text-[11px] bg-white border border-gray-200 hover:border-indigo-500 text-gray-700 p-2 rounded-lg cursor-pointer transition-all flex items-center justify-between group"
                          >
                            <span className="font-semibold group-hover:text-indigo-600">
                              {cv.name}
                            </span>
                            <span className="text-[9px] text-gray-400 font-mono">
                              {cv.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : leftTab === "elements" ? (
                /* TAB 2: SHAPES & ELEMENTS */
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">
                      Basic Shapes
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleAddShape("rect")}
                        className="p-3 rounded-xl border border-gray-200 hover:border-indigo-500 hover:bg-indigo-50/20 transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer group"
                      >
                        <Square size={24} className="text-indigo-600 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-bold text-gray-700">Rectangle</span>
                      </button>

                      <button
                        onClick={() => handleAddShape("circle")}
                        className="p-3 rounded-xl border border-gray-200 hover:border-indigo-500 hover:bg-indigo-50/20 transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer group"
                      >
                        <CircleIcon size={24} className="text-amber-500 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-bold text-gray-700">Circle / Seal</span>
                      </button>

                      <button
                        onClick={() => handleAddShape("line")}
                        className="p-3 rounded-xl border border-gray-200 hover:border-indigo-500 hover:bg-indigo-50/20 transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer group"
                      >
                        <Minus size={24} className="text-gray-700 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-bold text-gray-700">Divider Line</span>
                      </button>

                      <button
                        onClick={() => handleAddShape("star")}
                        className="p-3 rounded-xl border border-gray-200 hover:border-indigo-500 hover:bg-indigo-50/20 transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer group"
                      >
                        <StarIcon size={24} className="text-amber-500 fill-amber-400 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-bold text-gray-700">Award Star</span>
                      </button>
                    </div>
                  </div>

                  {/* Certificate Badges & Accents */}
                  <div className="pt-3 border-t border-gray-100">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">
                      Accents & Badges
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleAddShape("badge")}
                        className="p-3 rounded-xl border border-gray-200 hover:border-indigo-500 hover:bg-indigo-50/20 transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer group"
                      >
                        <Award size={26} className="text-amber-600 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-bold text-gray-700">Rosette Badge</span>
                      </button>

                      <button
                        onClick={() => handleAddShape("border")}
                        className="p-3 rounded-xl border border-gray-200 hover:border-indigo-500 hover:bg-indigo-50/20 transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer group"
                      >
                        <Layout size={24} className="text-indigo-700 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-bold text-gray-700">Border Frame</span>
                      </button>
                    </div>
                  </div>

                  <p className="text-[9px] text-gray-400 leading-normal bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                    Click any element to customize fill colors, border outlines, corner curves, and layer ordering.
                  </p>
                </div>
              ) : leftTab === "background" ? (
                /* TAB 3: CANVAS & IMPORT CERT TEMPLATE */
                <div className="space-y-4">
                  {/* Dedicated Import Your Own Cert Template Card */}
                  <div className="p-3 rounded-xl border-2 border-indigo-100 bg-gradient-to-b from-indigo-50/60 to-white space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold text-indigo-700 uppercase tracking-wider flex items-center gap-1">
                        <FileUp size={12} /> Import Your Cert Template
                      </span>
                      {templateImageUrl && (
                        <span className="text-[8px] font-bold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full">
                          Active
                        </span>
                      )}
                    </div>

                    {templateImageUrl ? (
                      <div className="space-y-2">
                        <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-white shadow-2xs">
                          <img
                            src={templateImageUrl}
                            alt="Imported Certificate Template"
                            className="w-full h-24 object-contain bg-slate-50"
                          />
                        </div>
                        {importedTemplateMeta && (
                          <p className="text-[9px] text-gray-500 truncate mb-0">
                            <strong className="text-gray-700">{importedTemplateMeta.name}</strong> ({importedTemplateMeta.width}×{importedTemplateMeta.height}px)
                          </p>
                        )}
                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="py-1.5 px-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                          >
                            <UploadCloud size={11} /> Replace
                          </button>
                          <button
                            type="button"
                            onClick={handleRemoveImportedTemplate}
                            className="py-1.5 px-2 bg-white hover:bg-red-50 text-red-600 border border-red-200 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                          >
                            <Trash2 size={11} /> Remove
                          </button>
                        </div>

                        {importedTemplateMeta?.aspectRatio && (
                          <div className="grid grid-cols-2 gap-1 pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                const h = Math.max(300, Math.min(1400, Math.round(842 / importedTemplateMeta.aspectRatio)));
                                setCanvasSize({ width: 842, height: h });
                                toast.success("Matched canvas to your template's exact aspect ratio!");
                              }}
                              className="py-1 px-1.5 bg-gray-100 hover:bg-indigo-50 text-gray-700 hover:text-indigo-700 rounded text-[9px] font-semibold cursor-pointer transition-colors"
                            >
                              Fit Image Ratio
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setCanvasSize({ width: 842, height: 595 });
                                toast.success("Set canvas to standard A4 Landscape (842×595)");
                              }}
                              className="py-1 px-1.5 bg-gray-100 hover:bg-indigo-50 text-gray-700 hover:text-indigo-700 rounded text-[9px] font-semibold cursor-pointer transition-colors"
                            >
                              Fit A4 Landscape
                            </button>
                          </div>
                        )}

                        {/* Quick-Drop Variables for Imported Certs */}
                        <div className="pt-2 border-t border-indigo-100">
                          <span className="text-[9px] font-bold text-indigo-700 block mb-1.5">
                            Quick-Drop Variables onto Template:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {CERTIFICATE_PLACEHOLDERS.map((p) => (
                              <button
                                key={p.value}
                                type="button"
                                onClick={() => handleAddPlaceholder(p)}
                                className="text-[9px] bg-white hover:bg-indigo-600 text-indigo-700 hover:text-white border border-indigo-200 px-1.5 py-0.5 rounded font-semibold transition-colors cursor-pointer"
                              >
                                + {p.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsDraggingTemplate(true);
                        }}
                        onDragLeave={() => setIsDraggingTemplate(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setIsDraggingTemplate(false);
                          const droppedFile = e.dataTransfer.files?.[0];
                          if (droppedFile) processCertTemplateFile(droppedFile);
                        }}
                        onClick={() => fileInputRef.current?.click()}
                        className={`p-3.5 border-2 border-dashed rounded-xl text-center cursor-pointer transition-all group ${
                          isDraggingTemplate
                            ? "border-indigo-600 bg-indigo-50"
                            : "border-indigo-300 hover:border-indigo-600 bg-white hover:bg-indigo-50/30"
                        }`}
                      >
                        <FileUp size={20} className="text-indigo-500 group-hover:scale-110 transition-transform mx-auto mb-1" />
                        <span className="text-[11px] font-bold text-gray-800 block">
                          Import Your Own Cert Design
                        </span>
                        <span className="text-[9px] text-gray-500 block mt-0.5">
                          Drag & drop or click to upload PNG, JPG, WEBP
                        </span>
                        <span className="text-[8px] text-indigo-600 font-semibold block mt-1">
                          Auto-fits canvas & keeps your dynamic variables
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Canvas Format Presets */}
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">
                      Canvas Format & Size
                    </p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {CANVAS_SIZE_PRESETS.map((p) => {
                        const isCurrent = canvasSize.width === p.width && canvasSize.height === p.height;
                        return (
                          <button
                            key={p.name}
                            onClick={() => {
                              setCanvasSize({ width: p.width, height: p.height });
                              handleFitScreen();
                            }}
                            className={`p-2 rounded-lg border text-left cursor-pointer transition-all ${
                              isCurrent
                                ? "bg-indigo-50 border-indigo-600 text-indigo-700 font-bold shadow-xs"
                                : "bg-white border-gray-200 hover:bg-gray-50 text-gray-700"
                            }`}
                          >
                            <span className="text-[10px] block">{p.name}</span>
                            <span className="text-[8px] text-gray-400 block font-mono">
                              {p.width} × {p.height}px
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Solid Canvas Colors */}
                  <div className="pt-3 border-t border-gray-100">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0">
                        Canvas Color
                      </p>
                      <input
                        type="color"
                        value={backgroundConfig.fill || "#ffffff"}
                        onChange={(e) => setBackgroundConfig((prev) => ({ ...prev, fill: e.target.value }))}
                        className="w-5 h-5 rounded cursor-pointer border border-gray-200 p-0"
                        title="Custom Color"
                      />
                    </div>
                    <div className="grid grid-cols-5 gap-1.5">
                      {LUXURY_COLORS.map((c) => (
                        <button
                          key={c.value}
                          onClick={() => setBackgroundConfig((prev) => ({ ...prev, fill: c.value }))}
                          className={`h-7 rounded-lg border transition-all hover:scale-105 cursor-pointer relative ${
                            backgroundConfig.fill === c.value
                              ? "border-indigo-600 ring-2 ring-indigo-200"
                              : "border-gray-200"
                          }`}
                          style={{ backgroundColor: c.value }}
                          title={c.name}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Built-in Decorative Border Frame */}
                  <div className="pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0">
                        Ornate Border Frame
                      </p>
                      <input
                        type="checkbox"
                        checked={backgroundConfig.border}
                        onChange={(e) => setBackgroundConfig((prev) => ({ ...prev, border: e.target.checked }))}
                        className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                      />
                    </div>
                    {backgroundConfig.border && (
                      <div className="space-y-2 p-2 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] text-gray-600 font-semibold">Border Color</span>
                          <input
                            type="color"
                            value={backgroundConfig.borderColor || "#1e3a8a"}
                            onChange={(e) => setBackgroundConfig((prev) => ({ ...prev, borderColor: e.target.value }))}
                            className="w-5 h-5 rounded border border-gray-200 cursor-pointer p-0"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] text-gray-600 font-semibold">Gold Accent</span>
                          <input
                            type="color"
                            value={backgroundConfig.borderAccent || "#d97706"}
                            onChange={(e) => setBackgroundConfig((prev) => ({ ...prev, borderAccent: e.target.value }))}
                            className="w-5 h-5 rounded border border-gray-200 cursor-pointer p-0"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Preset Background Library */}
                  <div className="pt-3 border-t border-gray-100">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">
                      Built-in Frame Presets
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {PRESET_TEMPLATES.map((preset) => (
                        <div
                          key={preset.name}
                          onClick={() => handleSelectPreset(preset)}
                          className="border border-gray-200 hover:border-indigo-500 rounded-lg overflow-hidden cursor-pointer group transition-all"
                        >
                          <div
                            className="aspect-[1.414/1] bg-cover bg-center"
                            style={{ backgroundImage: `url("${preset.url}")` }}
                          />
                          <p className="text-[9px] font-bold p-1 text-center text-gray-600 group-hover:text-indigo-600 truncate">
                            {preset.name}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : leftTab === "uploads" ? (
                /* TAB 4: UPLOADS (CERT TEMPLATES & LOGOS) */
                <div className="space-y-4">
                  {/* 1. Dedicated Import Your Cert Template Section */}
                  <div className="p-3 rounded-xl border-2 border-indigo-100 bg-indigo-50/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] text-indigo-700 font-extrabold uppercase tracking-wider mb-0 flex items-center gap-1">
                        <FileUp size={12} /> 1. Import Cert Template
                      </p>
                      {templateImageUrl && (
                        <span className="text-[8px] font-bold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full">
                          Loaded
                        </span>
                      )}
                    </div>
                    <p className="text-[9px] text-gray-500 leading-relaxed mb-1">
                      Have a ready-made certificate design from Canva, Figma, or Photoshop? Import it here as your full certificate base.
                    </p>

                    {templateImageUrl ? (
                      <div className="space-y-2">
                        <img
                          src={templateImageUrl}
                          alt="Current Certificate Template"
                          className="w-full h-20 object-contain bg-white rounded-lg border border-gray-200 p-1"
                        />
                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="py-1.5 px-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-bold cursor-pointer transition-colors"
                          >
                            Replace Template
                          </button>
                          <button
                            type="button"
                            onClick={handleRemoveImportedTemplate}
                            className="py-1.5 px-2 bg-white hover:bg-red-50 text-red-600 border border-red-200 rounded-lg text-[10px] font-bold cursor-pointer transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="p-3.5 border-2 border-dashed border-indigo-300 hover:border-indigo-600 bg-white rounded-xl text-center cursor-pointer hover:bg-indigo-50/30 transition-all group"
                      >
                        <FileUp size={20} className="text-indigo-500 group-hover:scale-110 transition-transform mx-auto mb-1" />
                        <span className="text-[11px] font-bold text-gray-800 block">
                          Upload Full Cert Template
                        </span>
                        <span className="text-[8px] text-gray-400">
                          PNG, JPG, WEBP (Auto-optimizes & prevents 413 errors)
                        </span>
                      </div>
                    )}
                  </div>

                  {/* 2. Upload Logos, Stamps & Signatures */}
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">
                      2. Logos, Seals & Signatures
                    </p>
                    <p className="text-[9px] text-gray-400 mb-2">
                      Add movable overlay graphics (company logo, stamp, signature PNG) on top of your certificate.
                    </p>
                    <div
                      onClick={() => assetInputRef.current?.click()}
                      className="p-4 border-2 border-dashed border-gray-200 hover:border-indigo-500 rounded-xl text-center cursor-pointer hover:bg-indigo-50/20 transition-all group"
                    >
                      <ImageIcon size={22} className="text-gray-400 group-hover:text-indigo-600 mx-auto mb-1.5" />
                      <span className="text-[11px] font-bold text-gray-700 block">Upload Logo / Stamp</span>
                      <span className="text-[8px] text-gray-400">PNG, JPG, WEBP, or SVG (Transparent PNG recommended)</span>
                    </div>
                  </div>

                  {uploadedAssets.length > 0 && (
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">
                        Uploaded Overlay Assets
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {uploadedAssets.map((asset, idx) => (
                          <div
                            key={idx}
                            onClick={() => handleAddImageToCanvas(asset.src, asset.width, asset.height)}
                            className="p-2 border border-gray-200 hover:border-indigo-500 rounded-lg bg-gray-50 hover:bg-white cursor-pointer transition-all text-center group"
                            title="Click to insert on canvas"
                          >
                            <img src={asset.src} alt={asset.name} className="h-12 max-w-full mx-auto object-contain mb-1" />
                            <span className="text-[8px] font-semibold text-gray-600 truncate block">
                              + Add to Canvas
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* TAB 5: LAYERS */
                <div className="space-y-2">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0">
                      Layers Stack ({elements.length})
                    </p>
                    {elements.length > 0 && (
                      <button
                        type="button"
                        onClick={handleClearAllLayers}
                        className="text-[10px] font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-0.5 rounded border border-red-200 transition-colors flex items-center gap-1 cursor-pointer"
                        title="Clear all layers from canvas"
                      >
                        <Trash2 size={11} /> Clear All
                      </button>
                    )}
                  </div>
                  {elements.length === 0 ? (
                    <div className="text-center py-8 border border-dashed border-gray-200 rounded-lg p-3">
                      <Layers size={22} className="text-gray-300 mx-auto mb-1.5" />
                      <p className="text-[11px] font-medium text-gray-500 mb-0.5">No layers on canvas</p>
                      <p className="text-[9px] text-gray-400 mb-0">Add text or variables from the left tools</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {[...elements].reverse().map((el) => {
                        const isSelected = selectedId === el.id;
                        const isHidden = el.visible === false;
                        const isLocked = !!el.locked;
                        const label = el.isQr
                          ? "QR Code"
                          : el.text
                          ? el.text.replace(/[{}]/g, "")
                          : el.type
                          ? el.type.toUpperCase()
                          : "Element";

                        return (
                          <div
                            key={el.id}
                            onClick={() => {
                              setSelectedId(el.id);
                              setIsRightSidebarOpen(true);
                            }}
                            className={`flex items-center justify-between p-2 rounded-lg border text-[11px] cursor-pointer transition-all ${
                              isSelected
                                ? "bg-indigo-50 border-indigo-300 text-indigo-700 font-semibold shadow-xs"
                                : isHidden
                                ? "bg-gray-50 border-gray-200 text-gray-400 opacity-60"
                                : "bg-white border-gray-200 hover:bg-gray-50 text-gray-700"
                            }`}
                          >
                            <span className="truncate flex-1 pr-2 select-none flex items-center gap-1.5">
                              {isLocked && <Lock size={10} className="text-amber-600 shrink-0" />}
                              <span className="truncate">{label}</span>
                            </span>
                            <div className="flex items-center gap-0.5 shrink-0">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const idx = elements.findIndex((item) => item.id === el.id);
                                  if (idx < elements.length - 1) {
                                    const copy = [...elements];
                                    const [item] = copy.splice(idx, 1);
                                    copy.splice(idx + 1, 0, item);
                                    setElements(copy);
                                  }
                                }}
                                className="text-gray-400 hover:text-indigo-600 p-0.5 cursor-pointer"
                                title="Move Forward"
                              >
                                <ArrowUp size={11} />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const idx = elements.findIndex((item) => item.id === el.id);
                                  if (idx > 0) {
                                    const copy = [...elements];
                                    const [item] = copy.splice(idx, 1);
                                    copy.splice(idx - 1, 0, item);
                                    setElements(copy);
                                  }
                                }}
                                className="text-gray-400 hover:text-indigo-600 p-0.5 cursor-pointer"
                                title="Move Backward"
                              >
                                <ArrowDown size={11} />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setElements(
                                    elements.map((item) =>
                                      item.id === el.id ? { ...item, locked: !item.locked } : item
                                    )
                                  );
                                }}
                                className={`p-0.5 cursor-pointer ${
                                  isLocked ? "text-amber-600" : "text-gray-400 hover:text-gray-700"
                                }`}
                                title={isLocked ? "Unlock Layer" : "Lock Layer"}
                              >
                                {isLocked ? <Lock size={11} /> : <Unlock size={11} />}
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setElements(
                                    elements.map((item) =>
                                      item.id === el.id
                                        ? { ...item, visible: item.visible === false ? true : false }
                                        : item
                                    )
                                  );
                                }}
                                className={`p-0.5 cursor-pointer ${
                                  isHidden ? "text-gray-400" : "text-gray-400 hover:text-gray-700"
                                }`}
                                title={isHidden ? "Show Layer" : "Hide Layer"}
                              >
                                {isHidden ? <EyeOff size={11} /> : <Eye size={11} />}
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setElements(elements.filter((item) => item.id !== el.id));
                                  if (selectedId === el.id) setSelectedId(null);
                                }}
                                className="text-gray-400 hover:text-red-600 transition-colors p-0.5 cursor-pointer"
                                title="Delete"
                              >
                                <Trash2 size={11} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </aside>
        )}

        {/* 2. CENTER AREA: Canvas Viewport */}
        <main className="flex-1 bg-slate-200/70 dark:bg-[#121214] flex flex-col overflow-hidden relative">
          {/* Canvas Sub-Header & Zoom Bar */}
          <div className="bg-white dark:bg-[#18181b] border-b border-gray-200 dark:border-[#28282d] px-4 py-1.5 flex items-center justify-between z-10 shadow-xs">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)}
                className={`p-1 rounded hover:bg-gray-100 text-gray-500 transition-colors border cursor-pointer ${
                  isLeftSidebarOpen ? "border-transparent" : "border-gray-200 bg-gray-50"
                }`}
                title={isLeftSidebarOpen ? "Collapse Left Panel" : "Expand Left Panel"}
              >
                {isLeftSidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
              </button>
              <span className="text-[10px] font-semibold text-gray-500">
                Canvas: {canvasSize.width} × {canvasSize.height} px
              </span>
              {templateImageUrl && (
                <span className="text-[9px] font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200 hidden sm:inline-flex items-center gap-1">
                  <Check size={10} /> Custom Cert Template Active
                </span>
              )}
            </div>

            {/* Quick Actions if element selected */}
            {selectedElement && (
              <div className="flex items-center gap-1 bg-indigo-50/80 px-2.5 py-0.5 rounded-full border border-indigo-200 text-[10px] text-indigo-700 font-semibold animate-in fade-in duration-150">
                <span className="mr-1">Selected: {selectedElement.type || "Element"}</span>
                <button
                  type="button"
                  onClick={() => {
                    const elW = selectedElement.width || 100;
                    setElements((prev) =>
                      prev.map((el) =>
                        el.id === selectedId
                          ? { ...el, x: Math.round((canvasSize.width - elW) / 2) }
                          : el
                      )
                    );
                  }}
                  className="hover:bg-indigo-100 hover:text-indigo-900 p-1 rounded cursor-pointer"
                  title="Center Horizontally on Canvas"
                >
                  <AlignHorizontalSpaceAround size={12} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const elH = selectedElement.height || 36;
                    setElements((prev) =>
                      prev.map((el) =>
                        el.id === selectedId
                          ? { ...el, y: Math.round((canvasSize.height - elH) / 2) }
                          : el
                      )
                    );
                  }}
                  className="hover:bg-indigo-100 hover:text-indigo-900 p-1 rounded cursor-pointer"
                  title="Center Vertically on Canvas"
                >
                  <AlignVerticalSpaceAround size={12} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setElements((prev) =>
                      prev.map((el) =>
                        el.id === selectedId ? { ...el, locked: !el.locked } : el
                      )
                    );
                  }}
                  className={`p-1 rounded cursor-pointer ${
                    selectedElement.locked
                      ? "bg-amber-100 text-amber-700"
                      : "hover:bg-indigo-100 hover:text-indigo-900"
                  }`}
                  title={selectedElement.locked ? "Unlock Element" : "Lock Element"}
                >
                  {selectedElement.locked ? <Lock size={11} /> : <Unlock size={11} />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const clone = {
                      ...selectedElement,
                      id: `el_${Math.random().toString(36).substring(2, 9)}`,
                      x: selectedElement.x + 20,
                      y: selectedElement.y + 20,
                      locked: false,
                    };
                    setElements((prev) => [...prev, clone]);
                    setSelectedId(clone.id);
                  }}
                  className="hover:bg-indigo-100 hover:text-indigo-900 p-1 rounded cursor-pointer"
                  title="Duplicate (Ctrl+D)"
                >
                  <Copy size={11} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setElements((prev) => prev.filter((el) => el.id !== selectedId));
                    setSelectedId(null);
                  }}
                  className="hover:bg-red-100 hover:text-red-600 p-1 rounded cursor-pointer"
                  title="Delete (Del)"
                >
                  <Trash2 size={11} />
                </button>
              </div>
            )}

            {/* Zoom Controls */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  setZoomScale(Math.max(0.25, zoomScale - 0.1));
                  setZoomMode("manual");
                }}
                className="p-1 hover:bg-gray-100 rounded text-gray-500 transition-colors cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut size={13} />
              </button>

              <div className="relative flex items-center">
                <select
                  value={zoomMode === "fit" ? "fit" : Math.round(zoomScale * 100)}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "fit") {
                      setZoomMode("fit");
                      handleFitScreen();
                    } else {
                      setZoomScale(parseInt(val, 10) / 100);
                      setZoomMode("manual");
                    }
                  }}
                  className="text-[10px] font-bold text-gray-600 border border-gray-200 rounded pl-1.5 pr-4 py-0.5 bg-white cursor-pointer focus:outline-none h-6 appearance-none"
                >
                  <option value="fit">Fit Screen</option>
                  {[50, 75, 100, 125, 150].map((v) => (
                    <option key={v} value={v}>
                      {v}%
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 text-[7px]">
                  ▼
                </span>
              </div>

              <button
                onClick={() => {
                  setZoomScale(Math.min(2.0, zoomScale + 0.1));
                  setZoomMode("manual");
                }}
                className="p-1 hover:bg-gray-100 rounded text-gray-500 transition-colors cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn size={13} />
              </button>

              <button
                onClick={() => {
                  setZoomMode("fit");
                  handleFitScreen();
                }}
                className={`p-1 hover:bg-gray-100 rounded transition-colors border flex items-center gap-1 px-1.5 h-6 cursor-pointer ${
                  zoomMode === "fit"
                    ? "bg-indigo-50 border-indigo-200 text-indigo-600 font-bold"
                    : "bg-white border-gray-200 text-gray-500"
                }`}
                title="Fit Canvas to Workspace"
              >
                <Maximize2 size={11} />
                <span className="text-[9px]">Fit</span>
              </button>

              <div className="h-4 w-px bg-gray-200 mx-0.5" />

              <button
                type="button"
                onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
                className={`p-1 rounded hover:bg-gray-100 text-gray-500 transition-colors border cursor-pointer ${
                  isRightSidebarOpen ? "border-transparent" : "border-gray-200 bg-gray-50"
                }`}
                title={isRightSidebarOpen ? "Collapse Right Panel" : "Expand Right Panel"}
              >
                {isRightSidebarOpen ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
              </button>
            </div>
          </div>

          {/* Live Sample Data Preview Bar (when previewMode is active) */}
          {previewMode && (
            <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-1.5 flex flex-wrap items-center justify-between gap-2 z-10 text-xs">
              <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                <Eye size={13} />
                <span>Live Sample Data Preview:</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <label className="flex items-center gap-1 text-[10px] text-emerald-700 font-semibold">
                  Recipient:
                  <input
                    type="text"
                    value={sampleData.recipient_name}
                    onChange={(e) =>
                      setSampleData((prev) => ({ ...prev, recipient_name: e.target.value }))
                    }
                    className="px-2 py-0.5 bg-white border border-emerald-300 rounded text-[11px] text-gray-800 w-36 focus:outline-none focus:border-emerald-600"
                  />
                </label>
                <label className="flex items-center gap-1 text-[10px] text-emerald-700 font-semibold">
                  Course:
                  <input
                    type="text"
                    value={sampleData.course_title}
                    onChange={(e) =>
                      setSampleData((prev) => ({ ...prev, course_title: e.target.value }))
                    }
                    className="px-2 py-0.5 bg-white border border-emerald-300 rounded text-[11px] text-gray-800 w-44 focus:outline-none focus:border-emerald-600"
                  />
                </label>
                <label className="flex items-center gap-1 text-[10px] text-emerald-700 font-semibold">
                  Date:
                  <input
                    type="text"
                    value={sampleData.issue_date}
                    onChange={(e) =>
                      setSampleData((prev) => ({ ...prev, issue_date: e.target.value }))
                    }
                    className="px-2 py-0.5 bg-white border border-emerald-300 rounded text-[11px] text-gray-800 w-28 focus:outline-none focus:border-emerald-600"
                  />
                </label>
              </div>
            </div>
          )}

          {/* Interactive Workspace Area */}
          <div
            ref={workspaceRef}
            className="flex-grow overflow-auto p-8 flex items-center justify-center relative"
          >
            <CustomTemplateEditor
              stageRef={stageRef}
              backgroundImageUrl={templateImageUrl}
              backgroundConfig={backgroundConfig}
              elements={elements}
              setElements={setElements}
              selectedId={selectedId}
              setSelectedId={(id) => {
                setSelectedId(id);
                if (id) setIsRightSidebarOpen(true);
              }}
              canvasSize={canvasSize}
              showGrid={showGrid}
              zoomScale={zoomScale}
              previewMode={previewMode}
              sampleData={sampleData}
              onUndo={handleUndo}
              onRedo={handleRedo}
            />
          </div>
        </main>

        {/* 3. RIGHT SIDEBAR: Properties Inspector */}
        {isRightSidebarOpen && (
          <aside className="w-72 bg-white dark:bg-[#18181b] border-l border-gray-200 dark:border-[#28282d] flex flex-col shrink-0 overflow-y-auto animate-in slide-in-from-right duration-200 shadow-sm">
            <div className="p-3 border-b border-gray-100 dark:border-[#28282d] flex items-center gap-1.5 bg-gray-50/70 dark:bg-[#141417]">
              <Settings size={14} className="text-gray-500 dark:text-zinc-400" />
              <h4 className="text-xs font-bold text-gray-800 dark:text-white uppercase tracking-wider">
                {selectedElement ? "Element Inspector" : "Studio Inspector"}
              </h4>
            </div>

            <div className="flex-grow p-3">
              {selectedElement ? (
                <TextElementControls
                  element={selectedElement}
                  canvasSize={canvasSize}
                  onUpdate={(updatedAttrs) => {
                    if (updatedAttrs.arrange) {
                      const action = updatedAttrs.arrange;
                      let newElements = [...elements];
                      const index = newElements.findIndex((el) => el.id === selectedId);
                      if (index !== -1) {
                        const item = newElements[index];
                        newElements.splice(index, 1);
                        if (action === "front") {
                          newElements.push(item);
                        } else if (action === "back") {
                          newElements.unshift(item);
                        } else if (action === "forward") {
                          const targetIndex = Math.min(newElements.length, index + 1);
                          newElements.splice(targetIndex, 0, item);
                        } else if (action === "backward") {
                          const targetIndex = Math.max(0, index - 1);
                          newElements.splice(targetIndex, 0, item);
                        }
                        setElements(newElements);
                      }
                      return;
                    }
                    const updatedElements = elements.map((el) =>
                      el.id === selectedId ? { ...el, ...updatedAttrs } : el
                    );
                    setElements(updatedElements);
                  }}
                  onDuplicate={() => {
                    const clone = {
                      ...selectedElement,
                      id: `el_${Math.random().toString(36).substring(2, 9)}`,
                      x: (selectedElement.x || 0) + 20,
                      y: (selectedElement.y || 0) + 20,
                      locked: false,
                    };
                    setElements((prev) => [...prev, clone]);
                    setSelectedId(clone.id);
                    toast.success("Duplicated element");
                  }}
                  onConvertToTemplate={handleConvertElementToTemplate}
                  onDelete={() => {
                    setElements(elements.filter((el) => el.id !== selectedId));
                    setSelectedId(null);
                  }}
                  onDone={() => setSelectedId(null)}
                />
              ) : (
                <div className="space-y-4">
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-center">
                    <Shapes size={24} className="mx-auto text-indigo-500 mb-1.5 opacity-80" />
                    <p className="text-xs font-bold text-gray-700">Canvas Selected</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      Click any element to inspect its properties, or use the controls below to style the canvas background.
                    </p>
                  </div>

                  {/* Canvas Quick Palette */}
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                      Canvas Color
                    </span>
                    <div className="grid grid-cols-5 gap-1.5">
                      {LUXURY_COLORS.map((c) => (
                        <button
                          key={c.value}
                          onClick={() => setBackgroundConfig((prev) => ({ ...prev, fill: c.value }))}
                          className={`h-7 rounded border transition-all cursor-pointer ${
                            backgroundConfig.fill === c.value
                              ? "border-indigo-600 ring-2 ring-indigo-200"
                              : "border-gray-200"
                          }`}
                          style={{ backgroundColor: c.value }}
                          title={c.name}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Border Frame Toggle */}
                  <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-gray-700">Certificate Border Frame</span>
                      <input
                        type="checkbox"
                        checked={backgroundConfig.border}
                        onChange={(e) => setBackgroundConfig((prev) => ({ ...prev, border: e.target.checked }))}
                        className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                      />
                    </div>
                    {backgroundConfig.border && (
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[9px] text-gray-500">Border Accent</span>
                        <input
                          type="color"
                          value={backgroundConfig.borderColor || "#1e3a8a"}
                          onChange={(e) => setBackgroundConfig((prev) => ({ ...prev, borderColor: e.target.value }))}
                          className="w-5 h-5 rounded cursor-pointer p-0"
                        />
                      </div>
                    )}
                  </div>

                  {/* Add Elements Shortcut */}
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                      Quick Add
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        onClick={() => handleAddText("heading")}
                        className="p-2 bg-white border border-gray-200 hover:border-indigo-500 rounded-lg text-xs font-semibold text-gray-700 hover:text-indigo-600 transition-all text-left cursor-pointer"
                      >
                        + Heading
                      </button>
                      <button
                        onClick={() => handleAddShape("rect")}
                        className="p-2 bg-white border border-gray-200 hover:border-indigo-500 rounded-lg text-xs font-semibold text-gray-700 hover:text-indigo-600 transition-all text-left cursor-pointer"
                      >
                        + Rectangle
                      </button>
                      <button
                        onClick={() => handleAddShape("line")}
                        className="p-2 bg-white border border-gray-200 hover:border-indigo-500 rounded-lg text-xs font-semibold text-gray-700 hover:text-indigo-600 transition-all text-left cursor-pointer"
                      >
                        + Divider Line
                      </button>
                      <button
                        onClick={() => handleAddShape("badge")}
                        className="p-2 bg-white border border-gray-200 hover:border-indigo-500 rounded-lg text-xs font-semibold text-gray-700 hover:text-indigo-600 transition-all text-left cursor-pointer"
                      >
                        + Rosette Seal
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </aside>
        )}
      </div>

      {/* In-App Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl max-w-sm w-full p-5 shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-3.5 mb-4">
              <div className="p-2.5 rounded-full bg-red-50 text-red-600 shrink-0">
                <Trash2 size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-1">{confirmModal.title}</h3>
                <p className="text-xs text-gray-500 mb-0 leading-relaxed">{confirmModal.message}</p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setConfirmModal({ isOpen: false, title: "", message: "", confirmButtonText: "Confirm", onConfirm: null })}
                className="px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirmModal.onConfirm) confirmModal.onConfirm();
                  setConfirmModal({ isOpen: false, title: "", message: "", confirmButtonText: "Confirm", onConfirm: null });
                }}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-xs cursor-pointer"
              >
                {confirmModal.confirmButtonText || "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadTemplatePage;
