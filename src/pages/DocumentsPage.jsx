// frontend/src/pages/DocumentsPage.jsx

import React, { useState, useEffect, useMemo, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Modal } from "react-bootstrap";
import {
  Plus,
  MagnifyingGlass,
  Trash,
  Copy,
  NotePencil,
  Clock,
  CircleNotch,
  CaretRight,
  CaretDown,
  CaretUp,
  DotsThreeVertical,
  SlidersHorizontal,
  FolderSimple,
  ArrowsDownUp,
  X
} from "@phosphor-icons/react";
import toast, { Toaster } from "react-hot-toast";
import { getDocuments, deleteTemplate, createCustomTemplate, getTemplate } from "../api";
import HelpGuide from "../components/HelpGuide";

// --- PROOFDECK BRAND DOCUMENT ICON ---
export const ProofDeckDocIcon = ({ size = 20, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 ${className}`}
  >
    <defs>
      <linearGradient id="pdDocGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#6355F6" />
        <stop offset="100%" stopColor="#4336D0" />
      </linearGradient>
    </defs>
    {/* Purple Document Parchment */}
    <rect x="5" y="3" width="22" height="26" rx="4" fill="url(#pdDocGrad)" />
    {/* Lavender Folded Corner */}
    <path d="M19 3 L27 11 L19 11 Z" fill="#C7D2FE" opacity="0.9" />
    {/* Micro Content Lines */}
    <rect x="9" y="14" width="14" height="2" rx="1" fill="#FFFFFF" opacity="0.95" />
    <rect x="9" y="18" width="11" height="2" rx="1" fill="#FFFFFF" opacity="0.8" />
    <rect x="9" y="22" width="7" height="2" rx="1" fill="#FFFFFF" opacity="0.65" />
    {/* Gold Verification Seal Stamp */}
    <circle cx="21" cy="22" r="3.5" fill="#FBBF24" />
    <circle cx="21" cy="22" r="2" fill="#D97706" />
  </svg>
);

// --- MINIATURE A4 PORTRAIT TEMPLATE ILLUSTRATIONS ---

/**
 * ProofDeck Purple Plus A4 Blank Document Card
 */
const BlankDocThumbnail = () => (
  <div className="w-full h-full flex items-center justify-center bg-white group-hover:bg-slate-50/60 transition-colors">
    <svg viewBox="0 0 48 48" className="w-12 h-12 transition-transform duration-200 group-hover:scale-110 drop-shadow-2xs">
      <defs>
        <linearGradient id="pdPurplePlus" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6355F6" />
          <stop offset="100%" stopColor="#5144E8" />
        </linearGradient>
      </defs>
      <rect x="21" y="8" width="6" height="32" rx="3" fill="url(#pdPurplePlus)" />
      <rect x="8" y="21" width="32" height="6" rx="3" fill="url(#pdPurplePlus)" />
    </svg>
  </div>
);

/**
 * A4 Miniature Portrait: Official Statement of Result
 */
const StatementThumbnail = () => (
  <div className="w-full h-full p-3.5 bg-white flex flex-col justify-between text-[6px] select-none pointer-events-none relative overflow-hidden">
    {/* Academic Header */}
    <div className="text-center space-y-0.5 border-b border-slate-200 pb-1.5">
      <div className="h-1.5 w-12 bg-slate-800 mx-auto rounded-xs" />
      <div className="h-1 w-20 bg-slate-400 mx-auto rounded-xs" />
      <div className="h-0.5 w-16 bg-slate-300 mx-auto rounded-xs" />
    </div>

    {/* Ref & Date */}
    <div className="flex justify-between items-center px-0.5 my-1">
      <div className="h-1 w-8 bg-slate-300 rounded-xs" />
      <div className="h-1 w-6 bg-slate-300 rounded-xs" />
    </div>

    {/* Title Badge */}
    <div className="my-0.5 text-center">
      <div className="h-1.5 w-24 bg-blue-900 mx-auto rounded-xs" />
    </div>

    {/* Micro Paragraph Lines */}
    <div className="space-y-1 px-0.5">
      <div className="h-1 w-full bg-slate-200 rounded-xs" />
      <div className="h-1 w-11/12 bg-slate-200 rounded-xs" />
      <div className="h-1 w-full bg-slate-200 rounded-xs" />
    </div>

    {/* Degree Award Box */}
    <div className="p-1.5 my-1 bg-slate-50 border border-slate-200 rounded text-center space-y-0.5">
      <div className="h-1.5 w-16 bg-slate-800 mx-auto rounded-xs" />
      <div className="h-1 w-12 bg-blue-600 mx-auto rounded-xs" />
    </div>

    {/* Micro text */}
    <div className="space-y-1 px-0.5">
      <div className="h-1 w-10/12 bg-slate-200 rounded-xs" />
      <div className="h-1 w-8/12 bg-slate-200 rounded-xs" />
    </div>

    {/* Signature & Gold Wax Seal */}
    <div className="flex justify-between items-end pt-1 border-t border-slate-100">
      <div className="space-y-0.5">
        <div className="h-1 w-10 bg-blue-950 rounded-xs" />
        <div className="h-0.5 w-12 bg-slate-400 rounded-xs" />
      </div>
      <div className="w-5 h-5 rounded-full bg-amber-400 border border-amber-500 shadow-2xs flex items-center justify-center">
        <div className="w-3.5 h-3.5 rounded-full border border-amber-600/50" />
      </div>
    </div>
  </div>
);

/**
 * A4 Miniature Portrait: Letter of English Proficiency
 */
const ProficiencyThumbnail = () => (
  <div className="w-full h-full p-3.5 bg-white flex flex-col justify-between text-[6px] select-none pointer-events-none relative overflow-hidden">
    {/* Directorate Header with Green Band */}
    <div className="text-center space-y-0.5 border-b-2 border-emerald-600 pb-1.5">
      <div className="h-1.5 w-14 bg-emerald-800 mx-auto rounded-xs" />
      <div className="h-1 w-16 bg-slate-400 mx-auto rounded-xs" />
      <div className="h-0.5 w-12 bg-emerald-500 mx-auto rounded-xs" />
    </div>

    {/* Ref & Date */}
    <div className="flex justify-between items-center px-0.5 my-1">
      <div className="h-1 w-7 bg-slate-300 rounded-xs" />
      <div className="h-1 w-6 bg-slate-300 rounded-xs" />
    </div>

    {/* Title */}
    <div className="my-0.5 text-center">
      <div className="h-1.5 w-24 bg-emerald-900 mx-auto rounded-xs" />
    </div>

    {/* Paragraphs */}
    <div className="space-y-1 px-0.5">
      <div className="h-1 w-full bg-slate-200 rounded-xs" />
      <div className="h-1 w-full bg-slate-200 rounded-xs" />
      <div className="h-1 w-10/12 bg-slate-200 rounded-xs" />
      <div className="h-1 w-full bg-slate-200 rounded-xs" />
      <div className="h-1 w-9/12 bg-slate-200 rounded-xs" />
    </div>

    {/* Green Highlight Box */}
    <div className="p-1 my-1 bg-emerald-50 border border-emerald-200 rounded text-center space-y-0.5">
      <div className="h-1 w-20 bg-emerald-700 mx-auto rounded-xs" />
    </div>

    <div className="space-y-1 px-0.5">
      <div className="h-1 w-full bg-slate-200 rounded-xs" />
      <div className="h-1 w-8/12 bg-slate-200 rounded-xs" />
    </div>

    {/* Signature & Emerald Rosette Seal */}
    <div className="flex justify-between items-end pt-1 border-t border-slate-100">
      <div className="space-y-0.5">
        <div className="h-1 w-10 bg-emerald-900 rounded-xs" />
        <div className="h-0.5 w-12 bg-slate-400 rounded-xs" />
      </div>
      <div className="w-5 h-5 rounded-full bg-emerald-600 border border-emerald-700 shadow-2xs flex items-center justify-center">
        <div className="w-3.5 h-3.5 rounded-full border border-white/60" />
      </div>
    </div>
  </div>
);

/**
 * A4 Miniature Portrait: Letter of Attestation
 */
const AttestationThumbnail = () => (
  <div className="w-full h-full p-3.5 bg-white flex flex-col justify-between text-[6px] select-none pointer-events-none relative overflow-hidden">
    {/* Pillars Header */}
    <div className="text-center space-y-0.5 border-b border-slate-200 pb-1.5">
      <div className="flex justify-center gap-1 mb-0.5">
        <div className="w-1 h-2 bg-slate-700" />
        <div className="w-1 h-2 bg-slate-700" />
        <div className="w-1 h-2 bg-slate-700" />
      </div>
      <div className="h-1.5 w-16 bg-slate-800 mx-auto rounded-xs" />
      <div className="h-0.5 w-20 bg-slate-400 mx-auto rounded-xs" />
    </div>

    {/* Ref & Date */}
    <div className="flex justify-between items-center px-0.5 my-1">
      <div className="h-1 w-8 bg-slate-300 rounded-xs" />
      <div className="h-1 w-6 bg-slate-300 rounded-xs" />
    </div>

    {/* Title */}
    <div className="my-0.5 text-center">
      <div className="h-1.5 w-20 bg-slate-900 mx-auto rounded-xs" />
    </div>

    {/* Paragraphs */}
    <div className="space-y-1 px-0.5">
      <div className="h-1 w-full bg-slate-200 rounded-xs" />
      <div className="h-1 w-11/12 bg-slate-200 rounded-xs" />
      <div className="h-1 w-full bg-slate-200 rounded-xs" />
      <div className="h-1 w-10/12 bg-slate-200 rounded-xs" />
      <div className="h-1 w-full bg-slate-200 rounded-xs" />
    </div>

    {/* Student details mini box */}
    <div className="p-1 my-1 bg-slate-50 border border-slate-200 rounded space-y-0.5">
      <div className="h-1 w-16 bg-slate-600 rounded-xs" />
      <div className="h-1 w-12 bg-slate-400 rounded-xs" />
    </div>

    <div className="space-y-1 px-0.5">
      <div className="h-1 w-full bg-slate-200 rounded-xs" />
      <div className="h-1 w-7/12 bg-slate-200 rounded-xs" />
    </div>

    {/* Signature & Seal */}
    <div className="flex justify-between items-end pt-1 border-t border-slate-100">
      <div className="space-y-0.5">
        <div className="h-1 w-10 bg-slate-800 rounded-xs" />
        <div className="h-0.5 w-12 bg-slate-400 rounded-xs" />
      </div>
      <div className="w-5 h-5 rounded-full border border-dashed border-slate-400 flex items-center justify-center">
        <div className="w-3.5 h-3.5 rounded-full bg-slate-200" />
      </div>
    </div>
  </div>
);

// --- PRESET TEMPLATES DEFINITION ---
const DOCUMENT_PRESETS = [
  {
    id: "blank",
    name: "Blank document",
    desc: "Start with an empty page",
    thumbnail: BlankDocThumbnail,
  },
  {
    id: "statement_of_result",
    name: "Statement of Result",
    desc: "Academic degree & examination results",
    thumbnail: StatementThumbnail,
  },
  {
    id: "english_proficiency",
    name: "English Proficiency",
    desc: "Medium of instruction confirmation",
    thumbnail: ProficiencyThumbnail,
  },
  {
    id: "attestation_completion",
    name: "Letter of Attestation",
    desc: "Formal confirmation of completion",
    thumbnail: AttestationThumbnail,
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

  // Active kebab menu dropdown
  const [openKebabId, setOpenKebabId] = useState(null);
  const kebabRef = useRef(null);

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

  // Close kebab menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (kebabRef.current && !kebabRef.current.contains(e.target)) {
        setOpenKebabId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDeleteClick = (doc, e) => {
    if (e) e.stopPropagation();
    setOpenKebabId(null);
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

  const handleDuplicate = async (doc, e) => {
    if (e) e.stopPropagation();
    setOpenKebabId(null);
    setDuplicatingId(doc.id);
    try {
      const full = await getTemplate(doc.id);
      const docData = full.data?.template || full.data;
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
      const newId = res.data?.template_id || res.data?.id;
      if (newId) {
        navigate(`/dashboard/documents/editor/${newId}`);
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
    <div className="w-full pb-16 font-sans">
      <Toaster position="top-right" />

      {/* --- Top Navigation Header (No Breadcrumb, Just Documents) --- */}
      <div className="border-b border-slate-200/80 bg-white mb-6 -mt-6 px-4 sm:px-6 py-4 rounded-b-xl shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 max-w-[1600px] mx-auto">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              Documents
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <HelpGuide type="certificates" />
            <Link
              to="/dashboard/documents/editor"
              className="px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-xs hover:shadow-md flex items-center gap-2 transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0 no-underline"
            >
              <Plus size={16} weight="bold" />
              <span>New document</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto space-y-8">
        {/* --- Top Section: Start a new document (Google Docs Style A4 Portrait Cards) --- */}
        <div className="bg-[#f8f9fa] dark:bg-slate-900/60 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Start a new document
            </h2>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <span>Template gallery</span>
            </div>
          </div>

          {/* Grid of A4 Portrait Template Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
            {DOCUMENT_PRESETS.map((p) => {
              const ThumbnailComponent = p.thumbnail;
              const targetUrl =
                p.id === "blank"
                  ? "/dashboard/documents/editor"
                  : `/dashboard/documents/editor?preset=${p.id}`;

              return (
                <div key={p.id} className="flex flex-col group">
                  {/* Portrait A4 Card Sheet */}
                  <Link
                    to={targetUrl}
                    className="w-full aspect-[1/1.38] rounded-lg border border-slate-200/90 bg-white hover:border-blue-500 hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden cursor-pointer no-underline relative group shadow-2xs"
                  >
                    <ThumbnailComponent />
                  </Link>

                  {/* Title & Description Below Card */}
                  <div className="mt-2.5 px-0.5 space-y-0.5">
                    <Link
                      to={targetUrl}
                      className="text-xs sm:text-sm font-semibold text-slate-800 group-hover:text-blue-600 transition-colors block truncate no-underline"
                      title={p.name}
                    >
                      {p.name}
                    </Link>
                    <p className="text-[11px] text-slate-400 truncate leading-tight">
                      {p.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* --- Bottom Section: Recent Documents (Google Docs Style A4 Grid) --- */}
        <div className="space-y-4">
          {/* Header Row: Title & Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-200">
                Recent documents
              </h2>
              <span className="text-xs text-slate-400 font-normal">
                ({filteredDocs.length})
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Search Box */}
              <div className="relative w-48 sm:w-64">
                <MagnifyingGlass
                  size={14}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-1 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              {/* Sort Control */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-2 py-1 text-xs border border-slate-200 rounded-lg bg-white cursor-pointer focus:outline-none focus:ring-1 focus:ring-slate-900 text-slate-600"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="title">Title (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Documents Content */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
              {[1, 2, 3, 4, 5].map((n) => (
                <div
                  key={n}
                  className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs space-y-2 animate-pulse"
                >
                  <div className="aspect-[1/1.3] bg-slate-100" />
                  <div className="p-3 space-y-1.5">
                    <div className="h-3 bg-slate-200 rounded w-3/4" />
                    <div className="h-2 bg-slate-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredDocs.length === 0 ? (
            /* Clean Empty State */
            <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center shadow-2xs space-y-3 max-w-md mx-auto my-6">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50/80 text-slate-500 mx-auto flex items-center justify-center">
                <ProofDeckDocIcon size={28} />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                {searchQuery ? "No matching documents" : "No documents yet"}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {searchQuery
                  ? `No documents matched "${searchQuery}".`
                  : "Create statements of results, letters of proficiency, or attestations with dynamic merge variables."}
              </p>
              {!searchQuery && (
                <div className="pt-2">
                  <Link
                    to="/dashboard/documents/editor"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-2xs transition-all cursor-pointer no-underline"
                  >
                    <Plus size={15} weight="bold" />
                    <span>Create a document</span>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            /* Google Docs Style A4 Portrait Document Grid */
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5" ref={kebabRef}>
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

                const isKebabOpen = openKebabId === doc.id;

                return (
                  <div
                    key={doc.id}
                    className="group flex flex-col bg-white rounded-lg border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all duration-200 overflow-hidden relative shadow-2xs"
                  >
                    {/* Top Portrait Preview Area */}
                    <Link
                      to={`/dashboard/documents/editor/${doc.id}`}
                      className="aspect-[1/1.25] bg-[#fdfdfd] border-b border-slate-100 p-3.5 flex flex-col justify-between cursor-pointer no-underline overflow-hidden group-hover:bg-slate-50/40 transition-colors"
                      title={`Open ${cleanTitle}`}
                    >
                      {/* Document Micro Lines Preview */}
                      <div className="space-y-1.5 opacity-70">
                        <div className="h-1.5 bg-slate-700 rounded-xs w-3/5 mx-auto" />
                        <div className="h-1 bg-slate-300 rounded-xs w-4/5 mx-auto" />
                        <div className="pt-2 space-y-1">
                          <div className="h-1 bg-slate-200 rounded-xs w-full" />
                          <div className="h-1 bg-slate-200 rounded-xs w-11/12" />
                          <div className="h-1 bg-slate-200 rounded-xs w-full" />
                          <div className="h-1 bg-slate-200 rounded-xs w-9/12" />
                        </div>
                        <div className="pt-1.5 p-1 bg-slate-100/70 border border-slate-200/60 rounded-xs space-y-0.5">
                          <div className="h-1 bg-slate-400 rounded-xs w-1/2" />
                          <div className="h-1 bg-blue-400 rounded-xs w-2/3" />
                        </div>
                      </div>

                      {/* Bottom Footer Details */}
                      <div className="pt-1 flex justify-between items-center opacity-60 text-[8px] text-slate-400 border-t border-slate-100">
                        <span>A4 Letterhead</span>
                        <div className="w-2.5 h-2.5 rounded-full border border-slate-300" />
                      </div>
                    </Link>

                    {/* Bottom Document Info Footer */}
                    <div className="p-3 bg-white flex items-center justify-between gap-2 relative">
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <ProofDeckDocIcon size={22} />
                        <div className="min-w-0 flex-1">
                          <Link
                            to={`/dashboard/documents/editor/${doc.id}`}
                            className="text-xs font-semibold text-slate-800 hover:text-blue-600 block truncate transition-colors no-underline leading-tight"
                            title={cleanTitle}
                          >
                            {cleanTitle}
                          </Link>
                          <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                            {formattedDate}
                          </div>
                        </div>
                      </div>

                      {/* 3-Dots Kebab Menu Trigger */}
                      <div className="relative shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenKebabId(isKebabOpen ? null : doc.id);
                          }}
                          className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                          title="More options"
                        >
                          <DotsThreeVertical size={16} weight="bold" />
                        </button>

                        {/* Dropdown Menu */}
                        {isKebabOpen && (
                          <div className="absolute right-0 bottom-full mb-1 w-36 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-30 text-xs font-medium text-slate-700 animate-in fade-in duration-150">
                            <Link
                              to={`/dashboard/documents/editor/${doc.id}`}
                              className="w-full px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2 text-slate-700 no-underline cursor-pointer"
                              onClick={() => setOpenKebabId(null)}
                            >
                              <NotePencil size={14} weight="bold" />
                              <span>Edit</span>
                            </Link>

                            <button
                              type="button"
                              onClick={(e) => handleDuplicate(doc, e)}
                              disabled={duplicatingId === doc.id}
                              className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2 text-slate-700 cursor-pointer disabled:opacity-50"
                            >
                              {duplicatingId === doc.id ? (
                                <CircleNotch size={14} className="animate-spin text-slate-400" />
                              ) : (
                                <Copy size={14} weight="bold" />
                              )}
                              <span>Duplicate</span>
                            </button>

                            <div className="my-1 border-t border-slate-100" />

                            <button
                              type="button"
                              onClick={(e) => handleDeleteClick(doc, e)}
                              disabled={deletingId === doc.id}
                              className="w-full text-left px-3 py-1.5 hover:bg-red-50 flex items-center gap-2 text-red-600 cursor-pointer disabled:opacity-50"
                            >
                              {deletingId === doc.id ? (
                                <CircleNotch size={14} className="animate-spin" />
                              ) : (
                                <Trash size={14} weight="bold" />
                              )}
                              <span>Delete</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
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
