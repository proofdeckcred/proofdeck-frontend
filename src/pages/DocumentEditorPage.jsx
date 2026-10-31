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
  DownloadSimple,
  Printer,
  Eye,
  PencilSimple,
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
  Image as ImageIcon,
  QrCode,
  ShieldCheck,
  Sparkle,
  Plus,
  Trash,
  CheckCircle,
  Copy,
  MagnifyingGlass,
  Sliders,
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
} from "@phosphor-icons/react";
import { createCustomTemplate, getTemplate, updateCustomTemplate } from "../api";
import { useUser } from "../context/UserContext";

// --- PRESET DOCUMENT TEMPLATES (Authentic Commonwealth & University Standard Documents) ---
const OFFICIAL_PRESETS = [
  {
    id: "statement_of_result",
    name: "Official Statement of Result (Senate Approved)",
    icon: GraduationCap,
    description: "Standard university degree statement of result with Senate legal phrasing.",
    title: "OFFICIAL STATEMENT OF RESULT",
    content: `
      <div style="text-align: center; margin-bottom: 24px;">
        <h2 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 0.5px; color: #111827;">OFFICE OF THE ACADEMIC REGISTRAR</h2>
        <h3 style="margin: 4px 0 0 0; font-size: 15px; font-weight: 700; color: #374151;">EXAMINATIONS AND ACADEMIC RECORDS DIVISION</h3>
        <p style="margin: 4px 0 0 0; font-size: 12px; color: #6B7280;">Senate House, University Main Campus • www.university.edu</p>
      </div>
      <hr style="border: 0; border-top: 2px solid #111827; margin: 16px 0 24px 0;" />
      
      <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: 600; margin-bottom: 24px;">
        <div><strong>Ref:</strong> <span class="pd-chip" data-var="{{ref_number}}">{{ref_number}}</span></div>
        <div><strong>Date of Issuance:</strong> <span class="pd-chip" data-var="{{issue_date}}">{{issue_date}}</span></div>
      </div>

      <div style="text-align: center; margin-bottom: 28px;">
        <h1 style="margin: 0; font-size: 19px; font-weight: 900; text-decoration: underline; letter-spacing: 0.5px; color: #111827;">
          OFFICIAL STATEMENT OF RESULT
        </h1>
      </div>

      <p style="font-size: 14px; line-height: 1.9; color: #1F2937; text-align: justify; margin-bottom: 18px;">
        This is to certify that <strong><span class="pd-chip" data-var="{{recipient_name}}">{{recipient_name}}</span></strong>, 
        with Matriculation / Registration Number <strong><span class="pd-chip" data-var="{{student_id}}">{{student_id}}</span></strong>, 
        having completed an approved full-time course of study and passed the prescribed examinations, has on the recommendation of the Board of Studies of the Faculty of 
        <strong><span class="pd-chip" data-var="{{faculty}}">{{faculty}}</span></strong>, Department of 
        <strong><span class="pd-chip" data-var="{{department}}">{{department}}</span></strong>, been admitted by the authority of the University Senate on 
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
        The official certificate of the University will be issued to him/her in due course upon surrender of this Statement of Result and clearance from all University Directorates.
      </p>

      <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 50px;">
        <div style="text-align: left; max-width: 250px;">
          <div style="font-family: 'Times New Roman', serif; font-size: 20px; font-style: italic; font-weight: bold; margin-bottom: 4px; color: #1E3A8A;">
            <span class="pd-chip" data-var="{{signatory_name}}">{{signatory_name}}</span>
          </div>
          <div style="border-top: 1.5px solid #374151; padding-top: 6px; font-size: 13px; font-weight: 700; color: #111827;">
            <span class="pd-chip" data-var="{{signatory_title}}">{{signatory_title}}</span>
          </div>
          <div style="font-size: 11px; color: #6B7280;">For: Academic Registrar & Secretary to Senate</div>
        </div>

        <div style="text-align: center; padding: 10px 18px; border: 2px dashed #9CA3AF; border-radius: 8px; font-size: 11px; color: #6B7280;">
          <div style="font-weight: 700; color: #374151; margin-bottom: 2px;">OFFICIAL UNIVERSITY SEAL</div>
          <div>Valid Only With Embossed Stamp</div>
        </div>
      </div>
    `,
  },
  {
    id: "english_proficiency",
    name: "Letter of English Proficiency & Attestation",
    icon: Certificate,
    description: "Official attestation confirming full English language medium of instruction.",
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

      <p style="font-size: 14px; line-height: 1.9; color: #1F2937; text-align: justify; margin-bottom: 16px;">
        This is to officially confirm and attest that <strong><span class="pd-chip" data-var="{{recipient_name}}">{{recipient_name}}</span></strong> 
        (Matriculation No: <strong><span class="pd-chip" data-var="{{student_id}}">{{student_id}}</span></strong>) was a bona fide student in the Department of 
        <strong><span class="pd-chip" data-var="{{department}}">{{department}}</span></strong>, Faculty of 
        <strong><span class="pd-chip" data-var="{{faculty}}">{{faculty}}</span></strong> of this University.
      </p>

      <p style="font-size: 14px; line-height: 1.9; color: #1F2937; text-align: justify; margin-bottom: 16px;">
        He/She successfully completed the requirements for the award of the Degree of 
        <strong><span class="pd-chip" data-var="{{course_title}}">{{course_title}}</span></strong> with 
        <strong><span class="pd-chip" data-var="{{grade_or_honours}}">{{grade_or_honours}}</span></strong>.
      </p>

      <p style="font-size: 14px; line-height: 1.9; color: #1F2937; text-align: justify; margin-bottom: 36px;">
        We hereby confirm that <strong>English Language</strong> is the sole official medium of teaching, instruction, examinations, assignments, and research across all faculties and degree programs in this University. The recipient possesses fluent proficiency in spoken, written, and technical English.
      </p>

      <div style="margin-top: 50px;">
        <div style="font-family: 'Times New Roman', serif; font-size: 20px; font-style: italic; font-weight: bold; margin-bottom: 4px; color: #1E3A8A;">
          <span class="pd-chip" data-var="{{signatory_name}}">{{signatory_name}}</span>
        </div>
        <div style="border-top: 1.5px solid #374151; max-width: 260px; padding-top: 6px; font-size: 13px; font-weight: 700; color: #111827;">
          <span class="pd-chip" data-var="{{signatory_title}}">{{signatory_title}}</span>
        </div>
        <div style="font-size: 11px; color: #6B7280;">Academic Affairs & International Services</div>
      </div>
    `,
  },
  {
    id: "character_attestation",
    name: "Character Attestation & Clearance Letter",
    icon: ShieldCheck,
    description: "Official good conduct and clearance document for alumni and candidates.",
    title: "LETTER OF RECOMMENDATION & CHARACTER",
    content: `
      <div style="text-align: center; margin-bottom: 24px;">
        <h2 style="margin: 0; font-size: 20px; font-weight: 800; color: #111827;">DEANERY OF STUDENT AFFAIRS</h2>
        <h3 style="margin: 4px 0 0 0; font-size: 14px; font-weight: 700; color: #374151;">OFFICIAL ATTESTATION DIVISION</h3>
      </div>
      <hr style="border: 0; border-top: 2px solid #111827; margin: 16px 0 24px 0;" />

      <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: 600; margin-bottom: 24px;">
        <div><strong>Ref:</strong> <span class="pd-chip" data-var="{{ref_number}}">{{ref_number}}</span></div>
        <div><strong>Date:</strong> <span class="pd-chip" data-var="{{issue_date}}">{{issue_date}}</span></div>
      </div>

      <p style="font-size: 13px; font-weight: 700; margin-bottom: 20px; color: #111827;">TO WHOM IT MAY CONCERN</p>

      <div style="text-align: center; margin-bottom: 24px;">
        <h2 style="margin: 0; font-size: 17px; font-weight: 800; text-decoration: underline; color: #111827;">
          LETTER OF CHARACTER ATTESTATION & CLEARANCE
        </h2>
      </div>

      <p style="font-size: 14px; line-height: 1.9; color: #1F2937; text-align: justify; margin-bottom: 16px;">
        This serves to certify that <strong><span class="pd-chip" data-var="{{recipient_name}}">{{recipient_name}}</span></strong> 
        (Matriculation No: <strong><span class="pd-chip" data-var="{{student_id}}">{{student_id}}</span></strong>) was an undergraduate student in the Department of 
        <strong><span class="pd-chip" data-var="{{department}}">{{department}}</span></strong>, graduating with 
        <strong><span class="pd-chip" data-var="{{grade_or_honours}}">{{grade_or_honours}}</span></strong> in 
        <strong><span class="pd-chip" data-var="{{course_title}}">{{course_title}}</span></strong>.
      </p>

      <p style="font-size: 14px; line-height: 1.9; color: #1F2937; text-align: justify; margin-bottom: 16px;">
        Throughout his/her period of academic study in this institution, he/she demonstrated commendable character, integrity, academic diligence, and strict compliance with the University Code of Conduct. He/She was never involved in any examination malpractice, cultism, or disciplinary infractions.
      </p>

      <p style="font-size: 14px; line-height: 1.9; color: #1F2937; text-align: justify; margin-bottom: 36px;">
        We therefore recommend him/her without reservation for postgraduate admissions, employment, and scholarship opportunities.
      </p>

      <div style="margin-top: 50px;">
        <div style="font-family: 'Times New Roman', serif; font-size: 20px; font-style: italic; font-weight: bold; margin-bottom: 4px; color: #1E3A8A;">
          <span class="pd-chip" data-var="{{signatory_name}}">{{signatory_name}}</span>
        </div>
        <div style="border-top: 1.5px solid #374151; max-width: 260px; padding-top: 6px; font-size: 13px; font-weight: 700; color: #111827;">
          Dean of Student Affairs / Authorized Signatory
        </div>
      </div>
    `,
  },
  {
    id: "memorandum_of_agreement",
    name: "Memorandum of Agreement / Institutional MOU",
    icon: Buildings,
    description: "Official bilateral agreement template with institutional sign-off blocks.",
    title: "MEMORANDUM OF AGREEMENT",
    content: `
      <div style="text-align: center; margin-bottom: 28px;">
        <h1 style="margin: 0; font-size: 22px; font-weight: 900; letter-spacing: 0.5px; color: #111827;">
          MEMORANDUM OF AGREEMENT
        </h1>
        <p style="margin: 6px 0 0 0; font-size: 13px; font-weight: 600; color: #4B5563;">
          Institutional Academic Credential Verification Framework
        </p>
      </div>
      <hr style="border: 0; border-top: 2px solid #111827; margin: 16px 0 24px 0;" />

      <p style="font-size: 14px; line-height: 1.9; color: #1F2937; text-align: justify; margin-bottom: 16px;">
        This Memorandum of Agreement (the &quot;Agreement&quot;) is entered into and made effective as of 
        <strong><span class="pd-chip" data-var="{{issue_date}}">{{issue_date}}</span></strong>, by and between the Institution, represented by 
        <strong><span class="pd-chip" data-var="{{signatory_name}}">{{signatory_name}}</span></strong> (<span class="pd-chip" data-var="{{signatory_title}}">{{signatory_title}}</span>), 
        and the participating entity regarding certified academic issuance.
      </p>

      <h3 style="font-size: 15px; font-weight: 800; color: #111827; margin: 20px 0 8px 0;">1. PURPOSE & SCOPE</h3>
      <p style="font-size: 13px; line-height: 1.8; color: #374151; text-align: justify; margin-bottom: 16px;">
        The parties agree to adopt high-assurance tamper-proof cryptographic verification for all student credentials, statements of result, and academic transcripts issued under Faculty: 
        <strong><span class="pd-chip" data-var="{{faculty}}">{{faculty}}</span></strong>.
      </p>

      <h3 style="font-size: 15px; font-weight: 800; color: #111827; margin: 20px 0 8px 0;">2. VALIDATION & DATA SOVEREIGNTY</h3>
      <p style="font-size: 13px; line-height: 1.8; color: #374151; text-align: justify; margin-bottom: 30px;">
        All student identities, matriculation records, and examination results shall remain on-premise within the institution's designated secure local database vault.
      </p>

      <div style="display: flex; justify-content: space-between; margin-top: 50px;">
        <div>
          <div style="font-size: 13px; font-weight: 700; margin-bottom: 35px;">For the Institution:</div>
          <div style="border-top: 1.5px solid #374151; width: 220px; padding-top: 6px; font-size: 12px; font-weight: 700;">
            Authorized Signature
          </div>
        </div>
        <div>
          <div style="font-size: 13px; font-weight: 700; margin-bottom: 35px;">For the Partner:</div>
          <div style="border-top: 1.5px solid #374151; width: 220px; padding-top: 6px; font-size: 12px; font-weight: 700;">
            Authorized Signature
          </div>
        </div>
      </div>
    `,
  },
];

// --- AVAILABLE MERGE VARIABLES (Grouped & Clear) ---
const MERGE_VARIABLES = [
  {
    category: "Student Identity",
    vars: [
      { key: "{{recipient_name}}", label: "Student Full Name", icon: User, example: "Aisha Mohammed Bello" },
      { key: "{{student_id}}", label: "Matriculation / Student ID", icon: Hash, example: "20220001" },
      { key: "{{email}}", label: "Student Email", icon: User, example: "aisha.bello@campus.edu" },
    ],
  },
  {
    category: "Academic Record",
    vars: [
      { key: "{{course_title}}", label: "Degree Awarded / Program", icon: GraduationCap, example: "Bachelor of Science in Software Engineering" },
      { key: "{{grade_or_honours}}", label: "Class of Degree / Honours", icon: Certificate, example: "First Class Honours" },
      { key: "{{cgpa}}", label: "Cumulative GPA (CGPA)", icon: Hash, example: "4.82" },
      { key: "{{faculty}}", label: "Faculty / School", icon: Buildings, example: "Faculty of Computing Studies" },
      { key: "{{department}}", label: "Department", icon: Buildings, example: "Software Engineering" },
    ],
  },
  {
    category: "Senate & Administration",
    vars: [
      { key: "{{senate_date}}", label: "Senate Approval Date", icon: CalendarBlank, example: "30th October, 2026" },
      { key: "{{issue_date}}", label: "Issuance Date", icon: CalendarBlank, example: "31st October, 2026" },
      { key: "{{ref_number}}", label: "Official Reference No", icon: Hash, example: "PD/EXAM/2026/084" },
      { key: "{{signatory_name}}", label: "Registrar Name", icon: User, example: "Dr. Aliyu Sanusi Registrar" },
      { key: "{{signatory_title}}", label: "Signatory Title", icon: Certificate, example: "Academic Registrar" },
    ],
  },
];

// Mock Student Records for Live Preview Toggle
const SAMPLE_STUDENTS = [
  {
    recipient_name: "Aisha Mohammed Bello",
    student_id: "20220001",
    course_title: "Bachelor of Science in Software Engineering",
    grade_or_honours: "First Class Honours",
    cgpa: "4.82",
    faculty: "Faculty of Computing Studies",
    department: "Software Engineering",
    senate_date: "30th October, 2026",
    issue_date: "31st October, 2026",
    ref_number: "PD/REG/EXAM/2026/041",
    signatory_name: "Dr. Aliyu Sanusi Registrar",
    signatory_title: "Academic Registrar",
    email: "aisha.bello@campus.edu",
  },
  {
    recipient_name: "Chukwuemeka David Okafor",
    student_id: "20220002",
    course_title: "Bachelor of Science in Computer Science",
    grade_or_honours: "First Class Honours",
    cgpa: "4.65",
    faculty: "Faculty of Computing Studies",
    department: "Computer Science",
    senate_date: "30th October, 2026",
    issue_date: "31st October, 2026",
    ref_number: "PD/REG/EXAM/2026/042",
    signatory_name: "Dr. Aliyu Sanusi Registrar",
    signatory_title: "Academic Registrar",
    email: "c.okafor@campus.edu",
  },
  {
    recipient_name: "Fatima Zahra Ibrahim",
    student_id: "20220003",
    course_title: "Bachelor of Engineering in Civil Engineering",
    grade_or_honours: "Second Class Upper",
    cgpa: "4.41",
    faculty: "Faculty of Engineering",
    department: "Civil Engineering",
    senate_date: "30th October, 2026",
    issue_date: "31st October, 2026",
    ref_number: "PD/REG/EXAM/2026/043",
    signatory_name: "Dr. Aliyu Sanusi Registrar",
    signatory_title: "Academic Registrar",
    email: "fatima.ibrahim@campus.edu",
  },
];

export default function DocumentEditorPage() {
  const navigate = useNavigate();
  const { templateId } = useParams();
  const { isDesktopMode, desktopConfig } = useUser();

  // Document Metadata State
  const [docTitle, setDocTitle] = useState("Untitled Document");
  const [isFavorite, setIsFavorite] = useState(false);
  const [saveStatus, setSaveStatus] = useState("saved"); // saved | saving | unsaved
  const [isSaving, setIsSaving] = useState(false);

  // Editor State
  const [docHtml, setDocHtml] = useState(OFFICIAL_PRESETS[0].content);
  const [activeTab, setActiveTab] = useState("variables"); // variables | presets | security
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Preview Mode
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [selectedStudentIdx, setSelectedStudentIdx] = useState(0);

  // Formatting State
  const [currentFont, setCurrentFont] = useState("Times New Roman");
  const [currentFontSize, setCurrentFontSize] = useState("11");
  const [zoomLevel, setZoomLevel] = useState("100%");
  const [customVarName, setCustomVarName] = useState("");

  // Tamper-Proof Verification Stamp State
  const [includeQrCode, setIncludeQrCode] = useState(true);
  const [qrPosition, setQrPosition] = useState("bottom-right"); // bottom-right | bottom-left | header-right

  // References
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const lastSavedRef = useRef("");

  // Load existing template if editing
  useEffect(() => {
    if (!templateId) {
      setDocTitle(OFFICIAL_PRESETS[0].name);
      return;
    }

    const loadTemplate = async () => {
      try {
        const res = await getTemplate(templateId);
        if (res.data) {
          const t = res.data;
          setDocTitle(t.title || "Academic Document");
          if (t.layout_data?.html) {
            setDocHtml(t.layout_data.html);
          } else if (t.custom_text?.body) {
            setDocHtml(t.custom_text.body);
          }
          if (t.layout_data?.includeQrCode !== undefined) {
            setIncludeQrCode(t.layout_data.includeQrCode);
          }
          if (t.layout_data?.qrPosition) {
            setQrPosition(t.layout_data.qrPosition);
          }
        }
      } catch (err) {
        console.error("Failed to load template:", err);
        toast.error("Could not load template data.");
      }
    };
    loadTemplate();
  }, [templateId]);

  // Sync editor innerHTML when docHtml changes externally (e.g. preset selection or import)
  useEffect(() => {
    if (editorRef.current && !isPreviewMode) {
      if (editorRef.current.innerHTML !== docHtml) {
        editorRef.current.innerHTML = docHtml;
      }
    }
  }, [docHtml, isPreviewMode]);

  // Track edits inside editor
  const handleEditorInput = () => {
    if (editorRef.current && !isPreviewMode) {
      const current = editorRef.current.innerHTML;
      setDocHtml(current);
      setSaveStatus("unsaved");
    }
  };

  // Execute standard rich text formatting command
  const execCmd = (command, value = null) => {
    if (isPreviewMode) return;
    document.execCommand(command, false, value);
    if (editorRef.current) {
      setDocHtml(editorRef.current.innerHTML);
      setSaveStatus("unsaved");
    }
  };

  // Change font family
  const handleFontChange = (font) => {
    setCurrentFont(font);
    execCmd("fontName", font);
  };

  // Change font size
  const handleFontSizeChange = (size) => {
    setCurrentFontSize(size);
    // document.execCommand fontSize only takes 1-7, so we wrap selection in span with inline font-size
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const span = document.createElement("span");
      span.style.fontSize = `${size}pt`;
      const range = selection.getRangeAt(0);
      span.appendChild(range.extractContents());
      range.insertNode(span);
      handleEditorInput();
    }
  };

  // Insert Variable Chip at cursor
  const insertVariable = (variableKey, label = null) => {
    if (isPreviewMode) {
      toast("Exit preview mode to insert variables.", { icon: "ℹ️" });
      return;
    }

    const chipHtml = `&nbsp;<span class="pd-chip" data-var="${variableKey}" contenteditable="false" style="display: inline-flex; align-items: center; padding: 2px 7px; margin: 0 2px; font-weight: 700; font-size: 0.9em; background-color: #EEF2FF; color: #4338CA; border: 1px solid #C7D2FE; border-radius: 9999px; user-select: all;">${variableKey}</span>&nbsp;`;

    // Try standard insertion
    editorRef.current?.focus();
    const success = document.execCommand("insertHTML", false, chipHtml);
    if (!success) {
      // Fallback: append to document
      setDocHtml((prev) => prev + chipHtml);
    } else {
      handleEditorInput();
    }
    toast.success(`Inserted ${variableKey}`);
  };

  // Add custom variable
  const handleAddCustomVar = () => {
    const trimmed = customVarName.trim().toLowerCase().replace(/[^a-z0-9_]/g, "_");
    if (!trimmed) return;
    const formattedKey = `{{${trimmed}}}`;
    insertVariable(formattedKey);
    setCustomVarName("");
  };

  // Handle Drag & Drop of variable into canvas
  const handleDragStart = (e, variableKey) => {
    e.dataTransfer.setData("text/plain", variableKey);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (isPreviewMode) return;
    const variableKey = e.dataTransfer.getData("text/plain");
    if (variableKey && variableKey.startsWith("{{")) {
      insertVariable(variableKey);
    }
  };

  // Load a university preset
  const handleSelectPreset = (preset) => {
    if (saveStatus === "unsaved" && !window.confirm("Replace current content with preset? Unsaved changes will be replaced.")) {
      return;
    }
    setDocTitle(preset.name);
    setDocHtml(preset.content);
    setSaveStatus("saved");
    toast.success(`Loaded "${preset.name}" preset`);
  };

  // --- IMPORT DOCUMENT (.DOCX, .PDF, .TXT) ---
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();
    toast.loading(`Importing ${file.name}...`, { id: "import-toast" });

    try {
      if (fileName.endsWith(".docx")) {
        // Client-side Word (.docx) parsing with mammoth
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });
        const html = result.value;

        // Wrap inside clean A4 container structure
        const structuredHtml = `
          <div style="font-family: 'Times New Roman', serif; font-size: 14px; line-height: 1.8; color: #1F2937;">
            ${html}
          </div>
        `;
        setDocHtml(structuredHtml);
        setDocTitle(file.name.replace(/\.[^/.]+$/, ""));
        setSaveStatus("unsaved");
        toast.success("Word (.docx) imported successfully!", { id: "import-toast" });
      } else if (fileName.endsWith(".txt")) {
        // Plain text
        const text = await file.text();
        const paragraphs = text
          .split(/\n\s*\n/)
          .map((p) => `<p style="font-size: 14px; line-height: 1.8; margin-bottom: 14px;">${p.replace(/\n/g, "<br/>")}</p>`)
          .join("");
        setDocHtml(paragraphs);
        setDocTitle(file.name.replace(/\.[^/.]+$/, ""));
        setSaveStatus("unsaved");
        toast.success("Text document imported!", { id: "import-toast" });
      } else if (fileName.endsWith(".pdf")) {
        // PDF notice
        toast.dismiss("import-toast");
        toast("PDF files contain compiled layout. For best fidelity, upload .docx or copy/paste formatted text directly.", {
          duration: 5000,
          icon: "💡",
        });
      } else {
        toast.error("Please upload a .docx or .txt document.", { id: "import-toast" });
      }
    } catch (err) {
      console.error("Import error:", err);
      toast.error("Failed to parse document. Please check the file.", { id: "import-toast" });
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // --- SAVE DOCUMENT TEMPLATE TO PROOFDECK ---
  const handleSaveTemplate = async () => {
    setIsSaving(true);
    setSaveStatus("saving");

    const layoutData = {
      html: docHtml,
      includeQrCode,
      qrPosition,
      fontFamily: currentFont,
      fontSize: currentFontSize,
      isA4Portrait: true,
      type: "academic_document",
    };

    const formData = new FormData();
    formData.append("title", docTitle.trim() || "Untitled Document Template");
    formData.append("layout_style", "document");
    formData.append("layout_data", JSON.stringify(layoutData));

    try {
      if (templateId) {
        await updateCustomTemplate(templateId, formData);
        toast.success("Document template updated!");
      } else {
        const res = await createCustomTemplate(formData);
        const newId = res.data?.template_id || res.data?.id;
        toast.success("Document template saved to vault!");
        if (newId) {
          navigate(`/dashboard/documents/editor/${newId}`, { replace: true });
        }
      }
      setSaveStatus("saved");
    } catch (err) {
      console.error("Save error:", err);
      toast.error(err.response?.data?.msg || "Failed to save template.");
      setSaveStatus("unsaved");
    } finally {
      setIsSaving(false);
    }
  };

  // --- LIVE PREVIEW MERGE RENDERER ---
  const renderMergedPreview = () => {
    const student = SAMPLE_STUDENTS[selectedStudentIdx] || SAMPLE_STUDENTS[0];
    let merged = docHtml;

    // Replace all variable keys with student data
    Object.keys(student).forEach((key) => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
      merged = merged.replace(
        regex,
        `<span style="background-color: #FEF3C7; color: #92400E; font-weight: 700; padding: 1px 4px; border-radius: 4px;">${student[key]}</span>`
      );
    });

    return merged;
  };

  // Export as Print / PDF
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col h-screen bg-[#F9FBFD] select-none overflow-hidden font-sans">
      <Toaster position="top-right" />
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".docx,.txt,.pdf"
        className="hidden"
      />

      {/* --- GOOGLE DOCS TOP NAVIGATION HEADER --- */}
      <header className="bg-white border-b border-[#E6E8EC] px-4 py-2 shrink-0 z-30">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Doc Icon + Title + Menubar */}
          <div className="flex items-center gap-3 min-w-0">
            <Link
              to="/dashboard/templates"
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors shrink-0 no-underline"
              title="Return to Templates Library"
            >
              <ArrowLeft size={20} weight="bold" />
            </Link>

            <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <FileText size={22} weight="fill" />
            </div>

            <div className="min-w-0">
              {/* Inline Document Title */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={docTitle}
                  onChange={(e) => {
                    setDocTitle(e.target.value);
                    setSaveStatus("unsaved");
                  }}
                  className="text-base sm:text-lg font-bold text-slate-800 hover:bg-slate-50 focus:bg-white border border-transparent hover:border-slate-300 focus:border-blue-500 rounded px-1.5 py-0.5 outline-none transition-all w-60 sm:w-80 truncate"
                  placeholder="Document Title"
                />
                <button
                  type="button"
                  onClick={() => setIsFavorite(!isFavorite)}
                  className={`p-1 rounded hover:bg-slate-100 cursor-pointer ${
                    isFavorite ? "text-amber-500" : "text-slate-400"
                  }`}
                  title="Favorite"
                >
                  <Star size={16} weight={isFavorite ? "fill" : "regular"} />
                </button>

                {/* Cloud Save Status Indicator */}
                <span className="flex items-center gap-1 text-[11px] font-medium text-slate-400 ml-1">
                  {saveStatus === "saving" ? (
                    <>
                      <Cloud size={14} className="animate-pulse text-blue-500" />
                      <span>Saving...</span>
                    </>
                  ) : saveStatus === "unsaved" ? (
                    <>
                      <Cloud size={14} className="text-amber-500" />
                      <span className="text-amber-600">Unsaved changes</span>
                    </>
                  ) : (
                    <>
                      <CloudCheck size={14} weight="fill" className="text-emerald-500" />
                      <span>Saved in vault</span>
                    </>
                  )}
                </span>
              </div>

              {/* Menubar (Google Docs style) */}
              <div className="hidden sm:flex items-center gap-3 text-xs text-slate-600 font-medium mt-0.5">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="hover:text-blue-600 cursor-pointer"
                >
                  File
                </button>
                <button
                  type="button"
                  onClick={() => execCmd("undo")}
                  className="hover:text-blue-600 cursor-pointer"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setIsSidebarOpen(true)}
                  className="hover:text-blue-600 cursor-pointer"
                >
                  Insert Variable
                </button>
                <button
                  type="button"
                  onClick={() => execCmd("removeFormat")}
                  className="hover:text-blue-600 cursor-pointer"
                >
                  Format
                </button>
                <button
                  type="button"
                  onClick={() => toast(`Word count: ${docHtml.replace(/<[^>]+>/g, "").split(/\s+/).filter(Boolean).length} words`)}
                  className="hover:text-blue-600 cursor-pointer"
                >
                  Tools
                </button>
              </div>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Import Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors cursor-pointer shadow-2xs"
            >
              <UploadSimple size={15} weight="bold" />
              <span className="hidden md:inline">Import .DOCX / .PDF</span>
            </button>

            {/* Live Student Preview Toggle */}
            <button
              type="button"
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-xs transition-colors cursor-pointer shadow-2xs ${
                isPreviewMode
                  ? "bg-amber-100 text-amber-900 border border-amber-300"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
              }`}
            >
              <Eye size={15} weight="bold" />
              <span>{isPreviewMode ? "Exit Preview" : "Preview Student Data"}</span>
            </button>

            {/* Print / Export Button */}
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors cursor-pointer shadow-2xs"
              title="Print / Save PDF"
            >
              <Printer size={15} weight="bold" />
              <span className="hidden sm:inline">Print / PDF</span>
            </button>

            {/* Primary Save Template Button */}
            <button
              type="button"
              onClick={handleSaveTemplate}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              <CloudCheck size={16} weight="bold" />
              <span>{isSaving ? "Saving..." : "Save Template"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* --- GOOGLE DOCS FORMATTING TOOLBAR --- */}
      <div className="bg-[#F1F3F4] border-b border-[#D8DBDE] px-4 py-1.5 flex items-center gap-1.5 overflow-x-auto shrink-0 z-20">
        {/* Undo / Redo */}
        <button
          type="button"
          onClick={() => execCmd("undo")}
          className="p-1.5 rounded hover:bg-white text-slate-700 cursor-pointer disabled:opacity-40"
          title="Undo (Ctrl+Z)"
        >
          <ArrowCounterClockwise size={15} weight="bold" />
        </button>
        <button
          type="button"
          onClick={() => execCmd("redo")}
          className="p-1.5 rounded hover:bg-white text-slate-700 cursor-pointer disabled:opacity-40"
          title="Redo (Ctrl+Y)"
        >
          <ArrowClockwise size={15} weight="bold" />
        </button>
        <button
          type="button"
          onClick={handlePrint}
          className="p-1.5 rounded hover:bg-white text-slate-700 cursor-pointer"
          title="Print"
        >
          <Printer size={15} weight="bold" />
        </button>

        <div className="h-4 w-px bg-slate-300 mx-1" />

        {/* Zoom */}
        <select
          value={zoomLevel}
          onChange={(e) => setZoomLevel(e.target.value)}
          className="bg-transparent hover:bg-white text-slate-800 text-xs font-semibold px-1.5 py-1 rounded border-0 outline-none cursor-pointer"
        >
          <option value="75%">75%</option>
          <option value="90%">90%</option>
          <option value="100%">100%</option>
          <option value="125%">125%</option>
        </select>

        <div className="h-4 w-px bg-slate-300 mx-1" />

        {/* Font Family Selector */}
        <select
          value={currentFont}
          onChange={(e) => handleFontChange(e.target.value)}
          className="bg-transparent hover:bg-white text-slate-800 text-xs font-semibold px-2 py-1 rounded border-0 outline-none cursor-pointer max-w-[130px] truncate"
        >
          <option value="Times New Roman">Times New Roman</option>
          <option value="Arial">Arial</option>
          <option value="Georgia">Georgia</option>
          <option value="Calibri">Calibri</option>
          <option value="Merriweather">Merriweather</option>
          <option value="Courier New">Courier New</option>
        </select>

        {/* Font Size Increment / Decrement */}
        <div className="flex items-center bg-white rounded border border-slate-300 px-1 py-0.5">
          <button
            type="button"
            onClick={() => handleFontSizeChange(Math.max(8, parseInt(currentFontSize) - 1).toString())}
            className="px-1 text-slate-600 hover:text-black font-bold text-xs cursor-pointer"
          >
            -
          </button>
          <span className="px-1.5 text-xs font-bold text-slate-800 min-w-[20px] text-center">
            {currentFontSize}
          </span>
          <button
            type="button"
            onClick={() => handleFontSizeChange((parseInt(currentFontSize) + 1).toString())}
            className="px-1 text-slate-600 hover:text-black font-bold text-xs cursor-pointer"
          >
            +
          </button>
        </div>

        <div className="h-4 w-px bg-slate-300 mx-1" />

        {/* Bold, Italic, Underline, Strikethrough */}
        <button
          type="button"
          onClick={() => execCmd("bold")}
          className="p-1.5 rounded hover:bg-white text-slate-700 font-black cursor-pointer"
          title="Bold (Ctrl+B)"
        >
          <TextB size={15} weight="bold" />
        </button>
        <button
          type="button"
          onClick={() => execCmd("italic")}
          className="p-1.5 rounded hover:bg-white text-slate-700 cursor-pointer"
          title="Italic (Ctrl+I)"
        >
          <TextItalic size={15} weight="bold" />
        </button>
        <button
          type="button"
          onClick={() => execCmd("underline")}
          className="p-1.5 rounded hover:bg-white text-slate-700 cursor-pointer"
          title="Underline (Ctrl+U)"
        >
          <TextUnderline size={15} weight="bold" />
        </button>
        <button
          type="button"
          onClick={() => execCmd("strikeThrough")}
          className="p-1.5 rounded hover:bg-white text-slate-700 cursor-pointer"
          title="Strikethrough"
        >
          <TextStrikethrough size={15} weight="bold" />
        </button>

        <div className="h-4 w-px bg-slate-300 mx-1" />

        {/* Alignment */}
        <button
          type="button"
          onClick={() => execCmd("justifyLeft")}
          className="p-1.5 rounded hover:bg-white text-slate-700 cursor-pointer"
          title="Align Left"
        >
          <TextAlignLeft size={15} weight="bold" />
        </button>
        <button
          type="button"
          onClick={() => execCmd("justifyCenter")}
          className="p-1.5 rounded hover:bg-white text-slate-700 cursor-pointer"
          title="Align Center"
        >
          <TextAlignCenter size={15} weight="bold" />
        </button>
        <button
          type="button"
          onClick={() => execCmd("justifyRight")}
          className="p-1.5 rounded hover:bg-white text-slate-700 cursor-pointer"
          title="Align Right"
        >
          <TextAlignRight size={15} weight="bold" />
        </button>
        <button
          type="button"
          onClick={() => execCmd("justifyFull")}
          className="p-1.5 rounded hover:bg-white text-slate-700 cursor-pointer"
          title="Justify"
        >
          <TextAlignJustify size={15} weight="bold" />
        </button>

        <div className="h-4 w-px bg-slate-300 mx-1" />

        {/* Lists & Indent */}
        <button
          type="button"
          onClick={() => execCmd("insertUnorderedList")}
          className="p-1.5 rounded hover:bg-white text-slate-700 cursor-pointer"
          title="Bulleted List"
        >
          <ListBullets size={15} weight="bold" />
        </button>
        <button
          type="button"
          onClick={() => execCmd("insertOrderedList")}
          className="p-1.5 rounded hover:bg-white text-slate-700 cursor-pointer"
          title="Numbered List"
        >
          <ListNumbers size={15} weight="bold" />
        </button>
        <button
          type="button"
          onClick={() => execCmd("outdent")}
          className="p-1.5 rounded hover:bg-white text-slate-700 cursor-pointer"
          title="Decrease Indent"
        >
          <TextOutdent size={15} weight="bold" />
        </button>
        <button
          type="button"
          onClick={() => execCmd("indent")}
          className="p-1.5 rounded hover:bg-white text-slate-700 cursor-pointer"
          title="Increase Indent"
        >
          <TextIndent size={15} weight="bold" />
        </button>

        <div className="h-4 w-px bg-slate-300 mx-1" />

        {/* Quick Variable Insert Button */}
        <button
          type="button"
          onClick={() => setIsSidebarOpen(true)}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-indigo-100 text-indigo-700 hover:bg-indigo-200 font-bold text-xs transition-colors cursor-pointer"
          title="Open Student Variables"
        >
          <Sparkle size={14} weight="fill" />
          <span>Insert Variable</span>
        </button>
      </div>

      {/* --- PREVIEW BANNER (IF ACTIVE) --- */}
      {isPreviewMode && (
        <div className="bg-amber-500 text-white px-4 py-2 flex items-center justify-between text-xs font-semibold shadow-xs shrink-0 z-20">
          <div className="flex items-center gap-2">
            <Eye size={18} weight="bold" />
            <span>
              LIVE PREVIEW MODE — Viewing merged output with real student records. Variables are rendered in yellow.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-amber-100 font-medium">Switch Student:</span>
            <select
              value={selectedStudentIdx}
              onChange={(e) => setSelectedStudentIdx(parseInt(e.target.value))}
              className="bg-white text-slate-900 font-bold px-2 py-0.5 rounded outline-none border-0 text-xs"
            >
              {SAMPLE_STUDENTS.map((s, idx) => (
                <option key={s.student_id} value={idx}>
                  {s.student_id} — {s.recipient_name} ({s.grade_or_honours})
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* --- MAIN WORKSPACE AREA --- */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* --- LEFT COLLAPSIBLE SIDEBAR (Google Docs Document Tabs) --- */}
        <aside
          className={`bg-white border-r border-[#E6E8EC] flex flex-col shrink-0 transition-all duration-300 z-10 ${
            isSidebarOpen ? "w-80" : "w-12"
          }`}
        >
          {/* Sidebar Header */}
          <div className="p-3 border-b border-slate-100 flex items-center justify-between">
            {isSidebarOpen ? (
              <div className="flex items-center gap-2 font-bold text-xs text-slate-800">
                <FolderOpen size={16} weight="bold" className="text-blue-600" />
                <span>Document Tools & Variables</span>
              </div>
            ) : null}
            <button
              type="button"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1 rounded text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors mx-auto cursor-pointer"
              title={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              {isSidebarOpen ? <ArrowLeft size={16} weight="bold" /> : <CaretRight size={16} weight="bold" />}
            </button>
          </div>

          {isSidebarOpen && (
            <>
              {/* Tabs Switcher */}
              <div className="flex border-b border-slate-100 bg-slate-50 p-1 gap-1">
                <button
                  type="button"
                  onClick={() => setActiveTab("variables")}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                    activeTab === "variables"
                      ? "bg-white text-indigo-700 shadow-2xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Variables
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("presets")}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                    activeTab === "presets"
                      ? "bg-white text-indigo-700 shadow-2xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Presets
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("security")}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                    activeTab === "security"
                      ? "bg-white text-indigo-700 shadow-2xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Security & QR
                </button>
              </div>

              {/* Tab 1: Dynamic Merge Variables */}
              {activeTab === "variables" && (
                <div className="flex-1 overflow-y-auto p-4 space-y-5">
                  <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-3 text-xs text-indigo-900 leading-relaxed">
                    <div className="font-bold mb-1 flex items-center gap-1.5">
                      <Sparkle size={14} weight="fill" className="text-indigo-600" />
                      <span>Drag or Click to Insert:</span>
                    </div>
                    Drag any variable chip into the document, or click to insert at your cursor position.
                  </div>

                  {MERGE_VARIABLES.map((grp) => (
                    <div key={grp.category} className="space-y-2">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        {grp.category}
                      </div>
                      <div className="space-y-1.5">
                        {grp.vars.map((v) => {
                          const IconComp = v.icon;
                          return (
                            <div
                              key={v.key}
                              draggable
                              onDragStart={(e) => handleDragStart(e, v.key)}
                              onClick={() => insertVariable(v.key, v.label)}
                              className="group flex items-center justify-between p-2 rounded-lg border border-slate-200 bg-white hover:border-indigo-400 hover:bg-indigo-50/30 transition-all cursor-grab active:cursor-grabbing shadow-2xs"
                              title={`Drag or click to insert ${v.key}`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="w-6 h-6 rounded bg-slate-100 group-hover:bg-indigo-100 text-slate-600 group-hover:text-indigo-700 flex items-center justify-center shrink-0">
                                  <IconComp size={13} weight="bold" />
                                </div>
                                <div className="min-w-0">
                                  <div className="text-xs font-bold text-slate-800 truncate">
                                    {v.label}
                                  </div>
                                  <div className="text-[10px] text-slate-400 font-mono">
                                    {v.key}
                                  </div>
                                </div>
                              </div>
                              <Plus
                                size={14}
                                weight="bold"
                                className="text-slate-400 group-hover:text-indigo-600 shrink-0"
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  {/* Add Custom Variable Field */}
                  <div className="pt-3 border-t border-slate-100">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Custom Variable
                    </div>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={customVarName}
                        onChange={(e) => setCustomVarName(e.target.value)}
                        placeholder="e.g. nysc_call_up_no"
                        className="flex-1 px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 font-mono"
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomVar}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-black text-white text-xs font-bold rounded-lg cursor-pointer"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: University Official Presets */}
              {activeTab === "presets" && (
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  <div className="text-xs text-slate-500 mb-2">
                    Select an official template to populate standard legal text approved by university senates:
                  </div>

                  {OFFICIAL_PRESETS.map((p) => {
                    const PresetIcon = p.icon;
                    return (
                      <div
                        key={p.id}
                        onClick={() => handleSelectPreset(p)}
                        className="p-3 rounded-xl border border-slate-200 bg-white hover:border-blue-400 hover:bg-blue-50/20 transition-all cursor-pointer shadow-2xs group"
                      >
                        <div className="flex items-center gap-2.5 mb-1.5">
                          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                            <PresetIcon size={16} weight="bold" />
                          </div>
                          <div className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {p.name}
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed mb-0 pl-9">
                          {p.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Tab 3: Institutional Security & Seals */}
              {activeTab === "security" && (
                <div className="flex-1 overflow-y-auto p-4 space-y-5">
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-xs text-emerald-900 leading-relaxed">
                    <div className="font-bold mb-1 flex items-center gap-1.5">
                      <ShieldCheck size={16} weight="fill" className="text-emerald-600" />
                      <span>Tamper-Proof Verification</span>
                    </div>
                    ProofDeck embeds a unique cryptographic QR verification stamp on every generated document.
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800">
                        Include Verification QR Stamp
                      </label>
                      <input
                        type="checkbox"
                        checked={includeQrCode}
                        onChange={(e) => setIncludeQrCode(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 cursor-pointer"
                      />
                    </div>

                    {includeQrCode && (
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-600">
                          QR Code Position:
                        </label>
                        <select
                          value={qrPosition}
                          onChange={(e) => setQrPosition(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium outline-none focus:border-blue-500"
                        >
                          <option value="bottom-right">Bottom-Right (Standard)</option>
                          <option value="bottom-left">Bottom-Left</option>
                          <option value="header-right">Top Header (Right)</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </aside>

        {/* --- GOOGLE DOCS A4 PAGE CANVAS --- */}
        <main
          className="flex-1 overflow-y-auto p-6 md:p-12 flex justify-center bg-[#F9FBFD]"
          style={{ transform: `scale(${parseFloat(zoomLevel) / 100})`, transformOrigin: "top center" }}
        >
          {/* The White A4 Paper */}
          <div
            className="bg-white text-slate-900 shadow-xl border border-[#D5D8DC] relative transition-all"
            style={{
              width: "210mm",
              minHeight: "297mm",
              padding: "25mm 25mm 25mm 25mm", // Standard 1-inch printable margin
              boxSizing: "border-box",
            }}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            {/* Header Verification QR (if configured) */}
            {includeQrCode && qrPosition === "header-right" && (
              <div className="absolute top-6 right-6 flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-lg text-right">
                <div>
                  <div className="text-[9px] font-bold text-slate-800 uppercase tracking-wider">
                    SCAN TO VERIFY
                  </div>
                  <div className="text-[8px] text-slate-500">Official Senate Record</div>
                </div>
                <div className="w-12 h-12 bg-white border border-slate-200 p-1 rounded flex items-center justify-center">
                  <QrCode size={40} className="text-slate-900" />
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
                className="prose max-w-none text-slate-900 leading-relaxed outline-none focus:outline-none min-h-[700px]"
                style={{
                  fontFamily: currentFont,
                  fontSize: `${currentFontSize}pt`,
                }}
              />
            )}

            {/* Bottom Verification QR Stamp (Standard Bottom-Right or Bottom-Left) */}
            {includeQrCode && (qrPosition === "bottom-right" || qrPosition === "bottom-left") && (
              <div
                className={`mt-16 pt-6 border-t border-slate-200 flex items-center gap-3 ${
                  qrPosition === "bottom-right" ? "justify-end" : "justify-start"
                }`}
              >
                <div className="w-14 h-14 bg-white border border-slate-300 p-1 rounded shadow-2xs flex items-center justify-center">
                  <QrCode size={48} className="text-slate-900" />
                </div>
                <div className="text-left">
                  <div className="text-[10px] font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1">
                    <ShieldCheck size={13} weight="fill" className="text-emerald-600" />
                    <span>ProofDeck Verified Academic Document</span>
                  </div>
                  <div className="text-[9px] text-slate-500 font-mono mt-0.5">
                    Doc ID: <span className="font-semibold text-slate-700">PD-DOC-2026-X7941</span>
                  </div>
                  <div className="text-[9px] text-slate-400">
                    Scan with any smartphone camera to authenticate Senate records
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
