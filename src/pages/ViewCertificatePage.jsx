// frontend/src/pages/ViewCertificatePage.jsx

import React, { useState, useEffect, Component, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Spinner, Modal, Button } from "react-bootstrap";
import {
  getCertificate,
  getCertificatePDF,
  updateCertificateStatus,
  getTemplates,
} from "../api";
import {
  Edit3,
  Download,
  Maximize2,
  X,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  ArrowLeft,
  Mail,
  Calendar,
  Award,
  User,
  Shield,
  Globe,
  MapPin,
  Clock,
  DollarSign,
  QrCode,
  Lock,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import TemplateRenderer from "../components/templates/TemplateRenderer";
import QRCode from "react-qr-code";

// --- ERROR BOUNDARY ---
class ErrorBoundary extends Component {
  state = { hasError: false, error: null };
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 m-4 rounded-lg">
          <h3 className="text-red-700 font-bold">Something went wrong</h3>
          <p className="text-red-600">
            {this.state.error?.message || "An error occurred."}
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

function ViewCertificatePage() {
  const { certId } = useParams();
  const navigate = useNavigate();
  const [certificate, setCertificate] = useState(null);
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [showFullscreen, setShowFullscreen] = useState(false);

  // Status Change Confirmation States
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [pendingStatus, setPendingStatus] = useState("");

  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        const response = await getCertificate(certId);
        const certData = response.data.certificate;
        const partialTemplate = response.data.template;

        setCertificate(certData);

        // Fetch full template to ensure we have all data needed for the renderer
        if (partialTemplate) {
          try {
            const templatesResponse = await getTemplates();
            const fullTemplate = templatesResponse.data.templates.find(
              (t) => t.id === partialTemplate.id
            );
            setTemplate(fullTemplate || partialTemplate);
          } catch (e) {
            setTemplate(partialTemplate);
          }
        }
      } catch (err) {
        setError(
          err.response?.data?.msg || "Could not fetch certificate details."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchCertificate();
  }, [certId]);

  const handleDownloadPDF = () => {
    setDownloading(true);
    const promise = getCertificatePDF(certId);
    toast.promise(promise, {
      loading: "Generating PDF...",
      success: (response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        const saneName = certificate.recipient_name?.replace(/[\W_]+/g, "_").replace(/^_+|_+$/g, "");
        const filename = saneName ? `${saneName}.pdf` : `doc_${certificate.verification_id}.pdf`;
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);
        return "Download started!";
      },
      error: (err) => err.response?.data?.msg || "Failed to download PDF.",
    });
    promise.finally(() => setDownloading(false));
  };

  const handleStatusChange = (status) => {
    const promise = updateCertificateStatus(certId, status);
    toast.promise(promise, {
      loading: `Updating status...`,
      success: () => {
        setCertificate((prev) => ({ ...prev, status }));
        return `Status updated to ${status}!`;
      },
      error: (err) => err.response?.data?.msg || "Failed to update status.",
    });
  };

  // Determine Type of Template (invitation vs receipt vs certificate)
  const templateType = useMemo(() => {
    if (template?.layout_style === "visual" && template?.layout_data) {
      try {
        const data = typeof template.layout_data === "string" 
          ? JSON.parse(template.layout_data) 
          : template.layout_data;
        return data.type || "certificate";
      } catch (e) {
        return "certificate";
      }
    }
    if (template?.layout_style === "receipt") return "receipt";
    if (template?.layout_style === "invitation") return "invitation";
    return "certificate";
  }, [template]);

  const isInvitation = templateType === "invitation";
  const isReceipt = templateType === "receipt";

  const InfoRow = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0">
      <div className={`p-2 rounded-lg shrink-0 border ${
        isInvitation 
          ? "bg-rose-50 text-rose-600 border-rose-100" 
          : isReceipt
          ? "bg-emerald-50 text-emerald-600 border-emerald-100"
          : "bg-indigo-50 text-indigo-650 border-indigo-100"
      }`}>
        <Icon size={16} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
          {label}
        </p>
        <p className="text-slate-800 font-bold text-xs break-all leading-normal">
          {value}
        </p>
      </div>
    </div>
  );

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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 bg-gray-100 border border-gray-200 rounded-xl h-96" />
          <div className="lg:col-span-4 bg-gray-100 border border-gray-200 rounded-xl h-96" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center shadow-xs">
          <AlertCircle size={44} className="mx-auto text-red-500 mb-3" />
          <h3 className="text-base font-bold text-red-700 uppercase tracking-wide">
            Error Loading Document
          </h3>
          <p className="text-xs text-red-600 mb-4 font-medium">{error}</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg transition-all"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const isValid = certificate.status === "valid";

  return (
    <ErrorBoundary>
      <Toaster position="top-right" />
      <div className="w-full pb-12">
        
        {/* --- 1. Top Navigation Bar (Header - Locked to Top) --- */}
        <div className="border-b border-slate-200/80 bg-white mb-6 -mt-6 -mx-4 sm:-mx-6 md:-mx-8 px-4 sm:px-6 md:px-8 py-3">
          <div className="flex items-center justify-between gap-4 max-w-[1600px] mx-auto">
            {/* Left Page Title & Status */}
            <div className="flex items-center gap-3">
              <Link
                to="/dashboard"
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
              >
                <ArrowLeft size={16} />
              </Link>
              <div className="flex items-center gap-2.5">
                <h1 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-0">
                  {isInvitation 
                    ? "Invitation Details" 
                    : isReceipt 
                    ? "Receipt Details" 
                    : "Certificate Details"
                  }
                </h1>
                
                {/* Modern Status Badge */}
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider flex items-center gap-1.5 border shadow-xs ${
                    isValid
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200/70"
                      : "bg-red-50 text-red-700 border-red-200/70"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    isValid ? "bg-emerald-500 animate-status-pulse" : "bg-red-500"
                  }`} />
                  {certificate.status}
                </span>
              </div>
            </div>

            {/* Top Right Action Buttons */}
            <div className="flex gap-2">
              {isValid ? (
                <button
                  onClick={() => { setPendingStatus("revoked"); setShowStatusModal(true); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg border border-red-200/60 transition-all text-xs font-bold bg-white cursor-pointer"
                >
                  <RefreshCw size={13} />
                  <span>Revoke</span>
                </button>
              ) : (
                <button
                  onClick={() => { setPendingStatus("valid"); setShowStatusModal(true); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg border border-emerald-200/60 transition-all text-xs font-bold bg-white cursor-pointer"
                >
                  <RefreshCw size={13} className="animate-spin-slow" />
                  <span>Re-validate</span>
                </button>
              )}

              <button
                onClick={() => navigate(`/dashboard/edit/${certId}`)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-slate-700 hover:bg-slate-50 rounded-lg border border-slate-250 transition-all text-xs font-bold bg-white cursor-pointer"
              >
                <Edit3 size={13} />
                <span>Edit</span>
              </button>

              <button
                onClick={handleDownloadPDF}
                disabled={downloading}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-white rounded-lg transition-all text-xs font-bold shadow-sm disabled:opacity-70 cursor-pointer ${
                  isInvitation 
                    ? "bg-rose-500 hover:bg-rose-600" 
                    : isReceipt 
                    ? "bg-emerald-600 hover:bg-emerald-700" 
                    : "bg-indigo-600 hover:bg-indigo-700"
                }`}
              >
                {downloading ? (
                  <div className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <Download size={13} />
                )}
                <span>Download PDF</span>
              </button>
            </div>
          </div>
        </div>

        {/* --- 2. Main Bento Grid Content --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN: DOCUMENT PREVIEW CONTAINER (col-span-8) */}
          <div className="lg:col-span-8">
            <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-8 flex flex-col items-center shadow-inner min-h-[450px] justify-center">
              <div className="w-full relative shadow-2xl rounded-xl overflow-hidden bg-white max-w-2xl border border-slate-200/50">
                <TemplateRenderer 
                  template={template} 
                  formData={certificate}
                />
              </div>

              <button
                onClick={() => setShowFullscreen(true)}
                className="mt-6 flex items-center gap-1.5 text-slate-500 hover:text-indigo-650 text-xs font-semibold transition-all border border-slate-200/60 hover:border-indigo-200 bg-white shadow-xs px-3.5 py-1.5 rounded-lg hover:shadow-sm cursor-pointer"
              >
                <Maximize2 size={13} />
                <span>View Fullscreen</span>
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: METADATA DETAILS (col-span-4) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Bento metadata card */}
            <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4">
              <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-3 pb-2 border-b border-slate-100 flex items-center gap-1.5">
                <User className="text-slate-400" size={14} />
                <span>
                  {isInvitation 
                    ? "Guest Details" 
                    : isReceipt 
                    ? "Transaction Details" 
                    : "Recipient Details"
                  }
                </span>
              </h3>
              
              <div className="space-y-0.5">
                <InfoRow
                  icon={User}
                  label={isInvitation ? "Guest Name" : isReceipt ? "Payer Name" : "Recipient Name"}
                  value={certificate.recipient_name}
                />
                
                <InfoRow
                  icon={Mail}
                  label="Email Address"
                  value={certificate.recipient_email || "No email assigned"}
                />
                
                <InfoRow
                  icon={isInvitation ? Calendar : isReceipt ? FileText : Award}
                  label={isInvitation ? "Event Title" : isReceipt ? "Payment Description" : "Course / Program"}
                  value={certificate.course_title}
                />

                {isReceipt && certificate.extra_fields?.amount && (
                  <InfoRow
                    icon={DollarSign}
                    label="Transaction Amount"
                    value={`$${certificate.extra_fields.amount}`}
                  />
                )}
                
                <InfoRow
                  icon={Calendar}
                  label={isInvitation ? "Event Date" : isReceipt ? "Payment Date" : "Issue Date"}
                  value={new Date(certificate.issue_date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric'})}
                />
                
                <InfoRow
                  icon={isInvitation ? Clock : Shield}
                  label={isInvitation ? "Event Start Time" : "Issued By / Authority"}
                  value={isInvitation ? (certificate.signature || "TBA") : certificate.issuer_name}
                />
              </div>
            </div>

            {/* Bento Verification QR card */}
            <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 text-center">
              <h3 className="font-bold text-slate-850 text-xs uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 text-left flex items-center gap-1.5">
                <QrCode className="text-slate-400" size={14} />
                <span>Secure Verification</span>
              </h3>
              
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 inline-block mb-4 shadow-inner">
                <QRCode
                  value={`${window.location.origin}/verify/${certificate.verification_id}`}
                  size={120}
                  className="mix-blend-multiply"
                />
              </div>
              
              <div className="bg-slate-50 rounded-xl p-3 mb-4 border border-slate-200/50 text-left">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                  <Lock size={10} />
                  <span>Ledger Hash ID</span>
                </p>
                <code className="text-xs font-mono text-indigo-650 select-all font-bold break-all leading-normal block">
                  {certificate.verification_id}
                </code>
              </div>

              <a
                href={`${window.location.origin}/verify/${certificate.verification_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-center gap-2 w-full py-2 border rounded-xl font-bold transition-all text-xs cursor-pointer ${
                  isInvitation 
                    ? "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100/50" 
                    : isReceipt 
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/50" 
                    : "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100/50"
                }`}
              >
                <Globe size={13} />
                <span>Open Public Verification Page</span>
              </a>
            </div>

          </div>
        </div>

        {/* Fullscreen Preview Modal */}
        <Modal
          show={showFullscreen}
          onHide={() => setShowFullscreen(false)}
          size="xl"
          centered
          dialogClassName="modal-fullscreen"
          contentClassName="bg-transparent border-0"
        >
          <div className="relative w-full max-w-7xl mx-auto p-4">
            <button
              onClick={() => setShowFullscreen(false)}
              className="absolute top-0 right-0 text-white hover:text-gray-300 z-50 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all cursor-pointer"
            >
              <X size={20} />
            </button>
            <div className="shadow-2xl rounded-xl overflow-hidden bg-white border border-slate-200/60 mt-8">
              <TemplateRenderer 
                template={template} 
                formData={certificate}
                isFullscreen={true}
              />
            </div>
          </div>
        </Modal>

        {/* Revoke/Revalidate Confirmation Dialog Modal */}
        <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)} centered>
          <Modal.Header closeButton className="border-0 pb-0">
            <Modal.Title className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              {pendingStatus === "revoked" ? "Revoke Document" : "Re-validate Document"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="pt-2 pb-3">
            <div className="flex gap-3">
              <div className={`p-2.5 rounded-xl shrink-0 flex items-center justify-center border ${
                pendingStatus === "revoked" 
                  ? "bg-red-50 text-red-650 border-red-100" 
                  : "bg-emerald-50 text-emerald-650 border-emerald-100"
              }`}>
                <RefreshCw size={20} className={pendingStatus === "revoked" ? "" : "animate-spin-slow"} />
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  {pendingStatus === "revoked" 
                    ? "Are you sure you want to revoke this document? This will immediately invalidate the verification QR code and display a 'REVOKED' warning on the public verification page."
                    : "Are you sure you want to re-validate this document? This will restore its status to valid on the secure ledger and public verification pages."
                  }
                </p>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer className="border-0 pt-0 flex gap-2">
            <button
              onClick={() => setShowStatusModal(false)}
              className="px-3.5 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-transparent transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                handleStatusChange(pendingStatus);
                setShowStatusModal(false);
              }}
              className={`px-3.5 py-1.5 text-xs font-bold text-white rounded-lg border border-transparent transition-all cursor-pointer ${
                pendingStatus === "revoked" ? "bg-red-600 hover:bg-red-700" : "bg-emerald-600 hover:bg-emerald-700"
              }`}
            >
              {pendingStatus === "revoked" ? "Confirm Revoke" : "Confirm Re-validate"}
            </button>
          </Modal.Footer>
        </Modal>

      </div>
    </ErrorBoundary>
  );
}

export default ViewCertificatePage;
