import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Modal, Button, Spinner, Form, Card, Tooltip, OverlayTrigger } from "react-bootstrap";
import {
  Trash2,
  Edit,
  Plus,
  Copy,
  LayoutTemplate,
  Search,
  Filter,
  Check,
  X,
  Maximize2,
  ImageIcon,
  Type,
  Palette,
  Save,
  Loader2,
  MoreVertical,
  Briefcase,
  Award,
  BookOpen,
  Eye,
  Brush
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



// --- Form Components ---
const FormInput = ({ label, ...props }) => (
  <div className="space-y-1">
    <label className="block text-slate-700 font-semibold text-xs">
      {label}
    </label>
    <input
      {...props}
      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded focus:outline-none focus:border-indigo-500 transition-all text-xs shadow-sm"
    />
  </div>
);

const FormSelect = ({ label, options, ...props }) => (
  <div className="space-y-1">
    <label className="block text-slate-700 font-semibold text-xs">
      {label}
    </label>
    <select
      {...props}
      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded focus:outline-none focus:border-indigo-500 transition-all text-xs shadow-sm"
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt.charAt(0).toUpperCase() + opt.slice(1)}
        </option>
      ))}
    </select>
  </div>
);

const FormColorInput = ({ label, ...props }) => (
  <div className="space-y-1">
    <label className="block text-slate-500 text-[10px] font-semibold uppercase tracking-wider">
      {label}
    </label>
    <div className="flex items-center gap-2 border border-slate-200 rounded p-1 bg-white hover:border-slate-300 transition-colors shadow-sm">
      <input
        type="color"
        {...props}
        className="w-6 h-6 rounded cursor-pointer border border-slate-200/50 p-0"
      />
      <span className="text-[10px] font-mono text-slate-500">
        {props.value}
      </span>
    </div>
  </div>
);

const FormFileInput = ({ label, ...props }) => (
  <div className="space-y-1">
    <label className="block text-slate-700 font-semibold text-xs">
      {label}
    </label>
    <input
      type="file"
      {...props}
      accept="image/*"
      className="block w-full text-xs text-slate-500
        file:mr-2 file:py-1 file:px-2.5
        file:rounded file:border-0
        file:text-xs file:font-semibold
        file:bg-slate-100 file:text-slate-700
        hover:file:bg-slate-200 cursor-pointer"
    />
  </div>
);

function TemplatesPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const navLinks = [
    { name: "Overview", path: "/dashboard" },
    { name: "Templates", path: "/dashboard/templates" },
    { name: "Groups", path: "/dashboard/groups" },
    { name: "Analytics", path: "/dashboard/analytics" },
    { name: "Settings", path: "/dashboard/settings" },
  ];
  const [templates, setTemplates] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    logo: null,
    background: null,
    primary_color: "#2563EB",
    secondary_color: "#D1D5DB",
    body_font_color: "#111827",
    font_family: "Georgia",
    layout_style: "classic",
    custom_title: "Certificate of Completion",
    custom_body: "has successfully completed the course",
  });
  const [previewData, setPreviewData] = useState({
    logo_url: null,
    background_url: null,
    primary_color: "#2563EB",
    secondary_color: "#D1D5DB",
    body_font_color: "#111827",
    font_family: "Georgia",
    layout_style: "classic",
    custom_text: {
      title: "Certificate of Completion",
      body: "has successfully completed the course",
    },
  });
  const [editFormData, setEditFormData] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState(null);
  const [showAllLibrary, setShowAllLibrary] = useState(false);
  const { user } = useUser();
  const isPro = user?.role === 'pro' || user?.role === 'enterprise';

  const fontOptions = [
    "Georgia",
    "Lato",
    "Roboto",
    "Arial",
    "Verdana",
    "Times New Roman",
  ];
  const layoutOptions = [
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

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const response = await getTemplates();
      setTemplates(response.data.templates);
    } catch (err) {
      toast.error("Could not fetch templates.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const stateSetter = showEditModal ? setEditFormData : setFormData;
    stateSetter((prev) => ({ ...prev, [name]: value }));

    const targetPreview = showEditModal ? editFormData : formData;
    if (name === "custom_title" || name === "custom_body") {
      setPreviewData((prev) => ({
        ...prev,
        ...targetPreview,
        [name]: value,
        custom_text: {
          ...prev.custom_text,
          [name === "custom_title" ? "title" : "body"]: value,
        },
      }));
    } else {
      setPreviewData((prev) => ({ ...prev, ...targetPreview, [name]: value }));
    }
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files[0];
    if (file) {
      const stateSetter = showEditModal ? setEditFormData : setFormData;
      stateSetter((prev) => ({ ...prev, [name]: file }));
      setPreviewData((prev) => ({
        ...prev,
        [`${name}_url`]: URL.createObjectURL(file),
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const promise = new Promise(async (resolve, reject) => {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key]) data.append(key, formData[key]);
      });
      try {
        await createTemplate(data);
        fetchTemplates();
        e.target.reset();
        resolve();
      } catch (err) {
        reject(err);
      }
    });
    toast.promise(promise, {
      loading: "Creating...",
      success: "Template created successfully!",
      error: (err) => err.response?.data?.msg || "Failed to create.",
    });
  };

  const handleEditClick = (template) => {
    if (template.layout_style === "visual") {
      navigate(`/dashboard/upload-template/${template.id}`);
      return;
    }
    setEditFormData({
      ...template,
      logo: null,
      background: null,
      custom_title: template.custom_text?.title,
      custom_body: template.custom_text?.body,
    });
    setPreviewData({
      ...template,
      logo_url: template.logo_url
        ? `${SERVER_BASE_URL}${template.logo_url}`
        : null,
      background_url: template.background_url
        ? `${SERVER_BASE_URL}${template.background_url}`
        : null,
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const promise = new Promise(async (resolve, reject) => {
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
        fetchTemplates();
        resolve();
      } catch (err) {
        reject(err);
      }
    });
    toast.promise(promise, {
      loading: editFormData.is_public ? "Creating personalized template copy..." : "Updating template...",
      success: editFormData.is_public ? "Customized template saved to library!" : "Template updated!",
      error: (err) => err.response?.data?.msg || "Failed.",
    });
  };

  const handleDeleteConfirm = async () => {
    if (!templateToDelete) return;
    const promise = deleteTemplate(templateToDelete.id);
    toast.promise(promise, {
      loading: "Deleting...",
      success: () => {
        setShowDeleteModal(false);
        setTemplateToDelete(null);
        fetchTemplates();
        return "Template deleted!";
      },
      error: (err) => {
        setShowDeleteModal(false);
        return err.response?.data?.msg || "Failed.";
      },
    });
  };

  const currentFormState = showEditModal ? editFormData : formData;

  return (
    <div className="w-full pb-12">
      <Toaster position="top-right" />

      {/* --- 1. Top Navigation Bar (Header - Locked to Top) --- */}
      <div className="border-b border-slate-200/80 bg-white mb-6 -mt-6 -mx-4 sm:-mx-6 md:-mx-8 px-4 sm:px-6 md:px-8 py-3">
        <div className="flex items-center justify-between gap-4 max-w-[1600px] mx-auto">
          {/* Left: Page Title */}
          <h1 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-0">Templates</h1>

          {/* Right Action */}
          <Link
            to="/dashboard/upload-template"
            className="inline-flex items-center justify-center bg-slate-900 border border-slate-900 text-white rounded-lg py-1.5 px-3 hover:bg-black transition-all font-semibold text-xs shadow-sm decoration-none"
          >
            <Brush size={14} className="mr-1.5 text-slate-250" />
            Open Visual Editor
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12">
        {/* Creator Form */}
        <div className="col-span-12 lg:col-span-4">
          <div className="bg-white rounded border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
              <LayoutTemplate size={16} className="text-indigo-600" />
              <h3 className="text-xs font-bold text-slate-800">
                Standard Creator
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <FormInput
                label="Template Name"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                placeholder="e.g. Monthly Award"
              />

              <TemplateSelector
                value={formData.layout_style}
                onChange={(val) => handleInputChange({ target: { name: 'layout_style', value: val } })}
                options={layoutOptions}
              />
              
              <FormSelect
                label="Font"
                name="font_family"
                value={formData.font_family}
                onChange={handleInputChange}
                options={fontOptions}
              />

              <div className="space-y-1">
                <label className="block text-slate-700 font-semibold text-xs">
                  Colors
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <FormColorInput
                    label="Primary"
                    name="primary_color"
                    value={formData.primary_color}
                    onChange={handleInputChange}
                  />
                  <FormColorInput
                    label="Accent"
                    name="secondary_color"
                    value={formData.secondary_color}
                    onChange={handleInputChange}
                  />
                  <FormColorInput
                    label="Text"
                    name="body_font_color"
                    value={formData.body_font_color}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5 pt-1">
                <FormInput
                  label="Heading"
                  name="custom_title"
                  value={formData.custom_title}
                  onChange={handleInputChange}
                  placeholder="Certificate of..."
                />
                <FormInput
                  label="Body Text"
                  name="custom_body"
                  value={formData.custom_body}
                  onChange={handleInputChange}
                  placeholder="has successfully..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5 pt-1">
                <FormFileInput
                  label="Logo"
                  name="logo"
                  onChange={handleFileChange}
                />
                <FormFileInput
                  label="Background"
                  name="background"
                  onChange={handleFileChange}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-slate-900 border border-slate-900 hover:bg-black text-white text-xs font-semibold py-2 px-4 rounded shadow-sm transition-all flex items-center justify-center gap-1.5 mt-2"
              >
                <Plus size={14} /> Create Template
              </button>
            </form>
          </div>
        </div>

        {/* Live Preview - Sticky */}
        <div className="col-span-12 lg:col-span-8">
          <div className="bg-slate-50 border border-slate-200 rounded p-4 sticky top-6 min-h-[350px] flex flex-col justify-between shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-1.5 text-slate-700 font-bold text-xs">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live Preview</span>
              </div>
              <button
                onClick={() => setIsFullscreen(true)}
                className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-white border border-transparent hover:border-slate-200 rounded transition-all shadow-sm bg-white/50"
              >
                <Maximize2 size={14} />
              </button>
            </div>
            <div className="w-full flex justify-center flex-1 items-center">
              <div className="w-full max-w-2xl bg-white shadow border border-slate-200/50 rounded overflow-hidden">
                <TemplateRenderer template={previewData} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Templates List */}
      <div>
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-1.5">
          <div className="w-1 h-3.5 bg-indigo-600 rounded-full"></div>
          <span>Your Library</span>
        </h3>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 animate-pulse">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-100 border border-gray-200 rounded-xl h-56" />
            ))}
          </div>
        ) : templates.length > 0 ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {(showAllLibrary ? templates : templates.slice(0, 6)).map((t) => (
                <TemplateCard
                  key={t.id}
                  template={t}
                  isPro={isPro}
                  onEditClick={handleEditClick}
                  onDeleteClick={(template) => {
                    setTemplateToDelete(template);
                    setShowDeleteModal(true);
                  }}
                />
              ))}
            </div>
            
            {templates.length > 6 && (
              <div className="flex justify-center pt-2">
                <button 
                  onClick={() => setShowAllLibrary(!showAllLibrary)}
                  className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-1.5 rounded text-xs font-semibold transition-all shadow-sm flex items-center gap-1.5"
                >
                  {showAllLibrary ? <X size={12} /> : <Plus size={12} />}
                  {showAllLibrary ? "Show Less" : `View All Templates (${templates.length})`}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded border border-dashed border-slate-300">
            <p className="text-slate-500 text-xs italic">
              No templates found. Create one above!
            </p>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <Modal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        centered
        size="lg"
        contentClassName="rounded border border-slate-200"
      >
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="font-bold text-sm text-slate-800">Edit Template</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <form
            id="edit-form"
            onSubmit={handleEditSubmit}
            className="space-y-3.5"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3.5">
                <FormInput
                  label="Name"
                  name="title"
                  value={currentFormState?.title}
                  onChange={handleInputChange}
                  required
                />
                <div className="space-y-3.5">
                   <TemplateSelector
                    value={currentFormState?.layout_style}
                    onChange={(val) => handleInputChange({ target: { name: 'layout_style', value: val } })}
                    options={layoutOptions}
                  />
                  <FormSelect
                    label="Font"
                    name="font_family"
                    value={currentFormState?.font_family}
                    onChange={handleInputChange}
                    options={fontOptions}
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <FormColorInput
                    label="Primary"
                    name="primary_color"
                    value={currentFormState?.primary_color}
                    onChange={handleInputChange}
                  />
                  <FormColorInput
                    label="Accent"
                    name="secondary_color"
                    value={currentFormState?.secondary_color}
                    onChange={handleInputChange}
                  />
                  <FormColorInput
                    label="Text"
                    name="body_font_color"
                    value={currentFormState?.body_font_color}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="space-y-3.5">
                <FormInput
                  label="Heading"
                  name="custom_title"
                  value={currentFormState?.custom_title}
                  onChange={handleInputChange}
                />
                <FormInput
                  label="Body"
                  name="custom_body"
                  value={currentFormState?.custom_body}
                  onChange={handleInputChange}
                />
                <FormFileInput
                  label="New Logo"
                  name="logo"
                  onChange={handleFileChange}
                />
                <FormFileInput
                  label="New Background"
                  name="background"
                  onChange={handleFileChange}
                />
              </div>
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <button 
            type="button" 
            onClick={() => setShowEditModal(false)}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            form="edit-form"
            className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded shadow-sm transition-colors"
          >
            Save Changes
          </button>
        </Modal.Footer>
      </Modal>

      {/* Delete Modal */}
      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
        contentClassName="rounded border border-slate-200"
      >
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="text-red-600 font-bold text-sm">
            Delete Template?
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-xs text-slate-600">
          Are you sure you want to delete{" "}
          <strong>{templateToDelete?.title}</strong>?
          <br />
          This action cannot be undone.
        </Modal.Body>
        <Modal.Footer className="border-0">
          <button 
            type="button" 
            onClick={() => setShowDeleteModal(false)}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
          >
            Cancel
          </button>
          <button 
            type="button" 
            onClick={handleDeleteConfirm}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded shadow-sm transition-colors"
          >
            Delete Forever
          </button>
        </Modal.Footer>
      </Modal>

      {/* Fullscreen Preview */}
      {isFullscreen && (
        <div
          className="fixed inset-0 bg-slate-950/90 z-[9999] flex items-center justify-center p-4"
          onClick={() => setIsFullscreen(false)}
        >
          <button className="absolute top-6 right-6 text-white hover:text-slate-300 transition-colors">
            <X size={32} />
          </button>
          <div
            className="w-full max-w-6xl"
            onClick={(e) => e.stopPropagation()}
          >
            <TemplateRenderer template={previewData} isFullscreen={true} />
          </div>
        </div>
      )}
    </div>
  );
}

