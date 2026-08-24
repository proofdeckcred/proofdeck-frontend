// frontend/src/pages/SendInvitationPage.jsx

import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import Papa from "papaparse";
import {
  getTemplates,
  createCertificate,
  bulkCreateCertificates,
  getGroups,
  createGroup,
} from "../api";
import TemplateRenderer from "../components/templates/TemplateRenderer";
import { SERVER_BASE_URL } from "../config";
import {
  Calendar,
  Maximize2,
  X,
  ArrowLeft,
  Send,
  User,
  Type,
  FileText,
  MapPin,
  Clock,
  Loader2,
  Info,
  Plus,
  Trash2,
  UploadCloud,
  Download,
  Users,
  Mail,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { useUser } from "../context/UserContext";
import HelpGuide from "../components/HelpGuide";

// --- REUSABLE UI COMPONENTS ---
const FormInput = ({ label, icon: Icon, required, ...props }) => (
  <div className="space-y-1">
    <label className="block text-xs font-semibold text-slate-705 text-slate-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative group">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
          <Icon size={14} />
        </div>
      )}
      <input
        {...props}
        className={`block w-full rounded border border-slate-200 bg-white py-1.5 text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none transition-all duration-200 text-xs shadow-sm ${
          Icon ? "pl-8" : "px-2.5"
        }`}
      />
    </div>
  </div>
);

const SendInvitationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Active Modes: "single" or "bulk"
  const [creationMode, setCreationMode] = useState("single");

  // Core Form State
  const [formData, setFormData] = useState({
    template_id: "",
    recipient_name: "", // Guest Name
    recipient_email: "", // Guest Email
    course_title: "", // Event Title
    issuer_name: "", // Venue / Location
    issue_date: new Date().toLocaleDateString("en-CA"), // Event Date
    signature: "", // Event Time / Hour
    extra_fields: {},
  });

  // Bulk States
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [newGroupName, setNewGroupName] = useState("");
  const [bulkFile, setBulkFile] = useState(null);
  const [bulkPreviewData, setBulkPreviewData] = useState([]);
  const [bulkSubmitting, setBulkSubmitting] = useState(false);

  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showFullscreen, setShowFullscreen] = useState(false);
  
  const { user } = useUser();
  const isPro = user?.role === 'pro' || user?.role === 'enterprise';

  // Toggle Mode via Query params or Paths
  useEffect(() => {
    if (location.pathname.includes("bulk") || location.search.includes("mode=bulk")) {
      setCreationMode("bulk");
    } else {
      setCreationMode("single");
    }
  }, [location]);

  // Initial Data fetch (Templates and Groups)
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [templateResponse, groupResponse] = await Promise.all([
          getTemplates(),
          getGroups(),
        ]);
        
        // Filter templates to only include custom visual layouts created as "invitation" type
        const invitationPresets = templateResponse.data.templates.filter((t) => {
          if (t.layout_style === "visual") {
            if (t.layout_data) {
              const data = typeof t.layout_data === "string" ? JSON.parse(t.layout_data) : t.layout_data;
              return data.type === "invitation";
            }
          }
          return false;
        });

        setTemplates(invitationPresets);
        setGroups(groupResponse.data.groups);
      } catch (err) {
        setError("Could not fetch data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleTemplateChange = (val) => {
    const templateId = val;
    const template = templates.find((t) => String(t.id) === String(templateId));
    
    if (template?.is_premium && !isPro) {
      toast.error("This is a Premium Template. Please upgrade your account to use it.");
      return;
    }

    setFormData({ ...formData, template_id: templateId });
    setSelectedTemplate(template || null);
  };

  // Single Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const promise = createCertificate(formData);

    toast.promise(promise, {
      loading: "Sending invitation...",
      success: (response) => {
        setTimeout(() => navigate("/dashboard"), 1500);
        return "Invitation sent successfully!";
      },
      error: (err) => {
        setSubmitting(false);
        return err.response?.data?.msg || "Failed to send invitation.";
      },
    });
  };

  // Bulk File Upload Parsing (CSV)
  const handleBulkFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setBulkPreviewData([]);

    if (selectedFile) {
      setBulkFile(selectedFile);
      if (selectedFile.name.toLowerCase().endsWith(".csv")) {
        Papa.parse(selectedFile, {
          header: true,
          skipEmptyLines: true,
          complete: (result) => {
            if (result.errors.length > 0) {
              toast.error("Could not parse CSV file.");
              return;
            }
            // Normalize columns: map guest_name to recipient_name, venue to issuer_name, event to course_title
            const normalizedData = result.data.map((row) => {
              const newRow = {};
              Object.keys(row).forEach((key) => {
                let newKey = key.trim().toLowerCase().replace(/ /g, "_");
                if (["guest_name", "name", "guest", "full_name"].includes(newKey))
                  newKey = "recipient_name";
                if (["event", "event_title", "title"].includes(newKey))
                  newKey = "course_title";
                if (["venue", "location", "hall"].includes(newKey))
                  newKey = "issuer_name";
                if (["time", "hour"].includes(newKey))
                  newKey = "signature";
                if (["date", "event_date"].includes(newKey))
                  newKey = "issue_date";
                newRow[newKey] = row[key];
              });
              return newRow;
            });
            
            setBulkPreviewData(normalizedData);
            
            // Auto load first row data into active form state for dynamic WYSIWYG preview!
            if (normalizedData.length > 0) {
              const firstRow = normalizedData[0];
              setFormData((prev) => ({
                ...prev,
                recipient_name: firstRow.recipient_name || "Guest Name",
                course_title: firstRow.course_title || "Event Title",
                issuer_name: firstRow.issuer_name || "Event Venue",
                issue_date: firstRow.issue_date || prev.issue_date,
                signature: firstRow.signature || "Event Time",
              }));
            }
          },
          error: () => toast.error("Failed to parse CSV file."),
        });
      } else {
        toast.error("Please upload a valid CSV file.");
      }
    }
  };

  // Create group inline
  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return toast.error("Please enter a group name.");
    try {
      const res = await createGroup(newGroupName);
      const newGroup = res.data.group;
      setGroups((prev) => [newGroup, ...prev]);
      setSelectedGroupId(newGroup.id);
      setNewGroupName("");
      toast.success("Group created!");
    } catch (err) {
      toast.error("Failed to create group.");
    }
  };

  // Download CSV sample template
  const handleDownloadTemplate = () => {
    window.open(`${SERVER_BASE_URL}/api/certificates/bulk-template`, "_blank");
  };

  // Bulk Form submission
  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    if (!formData.template_id || !bulkFile || !selectedGroupId) {
      toast.error("Please fill all required fields.");
      return;
    }
    setBulkSubmitting(true);

    const data = new FormData();
    data.append("template_id", formData.template_id);
    data.append("file", bulkFile);
    data.append("group_id", selectedGroupId);

    const promise = bulkCreateCertificates(data);
    toast.promise(promise, {
      loading: "Processing bulk invitations...",
      success: (response) => {
        setTimeout(() => navigate("/dashboard"), 1500);
        return "Bulk invitations sent successfully!";
      },
      error: (err) => {
        setBulkSubmitting(false);
        return err.response?.data?.msg || "Bulk invitation delivery failed.";
      },
    });
  };

  if (loading) {
    return (
      <div className="w-full pb-12 animate-pulse">
        {/* Navigation Header Skeleton */}
        <div className="border-b border-slate-200/80 bg-white mb-6 -mt-6 -mx-4 sm:-mx-6 md:-mx-8 px-4 sm:px-6 md:px-8 py-3">
          <div className="flex justify-between items-center max-w-[1600px] mx-auto h-8">
            <div className="w-1/3 bg-gray-200 h-4 rounded" />
            <div className="w-1/4 bg-gray-200 h-6 rounded" />
          </div>
        </div>
        {/* Body Skeletons */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-4 bg-gray-100 border border-gray-200 rounded-xl h-96" />
          <div className="lg:col-span-8 bg-gray-100 border border-gray-200 rounded-xl h-96" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full pb-12">
      <Toaster position="top-right" />

      {/* --- 1. Top Navigation Bar (Header - Locked to Top) --- */}
      <div className="border-b border-slate-200/80 bg-white mb-6 -mt-6 -mx-4 sm:-mx-6 md:-mx-8 px-4 sm:px-6 md:px-8 py-3">
        <div className="flex items-center justify-between gap-4 max-w-[1600px] mx-auto">
          {/* Left: Page Title */}
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
            >
              <ArrowLeft size={16} />
            </Link>
            <div>
              <h1 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-0">
                Send Invitations
              </h1>
            </div>
          </div>
          
          <HelpGuide type="invitations" />
        </div>
      </div>

      {/* --- 2. Main Bento Grid Content --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: FORM DETAILS (col-span-4) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            
            {/* Segmented Mode Selector Pills */}
            <div className="bg-slate-100/80 p-1 rounded-xl flex gap-1 mb-6 border border-slate-200/40">
              <button
                type="button"
                onClick={() => setCreationMode("single")}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold rounded-lg transition-all decoration-none ${
                  creationMode === "single"
                    ? "bg-white text-slate-900 shadow-sm border border-slate-200/30"
                    : "text-slate-500 hover:text-slate-850"
                }`}
              >
                <User size={13} />
                <span>Single Guest</span>
              </button>
              <button
                type="button"
                onClick={() => setCreationMode("bulk")}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold rounded-lg transition-all decoration-none ${
                  creationMode === "bulk"
                    ? "bg-white text-slate-900 shadow-sm border border-slate-200/30"
                    : "text-slate-500 hover:text-slate-850"
                }`}
              >
                <Users size={13} />
                <span>Bulk Import (CSV)</span>
              </button>
            </div>

            {/* Template Selector dropdown (only lists Invitation designs) */}
            {templates.length === 0 ? (
              <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl text-center text-xs text-indigo-700 mb-4">
                <Info className="mx-auto mb-1.5" size={16} />
                <span>No invitation templates found. Create one first in the Visual Editor (choose Invitation type).</span>
                <Link to="/dashboard/templates" className="block mt-2 font-bold hover:underline">
                  Go to Templates &rarr;
                </Link>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Select Invitation Template *</label>
                <select
                  value={formData.template_id}
                  onChange={(e) => handleTemplateChange(e.target.value)}
                  className="block w-full rounded border border-slate-200 bg-white py-1.5 px-2.5 text-slate-800 focus:border-indigo-500 focus:outline-none transition-all duration-200 text-xs shadow-sm mb-4"
                  required
                >
                  <option value="">-- Choose Template --</option>
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>{t.title}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Render Form based on Active Mode */}
            {creationMode === "single" ? (
              <form onSubmit={handleSubmit} className="space-y-3.5">
                <FormInput
                  name="recipient_name"
                  label="Guest Name"
                  icon={User}
                  placeholder="e.g., Guest Name"
                  required
                  value={formData.recipient_name}
                  onChange={handleChange}
                />

                <FormInput
                  name="recipient_email"
                  label="Guest Email (Optional)"
                  icon={Type}
                  type="email"
                  placeholder="guest@example.com"
                  value={formData.recipient_email}
                  onChange={handleChange}
                />

                <FormInput
                  name="course_title"
                  label="Event Name / Title"
                  icon={FileText}
                  placeholder="e.g., Annual Gala Night"
                  required
                  value={formData.course_title}
                  onChange={handleChange}
                />

                <FormInput
                  name="issuer_name"
                  label="Venue / Location"
                  icon={MapPin}
                  placeholder="e.g., Grand Palace Hall"
                  required
                  value={formData.issuer_name}
                  onChange={handleChange}
                />

                <div className="grid grid-cols-2 gap-3">
                  <FormInput
                    name="issue_date"
                    label="Event Date"
                    icon={Calendar}
                    type="date"
                    required
                    value={formData.issue_date}
                    onChange={handleChange}
                  />
                  <FormInput
                    name="signature"
                    label="Event Time"
                    icon={Clock}
                    placeholder="e.g., 7:00 PM"
                    required
                    value={formData.signature}
                    onChange={handleChange}
                  />
                </div>

                {error && (
                  <div className="bg-red-50 text-red-650 p-2 rounded text-xs flex items-start gap-1.5 border border-red-100">
                    <Info size={14} className="mt-0.5 flex-shrink-0" />
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting || !formData.template_id}
                  className="w-full bg-slate-900 border border-slate-900 hover:bg-black text-white text-xs font-bold py-2 px-4 rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5 disabled:opacity-75 disabled:cursor-not-allowed mt-3.5"
                >
                  {submitting ? (
                    <Loader2 className="animate-spin" size={14} />
                  ) : (
                    <Send size={14} />
                  )}
                  <span>Send Invitation</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleBulkSubmit} className="space-y-4">
                {/* Group Selector */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">Select Batch Group *</label>
                  <select
                    value={selectedGroupId}
                    onChange={(e) => setSelectedGroupId(e.target.value)}
                    className="block w-full rounded border border-slate-200 bg-white py-1.5 px-2.5 text-slate-850 focus:border-indigo-500 focus:outline-none transition-all duration-200 text-xs shadow-sm"
                    required
                  >
                    <option value="">-- Choose Batch --</option>
                    {groups.map((g) => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </div>

                {/* Quick group creation inline */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60 space-y-2">
                  <label className="block text-[9px] font-bold text-slate-405 uppercase tracking-wider">Or Create Batch</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. VIP Gala Cohort"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      className="flex-1 px-2.5 py-1.5 border border-slate-200 bg-white rounded-lg text-xs focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={handleCreateGroup}
                      className="bg-slate-900 hover:bg-black text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
                    >
                      Create
                    </button>
                  </div>
                </div>

                {/* File Upload Box */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">Upload Guest CSV List *</label>
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center bg-slate-50 hover:bg-slate-100/50 hover:border-slate-350 transition-all relative cursor-pointer">
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleBulkFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      required
                    />
                    <UploadCloud className="mx-auto text-slate-400 mb-2" size={24} />
                    <span className="block text-xs font-bold text-slate-800">
                      {bulkFile ? bulkFile.name : "Choose CSV File"}
                    </span>
                    <span className="block text-[9px] text-slate-400 mt-1">
                      Drag & drop or click to browse
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-[10px]">
                  <button
                    type="button"
                    onClick={handleDownloadTemplate}
                    className="text-indigo-650 font-bold hover:underline flex items-center gap-1"
                  >
                    <Download size={12} /> Download Sample CSV
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={bulkSubmitting || !bulkFile || !selectedGroupId || !formData.template_id}
                  className="w-full bg-slate-900 border border-slate-900 hover:bg-black text-white text-xs font-bold py-2.5 px-4 rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5 disabled:opacity-75 disabled:cursor-not-allowed mt-3"
                >
                  {bulkSubmitting ? <Loader2 className="animate-spin" size={14} /> : <Send size={14} />}
                  <span>Generate & Send Bulk Invitations</span>
                </button>
              </form>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: WYSIWYG LIVE PREVIEW (col-span-8) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-slate-700 text-xs flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-status-pulse" />
                <span>WYSIWYG Invitation Card Preview</span>
              </h3>
              {selectedTemplate && (
                <button
                  className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-white border border-transparent hover:border-slate-200 rounded transition-all shadow-sm bg-white/50 flex items-center gap-1.5 text-xs font-medium"
                  onClick={() => setShowFullscreen(true)}
                >
                  <Maximize2 size={14} />
                  <span>Expand</span>
                </button>
              )}
            </div>

            <div className="w-full bg-slate-50 rounded-xl border border-slate-200/60 overflow-hidden flex items-center justify-center p-4 min-h-[350px] shadow-inner">
              <div className="w-full shadow-md border border-slate-200/50 max-w-2xl transition-all duration-300">
                <TemplateRenderer
                  template={selectedTemplate}
                  formData={formData}
                />
              </div>
            </div>

            <p className="text-center text-slate-400 text-[10px] mt-3 flex items-center justify-center gap-1.5">
              <Info size={12} />
              Preview updates in real-time as you type guest or event details
            </p>
          </div>

          {/* If Bulk Mode and CSV has parsed guest rows, render the Guests List table! */}
          {creationMode === "bulk" && bulkPreviewData.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm animate-in fade-in slide-in-from-bottom-2">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 pb-2 border-b border-slate-100 flex items-center gap-1.5">
                <Users className="text-indigo-650" size={14} />
                <span>CSV Guest List Preview ({bulkPreviewData.length} total)</span>
              </h3>
              <div className="overflow-x-auto max-h-60 overflow-y-auto scrollbar-thin">
                <table className="min-w-full divide-y divide-slate-100 text-[11px]">
                  <thead className="bg-slate-50 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left font-bold text-slate-600">Guest Name</th>
                      <th className="px-3 py-2 text-left font-bold text-slate-600">Event Title</th>
                      <th className="px-3 py-2 text-left font-bold text-slate-600">Venue</th>
                      <th className="px-3 py-2 text-left font-bold text-slate-600">Time</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-100 text-slate-650">
                    {bulkPreviewData.slice(0, 5).map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="px-3 py-2 font-medium">{row.recipient_name || "-"}</td>
                        <td className="px-3 py-2">{row.course_title || "-"}</td>
                        <td className="px-3 py-2">{row.issuer_name || "-"}</td>
                        <td className="px-3 py-2">{row.signature || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {bulkPreviewData.length > 5 && (
                  <div className="text-center text-[9px] text-slate-400 mt-2 italic">
                    Showing first 5 guests.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Fullscreen Modal */}
      {showFullscreen && (
        <div
          className="fixed inset-0 bg-slate-950/90 flex items-center justify-center z-[9999] p-4"
          onClick={() => setShowFullscreen(false)}
        >
          <button
            onClick={() => setShowFullscreen(false)}
            className="absolute top-6 right-6 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-all"
          >
            <X size={24} />
          </button>

          <div
            className="w-full max-w-6xl max-h-[90vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <TemplateRenderer
              template={selectedTemplate}
              formData={formData}
              isFullscreen={true}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SendInvitationPage;
