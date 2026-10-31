import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Modal } from "react-bootstrap";
import {
  Search,
  Plus,
  FileText,
  Paintbrush,
  Sparkles,
  Award,
  Layers,
  Copy,
  Edit2,
  Trash2,
  ExternalLink,
  Upload,
} from "lucide-react";
import { SERVER_BASE_URL } from "../config";
import {
  getTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
} from "../api";
import { toast, Toaster } from "react-hot-toast";
import TemplateRenderer from "../components/templates/TemplateRenderer";
import TemplateSelector from "../components/TemplateSelector";
import { useUser } from "../context/UserContext";
import PageHeader from "../components/ui/PageHeader";
import AppButton from "../components/ui/AppButton";
import AppTabs from "../components/ui/AppTabs";
import EmptyState from "../components/ui/EmptyState";
import KebabMenu from "../components/ui/KebabMenu";

const PRESET_OPTIONS = [
  "classic",
  "modern",
  "receipt",
  "invitation",
  "modern_landscape",
  "elegant_serif",
  "minimalist_bold",
  "corporate_blue",
  "tech_dark",
  "creative_art",
  "badge_cert",
  "award_gold",
  "diploma_classic",
  "achievement_star",
];

const FONT_OPTIONS = [
  "Georgia",
  "Lato",
  "Roboto",
  "Arial",
  "Verdana",
  "Times New Roman",
];

const LEGACY_TITLE_RENAME = {
  "University Degree & Graduation Certificate": "Classic",
  "Academic Excellence & Senate Honours": "Modern",
  "Official Statement of Result / Attestation": "Minimalist Bold",
  "Executive Diploma & Post-Graduate Award": "Diploma Classic",
  "Gold Senate Distinction Award": "Award Gold",
  "Modern Academic Credential": "Modern Landscape",
  "Corporate Academic Fellowship": "Corporate Blue",
  "Elegant Serif Degree Certification": "Elegant Serif",
  "Faculty of Technology Dark Credential": "Tech Dark",
  "Department of Arts & Creative Design": "Creative Art",
  "Academic Badge & Verified Accreditation": "Badge Certificate",
  "Star of Achievement & Senate Valedictorian": "Achievement Star",
  "Senate Commendation Star": "Achievement Star",
  "Official Student Tuition & Academic Fee Receipt": "Receipt",
};

