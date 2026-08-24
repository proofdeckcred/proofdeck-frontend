import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  getTemplates,
  createCertificate,
  getCertificate,
  updateCertificate,
} from "../api";
import TemplateRenderer from "../components/templates/TemplateRenderer";
import { SERVER_BASE_URL } from "../config";
import {
  Calendar,
  Maximize2,
  X,
  ArrowLeft,
  Save,
  User,
  Type,
  FileText,
  PenTool,
  LayoutTemplate,
  Loader2,
  Info,
  DollarSign,
  Plus,
  Trash2,
} from "lucide-react";
import { Spinner } from "react-bootstrap";
import toast, { Toaster } from "react-hot-toast";
import { useUser } from "../context/UserContext";
import TemplateSelector from "../components/TemplateSelector";
import HelpGuide from "../components/HelpGuide";


// --- REUSABLE UI COMPONENTS ---
const FormInput = ({ label, icon: Icon, required, ...props }) => (
  <div className="space-y-1.5">
    <label className="block text-sm font-medium text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative group">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition-colors">
          <Icon size={18} />
        </div>
      )}
      <input
        {...props}
        className={`block w-full rounded-lg border border-gray-300 bg-white py-2.5 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all duration-200 sm:text-sm ${
          Icon ? "pl-10" : "px-3"
        }`}
      />
    </div>
  </div>
);

const FormSelect = ({ label, icon: Icon, required, children, ...props }) => (
  <div className="space-y-1.5">
    <label className="block text-sm font-medium text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative group">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition-colors">
          <Icon size={18} />
        </div>
      )}
      <select
        {...props}
        className={`block w-full rounded-lg border border-gray-300 bg-white py-2.5 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all duration-200 sm:text-sm ${
          Icon ? "pl-10" : "px-3"
        }`}
      >
        {children}
      </select>
    </div>
  </div>
);


