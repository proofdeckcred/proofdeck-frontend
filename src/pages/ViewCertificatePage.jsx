import React, { useState, useEffect, Component } from "react";
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
        <div className="bg-red-50 border-l-4 border-red-500 p-4 m-4">
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

  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        const response = await getCertificate(certId);
        const certData = response.data.certificate;
        const partialTemplate = response.data.template;

        setCertificate(certData);

        // Always fetch full template to ensure we have all data needed for the renderer
        if (partialTemplate) {
           try {
               const templatesResponse = await getTemplates();
               // Find matching template or fallback to partial
               const fullTemplate = templatesResponse.data.templates.find(
                  (t) => t.id === partialTemplate.id
               );
               setTemplate(fullTemplate || partialTemplate);
           } catch (e) {
               // Fallback if getTemplates fails (search specific one?)
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
        link.setAttribute(
          "download",
          `certificate_${certificate.verification_id}.pdf`
        );
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
        return `Certificate ${
          status === "valid" ? "re-validated" : "revoked"
        }!`;
      },
      error: (err) => err.response?.data?.msg || "Failed to update status.",
    });
  };

  const InfoRow = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
      <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
        <Icon size={18} />
      </div>
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-0.5">
          {label}
        </p>
        <p className="text-gray-900 font-medium text-sm break-all">{value}</p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle size={48} className="mx-auto text-red-500 mb-3" />
          <h3 className="text-lg font-bold text-red-700">
            Error Loading Certificate
          </h3>
          <p className="text-red-600 mb-4">{error}</p>
          <Button
            variant="outline-danger"
            onClick={() => navigate("/dashboard")}
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const isValid = certificate.status === "valid";

  return (
    <ErrorBoundary>
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto pb-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            to="/dashboard"
            className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <ArrowLeft size={24} />
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">
                Certificate Details
              </h1>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase flex items-center gap-1 ${
                  isValid
                    ? "bg-green-100 text-green-700 border border-green-200"
                    : "bg-red-100 text-red-700 border border-red-200"
                }`}
              >
                {isValid ? (
                  <CheckCircle size={12} />
                ) : (
                  <AlertCircle size={12} />
                )}
                {certificate.status}
              </span>
            </div>
            <p className="text-gray-500 text-sm">
              Issued on {new Date(certificate.issue_date).toLocaleDateString()}
            </p>
          </div>

          <div className="flex gap-2">
            {isValid ? (
              <button
                onClick={() => handleStatusChange("revoked")}
                className="hidden sm:flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg border border-red-200 transition-colors text-sm font-medium"
              >
                <RefreshCw size={16} /> Revoke
              </button>
            ) : (
              <button
                onClick={() => handleStatusChange("valid")}
                className="hidden sm:flex items-center gap-2 px-4 py-2 text-green-600 hover:bg-green-50 rounded-lg border border-green-200 transition-colors text-sm font-medium"
              >
                <RefreshCw size={16} /> Re-validate
              </button>
            )}

            <button
              onClick={() => navigate(`/dashboard/edit/${certId}`)}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg border border-gray-300 transition-colors text-sm font-medium"
            >
              <Edit3 size={16} /> Edit
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg transition-colors text-sm font-medium shadow-sm disabled:opacity-70"
            >
              {downloading ? <Spinner size="sm" /> : <Download size={16} />}
              Download PDF
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Preview */}
          <div className="lg:col-span-2">
            <div className="bg-gray-100 rounded-xl border border-gray-200 p-6 flex flex-col items-center">
              <div
                className="w-full relative shadow-2xl rounded-lg overflow-hidden bg-white"
              >
                 <TemplateRenderer 
                    template={template} 
                    formData={certificate}
                 />
              </div>

              <button
                onClick={() => setShowFullscreen(true)}
                className="mt-4 flex items-center gap-2 text-gray-500 hover:text-indigo-600 text-sm font-medium transition-colors"
              >
                <Maximize2 size={16} /> View Fullscreen
              </button>
            </div>
          </div>

          {/* Right Column: Details */}
          <div className="lg:col-span-1 space-y-6">
            {/* Metadata Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                Recipient Details
              </h3>
              <div className="space-y-1">
                <InfoRow
                  icon={User}
                  label="Recipient Name"
                  value={certificate.recipient_name}
                />
                <InfoRow
                  icon={Mail}
                  label="Email Address"
                  value={certificate.recipient_email || "N/A"}
                />
                <InfoRow
                  icon={Award}
                  label="Course / Event"
                  value={certificate.course_title}
                />
                <InfoRow
                  icon={Calendar}
                  label="Issue Date"
                  value={new Date(certificate.issue_date).toLocaleDateString()}
                />
                <InfoRow
                  icon={Shield}
                  label="Issued By"
                  value={certificate.issuer_name}
                />
              </div>
            </div>

            {/* Verification Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
              <h3 className="font-bold text-gray-900 mb-4">Verification</h3>
              <div className="bg-white p-4 rounded-xl border-2 border-dashed border-gray-200 inline-block mb-4">
                <QRCode
                  value={`${window.location.origin}/verify/${certificate.verification_id}`}
                  size={140}
                />
              </div>
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <p className="text-xs font-bold text-gray-400 uppercase mb-1">
                  Verification ID
                </p>
                <code className="text-sm font-mono text-indigo-600 select-all">
                  {certificate.verification_id}
                </code>
              </div>
              <a
                href={`${window.location.origin}/verify/${certificate.verification_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg font-medium transition-colors text-sm"
              >
                <Globe size={16} /> Open Public Verification Page
              </a>
            </div>
          </div>
        </div>

        {/* Fullscreen Modal */}
        <Modal
          show={showFullscreen}
          onHide={() => setShowFullscreen(false)}
          size="xl"
          centered
          dialogClassName="modal-fullscreen"
          contentClassName="bg-transparent border-0"
        >
          <div className="relative w-full max-w-7xl mx-auto">
            <button
              onClick={() => setShowFullscreen(false)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 z-50 p-2"
            >
              <X size={32} />
            </button>
            <div className="shadow-2xl rounded-lg overflow-hidden bg-white">
                <TemplateRenderer 
                    template={template} 
                    formData={certificate}
                    isFullscreen={true}
                 />
            </div>
          </div>
        </Modal>
      </div>
    </ErrorBoundary>
  );
}

export default ViewCertificatePage;