export default function TemplatesPage() {
  const navigate = useNavigate();
  const { user } = useUser();
  const isPro = user?.role === "pro" || user?.role === "enterprise";

  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState(null);
  const [editFormData, setEditFormData] = useState(null);

  // New certificate form state
  const [newCertData, setNewCertData] = useState({
    title: "",
    layout_style: "classic",
    font_family: "Georgia",
    primary_color: "#2563EB",
    secondary_color: "#D1D5DB",
    body_font_color: "#111827",
    custom_title: "Certificate of Completion",
    custom_body: "has successfully completed the course",
    logo: null,
    background: null,
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const response = await getTemplates();
      setTemplates(response.data.templates || []);
    } catch (err) {
      toast.error("Could not fetch templates.");
    } finally {
      setLoading(false);
    }
  };

  const filteredTemplates = useMemo(() => {
    return templates.filter((t) => {
      const matchesSearch =
        t.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.layout_style?.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      const isDoc = t.layout_style === "document";
      if (activeTab === "certificates") return !isDoc;
      if (activeTab === "documents") return isDoc;
      return true;
    });
  }, [templates, searchQuery, activeTab]);

  const handleCreateCertificate = async (e) => {
    e.preventDefault();
    if (!newCertData.title.trim()) {
      toast.error("Please enter a template name");
      return;
    }
    const data = new FormData();
    Object.keys(newCertData).forEach((key) => {
      if (newCertData[key]) data.append(key, newCertData[key]);
    });

    try {
      await createTemplate(data);
      toast.success("Template created");
      setShowCreateModal(false);
      setNewCertData({
        title: "",
        layout_style: "classic",
        font_family: "Georgia",
        primary_color: "#2563EB",
        secondary_color: "#D1D5DB",
        body_font_color: "#111827",
        custom_title: "Certificate of Completion",
        custom_body: "has successfully completed the course",
        logo: null,
        background: null,
      });
      fetchTemplates();
    } catch (err) {
      toast.error(err.response?.data?.msg || "Failed to create template");
    }
  };

  const handleDuplicate = async (template) => {
    const data = new FormData();
    data.append("title", `${template.title} (Copy)`);
    data.append("layout_style", template.layout_style || "classic");
    data.append("font_family", template.font_family || "Georgia");
    data.append("primary_color", template.primary_color || "#2563EB");
    data.append("secondary_color", template.secondary_color || "#D1D5DB");
    data.append("body_font_color", template.body_font_color || "#111827");
    if (template.custom_text?.title) data.append("custom_title", template.custom_text.title);
    if (template.custom_text?.body) data.append("custom_body", template.custom_text.body);

    try {
      await createTemplate(data);
      toast.success("Template duplicated");
      fetchTemplates();
    } catch (err) {
      toast.error("Failed to duplicate template");
    }
  };

  const handleEditClick = (template) => {
    if (template.layout_style === "document") {
      navigate(`/dashboard/documents/editor/${template.id}`);
      return;
    }
    if (template.layout_style === "visual") {
      navigate(`/dashboard/upload-template/${template.id}`);
      return;
    }
    setEditFormData({
      ...template,
      custom_title: template.custom_text?.title || "",
      custom_body: template.custom_text?.body || "",
      logo: null,
      background: null,
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    const isCopyingPublic = editFormData.is_public;
    Object.keys(editFormData).forEach((key) => {
      if (
        key !== "logo_url" &&
        key !== "background_url" &&
        key !== "is_public" &&
        key !== "id" &&
        editFormData[key] !== null &&
        editFormData[key] !== undefined
      ) {
        data.append(key, editFormData[key]);
      }
    });

    try {
      if (isCopyingPublic) {
        await createTemplate(data);
      } else {
        await updateTemplate(editFormData.id, data);
      }
      setShowEditModal(false);
      toast.success("Template updated");
      fetchTemplates();
    } catch (err) {
      toast.error(err.response?.data?.msg || "Failed to update template");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!templateToDelete) return;
    try {
      await deleteTemplate(templateToDelete.id);
      setShowDeleteModal(false);
      setTemplateToDelete(null);
      toast.success("Template deleted");
      fetchTemplates();
    } catch (err) {
      toast.error(err.response?.data?.msg || "Failed to delete template");
    }
  };

  return (
    <div className="w-full pb-12">
      <Toaster position="top-right" />

      {/* Header */}
      <PageHeader
        title="Templates"
        actions={
          <div className="flex items-center gap-2">
            <AppButton
              variant="secondary"
              onClick={() => navigate("/dashboard/documents/editor")}
            >
              New document
            </AppButton>
            <AppButton
              variant="primary"
              onClick={() => setShowCreateModal(true)}
            >
              New certificate
            </AppButton>
          </div>
        }
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <AppTabs
          tabs={[
            { id: "all", label: "All" },
            { id: "certificates", label: "Certificates" },
            { id: "documents", label: "Documents" },
          ]}
          activeId={activeTab}
          onChange={setActiveTab}
        />

        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      {/* Card Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg h-56" />
          ))}
        </div>
      ) : filteredTemplates.length === 0 ? (
        <EmptyState
          message="No templates found."
          actionLabel="New certificate"
          onAction={() => setShowCreateModal(true)}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTemplates.map((template) => {
            const isDoc = template.layout_style === "document";
            const isVisual = template.layout_style === "visual";
            const displayTitle = LEGACY_TITLE_RENAME[template.title] || template.title;
            const issuedCount = template.certificates?.length || 0;

            const menuItems = [
              {
                label: "Edit",
                icon: Edit2,
                onClick: () => handleEditClick(template),
              },
              {
                label: "Duplicate",
                icon: Copy,
                onClick: () => handleDuplicate(template),
              },
              ...(!template.is_public
                ? [
                    {
                      label: "Delete",
                      icon: Trash2,
                      danger: true,
                      onClick: () => {
                        setTemplateToDelete(template);
                        setShowDeleteModal(true);
                      },
                    },
                  ]
                : []),
            ];

            return (
              <div
                key={template.id}
                className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden flex flex-col hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-xs"
              >
                {/* Thumbnail */}
                <div
                  onClick={() => handleEditClick(template)}
                  className="relative aspect-[16/10] bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 overflow-hidden cursor-pointer flex items-center justify-center"
                >
                  {isDoc ? (
                    <div className="w-full h-full p-4 flex flex-col justify-center items-center text-center bg-white dark:bg-slate-900">
                      <FileText size={32} className="text-slate-400 dark:text-slate-500 mb-1" />
                      <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400 truncate max-w-[140px]">
                        {displayTitle}
                      </span>
                    </div>
                  ) : isVisual && template.preview_image ? (
                    <img
                      src={`${SERVER_BASE_URL}${template.preview_image}`}
                      alt={displayTitle}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-[200%] h-[200%] origin-top-left transform scale-50 pointer-events-none select-none">
                      <TemplateRenderer template={template} />
                    </div>
                  )}

                  {template.is_premium && (
                    <span className="absolute top-2 left-2 bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                      Premium
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="p-3 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <h3
                      onClick={() => handleEditClick(template)}
                      className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate cursor-pointer hover:text-indigo-600"
                      title={displayTitle}
                    >
                      {displayTitle}
                    </h3>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      <span className="capitalize">
                        {isDoc ? "Document" : template.layout_style?.replace(/_/g, " ") || "Certificate"}
                      </span>
                      {issuedCount > 0 && (
                        <>
                          <span>•</span>
                          <span>{issuedCount} issued</span>
                        </>
                      )}
                    </div>
                  </div>

                  <KebabMenu items={menuItems} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New Certificate Creation Flow Modal */}
      <Modal
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        centered
        size="lg"
        contentClassName="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800"
      >
        <Modal.Header closeButton className="border-b border-slate-100 dark:border-slate-800 pb-3">
          <Modal.Title className="text-sm font-bold text-slate-900 dark:text-slate-100">
            New certificate
          </Modal.Title>
        </Modal.Header>
        <form onSubmit={handleCreateCertificate}>
          <Modal.Body className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-600 dark:text-slate-400">
                Choose a preset layout or start from a blank canvas in ProofDeck Studio.
              </span>
              <AppButton
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowCreateModal(false);
                  navigate("/dashboard/upload-template");
                }}
              >
                Start blank
              </AppButton>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Template name
              </label>
              <input
                type="text"
                required
                value={newCertData.title}
                onChange={(e) => setNewCertData({ ...newCertData, title: e.target.value })}
                placeholder="e.g. Graduation Award"
                className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Preset layout
              </label>
              <TemplateSelector
                value={newCertData.layout_style}
                onChange={(val) => setNewCertData({ ...newCertData, layout_style: val })}
                options={PRESET_OPTIONS}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Font
                </label>
                <select
                  value={newCertData.font_family}
                  onChange={(e) => setNewCertData({ ...newCertData, font_family: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs focus:outline-none focus:border-indigo-500"
                >
                  {FONT_OPTIONS.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-semibold uppercase text-slate-500 mb-1">
                    Primary
                  </label>
                  <input
                    type="color"
                    value={newCertData.primary_color}
                    onChange={(e) => setNewCertData({ ...newCertData, primary_color: e.target.value })}
                    className="w-full h-8 rounded border border-slate-200 dark:border-slate-700 cursor-pointer p-0.5 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase text-slate-500 mb-1">
                    Accent
                  </label>
                  <input
                    type="color"
                    value={newCertData.secondary_color}
                    onChange={(e) => setNewCertData({ ...newCertData, secondary_color: e.target.value })}
                    className="w-full h-8 rounded border border-slate-200 dark:border-slate-700 cursor-pointer p-0.5 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase text-slate-500 mb-1">
                    Text
                  </label>
                  <input
                    type="color"
                    value={newCertData.body_font_color}
                    onChange={(e) => setNewCertData({ ...newCertData, body_font_color: e.target.value })}
                    className="w-full h-8 rounded border border-slate-200 dark:border-slate-700 cursor-pointer p-0.5 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Heading text
                </label>
                <input
                  type="text"
                  value={newCertData.custom_title}
                  onChange={(e) => setNewCertData({ ...newCertData, custom_title: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Body text
                </label>
                <input
                  type="text"
                  value={newCertData.custom_body}
                  onChange={(e) => setNewCertData({ ...newCertData, custom_body: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Logo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setNewCertData({ ...newCertData, logo: e.target.files[0] })}
                  className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-slate-100 dark:file:bg-slate-800 file:text-slate-700 dark:file:text-slate-200 hover:file:bg-slate-200 cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Background
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setNewCertData({ ...newCertData, background: e.target.files[0] })}
                  className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-slate-100 dark:file:bg-slate-800 file:text-slate-700 dark:file:text-slate-200 hover:file:bg-slate-200 cursor-pointer"
                />
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer className="border-t border-slate-100 dark:border-slate-800 pt-3">
            <AppButton
              type="button"
              variant="secondary"
              onClick={() => setShowCreateModal(false)}
            >
              Cancel
            </AppButton>
            <AppButton type="submit" variant="primary">
              Create template
            </AppButton>
          </Modal.Footer>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        centered
        size="lg"
        contentClassName="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800"
      >
        <Modal.Header closeButton className="border-b border-slate-100 dark:border-slate-800 pb-3">
          <Modal.Title className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Edit template
          </Modal.Title>
        </Modal.Header>
        <form onSubmit={handleEditSubmit}>
          <Modal.Body className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Template name
              </label>
              <input
                type="text"
                required
                value={editFormData?.title || ""}
                onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Layout
              </label>
              <TemplateSelector
                value={editFormData?.layout_style || "classic"}
                onChange={(val) => setEditFormData({ ...editFormData, layout_style: val })}
                options={PRESET_OPTIONS}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Font
                </label>
                <select
                  value={editFormData?.font_family || "Georgia"}
                  onChange={(e) => setEditFormData({ ...editFormData, font_family: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs focus:outline-none focus:border-indigo-500"
                >
                  {FONT_OPTIONS.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-semibold uppercase text-slate-500 mb-1">
                    Primary
                  </label>
                  <input
                    type="color"
                    value={editFormData?.primary_color || "#2563EB"}
                    onChange={(e) => setEditFormData({ ...editFormData, primary_color: e.target.value })}
                    className="w-full h-8 rounded border border-slate-200 dark:border-slate-700 cursor-pointer p-0.5 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase text-slate-500 mb-1">
                    Accent
                  </label>
                  <input
                    type="color"
                    value={editFormData?.secondary_color || "#D1D5DB"}
                    onChange={(e) => setEditFormData({ ...editFormData, secondary_color: e.target.value })}
                    className="w-full h-8 rounded border border-slate-200 dark:border-slate-700 cursor-pointer p-0.5 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase text-slate-500 mb-1">
                    Text
                  </label>
                  <input
                    type="color"
                    value={editFormData?.body_font_color || "#111827"}
                    onChange={(e) => setEditFormData({ ...editFormData, body_font_color: e.target.value })}
                    className="w-full h-8 rounded border border-slate-200 dark:border-slate-700 cursor-pointer p-0.5 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Heading text
                </label>
                <input
                  type="text"
                  value={editFormData?.custom_title || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, custom_title: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Body text
                </label>
                <input
                  type="text"
                  value={editFormData?.custom_body || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, custom_body: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  New logo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setEditFormData({ ...editFormData, logo: e.target.files[0] })}
                  className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-slate-100 dark:file:bg-slate-800 file:text-slate-700 dark:file:text-slate-200 hover:file:bg-slate-200 cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  New background
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setEditFormData({ ...editFormData, background: e.target.files[0] })}
                  className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-slate-100 dark:file:bg-slate-800 file:text-slate-700 dark:file:text-slate-200 hover:file:bg-slate-200 cursor-pointer"
                />
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer className="border-t border-slate-100 dark:border-slate-800 pt-3">
            <AppButton
              type="button"
              variant="secondary"
              onClick={() => setShowEditModal(false)}
            >
              Cancel
            </AppButton>
            <AppButton type="submit" variant="primary">
              Save changes
            </AppButton>
          </Modal.Footer>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
        contentClassName="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800"
      >
        <Modal.Header closeButton className="border-b border-slate-100 dark:border-slate-800 pb-3">
          <Modal.Title className="text-sm font-bold text-red-600">
            Delete template
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-5 text-xs text-slate-600 dark:text-slate-400">
          Are you sure you want to delete <strong>{templateToDelete?.title}</strong>? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer className="border-t border-slate-100 dark:border-slate-800 pt-3">
          <AppButton
            variant="secondary"
            onClick={() => setShowDeleteModal(false)}
          >
            Cancel
          </AppButton>
          <AppButton
            variant="danger"
            onClick={handleDeleteConfirm}
          >
            Delete
          </AppButton>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
