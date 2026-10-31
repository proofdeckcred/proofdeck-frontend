import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import mammoth from "mammoth";
import { toast, Toaster } from "react-hot-toast";
import {
  FileText,
  Star,
  CloudCheck,
  Cloud,
  ArrowLeft,
  UploadSimple,
  Printer,
  Eye,
  TextB,
  TextItalic,
  TextUnderline,
  TextStrikethrough,
  TextAlignLeft,
  TextAlignCenter,
  TextAlignRight,
  TextAlignJustify,
  ListBullets,
  ListNumbers,
  TextIndent,
  TextOutdent,
  Link as LinkIcon,
  QrCode,
  ShieldCheck,
  Sparkle,
  Plus,
  Trash,
  CheckCircle,
  Copy,
  MagnifyingGlass,
  CaretDown,
  CaretRight,
  User,
  GraduationCap,
  CalendarBlank,
  Hash,
  Buildings,
  Certificate,
  FolderOpen,
  ArrowClockwise,
  ArrowCounterClockwise,
  PaintBrush,
  Highlighter,
} from "@phosphor-icons/react";
import { createCustomTemplate, getTemplate, updateCustomTemplate } from "../api";
import { useUser } from "../context/UserContext";
import AppButton from "../components/ui/AppButton";

// --- PRESET DOCUMENT TEMPLATES ---
const OFFICIAL_PRESETS = [
  {
    id: "statement_of_result",
    name: "Statement of Result",
    icon: GraduationCap,
    description: "Standard degree statement of result with legal phrasing.",
    title: "OFFICIAL STATEMENT OF RESULT",
    content: `
      <div style="text-align: center; margin-bottom: 24px;">
        <h2 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 0.5px; color: #111827;">OFFICE OF THE ACADEMIC REGISTRAR</h2>
        <h3 style="margin: 4px 0 0 0; font-size: 15px; font-weight: 700; color: #374151;">EXAMINATIONS AND ACADEMIC RECORDS DIVISION</h3>
        <p style="margin: 4px 0 0 0; font-size: 12px; color: #6B7280;">Senate House, University Main Campus</p>
      </div>
      <hr style="border: 0; border-top: 2px solid #111827; margin: 16px 0 24px 0;" />
      
      <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: 600; margin-bottom: 24px;">
        <div><strong>Ref:</strong> <span class="pd-chip" data-var="{{ref_number}}">{{ref_number}}</span></div>
        <div><strong>Date:</strong> <span class="pd-chip" data-var="{{issue_date}}">{{issue_date}}</span></div>
      </div>

      <div style="text-align: center; margin-bottom: 28px;">
        <h1 style="margin: 0; font-size: 19px; font-weight: 900; text-decoration: underline; letter-spacing: 0.5px; color: #111827;">
          OFFICIAL STATEMENT OF RESULT
        </h1>
      </div>

      <p style="font-size: 14px; line-height: 1.9; color: #1F2937; text-align: justify; margin-bottom: 18px;">
        This is to certify that <strong><span class="pd-chip" data-var="{{recipient_name}}">{{recipient_name}}</span></strong>, 
        with Registration Number <strong><span class="pd-chip" data-var="{{student_id}}">{{student_id}}</span></strong>, 
        having completed an approved course of study and passed the prescribed examinations, has on the recommendation of the Board of Studies of the Faculty of 
        <strong><span class="pd-chip" data-var="{{faculty}}">{{faculty}}</span></strong>, Department of 
        <strong><span class="pd-chip" data-var="{{department}}">{{department}}</span></strong>, been admitted on 
        <strong><span class="pd-chip" data-var="{{senate_date}}">{{senate_date}}</span></strong> to the Degree of:
      </p>

      <div style="text-align: center; margin: 24px 0; padding: 16px; background-color: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 8px;">
        <div style="font-size: 18px; font-weight: 800; color: #111827; margin-bottom: 6px;">
          <span class="pd-chip" data-var="{{course_title}}">{{course_title}}</span>
        </div>
        <div style="font-size: 15px; font-weight: 700; color: #374151;">
          With <span class="pd-chip" data-var="{{grade_or_honours}}">{{grade_or_honours}}</span> 
          (Cumulative Grade Point Average: <strong><span class="pd-chip" data-var="{{cgpa}}">{{cgpa}}</span></strong>)
        </div>
      </div>

      <p style="font-size: 13px; line-height: 1.8; color: #374151; text-align: justify; margin-bottom: 36px;">
        The official certificate will be issued to him/her in due course upon surrender of this Statement of Result and clearance from all Directorates.
      </p>

      <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 50px;">
        <div style="text-align: left; max-width: 250px;">
          <div style="font-family: 'Times New Roman', serif; font-size: 20px; font-style: italic; font-weight: bold; margin-bottom: 4px; color: #1E3A8A;">
            <span class="pd-chip" data-var="{{signatory_name}}">{{signatory_name}}</span>
          </div>
          <div style="border-top: 1.5px solid #374151; padding-top: 6px; font-size: 13px; font-weight: 700; color: #111827;">
            <span class="pd-chip" data-var="{{signatory_title}}">{{signatory_title}}</span>
          </div>
          <div style="font-size: 11px; color: #6B7280;">For: Academic Registrar & Secretary</div>
        </div>

        <div style="text-align: center; padding: 10px 18px; border: 2px dashed #9CA3AF; border-radius: 8px; font-size: 11px; color: #6B7280;">
          <div style="font-weight: 700; color: #374151; margin-bottom: 2px;">OFFICIAL SEAL</div>
          <div>Valid Only With Stamp</div>
        </div>
      </div>
    `,
  },
  {
    id: "english_proficiency",
    name: "Letter of English Proficiency",
    icon: Certificate,
    description: "Official confirmation of English language medium of instruction.",
    title: "LETTER OF ENGLISH PROFICIENCY",
    content: `
      <div style="text-align: center; margin-bottom: 24px;">
        <h2 style="margin: 0; font-size: 20px; font-weight: 800; color: #111827;">DIRECTORATE OF ACADEMIC AFFAIRS</h2>
        <h3 style="margin: 4px 0 0 0; font-size: 14px; font-weight: 700; color: #374151;">OFFICE OF THE REGISTRAR</h3>
        <p style="margin: 4px 0 0 0; font-size: 12px; color: #6B7280;">Verification & International Credential Services</p>
      </div>
      <hr style="border: 0; border-top: 2px solid #111827; margin: 16px 0 24px 0;" />

      <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: 600; margin-bottom: 24px;">
        <div><strong>Ref:</strong> <span class="pd-chip" data-var="{{ref_number}}">{{ref_number}}</span></div>
        <div><strong>Date:</strong> <span class="pd-chip" data-var="{{issue_date}}">{{issue_date}}</span></div>
      </div>

      <div style="margin-bottom: 20px;">
        <p style="font-size: 13px; font-weight: 700; margin: 0; color: #111827;">TO WHOM IT MAY CONCERN</p>
      </div>

      <div style="text-align: center; margin-bottom: 24px;">
        <h2 style="margin: 0; font-size: 17px; font-weight: 800; text-decoration: underline; color: #111827;">
          ATTESTATION OF ENGLISH AS MEDIUM OF INSTRUCTION
        </h2>
      </div>

      <p style="font-size: 14px; line-height: 1.85; color: #1F2937; text-align: justify; margin-bottom: 18px;">
        This is to certify that <strong><span class="pd-chip" data-var="{{recipient_name}}">{{recipient_name}}</span></strong>, 
        bearing Registration Number <strong><span class="pd-chip" data-var="{{student_id}}">{{student_id}}</span></strong>, was a bona fide student in the 
        Department of <strong><span class="pd-chip" data-var="{{department}}">{{department}}</span></strong>, Faculty of 
        <strong><span class="pd-chip" data-var="{{faculty}}">{{faculty}}</span></strong>.
      </p>

      <p style="font-size: 14px; line-height: 1.85; color: #1F2937; text-align: justify; margin-bottom: 18px;">
        We confirm that English Language is the sole medium of instruction, examination, research, and general communication for all undergraduate and postgraduate academic programs.
      </p>

      <div style="margin-top: 48px;">
        <div style="font-family: 'Times New Roman', serif; font-size: 19px; font-style: italic; font-weight: bold; margin-bottom: 4px; color: #1E3A8A;">
          <span class="pd-chip" data-var="{{signatory_name}}">{{signatory_name}}</span>
        </div>
        <div style="border-top: 1.5px solid #374151; padding-top: 4px; font-size: 13px; font-weight: 700; color: #111827; display: inline-block;">
          <span class="pd-chip" data-var="{{signatory_title}}">{{signatory_title}}</span>
        </div>
        <div style="font-size: 11px; color: #6B7280; margin-top: 2px;">Director, Academic Planning & Records</div>
      </div>
    `,
  },
  {
    id: "attestation_completion",
    name: "Letter of Attestation & Completion",
    icon: Buildings,
    description: "Confirms program completion pending final convocation ceremony.",
    title: "LETTER OF ATTESTATION",
    content: `
      <div style="text-align: center; margin-bottom: 24px;">
        <h2 style="margin: 0; font-size: 20px; font-weight: 800; color: #111827;">OFFICE OF THE REGISTRAR</h2>
        <p style="margin: 4px 0 0 0; font-size: 12px; color: #6B7280;">Student Academic Verification Unit</p>
      </div>
      <hr style="border: 0; border-top: 2px solid #111827; margin: 16px 0 24px 0;" />

      <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: 600; margin-bottom: 24px;">
        <div><strong>Ref:</strong> <span class="pd-chip" data-var="{{ref_number}}">{{ref_number}}</span></div>
        <div><strong>Date:</strong> <span class="pd-chip" data-var="{{issue_date}}">{{issue_date}}</span></div>
      </div>

      <div style="text-align: center; margin-bottom: 24px;">
        <h2 style="margin: 0; font-size: 17px; font-weight: 800; text-decoration: underline; color: #111827;">
          LETTER OF ATTESTATION
        </h2>
      </div>

      <p style="font-size: 14px; line-height: 1.85; color: #1F2937; text-align: justify; margin-bottom: 16px;">
        This is to attest that <strong><span class="pd-chip" data-var="{{recipient_name}}">{{recipient_name}}</span></strong> 
        (Registration Number: <strong><span class="pd-chip" data-var="{{student_id}}">{{student_id}}</span></strong>) has satisfied all academic requirements for the award of 
        <strong><span class="pd-chip" data-var="{{course_title}}">{{course_title}}</span></strong>.
      </p>

      <p style="font-size: 14px; line-height: 1.85; color: #1F2937; text-align: justify; margin-bottom: 16px;">
        This letter is issued upon request pending the issuance of the substantive diploma certificate.
      </p>

      <div style="margin-top: 48px;">
        <div style="font-family: 'Times New Roman', serif; font-size: 19px; font-style: italic; font-weight: bold; margin-bottom: 4px; color: #1E3A8A;">
          <span class="pd-chip" data-var="{{signatory_name}}">{{signatory_name}}</span>
        </div>
        <div style="border-top: 1.5px solid #374151; padding-top: 4px; font-size: 13px; font-weight: 700; color: #111827; display: inline-block;">
          <span class="pd-chip" data-var="{{signatory_title}}">{{signatory_title}}</span>
        </div>
      </div>
    `,
  },
];

