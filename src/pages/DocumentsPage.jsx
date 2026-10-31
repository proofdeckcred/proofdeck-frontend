// frontend/src/pages/DocumentsPage.jsx

import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Modal } from "react-bootstrap";
import {
  FileText,
  Plus,
  MagnifyingGlass,
  Trash,
  Copy,
  NotePencil,
  Sparkle,
  ArrowRight,
  Clock,
  CircleNotch,
  CaretRight,
  X
} from "@phosphor-icons/react";
import toast, { Toaster } from "react-hot-toast";
import { getDocuments, deleteTemplate, createCustomTemplate, getTemplate } from "../api";
import HelpGuide from "../components/HelpGuide";

// --- CLAYMORPHIC 3D GRAPHIC COMPONENTS ---

/**
 * 3D Claymorphic Blank Document Illustration
 */
const ClayGraphicNewDoc = () => (
  <div className="relative w-full h-36 flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-indigo-50/70 via-sky-50/50 to-blue-100/40 select-none group-hover:from-indigo-100/70 group-hover:to-sky-100/60 transition-colors">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.8),transparent_70%)] pointer-events-none" />
    
    <svg viewBox="0 0 160 120" className="w-32 h-28 drop-shadow-[0_12px_16px_rgba(79,70,229,0.18)] transition-transform duration-300 group-hover:scale-105 group-hover:-translate-y-1">
      <defs>
        <linearGradient id="clayPaperGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="70%" stopColor="#F8FAFC" />
          <stop offset="100%" stopColor="#E2E8F0" />
        </linearGradient>
        <linearGradient id="clayPuffPlus" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#4338CA" />
        </linearGradient>
        <linearGradient id="clayFold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#CBD5E1" />
          <stop offset="100%" stopColor="#94A3B8" />
        </linearGradient>
        <filter id="clayPillShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#312E81" floodOpacity="0.25" />
        </filter>
      </defs>

      {/* Background Soft Shadow */}
      <ellipse cx="80" cy="108" rx="46" ry="7" fill="#6366F1" opacity="0.12" />

      {/* Stacked Under-Paper */}
      <rect x="36" y="24" width="70" height="82" rx="12" fill="#E2E8F0" transform="rotate(-6 71 65)" />

      {/* Main Clay Paper */}
      <g>
        <rect x="42" y="14" width="68" height="86" rx="14" fill="url(#clayPaperGrad1)" stroke="#FFFFFF" strokeWidth="2.5" />
        
        {/* Placeholder Lines */}
        <rect x="52" y="32" width="40" height="5" rx="2.5" fill="#E2E8F0" />
        <rect x="52" y="42" width="48" height="4" rx="2" fill="#F1F5F9" />
        <rect x="52" y="50" width="38" height="4" rx="2" fill="#F1F5F9" />
        <rect x="52" y="58" width="44" height="4" rx="2" fill="#F1F5F9" />

        {/* 3D Folded Ear */}
        <path d="M 96 14 L 110 28 L 96 28 Z" fill="url(#clayFold)" opacity="0.85" />

        {/* Floating Tactile 3D Clay Plus Button */}
        <g filter="url(#clayPillShadow)" className="animate-[pulse_3s_ease-in-out_infinite]">
          <circle cx="86" cy="74" r="17" fill="url(#clayPuffPlus)" stroke="#A5B4FC" strokeWidth="2" />
          <ellipse cx="82" cy="67" rx="9" ry="5" fill="#FFFFFF" opacity="0.4" />
          <path d="M 86 66 L 86 82 M 78 74 L 94 74" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" />
        </g>
      </g>

      <path d="M 124 38 Q 128 38 128 34 Q 128 38 132 38 Q 128 38 128 42 Q 128 38 124 38 Z" fill="#818CF8" />
      <circle cx="34" cy="46" r="3" fill="#A5B4FC" opacity="0.8" />
    </svg>
  </div>
);

/**
 * 3D Claymorphic Statement of Result Illustration
 */
