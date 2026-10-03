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
  LogIn,
} from "lucide-react";
import TemplateRenderer from "../components/templates/TemplateRenderer";
import PublicHeader from "../components/PublicHeader";
import PublicFooter from "../components/PublicFooter";
import SEO from "../components/SEO";
import { useWhiteLabel } from "../context/WhiteLabelContext";

// --- SHARE SECTION COMPONENT ---
const ShareCredentialSection = ({ currentUrl, companyName, certificate }) => {
  const [copied, setCopied] = useState(false);
  const [linkedinOrgId, setLinkedinOrgId] = useState(certificate?.linkedin_org_id || "");

  const issueDateObj = certificate?.issue_date ? new Date(certificate.issue_date) : new Date();
  const issueYear = certificate?.issue_year || issueDateObj.getFullYear();
  const issueMonth = certificate?.issue_month || (issueDateObj.getMonth() + 1);
  const issueMonthName = issueDateObj.toLocaleString('en-US', { month: 'short' });

  const certTitle = certificate?.course_title || "Certificate of Accomplishment";
  const issuerOrg = certificate?.issuer_name || companyName || "ProofDeck";
  const certId = certificate?.verification_id || "";

  const handleCopy = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareText = `I just earned a verified credential for "${certTitle}" from ${issuerOrg}! Verify it on ProofDeck:`;

  // LinkedIn Direct Add to Profile certification URL schema with organizationId support
  let linkedInAddToProfileUrl = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(
    certTitle
  )}&organizationName=${encodeURIComponent(
    issuerOrg
  )}&issueYear=${issueYear}&issueMonth=${issueMonth}&certUrl=${encodeURIComponent(
    currentUrl
  )}&certId=${encodeURIComponent(certId)}`;

  if (linkedinOrgId.trim()) {
    linkedInAddToProfileUrl += `&organizationId=${encodeURIComponent(linkedinOrgId.trim())}`;
  }

  const shareLinks = {
    linkedinFeed: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
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
    <div className="mt-8 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 font-sans">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-indigo-50 p-2.5 rounded-xl text-indigo-600 border border-indigo-100">
          <Share2 size={20} />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900 mb-0">
            Share & Verify Credential
          </h3>
          <p className="text-xs text-slate-500 mb-0">
            Add this credential to your LinkedIn profile or share with your professional network.
          </p>
        </div>
      </div>

      {/* --- LINKEDIN PROFILE CARD PREVIEW --- */}
      <div className="mb-6 bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-md">
        <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2.5">
          <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
            <Linkedin size={14} className="text-[#0A66C2]" />
            LinkedIn Licenses & Certifications Preview
          </span>
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Official Credential
          </span>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-lg shrink-0 shadow-sm">
            {issuerOrg.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-white leading-tight truncate">
              {certTitle}
            </h4>
            <p className="text-xs font-semibold text-slate-300 mt-0.5">
              {issuerOrg}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Issued {issueMonthName} {issueYear}
            </p>
            {certId && (
              <p className="text-[10px] text-slate-400 font-mono mt-1">
                Credential ID: {certId}
              </p>
            )}
          </div>
        </div>

        {/* LinkedIn Company ID Input for Logo Matching */}
        <div className="mt-3 pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="text-[11px] text-slate-300">
            <span className="font-bold text-white">Attach Company Logo:</span>{" "}
            <span className="text-slate-400">
              Enter LinkedIn Company ID (found in page URL, e.g. 12345678) to display your official logo on LinkedIn:
            </span>
          </div>
          <input
            type="text"
            placeholder="e.g. 12345678"
            value={linkedinOrgId}
            onChange={(e) => setLinkedinOrgId(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white text-xs px-2.5 py-1 rounded-lg focus:outline-none focus:border-indigo-500 w-full sm:w-36 font-mono"
          />
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap gap-2 items-center justify-between">
          <a
            href={linkedInAddToProfileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0A66C2] text-white rounded-xl hover:bg-[#004182] transition-colors font-bold text-xs no-underline shadow-sm cursor-pointer"
          >
            <Linkedin size={16} />
            Add to LinkedIn Profile
          </a>

          <a
            href={shareLinks.linkedinFeed}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-colors font-semibold text-xs no-underline cursor-pointer"
          >
            <span>Share to LinkedIn Feed</span>
          </a>
        </div>
      </div>

      {/* --- OTHER SOCIAL & DIRECT LINK --- */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <a
          href={shareLinks.twitter}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors font-bold text-xs no-underline"
        >
          <Twitter size={16} />
          Post to X (Twitter)
        </a>

        <a
          href={shareLinks.facebook}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1877F2] text-white rounded-xl hover:bg-[#0d65d9] transition-colors font-bold text-xs no-underline"
        >
          <Facebook size={16} />
          Share to Facebook
        </a>

        <button
          onClick={handleCopy}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-800 rounded-xl hover:bg-slate-200 transition-colors font-bold text-xs cursor-pointer border border-slate-200"
        >
          {copied ? (
            <>
              <Check size={16} className="text-emerald-600" />
              <span>Copied Link!</span>
            </>
          ) : (
            <>
              <Copy size={16} />
              <span>Copy Verification Link</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// --- MAIN PAGE COMPONENT ---
const VerifyCertificatePage = () => {
  const { brand, isWhiteLabel } = useWhiteLabel();
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
      <SEO
        title={isWhiteLabel ? `${brand.company_name} — Credential Verification` : "Credential Verification | ProofDeck"}
        description={isWhiteLabel ? `Verify official digital credentials issued by ${brand.company_name}.` : "Verify official ProofDeck digital credential authenticity."}
        canonicalUrl={typeof window !== "undefined" ? window.location.href : "https://www.proofdeck.app/verify"}
        noIndex={true}
      />
      {isWhiteLabel ? (
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-2xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-3">
                {brand.logo_url && (
                  <img
                    src={brand.logo_url}
                    alt={brand.company_name}
                    className="h-8 max-w-[180px] object-contain rounded"
                  />
                )}
                <span className="font-bold text-lg text-slate-900 tracking-tight">
                  {brand.company_name}
                </span>
              </div>
              <div className="flex items-center gap-2.5 sm:gap-3">
                {brand.website_url && (
                  <a
                    href={brand.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors hidden md:inline-block no-underline"
                  >
                    Visit Website →
                  </a>
                )}
                <span className="text-xs font-bold px-2.5 sm:px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200 flex items-center gap-1.5 shrink-0">
                  <CheckCircle size={13} className="text-emerald-600" /> <span className="hidden xs:inline">Official</span> Portal
                </span>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-250 transition-colors no-underline shadow-2xs shrink-0 cursor-pointer"
                  title="Sign in to your issuer workspace"
                >
                  <LogIn size={13} className="text-slate-500" />
                  <span>Issuer Sign In</span>
                </Link>
              </div>
            </div>
          </div>
        </header>
      ) : (
        <PublicHeader />
      )}

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
                  currentUrl={certificate.verification_url || window.location.href}
                  companyName={company?.name || "ProofDeck"}
                  certificate={certificate}
                />
              )}
            </div>
          )}
        </div>
      </main>

      {isWhiteLabel ? (
        <footer className="bg-white border-t border-gray-100 py-8 px-4 text-center mt-auto">
          <div className="max-w-7xl mx-auto space-y-2">
            <p className="text-xs text-slate-500 mb-0">
              © {new Date().getFullYear()} <strong>{brand.company_name}</strong>. All rights reserved.
            </p>
            {brand.support_email && (
              <p className="text-xs text-slate-400 mb-0">
                Inquiries & Verification Support:{" "}
                <a
                  href={`mailto:${brand.support_email}`}
                  className="underline hover:text-slate-600 font-medium"
                >
                  {brand.support_email}
                </a>
              </p>
            )}
            <div className="pt-1">
              <Link
                to="/login"
                className="text-xs text-slate-400 hover:text-slate-600 font-medium transition-colors no-underline inline-flex items-center gap-1"
              >
                <LogIn size={12} />
                <span>Issuer & Staff Sign In</span>
              </Link>
            </div>
            {!brand.hide_badge && (
              <p className="text-[11px] text-slate-400 pt-1 mb-0">
                Secured and verified by{" "}
                <a
                  href="https://www.proofdeck.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-slate-500 hover:text-slate-700 underline"
                >
                  ProofDeck
                </a>
              </p>
            )}
          </div>
        </footer>
      ) : (
        <PublicFooter />
      )}
    </div>
  );
};

export default VerifyCertificatePage;