const TemplateCard = ({
  template,
  isPro,
  onEditClick,
  onDeleteClick,
}) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyId = () => {
    navigator.clipboard.writeText(template.id);
    setIsCopied(true);
    toast.success("Template ID copied!");
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded border border-slate-200 hover:border-slate-300 shadow-sm transition-all overflow-hidden group flex flex-col h-full relative">
      {/* Thumbnail Area */}
      <div className="relative h-40 bg-slate-50 overflow-hidden border-b border-slate-100">
        
        {/* PREMIUM BADGE */}
        {template.is_premium && (
            <div className="absolute top-2 right-2 z-10 bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm flex items-center gap-1 uppercase tracking-wide">
                <Award size={9} fill="currentColor" /> Premium
            </div>
        )}

        {/* Visual Preview */}
        <div className="w-full h-full relative">
             {/* Scaled down renderer */}
             <div className="w-[200%] h-[200%] origin-top-left transform scale-50 pointer-events-none select-none">
                  <TemplateRenderer template={template} />
             </div>
             {/* Overlay to prevent interaction */}
             <div className="absolute inset-0 bg-transparent group-hover:bg-slate-950/5 transition-colors" />
        </div>

        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950/20 backdrop-blur-[0.5px]">
             {(!template.is_premium || isPro) ? (
                <button 
                    onClick={() => onEditClick(template)}
                    className="bg-white text-slate-800 border border-slate-200 rounded py-1.5 px-3 font-semibold text-xs shadow-md transform translate-y-2 group-hover:translate-y-0 transition-all hover:bg-slate-50 flex items-center gap-1.5"
                >
                    <Edit size={12} /> Edit Design
                </button>
             ) : (
                <div className="bg-white/95 text-slate-800 rounded p-3 font-bold text-xs shadow-lg flex flex-col items-center gap-1.5">
                    <Award className="text-amber-500" size={18} />
                    <span>Premium Template</span>
                    <Link to="/pricing" className="text-indigo-600 text-[10px] hover:underline">Upgrade to Access</Link>
                </div>
             )}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-3 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-1.5">
          <h4 className="font-bold text-slate-800 text-xs truncate pr-2" title={template.title}>
            {template.title}
          </h4>
          {template.is_public && (
            <span className="text-[9px] items-center bg-blue-50 text-blue-600 px-1 py-0.5 rounded border border-blue-100 hidden sm:flex shrink-0 font-medium">
               Public
            </span>
          )}
        </div>

        <div className="text-[10px] text-slate-500 mb-3 flex-grow">
           <div className="flex items-center gap-1">
               <span className="capitalize text-indigo-600 font-semibold">{template.layout_style?.replace(/_/g, " ")}</span>
               <span className="text-slate-300">•</span>
               <span>{template.certificates ? template.certificates.length : 0} issued</span>
           </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-auto">
           <div className="flex items-center gap-1.5">
               <button 
                  onClick={handleCopyId}
                  className="text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-slate-50 rounded"
                  title="Copy ID"
               >
                  {isCopied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
               </button>
               <span className="text-[9px] font-mono text-slate-400 select-all">#{template.id}</span>
           </div>
           
           {!template.is_public && (
            <button 
              onClick={() => onDeleteClick(template)}
              className="text-slate-400 hover:text-red-600 transition-colors p-1 hover:bg-red-50 rounded"
              title="Delete Template"
            >
              <Trash2 size={13} />
            </button>
           )}
        </div>
      </div>
    </div>
  );
};

export default TemplatesPage;