const MERGE_VARIABLES = [
  {
    category: "Recipient Info",
    vars: [
      { key: "{{recipient_name}}", label: "Recipient Name", icon: User },
      { key: "{{student_id}}", label: "Student / Reg No", icon: Hash },
      { key: "{{recipient_email}}", label: "Email Address", icon: User },
    ],
  },
  {
    category: "Academic Details",
    vars: [
      { key: "{{course_title}}", label: "Degree / Course Title", icon: GraduationCap },
      { key: "{{faculty}}", label: "Faculty / School", icon: Buildings },
      { key: "{{department}}", label: "Department", icon: Buildings },
      { key: "{{grade_or_honours}}", label: "Grade / Honours Class", icon: Certificate },
      { key: "{{cgpa}}", label: "Cumulative GPA", icon: Hash },
    ],
  },
  {
    category: "Dates & Records",
    vars: [
      { key: "{{issue_date}}", label: "Date of Issuance", icon: CalendarBlank },
      { key: "{{senate_date}}", label: "Senate Approval Date", icon: CalendarBlank },
      { key: "{{ref_number}}", label: "Official Ref Number", icon: Hash },
    ],
  },
  {
    category: "Signatories",
    vars: [
      { key: "{{signatory_name}}", label: "Signatory Name", icon: User },
      { key: "{{signatory_title}}", label: "Signatory Title", icon: User },
      { key: "{{institution_name}}", label: "Institution Name", icon: Buildings },
    ],
  },
];

