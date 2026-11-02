import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useParams, Link, useLocation } from "react-router-dom";
import mammoth from "mammoth";
import { jsPDF } from "jspdf";
import { toast, Toaster } from "react-hot-toast";
import { Modal } from "react-bootstrap";
import {
  FileText,
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
  PuzzlePiece,
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
  ArrowClockwise,
  ArrowCounterClockwise,
  Highlighter,
  Play,
  DownloadSimple,
  Table,
  TextT,
  ArrowsOutLineVertical,
  Eraser,
  Check,
  FilePdf,
  FileDoc,
  PenNib,
  SealCheck,
  Sparkle,
  CaretDoubleLeft,
  CaretDoubleRight,
  LinkBreak,
  X,
} from "@phosphor-icons/react";
import { createCustomTemplate, getTemplate, updateCustomTemplate } from "../api";
import { useUser } from "../context/UserContext";
import { useTour } from "../context/TourContext";
import AppButton from "../components/ui/AppButton";
import { encodeDocUuid, decodeDocUuid } from "../utils/docUuid";
import { exportDocumentToPdf, exportDocumentToDocx } from "../utils/docExport";

// --- PROOFDECK BRAND DOCUMENT ICON (Distinct, Legal & Authentic) ---
export const ProofDeckDocIcon = ({ size = 26, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 ${className}`}
  >
    <defs>
      <linearGradient id="pdDocGradEditor" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#6355F6" />
        <stop offset="100%" stopColor="#4336D0" />
      </linearGradient>
    </defs>
    <rect x="5" y="3" width="22" height="26" rx="4" fill="url(#pdDocGradEditor)" />
    <path d="M19 3 L27 11 L19 11 Z" fill="#C7D2FE" opacity="0.9" />
    <rect x="9" y="14" width="14" height="2" rx="1" fill="#FFFFFF" opacity="0.95" />
    <rect x="9" y="18" width="11" height="2" rx="1" fill="#FFFFFF" opacity="0.8" />
    <rect x="9" y="22" width="7" height="2" rx="1" fill="#FFFFFF" opacity="0.65" />
    <circle cx="21" cy="22" r="3.5" fill="#FBBF24" />
    <circle cx="21" cy="22" r="2" fill="#D97706" />
  </svg>
);

// --- GOOGLE DOCS BLOCK STYLE DEFINITIONS ---
const BLOCK_STYLES = [
  { id: "p", label: "Normal text", tag: "P", previewClass: "text-sm font-normal text-slate-800" },
  { id: "title", label: "Title", tag: "H1", className: "doc-title", previewClass: "text-2xl font-bold text-slate-900" },
  { id: "subtitle", label: "Subtitle", tag: "P", className: "doc-subtitle", previewClass: "text-base font-normal text-slate-500" },
  { id: "h1", label: "Heading 1", tag: "H1", previewClass: "text-xl font-bold text-slate-900" },
  { id: "h2", label: "Heading 2", tag: "H2", previewClass: "text-lg font-bold text-slate-800" },
  { id: "h3", label: "Heading 3", tag: "H3", previewClass: "text-base font-bold text-slate-800" },
  { id: "h4", label: "Heading 4", tag: "H4", previewClass: "text-sm font-bold text-slate-700" },
];

const FONT_FAMILIES = [
  "Arial",
  "Times New Roman",
  "Georgia",
  "Calibri",
  "Garamond",
  "Verdana",
  "Trebuchet MS",
  "Courier New",
  "Playfair Display",
  "Montserrat",
  "Plus Jakarta Sans",
];

const FONT_SIZES = ["8", "9", "10", "11", "12", "14", "16", "18", "20", "24", "28", "32", "36", "48", "72"];

const TEXT_COLORS = [
  "#000000", "#1e293b", "#475569", "#94a3b8",
  "#dc2626", "#ea580c", "#d97706", "#16a34a",
  "#0284c7", "#2563eb", "#4f46e5", "#7c3aed",
  "#be185d", "#1e3a8a", "#064e3b", "#78350f",
];

const HIGHLIGHT_COLORS = [
  "transparent",
  "#fef08a",
  "#bbf7d0",
  "#bae6fd",
  "#e9d5ff",
  "#fbcfe8",
  "#fed7aa",
  "#e2e8f0",
];

/**
 * Paginates HTML string into discrete A4 page sheets
 * Uses semantic DOM parsing so multi-page pasted content splits cleanly without breaking tags
 */
export function paginateHtml(html) {
  if (!html || !html.trim()) return ["<p><br></p>"];

  // 1. Check for explicit page break markers first
  const explicitBreakRegex = /(?:<div[^>]*class=["'][^"']*pd-page-break[^"']*["'][^>]*>[\s\S]*?<\/div>|<div[^>]*style=["'][^"']*(?:page-break-after:\s*always|break-after:\s*page)[^"']*["'][^>]*>[\s\S]*?<\/div>|<hr[^>]*class=["'][^"']*pd-page-break[^"']*["'][^>]*>|<!--\s*pagebreak\s*-->)/gi;
  if (explicitBreakRegex.test(html)) {
    const parts = html
      .split(explicitBreakRegex)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
    if (parts.length > 0) {
      // Also paginate any individual part that is itself very long
      const expanded = [];
      for (const part of parts) {
        expanded.push(...paginateSingleChunk(part));
      }
      return expanded.length > 0 ? expanded : ["<p><br></p>"];
    }
  }

  return paginateSingleChunk(html);
}

function paginateSingleChunk(html) {
  if (!html || !html.trim()) return ["<p><br></p>"];

  if (typeof document === "undefined") {
    return [html];
  }

  try {
    const temp = document.createElement("div");
    temp.innerHTML = html;

    // Convert bare text nodes or double <br> into proper <p> blocks
    const children = Array.from(temp.childNodes);
    const normalizedBlocks = [];

    for (const node of children) {
      if (node.nodeType === Node.TEXT_NODE) {
        const txt = node.textContent.trim();
        if (txt) {
          const lines = txt.split(/\n{2,}/);
          for (const l of lines) {
            if (l.trim()) {
              const p = document.createElement("p");
              p.textContent = l.trim();
              normalizedBlocks.push(p.outerHTML);
            }
          }
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const tag = node.tagName.toUpperCase();
        // If a single <p> or <div> has huge plain text with many line breaks, split by <br> or \n
        const innerLen = (node.textContent || "").length;
        if ((tag === "P" || tag === "DIV") && innerLen > 1200 && node.innerHTML.includes("<br")) {
          const subParts = node.innerHTML.split(/(?:<br\s*\/?>\s*){2,}/i);
          if (subParts.length > 1) {
            for (const sp of subParts) {
              if (sp.trim()) normalizedBlocks.push(`<p>${sp.trim()}</p>`);
            }
            continue;
          }
        }
        normalizedBlocks.push(node.outerHTML);
      }
    }

    if (normalizedBlocks.length === 0) return [html];

    // Estimate A4 page capacity (~2400 characters or ~36 visual lines per A4 sheet)
    const MAX_VISUAL_LINES = 36;
    const CHARS_PER_LINE = 78;

    const pages = [];
    let currentBlocks = [];
    let currentLines = 0;

    for (const blockHtml of normalizedBlocks) {
      const plain = blockHtml.replace(/<[^>]+>/g, "").trim();
      const isHeading = /^<h[1-4]/i.test(blockHtml);
      const isTable = /^<table/i.test(blockHtml);
      const isHr = /^<hr/i.test(blockHtml);

      if (isTable) {
        const tblWrap = document.createElement("div");
        tblWrap.innerHTML = blockHtml;
        const tblEl = tblWrap.querySelector("table");
        const theadEl = tblEl?.querySelector("thead");
        const theadHtml = theadEl ? theadEl.outerHTML : "";
        const bodyRows = tblEl
          ? Array.from(tblEl.querySelectorAll("tr")).filter(
              (r) => r.parentElement?.tagName.toUpperCase() !== "THEAD"
            )
          : [];

        if (bodyRows.length > 0) {
          let rowQueue = [...bodyRows];
          while (rowQueue.length > 0) {
            const remainingLines = MAX_VISUAL_LINES - currentLines;
            const headerCost = theadHtml ? 2.2 : 0.5;
            // Need at least space for header + 1 row (~4.5 visual lines)
            if (remainingLines < 4.5 && currentBlocks.length > 0) {
              pages.push(currentBlocks.join("\n"));
              currentBlocks = [];
              currentLines = 0;
              continue;
            }

            let usedLines = headerCost;
            const chunkRows = [];
            while (rowQueue.length > 0) {
              const r = rowQueue[0];
              const rowTextLen = (r.textContent || "").trim().length;
              const rowLines = Math.max(1.8, Math.ceil(rowTextLen / 65) * 1.4 + 0.6);
              if (chunkRows.length > 0 && currentLines + usedLines + rowLines > MAX_VISUAL_LINES) {
                break;
              }
              chunkRows.push(rowQueue.shift().outerHTML);
              usedLines += rowLines;
            }

            const chunkTableHtml = `<table>${theadHtml}<tbody>${chunkRows.join("")}</tbody></table>`;
            currentBlocks.push(chunkTableHtml);
            currentLines += usedLines;

            if (rowQueue.length > 0) {
              pages.push(currentBlocks.join("\n"));
              currentBlocks = [];
              currentLines = 0;
            }
          }
          continue;
        }
      }

      let blockLines = Math.max(1, Math.ceil(plain.length / CHARS_PER_LINE));
      if (isHeading) blockLines += 1.8;
      else if (isHr) blockLines += 1;
      else blockLines += 0.65; // paragraph bottom margin

      if (currentLines + blockLines > MAX_VISUAL_LINES && currentBlocks.length > 0) {
        pages.push(currentBlocks.join("\n"));
        currentBlocks = [blockHtml];
        currentLines = blockLines;
      } else {
        currentBlocks.push(blockHtml);
        currentLines += blockLines;
      }
    }

    if (currentBlocks.length > 0) {
      pages.push(currentBlocks.join("\n"));
    }

    return pages.length > 0 ? pages : [html];
  } catch (err) {
    console.error("Pagination fallback triggered:", err);
    return [html];
  }
}

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
        <h2 style="margin: 0; font-size: 20pt; font-weight: 800; letter-spacing: 0.5px; color: #111827;">OFFICE OF THE ACADEMIC REGISTRAR</h2>
        <h3 style="margin: 4px 0 0 0; font-size: 12pt; font-weight: 700; color: #374151;">EXAMINATIONS AND ACADEMIC RECORDS DIVISION</h3>
        <p style="margin: 4px 0 0 0; font-size: 10pt; color: #6B7280;">Administrative Complex, University Main Campus</p>
      </div>
      <hr style="border: 0; border-top: 2px solid #111827; margin: 16px 0 24px 0;" />
      
      <div style="display: flex; justify-content: space-between; font-size: 11pt; font-weight: 600; margin-bottom: 24px;">
        <div><strong>Ref:</strong> <span class="pd-chip" data-var="{{ref_number}}" contenteditable="false">{{ref_number}}</span></div>
        <div><strong>Date:</strong> <span class="pd-chip" data-var="{{issue_date}}" contenteditable="false">{{issue_date}}</span></div>
      </div>

      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="margin: 0; font-size: 16pt; font-weight: 800; text-decoration: underline; letter-spacing: 0.5px; color: #111827;">
          OFFICIAL STATEMENT OF RESULT
        </h1>
      </div>

      <p style="font-size: 11.5pt; line-height: 1.85; color: #1F2937; text-align: justify; margin-bottom: 16px;">
        This is to certify that <strong><span class="pd-chip" data-var="{{recipient_name}}" contenteditable="false">{{recipient_name}}</span></strong>, 
        with Registration Number <strong><span class="pd-chip" data-var="{{student_id}}" contenteditable="false">{{student_id}}</span></strong>, 
        having completed an approved course of study and passed the prescribed examinations, has on the recommendation of the Board of Studies of the Faculty of 
        <strong><span class="pd-chip" data-var="{{faculty}}" contenteditable="false">{{faculty}}</span></strong>, Department of 
        <strong><span class="pd-chip" data-var="{{department}}" contenteditable="false">{{department}}</span></strong>, been admitted on 
        <strong><span class="pd-chip" data-var="{{approval_date}}" contenteditable="false">{{approval_date}}</span></strong> to the Degree of:
      </p>

      <div style="text-align: center; margin: 22px 0; padding: 16px; background-color: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 8px;">
        <div style="font-size: 14pt; font-weight: 800; color: #111827; margin-bottom: 6px;">
          <span class="pd-chip" data-var="{{course_title}}" contenteditable="false">{{course_title}}</span>
        </div>
        <div style="font-size: 12pt; font-weight: 700; color: #374151;">
          With <span class="pd-chip" data-var="{{grade_or_honours}}" contenteditable="false">{{grade_or_honours}}</span> 
          (Cumulative Grade Point Average: <strong><span class="pd-chip" data-var="{{cgpa}}" contenteditable="false">{{cgpa}}</span></strong>)
        </div>
      </div>

      <p style="font-size: 11pt; line-height: 1.8; color: #374151; text-align: justify; margin-bottom: 32px;">
        The official certificate will be issued to him/her in due course upon surrender of this Statement of Result and clearance from all Directorates.
      </p>

      <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 44px;">
        <div style="text-align: left; max-width: 260px;">
          <div style="font-family: 'Times New Roman', serif; font-size: 16pt; font-style: italic; font-weight: bold; margin-bottom: 4px; color: #1E3A8A;">
            <span class="pd-chip" data-var="{{signatory_name}}" contenteditable="false">{{signatory_name}}</span>
          </div>
          <div style="border-top: 1.5px solid #374151; padding-top: 6px; font-size: 11pt; font-weight: 700; color: #111827;">
            <span class="pd-chip" data-var="{{signatory_title}}" contenteditable="false">{{signatory_title}}</span>
          </div>
          <div style="font-size: 9.5pt; color: #6B7280;">For: Academic Registrar & Secretary</div>
        </div>

        <div style="text-align: center; padding: 10px 18px; border: 2px dashed #9CA3AF; border-radius: 8px; font-size: 9.5pt; color: #6B7280;">
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
        <h2 style="margin: 0; font-size: 18pt; font-weight: 800; color: #111827;">DIRECTORATE OF ACADEMIC AFFAIRS</h2>
        <h3 style="margin: 4px 0 0 0; font-size: 12pt; font-weight: 700; color: #374151;">OFFICE OF THE REGISTRAR</h3>
        <p style="margin: 4px 0 0 0; font-size: 10pt; color: #6B7280;">Verification & International Credential Services</p>
      </div>
      <hr style="border: 0; border-top: 2px solid #111827; margin: 16px 0 24px 0;" />

      <div style="display: flex; justify-content: space-between; font-size: 11pt; font-weight: 600; margin-bottom: 24px;">
        <div><strong>Ref:</strong> <span class="pd-chip" data-var="{{ref_number}}" contenteditable="false">{{ref_number}}</span></div>
        <div><strong>Date:</strong> <span class="pd-chip" data-var="{{issue_date}}" contenteditable="false">{{issue_date}}</span></div>
      </div>

      <p style="font-size: 11pt; font-weight: 700; margin: 0 0 18px 0; color: #111827;">TO WHOM IT MAY CONCERN</p>

      <div style="text-align: center; margin-bottom: 22px;">
        <h2 style="margin: 0; font-size: 14pt; font-weight: 800; text-decoration: underline; color: #111827;">
          ATTESTATION OF ENGLISH AS MEDIUM OF INSTRUCTION
        </h2>
      </div>

      <p style="font-size: 11.5pt; line-height: 1.85; color: #1F2937; text-align: justify; margin-bottom: 16px;">
        This is to certify that <strong><span class="pd-chip" data-var="{{recipient_name}}" contenteditable="false">{{recipient_name}}</span></strong>, 
        bearing Registration Number <strong><span class="pd-chip" data-var="{{student_id}}" contenteditable="false">{{student_id}}</span></strong>, was a bona fide student in the 
        Department of <strong><span class="pd-chip" data-var="{{department}}" contenteditable="false">{{department}}</span></strong>, Faculty of 
        <strong><span class="pd-chip" data-var="{{faculty}}" contenteditable="false">{{faculty}}</span></strong>.
      </p>

      <p style="font-size: 11.5pt; line-height: 1.85; color: #1F2937; text-align: justify; margin-bottom: 16px;">
        We confirm that English Language is the sole medium of instruction, examination, research, and general communication for all undergraduate and postgraduate academic programs.
      </p>

      <div style="margin-top: 48px;">
        <div style="font-family: 'Times New Roman', serif; font-size: 16pt; font-style: italic; font-weight: bold; margin-bottom: 4px; color: #1E3A8A;">
          <span class="pd-chip" data-var="{{signatory_name}}" contenteditable="false">{{signatory_name}}</span>
        </div>
        <div style="border-top: 1.5px solid #374151; padding-top: 4px; font-size: 11pt; font-weight: 700; color: #111827; display: inline-block;">
          <span class="pd-chip" data-var="{{signatory_title}}" contenteditable="false">{{signatory_title}}</span>
        </div>
        <div style="font-size: 9.5pt; color: #6B7280; margin-top: 2px;">Director, Academic Planning & Records</div>
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
        <h2 style="margin: 0; font-size: 18pt; font-weight: 800; color: #111827;">OFFICE OF THE REGISTRAR</h2>
        <p style="margin: 4px 0 0 0; font-size: 10pt; color: #6B7280;">Student Academic Verification Unit</p>
      </div>
      <hr style="border: 0; border-top: 2px solid #111827; margin: 16px 0 24px 0;" />

      <div style="display: flex; justify-content: space-between; font-size: 11pt; font-weight: 600; margin-bottom: 24px;">
        <div><strong>Ref:</strong> <span class="pd-chip" data-var="{{ref_number}}" contenteditable="false">{{ref_number}}</span></div>
        <div><strong>Date:</strong> <span class="pd-chip" data-var="{{issue_date}}" contenteditable="false">{{issue_date}}</span></div>
      </div>

      <div style="text-align: center; margin-bottom: 22px;">
        <h2 style="margin: 0; font-size: 14pt; font-weight: 800; text-decoration: underline; color: #111827;">
          LETTER OF ATTESTATION
        </h2>
      </div>

      <p style="font-size: 11.5pt; line-height: 1.85; color: #1F2937; text-align: justify; margin-bottom: 16px;">
        This is to attest that <strong><span class="pd-chip" data-var="{{recipient_name}}" contenteditable="false">{{recipient_name}}</span></strong> 
        (Registration Number: <strong><span class="pd-chip" data-var="{{student_id}}" contenteditable="false">{{student_id}}</span></strong>) has satisfied all academic requirements for the award of 
        <strong><span class="pd-chip" data-var="{{course_title}}" contenteditable="false">{{course_title}}</span></strong>.
      </p>

      <p style="font-size: 11.5pt; line-height: 1.85; color: #1F2937; text-align: justify; margin-bottom: 16px;">
        This letter is issued upon request pending the issuance of the substantive diploma certificate.
      </p>

      <div style="margin-top: 48px;">
        <div style="font-family: 'Times New Roman', serif; font-size: 16pt; font-style: italic; font-weight: bold; margin-bottom: 4px; color: #1E3A8A;">
          <span class="pd-chip" data-var="{{signatory_name}}" contenteditable="false">{{signatory_name}}</span>
        </div>
        <div style="border-top: 1.5px solid #374151; padding-top: 4px; font-size: 11pt; font-weight: 700; color: #111827; display: inline-block;">
          <span class="pd-chip" data-var="{{signatory_title}}" contenteditable="false">{{signatory_title}}</span>
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
      { key: "{{approval_date}}", label: "Approval Date", icon: CalendarBlank },
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
    approval_date: "28th September 2026",
    ref_number: "ADM/CIT/2026/0491",
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
    approval_date: "28th September 2026",
    ref_number: "ADM/ENG/2026/1028",
    signatory_name: "Prof. Kenneth O. Mensah",
    signatory_title: "Academic Registrar",
    institution_name: "Apex University",
    recipient_email: "adeleke.d@example.edu",
  },
];

// Maximum printable height inside a 297mm A4 sheet with 25mm top/bottom padding (~930px at 96dpi)
const A4_CONTENT_MAX_HEIGHT_PX = 930;

export default function DocumentEditorPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const rawRouteParam = params.templateId || params.id || null;
  const resolvedRouteId = decodeDocUuid(rawRouteParam);

  const { user } = useUser();
  const { startTour } = useTour();

  // Track current document numeric ID in both state and ref so saves update in-place without remounting
  const [currentDocId, setCurrentDocId] = useState(resolvedRouteId);
  const currentDocIdRef = useRef(resolvedRouteId);
  const [isLoadingDoc, setIsLoadingDoc] = useState(Boolean(resolvedRouteId));

  // If the user opened a plain numeric URL like /dashboard/documents/editor/98, immediately mask it with its UUID
  useEffect(() => {
    if (rawRouteParam && /^\d+$/.test(String(rawRouteParam).trim()) && resolvedRouteId) {
      const uuidPath = `/dashboard/documents/editor/${encodeDocUuid(resolvedRouteId)}`;
      window.history.replaceState(null, "", uuidPath);
    }
  }, [rawRouteParam, resolvedRouteId]);

  const getInitialState = () => {
    if (resolvedRouteId) {
      return { title: "Loading document...", html: "<p><br></p>" };
    }
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const presetId = searchParams.get("preset");
      if (presetId && presetId !== "blank") {
        const found = OFFICIAL_PRESETS.find((p) => p.id === presetId);
        if (found) {
          return { title: found.title, html: found.content };
        }
      }
    }
    return { title: "Untitled document", html: "<p><br></p>" };
  };

  const initialDocState = getInitialState();
  const [docTitle, setDocTitle] = useState(initialDocState.title);
  const [pages, setPages] = useState(() => {
    const p = paginateHtml(initialDocState.html);
    return p.length > 0 ? p : ["<p><br></p>"];
  });
  const pagesRef = useRef(pages);
  const [isSaving, setIsSaving] = useState(false);
  const isSavingRef = useRef(false);
  const [isSaved, setIsSaved] = useState(true);
  const [activeTab, setActiveTab] = useState("variables");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [zoomLevel, setZoomLevel] = useState("100%");
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [selectedRecordIdx, setSelectedRecordIdx] = useState(0);
  const [includeQrCode, setIncludeQrCode] = useState(true);
  const [qrPosition, setQrPosition] = useState("bottom-right");
  const [customVarName, setCustomVarName] = useState("");
  const [presetToLoad, setPresetToLoad] = useState(null);
  const [varSearchQuery, setVarSearchQuery] = useState("");
  const [pageMarginMm, setPageMarginMm] = useState(25);

  // Active selection formatting state (synced like Google Docs)
  const [currentBlockStyle, setCurrentBlockStyle] = useState("p");
  const [currentFont, setCurrentFont] = useState("Arial");
  const [currentFontSize, setCurrentFontSize] = useState("11");
  const [currentLineSpacing, setCurrentLineSpacing] = useState("1.5");
  const [formatState, setFormatState] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikeThrough: false,
    unorderedList: false,
    orderedList: false,
    justifyLeft: true,
    justifyCenter: false,
    justifyRight: false,
    justifyFull: false,
  });

  // Dropdown / popover toggles
  const [activeMenu, setActiveMenu] = useState(null);
  const [openToolbarDropdown, setOpenToolbarDropdown] = useState(null); // 'style' | 'font' | 'size' | 'color' | 'highlight' | 'spacing' | null

  // Floating Link Popover state (replaces native browser prompt)
  const [linkPopover, setLinkPopover] = useState({
    open: false,
    text: "",
    url: "",
    top: 160,
    left: 360,
    hasExistingLink: false,
  });
  const linkPopoverRef = useRef(null);
  const linkUrlInputRef = useRef(null);
  const existingAnchorRef = useRef(null);

  // Active Table Editing state
  const [isInsideTable, setIsInsideTable] = useState(false);
  const activeTableCellRef = useRef(null);
  const [customTableRows, setCustomTableRows] = useState(4);
  const [customTableCols, setCustomTableCols] = useState(4);

  const activePageIdxRef = useRef(0);
  const pageRefs = useRef([]);
  const fileInputRef = useRef(null);
  const titleInputRef = useRef(null);
  const menuContainerRef = useRef(null);
  const toolbarDropdownRef = useRef(null);
  const savedRangeRef = useRef(null);

  const syncDomPages = useCallback((pagesArray) => {
    pagesRef.current = pagesArray;
    const applyToDom = () => {
      pagesArray.forEach((html, idx) => {
        const el = pageRefs.current[idx];
        if (el) {
          const targetHtml = html || "<p><br></p>";
          if (el.innerHTML !== targetHtml) {
            el.innerHTML = targetHtml;
          }
          el.dataset.loadedInit = "true";
        }
      });
    };
    applyToDom();
    setTimeout(applyToDom, 30);
  }, []);

  // Save & restore selection range so toolbar clicks/dropdowns never lose the user's selection
  const saveSelection = useCallback(() => {
    if (typeof window === "undefined") return;
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      // Only save if inside one of our page editors
      for (let i = 0; i < pageRefs.current.length; i++) {
        const pageEl = pageRefs.current[i];
        if (pageEl && pageEl.contains(range.commonAncestorContainer)) {
          savedRangeRef.current = range.cloneRange();
          activePageIdxRef.current = i;
          break;
        }
      }
    }
  }, []);

  const restoreSelection = useCallback(() => {
    if (typeof window === "undefined") return;
    const activeIdx = activePageIdxRef.current || 0;
    const pageEl = pageRefs.current[activeIdx] || pageRefs.current[0];
    if (savedRangeRef.current && pageEl && pageEl.contains(savedRangeRef.current.commonAncestorContainer)) {
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(savedRangeRef.current);
      }
    } else if (pageEl) {
      pageEl.focus();
    }
  }, []);

  // Inspect selection and update toolbar state (Heading, Font, Size, B/I/U, Lists, Alignment, Active Table)
  const updateToolbarStateFromSelection = useCallback(() => {
    if (typeof window === "undefined" || isPreviewMode) return;
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    let node = sel.anchorNode;
    if (!node) return;
    if (node.nodeType === Node.TEXT_NODE) {
      node = node.parentElement;
    }
    if (!node || !(node instanceof HTMLElement)) return;

    // Check if selection is inside our editor
    const isInsideEditor = pageRefs.current.some((el) => el && el.contains(node));
    if (!isInsideEditor) return;

    saveSelection();

    // Detect if cursor is inside a Table cell
    const cellEl = node.closest("td, th");
    const tableEl = node.closest("table");
    if (cellEl && tableEl) {
      activeTableCellRef.current = {
        tableEl,
        cellEl,
        pageIdx: activePageIdxRef.current,
      };
      setIsInsideTable(true);
    } else {
      setIsInsideTable(false);
    }

    // 1. Detect Block Style (Title, Subtitle, H1-H4, Normal text)
    const blockEl = node.closest("h1, h2, h3, h4, p, div, blockquote, li");
    if (blockEl) {
      const tag = blockEl.tagName.toUpperCase();
      if (blockEl.classList.contains("doc-title")) {
        setCurrentBlockStyle("title");
      } else if (blockEl.classList.contains("doc-subtitle")) {
        setCurrentBlockStyle("subtitle");
      } else if (tag === "H1") {
        setCurrentBlockStyle("h1");
      } else if (tag === "H2") {
        setCurrentBlockStyle("h2");
      } else if (tag === "H3") {
        setCurrentBlockStyle("h3");
      } else if (tag === "H4") {
        setCurrentBlockStyle("h4");
      } else {
        setCurrentBlockStyle("p");
      }
    } else {
      setCurrentBlockStyle("p");
    }

    // 2. Detect Computed Font Size & Font Family at cursor
    const computed = window.getComputedStyle(node);
    if (computed.fontSize) {
      const px = parseFloat(computed.fontSize);
      if (!isNaN(px)) {
        const pt = Math.round(px * 0.75);
        setCurrentFontSize(String(pt));
      }
    }
    if (computed.fontFamily) {
      const cleanFont = computed.fontFamily.split(",")[0].replace(/['"]/g, "").trim();
      const matched = FONT_FAMILIES.find((f) => f.toLowerCase() === cleanFont.toLowerCase());
      if (matched) setCurrentFont(matched);
    }

    // 3. Query command states
    try {
      setFormatState({
        bold: document.queryCommandState("bold"),
        italic: document.queryCommandState("italic"),
        underline: document.queryCommandState("underline"),
        strikeThrough: document.queryCommandState("strikeThrough"),
        unorderedList: document.queryCommandState("insertUnorderedList"),
        orderedList: document.queryCommandState("insertOrderedList"),
        justifyLeft: document.queryCommandState("justifyLeft"),
        justifyCenter: document.queryCommandState("justifyCenter"),
        justifyRight: document.queryCommandState("justifyRight"),
        justifyFull: document.queryCommandState("justifyFull"),
      });
    } catch (e) {}
  }, [isPreviewMode, saveSelection]);

  useEffect(() => {
    document.addEventListener("selectionchange", updateToolbarStateFromSelection);
    return () => document.removeEventListener("selectionchange", updateToolbarStateFromSelection);
  }, [updateToolbarStateFromSelection]);

  // Reflow overflowing DOM nodes (including splitting large tables row-by-row) from `pageIndex` onto subsequent pages
  const reflowOverflowFromPage = useCallback((startIndex = 0) => {
    const pageEl = pageRefs.current[startIndex];
    if (!pageEl) return;

    if (pageEl.scrollHeight <= A4_CONTENT_MAX_HEIGHT_PX) {
      return;
    }

    // Collect current HTML of all pages from DOM
    const currentLen = pagesRef.current ? pagesRef.current.length : pages.length;
    const allHtmls = pageRefs.current
      .slice(0, currentLen)
      .map((el, i) => (el ? el.innerHTML : pagesRef.current[i] || pages[i] || ""));

    const overflowNodes = [];

    while (pageEl.scrollHeight > A4_CONTENT_MAX_HEIGHT_PX) {
      const lastChild = pageEl.lastElementChild;
      if (!lastChild) break;

      // Special handling if the last element is a TABLE: peel off overflowing rows into a continuation table!
      if (lastChild.tagName.toUpperCase() === "TABLE") {
        const theadEl = lastChild.querySelector("thead");
        const theadHtml = theadEl ? theadEl.outerHTML : "";
        const bodyRows = Array.from(lastChild.querySelectorAll("tr")).filter(
          (r) => r.parentElement?.tagName.toUpperCase() !== "THEAD"
        );

        if (bodyRows.length > 1) {
          const peeledRows = [];
          while (pageEl.scrollHeight > A4_CONTENT_MAX_HEIGHT_PX && bodyRows.length > 1) {
            const poppedRow = bodyRows.pop();
            if (!poppedRow) break;
            peeledRows.unshift(poppedRow.outerHTML);
            poppedRow.remove();
          }

          // If the table still overflows with only 1 row left and there are earlier siblings on the page, move the whole table
          if (pageEl.scrollHeight > A4_CONTENT_MAX_HEIGHT_PX && pageEl.children.length > 1 && bodyRows.length === 1) {
            const firstRowHtml = bodyRows[0].outerHTML;
            const fullTableHtml = `<table>${theadHtml}<tbody>${firstRowHtml}${peeledRows.join("")}</tbody></table>`;
            overflowNodes.unshift(fullTableHtml);
            pageEl.removeChild(lastChild);
            continue;
          }

          if (peeledRows.length > 0) {
            const continuationTableHtml = `<table>${theadHtml}<tbody>${peeledRows.join("")}</tbody></table>`;
            overflowNodes.unshift(continuationTableHtml);
          }
          break;
        }
      }

      if (pageEl.children.length <= 1) break;
      overflowNodes.unshift(lastChild.outerHTML);
      pageEl.removeChild(lastChild);
    }

    if (overflowNodes.length === 0) return;

    allHtmls[startIndex] = pageEl.innerHTML || "<p><br></p>";
    const overflowHtml = overflowNodes.join("\n");

    // Paginate the overflowed HTML in case it spans multiple pages itself
    const extraPages = paginateHtml(overflowHtml);

    if (startIndex + 1 < allHtmls.length) {
      const combinedRemaining = [
        ...extraPages.slice(0, -1),
        extraPages[extraPages.length - 1] + "\n" + allHtmls[startIndex + 1],
        ...allHtmls.slice(startIndex + 2),
      ].join('<div class="pd-page-break"></div>');
      const repaginatedTail = paginateHtml(combinedRemaining);
      const finalPages = [...allHtmls.slice(0, startIndex + 1), ...repaginatedTail];
      pagesRef.current = finalPages;
      setPages(finalPages);
      syncDomPages(finalPages);
      setIsSaved(false);
    } else {
      const finalPages = [...allHtmls.slice(0, startIndex + 1), ...extraPages];
      pagesRef.current = finalPages;
      setPages(finalPages);
      syncDomPages(finalPages);
      setIsSaved(false);
    }
  }, [pages, syncDomPages]);

  // Initialize new document or preset when no route ID is present
  useEffect(() => {
    if (!resolvedRouteId) {
      currentDocIdRef.current = null;
      setCurrentDocId(null);
      setIsLoadingDoc(false);
      const searchParams = new URLSearchParams(location.search);
      const presetId = searchParams.get("preset");
      if (presetId && presetId !== "blank") {
        const found = OFFICIAL_PRESETS.find((p) => p.id === presetId);
        if (found) {
          setDocTitle(found.title);
          const paginated = paginateHtml(found.content);
          pagesRef.current = paginated;
          setPages(paginated);
          syncDomPages(paginated);
          setIsSaved(false);
          return;
        }
      }
      setDocTitle("Untitled document");
      pagesRef.current = ["<p><br></p>"];
      setPages(["<p><br></p>"]);
      syncDomPages(["<p><br></p>"]);
      setIsSaved(true);
    }
  }, [resolvedRouteId, location.search, syncDomPages]);

  // Close menus & toolbar dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuContainerRef.current && !menuContainerRef.current.contains(e.target)) {
        setActiveMenu(null);
      }
      if (toolbarDropdownRef.current && !toolbarDropdownRef.current.contains(e.target)) {
        setOpenToolbarDropdown(null);
      }
      if (linkPopoverRef.current && !linkPopoverRef.current.contains(e.target)) {
        setLinkPopover((prev) => (prev.open ? { ...prev, open: false } : prev));
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard shortcuts (Ctrl+S to save, Ctrl+P to print, Ctrl+K to insert link)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        handleSaveTemplate({ silent: false });
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "p") {
        e.preventDefault();
        handlePrint();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        openLinkPopover();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  // Fetch existing document when opening via UUID / ID
  useEffect(() => {
    if (resolvedRouteId) {
      currentDocIdRef.current = String(resolvedRouteId);
      setCurrentDocId(String(resolvedRouteId));
      setIsLoadingDoc(true);
      getTemplate(resolvedRouteId)
        .then((res) => {
          const t = res.data?.template || res.data;
          if (t) {
            const cleanTitle = (t.title || "Untitled document").replace(" (Senate Approved)", "");
            setDocTitle(cleanTitle);
            let layoutData = t.layout_data || t.canvas_data || {};
            if (typeof layoutData === "string") {
              try {
                layoutData = JSON.parse(layoutData);
              } catch (e) {
                layoutData = {};
              }
            }
            const docHtmlContent = layoutData.document_html || "";
            const paginated = docHtmlContent ? paginateHtml(docHtmlContent) : ["<p><br></p>"];
            pagesRef.current = paginated;
            setPages(paginated);
            syncDomPages(paginated);

            if (layoutData.qr_code_enabled !== undefined) {
              setIncludeQrCode(layoutData.qr_code_enabled);
            }
            if (layoutData.qr_position) {
              setQrPosition(layoutData.qr_position);
            }
            if (layoutData.zoom) {
              setZoomLevel(layoutData.zoom);
            }
            setIsSaved(true);
          }
        })
        .catch((err) => {
          console.error("Failed to load document:", err);
          toast.error("Could not load document");
        })
        .finally(() => {
          setIsLoadingDoc(false);
        });
    }
  }, [resolvedRouteId, syncDomPages]);

  // Keep DOM pages synced whenever pages array length changes or preview mode toggles off
  useEffect(() => {
    if (!isPreviewMode) {
      pages.forEach((p, idx) => {
        const el = pageRefs.current[idx];
        const target = p || "<p><br></p>";
        if (el && (!el.innerHTML || el.innerHTML === "<p><br></p>") && target !== "<p><br></p>") {
          el.innerHTML = target;
        } else if (el && !el.innerHTML) {
          el.innerHTML = target;
        }
      });
    }
  }, [pages.length, isPreviewMode, pages]);

  const getCombinedHtml = useCallback(() => {
    const currentPages = pagesRef.current && pagesRef.current.length > 0 ? pagesRef.current : pages;
    const latestPages = currentPages.map((p, idx) => {
      if (!isPreviewMode) {
        const el = pageRefs.current[idx];
        if (el && el.innerHTML && el.innerHTML !== "<p><br></p>") {
          return el.innerHTML;
        }
        if (el && (!p || p === "<p><br></p>")) {
          return el.innerHTML || "<p><br></p>";
        }
      }
      return p || "<p><br></p>";
    });
    pagesRef.current = latestPages;
    return latestPages.join('<div class="pd-page-break" style="page-break-after: always; break-after: page;"></div>');
  }, [pages, isPreviewMode]);

  const handlePageInput = (index) => {
    const el = pageRefs.current[index];
    if (!el) return;
    const currentHtml = el.innerHTML;
    setPages((prev) => {
      const next = [...prev];
      next[index] = currentHtml;
      pagesRef.current = next;
      return next;
    });
    setIsSaved(false);

    if (el.scrollHeight > A4_CONTENT_MAX_HEIGHT_PX + 12) {
      setTimeout(() => reflowOverflowFromPage(index), 25);
    }
  };

  // Execute rich text command while preserving selection
  const execCmd = (command, value = null) => {
    restoreSelection();
    document.execCommand(command, false, value);
    saveSelection();
    const activeIdx = activePageIdxRef.current || 0;
    handlePageInput(activeIdx);
    updateToolbarStateFromSelection();
  };

  // Apply Google Docs Block Style (Normal text, Title, Subtitle, Heading 1-4)
  const applyBlockStyle = (styleObj) => {
    restoreSelection();
    const activeIdx = activePageIdxRef.current || 0;
    const pageEl = pageRefs.current[activeIdx];
    if (!pageEl) return;

    document.execCommand("formatBlock", false, `<${styleObj.tag}>`);

    // Apply or clear special classes (doc-title, doc-subtitle) and inline font overrides on the block
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      let node = sel.anchorNode;
      if (node && node.nodeType === Node.TEXT_NODE) node = node.parentElement;
      if (node && node instanceof HTMLElement) {
        const block = node.closest("h1, h2, h3, h4, p, div");
        if (block && pageEl.contains(block)) {
          block.classList.remove("doc-title", "doc-subtitle");
          if (styleObj.className) {
            block.classList.add(styleObj.className);
          }
          // Strip inline font-size overrides inside heading so heading size takes effect cleanly
          block.style.fontSize = "";
          block.querySelectorAll("[style*='font-size']").forEach((child) => {
            child.style.fontSize = "";
          });
        }
      }
    }

    setCurrentBlockStyle(styleObj.id);
    setOpenToolbarDropdown(null);
    saveSelection();
    handlePageInput(activeIdx);
    updateToolbarStateFromSelection();
  };

  // Apply Font Family to selected text or active paragraph/block
  const handleFontChange = (font) => {
    setCurrentFont(font);
    setOpenToolbarDropdown(null);
    restoreSelection();

    const activeIdx = activePageIdxRef.current || 0;
    const pageEl = pageRefs.current[activeIdx];
    if (!pageEl) return;

    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
      document.execCommand("fontName", false, font);
      // Convert browser <font face="..."> tags into clean <span style="font-family: ...">
      const fontNodes = pageEl.querySelectorAll("font[face]");
      fontNodes.forEach((el) => {
        const span = document.createElement("span");
        span.style.fontFamily = `'${font}', sans-serif`;
        span.innerHTML = el.innerHTML;
        span.querySelectorAll("[style*='font-family']").forEach((inner) => {
          inner.style.fontFamily = "";
        });
        el.parentNode.replaceChild(span, el);
      });
    } else if (sel && sel.rangeCount > 0) {
      let node = sel.anchorNode;
      if (node && node.nodeType === Node.TEXT_NODE) node = node.parentElement;
      if (node && node instanceof HTMLElement && pageEl.contains(node)) {
        const targetBlock =
          node === pageEl
            ? pageEl.firstElementChild || pageEl
            : node.closest("p, li, h1, h2, h3, h4, td, th, blockquote, span, div");
        if (targetBlock && pageEl.contains(targetBlock) && targetBlock !== pageEl) {
          targetBlock.style.fontFamily = `'${font}', sans-serif`;
          targetBlock.querySelectorAll("[style*='font-family'], font[face]").forEach((inner) => {
            if (inner.tagName === "FONT") inner.removeAttribute("face");
            else inner.style.fontFamily = "";
          });
        } else {
          pageEl.style.fontFamily = `'${font}', sans-serif`;
        }
      }
    }

    saveSelection();
    handlePageInput(activeIdx);
  };

  // Real Font Size change (works on selected text OR current block, in real pt sizes)
  const handleFontSizeChange = (sizePt) => {
    const cleanPt = Math.max(6, Math.min(96, parseInt(sizePt, 10) || 11));
    setCurrentFontSize(String(cleanPt));
    setOpenToolbarDropdown(null);
    restoreSelection();

    const activeIdx = activePageIdxRef.current || 0;
    const pageEl = pageRefs.current[activeIdx];
    if (!pageEl) return;

    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
      // Use fontSize=7 marker then replace <font size="7"> with <span style="font-size: Xpt">
      document.execCommand("fontSize", false, "7");
      const fontElements = pageEl.querySelectorAll('font[size="7"], span[style*="xxx-large"]');
      fontElements.forEach((el) => {
        const span = document.createElement("span");
        span.style.fontSize = `${cleanPt}pt`;
        span.innerHTML = el.innerHTML;
        // Strip nested conflicting font-size styles so the new size applies uniformly
        span.querySelectorAll("[style*='font-size']").forEach((inner) => {
          inner.style.fontSize = "";
        });
        el.parentNode.replaceChild(span, el);
      });
    } else if (sel && sel.rangeCount > 0) {
      // Collapsed cursor: apply to current block element if inside one
      let node = sel.anchorNode;
      if (node && node.nodeType === Node.TEXT_NODE) node = node.parentElement;
      if (node && node instanceof HTMLElement && pageEl.contains(node) && node !== pageEl) {
        const targetBlock = node.closest("p, li, h1, h2, h3, h4, span, div");
        if (targetBlock && pageEl.contains(targetBlock) && targetBlock !== pageEl) {
          targetBlock.style.fontSize = `${cleanPt}pt`;
        }
      }
    }

    saveSelection();
    handlePageInput(activeIdx);
  };

  // Apply Line Spacing to selected paragraph(s) or current page
  const handleLineSpacingChange = (spacing) => {
    setCurrentLineSpacing(spacing);
    setOpenToolbarDropdown(null);
    restoreSelection();
    const activeIdx = activePageIdxRef.current || 0;
    const pageEl = pageRefs.current[activeIdx];
    if (!pageEl) return;

    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      let node = sel.anchorNode;
      if (node && node.nodeType === Node.TEXT_NODE) node = node.parentElement;
      const block = node instanceof HTMLElement ? node.closest("p, div, li, h1, h2, h3, h4") : null;
      if (block && pageEl.contains(block) && block !== pageEl) {
        block.style.lineHeight = spacing;
      } else {
        pageEl.style.lineHeight = spacing;
      }
    }
    saveSelection();
    handlePageInput(activeIdx);
  };

  // Smart Paste Handler: Cleans external styles, converts {{variables}}, and paginates multi-page pastes automatically!
  const handlePaste = (e, pageIndex) => {
    e.preventDefault();
    const clipboardData = e.clipboardData || window.clipboardData;
    if (!clipboardData) return;

    const pastedHtml = clipboardData.getData("text/html");
    const pastedText = clipboardData.getData("text/plain");

    let cleanHtml = "";
    if (pastedHtml && pastedHtml.trim()) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(pastedHtml, "text/html");

      // Remove script, style, meta, link tags
      doc.querySelectorAll("script, style, meta, link, xml, o\\:p").forEach((n) => n.remove());

      // Sanitize inline styles that break A4 layout (like fixed widths, negative margins, absolute positioning, background colors from web pages)
      doc.body.querySelectorAll("*").forEach((el) => {
        if (el instanceof HTMLElement) {
          const fw = el.style.fontWeight;
          const fs = el.style.fontStyle;
          const td = el.style.textDecoration;
          const ta = el.style.textAlign;
          el.removeAttribute("style");
          el.removeAttribute("class");
          if (fw === "bold" || parseInt(fw, 10) >= 600) el.style.fontWeight = "bold";
          if (fs === "italic") el.style.fontStyle = "italic";
          if (td && td.includes("underline")) el.style.textDecoration = "underline";
          if (ta && ["center", "right", "justify"].includes(ta)) el.style.textAlign = ta;
        }
      });

      cleanHtml = doc.body.innerHTML;
    } else if (pastedText) {
      // Convert plain text paragraphs into clean <p> blocks
      const paragraphs = pastedText.replace(/\r\n/g, "\n").split(/\n{2,}/);
      cleanHtml = paragraphs
        .map((para) => {
          const lines = para
            .trim()
            .split("\n")
            .map((l) => l.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"))
            .join("<br>");
          return lines ? `<p>${lines}</p>` : "";
        })
        .filter(Boolean)
        .join("\n");
    }

    if (!cleanHtml) return;

    // Convert any {{var}} in pasted content into ProofDeck chips
    cleanHtml = cleanHtml.replace(/(\{\{[a-zA-Z0-9_]+\}\})/g, (match) => {
      return `<span class="pd-chip" data-var="${match}" contenteditable="false" style="display: inline-block; background-color: #F1F5F9; color: #1E293B; border: 1px solid #CBD5E1; padding: 1px 6px; border-radius: 4px; font-family: monospace; font-size: 12px; font-weight: 600;">${match}</span>`;
    });

    // Insert at cursor
    document.execCommand("insertHTML", false, cleanHtml);
    handlePageInput(pageIndex);

    // Wait a tick for DOM layout, then check if pageIndex overflowed 1 A4 sheet; if so, auto-split onto Page 2, 3, etc.
    setTimeout(() => {
      const pageEl = pageRefs.current[pageIndex];
      if (!pageEl) return;

      if (pageEl.scrollHeight > A4_CONTENT_MAX_HEIGHT_PX) {
        // Re-paginate all pages cleanly so a 3-page pasted document becomes 3 discrete A4 pages!
        const currentLen = pagesRef.current ? pagesRef.current.length : pages.length;
        const allCombined = pageRefs.current
          .slice(0, currentLen)
          .map((el, i) => (el ? el.innerHTML : pagesRef.current[i] || pages[i] || ""))
          .join('<div class="pd-page-break"></div>');

        const paginated = paginateHtml(allCombined);
        pagesRef.current = paginated;
        setPages(paginated);
        syncDomPages(paginated);
        setIsSaved(false);
        if (paginated.length > 1) {
          toast.success(`Formatted across ${paginated.length} A4 pages`);
        }
      }
    }, 35);
  };

  const insertVariable = (varKey) => {
    restoreSelection();
    const activeIdx = activePageIdxRef.current || 0;
    const targetEl = pageRefs.current[activeIdx] || pageRefs.current[0];
    if (targetEl) {
      targetEl.focus();
    }
    const chipHtml = `&nbsp;<span class="pd-chip" data-var="${varKey}" contenteditable="false" style="display: inline-block; background-color: #F1F5F9; color: #1E293B; border: 1px solid #CBD5E1; padding: 1px 6px; border-radius: 4px; font-family: monospace; font-size: 12px; font-weight: 600; user-select: all;">${varKey}</span>&nbsp;`;
    document.execCommand("insertHTML", false, chipHtml);
    saveSelection();
    handlePageInput(activeIdx);
  };

  const insertSignatureBlock = () => {
    restoreSelection();
    const activeIdx = activePageIdxRef.current || 0;
    const html = `
      <div style="margin-top: 36px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: flex-end;">
        <div style="text-align: left; max-width: 260px;">
          <div style="font-family: 'Times New Roman', serif; font-size: 16pt; font-style: italic; font-weight: bold; margin-bottom: 4px; color: #1E3A8A;">
            <span class="pd-chip" data-var="{{signatory_name}}" contenteditable="false" style="display: inline-block; background-color: #F1F5F9; color: #1E293B; border: 1px solid #CBD5E1; padding: 1px 6px; border-radius: 4px; font-family: monospace; font-size: 12px; font-weight: 600;">{{signatory_name}}</span>
          </div>
          <div style="border-top: 1.5px solid #374151; padding-top: 6px; font-size: 11pt; font-weight: 700; color: #111827;">
            <span class="pd-chip" data-var="{{signatory_title}}" contenteditable="false" style="display: inline-block; background-color: #F1F5F9; color: #1E293B; border: 1px solid #CBD5E1; padding: 1px 6px; border-radius: 4px; font-family: monospace; font-size: 12px; font-weight: 600;">{{signatory_title}}</span>
          </div>
          <div style="font-size: 9.5pt; color: #6B7280;">Authorized Signatory</div>
        </div>
      </div>
      <p><br></p>
    `;
    document.execCommand("insertHTML", false, html);
    setActiveMenu(null);
    handlePageInput(activeIdx);
  };

  const insertOfficialSeal = () => {
    restoreSelection();
    const activeIdx = activePageIdxRef.current || 0;
    const html = `
      <div style="display: inline-block; text-align: center; padding: 10px 20px; border: 2px dashed #6366F1; border-radius: 8px; font-size: 9.5pt; color: #4338CA; background-color: #EEF2FF; margin: 12px 0;">
        <div style="font-weight: 800; letter-spacing: 0.5px; margin-bottom: 2px;">OFFICIAL VERIFIED SEAL</div>
        <div style="font-size: 8.5pt; color: #6366F1;">Authenticated via ProofDeck Ledger</div>
      </div>
      <p><br></p>
    `;
    document.execCommand("insertHTML", false, html);
    setActiveMenu(null);
    handlePageInput(activeIdx);
  };

  // Insert Custom Editable Table (any rows x cols)
  const insertCustomTable = (rowsCount = 4, colsCount = 4) => {
    const rCount = Math.max(1, Math.min(30, parseInt(rowsCount, 10) || 4));
    const cCount = Math.max(1, Math.min(12, parseInt(colsCount, 10) || 4));
    restoreSelection();
    const activeIdx = activePageIdxRef.current || 0;

    const headerCells = Array.from({ length: cCount })
      .map((_, i) => `<th>Header ${i + 1}</th>`)
      .join("");
    const bodyRows = Array.from({ length: Math.max(1, rCount - 1) })
      .map(
        () =>
          `<tr>${Array.from({ length: cCount })
            .map(() => `<td><br></td>`)
            .join("")}</tr>`
      )
      .join("");

    const html = `
      <table>
        <thead>
          <tr>${headerCells}</tr>
        </thead>
        <tbody>
          ${bodyRows}
        </tbody>
      </table>
      <p><br></p>
    `;
    document.execCommand("insertHTML", false, html);
    setActiveMenu(null);
    setOpenToolbarDropdown(null);
    handlePageInput(activeIdx);
    setTimeout(() => reflowOverflowFromPage(activeIdx), 35);
  };

  const insertAcademicTable = () => {
    restoreSelection();
    const activeIdx = activePageIdxRef.current || 0;
    const html = `
      <table>
        <thead>
          <tr>
            <th>Course Code</th>
            <th>Course Title</th>
            <th>Units</th>
            <th>Grade</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>CSC 401</td>
            <td>Software Engineering & Architecture</td>
            <td>4</td>
            <td>A</td>
          </tr>
          <tr>
            <td>CSC 405</td>
            <td>Distributed Systems & Cryptography</td>
            <td>3</td>
            <td>A</td>
          </tr>
          <tr>
            <td>CSC 499</td>
            <td>Final Year Research Project</td>
            <td>6</td>
            <td>A</td>
          </tr>
        </tbody>
      </table>
      <p><br></p>
    `;
    document.execCommand("insertHTML", false, html);
    setActiveMenu(null);
    setOpenToolbarDropdown(null);
    handlePageInput(activeIdx);
    setTimeout(() => reflowOverflowFromPage(activeIdx), 35);
  };

  // --- TABLE EDITING ACTIONS (Add/Delete Rows & Columns, Fit Page Width & Reflow Overflow) ---
  const handleTableAddRow = (position = "below") => {
    const ctx = activeTableCellRef.current;
    if (!ctx || !ctx.tableEl || !ctx.cellEl) {
      toast.error("Click inside a table cell first");
      return;
    }
    const { tableEl, cellEl, pageIdx } = ctx;
    const currentRow = cellEl.closest("tr");
    if (!currentRow) return;

    const colCount = currentRow.querySelectorAll("th, td").length || 1;
    const newRow = document.createElement("tr");
    for (let i = 0; i < colCount; i++) {
      const td = document.createElement("td");
      td.innerHTML = "<br>";
      newRow.appendChild(td);
    }

    let tbody = tableEl.querySelector("tbody");
    if (!tbody) {
      tbody = document.createElement("tbody");
      tableEl.appendChild(tbody);
    }

    if (currentRow.parentElement?.tagName.toUpperCase() === "THEAD") {
      // If inside header row and adding below, insert as first row of tbody
      if (tbody.firstChild) {
        tbody.insertBefore(newRow, tbody.firstChild);
      } else {
        tbody.appendChild(newRow);
      }
    } else if (position === "above") {
      currentRow.parentElement.insertBefore(newRow, currentRow);
    } else {
      currentRow.parentElement.insertBefore(newRow, currentRow.nextSibling);
    }

    // Focus the first cell of the newly added row
    const firstNewCell = newRow.querySelector("td");
    if (firstNewCell) {
      const range = document.createRange();
      range.selectNodeContents(firstNewCell);
      range.collapse(true);
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(range);
      }
      activeTableCellRef.current = { tableEl, cellEl: firstNewCell, pageIdx };
    }

    handlePageInput(pageIdx);
    setTimeout(() => reflowOverflowFromPage(pageIdx), 30);
  };

  const handleTableAddCol = (position = "right") => {
    const ctx = activeTableCellRef.current;
    if (!ctx || !ctx.tableEl || !ctx.cellEl) {
      toast.error("Click inside a table cell first");
      return;
    }
    const { tableEl, cellEl, pageIdx } = ctx;
    const currentRow = cellEl.closest("tr");
    if (!currentRow) return;

    const cellsInCurrentRow = Array.from(currentRow.querySelectorAll("th, td"));
    const colIndex = Math.max(0, cellsInCurrentRow.indexOf(cellEl));

    const allRows = Array.from(tableEl.querySelectorAll("tr"));
    allRows.forEach((row) => {
      const cells = Array.from(row.querySelectorAll("th, td"));
      const isHeader =
        row.parentElement?.tagName.toUpperCase() === "THEAD" ||
        cells.some((c) => c.tagName.toUpperCase() === "TH");
      const newCell = document.createElement(isHeader ? "th" : "td");
      newCell.innerHTML = isHeader ? `Col ${cells.length + 1}` : "<br>";

      const refCell = cells[colIndex] || cells[cells.length - 1];
      if (!refCell) {
        row.appendChild(newCell);
      } else if (position === "left") {
        row.insertBefore(newCell, refCell);
      } else {
        row.insertBefore(newCell, refCell.nextSibling);
      }
    });

    handlePageInput(pageIdx);
    setTimeout(() => reflowOverflowFromPage(pageIdx), 30);
  };

  const handleTableDeleteRow = () => {
    const ctx = activeTableCellRef.current;
    if (!ctx || !ctx.tableEl || !ctx.cellEl) return;
    const { tableEl, cellEl, pageIdx } = ctx;
    const currentRow = cellEl.closest("tr");
    if (!currentRow) return;

    const allRows = tableEl.querySelectorAll("tr");
    if (allRows.length <= 1) {
      tableEl.remove();
      setIsInsideTable(false);
      activeTableCellRef.current = null;
    } else {
      currentRow.remove();
      setIsInsideTable(false);
      activeTableCellRef.current = null;
    }
    handlePageInput(pageIdx);
  };

  const handleTableDeleteCol = () => {
    const ctx = activeTableCellRef.current;
    if (!ctx || !ctx.tableEl || !ctx.cellEl) return;
    const { tableEl, cellEl, pageIdx } = ctx;
    const currentRow = cellEl.closest("tr");
    if (!currentRow) return;

    const cellsInRow = Array.from(currentRow.querySelectorAll("th, td"));
    if (cellsInRow.length <= 1) {
      tableEl.remove();
      setIsInsideTable(false);
      activeTableCellRef.current = null;
      handlePageInput(pageIdx);
      return;
    }

    const colIndex = cellsInRow.indexOf(cellEl);
    if (colIndex === -1) return;

    Array.from(tableEl.querySelectorAll("tr")).forEach((row) => {
      const cells = row.querySelectorAll("th, td");
      if (cells[colIndex]) {
        cells[colIndex].remove();
      }
    });

    setIsInsideTable(false);
    activeTableCellRef.current = null;
    handlePageInput(pageIdx);
  };

  const handleTableDelete = () => {
    const ctx = activeTableCellRef.current;
    if (!ctx || !ctx.tableEl) return;
    const { tableEl, pageIdx } = ctx;
    tableEl.remove();
    setIsInsideTable(false);
    activeTableCellRef.current = null;
    handlePageInput(pageIdx);
    toast.success("Table removed");
  };

  // --- FLOATING LINK POPOVER (No browser window.prompt / alert!) ---
  const openLinkPopover = () => {
    saveSelection();
    setActiveMenu(null);
    setOpenToolbarDropdown(null);

    let selectedText = "";
    let existingUrl = "";
    let hasExisting = false;
    existingAnchorRef.current = null;

    let topPos = 175;
    let leftPos = typeof window !== "undefined" ? Math.max(260, window.innerWidth / 2 - 160) : 380;

    if (savedRangeRef.current) {
      selectedText = savedRangeRef.current.toString();
      let node = savedRangeRef.current.commonAncestorContainer;
      if (node && node.nodeType === Node.TEXT_NODE) {
        node = node.parentElement;
      }
      if (node && node instanceof HTMLElement) {
        const anchor = node.closest("a");
        if (anchor) {
          existingAnchorRef.current = anchor;
          hasExisting = true;
          existingUrl = anchor.getAttribute("href") || "";
          if (!selectedText) {
            selectedText = anchor.textContent || "";
          }
        }
      }

      const rect = savedRangeRef.current.getBoundingClientRect();
      if (rect && (rect.width > 0 || rect.height > 0 || rect.top > 0)) {
        const maxLeft = typeof window !== "undefined" ? window.innerWidth - 340 : 800;
        const maxTop = typeof window !== "undefined" ? window.innerHeight - 230 : 600;
        leftPos = Math.max(20, Math.min(maxLeft, rect.left));
        topPos = Math.max(95, Math.min(maxTop, rect.bottom + 8));
      }
    }

    setLinkPopover({
      open: true,
      text: selectedText,
      url: existingUrl || "",
      top: topPos,
      left: leftPos,
      hasExistingLink: hasExisting,
    });

    setTimeout(() => {
      linkUrlInputRef.current?.focus();
      linkUrlInputRef.current?.select();
    }, 30);
  };

  const handleApplyLink = (e) => {
    if (e) e.preventDefault();
    const rawUrl = (linkPopover.url || "").trim();
    if (!rawUrl) {
      toast.error("Please enter a link URL");
      return;
    }

    const normalizedUrl =
      /^(https?:\/\/|mailto:|tel:)/i.test(rawUrl) ? rawUrl : `https://${rawUrl}`;
    const displayText = (linkPopover.text || "").trim() || normalizedUrl;

    const activeIdx = activePageIdxRef.current || 0;

    if (existingAnchorRef.current) {
      existingAnchorRef.current.setAttribute("href", normalizedUrl);
      existingAnchorRef.current.setAttribute("target", "_blank");
      existingAnchorRef.current.setAttribute("rel", "noopener noreferrer");
      existingAnchorRef.current.textContent = displayText;
    } else {
      restoreSelection();
      const safeText = displayText
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
      const safeHref = normalizedUrl.replace(/"/g, "&quot;");
      const anchorHtml = `<a href="${safeHref}" target="_blank" rel="noopener noreferrer" style="color: #2563EB; text-decoration: underline;">${safeText}</a>`;
      document.execCommand("insertHTML", false, anchorHtml);
    }

    setLinkPopover((prev) => ({ ...prev, open: false }));
    existingAnchorRef.current = null;
    saveSelection();
    handlePageInput(activeIdx);
  };

  const handleRemoveLink = () => {
    const activeIdx = activePageIdxRef.current || 0;
    if (existingAnchorRef.current) {
      const textNode = document.createTextNode(existingAnchorRef.current.textContent || "");
      existingAnchorRef.current.parentNode?.replaceChild(textNode, existingAnchorRef.current);
      existingAnchorRef.current = null;
    } else {
      restoreSelection();
      document.execCommand("unlink", false, null);
    }
    setLinkPopover((prev) => ({ ...prev, open: false }));
    handlePageInput(activeIdx);
  };

  const handleDragStart = (e, varKey) => {
    e.dataTransfer.setData("text/plain", varKey);
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    const varKey = e.dataTransfer.getData("text/plain");
    if (varKey && varKey.startsWith("{{") && varKey.endsWith("}}")) {
      const targetEl = pageRefs.current[index];
      if (targetEl) targetEl.focus();
      const chipHtml = `&nbsp;<span class="pd-chip" data-var="${varKey}" contenteditable="false" style="display: inline-block; background-color: #F1F5F9; color: #1E293B; border: 1px solid #CBD5E1; padding: 1px 6px; border-radius: 4px; font-family: monospace; font-size: 12px; font-weight: 600;">${varKey}</span>&nbsp;`;
      document.execCommand("insertHTML", false, chipHtml);
      handlePageInput(index);
    }
  };

  const handleAddPage = (insertIndex = pages.length - 1) => {
    const newIdx = insertIndex + 1;
    setPages((prev) => {
      const next = [...prev];
      next.splice(newIdx, 0, "<p><br></p>");
      pagesRef.current = next;
      return next;
    });
    setIsSaved(false);
    setTimeout(() => {
      const newPageEl = pageRefs.current[newIdx];
      if (newPageEl) {
        newPageEl.innerHTML = "<p><br></p>";
        newPageEl.focus();
        newPageEl.scrollIntoView({ behavior: "smooth", block: "center" });
        activePageIdxRef.current = newIdx;
      }
    }, 60);
  };

  const handleDeletePage = (index) => {
    if (pages.length <= 1) {
      toast.error("Document must have at least one page");
      return;
    }
    const updated = pages.filter((_, i) => i !== index);
    pagesRef.current = updated;
    setPages(updated);
    setIsSaved(false);
    if (activePageIdxRef.current >= updated.length) {
      activePageIdxRef.current = updated.length - 1;
    }
    syncDomPages(updated);
    toast.success(`Page ${index + 1} deleted`);
  };

  const insertPageBreak = () => {
    const currentIdx = activePageIdxRef.current || 0;
    handleAddPage(currentIdx);
    toast.success(`Page ${currentIdx + 2} added`);
  };

  const handlePageKeyDown = (e, index) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleAddPage(index);
      return;
    }
    // Auto-reflow onto next page if user presses Enter at the bottom of a full A4 page
    if (e.key === "Enter" && !e.shiftKey) {
      const pageEl = pageRefs.current[index];
      if (pageEl && pageEl.scrollHeight > A4_CONTENT_MAX_HEIGHT_PX + 20) {
        setTimeout(() => reflowOverflowFromPage(index), 20);
      }
    }
  };

  // Word import handler
  const handleWordImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const toastId = toast.loading("Importing Word document...");
    try {
      const arrayBuffer = await file.arrayBuffer();
      const options = {
        styleMap: [
          "break[type='page'] => div.pd-page-break",
          "hr => div.pd-page-break",
        ],
      };
      const result = await mammoth.convertToHtml({ arrayBuffer }, options);
      let importedHtml = result.value;

      importedHtml = importedHtml.replace(/\{([a-zA-Z0-9_]+)\}/g, "{{$1}}");
      importedHtml = importedHtml.replace(/(\{\{[a-zA-Z0-9_]+\}\})/g, (match) => {
        return `<span class="pd-chip" data-var="${match}" contenteditable="false" style="display: inline-block; background-color: #F1F5F9; color: #1E293B; border: 1px solid #CBD5E1; padding: 1px 6px; border-radius: 4px; font-family: monospace; font-size: 12px; font-weight: 600;">${match}</span>`;
      });

      const paginated = paginateHtml(importedHtml);
      pagesRef.current = paginated;
      setPages(paginated);
      syncDomPages(paginated);
      setIsSaved(false);
      const fileNameClean = file.name.replace(/\.[^/.]+$/, "");
      setDocTitle(fileNameClean);
      toast.success(`Imported ${paginated.length} page${paginated.length > 1 ? "s" : ""}`, { id: toastId });
    } catch (err) {
      toast.error("Failed to parse Word document", { id: toastId });
    }
    e.target.value = "";
  };

  // Save document (supports both manual save and background Google Docs-style auto-save)
  const handleSaveTemplate = useCallback(
    async ({ silent = false } = {}) => {
      if (isLoadingDoc) return;
      const cleanTitle = (docTitle || "").trim() || "Untitled document";
      if (!silent && !docTitle.trim()) {
        toast.error("Enter a document title");
        return;
      }
      if (isSavingRef.current) return;

      isSavingRef.current = true;
      setIsSaving(true);
      const htmlToSave = getCombinedHtml();

      const payload = {
        title: cleanTitle,
        layout_style: "document",
        canvas_data: {
          document_html: htmlToSave,
          qr_code_enabled: includeQrCode,
          qr_position: qrPosition,
          zoom: zoomLevel,
        },
      };

      try {
        const activeId = currentDocIdRef.current;
        if (activeId) {
          await updateCustomTemplate(activeId, payload);
          if (!silent) {
            toast.success("Document saved");
          }
        } else {
          const res = await createCustomTemplate(payload);
          const newId = res.data?.template_id || res.data?.id;
          if (newId) {
            const newIdStr = String(newId);
            currentDocIdRef.current = newIdStr;
            setCurrentDocId(newIdStr);
            const uuidUrl = `/dashboard/documents/editor/${encodeDocUuid(newIdStr)}`;
            window.history.replaceState(null, "", uuidUrl);
          }
          if (!silent) {
            toast.success("Document saved");
          }
        }
        setIsSaved(true);
      } catch (err) {
        if (!silent) {
          toast.error(err.response?.data?.msg || "Failed to save document");
        }
      } finally {
        isSavingRef.current = false;
        setIsSaving(false);
      }
    },
    [docTitle, getCombinedHtml, includeQrCode, isLoadingDoc, qrPosition, zoomLevel]
  );

  // Google Docs-style Auto-Save: automatically saves changes 1.8 seconds after the user stops typing/pasting
  useEffect(() => {
    if (isSaved || isLoadingDoc || isSaving) return;

    // Avoid auto-creating a brand-new blank document if the user hasn't typed anything yet
    const combined = getCombinedHtml();
    const isBlankDefault =
      !currentDocIdRef.current &&
      (docTitle === "Untitled document" || !docTitle.trim()) &&
      (!combined || combined === "<p><br></p>");
    if (isBlankDefault) return;

    const timer = setTimeout(() => {
      handleSaveTemplate({ silent: true });
    }, 1800);

    return () => clearTimeout(timer);
  }, [isSaved, isLoadingDoc, isSaving, docTitle, pages, includeQrCode, qrPosition, getCombinedHtml, handleSaveTemplate]);

  // Flush any unsaved edits before navigating back to /dashboard/documents
  const handleBackToDocuments = async () => {
    if (!isSaved && !isLoadingDoc) {
      await handleSaveTemplate({ silent: true });
    }
    navigate("/dashboard/documents");
  };

  // Make a copy of the current document
  const handleMakeCopy = async () => {
    setActiveMenu(null);
    const copyTitle = `${docTitle || "Untitled document"} (Copy)`;
    const toastId = toast.loading("Creating a copy...");
    try {
      const res = await createCustomTemplate({
        title: copyTitle,
        layout_style: "document",
        canvas_data: {
          document_html: getCombinedHtml(),
          qr_code_enabled: includeQrCode,
          qr_position: qrPosition,
          zoom: zoomLevel,
        },
      });
      const newId = res.data?.template_id || res.data?.id;
      toast.success("Copy created!", { id: toastId });
      if (newId) {
        navigate(`/dashboard/documents/editor/${encodeDocUuid(newId)}`);
      }
    } catch (err) {
      toast.error("Failed to copy document", { id: toastId });
    }
  };

  // Direct Vector PDF Download (.pdf) - Never blank, selectable A4 vector text
  const handleDownloadPdf = async () => {
    setActiveMenu(null);
    const toastId = toast.loading("Generating PDF document...");
    try {
      const pageElements = pages.map((p, idx) => {
        if (isPreviewMode) return renderMergedPreviewForPage(p);
        const domEl = pageRefs.current[idx];
        return domEl && domEl.innerHTML ? domEl.innerHTML : p;
      });

      exportDocumentToPdf({
        title: docTitle || "ProofDeck_Document",
        pagesHtml: pageElements,
        pageMarginMm,
        includeQrCode,
        qrPosition,
      });
      toast.success("PDF downloaded!", { id: toastId });
    } catch (err) {
      toast.error("Failed to generate PDF", { id: toastId });
    }
  };

  // Download as Native Microsoft Word (.docx)
  const handleDownloadWord = () => {
    setActiveMenu(null);
    const toastId = toast.loading("Generating Word (.docx) document...");
    try {
      const pageElements = pages.map((p, idx) => {
        if (isPreviewMode) return renderMergedPreviewForPage(p);
        const domEl = pageRefs.current[idx];
        return domEl && domEl.innerHTML ? domEl.innerHTML : p;
      });

      exportDocumentToDocx({
        title: docTitle || "ProofDeck_Document",
        pagesHtml: pageElements,
      });
      toast.success("Downloaded Word (.docx) file", { id: toastId });
    } catch (err) {
      toast.error("Failed to generate Word (.docx) file", { id: toastId });
    }
  };

  const handleSelectPreset = (preset) => {
    setPresetToLoad(preset);
  };

  const renderMergedPreviewForPage = (pageHtml) => {
    const record = SAMPLE_RECORDS[selectedRecordIdx] || SAMPLE_RECORDS[0];
    let rendered = pageHtml;
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
    setActiveMenu(null);
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Please allow popups to print or save as PDF");
      return;
    }
    const content = isPreviewMode
      ? pages.map((p) => renderMergedPreviewForPage(p)).join('<div class="pd-page-break" style="page-break-after: always; break-after: page;"></div>')
      : getCombinedHtml();
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${docTitle}</title>
          <style>
            @page { size: A4 portrait; margin: ${pageMarginMm}mm; }
            body { font-family: ${currentFont}, sans-serif; font-size: ${currentFontSize}pt; line-height: 1.6; color: #111827; margin: 0; padding: 0; }
            h1 { font-size: 20pt; font-weight: 700; margin: 0.8em 0 0.35em; }
            h1.doc-title { font-size: 26pt; font-weight: 700; margin: 0 0 0.4em; }
            p.doc-subtitle { font-size: 15pt; color: #64748b; margin: 0 0 0.75em; }
            h2 { font-size: 16pt; font-weight: 700; margin: 0.75em 0 0.3em; }
            h3 { font-size: 13.5pt; font-weight: 700; margin: 0.65em 0 0.25em; }
            h4 { font-size: 11.5pt; font-weight: 700; margin: 0.5em 0 0.2em; }
            p { margin: 0 0 0.6em; }
            ul { list-style-type: disc; padding-left: 1.75rem; margin: 0.5em 0; }
            ol { list-style-type: decimal; padding-left: 1.75rem; margin: 0.5em 0; }
            li { margin: 0.2em 0; }
            table { width: 100%; border-collapse: collapse; margin: 0.85em 0; }
            th, td { border: 1px solid #cbd5e1; padding: 8px 10px; text-align: left; }
            th { background-color: #f8fafc; font-weight: 700; }
            .pd-chip { background: transparent !important; border: none !important; font-weight: bold; font-family: inherit !important; padding: 0 !important; }
            .pd-page-break { display: block !important; page-break-after: always !important; break-after: page !important; height: 0 !important; margin: 0 !important; padding: 0 !important; border: none !important; visibility: hidden !important; }
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

  const handleAutoPaginateAll = () => {
    setActiveMenu(null);
    const combined = getCombinedHtml();
    const paginated = paginateHtml(combined);
    setPages(paginated);
    syncDomPages(paginated);
    toast.success(`Formatted across ${paginated.length} A4 page${paginated.length > 1 ? "s" : ""}`);
  };

  const filteredMergeVars = MERGE_VARIABLES.map((grp) => ({
    ...grp,
    vars: grp.vars.filter(
      (v) =>
        v.label.toLowerCase().includes(varSearchQuery.toLowerCase()) ||
        v.key.toLowerCase().includes(varSearchQuery.toLowerCase())
    ),
  })).filter((grp) => grp.vars.length > 0);

  const activeBlockStyleLabel = BLOCK_STYLES.find((b) => b.id === currentBlockStyle)?.label || "Normal text";

  return (
    <div className="flex flex-col h-full min-h-0 w-full bg-[#f8f9fa] dark:bg-slate-950 overflow-hidden font-sans select-none">
      <Toaster position="top-right" />
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleWordImport}
        accept=".docx"
        className="hidden"
      />

      {/* Top Header - Fixed & Pinned */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-2 flex-none shrink-0 z-30 sticky top-0">
        <div className="flex items-center justify-between gap-4">
          {/* Left Title & Menu Section */}
          <div data-tour="doc-editor-header" className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={handleBackToDocuments}
              className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Back to Documents"
            >
              <ArrowLeft size={16} weight="bold" />
            </button>

            <ProofDeckDocIcon size={28} />

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <input
                  ref={titleInputRef}
                  type="text"
                  value={docTitle}
                  onChange={(e) => {
                    setDocTitle(e.target.value);
                    setIsSaved(false);
                  }}
                  className="font-semibold text-slate-800 dark:text-slate-100 text-sm bg-transparent border border-transparent hover:border-slate-300 focus:border-indigo-500 outline-none px-1.5 py-0.5 rounded transition-colors max-w-[240px] sm:max-w-md truncate"
                />
                <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                  {isLoadingDoc ? "Loading..." : isSaving ? "Saving..." : isSaved ? "Saved" : "Saving..."}
                </span>
              </div>

              {/* Google Docs Style Menu Bar */}
              <div ref={menuContainerRef} className="flex items-center gap-1 sm:gap-2 text-xs text-slate-600 dark:text-slate-400 pt-0.5 relative">
                {/* FILE MENU */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setActiveMenu(activeMenu === "file" ? null : "file")}
                    className={`px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
                      activeMenu === "file"
                        ? "bg-slate-200/80 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                        : "hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    File
                  </button>
                  {activeMenu === "file" && (
                    <div className="absolute left-0 top-full mt-1 w-60 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-1.5 z-50 text-xs text-slate-700 dark:text-slate-200">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveMenu(null);
                          currentDocIdRef.current = null;
                          setCurrentDocId(null);
                          setDocTitle("Untitled document");
                          pagesRef.current = ["<p><br></p>"];
                          setPages(["<p><br></p>"]);
                          syncDomPages(["<p><br></p>"]);
                          setIsSaved(true);
                          navigate("/dashboard/documents/editor");
                        }}
                        className="w-full text-left px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 cursor-pointer"
                      >
                        <FileText size={15} className="text-indigo-600" />
                        <span>New blank document</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          fileInputRef.current?.click();
                          setActiveMenu(null);
                        }}
                        className="w-full text-left px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 cursor-pointer"
                      >
                        <UploadSimple size={15} className="text-slate-500" />
                        <span>Open / Import Word (.docx)</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleMakeCopy}
                        className="w-full text-left px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 cursor-pointer"
                      >
                        <Copy size={15} className="text-slate-500" />
                        <span>Make a copy</span>
                      </button>

                      <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

                      <button
                        type="button"
                        onClick={handleDownloadPdf}
                        className="w-full text-left px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between cursor-pointer"
                      >
                        <span className="flex items-center gap-2.5 font-medium text-slate-800 dark:text-slate-100">
                          <FilePdf size={15} className="text-rose-600" weight="fill" />
                          <span>Download as PDF (.pdf)</span>
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={handleDownloadWord}
                        className="w-full text-left px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 cursor-pointer"
                      >
                        <FileDoc size={15} className="text-blue-600" weight="fill" />
                        <span>Download as Microsoft Word (.docx)</span>
                      </button>

                      <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

                      <button
                        type="button"
                        onClick={() => {
                          setActiveMenu(null);
                          setTimeout(() => {
                            titleInputRef.current?.focus();
                            titleInputRef.current?.select();
                          }, 30);
                        }}
                        className="w-full text-left px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 cursor-pointer"
                      >
                        <TextT size={15} className="text-slate-500" />
                        <span>Rename</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPageMarginMm((prev) => (prev === 25 ? 15 : prev === 15 ? 30 : 25));
                          setActiveMenu(null);
                          toast.success(
                            `Page margins set to ${pageMarginMm === 25 ? "Narrow (15mm)" : pageMarginMm === 15 ? "Wide (30mm)" : "Standard (25mm)"}`
                          );
                        }}
                        className="w-full text-left px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between cursor-pointer"
                      >
                        <span className="flex items-center gap-2.5">
                          <FileText size={15} className="text-slate-500" />
                          <span>Page margins</span>
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{pageMarginMm}mm</span>
                      </button>
                      <button
                        type="button"
                        onClick={handlePrint}
                        className="w-full text-left px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between cursor-pointer"
                      >
                        <span className="flex items-center gap-2.5">
                          <Printer size={15} className="text-slate-500" />
                          <span>Print</span>
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">Ctrl+P</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* EDIT MENU */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setActiveMenu(activeMenu === "edit" ? null : "edit")}
                    className={`px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
                      activeMenu === "edit"
                        ? "bg-slate-200/80 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                        : "hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    Edit
                  </button>
                  {activeMenu === "edit" && (
                    <div className="absolute left-0 top-full mt-1 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-1.5 z-50 text-xs text-slate-700 dark:text-slate-200">
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          execCmd("undo");
                          setActiveMenu(null);
                        }}
                        className="w-full text-left px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between cursor-pointer"
                      >
                        <span>Undo</span>
                        <span className="text-[10px] text-slate-400 font-mono">Ctrl+Z</span>
                      </button>
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          execCmd("redo");
                          setActiveMenu(null);
                        }}
                        className="w-full text-left px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between cursor-pointer"
                      >
                        <span>Redo</span>
                        <span className="text-[10px] text-slate-400 font-mono">Ctrl+Y</span>
                      </button>
                      <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          execCmd("selectAll");
                          setActiveMenu(null);
                        }}
                        className="w-full text-left px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between cursor-pointer"
                      >
                        <span>Select all on page</span>
                        <span className="text-[10px] text-slate-400 font-mono">Ctrl+A</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* VIEW MENU */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setActiveMenu(activeMenu === "view" ? null : "view")}
                    className={`px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
                      activeMenu === "view"
                        ? "bg-slate-200/80 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                        : "hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    View
                  </button>
                  {activeMenu === "view" && (
                    <div className="absolute left-0 top-full mt-1 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-1.5 z-50 text-xs text-slate-700 dark:text-slate-200">
                      <button
                        type="button"
                        onClick={() => {
                          setIsPreviewMode(!isPreviewMode);
                          setActiveMenu(null);
                        }}
                        className="w-full text-left px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between cursor-pointer"
                      >
                        <span>{isPreviewMode ? "Switch to Editing" : "Preview Merged Record"}</span>
                        {isPreviewMode && <Check size={13} className="text-indigo-600" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsSidebarOpen(!isSidebarOpen);
                          setActiveMenu(null);
                        }}
                        className="w-full text-left px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between cursor-pointer"
                      >
                        <span>Show Left Panel</span>
                        {isSidebarOpen && <Check size={13} className="text-indigo-600" />}
                      </button>
                      <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
                      {["75%", "90%", "100%", "125%", "150%"].map((z) => (
                        <button
                          key={z}
                          type="button"
                          onClick={() => {
                            setZoomLevel(z);
                            setActiveMenu(null);
                          }}
                          className="w-full text-left px-3.5 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between cursor-pointer"
                        >
                          <span>Zoom {z}</span>
                          {zoomLevel === z && <Check size={13} className="text-indigo-600" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* INSERT MENU */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setActiveMenu(activeMenu === "insert" ? null : "insert")}
                    className={`px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
                      activeMenu === "insert"
                        ? "bg-slate-200/80 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                        : "hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    Insert
                  </button>
                  {activeMenu === "insert" && (
                    <div className="absolute left-0 top-full mt-1 w-60 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-1.5 z-50 text-xs text-slate-700 dark:text-slate-200">
                      <button
                        type="button"
                        onClick={() => {
                          setIsSidebarOpen(true);
                          setActiveTab("variables");
                          setActiveMenu(null);
                        }}
                        className="w-full text-left px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 cursor-pointer"
                      >
                        <PuzzlePiece size={15} className="text-indigo-600" />
                        <span>Dynamic Merge Variable</span>
                      </button>
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={insertSignatureBlock}
                        className="w-full text-left px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 cursor-pointer"
                      >
                        <PenNib size={15} className="text-indigo-600" />
                        <span>Official Signature Block</span>
                      </button>
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={insertOfficialSeal}
                        className="w-full text-left px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 cursor-pointer"
                      >
                        <SealCheck size={15} className="text-amber-600" />
                        <span>Official Verification Seal</span>
                      </button>
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={insertAcademicTable}
                        className="w-full text-left px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 cursor-pointer"
                      >
                        <Table size={15} className="text-indigo-600" />
                        <span>Academic Results Table</span>
                      </button>

                      {/* Custom Editable Table Builder */}
                      <div className="px-3.5 py-2 bg-slate-50/70 dark:bg-slate-800/40 border-y border-slate-100 dark:border-slate-800 my-1">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                          Insert Custom Table
                        </div>
                        <div className="flex items-center gap-1.5">
                          <label className="flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-300">
                            <span>Rows</span>
                            <input
                              type="number"
                              min={1}
                              max={30}
                              value={customTableRows}
                              onChange={(e) => setCustomTableRows(e.target.value)}
                              className="w-11 px-1.5 py-0.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-center"
                            />
                          </label>
                          <span className="text-slate-400">×</span>
                          <label className="flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-300">
                            <span>Cols</span>
                            <input
                              type="number"
                              min={1}
                              max={12}
                              value={customTableCols}
                              onChange={(e) => setCustomTableCols(e.target.value)}
                              className="w-11 px-1.5 py-0.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-center"
                            />
                          </label>
                          <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => insertCustomTable(customTableRows, customTableCols)}
                            className="ml-auto px-2.5 py-1 bg-[#5144E8] hover:bg-indigo-700 text-white font-semibold rounded-md text-[11px] cursor-pointer transition-colors"
                          >
                            Insert
                          </button>
                        </div>
                      </div>

                      <button
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          saveSelection();
                        }}
                        onClick={openLinkPopover}
                        className="w-full text-left px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between cursor-pointer"
                      >
                        <span className="flex items-center gap-2.5">
                          <LinkIcon size={15} className="text-slate-500" />
                          <span>Link</span>
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">Ctrl+K</span>
                      </button>
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          execCmd("insertHorizontalRule");
                          setActiveMenu(null);
                        }}
                        className="w-full text-left px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 cursor-pointer"
                      >
                        <span className="w-3.5 h-0.5 bg-slate-500 inline-block" />
                        <span>Horizontal line</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          insertPageBreak();
                          setActiveMenu(null);
                        }}
                        className="w-full text-left px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between cursor-pointer"
                      >
                        <span className="flex items-center gap-2.5">
                          <FileText size={15} className="text-slate-500" />
                          <span>Page break</span>
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">Ctrl+Enter</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* FORMAT MENU */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setActiveMenu(activeMenu === "format" ? null : "format")}
                    className={`px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
                      activeMenu === "format"
                        ? "bg-slate-200/80 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                        : "hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    Format
                  </button>
                  {activeMenu === "format" && (
                    <div className="absolute left-0 top-full mt-1 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-1.5 z-50 text-xs text-slate-700 dark:text-slate-200">
                      <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Paragraph Styles
                      </div>
                      {BLOCK_STYLES.map((bs) => (
                        <button
                          key={bs.id}
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            applyBlockStyle(bs);
                            setActiveMenu(null);
                          }}
                          className="w-full text-left px-3.5 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between cursor-pointer"
                        >
                          <span className={bs.id.startsWith("h") || bs.id === "title" ? "font-bold" : ""}>{bs.label}</span>
                          {currentBlockStyle === bs.id && <Check size={13} className="text-indigo-600" />}
                        </button>
                      ))}
                      <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          execCmd("insertUnorderedList");
                          setActiveMenu(null);
                        }}
                        className="w-full text-left px-3.5 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                      >
                        <ListBullets size={14} /> Bulleted list
                      </button>
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          execCmd("insertOrderedList");
                          setActiveMenu(null);
                        }}
                        className="w-full text-left px-3.5 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                      >
                        <ListNumbers size={14} /> Numbered list
                      </button>
                      <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          execCmd("removeFormat");
                          setActiveMenu(null);
                        }}
                        className="w-full text-left px-3.5 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 text-rose-600 cursor-pointer"
                      >
                        <Eraser size={14} /> Clear formatting
                      </button>
                    </div>
                  )}
                </div>

                {/* TOOLS MENU */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setActiveMenu(activeMenu === "tools" ? null : "tools")}
                    className={`px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
                      activeMenu === "tools"
                        ? "bg-slate-200/80 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                        : "hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    Tools
                  </button>
                  {activeMenu === "tools" && (
                    <div className="absolute left-0 top-full mt-1 w-60 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-1.5 z-50 text-xs text-slate-700 dark:text-slate-200">
                      <button
                        type="button"
                        onClick={handleAutoPaginateAll}
                        className="w-full text-left px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 cursor-pointer"
                      >
                        <Sparkle size={15} className="text-indigo-600" />
                        <span>Auto-paginate overflowing pages</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const html = getCombinedHtml();
                          const plain = html.replace(/<[^>]+>/g, " ").trim();
                          const words = plain ? plain.split(/\s+/).filter(Boolean).length : 0;
                          const chars = plain.length;
                          const vars = (html.match(/\{\{[a-zA-Z0-9_]+\}\}/g) || []).length;
                          toast.success(
                            `${pages.length} page(s) • ${words} words • ${chars} chars • ${vars} dynamic variable(s)`
                          );
                          setActiveMenu(null);
                        }}
                        className="w-full text-left px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 cursor-pointer"
                      >
                        <FileText size={15} className="text-slate-500" />
                        <span>Word & variable count</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Header Actions */}
          <div data-tour="doc-editor-actions" className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => startTour()}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200/80 dark:border-indigo-800/60 rounded-lg transition-all cursor-pointer shadow-2xs"
              title="Play interactive tour of the Document Editor"
            >
              <Play size={11} weight="fill" className="text-indigo-600 dark:text-indigo-400" />
              <span className="hidden sm:inline">Play tour</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPdf}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg transition-all cursor-pointer shadow-2xs"
              title="Download document as PDF"
            >
              <DownloadSimple size={14} weight="bold" className="text-indigo-600 dark:text-indigo-400" />
              <span className="hidden md:inline">Download PDF</span>
            </button>

            <AppButton
              variant={isPreviewMode ? "primary" : "secondary"}
              onClick={() => setIsPreviewMode(!isPreviewMode)}
            >
              {isPreviewMode ? "Edit" : "Preview"}
            </AppButton>
            <AppButton
              variant="primary"
              onClick={() => handleSaveTemplate({ silent: false })}
              disabled={isSaving || isLoadingDoc}
            >
              {isSaving ? "Saving..." : isSaved && currentDocId ? "Saved" : "Save document"}
            </AppButton>
          </div>
        </div>
      </header>

      {/* Google Docs Style Formatting Toolbar - Fixed & Pinned */}
      <div
        ref={toolbarDropdownRef}
        className="bg-[#edf2fa] dark:bg-slate-900/95 border-b border-slate-200/90 dark:border-slate-800 px-3 py-1.5 flex items-center gap-1 flex-wrap flex-none shrink-0 z-20"
      >
        {/* Undo / Redo / Print */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCmd("undo")}
          className="p-1.5 rounded hover:bg-slate-200/70 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
          title="Undo (Ctrl+Z)"
        >
          <ArrowCounterClockwise size={14} weight="bold" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCmd("redo")}
          className="p-1.5 rounded hover:bg-slate-200/70 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
          title="Redo (Ctrl+Y)"
        >
          <ArrowClockwise size={14} weight="bold" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={handlePrint}
          className="p-1.5 rounded hover:bg-slate-200/70 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
          title="Print / Save as PDF (Ctrl+P)"
        >
          <Printer size={14} weight="bold" />
        </button>

        <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

        {/* Zoom Selector */}
        <select
          value={zoomLevel}
          onChange={(e) => setZoomLevel(e.target.value)}
          className="bg-transparent hover:bg-slate-200/70 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-medium px-1.5 py-1 rounded border-0 outline-none cursor-pointer"
          title="Zoom"
        >
          <option value="75%">75%</option>
          <option value="90%">90%</option>
          <option value="100%">100%</option>
          <option value="125%">125%</option>
          <option value="150%">150%</option>
        </select>

        <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

        {/* GOOGLE DOCS BLOCK STYLE DROPDOWN (Normal text, Title, Subtitle, Heading 1-4) */}
        <div className="relative">
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              saveSelection();
            }}
            onClick={() => setOpenToolbarDropdown(openToolbarDropdown === "style" ? null : "style")}
            className="flex items-center justify-between gap-2 min-w-[115px] px-2.5 py-1 rounded hover:bg-slate-200/70 dark:hover:bg-slate-800 text-xs font-medium text-slate-800 dark:text-slate-200 cursor-pointer"
            title="Styles (Normal text, Title, Headings)"
          >
            <span className="truncate">{activeBlockStyleLabel}</span>
            <CaretDown size={11} />
          </button>

          {openToolbarDropdown === "style" && (
            <div className="absolute left-0 top-full mt-1 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl py-1.5 z-50 divide-y divide-slate-100 dark:divide-slate-800">
              {BLOCK_STYLES.map((bs) => {
                const isActive = currentBlockStyle === bs.id;
                return (
                  <button
                    key={bs.id}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => applyBlockStyle(bs)}
                    className={`w-full text-left px-3.5 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 cursor-pointer transition-colors ${
                      isActive ? "bg-indigo-50/70 dark:bg-indigo-950/40" : ""
                    }`}
                  >
                    <span className="w-4 flex items-center justify-center shrink-0">
                      {isActive && <Check size={14} weight="bold" className="text-indigo-600" />}
                    </span>
                    <span className={bs.previewClass}>{bs.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

        {/* FONT FAMILY DROPDOWN */}
        <div className="relative">
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              saveSelection();
            }}
            onClick={() => setOpenToolbarDropdown(openToolbarDropdown === "font" ? null : "font")}
            className="flex items-center justify-between gap-2 min-w-[110px] max-w-[140px] px-2.5 py-1 rounded hover:bg-slate-200/70 dark:hover:bg-slate-800 text-xs font-medium text-slate-800 dark:text-slate-200 cursor-pointer"
            title="Font Family"
          >
            <span className="truncate" style={{ fontFamily: currentFont }}>
              {currentFont}
            </span>
            <CaretDown size={11} />
          </button>

          {openToolbarDropdown === "font" && (
            <div className="absolute left-0 top-full mt-1 w-52 max-h-72 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl py-1 z-50">
              {FONT_FAMILIES.map((f) => (
                <button
                  key={f}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleFontChange(f)}
                  className="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 text-xs text-slate-800 dark:text-slate-200 cursor-pointer"
                  style={{ fontFamily: f }}
                >
                  <span className="w-4 shrink-0">
                    {currentFont === f && <Check size={13} weight="bold" className="text-indigo-600" />}
                  </span>
                  <span>{f}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

        {/* FONT SIZE STEPPER & DROPDOWN (- 11 +) */}
        <div className="relative flex items-center gap-0.5">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => handleFontSizeChange(Math.max(8, (parseInt(currentFontSize, 10) || 11) - 1))}
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-slate-200/70 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
            title="Decrease font size"
          >
            −
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              saveSelection();
            }}
            onClick={() => setOpenToolbarDropdown(openToolbarDropdown === "size" ? null : "size")}
            className="min-w-[32px] h-6 px-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-xs font-semibold text-slate-800 dark:text-slate-100 text-center cursor-pointer hover:border-indigo-500"
            title="Font size (pt)"
          >
            {currentFontSize}
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => handleFontSizeChange(Math.min(72, (parseInt(currentFontSize, 10) || 11) + 1))}
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-slate-200/70 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
            title="Increase font size"
          >
            +
          </button>

          {openToolbarDropdown === "size" && (
            <div className="absolute left-6 top-full mt-1 w-20 max-h-64 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-1 z-50">
              {FONT_SIZES.map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleFontSizeChange(sz)}
                  className={`w-full text-center py-1.5 text-xs hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer ${
                    String(currentFontSize) === sz ? "bg-indigo-50 text-indigo-600 font-bold" : "text-slate-700 dark:text-slate-200"
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

        {/* Bold, Italic, Underline, Strikethrough */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCmd("bold")}
          className={`p-1.5 rounded cursor-pointer transition-colors ${
            formatState.bold
              ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300"
              : "hover:bg-slate-200/70 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
          }`}
          title="Bold (Ctrl+B)"
        >
          <TextB size={14} weight="bold" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCmd("italic")}
          className={`p-1.5 rounded cursor-pointer transition-colors ${
            formatState.italic
              ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300"
              : "hover:bg-slate-200/70 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
          }`}
          title="Italic (Ctrl+I)"
        >
          <TextItalic size={14} weight="bold" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCmd("underline")}
          className={`p-1.5 rounded cursor-pointer transition-colors ${
            formatState.underline
              ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300"
              : "hover:bg-slate-200/70 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
          }`}
          title="Underline (Ctrl+U)"
        >
          <TextUnderline size={14} weight="bold" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCmd("strikeThrough")}
          className={`p-1.5 rounded cursor-pointer transition-colors ${
            formatState.strikeThrough
              ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300"
              : "hover:bg-slate-200/70 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
          }`}
          title="Strikethrough"
        >
          <TextStrikethrough size={14} weight="bold" />
        </button>

        {/* Text Color Picker */}
        <div className="relative">
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              saveSelection();
            }}
            onClick={() => setOpenToolbarDropdown(openToolbarDropdown === "color" ? null : "color")}
            className="p-1.5 rounded hover:bg-slate-200/70 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex flex-col items-center cursor-pointer"
            title="Text color"
          >
            <span className="text-xs font-extrabold leading-none">A</span>
            <span className="w-3.5 h-1 bg-indigo-600 rounded-full mt-0.5" />
          </button>
          {openToolbarDropdown === "color" && (
            <div className="absolute left-0 top-full mt-1 p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 w-40">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Text Color</div>
              <div className="grid grid-cols-4 gap-1.5">
                {TEXT_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      execCmd("foreColor", c);
                      setOpenToolbarDropdown(null);
                    }}
                    className="w-6 h-6 rounded-full border border-slate-200 hover:scale-110 transition-transform cursor-pointer"
                    style={{ backgroundColor: c }}
                    title={c}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Highlight Color Picker */}
        <div className="relative">
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              saveSelection();
            }}
            onClick={() => setOpenToolbarDropdown(openToolbarDropdown === "highlight" ? null : "highlight")}
            className="p-1.5 rounded hover:bg-slate-200/70 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
            title="Highlight color"
          >
            <Highlighter size={14} weight="bold" />
          </button>
          {openToolbarDropdown === "highlight" && (
            <div className="absolute left-0 top-full mt-1 p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 w-40">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Highlight</div>
              <div className="grid grid-cols-4 gap-1.5">
                {HIGHLIGHT_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      execCmd("hiliteColor", c);
                      setOpenToolbarDropdown(null);
                    }}
                    className="w-6 h-6 rounded-full border border-slate-300 hover:scale-110 transition-transform cursor-pointer flex items-center justify-center text-[9px]"
                    style={{ backgroundColor: c === "transparent" ? "#ffffff" : c }}
                    title={c === "transparent" ? "None" : c}
                  >
                    {c === "transparent" && "✕"}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

        {/* Alignments */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCmd("justifyLeft")}
          className={`p-1.5 rounded cursor-pointer ${
            formatState.justifyLeft
              ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300"
              : "hover:bg-slate-200/70 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
          }`}
          title="Align Left"
        >
          <TextAlignLeft size={14} weight="bold" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCmd("justifyCenter")}
          className={`p-1.5 rounded cursor-pointer ${
            formatState.justifyCenter
              ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300"
              : "hover:bg-slate-200/70 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
          }`}
          title="Align Center"
        >
          <TextAlignCenter size={14} weight="bold" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCmd("justifyRight")}
          className={`p-1.5 rounded cursor-pointer ${
            formatState.justifyRight
              ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300"
              : "hover:bg-slate-200/70 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
          }`}
          title="Align Right"
        >
          <TextAlignRight size={14} weight="bold" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCmd("justifyFull")}
          className={`p-1.5 rounded cursor-pointer ${
            formatState.justifyFull
              ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300"
              : "hover:bg-slate-200/70 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
          }`}
          title="Justify"
        >
          <TextAlignJustify size={14} weight="bold" />
        </button>

        {/* Line Spacing */}
        <div className="relative">
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              saveSelection();
            }}
            onClick={() => setOpenToolbarDropdown(openToolbarDropdown === "spacing" ? null : "spacing")}
            className="p-1.5 rounded hover:bg-slate-200/70 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
            title="Line spacing"
          >
            <ArrowsOutLineVertical size={14} weight="bold" />
          </button>
          {openToolbarDropdown === "spacing" && (
            <div className="absolute left-0 top-full mt-1 w-36 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-1 z-50 text-xs">
              {[
                { label: "Single (1.0)", val: "1.2" },
                { label: "1.15", val: "1.35" },
                { label: "1.5", val: "1.6" },
                { label: "Double (2.0)", val: "2.0" },
              ].map((sp) => (
                <button
                  key={sp.val}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleLineSpacingChange(sp.val)}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between cursor-pointer"
                >
                  <span>{sp.label}</span>
                  {currentLineSpacing === sp.val && <Check size={12} className="text-indigo-600" />}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

        {/* Bullet List, Numbered List, Outdent, Indent */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCmd("insertUnorderedList")}
          className={`p-1.5 rounded cursor-pointer transition-colors ${
            formatState.unorderedList
              ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300"
              : "hover:bg-slate-200/70 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
          }`}
          title="Bulleted list"
        >
          <ListBullets size={15} weight="bold" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCmd("insertOrderedList")}
          className={`p-1.5 rounded cursor-pointer transition-colors ${
            formatState.orderedList
              ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300"
              : "hover:bg-slate-200/70 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
          }`}
          title="Numbered list"
        >
          <ListNumbers size={15} weight="bold" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCmd("outdent")}
          className="p-1.5 rounded hover:bg-slate-200/70 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
          title="Decrease indent"
        >
          <TextOutdent size={14} weight="bold" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCmd("indent")}
          className="p-1.5 rounded hover:bg-slate-200/70 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
          title="Increase indent"
        >
          <TextIndent size={14} weight="bold" />
        </button>

        {/* Insert Link Button (Opens Floating Popover) */}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            saveSelection();
          }}
          onClick={openLinkPopover}
          className={`p-1.5 rounded cursor-pointer transition-colors ${
            linkPopover.open
              ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300"
              : "hover:bg-slate-200/70 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
          }`}
          title="Insert or edit link (Ctrl+K)"
        >
          <LinkIcon size={14} weight="bold" />
        </button>

        {/* Quick Insert Table Button */}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            saveSelection();
          }}
          onClick={() => insertCustomTable(4, 4)}
          className="p-1.5 rounded hover:bg-slate-200/70 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
          title="Insert 4×4 Table"
        >
          <Table size={14} weight="bold" />
        </button>

        {/* Clear Formatting */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCmd("removeFormat")}
          className="p-1.5 rounded hover:bg-slate-200/70 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
          title="Clear formatting"
        >
          <Eraser size={14} weight="bold" />
        </button>

        <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

        {/* Add Page & Page Break Buttons */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => handleAddPage(activePageIdxRef.current)}
          className="px-2 py-1 rounded hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1 text-xs cursor-pointer font-semibold"
          title="Add New A4 Page"
        >
          <Plus size={13} weight="bold" className="text-[#5144E8]" />
          <span className="hidden sm:inline">Add page</span>
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={insertPageBreak}
          className="px-2 py-1 rounded hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1 text-xs cursor-pointer font-semibold"
          title="Insert Page Break (Ctrl+Enter)"
        >
          <FileText size={13} weight="bold" />
          <span className="hidden sm:inline">Page break</span>
        </button>
      </div>

      {/* Contextual Table Editing Toolbar - Appears automatically whenever cursor is inside a Table */}
      {isInsideTable && !isPreviewMode && (
        <div className="bg-indigo-50/95 dark:bg-indigo-950/80 border-b border-indigo-200/80 dark:border-indigo-800/70 px-4 py-1.5 flex items-center gap-1.5 flex-wrap flex-none shrink-0 z-20 text-xs">
          <span className="inline-flex items-center gap-1.5 font-bold text-indigo-800 dark:text-indigo-200 mr-2">
            <Table size={14} weight="bold" className="text-indigo-600" />
            <span>Table Tools:</span>
          </span>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => handleTableAddRow("below")}
            className="px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-700 dark:text-slate-200 border border-indigo-200 dark:border-indigo-700 font-semibold text-[11px] transition-colors cursor-pointer shadow-2xs"
          >
            + Row below
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => handleTableAddRow("above")}
            className="px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-700 dark:text-slate-200 border border-indigo-200 dark:border-indigo-700 font-semibold text-[11px] transition-colors cursor-pointer shadow-2xs"
          >
            + Row above
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => handleTableAddCol("right")}
            className="px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-700 dark:text-slate-200 border border-indigo-200 dark:border-indigo-700 font-semibold text-[11px] transition-colors cursor-pointer shadow-2xs"
          >
            + Column right
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => handleTableAddCol("left")}
            className="px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-700 dark:text-slate-200 border border-indigo-200 dark:border-indigo-700 font-semibold text-[11px] transition-colors cursor-pointer shadow-2xs"
          >
            + Column left
          </button>
          <div className="h-3.5 w-px bg-indigo-200 dark:bg-indigo-800 mx-1" />
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleTableDeleteRow}
            className="px-2 py-1 rounded-md bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/60 text-rose-600 border border-rose-200 dark:border-rose-800 font-semibold text-[11px] transition-colors cursor-pointer"
          >
            Delete row
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleTableDeleteCol}
            className="px-2 py-1 rounded-md bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/60 text-rose-600 border border-rose-200 dark:border-rose-800 font-semibold text-[11px] transition-colors cursor-pointer"
          >
            Delete column
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleTableDelete}
            className="px-2 py-1 rounded-md bg-rose-600 hover:bg-rose-700 text-white font-semibold text-[11px] transition-colors cursor-pointer ml-auto"
          >
            Delete table
          </button>
        </div>
      )}

      {/* Preview Mode Bar */}
      {isPreviewMode && (
        <div className="bg-slate-800 text-white px-4 py-1.5 flex items-center justify-between text-xs flex-none shrink-0 z-20">
          <span>Previewing merged recipient output ({pages.length} page{pages.length > 1 ? "s" : ""})</span>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Sample Recipient:</span>
            <select
              value={selectedRecordIdx}
              onChange={(e) => setSelectedRecordIdx(parseInt(e.target.value, 10))}
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
      <div className="flex-1 min-h-0 flex overflow-hidden relative">
        {/* Left Side Panel */}
        <aside
          data-tour="doc-editor-sidebar"
          className={`bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 transition-all duration-200 z-10 ${
            isSidebarOpen ? "w-72" : "w-11"
          }`}
        >
          <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            {isSidebarOpen ? (
              <>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 tracking-tight">
                  ProofDeck Tools
                </span>
                <button
                  type="button"
                  onClick={() => setIsSidebarOpen(false)}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-100/80 dark:bg-slate-800 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/60 border border-slate-200/80 dark:border-slate-700 transition-colors cursor-pointer"
                  title="Collapse ProofDeck Tools panel"
                >
                  <CaretDoubleLeft size={12} weight="bold" />
                  <span>Hide</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setIsSidebarOpen(true)}
                className="w-full py-2 flex flex-col items-center gap-2 rounded-lg text-indigo-600 dark:text-indigo-400 bg-indigo-50/70 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200/60 dark:border-indigo-800/50 transition-colors cursor-pointer"
                title="Expand ProofDeck Tools panel"
              >
                <CaretDoubleRight size={14} weight="bold" />
                <span
                  className="text-[9px] font-extrabold uppercase tracking-widest"
                  style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
                >
                  Tools
                </span>
              </button>
            )}
          </div>

          {isSidebarOpen && (
            <div className="flex-1 flex flex-col min-h-0">
              {/* Tab Selector */}
              <div className="flex border-b border-slate-100 dark:border-slate-800 p-1 gap-1">
                <button
                  type="button"
                  onClick={() => setActiveTab("variables")}
                  className={`flex-1 py-1 text-xs font-medium rounded cursor-pointer ${
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
                  className={`flex-1 py-1 text-xs font-medium rounded cursor-pointer ${
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
                  className={`flex-1 py-1 text-xs font-medium rounded cursor-pointer ${
                    activeTab === "security"
                      ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
                >
                  Security
                </button>
              </div>

              {/* Tab 1: Variables & ProofDeck Blocks */}
              {activeTab === "variables" && (
                <div className="flex-1 overflow-y-auto p-3 space-y-4">
                  {/* Quick ProofDeck Blocks */}
                  <div className="space-y-1.5">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Official Blocks
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={insertSignatureBlock}
                        className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-indigo-400 hover:bg-indigo-50/20 text-left text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <PenNib size={13} className="text-indigo-600 shrink-0" />
                        <span className="truncate">+ Signature</span>
                      </button>
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={insertOfficialSeal}
                        className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-indigo-400 hover:bg-indigo-50/20 text-left text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <SealCheck size={13} className="text-amber-600 shrink-0" />
                        <span className="truncate">+ Seal Stamp</span>
                      </button>
                    </div>
                  </div>

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
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => insertVariable(v.key, v.label)}
                            className="flex items-center justify-between p-1.5 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-400 hover:bg-indigo-50/20 cursor-pointer text-xs transition-colors"
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
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddCustomVar();
                          }
                        }}
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
                      className="w-4 h-4 rounded text-blue-600 cursor-pointer"
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

        {/* Right Canvas Column */}
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden bg-[#f0f4f9] dark:bg-slate-950">
          {/* Margin Ruler - Inside Canvas Column, aligned with the A4 paper */}
          <div className="h-6 bg-[#f8f9fa] dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-center flex-none shrink-0 z-10 shadow-2xs">
            <div className="w-[210mm] relative h-full flex items-center">
              <div
                className="absolute text-[#5144E8] text-[10px] leading-none select-none font-bold"
                style={{ left: `${pageMarginMm}mm` }}
              >
                ▼
              </div>
              <div
                className="absolute text-[#5144E8] text-[10px] leading-none select-none font-bold"
                style={{ right: `${pageMarginMm}mm` }}
              >
                ▼
              </div>
              <div
                className="w-full h-0.5 bg-slate-300 dark:bg-slate-700 rounded-full"
                style={{ marginLeft: `${pageMarginMm}mm`, marginRight: `${pageMarginMm}mm` }}
              />
            </div>
          </div>

          {/* Canvas Scroll Viewport - Block scroll container so flex-shrink never squishes A4 sheets */}
          <main
            data-tour="doc-editor-canvas"
            className="flex-1 min-h-0 h-full overflow-y-auto overflow-x-auto py-8 px-4 sm:px-8 block bg-[#f0f4f9] dark:bg-slate-950"
          >
            <div
              className="w-fit mx-auto flex flex-col items-center pb-28"
              style={{
                transform: zoomLevel !== "100%" ? `scale(${parseFloat(zoomLevel) / 100})` : undefined,
                transformOrigin: "top center",
              }}
            >
              {/* Multi-page A4 Paper Sheets */}
              {pages.map((pageHtml, index) => (
                <div
                  key={index}
                  data-theme-ignore="true"
                  className="pd-doc-canvas shrink-0 bg-white text-slate-900 shadow-md border border-slate-200/90 relative transition-shadow rounded-xs mb-10"
                  style={{
                    width: "210mm",
                    minHeight: "297mm",
                    height: "auto",
                    padding: `${pageMarginMm}mm`,
                    boxSizing: "border-box",
                  }}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragOver={(e) => e.preventDefault()}
                >
                  {/* Page Indicator & Delete button above printable area */}
                  <div className="absolute -top-6 left-0 right-0 flex items-center justify-between text-[11px] text-slate-400 font-medium px-1 select-none">
                    <span className="bg-slate-200/80 dark:bg-slate-800 px-2 py-0.5 rounded text-[10px] text-slate-600 dark:text-slate-300 font-semibold tracking-wide">
                      Page {index + 1} of {pages.length}
                    </span>
                    {pages.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeletePage(index)}
                        className="text-slate-400 hover:text-rose-600 transition-colors px-1.5 py-0.5 rounded cursor-pointer flex items-center gap-1 text-[10px] bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700"
                        title={`Delete page ${index + 1}`}
                      >
                        <Trash size={12} />
                        <span>Delete page</span>
                      </button>
                    )}
                  </div>

                  {/* Header QR (Only on first page) */}
                  {includeQrCode && qrPosition === "header-right" && index === 0 && (
                    <div className="absolute top-6 right-6 flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded">
                      <div className="w-10 h-10 flex items-center justify-center">
                        <QrCode size={36} className="text-slate-800" />
                      </div>
                    </div>
                  )}

                  {/* Content Area for this page (Base 11pt Arial set in CSS so cursor selection never mutates root container size) */}
                  {isPreviewMode ? (
                    <div
                      className="pd-doc-editor-content max-w-none text-slate-900 outline-none min-h-[235mm]"
                      dangerouslySetInnerHTML={{ __html: renderMergedPreviewForPage(pageHtml) }}
                    />
                  ) : (
                    <div
                      ref={(el) => {
                        pageRefs.current[index] = el;
                        if (el && el.dataset.loadedInit !== "true") {
                          const targetHtml =
                            (pagesRef.current && pagesRef.current[index]) ||
                            pageHtml ||
                            "<p><br></p>";
                          el.innerHTML = targetHtml;
                          el.dataset.loadedInit = "true";
                        }
                      }}
                      contentEditable
                      suppressContentEditableWarning
                      onInput={() => handlePageInput(index)}
                      onPaste={(e) => handlePaste(e, index)}
                      onKeyDown={(e) => handlePageKeyDown(e, index)}
                      onKeyUp={updateToolbarStateFromSelection}
                      onMouseUp={updateToolbarStateFromSelection}
                      onFocus={() => {
                        activePageIdxRef.current = index;
                      }}
                      className="pd-doc-editor-content max-w-none text-slate-900 outline-none min-h-[235mm]"
                    />
                  )}

                  {/* Bottom QR Stamp (Only on the last page) */}
                  {includeQrCode && (qrPosition === "bottom-right" || qrPosition === "bottom-left") && index === pages.length - 1 && (
                    <div
                      className={`mt-12 pt-5 border-t border-slate-200 flex items-center gap-3 ${
                        qrPosition === "bottom-right" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div className="w-12 h-12 bg-white border border-slate-200 p-1 rounded flex items-center justify-center">
                        <QrCode size={40} className="text-slate-800" />
                      </div>
                      <div className="text-left text-[10px] text-slate-500">
                        <div className="font-semibold text-slate-700">Verified ProofDeck Document</div>
                        <div>Scan QR code to verify authenticity on the ledger</div>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Add Page Button Below Canvas */}
              {!isPreviewMode && (
                <button
                  type="button"
                  onClick={() => handleAddPage(pages.length - 1)}
                  className="mt-2 mb-12 shrink-0 inline-flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-50 text-[#5144E8] font-bold text-xs rounded-xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all cursor-pointer"
                >
                  <Plus size={15} weight="bold" />
                  <span>Add Page ({pages.length + 1})</span>
                </button>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Floating Link Popover over Highlighted Text (Replaces browser native prompt) */}
      {linkPopover.open && (
        <div
          ref={linkPopoverRef}
          style={{
            position: "fixed",
            top: `${linkPopover.top}px`,
            left: `${linkPopover.left}px`,
          }}
          className="z-50 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl p-3.5 font-sans"
        >
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
              <LinkIcon size={14} weight="bold" className="text-indigo-600" />
              <span>{linkPopover.hasExistingLink ? "Edit Link" : "Insert Link"}</span>
            </span>
            <button
              type="button"
              onClick={() => setLinkPopover((prev) => ({ ...prev, open: false }))}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-0.5 rounded cursor-pointer"
            >
              <X size={14} weight="bold" />
            </button>
          </div>

          <form onSubmit={handleApplyLink} className="space-y-2.5">
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Text to display
              </label>
              <input
                type="text"
                value={linkPopover.text}
                onChange={(e) => setLinkPopover((prev) => ({ ...prev, text: e.target.value }))}
                placeholder="Link text"
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Link URL
              </label>
              <input
                ref={linkUrlInputRef}
                type="text"
                value={linkPopover.url}
                onChange={(e) => setLinkPopover((prev) => ({ ...prev, url: e.target.value }))}
                placeholder="https://www.proofdeck.app"
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              {linkPopover.hasExistingLink ? (
                <button
                  type="button"
                  onClick={handleRemoveLink}
                  className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-md cursor-pointer transition-colors"
                >
                  <LinkBreak size={13} weight="bold" />
                  <span>Remove link</span>
                </button>
              ) : (
                <span />
              )}

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setLinkPopover((prev) => ({ ...prev, open: false }))}
                  className="px-2.5 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 text-xs font-bold text-white bg-[#5144E8] hover:bg-indigo-700 rounded-lg shadow-xs cursor-pointer transition-colors"
                >
                  Apply
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Preset confirmation modal */}
      {presetToLoad && (
        <Modal
          show={!!presetToLoad}
          onHide={() => setPresetToLoad(null)}
          centered
          contentClassName="rounded-2xl border border-slate-200/90 shadow-2xl overflow-hidden font-sans"
        >
          <Modal.Body className="p-6">
            <h3 className="text-sm sm:text-base font-black text-slate-900 mb-1">
              Load Preset?
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Load <strong>"{presetToLoad.name}"</strong>? Any unsaved edits will be replaced.
            </p>
          </Modal.Body>
          <Modal.Footer className="border-0 pt-0 bg-slate-50/70 px-6 py-4 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setPresetToLoad(null)}
              className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                setDocTitle(presetToLoad.title);
                const paginated = paginateHtml(presetToLoad.content);
                setPages(paginated);
                syncDomPages(paginated);
                setIsSaved(false);
                setPresetToLoad(null);
                toast.success(`Loaded "${presetToLoad.name}"`);
              }}
              className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-black rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Load Preset
            </button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
}