const ClayGraphicStatement = () => (
  <div className="relative w-full h-36 flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-blue-50/80 via-slate-50 to-indigo-100/50 select-none group-hover:from-blue-100/80 group-hover:to-indigo-100/70 transition-colors">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.85),transparent_70%)] pointer-events-none" />

    <svg viewBox="0 0 160 120" className="w-32 h-28 drop-shadow-[0_12px_16px_rgba(30,58,138,0.18)] transition-transform duration-300 group-hover:scale-105 group-hover:-translate-y-1">
      <defs>
        <linearGradient id="clayAcadGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="70%" stopColor="#F8FAFC" />
          <stop offset="100%" stopColor="#E2E8F0" />
        </linearGradient>
        <linearGradient id="clayGoldSeal" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="60%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>
        <linearGradient id="clayBlueCap" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>
        <filter id="claySealShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="3" stdDeviation="2.5" floodColor="#78350F" floodOpacity="0.3" />
        </filter>
      </defs>

      <ellipse cx="80" cy="108" rx="46" ry="7" fill="#1E3A8A" opacity="0.12" />

      {/* Main Parchment */}
      <rect x="42" y="14" width="76" height="88" rx="14" fill="url(#clayAcadGrad)" stroke="#FFFFFF" strokeWidth="2.5" />

      {/* Top Banner */}
      <rect x="52" y="24" width="56" height="7" rx="3.5" fill="#1E3A8A" />
      <rect x="60" y="34" width="40" height="3.5" rx="1.7" fill="#64748B" />

      {/* Table Rows */}
      <rect x="50" y="44" width="60" height="18" rx="4" fill="#F1F5F9" stroke="#E2E8F0" strokeWidth="1" />
      <rect x="54" y="48" width="30" height="3" rx="1.5" fill="#94A3B8" />
      <rect x="92" y="48" width="14" height="3" rx="1.5" fill="#3B82F6" />
      <rect x="54" y="54" width="24" height="3" rx="1.5" fill="#CBD5E1" />
      <rect x="92" y="54" width="14" height="3" rx="1.5" fill="#10B981" />

      {/* Signature Flourish */}
      <path d="M 52 74 Q 60 68 68 73 T 80 72" stroke="#475569" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <line x1="52" y1="76" x2="80" y2="76" stroke="#CBD5E1" strokeWidth="1" />

      {/* 3D Gold Wax Seal */}
      <g filter="url(#claySealShadow)">
        <path d="M 98 84 L 92 98 L 98 94 L 104 98 Z" fill="#DC2626" />
        <path d="M 103 84 L 100 98 L 106 94 L 112 98 Z" fill="#B91C1C" />
        <circle cx="101" cy="78" r="14" fill="url(#clayGoldSeal)" stroke="#FEF08A" strokeWidth="1.8" />
        <circle cx="101" cy="78" r="9.5" fill="none" stroke="#FDE047" strokeWidth="1.2" opacity="0.8" />
        <ellipse cx="98" cy="72" rx="7" ry="3.5" fill="#FFFFFF" opacity="0.45" />
      </g>

      {/* Floating 3D Cap */}
      <g transform="translate(18, 12)">
        <polygon points="18,12 30,7 42,12 30,17" fill="url(#clayBlueCap)" stroke="#93C5FD" strokeWidth="1" />
        <rect x="25" y="15" width="10" height="6" rx="2" fill="#1E40AF" />
        <path d="M 38 12 Q 40 18 36 21" stroke="#F59E0B" strokeWidth="1.5" fill="none" />
      </g>
    </svg>
  </div>
);

/**
 * 3D Claymorphic English Proficiency Illustration
 */