const SAMPLE_RECORDS = [
  {
    recipient_name: "Fatima Al-Hassan",
    student_id: "STU/2022/8941",
    course_title: "Bachelor of Science in Computer Science",
    faculty: "Faculty of Computing and Information Technology",
    department: "Software Engineering",
    grade_or_honours: "First Class Honours",
    cgpa: "4.82 / 5.00",
    issue_date: "14th October 2026",
    senate_date: "28th September 2026",
    ref_number: "SEN/CIT/2026/0491",
    signatory_name: "Prof. Kenneth O. Mensah",
    signatory_title: "Academic Registrar",
    institution_name: "Apex University",
    recipient_email: "fatima.hassan@example.edu",
  },
  {
    recipient_name: "David Olatunji Adeleke",
    student_id: "STU/2022/4119",
    course_title: "Bachelor of Engineering in Electrical Engineering",
    faculty: "Faculty of Engineering & Technology",
    department: "Electrical and Electronics Engineering",
    grade_or_honours: "Second Class Honours (Upper Division)",
    cgpa: "4.35 / 5.00",
    issue_date: "14th October 2026",
    senate_date: "28th September 2026",
    ref_number: "SEN/ENG/2026/1028",
    signatory_name: "Prof. Kenneth O. Mensah",
    signatory_title: "Academic Registrar",
    institution_name: "Apex University",
    recipient_email: "adeleke.d@example.edu",
  },
];

