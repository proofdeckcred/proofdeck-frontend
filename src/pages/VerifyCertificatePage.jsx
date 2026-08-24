import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { verifyCertificate } from "../api";
import { SERVER_BASE_URL } from "../config";
import QRCode from "react-qr-code";
import {
  CheckCircle,
  XCircle,
  Search,
  Building,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Share2,
  Linkedin,
  Facebook,
  Copy,
  Check,
  Twitter,
} from "lucide-react";
import TemplateRenderer from "../components/templates/TemplateRenderer";
import PublicHeader from "../components/PublicHeader";
import PublicFooter from "../components/PublicFooter";

// --- SHARE SECTION COMPONENT ---
const ShareCredentialSection = ({ currentUrl, companyName }) => {
  const [copied, setCopied] = useState(false);

  const shareText = `I just earned a valid credential from ${companyName}! Verify it here:`;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLinks = {
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
      currentUrl
    )}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      shareText
    )}&url=${encodeURIComponent(currentUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      currentUrl
    )}`,
  };

  return (
    <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-indigo-100 p-2 rounded-full text-indigo-600">
          <Share2 size={20} />
        </div>
        <h3 className="text-lg font-bold text-gray-900">
          Share this Achievement
        </h3>
      </div>
      <p className="text-gray-600 mb-6 text-sm">
        Let your network know about your new credential!
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* LinkedIn */}
        <a
          href={shareLinks.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 px-4 py-3 bg-[#0A66C2] text-white rounded-lg hover:bg-[#004182] transition-colors font-medium text-sm no-underline"
        >
          <Linkedin size={18} />
          LinkedIn
        </a>

        {/* Twitter / X */}
        <a
          href={shareLinks.twitter}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm no-underline"
        >
          <Twitter size={18} />
          Post to X
        </a>

        {/* Facebook */}
        <a
          href={shareLinks.facebook}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 px-4 py-3 bg-[#1877F2] text-white rounded-lg hover:bg-[#166fe5] transition-colors font-medium text-sm no-underline"
        >
          <Facebook size={18} />
          Facebook
        </a>

        {/* Copy Link */}
        <button
          onClick={handleCopy}
          className={`flex items-center justify-center gap-2 px-4 py-3 border rounded-lg transition-colors font-medium text-sm ${
            copied
              ? "bg-green-50 border-green-200 text-green-700"
              : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
          }`}
        >
          {copied ? <Check size={18} /> : <Copy size={18} />}
          {copied ? "Copied!" : "Copy Link"}
        </button>
      </div>
    </div>
  );
};

// --- MAIN PAGE COMPONENT ---
const VerifyCertificatePage = () => {
  const { verificationId: paramId } = useParams();
  const [verificationId, setVerificationId] = useState(paramId || "");
  const [certificate, setCertificate] = useState(null);
  const [template, setTemplate] = useState(null);
  const [company, setCompany] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(!!paramId);
  const navigate = useNavigate();

  const handleVerify = async (idToVerify) => {
    if (!idToVerify?.trim()) {
      setError("Please enter a valid Verification ID.");
      return;
    }
    setError("");
    setCertificate(null);
    setTemplate(null);
    setCompany(null);
    setLoading(true);

    // Update URL without reload if manually typing
    if (idToVerify !== paramId) {
      navigate(`/verify/${idToVerify}`, { replace: true });
    }

    try {
      const response = await verifyCertificate(idToVerify);
      setCertificate(response.data.certificate);
      setTemplate(response.data.template);
      setCompany(response.data.company);
    } catch (err) {
      setError(
        err.response?.data?.msg || "Verification failed. Credential not found."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (paramId) handleVerify(paramId);
  }, [paramId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    handleVerify(verificationId);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <PublicHeader />

      <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-10">
            <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-3">
              Credential Verification
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Verify the authenticity of a digital credential by entering its
              unique ID below.
            </p>
          </div>

          {/* Search Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8 mb-8 max-w-xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="verify-id" className="sr-only">
                  Verification ID
                </label>
                <input
                  id="verify-id"
                  type="text"
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-lg py-3 px-4"
                  placeholder="e.g. 550e8400-e29b..."
                  value={verificationId}
                  onChange={(e) => setVerificationId(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <span className="flex items-center gap-2">
                    <Search size={20} /> Verify Credential
                  </span>
                )}
              </button>
            </form>
          </div>

          {error && (
            <div className="max-w-xl mx-auto mb-8 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-start gap-3">
              <XCircle className="text-red-500 mt-0.5 shrink-0" size={20} />
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          )}

          {certificate && template && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Status Banner */}
              <div
                className={`rounded-xl p-4 mb-6 flex items-start gap-4 border ${
                  certificate.status === "valid"
                    ? "bg-green-50 border-green-200"
                    : "bg-red-50 border-red-200"
                }`}
              >
                {certificate.status === "valid" ? (
                  <CheckCircle className="text-green-600 shrink-0" size={24} />
                ) : (
                  <AlertCircle className="text-red-600 shrink-0" size={24} />
                )}
                <div>
                  <h3
                    className={`font-bold text-lg ${
                      certificate.status === "valid"
                        ? "text-green-800"
                        : "text-red-800"
                    }`}
                  >
                    {certificate.status === "valid"
                      ? "Valid Credential"
                      : "Revoked Credential"}
                  </h3>
                  <p
                    className={`text-sm mt-1 ${
                      certificate.status === "valid"
                        ? "text-green-700"
                        : "text-red-700"
                    }`}
                  >
                    Issued to <strong>{certificate.recipient_name}</strong> on{" "}
                    {new Date(certificate.issue_date).toLocaleDateString()}.
                  </p>
                </div>
              </div>

              {/* Company Info */}
              {company && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-8 flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                    <Building size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-blue-900">
                      Issued by verified organization:{" "}
                      <strong>{company.name}</strong>
                    </p>
                  </div>
                </div>
              )}

              {/* Certificate Preview */}
              <div
                className="w-full max-w-4xl mx-auto rounded-lg shadow-2xl overflow-hidden bg-white mb-8"
                style={{ aspectRatio: "1.414/1" }}
              >
                 <TemplateRenderer 
                    template={template} 
                    formData={certificate}
                 />
              </div>

              {/* Share Section (Only if Valid) */}
              {certificate.status === "valid" && (
                <ShareCredentialSection
                  currentUrl={window.location.href}
                  companyName={company?.name || "ProofDeck"}
                />
              )}
            </div>
          )}
        </div>
      </main>
      <PublicFooter />
    </div>
  );
};

export default VerifyCertificatePage;
