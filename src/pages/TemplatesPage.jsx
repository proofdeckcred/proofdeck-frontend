import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
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
  <div>
    <label className="block text-gray-700 font-semibold mb-1.5 text-sm">
      {label}
    </label>
    <input
      {...props}
      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow text-sm"
    />
  </div>
);

const FormSelect = ({ label, options, ...props }) => (
  <div>
    <label className="block text-gray-700 font-semibold mb-1.5 text-sm">
      {label}
    </label>
    <select
      {...props}
      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
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
  <div>
    <label className="block text-gray-500 text-xs font-medium mb-1 uppercase tracking-wide">
      {label}
    </label>
    <div className="flex items-center gap-2 border border-gray-300 rounded-lg p-1 bg-white">
      <input
        type="color"
        {...props}
        className="w-8 h-8 rounded cursor-pointer border-0 p-0"
      />
      <span className="text-xs font-mono text-gray-600 flex-grow">
        {props.value}
      </span>
    </div>
  </div>
);

const FormFileInput = ({ label, ...props }) => (
  <div>
    <label className="block text-gray-700 font-semibold mb-1.5 text-sm">
      {label}
    </label>
    <input
      type="file"
      {...props}
      accept="image/*"
      className="block w-full text-sm text-gray-500
        file:mr-4 file:py-2 file:px-4
        file:rounded-md file:border-0
        file:text-sm file:font-semibold
        file:bg-indigo-50 file:text-indigo-700
        hover:file:bg-indigo-100 cursor-pointer"
    />
  </div>
);