const CreateCertificatePage = () => {
  const { certId } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!certId;
  const [formData, setFormData] = useState({
    template_id: "",
    recipient_name: "",
    recipient_email: "",
    course_title: "",
    issuer_name: "",
    issue_date: new Date().toLocaleDateString("en-CA"),
    signature: "",
    extra_fields: {},
  });
  const [customFields, setCustomFields] = useState([]);
  const [amount, setAmount] = useState("");

  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const { user } = useUser();
  const isPro = user?.role === 'pro' || user?.role === 'enterprise';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const templateResponse = await getTemplates();
        setTemplates(templateResponse.data.templates);
        if (isEditMode) {
          const certResponse = await getCertificate(certId);
          const cert = certResponse.data.certificate;
          setFormData({
            template_id: certResponse.data.template.id,
            recipient_name: cert.recipient_name,
            recipient_email: cert.recipient_email,
            course_title: cert.course_title,
            issuer_name: cert.issuer_name,
            issue_date: new Date(cert.issue_date).toLocaleDateString("en-CA"),
            signature: cert.signature,
            extra_fields: cert.extra_fields || {},
          });
          setSelectedTemplate(certResponse.data.template);

          if (cert.extra_fields?.amount) setAmount(cert.extra_fields.amount);

          const fields = Object.entries(cert.extra_fields || {})
            .filter(([key]) => key !== "amount")
            .map(([key, value]) => ({ key, value }));
          setCustomFields(fields);
        }
      } catch (err) {
        setError("Could not fetch data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [certId, isEditMode]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleTemplateChange = (e) => {
    const templateId = e.target.value;
    const template = templates.find((t) => String(t.id) === String(templateId));
    
    if (template?.is_premium && !isPro) {
        toast.error("This is a Premium Template. Please upgrade your account to use it.");
        return;
    }

    setFormData({ ...formData, template_id: templateId });
    setSelectedTemplate(template || null);
  };

  // Custom Fields Logic
  const addCustomField = () => {
    setCustomFields([...customFields, { key: "", value: "" }]);
  };

  const removeCustomField = (index) => {
    const newFields = [...customFields];
    newFields.splice(index, 1);
    setCustomFields(newFields);
  };

  const handleCustomFieldChange = (index, field, value) => {
    const newFields = [...customFields];
    newFields[index][field] = value;
    setCustomFields(newFields);
  };

  // Sync custom fields & amount
  useEffect(() => {
    const extras = {};
    if (amount) extras.amount = amount;

    customFields.forEach((field) => {
      if (field.key.trim()) {
        extras[field.key.trim()] = field.value;
      }
    });

    setFormData((prev) => ({ ...prev, extra_fields: extras }));
  }, [amount, customFields]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const promise = isEditMode
      ? updateCertificate(certId, formData)
      : createCertificate(formData);

    toast.promise(promise, {
      loading: isEditMode ? "Updating..." : "Issuing...",
      success: (response) => {
        setTimeout(() => navigate("/dashboard"), 1500);
        return response.data.msg;
      },
      error: (err) => {
        setSubmitting(false);
        return err.response?.data?.msg || "An error occurred.";
      },
    });
  };

  const isReceipt = selectedTemplate?.layout_style === "receipt";

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
            <Link
            to="/dashboard"
            className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
            >
            <ArrowLeft size={24} />
            </Link>
            <div>
            <h1 className="text-2xl font-bold text-gray-900">
                {isEditMode ? "Edit Document" : "Issue New Document"}
            </h1>
            <p className="text-gray-500 text-sm">
                Fill in the details below. Custom fields are supported.
            </p>
            </div>
        </div>
        <HelpGuide 
            title="How to Issue"
            steps={[
                "Choose a template from the visual selector.",
                "Enter recipient details (Name, Email, etc.).",
                "Add custom fields if your template needs them.",
                "Click 'Generate Document' to issue."
            ]}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: FORM */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <FileText className="text-indigo-600" size={20} />
              Details
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <TemplateSelector
                value={formData.template_id}
                onChange={(val) => handleTemplateChange({ target: { value: val } })}
                options={templates}
              />

              <div className="border-t border-gray-100 my-4"></div>

              <FormInput
                name="recipient_name"
                label={isReceipt ? "Payer Name" : "Recipient Name"}
                icon={User}
                placeholder="e.g., Jane Doe"
                required
                value={formData.recipient_name}
                onChange={handleChange}
              />

              <FormInput
                name="recipient_email"
                label="Email (Optional)"
                icon={Type}
                type="email"
                placeholder="jane@example.com"
                value={formData.recipient_email}
                onChange={handleChange}
              />

              <FormInput
                name="course_title"
                label={
                  isReceipt ? "Payment Description" : "Course / Event Title"
                }
                icon={FileText}
                placeholder={
                  isReceipt
                    ? "e.g. Web Dev Course"
                    : "e.g., Advanced React Workshop"
                }
                required
                value={formData.course_title}
                onChange={handleChange}
              />

              {isReceipt && (
                <FormInput
                  name="amount"
                  label="Amount (Total)"
                  icon={DollarSign}
                  placeholder="e.g. $500.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              )}

              <div className="grid grid-cols-2 gap-4">
                <FormInput
                  name="issue_date"
                  label={isReceipt ? "Payment Date" : "Issue Date"}
                  icon={Calendar}
                  type="date"
                  required
                  value={formData.issue_date}
                  onChange={handleChange}
                />
                <FormInput
                  name="issuer_name"
                  label="Issuer Name"
                  icon={User}
                  placeholder="e.g. Acme Inc"
                  value={formData.issuer_name}
                  onChange={handleChange}
                />
              </div>

              <FormInput
                name="signature"
                label="Signature Text (Optional)"
                icon={PenTool}
                placeholder="e.g., Dr. John Smith"
                value={formData.signature}
                onChange={handleChange}
              />

              {/* DYNAMIC FIELDS SECTION */}
              <div className="pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Additional Fields
                  </label>
                  <button
                    type="button"
                    onClick={addCustomField}
                    className="text-xs flex items-center gap-1 text-indigo-600 font-bold hover:text-indigo-800"
                  >
                    <Plus size={14} /> Add Field
                  </button>
                </div>

                {customFields.length > 0 ? (
                  <div className="space-y-3">
                    {customFields.map((field, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <input
                          placeholder="Label"
                          className="w-1/3 px-2 py-1.5 border rounded text-sm"
                          value={field.key}
                          onChange={(e) =>
                            handleCustomFieldChange(
                              index,
                              "key",
                              e.target.value
                            )
                          }
                        />
                        <input
                          placeholder="Value"
                          className="flex-1 px-2 py-1.5 border rounded text-sm"
                          value={field.value}
                          onChange={(e) =>
                            handleCustomFieldChange(
                              index,
                              "value",
                              e.target.value
                            )
                          }
                        />
                        <button
                          type="button"
                          onClick={() => removeCustomField(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic">
                    No custom fields added.
                  </p>
                )}
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-start gap-2">
                  <Info size={16} className="mt-0.5 flex-shrink-0" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow disabled:opacity-70 disabled:cursor-not-allowed mt-4"
              >
                {submitting ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <Save size={20} />
                )}
                <span>{isEditMode ? "Update" : "Generate Document"}</span>
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: PREVIEW */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                Live Preview
              </h3>
              {selectedTemplate && (
                <button
                  className="text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 p-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                  onClick={() => setShowFullscreen(true)}
                >
                  <Maximize2 size={18} />
                  <span>Expand</span>
                </button>
              )}
            </div>

            <div className="w-full bg-gray-100 rounded-lg border border-gray-200 overflow-hidden flex items-center justify-center p-4 min-h-[400px]">
              <div className="w-full shadow-xl transition-all duration-300">
                <TemplateRenderer
                  template={selectedTemplate}
                  formData={formData}
                />
              </div>
            </div>

            <p className="text-center text-gray-400 text-sm mt-4 flex items-center justify-center gap-2">
              <Info size={14} />
              Preview updates in real-time as you type
            </p>
          </div>
        </div>
      </div>

      {/* Fullscreen Modal */}
      {showFullscreen && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 md:p-8"
          onClick={() => setShowFullscreen(false)}
        >
          <button
            onClick={() => setShowFullscreen(false)}
            className="absolute top-6 right-6 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all"
          >
            <X size={32} />
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

export default CreateCertificatePage;