const ClayGraphicProficiency = () => (
  <div className="relative w-full h-36 flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-emerald-50/80 via-teal-50/50 to-emerald-100/50 select-none group-hover:from-emerald-100/80 group-hover:to-teal-100/60 transition-colors">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.85),transparent_70%)] pointer-events-none" />

    <svg viewBox="0 0 160 120" className="w-32 h-28 drop-shadow-[0_12px_16px_rgba(5,150,105,0.18)] transition-transform duration-300 group-hover:scale-105 group-hover:-translate-y-1">
      <defs>
        <linearGradient id="clayParchGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="70%" stopColor="#F0FDF4" />
          <stop offset="100%" stopColor="#DCFCE7" />
        </linearGradient>
        <linearGradient id="clayEmeraldBadge" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <filter id="clayTealShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="3" stdDeviation="2.5" floodColor="#064E3B" floodOpacity="0.25" />
        </filter>
      </defs>

      <ellipse cx="80" cy="108" rx="46" ry="7" fill="#065F46" opacity="0.12" />

      <rect x="42" y="14" width="76" height="88" rx="14" fill="url(#clayParchGrad)" stroke="#FFFFFF" strokeWidth="2.5" />
      <rect x="46" y="18" width="68" height="80" rx="10" fill="none" stroke="#A7F3D0" strokeWidth="1" strokeDasharray="3 2" />

      <rect x="54" y="26" width="52" height="6" rx="3" fill="#047857" />
      <rect x="62" y="36" width="36" height="3" rx="1.5" fill="#6EE7B7" />

      <rect x="52" y="46" width="40" height="3.5" rx="1.7" fill="#CBD5E1" />
      <rect x="52" y="53" width="46" height="3.5" rx="1.7" fill="#CBD5E1" />
      <rect x="52" y="60" width="34" height="3.5" rx="1.7" fill="#CBD5E1" />

      {/* 3D Clay Emerald Rosette */}
      <g filter="url(#clayTealShadow)">
        <path d="M 94 72 L 90 92 L 96 88 L 102 92 Z" fill="#059669" />
        <path d="M 101 72 L 98 92 L 104 88 L 110 92 Z" fill="#047857" />
        <circle cx="100" cy="68" r="15" fill="url(#clayEmeraldBadge)" stroke="#A7F3D0" strokeWidth="1.8" />
        <circle cx="100" cy="68" r="10.5" fill="#065F46" />
        <path d="M 95 68 L 98 71 L 106 63" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <ellipse cx="97" cy="62" rx="7" ry="3.5" fill="#FFFFFF" opacity="0.4" />
      </g>

      <path d="M 32 30 Q 30 40 36 46 Q 34 38 32 30 Z" fill="#10B981" opacity="0.8" />
      <circle cx="128" cy="46" r="3" fill="#34D399" opacity="0.7" />
    </svg>
  </div>
);

/**
 * 3D Claymorphic Letter of Attestation Illustration
 */
const ClayGraphicAttestation = () => (
  <div className="relative w-full h-36 flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-violet-50/80 via-slate-50 to-purple-100/50 select-none group-hover:from-violet-100/80 group-hover:to-purple-100/60 transition-colors">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.85),transparent_70%)] pointer-events-none" />

    <svg viewBox="0 0 160 120" className="w-32 h-28 drop-shadow-[0_12px_16px_rgba(109,40,217,0.18)] transition-transform duration-300 group-hover:scale-105 group-hover:-translate-y-1">
      <defs>
        <linearGradient id="clayPillarsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="70%" stopColor="#F5F3FF" />
          <stop offset="100%" stopColor="#EDE9FE" />
        </linearGradient>
        <linearGradient id="clayPurpleSeal" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#6D28D9" />
        </linearGradient>
        <filter id="clayPurpleShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="3" stdDeviation="2.5" floodColor="#4C1D95" floodOpacity="0.25" />
        </filter>
      </defs>

      <ellipse cx="80" cy="108" rx="46" ry="7" fill="#4C1D95" opacity="0.12" />

      <rect x="42" y="14" width="76" height="88" rx="14" fill="url(#clayPillarsGrad)" stroke="#FFFFFF" strokeWidth="2.5" />

      {/* Pillars Header */}
      <rect x="52" y="22" width="56" height="4" rx="2" fill="#6D28D9" />
      <rect x="56" y="27" width="5" height="11" rx="2" fill="#8B5CF6" />
      <rect x="67" y="27" width="5" height="11" rx="2" fill="#8B5CF6" />
      <rect x="78" y="27" width="5" height="11" rx="2" fill="#8B5CF6" />
      <rect x="89" y="27" width="5" height="11" rx="2" fill="#8B5CF6" />
      <rect x="52" y="39" width="56" height="3" rx="1.5" fill="#6D28D9" />

      <rect x="52" y="47" width="52" height="3.5" rx="1.7" fill="#C4B5FD" />
      <rect x="52" y="54" width="46" height="3.5" rx="1.7" fill="#E2E8F0" />
      <rect x="52" y="61" width="40" height="3.5" rx="1.7" fill="#E2E8F0" />

      <path d="M 52 74 Q 58 70 66 73 T 78 72" stroke="#6D28D9" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <line x1="52" y1="77" x2="78" y2="77" stroke="#DDD6FE" strokeWidth="1" />

      {/* 3D Purple Official Stamp */}
      <g filter="url(#clayPurpleShadow)">
        <circle cx="100" cy="74" r="14" fill="url(#clayPurpleSeal)" stroke="#DDD6FE" strokeWidth="1.8" />
        <circle cx="100" cy="74" r="9.5" fill="none" stroke="#C4B5FD" strokeWidth="1" strokeDasharray="2 1.5" />
        <path d="M 97 70 L 103 70 L 103 74 Q 103 78 100 80 Q 97 78 97 74 Z" fill="#EDE9FE" />
        <ellipse cx="97" cy="68" rx="7" ry="3.5" fill="#FFFFFF" opacity="0.4" />
      </g>

      <circle cx="34" cy="42" r="3.5" fill="#C4B5FD" opacity="0.8" />
    </svg>
  </div>
);