function TemplatesPage() {
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
      Object.keys(editFormData).forEach((key) => {
        if (
          key !== "logo_url" &&
          key !== "background_url" &&
          editFormData[key]
        ) {
          data.append(key, editFormData[key]);
        }
      });
      try {
        await updateTemplate(editFormData.id, data);
        setShowEditModal(false);
        fetchTemplates();
        resolve();
      } catch (err) {
        reject(err);
      }
    });
    toast.promise(promise, {
      loading: "Updating...",
      success: "Template updated!",
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
    <div className="max-w-7xl mx-auto pb-12">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Templates</h2>
          <p className="text-gray-500 mt-1">
            Design and manage your certificate layouts.
          </p>
        </div>
        <Link
          to="/dashboard/upload-template"
          className="inline-flex items-center justify-center bg-indigo-600 text-white rounded-lg py-2.5 px-5 hover:bg-indigo-700 transition-colors font-medium shadow-sm"
        >
          <Brush size={18} className="mr-2" />
          Open Visual Editor
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
        {/* Creator Form */}
        <div className="col-span-12 lg:col-span-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
              <LayoutTemplate size={20} className="text-indigo-600" />
              <h3 className="text-lg font-bold text-gray-900">
                Standard Creator
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
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
              <div className="grid grid-cols-1 gap-4">
                <FormSelect
                  label="Font"
                  name="font_family"
                  value={formData.font_family}
                  onChange={handleInputChange}
                  options={fontOptions}
                />
              </div>

              <div className="space-y-3">
                <label className="block text-gray-700 font-semibold text-sm">
                  Colors
                </label>
                <div className="grid grid-cols-3 gap-3">
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

              <div className="space-y-4 pt-2">
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

              <div className="grid grid-cols-2 gap-4 pt-2">
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
                className="w-full bg-gray-900 text-white rounded-lg py-3 font-semibold hover:bg-black transition-all shadow-md mt-4 flex items-center justify-center gap-2"
              >
                <Plus size={18} /> Create Template
              </button>
            </form>
          </div>
        </div>

        {/* Live Preview - Sticky */}
        <div className="col-span-12 lg:col-span-8">
          <div className="bg-gray-100 rounded-xl border border-gray-200 p-6 sticky top-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2 text-gray-700 font-bold">
                <Eye size={18} />
                <h4>Live Preview</h4>
              </div>
              <button
                onClick={() => setIsFullscreen(true)}
                className="p-2 text-gray-500 hover:text-gray-900 hover:bg-white rounded-lg transition-all shadow-sm"
              >
                <Maximize2 size={18} />
              </button>
            </div>
            <div className="w-full flex justify-center">
              <div className="w-full max-w-2xl bg-white shadow-xl rounded overflow-hidden">
                <TemplateRenderer template={previewData} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Templates List */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <div className="w-1 h-6 bg-indigo-600 rounded-full"></div>
          Your Library
        </h3>

        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner animation="border" />
          </div>
        ) : templates.length > 0 ? (
          <div className="space-y-8">
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
              <div className="flex justify-center pt-4">
                <button 
                  onClick={() => setShowAllLibrary(!showAllLibrary)}
                  className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2 rounded-full text-sm font-semibold transition-all shadow-sm flex items-center gap-2"
                >
                  {showAllLibrary ? <X size={16} /> : <Plus size={16} />}
                  {showAllLibrary ? "Show Less" : `View All Templates (${templates.length})`}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-500">
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
      >
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="font-bold">Edit Template</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-6">
          <form
            id="edit-form"
            onSubmit={handleEditSubmit}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <FormInput
                  label="Name"
                  name="title"
                  value={currentFormState?.title}
                  onChange={handleInputChange}
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                     <TemplateSelector
                      value={currentFormState?.layout_style}
                      onChange={(val) => handleInputChange({ target: { name: 'layout_style', value: val } })}
                      options={layoutOptions}
                    />
                  </div>
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
              <div className="space-y-4">
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
          <Button variant="light" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" form="edit-form">
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Modal */}
      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
      >
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="text-red-600 font-bold">
            Delete Template?
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete{" "}
          <strong>{templateToDelete?.title}</strong>?
          <br />
          This action cannot be undone.
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="light" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm}>
            Delete Forever
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Fullscreen Preview */}
      {isFullscreen && (
        <div
          className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center p-4"
          onClick={() => setIsFullscreen(false)}
        >
          <button className="absolute top-6 right-6 text-white hover:text-gray-300 transition-colors">
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow overflow-hidden group flex flex-col h-full">
      {/* Thumbnail Area */}
      <div className="relative h-48 bg-gray-100 overflow-hidden border-b border-gray-100">
        
        {/* PREMIUM BADGE */}
        {template.is_premium && (
            <div className="absolute top-3 right-3 z-10 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm flex items-center gap-1 uppercase tracking-wide">
                <Award size={10} fill="currentColor" /> Premium
            </div>
        )}

        {/* Visual Preview */}
        <div className="w-full h-full relative">
             {/* Scaled down renderer */}
             <div className="w-[200%] h-[200%] origin-top-left transform scale-50 pointer-events-none select-none">
                 <TemplateRenderer template={template} />
             </div>
             {/* Overlay to prevent interaction */}
             <div className="absolute inset-0 bg-transparent group-hover:bg-black/5 transition-colors" />
        </div>

        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-[1px]">
             {(!template.is_premium || isPro) ? (
                <button 
                    onClick={() => onEditClick(template)}
                    className="bg-white text-gray-900 rounded-lg py-2 px-4 font-medium text-sm shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all hover:bg-gray-50 flex items-center gap-2"
                >
                    <Edit size={16} /> Edit Design
                </button>
             ) : (
                <div className="bg-white/95 text-gray-900 rounded-lg py-3 px-5 font-bold text-sm shadow-2xl flex flex-col items-center gap-2">
                    <Award className="text-yellow-600" size={24} />
                    <span>Premium Template</span>
                    <Link to="/pricing" className="text-indigo-600 text-xs hover:underline mt-1">Upgrade to Access</Link>
                </div>
             )}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-bold text-gray-900 truncate pr-2" title={template.title}>
            {template.title}
          </h4>
          {template.is_public && (
            <span className="text-[10px] items-center gap-1 bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100 hidden sm:flex shrink-0">
               Public
            </span>
          )}
        </div>

        <div className="text-xs text-gray-500 mb-4 flex-grow">
           <div className="flex items-center gap-1 mb-1">
               <span className="capitalize text-indigo-600 font-semibold">{template.layout_style?.replace(/_/g, " ")}</span>
               <span className="text-gray-300">•</span>
               <span>{template.certificates ? template.certificates.length : 0} issued</span>
           </div>
           {template.is_premium && <p className="text-yellow-600 font-medium text-xs flex items-center gap-1"><Award size={12}/> Premium Template</p>}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-auto">
           <div className="flex items-center gap-2">
               <button 
                  onClick={handleCopyId}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-50 rounded"
                  title="Copy ID"
               >
                  {isCopied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
               </button>
               <span className="text-[10px] font-mono text-gray-400 select-all">#{template.id}</span>
           </div>
           
           {!template.is_public && (
            <button 
              onClick={() => onDeleteClick(template)}
              className="text-gray-400 hover:text-red-600 transition-colors p-1 hover:bg-red-50 rounded"
              title="Delete Template"
            >
              <Trash2 size={16} />
            </button>
           )}
        </div>
      </div>
    </div>
  );
};

export default TemplatesPage;
