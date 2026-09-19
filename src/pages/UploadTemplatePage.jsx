import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  const [templateTitle, setTemplateTitle] = useState(templateId ? "" : "Untitled Certificate");
  const [templateType, setTemplateType] = useState("certificate");
  const [templateImageFile, setTemplateImageFile] = useState(null);
  const [templateImageUrl, setTemplateImageUrl] = useState(null);
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
  const [leftTab, setLeftTab] = useState("text"); // 'text', 'elements', 'background', 'uploads', 'layers'
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);

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

  const handleUndo = () => {
    if (currentStep > 0) {
      setIsLoadingHistory(true);
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      setElements(history[prevStep]);
    }
  };

  const handleRedo = () => {
    if (currentStep < history.length - 1) {
      setIsLoadingHistory(true);
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      setElements(history[nextStep]);
    }
  };

  // --- Add Text Elements (Heading, Subheading, Body, Variable) ---
  const handleAddText = (kind) => {
    const cx = Math.round(canvasSize.width / 2);
    const cy = Math.round(canvasSize.height / 2);

    let newEl = {
      id: `el_text_${Math.random().toString(36).substring(2, 9)}`,
      type: "text",
      rotation: 0,
      opacity: 1,
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
      x: isQr ? cx - 35 : Math.max(20, cx - defaultWidth / 2),
      y: isQr ? cy - 35 : Math.max(20, cy - 15),
      width: isQr ? 70 : defaultWidth,
      height: isQr ? 70 : 32,
      fontSize: 20,
      fontFamily: "Georgia",
      fill: "#111827",
      align: isQr ? "center" : "left",
      fontStyle: isQr ? "normal" : "bold",
      rotation: 0,
      verticalAlign: "middle",
      isQr,
    };

    setElements((prev) => [...prev, newElement]);
    setSelectedId(newElement.id);
    setIsRightSidebarOpen(true);
  };

  // --- Add Custom Uploaded Image to Canvas ---
  const handleAddImageToCanvas = (imgSrc) => {
    const cx = Math.round(canvasSize.width / 2);
    const cy = Math.round(canvasSize.height / 2);
    const newEl = {
      id: `el_img_${Math.random().toString(36).substring(2, 9)}`,
      type: "image",
      src: imgSrc,
      x: cx - 60,
      y: cy - 60,
      width: 120,
      height: 120,
      rotation: 0,
      opacity: 1,
    };
    setElements((prev) => [...prev, newEl]);
    setSelectedId(newEl.id);
    setIsRightSidebarOpen(true);
  };

  // Handle uploading logo / graphic / seal
  const handleAssetUpload = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === "image/png" || file.type === "image/jpeg" || file.type === "image/webp")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const src = event.target.result;
        setUploadedAssets((prev) => [...prev, { name: file.name, src }]);
        handleAddImageToCanvas(src);
        toast.success(`Added "${file.name}" to canvas!`);
      };
      reader.readAsDataURL(file);
    } else {
      toast.error("Please upload a PNG, JPG, or WEBP image.");
    }
  };

  // Handle uploading full background
  const handleBackgroundUpload = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === "image/png" || file.type === "image/jpeg")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const aspectRatio = img.width / img.height;
          const canvasWidth = 842;
          const canvasHeight = Math.round(canvasWidth / aspectRatio);
          setCanvasSize({ width: canvasWidth, height: canvasHeight });
          setTemplateImageUrl(event.target.result);
          setTemplateImageFile(file);
          toast.success("Background uploaded!");
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    } else {
      toast.error("Please upload a PNG or JPG image.");
    }
  };

  const handleSelectPreset = (preset) => {
    setTemplateImageUrl(preset.url);
    setTemplateImageFile(null);
    if (preset.canvasSize) {
      setCanvasSize(preset.canvasSize);
    }
    toast.success(`Applied ${preset.name}`);
  };

  const handleClearCanvas = () => {
    if (window.confirm("Are you sure you want to clear the canvas and start completely blank?")) {
      setElements([]);
      setSelectedId(null);
      setTemplateImageUrl(null);
      setTemplateImageFile(null);
      setBackgroundConfig({
        fill: "#ffffff",
        border: false,
        borderColor: "#1e3a8a",
        borderAccent: "#d97706",
        borderWidth: 4,
      });
      toast.success("Canvas cleared. Start designing from scratch!");
    }
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
      return toast.error("Please add at least one element to your design.");
    }

    setIsSubmitting(true);
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
        image: templateImageUrl || null,
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
      })),
    };

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
      layoutData.background.image = relativePath;
    }

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
              className="text-sm font-bold text-gray-800 border-none focus:ring-0 placeholder-gray-400 bg-transparent w-64 hover:bg-gray-50 px-1.5 py-0.5 rounded transition-colors"
            />
          </div>
        </div>

        {/* Studio Toolbar */}
        <div className="flex items-center gap-2">
          {/* Document Type Selector */}
          <div className="bg-gray-100 p-0.5 rounded-lg flex text-xs font-semibold mr-1 border border-gray-200/60">
            <button
              onClick={() => setTemplateType("certificate")}
              className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
                templateType === "certificate"
                  ? "bg-white text-indigo-600 shadow-xs"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <FileBadge size={13} /> Certificate
            </button>
            <button
              onClick={() => setTemplateType("receipt")}
              className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
                templateType === "receipt"
                  ? "bg-white text-indigo-600 shadow-xs"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Receipt size={13} /> Receipt
            </button>
            <button
              onClick={() => setTemplateType("invitation")}
              className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
                templateType === "invitation"
                  ? "bg-white text-indigo-600 shadow-xs"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Mail size={13} /> Invitation
            </button>
          </div>

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

          {/* Clear / Blank Button */}
          <button
            onClick={handleClearCanvas}
            className="text-gray-500 hover:text-red-600 p-1.5 rounded-md hover:bg-red-50 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
            title="Clear all elements and start blank"
          >
            <RefreshCw size={13} />
            <span className="hidden sm:inline">Reset Blank</span>
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
          <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0 animate-in slide-in-from-left duration-200 shadow-sm">
            {/* Canva Tab Strip */}
            <div className="grid grid-cols-5 border-b border-gray-100 p-1 bg-gray-50/70 text-center">
              <button
                onClick={() => setLeftTab("text")}
                className={`py-1.5 flex flex-col items-center justify-center rounded transition-all cursor-pointer ${
                  leftTab === "text"
                    ? "bg-white text-indigo-600 shadow-xs font-bold"
                    : "text-gray-500 hover:text-gray-800"
                }`}
                title="Add Text"
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
                title="Canvas & Background"
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
                title="Upload Logo & Graphics"
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
                /* TAB 1: TEXT */
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
                /* TAB 3: CANVAS & BACKGROUND */
                <div className="space-y-4">
                  {/* Canvas Format Presets */}
                  <div>
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
                      Graphic Presets
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
                /* TAB 4: UPLOADS */
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">
                      Upload Logos & Graphics
                    </p>
                    <div
                      onClick={() => assetInputRef.current?.click()}
                      className="p-4 border-2 border-dashed border-gray-200 hover:border-indigo-500 rounded-xl text-center cursor-pointer hover:bg-indigo-50/20 transition-all group"
                    >
                      <ImageIcon size={22} className="text-gray-400 group-hover:text-indigo-600 mx-auto mb-1.5" />
                      <span className="text-[11px] font-bold text-gray-700 block">Upload Logo / Stamp</span>
                      <span className="text-[8px] text-gray-400">PNG, JPG, or WEBP (Transparent PNG recommended)</span>
                      <input
                        type="file"
                        ref={assetInputRef}
                        className="hidden"
                        accept="image/png, image/jpeg, image/webp"
                        onChange={handleAssetUpload}
                      />
                    </div>
                  </div>

                  {uploadedAssets.length > 0 && (
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">
                        Uploaded Assets
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {uploadedAssets.map((asset, idx) => (
                          <div
                            key={idx}
                            onClick={() => handleAddImageToCanvas(asset.src)}
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

                  {/* Upload Full Background */}
                  <div className="pt-3 border-t border-gray-100">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">
                      Full Background Graphic
                    </p>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="p-3 border border-gray-200 hover:border-indigo-500 rounded-lg text-center cursor-pointer hover:bg-indigo-50/20 transition-all group"
                    >
                      <UploadCloud size={16} className="text-gray-400 group-hover:text-indigo-600 mx-auto mb-1" />
                      <span className="text-[10px] font-bold text-gray-600 block">Replace Background</span>
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/png, image/jpeg"
                        onChange={handleBackgroundUpload}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                /* TAB 5: LAYERS */
                <div className="space-y-2">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">
                    Layers Stack ({elements.length})
                  </p>
                  {elements.length === 0 ? (
                    <p className="text-[10px] text-gray-400 italic">No elements on canvas.</p>
                  ) : (
                    <div className="space-y-1">
                      {[...elements].reverse().map((el) => {
                        const isSelected = selectedId === el.id;
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
                                : "bg-white border-gray-200 hover:bg-gray-50 text-gray-700"
                            }`}
                          >
                            <span className="truncate flex-1 pr-2 select-none">
                              {label}
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setElements(elements.filter((item) => item.id !== el.id));
                                  if (selectedId === el.id) setSelectedId(null);
                                }}
                                className="text-gray-400 hover:text-red-600 transition-colors p-0.5"
                                title="Delete"
                              >
                                <Trash2 size={12} />
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
        <main className="flex-1 bg-slate-200/70 flex flex-col overflow-hidden relative">
          {/* Canvas Sub-Header & Zoom Bar */}
          <div className="bg-white border-b border-gray-200 px-4 py-1.5 flex items-center justify-between z-10 shadow-xs">
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
            </div>

            {/* Quick Actions if element selected */}
            {selectedElement && (
              <div className="flex items-center gap-1.5 bg-indigo-50/70 px-2.5 py-0.5 rounded-full border border-indigo-100 text-[10px] text-indigo-700 font-semibold animate-in fade-in duration-150">
                <span>Selected: {selectedElement.type || "Element"}</span>
                <button
                  onClick={() => {
                    const clone = {
                      ...selectedElement,
                      id: `el_${Math.random().toString(36).substring(2, 9)}`,
                      x: selectedElement.x + 20,
                      y: selectedElement.y + 20,
                    };
                    setElements((prev) => [...prev, clone]);
                    setSelectedId(clone.id);
                  }}
                  className="hover:text-indigo-900 p-0.5 ml-1 cursor-pointer"
                  title="Duplicate (Ctrl+D)"
                >
                  <Copy size={11} />
                </button>
                <button
                  onClick={() => {
                    setElements((prev) => prev.filter((el) => el.id !== selectedId));
                    setSelectedId(null);
                  }}
                  className="hover:text-red-600 p-0.5 cursor-pointer"
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
            />
          </div>
        </main>

        {/* 3. RIGHT SIDEBAR: Properties Inspector */}
        {isRightSidebarOpen && (
          <aside className="w-72 bg-white border-l border-gray-200 flex flex-col shrink-0 overflow-y-auto animate-in slide-in-from-right duration-200 shadow-sm">
            <div className="p-3 border-b border-gray-100 flex items-center gap-1.5 bg-gray-50/70">
              <Settings size={14} className="text-gray-500" />
              <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                {selectedElement ? "Element Inspector" : "Canvas Properties"}
              </h4>
            </div>

            <div className="flex-grow p-3">
              {selectedElement ? (
                <TextElementControls
                  element={selectedElement}
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
                        + Line
                      </button>
                      <button
                        onClick={() => handleAddShape("badge")}
                        className="p-2 bg-white border border-gray-200 hover:border-indigo-500 rounded-lg text-xs font-semibold text-gray-700 hover:text-indigo-600 transition-all text-left cursor-pointer"
                      >
                        + Rosette
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};

export default UploadTemplatePage;


