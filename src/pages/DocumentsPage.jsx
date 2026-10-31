// frontend/src/pages/DocumentsPage.jsx

import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FileText,
  Plus,
  Search,
  Trash2,
  Copy,
  Edit3,
  Calendar,
  Sparkles,
  GraduationCap,
  Award,
  Building2,
  ArrowRight,
  Clock,
  Loader2,
  FilePlus2,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { getDocuments, deleteTemplate, createCustomTemplate, getTemplate } from "../api";
import HelpGuide from "../components/HelpGuide";

const DOCUMENT_PRESETS = [
  {
    id: "blank",
    name: "Blank document",
    desc: "Start with an empty page",
    icon: FilePlus2,
    color: "bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200",
  },
  {
    id: "statement_of_result",
    name: "Statement of Result",
    desc: "Official academic degree & grade statement",
    icon: GraduationCap,
    color: "bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200",
  },
  {
    id: "english_proficiency",
    name: "English Proficiency",
    desc: "Letter confirming English medium of instruction",
    icon: Award,
    color: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200",
  },
  {
    id: "attestation_completion",
    name: "Letter of Attestation",
    desc: "Formal confirmation of program completion",
    icon: Building2,
    color: "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200",
  },
];

const DocumentsPage = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest"); // "newest", "oldest", "title"
  const [deletingId, setDeletingId] = useState(null);
  const [duplicatingId, setDuplicatingId] = useState(null);

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const res = await getDocuments();
      const list = (res.data?.templates || []).filter(
        (t) => t.layout_style === "document"
      );
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

  const handleDelete = async (docId, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeletingId(docId);
    try {
      await deleteTemplate(docId);
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
      toast.success("Document deleted");
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
      const payload = {
        title: `Copy of ${doc.title || "Document"}`,
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
      <div className="border-b border-slate-200/80 bg-white mb-6 -mt-6 px-4 sm:px-6 py-3.5 rounded-b-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 max-w-[1600px] mx-auto">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
              <span>ProofDeck</span>
              <span>/</span>
              <span className="font-semibold text-slate-800">Documents</span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              Documents
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <HelpGuide type="certificates" />
            <Link
              to="/dashboard/documents/editor"
              className="px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus size={14} />
              <span>New document</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* --- Quick-Start Starter Presets Section --- */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-amber-500" />
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Start from a preset
              </h2>
            </div>
            <span className="text-[11px] text-slate-400">
              Pick a layout to open in editor
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {DOCUMENT_PRESETS.map((p) => {
              const Icon = p.icon;
              const targetUrl =
                p.id === "blank"
                  ? "/dashboard/documents/editor"
                  : `/dashboard/documents/editor?preset=${p.id}`;

              return (
                <Link
                  key={p.id}
                  to={targetUrl}
                  className={`p-3.5 rounded-xl border transition-all hover:shadow-xs group flex flex-col justify-between cursor-pointer ${p.color}`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-white/80 flex items-center justify-center shrink-0 shadow-2xs">
                      <Icon size={16} />
                    </div>
                    <ArrowRight
                      size={14}
                      className="opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all mt-1"
                    />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 mb-0.5">
                      {p.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 line-clamp-1">
                      {p.desc}
                    </p>
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
            <Search
              size={14}
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
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3 animate-pulse"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-200 rounded-lg" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 bg-slate-200 rounded w-3/4" />
                    <div className="h-2.5 bg-slate-200 rounded w-1/2" />
                  </div>
                </div>
                <div className="h-16 bg-slate-100 rounded-lg" />
                <div className="h-8 bg-slate-200 rounded" />
              </div>
            ))}
          </div>
        ) : filteredDocs.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-xl border border-dashed border-slate-200 p-12 text-center shadow-xs space-y-3 max-w-xl mx-auto">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <FileText size={24} />
            </div>
            <h3 className="text-sm font-bold text-slate-800">
              {searchQuery ? "No matching documents" : "No documents yet"}
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {searchQuery
                ? `No documents matched "${searchQuery}". Try a different keyword.`
                : "Create formal statements of results, letters of proficiency, or attestations with live dynamic variables."}
            </p>
            {!searchQuery && (
              <div className="pt-2">
                <Link
                  to="/dashboard/documents/editor"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  <Plus size={14} />
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

              return (
                <div
                  key={doc.id}
                  className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
                >
                  {/* Card Header */}
                  <div className="p-4 sm:p-5 border-b border-slate-100 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                          <FileText size={20} />
                        </div>
                        <div className="min-w-0">
                          <h3
                            className="text-xs sm:text-sm font-bold text-slate-900 truncate"
                            title={doc.title}
                          >
                            {doc.title || "Untitled document"}
                          </h3>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                            <Clock size={11} />
                            <span>{formattedDate}</span>
                          </div>
                        </div>
                      </div>

                      <span className="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-600 rounded-full shrink-0">
                        Document
                      </span>
                    </div>

                    {/* Preview Box */}
                    <div
                      onClick={() => navigate(`/dashboard/documents/editor/${doc.id}`)}
                      className="h-28 bg-slate-50 border border-slate-100 rounded-lg p-2.5 overflow-hidden text-[10px] text-slate-500 font-mono select-none cursor-pointer hover:bg-slate-100/60 transition-colors relative"
                    >
                      <div className="pointer-events-none opacity-60">
                        {doc.layout_data?.canvas_data?.document_html ? (
                          <div
                            dangerouslySetInnerHTML={{
                              __html: doc.layout_data.canvas_data.document_html.slice(0, 300),
                            }}
                          />
                        ) : (
                          <p className="italic">Document formatted content</p>
                        )}
                      </div>
                      <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-slate-50 to-transparent pointer-events-none" />
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="px-4 py-2.5 bg-slate-50/50 flex items-center justify-between gap-2 text-xs">
                    <Link
                      to={`/dashboard/documents/editor/${doc.id}`}
                      className="text-xs font-bold text-slate-800 hover:text-blue-600 flex items-center gap-1.5 cursor-pointer py-1"
                    >
                      <Edit3 size={13} />
                      <span>Open in editor</span>
                    </Link>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleDuplicate(doc)}
                        disabled={duplicatingId === doc.id}
                        className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Duplicate document"
                        aria-label="Duplicate document"
                      >
                        {duplicatingId === doc.id ? (
                          <Loader2 size={13} className="animate-spin text-slate-600" />
                        ) : (
                          <Copy size={13} />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(doc.id, doc.title)}
                        disabled={deletingId === doc.id}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors cursor-pointer"
                        title="Delete document"
                        aria-label="Delete document"
                      >
                        {deletingId === doc.id ? (
                          <Loader2 size={13} className="animate-spin text-red-600" />
                        ) : (
                          <Trash2 size={13} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentsPage;