// --- PRESET DEFINITIONS ---
const DOCUMENT_PRESETS = [
  {
    id: "blank",
    name: "Blank document",
    desc: "Start with an empty page",
    badge: "Freeform",
    badgeColor: "bg-slate-100 text-slate-700 border-slate-200",
    clayVisual: ClayGraphicNewDoc,
  },
  {
    id: "statement_of_result",
    name: "Statement of Result",
    desc: "Academic degree & examination results",
    badge: "Academic",
    badgeColor: "bg-blue-100 text-blue-700 border-blue-200",
    clayVisual: ClayGraphicStatement,
  },
  {
    id: "english_proficiency",
    name: "English Proficiency",
    desc: "Medium of instruction confirmation",
    badge: "Official",
    badgeColor: "bg-emerald-100 text-emerald-700 border-emerald-200",
    clayVisual: ClayGraphicProficiency,
  },
  {
    id: "attestation_completion",
    name: "Letter of Attestation",
    desc: "Formal confirmation of completion",
    badge: "Institutional",
    badgeColor: "bg-purple-100 text-purple-700 border-purple-200",
    clayVisual: ClayGraphicAttestation,
  },
];

const DocumentsPage = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [deletingId, setDeletingId] = useState(null);
  const [duplicatingId, setDuplicatingId] = useState(null);

  // Proper Delete Modal State (No window.confirm)
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [docToDelete, setDocToDelete] = useState(null);

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const res = await getDocuments();
      const list = (res.data?.templates || []).filter((t) => {
        if (t.layout_style === "document") return true;
        const tLower = (t.title || "").toLowerCase();
        if (tLower.includes("statement of result") || tLower.includes("attestation") || tLower.includes("proficiency")) {
          return true;
        }
        return false;
      });
      setDocuments(list);
    } catch (err) {
      toast.error("Could not load documents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleDeleteClick = (doc) => {
    setDocToDelete(doc);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!docToDelete) return;
    setDeletingId(docToDelete.id);
    try {
      await deleteTemplate(docToDelete.id);
      setDocuments((prev) => prev.filter((d) => d.id !== docToDelete.id));
      toast.success("Document deleted");
      setShowDeleteModal(false);
      setDocToDelete(null);
    } catch (err) {
      toast.error(err.response?.data?.msg || "Failed to delete document");
    } finally {
      setDeletingId(null);
    }
  };

  const handleDuplicate = async (doc) => {
    setDuplicatingId(doc.id);
    try {
      const full = await getTemplate(doc.id);
      const docData = full.data?.template;
      const cleanTitle = (doc.title || "Document")
        .replace(/\s*\(Senate Approved\)/gi, "")
        .replace(/Senate\s*/gi, "")
        .trim();

      const payload = {
        title: `Copy of ${cleanTitle}`,
        layout_style: "document",
        canvas_data: docData?.canvas_data || docData?.layout_data || {},
      };
      const res = await createCustomTemplate(payload);
      toast.success("Document duplicated");
      await fetchDocs();
      if (res.data?.template_id) {
        navigate(`/dashboard/documents/editor/${res.data.template_id}`);
      }
    } catch (err) {
      toast.error("Failed to duplicate document");
    } finally {
      setDuplicatingId(null);
    }
  };

  const filteredDocs = useMemo(() => {
    let list = documents.filter((d) =>
      searchQuery
        ? (d.title || "").toLowerCase().includes(searchQuery.toLowerCase())
        : true
    );

    if (sortBy === "newest") {
      list.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    } else if (sortBy === "oldest") {
      list.sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0));
    } else if (sortBy === "title") {
      list.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    }

    return list;
  }, [documents, searchQuery, sortBy]);

  return (
    <div className="w-full pb-16">
      <Toaster position="top-right" />

      {/* --- Top Navigation Header --- */}
      <div className="border-b border-slate-200/80 bg-white mb-6 -mt-6 px-4 sm:px-6 py-4 rounded-b-xl shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 max-w-[1600px] mx-auto">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
              <span>ProofDeck</span>
              <span>/</span>
              <span className="font-semibold text-slate-800">Documents</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              Documents
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <HelpGuide type="certificates" />
            <Link
              to="/dashboard/documents/editor"
              className="px-4 py-2.5 bg-gradient-to-r from-slate-900 to-indigo-950 hover:from-black hover:to-indigo-900 text-white text-xs font-bold rounded-xl shadow-sm hover:shadow-md flex items-center gap-2 transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Plus size={16} weight="bold" />
              <span>New document</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* --- Quick-Start Starter Presets Section (Claymorphic) --- */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Sparkle size={15} weight="fill" />
              </div>
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Start from a preset
              </h2>
            </div>
            <span className="text-xs text-slate-400">
              Pick a layout to open in editor
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {DOCUMENT_PRESETS.map((p) => {
              const ClayVisual = p.clayVisual;
              const targetUrl =
                p.id === "blank"
                  ? "/dashboard/documents/editor"
                  : `/dashboard/documents/editor?preset=${p.id}`;

              return (
                <Link
                  key={p.id}
                  to={targetUrl}
                  className="group rounded-2xl border border-slate-200/90 bg-white hover:border-indigo-400/80 hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer no-underline"
                >
                  {/* Claymorphic 3D Animated Illustration */}
                  <ClayVisual />

                  {/* Card Content */}
                  <div className="p-4 flex flex-col justify-between flex-1 space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${p.badgeColor}`}>
                          {p.badge}
                        </span>
                        <CaretRight
                          size={15}
                          weight="bold"
                          className="text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all"
                        />
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {p.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {p.desc}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-indigo-600 group-hover:text-indigo-700">
                      <span>Use preset</span>
                      <ArrowRight size={14} weight="bold" className="group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* --- Search, Filter & Controls Bar --- */}
        <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlass
              size={15}
              weight="bold"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search documents by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          {/* Sort & Count Controls */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-medium">
              {filteredDocs.length} {filteredDocs.length === 1 ? "document" : "documents"}
            </span>

            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <label htmlFor="sort_docs" className="font-semibold text-slate-500">
                Sort:
              </label>
              <select
                id="sort_docs"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-2 py-1 text-xs border border-slate-200 rounded-lg bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="title">Title (A-Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* --- Document Grid / List --- */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3 animate-pulse"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-200 rounded-xl" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 bg-slate-200 rounded w-3/4" />
                    <div className="h-2.5 bg-slate-200 rounded w-1/2" />
                  </div>
                </div>
                <div className="h-24 bg-slate-100 rounded-xl" />
                <div className="h-8 bg-slate-200 rounded-lg" />
              </div>
            ))}
          </div>
        ) : filteredDocs.length === 0 ? (
          /* Claymorphic Empty State */
          <div className="bg-gradient-to-b from-white to-slate-50/70 rounded-2xl border border-dashed border-slate-200 p-12 text-center shadow-xs space-y-4 max-w-xl mx-auto">
            {/* 3D Clay Scene Illustration */}
            <div className="w-24 h-24 mx-auto relative flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-20 h-20 drop-shadow-[0_10px_14px_rgba(99,102,241,0.2)]">
                <ellipse cx="50" cy="85" rx="35" ry="6" fill="#6366F1" opacity="0.15" />
                <rect x="25" y="15" width="50" height="65" rx="10" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="2" />
                <rect x="33" y="28" width="34" height="4" rx="2" fill="#E0E7FF" />
                <rect x="33" y="36" width="28" height="3" rx="1.5" fill="#F1F5F9" />
                <rect x="33" y="43" width="34" height="3" rx="1.5" fill="#F1F5F9" />
                <circle cx="50" cy="62" r="10" fill="#4F46E5" />
                <path d="M 50 56 L 50 68 M 44 62 L 56 62" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>

            <h3 className="text-base font-bold text-slate-900">
              {searchQuery ? "No matching documents" : "No documents yet"}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              {searchQuery
                ? `No documents matched "${searchQuery}". Try a different keyword.`
                : "Create formal statements of results, letters of proficiency, or attestations with live dynamic variables."}
            </p>
            {!searchQuery && (
              <div className="pt-2">
                <Link
                  to="/dashboard/documents/editor"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-slate-900 to-indigo-950 hover:from-black hover:to-indigo-900 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0 no-underline"
                >
                  <Plus size={16} weight="bold" />
                  <span>Create your first document</span>
                </Link>
              </div>
            )}
          </div>
        ) : (
          /* Documents Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocs.map((doc) => {
              const formattedDate = doc.created_at
                ? new Date(doc.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "Recently edited";

              const cleanTitle = (doc.title || "Untitled document")
                .replace(/\s*\(Senate Approved\)/gi, "")
                .replace(/Senate\s*/gi, "")
                .trim();

              return (
                <div
                  key={doc.id}
                  className="bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
                >
                  {/* Card Header */}
                  <div className="p-5 border-b border-slate-100 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-100 border border-indigo-200 flex items-center justify-center text-indigo-700 shrink-0 shadow-2xs">
                          <FileText size={22} weight="duotone" />
                        </div>
                        <div className="min-w-0">
                          <h3
                            className="text-sm font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors"
                            title={cleanTitle}
                          >
                            {cleanTitle}
                          </h3>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                            <Clock size={13} />
                            <span>{formattedDate}</span>
                          </div>
                        </div>
                      </div>

                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full border border-slate-200 shrink-0">
                        Document
                      </span>
                    </div>

                    {/* Preview Box */}
                    <div className="h-24 bg-gradient-to-b from-slate-50 to-white rounded-xl border border-slate-100 p-3 flex flex-col justify-between text-[11px] text-slate-500 overflow-hidden relative">
                      <div className="space-y-1.5 opacity-60">
                        <div className="h-2 bg-slate-300 rounded w-3/4" />
                        <div className="h-2 bg-slate-200 rounded w-1/2" />
                        <div className="h-2 bg-slate-200 rounded w-5/6" />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                        <span>A4 Letterhead</span>
                        <span>Variable placeholders</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Actions Footer */}
                  <div className="p-3 bg-slate-50/70 flex items-center justify-between gap-2">
                    <Link
                      to={`/dashboard/documents/editor/${doc.id}`}
                      className="flex-1 py-1.5 px-3 bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold rounded-lg border border-slate-200 shadow-2xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer no-underline"
                    >
                      <NotePencil size={15} weight="bold" />
                      <span>Edit</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleDuplicate(doc)}
                      disabled={duplicatingId === doc.id}
                      className="p-2 bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-lg border border-slate-200 shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
                      title="Duplicate"
                    >
                      {duplicatingId === doc.id ? (
                        <CircleNotch size={15} className="animate-spin text-slate-400" />
                      ) : (
                        <Copy size={15} weight="bold" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteClick(doc)}
                      disabled={deletingId === doc.id}
                      className="p-2 bg-white hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg border border-slate-200 shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
                      title="Delete"
                    >
                      {deletingId === doc.id ? (
                        <CircleNotch size={15} className="animate-spin text-red-500" />
                      ) : (
                        <Trash size={15} weight="bold" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* --- PROPER DELETE CONFIRMATION MODAL (No window.confirm) --- */}
      <Modal
        show={showDeleteModal}
        onHide={() => {
          if (!deletingId) {
            setShowDeleteModal(false);
            setDocToDelete(null);
          }
        }}
        centered
        contentClassName="rounded-2xl border border-slate-200/90 shadow-2xl overflow-hidden font-sans"
      >
        <Modal.Body className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center shrink-0 border border-red-100 shadow-2xs">
              <Trash size={24} weight="bold" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm sm:text-base font-black text-slate-900 mb-1">
                Delete Document?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Are you sure you want to delete{" "}
                <strong className="text-slate-800 break-words">
                  "{docToDelete?.title?.replace(/\s*\(Senate Approved\)/gi, "").replace(/Senate\s*/gi, "").trim() || "Untitled document"}"
                </strong>? This action cannot be undone.
              </p>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0 bg-slate-50/70 px-6 py-4 flex items-center justify-end gap-2.5">
          <button
            type="button"
            disabled={!!deletingId}
            onClick={() => {
              setShowDeleteModal(false);
              setDocToDelete(null);
            }}
            className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!!deletingId}
            onClick={handleConfirmDelete}
            className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {deletingId ? (
              <>
                <CircleNotch size={14} className="animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <span>Delete</span>
            )}
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default DocumentsPage;