export default function DocumentEditorPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useUser();

  const [docTitle, setDocTitle] = useState("Untitled document");
  const [docHtml, setDocHtml] = useState(OFFICIAL_PRESETS[0].content);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(true);
  const [activeTab, setActiveTab] = useState("variables");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [zoomLevel, setZoomLevel] = useState("100%");
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [selectedRecordIdx, setSelectedRecordIdx] = useState(0);
  const [includeQrCode, setIncludeQrCode] = useState(true);
  const [qrPosition, setQrPosition] = useState("bottom-right");
  const [customVarName, setCustomVarName] = useState("");
  const [varSearchQuery, setVarSearchQuery] = useState("");

  const [currentFont, setCurrentFont] = useState("Arial");
  const [currentFontSize, setCurrentFontSize] = useState("11");

  // Menu dropdown toggles
  const [activeMenu, setActiveMenu] = useState(null);

  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const menuContainerRef = useRef(null);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuContainerRef.current && !menuContainerRef.current.contains(e.target)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch existing template if editing
  useEffect(() => {
    if (id) {
      getTemplate(id)
        .then((res) => {
          const t = res.data.template;
          if (t) {
            setDocTitle(t.title || "Untitled document");
            if (t.canvas_data?.document_html) {
              setDocHtml(t.canvas_data.document_html);
              if (editorRef.current) {
                editorRef.current.innerHTML = t.canvas_data.document_html;
              }
            }
            if (t.canvas_data?.qr_code_enabled !== undefined) {
              setIncludeQrCode(t.canvas_data.qr_code_enabled);
            }
            if (t.canvas_data?.qr_position) {
              setQrPosition(t.canvas_data.qr_position);
            }
          }
        })
        .catch(() => {
          toast.error("Could not load template");
        });
    }
  }, [id]);

  useEffect(() => {
    if (editorRef.current && !isPreviewMode && !editorRef.current.innerHTML) {
      editorRef.current.innerHTML = docHtml;
    }
  }, [docHtml, isPreviewMode]);

  const execCmd = (command, value = null) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      setDocHtml(editorRef.current.innerHTML);
      setIsSaved(false);
    }
  };

  const handleFontChange = (font) => {
    setCurrentFont(font);
    execCmd("fontName", font);
  };

  const handleFontSizeChange = (sizePt) => {
    setCurrentFontSize(sizePt);
    execCmd("fontSize", "3");
  };

  const insertVariable = (varKey, varLabel) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    const chipHtml = `&nbsp;<span class="pd-chip" data-var="${varKey}" contenteditable="false" style="display: inline-block; background-color: #F1F5F9; color: #1E293B; border: 1px solid #CBD5E1; padding: 1px 6px; border-radius: 4px; font-family: monospace; font-size: 12px; font-weight: 600; user-select: all;">${varKey}</span>&nbsp;`;
    document.execCommand("insertHTML", false, chipHtml);
    setDocHtml(editorRef.current.innerHTML);
    setIsSaved(false);
  };

  const handleDragStart = (e, varKey) => {
    e.dataTransfer.setData("text/plain", varKey);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const varKey = e.dataTransfer.getData("text/plain");
    if (varKey && varKey.startsWith("{{") && varKey.endsWith("}}")) {
      const chipHtml = `&nbsp;<span class="pd-chip" data-var="${varKey}" contenteditable="false" style="display: inline-block; background-color: #F1F5F9; color: #1E293B; border: 1px solid #CBD5E1; padding: 1px 6px; border-radius: 4px; font-family: monospace; font-size: 12px; font-weight: 600; user-select: all;">${varKey}</span>&nbsp;`;
      document.execCommand("insertHTML", false, chipHtml);
      if (editorRef.current) {
        setDocHtml(editorRef.current.innerHTML);
        setIsSaved(false);
      }
    }
  };

  const handleEditorInput = () => {
    if (editorRef.current) {
      setDocHtml(editorRef.current.innerHTML);
      setIsSaved(false);
    }
  };

  // Word import handler
  const handleWordImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const toastId = toast.loading("Importing Word document...");
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      let importedHtml = result.value;

      importedHtml = importedHtml.replace(/\{([a-zA-Z0-9_]+)\}/g, "{{$1}}");
      importedHtml = importedHtml.replace(/(\{\{[a-zA-Z0-9_]+\}\})/g, (match) => {
        return `<span class="pd-chip" data-var="${match}" contenteditable="false" style="display: inline-block; background-color: #F1F5F9; color: #1E293B; border: 1px solid #CBD5E1; padding: 1px 6px; border-radius: 4px; font-family: monospace; font-size: 12px; font-weight: 600;">${match}</span>`;
      });

      setDocHtml(importedHtml);
      if (editorRef.current) {
        editorRef.current.innerHTML = importedHtml;
      }
      setIsSaved(false);
      const fileNameClean = file.name.replace(/\.[^/.]+$/, "");
      setDocTitle(fileNameClean);
      toast.success("Document imported", { id: toastId });
    } catch (err) {
      toast.error("Failed to parse Word document", { id: toastId });
    }
  };

  // Save template
  const handleSaveTemplate = async () => {
    if (!docTitle.trim()) {
      toast.error("Enter a document title");
      return;
    }
    setIsSaving(true);
    const htmlToSave = editorRef.current ? editorRef.current.innerHTML : docHtml;

    const payload = {
      title: docTitle,
      layout_style: "document",
      canvas_data: {
        document_html: htmlToSave,
        qr_code_enabled: includeQrCode,
        qr_position: qrPosition,
        zoom: zoomLevel,
      },
    };

    try {
      if (id) {
        await updateCustomTemplate(id, payload);
        toast.success("Template saved");
      } else {
        const res = await createCustomTemplate(payload);
        toast.success("Template created");
        if (res.data?.template_id) {
          navigate(`/dashboard/documents/editor/${res.data.template_id}`, { replace: true });
        }
      }
      setIsSaved(true);
    } catch (err) {
      toast.error(err.response?.data?.msg || "Failed to save template");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSelectPreset = (preset) => {
    if (window.confirm(`Load "${preset.name}" preset? Any unsaved edits will be replaced.`)) {
      setDocHtml(preset.content);
      setDocTitle(preset.title);
      if (editorRef.current) {
        editorRef.current.innerHTML = preset.content;
      }
      setIsSaved(false);
    }
  };

  const renderMergedPreview = () => {
    const record = SAMPLE_RECORDS[selectedRecordIdx];
    let rendered = docHtml;
    rendered = rendered.replace(/class="pd-chip"[^>]*>\{\{([a-zA-Z0-9_]+)\}\}<\/span>/g, (match, p1) => {
      const val = record[p1] || `[${p1}]`;
      return `<span style="background-color: #FEF08A; color: #854D0E; padding: 1px 4px; border-radius: 3px; font-weight: 600;">${val}</span>`;
    });
    rendered = rendered.replace(/\{\{([a-zA-Z0-9_]+)\}\}/g, (match, p1) => {
      return record[p1] || match;
    });
    return rendered;
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    const content = isPreviewMode ? renderMergedPreview() : (editorRef.current?.innerHTML || docHtml);
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${docTitle}</title>
          <style>
            @page { size: A4 portrait; margin: 25mm; }
            body { font-family: ${currentFont}, sans-serif; color: #111827; margin: 0; padding: 0; }
            .pd-chip { background: transparent !important; border: none !important; font-weight: bold; }
          </style>
        </head>
        <body>${content}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 300);
  };

  const handleAddCustomVar = () => {
    if (!customVarName.trim()) return;
    const cleanKey = `{{${customVarName.trim().toLowerCase().replace(/\s+/g, "_")}}}`;
    insertVariable(cleanKey, customVarName);
    setCustomVarName("");
  };

  const filteredMergeVars = MERGE_VARIABLES.map((grp) => ({
    ...grp,
    vars: grp.vars.filter(
      (v) =>
        v.label.toLowerCase().includes(varSearchQuery.toLowerCase()) ||
        v.key.toLowerCase().includes(varSearchQuery.toLowerCase())
    ),
  })).filter((grp) => grp.vars.length > 0);

  return (
    <div className="flex flex-col h-screen w-full bg-[#f8f9fa] dark:bg-slate-950 overflow-hidden font-sans select-none">
      <Toaster position="top-right" />
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleWordImport}
        accept=".docx"
        className="hidden"
      />

      {/* Top Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-2 shrink-0 z-30">
        <div className="flex items-center justify-between gap-4">
          {/* Left Title Section */}
          <div className="flex items-center gap-3 min-w-0">
            <Link
              to="/dashboard/templates"
              className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Templates"
            >
              <ArrowLeft size={16} weight="bold" />
            </Link>

            <FileText size={28} weight="fill" className="text-blue-600 shrink-0" />

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={docTitle}
                  onChange={(e) => {
                    setDocTitle(e.target.value);
                    setIsSaved(false);
                  }}
                  className="font-medium text-slate-800 dark:text-slate-100 text-sm bg-transparent border-0 outline-none hover:bg-slate-100 dark:hover:bg-slate-800 px-1 py-0.5 rounded transition-colors max-w-[280px] sm:max-w-md truncate"
                />
                <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                  {isSaving ? "Saving..." : isSaved ? "Saved" : "Unsaved"}
                </span>
              </div>

              {/* Working Menu Bar */}
              <div ref={menuContainerRef} className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400 pt-0.5 relative">
                {/* File */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setActiveMenu(activeMenu === "file" ? null : "file")}
                    className="hover:text-slate-900 dark:hover:text-slate-100 px-1 py-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    File
                  </button>
                  {activeMenu === "file" && (
                    <div className="absolute left-0 top-full mt-1 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md shadow-lg py-1 z-50 text-xs text-slate-700 dark:text-slate-200">
                      <button
                        onClick={() => {
                          fileInputRef.current?.click();
                          setActiveMenu(null);
                        }}
                        className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                      >
                        <UploadSimple size={14} /> Import Word (.docx)
                      </button>
                      <button
                        onClick={() => {
                          handlePrint();
                          setActiveMenu(null);
                        }}
                        className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                      >
                        <Printer size={14} /> Print / PDF
                      </button>
                    </div>
                  )}
                </div>

                {/* Edit */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setActiveMenu(activeMenu === "edit" ? null : "edit")}
                    className="hover:text-slate-900 dark:hover:text-slate-100 px-1 py-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Edit
                  </button>
                  {activeMenu === "edit" && (
                    <div className="absolute left-0 top-full mt-1 w-40 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md shadow-lg py-1 z-50 text-xs text-slate-700 dark:text-slate-200">
                      <button
                        onClick={() => {
                          execCmd("undo");
                          setActiveMenu(null);
                        }}
                        className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        Undo
                      </button>
                      <button
                        onClick={() => {
                          execCmd("redo");
                          setActiveMenu(null);
                        }}
                        className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        Redo
                      </button>
                      <button
                        onClick={() => {
                          execCmd("selectAll");
                          setActiveMenu(null);
                        }}
                        className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        Select all
                      </button>
                    </div>
                  )}
                </div>

                {/* View */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setActiveMenu(activeMenu === "view" ? null : "view")}
                    className="hover:text-slate-900 dark:hover:text-slate-100 px-1 py-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    View
                  </button>
                  {activeMenu === "view" && (
                    <div className="absolute left-0 top-full mt-1 w-36 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md shadow-lg py-1 z-50 text-xs text-slate-700 dark:text-slate-200">
                      {["75%", "90%", "100%", "125%"].map((z) => (
                        <button
                          key={z}
                          onClick={() => {
                            setZoomLevel(z);
                            setActiveMenu(null);
                          }}
                          className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800"
                        >
                          {z}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Insert */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setActiveMenu(activeMenu === "insert" ? null : "insert")}
                    className="hover:text-slate-900 dark:hover:text-slate-100 px-1 py-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Insert
                  </button>
                  {activeMenu === "insert" && (
                    <div className="absolute left-0 top-full mt-1 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md shadow-lg py-1 z-50 text-xs text-slate-700 dark:text-slate-200">
                      <button
                        onClick={() => {
                          setIsSidebarOpen(true);
                          setActiveTab("variables");
                          setActiveMenu(null);
                        }}
                        className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                      >
                        <Sparkle size={14} /> Variables
                      </button>
                      <button
                        onClick={() => {
                          execCmd("insertHorizontalRule");
                          setActiveMenu(null);
                        }}
                        className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        Horizontal line
                      </button>
                    </div>
                  )}
                </div>

                {/* Format */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setActiveMenu(activeMenu === "format" ? null : "format")}
                    className="hover:text-slate-900 dark:hover:text-slate-100 px-1 py-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Format
                  </button>
                  {activeMenu === "format" && (
                    <div className="absolute left-0 top-full mt-1 w-40 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md shadow-lg py-1 z-50 text-xs text-slate-700 dark:text-slate-200">
                      <button
                        onClick={() => {
                          execCmd("bold");
                          setActiveMenu(null);
                        }}
                        className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold"
                      >
                        Bold
                      </button>
                      <button
                        onClick={() => {
                          execCmd("italic");
                          setActiveMenu(null);
                        }}
                        className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 italic"
                      >
                        Italic
                      </button>
                      <button
                        onClick={() => {
                          execCmd("underline");
                          setActiveMenu(null);
                        }}
                        className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 underline"
                      >
                        Underline
                      </button>
                      <button
                        onClick={() => {
                          execCmd("removeFormat");
                          setActiveMenu(null);
                        }}
                        className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        Clear formatting
                      </button>
                    </div>
                  )}
                </div>

                {/* Tools */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setActiveMenu(activeMenu === "tools" ? null : "tools")}
                    className="hover:text-slate-900 dark:hover:text-slate-100 px-1 py-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Tools
                  </button>
                  {activeMenu === "tools" && (
                    <div className="absolute left-0 top-full mt-1 w-40 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md shadow-lg py-1 z-50 text-xs text-slate-700 dark:text-slate-200">
                      <button
                        onClick={() => {
                          const words = docHtml.replace(/<[^>]+>/g, "").split(/\s+/).filter(Boolean).length;
                          toast(`Word count: ${words}`);
                          setActiveMenu(null);
                        }}
                        className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        Word count
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <AppButton
              variant={isPreviewMode ? "primary" : "secondary"}
              onClick={() => setIsPreviewMode(!isPreviewMode)}
            >
              {isPreviewMode ? "Edit" : "Preview"}
            </AppButton>
            <AppButton
              variant="primary"
              onClick={handleSaveTemplate}
              disabled={isSaving}
            >
              Save template
            </AppButton>
          </div>
        </div>
      </header>

      {/* Formatting Toolbar */}
      <div className="bg-[#f0f4f9] dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 px-3 py-1 flex items-center gap-1 overflow-x-auto shrink-0 z-20">
        <button
          type="button"
          onClick={() => execCmd("undo")}
          className="p-1.5 rounded hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
          title="Undo"
        >
          <ArrowCounterClockwise size={14} weight="bold" />
        </button>
        <button
          type="button"
          onClick={() => execCmd("redo")}
          className="p-1.5 rounded hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
          title="Redo"
        >
          <ArrowClockwise size={14} weight="bold" />
        </button>
        <button
          type="button"
          onClick={handlePrint}
          className="p-1.5 rounded hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
          title="Print"
        >
          <Printer size={14} weight="bold" />
        </button>

        <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

        {/* Zoom */}
        <select
          value={zoomLevel}
          onChange={(e) => setZoomLevel(e.target.value)}
          className="bg-transparent hover:bg-white dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs px-1.5 py-1 rounded border-0 outline-none cursor-pointer"
        >
          <option value="75%">75%</option>
          <option value="90%">90%</option>
          <option value="100%">100%</option>
          <option value="125%">125%</option>
        </select>

        <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

        {/* Font Family */}
        <select
          value={currentFont}
          onChange={(e) => handleFontChange(e.target.value)}
          className="bg-transparent hover:bg-white dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs px-2 py-1 rounded border-0 outline-none cursor-pointer max-w-[130px] truncate"
        >
          <option value="Arial">Arial</option>
          <option value="Georgia">Georgia</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Calibri">Calibri</option>
          <option value="Courier New">Courier New</option>
        </select>

        {/* Font Size */}
        <div className="flex items-center bg-white dark:bg-slate-800 rounded border border-slate-300 dark:border-slate-700 px-1 py-0.5">
          <button
            type="button"
            onClick={() => handleFontSizeChange(Math.max(8, parseInt(currentFontSize) - 1).toString())}
            className="px-1 text-slate-600 dark:text-slate-300 hover:text-black dark:hover:text-white font-bold text-xs"
          >
            -
          </button>
          <span className="px-1.5 text-xs font-bold text-slate-800 dark:text-slate-100 min-w-[20px] text-center">
            {currentFontSize}
          </span>
          <button
            type="button"
            onClick={() => handleFontSizeChange((parseInt(currentFontSize) + 1).toString())}
            className="px-1 text-slate-600 dark:text-slate-300 hover:text-black dark:hover:text-white font-bold text-xs"
          >
            +
          </button>
        </div>

        <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

        {/* Bold, Italic, Underline */}
        <button
          type="button"
          onClick={() => execCmd("bold")}
          className="p-1.5 rounded hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
          title="Bold"
        >
          <TextB size={14} weight="bold" />
        </button>
        <button
          type="button"
          onClick={() => execCmd("italic")}
          className="p-1.5 rounded hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
          title="Italic"
        >
          <TextItalic size={14} weight="bold" />
        </button>
        <button
          type="button"
          onClick={() => execCmd("underline")}
          className="p-1.5 rounded hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
          title="Underline"
        >
          <TextUnderline size={14} weight="bold" />
        </button>

        <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

        {/* Alignments */}
        <button
          type="button"
          onClick={() => execCmd("justifyLeft")}
          className="p-1.5 rounded hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
          title="Align Left"
        >
          <TextAlignLeft size={14} weight="bold" />
        </button>
        <button
          type="button"
          onClick={() => execCmd("justifyCenter")}
          className="p-1.5 rounded hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
          title="Align Center"
        >
          <TextAlignCenter size={14} weight="bold" />
        </button>
        <button
          type="button"
          onClick={() => execCmd("justifyRight")}
          className="p-1.5 rounded hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
          title="Align Right"
        >
          <TextAlignRight size={14} weight="bold" />
        </button>
        <button
          type="button"
          onClick={() => execCmd("justifyFull")}
          className="p-1.5 rounded hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
          title="Justify"
        >
          <TextAlignJustify size={14} weight="bold" />
        </button>

        <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

        {/* Lists & Indents */}
        <button
          type="button"
          onClick={() => execCmd("insertUnorderedList")}
          className="p-1.5 rounded hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
          title="Bullet List"
        >
          <ListBullets size={14} weight="bold" />
        </button>
        <button
          type="button"
          onClick={() => execCmd("insertOrderedList")}
          className="p-1.5 rounded hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
          title="Numbered List"
        >
          <ListNumbers size={14} weight="bold" />
        </button>
        <button
          type="button"
          onClick={() => execCmd("outdent")}
          className="p-1.5 rounded hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
          title="Outdent"
        >
          <TextOutdent size={14} weight="bold" />
        </button>
        <button
          type="button"
          onClick={() => execCmd("indent")}
          className="p-1.5 rounded hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
          title="Indent"
        >
          <TextIndent size={14} weight="bold" />
        </button>
      </div>

      {/* Margin Ruler */}
      <div className="h-4 bg-[#f8f9fa] dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-center shrink-0">
        <div className="w-[210mm] relative h-full flex items-center">
          <div className="absolute left-[25mm] text-blue-600 text-[10px] leading-none select-none">▼</div>
          <div className="absolute right-[25mm] text-blue-600 text-[10px] leading-none select-none">▼</div>
        </div>
      </div>

      {/* Preview Mode Bar */}
      {isPreviewMode && (
        <div className="bg-slate-800 text-white px-4 py-1.5 flex items-center justify-between text-xs shrink-0 z-20">
          <span>Previewing record output</span>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Record:</span>
            <select
              value={selectedRecordIdx}
              onChange={(e) => setSelectedRecordIdx(parseInt(e.target.value))}
              className="bg-slate-900 text-white px-2 py-0.5 rounded text-xs border border-slate-700"
            >
              {SAMPLE_RECORDS.map((r, i) => (
                <option key={r.student_id} value={i}>
                  {r.recipient_name} ({r.student_id})
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Side Panel */}
        <aside
          className={`bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 transition-all duration-200 z-10 ${
            isSidebarOpen ? "w-72" : "w-10"
          }`}
        >
          <div className="p-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            {isSidebarOpen && (
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Variables
              </span>
            )}
            <button
              type="button"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1 rounded text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 mx-auto"
              title={isSidebarOpen ? "Collapse" : "Expand"}
            >
              {isSidebarOpen ? <ArrowLeft size={14} /> : <CaretRight size={14} />}
            </button>
          </div>

          {isSidebarOpen && (
            <div className="flex-1 flex flex-col min-h-0">
              {/* Tab Selector */}
              <div className="flex border-b border-slate-100 dark:border-slate-800 p-1 gap-1">
                <button
                  type="button"
                  onClick={() => setActiveTab("variables")}
                  className={`flex-1 py-1 text-xs font-medium rounded ${
                    activeTab === "variables"
                      ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
                >
                  Variables
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("presets")}
                  className={`flex-1 py-1 text-xs font-medium rounded ${
                    activeTab === "presets"
                      ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
                >
                  Presets
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("security")}
                  className={`flex-1 py-1 text-xs font-medium rounded ${
                    activeTab === "security"
                      ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
                >
                  Security
                </button>
              </div>

              {/* Tab 1: Variables */}
              {activeTab === "variables" && (
                <div className="flex-1 overflow-y-auto p-3 space-y-4">
                  <div className="relative">
                    <MagnifyingGlass size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search variables..."
                      value={varSearchQuery}
                      onChange={(e) => setVarSearchQuery(e.target.value)}
                      className="w-full pl-7 pr-2.5 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {filteredMergeVars.map((grp) => (
                    <div key={grp.category} className="space-y-1.5">
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        {grp.category}
                      </div>
                      <div className="space-y-1">
                        {grp.vars.map((v) => (
                          <div
                            key={v.key}
                            draggable
                            onDragStart={(e) => handleDragStart(e, v.key)}
                            onClick={() => insertVariable(v.key, v.label)}
                            className="flex items-center justify-between p-1.5 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-400 hover:bg-indigo-50/20 cursor-grab active:cursor-grabbing text-xs transition-colors"
                          >
                            <span className="text-slate-700 dark:text-slate-300 font-medium truncate">
                              {v.label}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400 ml-1 shrink-0">
                              {v.key}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                      Custom variable
                    </div>
                    <div className="flex gap-1">
                      <input
                        type="text"
                        value={customVarName}
                        onChange={(e) => setCustomVarName(e.target.value)}
                        placeholder="e.g. matric_no"
                        className="flex-1 px-2 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded outline-none"
                      />
                      <AppButton
                        type="button"
                        variant="secondary"
                        onClick={handleAddCustomVar}
                      >
                        Add
                      </AppButton>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Presets */}
              {activeTab === "presets" && (
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                  {OFFICIAL_PRESETS.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => handleSelectPreset(p)}
                      className="p-2.5 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-400 cursor-pointer transition-colors"
                    >
                      <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        {p.name}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                        {p.description}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 3: Security & QR */}
              {activeTab === "security" && (
                <div className="flex-1 overflow-y-auto p-3 space-y-4 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      Verification QR
                    </span>
                    <input
                      type="checkbox"
                      checked={includeQrCode}
                      onChange={(e) => setIncludeQrCode(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600"
                    />
                  </div>

                  {includeQrCode && (
                    <div className="space-y-1.5">
                      <label className="text-slate-600 dark:text-slate-400">Position</label>
                      <select
                        value={qrPosition}
                        onChange={(e) => setQrPosition(e.target.value)}
                        className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs"
                      >
                        <option value="bottom-right">Bottom-Right</option>
                        <option value="bottom-left">Bottom-Left</option>
                        <option value="header-right">Header (Right)</option>
                      </select>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </aside>

        {/* Canvas Area */}
        <main
          className="flex-1 overflow-y-auto p-8 flex justify-center bg-[#f0f4f9] dark:bg-slate-950"
          style={{ transform: `scale(${parseFloat(zoomLevel) / 100})`, transformOrigin: "top center" }}
        >
          {/* A4 Paper */}
          <div
            className="bg-white text-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 relative transition-all"
            style={{
              width: "210mm",
              minHeight: "297mm",
              padding: "25mm",
              boxSizing: "border-box",
            }}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            {/* Header QR */}
            {includeQrCode && qrPosition === "header-right" && (
              <div className="absolute top-6 right-6 flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded">
                <div className="w-10 h-10 flex items-center justify-center">
                  <QrCode size={36} className="text-slate-800" />
                </div>
              </div>
            )}

            {/* Content Area */}
            {isPreviewMode ? (
              <div
                className="prose max-w-none text-slate-900 leading-relaxed outline-none"
                dangerouslySetInnerHTML={{ __html: renderMergedPreview() }}
              />
            ) : (
              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={handleEditorInput}
                className="prose max-w-none text-slate-900 leading-relaxed outline-none min-h-[700px]"
                style={{
                  fontFamily: currentFont,
                  fontSize: `${currentFontSize}pt`,
                }}
              />
            )}

            {/* Bottom QR Stamp */}
            {includeQrCode && (qrPosition === "bottom-right" || qrPosition === "bottom-left") && (
              <div
                className={`mt-16 pt-6 border-t border-slate-200 flex items-center gap-3 ${
                  qrPosition === "bottom-right" ? "justify-end" : "justify-start"
                }`}
              >
                <div className="w-12 h-12 bg-white border border-slate-200 p-1 rounded flex items-center justify-center">
                  <QrCode size={40} className="text-slate-800" />
                </div>
                <div className="text-left text-[10px] text-slate-500">
                  <div className="font-semibold text-slate-700">Verified document</div>
                  <div>Scan QR code to verify authenticity</div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
