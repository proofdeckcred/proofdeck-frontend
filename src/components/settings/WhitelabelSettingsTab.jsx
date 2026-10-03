import React, { useState, useEffect } from "react";
import {
  Globe,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Copy,
  ExternalLink,
  Palette,
  RefreshCw,
  Trash2,
  Check,
  Building,
  Mail,
  Shield,
  Layers,
  Save,
  Info,
  ArrowRight
} from "lucide-react";
import toast from "react-hot-toast";
import {
  getWhitelabelSettings,
  setupCustomDomain,
  verifyCustomDomain,
  updateBranding,
  removeCustomDomain
} from "../../api";

const WhitelabelSettingsTab = ({ isEnterprise = false, onUpgrade }) => {
  const [loading, setLoading] = useState(isEnterprise);
  const [savingBranding, setSavingBranding] = useState(false);
  const [connectingDomain, setConnectingDomain] = useState(false);
  const [checkingDns, setCheckingDns] = useState(false);
  const [copiedTarget, setCopiedTarget] = useState(false);
  const [sslValidationErrors, setSslValidationErrors] = useState([]);
  const [diagnosticInfo, setDiagnosticInfo] = useState(null);

  const [settings, setSettings] = useState(null);
  const [domainInput, setDomainInput] = useState("");
  const [brandingForm, setBrandingForm] = useState({
    brand_logo_url: "",
    brand_favicon_url: "",
    brand_primary_color: "#2563EB",
    brand_accent_color: "#1E40AF",
    brand_font_family: "Inter",
    hide_proofdeck_badge: false,
    custom_support_email: "",
    custom_website_url: "",
    custom_sender_name: "",
  });

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await getWhitelabelSettings();
      setSettings(res.data);
      if (res.data.branding) {
        setBrandingForm({
          brand_logo_url: res.data.branding.logo_url || "",
          brand_favicon_url: res.data.branding.favicon_url || "",
          brand_primary_color: res.data.branding.primary_color || "#2563EB",
          brand_accent_color: res.data.branding.accent_color || "#1E40AF",
          brand_font_family: res.data.branding.font_family || "Inter",
          hide_proofdeck_badge: Boolean(res.data.branding.hide_badge),
          custom_support_email: res.data.branding.custom_support_email || "",
          custom_website_url: res.data.branding.custom_website_url || "",
          custom_sender_name: res.data.branding.custom_sender_name || "",
        });
      }

      // If pending DNS, automatically fetch live Cloudflare diagnostic status
      if (res.data.domain_status === "pending_dns") {
        try {
          const diagRes = await verifyCustomDomain();
          setDiagnosticInfo(diagRes.data);
          if (diagRes.data?.ssl_validation_errors) {
            setSslValidationErrors(diagRes.data.ssl_validation_errors);
          }
        } catch (diagErr) {
          console.debug("Silent diagnostic fetch:", diagErr);
        }
      }
    } catch (err) {
      console.error("Failed to load whitelabel settings:", err);
      toast.error(err.response?.data?.msg || "Could not load branding settings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isEnterprise) {
      loadSettings();
    } else {
      setLoading(false);
    }
  }, [isEnterprise]);

  const handleConnectDomain = async (e) => {
    e.preventDefault();
    if (!domainInput.trim()) {
      toast.error("Please enter a domain name.");
      return;
    }

    try {
      setConnectingDomain(true);
      const res = await setupCustomDomain({ domain: domainInput });
      toast.success(res.data?.msg || "Domain registered! Please configure your DNS.");
      setDomainInput("");
      await loadSettings();
    } catch (err) {
      toast.error(err.response?.data?.msg || "Failed to register domain.");
    } finally {
      setConnectingDomain(false);
    }
  };

  const handleVerifyDns = async () => {
    try {
      setCheckingDns(true);
      const res = await verifyCustomDomain();
      setDiagnosticInfo(res.data);
      const errors = res.data?.ssl_validation_errors || [];
      setSslValidationErrors(errors);

      if (res.data?.is_active) {
        toast.success("Domain verified and SSL is active!");
      } else if (errors.length > 0) {
        toast.error(errors[0]?.message || "SSL validation issue detected.");
      } else {
        toast("DNS check completed. Propagating...", {
          icon: "⏳",
        });
      }
      await loadSettings();
    } catch (err) {
      toast.error(err.response?.data?.msg || "Verification check failed.");
    } finally {
      setCheckingDns(false);
    }
  };

  const handleDisconnectDomain = async () => {
    if (!window.confirm("Are you sure you want to disconnect this domain?")) {
      return;
    }
    try {
      await removeCustomDomain();
      toast.success("Custom domain removed.");
      await loadSettings();
    } catch (err) {
      toast.error("Failed to disconnect domain.");
    }
  };

  const handleSaveBranding = async (e) => {
    e.preventDefault();
    try {
      setSavingBranding(true);
      await updateBranding(brandingForm);
      toast.success("Branding preferences saved successfully!");
      await loadSettings();
    } catch (err) {
      toast.error(err.response?.data?.msg || "Failed to save branding.");
    } finally {
      setSavingBranding(false);
    }
  };

  const copyDnsTarget = () => {
    const target = settings?.fallback_origin || "domains.proofdeck.app";
    navigator.clipboard.writeText(target);
    setCopiedTarget(true);
    setTimeout(() => setCopiedTarget(false), 2000);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
        <Loader2 className="animate-spin text-indigo-600 mx-auto mb-3" size={32} />
        <p className="text-sm font-semibold text-slate-600">Loading white-label configuration...</p>
      </div>
    );
  }

  if (!isEnterprise) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-xs">
        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-xs">
          <Globe size={32} />
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 mb-4">
          <Shield size={13} className="text-amber-600" /> Enterprise Plan Exclusivity
        </span>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-3">
          Custom Domain & White-Labeling
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed mb-6 max-w-lg mx-auto">
          Host public credential verification on your own branded domain (e.g. <code className="font-mono text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">credentials.yourcompany.com</code>), replace ProofDeck branding with your company logo & colors, and deliver emails under your custom sender name.
        </p>
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 mb-8 text-left space-y-2.5 max-w-md mx-auto">
          <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-700">
            <Check size={15} className="text-emerald-600 stroke-[3]" />
            <span>Dedicated Custom Domain & Automated Cloudflare SSL</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-700">
            <Check size={15} className="text-emerald-600 stroke-[3]" />
            <span>100% White-Label (Zero ProofDeck badges)</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-700">
            <Check size={15} className="text-emerald-600 stroke-[3]" />
            <span>Custom Email Sender Name & Primary Brand Color</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-700">
            <Check size={15} className="text-emerald-600 stroke-[3]" />
            <span>10,000 Credentials / Year (With up to 25% Rollover on Renewal)</span>
          </div>
        </div>
        {onUpgrade && (
          <button
            onClick={onUpgrade}
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm cursor-pointer"
          >
            Upgrade to Enterprise (₦1,500,000 / year)
          </button>
        )}
      </div>
    );
  }

  const domain = settings?.custom_domain;
  const status = settings?.domain_status || "unconfigured";
  const fallbackOrigin = settings?.fallback_origin || "domains.proofdeck.app";

  return (
    <div className="space-y-8 font-sans">
      {/* 1. Custom Domain Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <Globe size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-0.5">Custom Domain & SSL</h2>
              <p className="text-xs text-slate-500 mb-0">
                Host your public credential verification portal under your own company domain.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {status === "active" && (
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200 flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-600" /> Active & Secured
              </span>
            )}
            {status === "pending_dns" && (
              <span className="px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full border border-amber-200 flex items-center gap-1.5">
                <Loader2 size={14} className="animate-spin text-amber-600" /> Pending DNS Verification
              </span>
            )}
            {status === "unconfigured" && (
              <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full border border-slate-200">
                Not Connected
              </span>
            )}
          </div>
        </div>

        {/* --- CASE A: DOMAIN IS ACTIVE --- */}
        {status === "active" && (
          <div className="space-y-4">
            <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1">
                  Connected Domain
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-base font-extrabold text-slate-900 font-mono">
                    https://{domain}
                  </span>
                  <a
                    href={`https://${domain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 text-slate-400 hover:text-slate-700 transition-colors"
                    title="Open Verification Portal"
                  >
                    <ExternalLink size={16} />
                  </a>
                </div>
                <p className="text-xs text-slate-600 mt-1 mb-0">
                  All QR codes in certificates and recipient emails automatically link here.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleVerifyDns}
                  disabled={checkingDns}
                  className="px-3.5 py-2 bg-white text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                  <RefreshCw size={14} className={checkingDns ? "animate-spin" : ""} />
                  {checkingDns ? "Checking..." : "Re-Check SSL"}
                </button>
                <button
                  type="button"
                  onClick={handleDisconnectDomain}
                  className="px-3.5 py-2 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold hover:bg-rose-100 transition-colors flex items-center gap-1.5"
                >
                  <Trash2 size={14} /> Disconnect
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- CASE B: DOMAIN IS PENDING DNS --- */}
        {status === "pending_dns" && (() => {
          const hasCaaError = sslValidationErrors.some(e => e.message?.toLowerCase().includes("caa")) ||
            diagnosticInfo?.ssl_validation_errors?.some(e => e.message?.toLowerCase().includes("caa"));

          return (
            <div className="space-y-6">
              <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-5 sm:p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <AlertCircle size={22} className="text-amber-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                      <h4 className="text-sm font-bold text-amber-900 mb-0">
                        DNS Configuration & Verification for <span className="font-mono text-indigo-700">{domain}</span>
                      </h4>
                      {diagnosticInfo && (
                        <div className="flex items-center gap-2 text-[11px] font-semibold">
                          <span className={`px-2 py-0.5 rounded-full border ${diagnosticInfo.hostname_status === "active" ? "bg-emerald-100 text-emerald-800 border-emerald-300" : "bg-amber-100 text-amber-800 border-amber-300"}`}>
                            Routing: {diagnosticInfo.hostname_status || "checking..."}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full border ${diagnosticInfo.ssl_status === "active" ? "bg-emerald-100 text-emerald-800 border-emerald-300" : "bg-amber-100 text-amber-800 border-amber-300"}`}>
                            SSL: {diagnosticInfo.ssl_status || "pending"}
                          </span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-amber-800 leading-relaxed mb-3">
                      Add the following CNAME record in your domain registrar (GoDaddy, Namecheap, Vercel, Cloudflare, Route53, etc.).
                    </p>

                    {/* DNS Record Box */}
                    <div className="bg-white border border-amber-300/80 rounded-xl p-3 sm:p-4 font-mono text-xs overflow-x-auto shadow-2xs">
                      <div className="grid grid-cols-12 gap-2 text-slate-500 font-sans font-bold text-[11px] uppercase pb-2 border-b border-slate-100">
                        <div className="col-span-3">Type</div>
                        <div className="col-span-4">Name / Host</div>
                        <div className="col-span-5">Target / Value</div>
                      </div>
                      <div className="grid grid-cols-12 gap-2 text-slate-900 pt-2.5 items-center">
                        <div className="col-span-3 font-bold text-indigo-600">CNAME</div>
                        <div className="col-span-4 select-all font-semibold">
                          {domain.split(".")[0]} <span className="text-slate-400 font-sans text-[11px]">(or {domain})</span>
                        </div>
                        <div className="col-span-5 flex items-center justify-between gap-2">
                          <span className="text-emerald-700 font-bold select-all">{fallbackOrigin}</span>
                          <button
                            type="button"
                            onClick={copyDnsTarget}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-sans font-semibold transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
                          >
                            {copiedTarget ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                            {copiedTarget ? "Copied" : "Copy"}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Prominent CAA Resolution Alert */}
                    {hasCaaError && (
                      <div className="mt-4 p-4 bg-white border-2 border-amber-400 rounded-xl space-y-2.5 shadow-2xs">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-amber-500 text-white text-[11px] font-bold rounded uppercase tracking-wider">
                            Action Required
                          </span>
                          <h5 className="text-xs sm:text-sm font-bold text-amber-950 mb-0">
                            Vercel / DNS CAA Records Blocking SSL Issuance
                          </h5>
                        </div>
                        <p className="text-xs text-amber-900 leading-relaxed mb-0">
                          Your CNAME is detected, but SSL certificate issuance is currently blocked by your domain's <strong>CAA records</strong>. Vercel automatically creates CAA records restricting certificates to Google and Sectigo.
                        </p>
                        <div className="bg-amber-50/80 border border-amber-200 rounded-lg p-3 text-xs space-y-2 text-slate-800">
                          <div className="font-bold text-slate-900">
                            Fix this in your DNS dashboard (Vercel / Registrar) in 30 seconds:
                          </div>
                          <div className="space-y-1 text-xs">
                            <div className="flex items-start gap-2">
                              <span className="font-bold text-indigo-700 shrink-0">Step 1:</span>
                              <span>In your Vercel DNS settings, click <strong>Add Record</strong> and create a CAA record:</span>
                            </div>
                            <div className="ml-6 p-2 bg-white rounded border border-amber-200 font-mono text-[11px] grid grid-cols-3 gap-2">
                              <div><strong>Type:</strong> CAA</div>
                              <div><strong>Name:</strong> @ (or verify)</div>
                              <div><strong>Value:</strong> 0 issue "ssl.com"</div>
                            </div>
                            <div className="flex items-start gap-2 pt-1">
                              <span className="font-bold text-slate-600 shrink-0">Or Alternative:</span>
                              <span className="text-slate-600">Delete the existing restrictive <code className="bg-white px-1 py-0.5 rounded border border-amber-200">pki.goog</code> and <code className="bg-white px-1 py-0.5 rounded border border-amber-200">sectigo.com</code> CAA records in Vercel.</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Other SSL Errors */}
                    {sslValidationErrors.length > 0 && !hasCaaError && (
                      <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
                        <strong>SSL Validation Status:</strong>
                        <ul className="list-disc pl-4 mt-1 space-y-0.5">
                          {sslValidationErrors.map((err, idx) => (
                            <li key={idx}>{err.message || JSON.stringify(err)}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={handleVerifyDns}
                        disabled={checkingDns}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
                      >
                        {checkingDns ? (
                          <>
                            <Loader2 size={14} className="animate-spin" /> Verifying DNS & SSL...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={14} /> Re-Check DNS & Activate
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={handleDisconnectDomain}
                        className="px-3.5 py-2 bg-white text-slate-600 border border-slate-200 rounded-lg text-xs font-medium hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        Cancel / Change Domain
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* --- CASE C: UNCONFIGURED --- */}
        {status === "unconfigured" && (
          <div className="space-y-6">
            {/* Step-by-Step Pre-Connection Setup Guide */}
            <div className="p-5 sm:p-6 bg-gradient-to-r from-blue-50/70 via-sky-50/40 to-indigo-50/50 border border-blue-200/80 rounded-2xl space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white text-xs font-bold flex items-center justify-center shadow-2xs">
                  <Info size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-0">
                    How to Connect Your Custom Domain (3 Easy Steps)
                  </h3>
                  <p className="text-[12px] text-slate-500 mb-0">
                    Follow these steps to host credential verification on your own brand's URL with automatic SSL.
                  </p>
                </div>
              </div>

              {/* 3 Step Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
                <div className="bg-white border border-blue-100 rounded-xl p-4 shadow-2xs space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-[11px] font-bold flex items-center justify-center">1</span>
                    <span className="text-xs font-bold text-slate-900">Choose Subdomain</span>
                  </div>
                  <p className="text-[12px] text-slate-600 leading-relaxed mb-0">
                    Decide on your verification URL, e.g. <code className="text-blue-700 font-mono text-[11px] bg-blue-50 px-1 py-0.5 rounded">verify.yourdomain.com</code> or <code className="text-blue-700 font-mono text-[11px] bg-blue-50 px-1 py-0.5 rounded">credentials.yourdomain.com</code>.
                  </p>
                </div>

                <div className="bg-white border border-blue-100 rounded-xl p-4 shadow-2xs space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-[11px] font-bold flex items-center justify-center">2</span>
                    <span className="text-xs font-bold text-slate-900">Add CNAME Record</span>
                  </div>
                  <p className="text-[12px] text-slate-600 leading-relaxed mb-0">
                    In your DNS provider (Vercel, GoDaddy, Cloudflare, Route53), add a <strong>CNAME</strong> pointing to <span className="font-mono text-emerald-700 font-semibold">{fallbackOrigin}</span>.
                  </p>
                </div>

                <div className="bg-white border border-blue-100 rounded-xl p-4 shadow-2xs space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-[11px] font-bold flex items-center justify-center">3</span>
                    <span className="text-xs font-bold text-slate-900">Check CAA Records</span>
                  </div>
                  <p className="text-[12px] text-slate-600 leading-relaxed mb-0">
                    If using Vercel or custom CAA records, allow <strong>ssl.com</strong> (<code className="font-mono text-[11px] bg-blue-50 px-1 py-0.5 text-blue-700 rounded">0 issue "ssl.com"</code>) so SSL can issue immediately.
                  </p>
                </div>
              </div>

              {/* Copyable DNS Record Table */}
              <div className="bg-white border border-blue-200/90 rounded-xl p-4 shadow-2xs space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span>Record to add in your DNS manager:</span>
                  <span className="text-[11px] font-normal text-slate-500">TTL: Automatic / 300s</span>
                </div>
                <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3 font-mono text-xs overflow-x-auto">
                  <div className="grid grid-cols-12 gap-2 text-slate-500 font-sans font-bold text-[11px] uppercase pb-2 border-b border-slate-200">
                    <div className="col-span-3">Type</div>
                    <div className="col-span-4">Name / Host</div>
                    <div className="col-span-5">Target / Points To</div>
                  </div>
                  <div className="grid grid-cols-12 gap-2 text-slate-900 pt-2.5 items-center">
                    <div className="col-span-3 font-bold text-blue-600">CNAME</div>
                    <div className="col-span-4 font-semibold text-slate-800">
                      verify <span className="text-slate-400 font-sans text-[11px]">(or chosen subdomain)</span>
                    </div>
                    <div className="col-span-5 flex items-center justify-between gap-2">
                      <span className="text-emerald-700 font-bold select-all">{fallbackOrigin}</span>
                      <button
                        type="button"
                        onClick={copyDnsTarget}
                        className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded text-[11px] font-sans font-semibold transition-colors flex items-center gap-1 shrink-0 cursor-pointer shadow-2xs"
                      >
                        {copiedTarget ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                        {copiedTarget ? "Copied" : "Copy"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Input Form to Connect */}
            <form onSubmit={handleConnectDomain} className="space-y-4 pt-1">
              <div className="max-w-xl">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Enter Your Configured Domain or Subdomain
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Globe size={16} />
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. verify.yourcompany.com"
                      value={domainInput}
                      onChange={(e) => setDomainInput(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={connectingDomain || !domainInput.trim()}
                    className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 shrink-0 shadow-sm cursor-pointer"
                  >
                    {connectingDomain ? (
                      <>
                        <Loader2 size={14} className="animate-spin" /> Connecting...
                      </>
                    ) : (
                      "Connect Domain"
                    )}
                  </button>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Example: <span className="font-mono text-slate-600">verify.acme.com</span> or{" "}
                  <span className="font-mono text-slate-600">credentials.university.edu</span>
                </p>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* 2. Visual Branding & Theming Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <Palette size={22} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-0.5">Visual Identity & Colors</h2>
            <p className="text-xs text-slate-500 mb-0">
              Customize the look and feel of your verification portal and notification emails.
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveBranding} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Logo URL */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Brand Logo URL
              </label>
              <input
                type="url"
                placeholder="https://yourcompany.com/logo.png"
                value={brandingForm.brand_logo_url}
                onChange={(e) => setBrandingForm({ ...brandingForm, brand_logo_url: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
              <p className="text-[11px] text-slate-400 mt-1">Recommended: Transparent PNG or SVG (height ~40px).</p>
              {brandingForm.brand_logo_url && (
                <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 inline-block">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Preview</span>
                  <img
                    src={brandingForm.brand_logo_url}
                    alt="Logo Preview"
                    className="h-8 max-w-[160px] object-contain"
                    onError={(e) => (e.target.style.display = "none")}
                  />
                </div>
              )}
            </div>

            {/* Favicon URL */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Favicon URL (.ico or .png)
              </label>
              <input
                type="url"
                placeholder="https://yourcompany.com/favicon.ico"
                value={brandingForm.brand_favicon_url}
                onChange={(e) => setBrandingForm({ ...brandingForm, brand_favicon_url: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
              <p className="text-[11px] text-slate-400 mt-1">Shown in browser tabs when students view credentials.</p>
              {brandingForm.brand_favicon_url && (
                <div className="mt-3 p-2 bg-slate-50 rounded-xl border border-slate-200 inline-flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Tab Icon:</span>
                  <img
                    src={brandingForm.brand_favicon_url}
                    alt="Favicon"
                    className="w-5 h-5 object-contain"
                    onError={(e) => (e.target.style.display = "none")}
                  />
                </div>
              )}
            </div>

            {/* Primary Brand Color */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Primary Brand Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={brandingForm.brand_primary_color}
                  onChange={(e) => setBrandingForm({ ...brandingForm, brand_primary_color: e.target.value })}
                  className="w-10 h-10 rounded-xl cursor-pointer border border-slate-200 p-0.5 bg-white"
                />
                <input
                  type="text"
                  value={brandingForm.brand_primary_color}
                  onChange={(e) => setBrandingForm({ ...brandingForm, brand_primary_color: e.target.value })}
                  className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  maxLength={7}
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Used for verification buttons, highlights, and borders.</p>
            </div>

            {/* Accent Color */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Accent / Darker Hover Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={brandingForm.brand_accent_color}
                  onChange={(e) => setBrandingForm({ ...brandingForm, brand_accent_color: e.target.value })}
                  className="w-10 h-10 rounded-xl cursor-pointer border border-slate-200 p-0.5 bg-white"
                />
                <input
                  type="text"
                  value={brandingForm.brand_accent_color}
                  onChange={(e) => setBrandingForm({ ...brandingForm, brand_accent_color: e.target.value })}
                  className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  maxLength={7}
                />
              </div>
            </div>

            {/* Support Email */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Verification Support Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  placeholder="credentials@yourcompany.com"
                  value={brandingForm.custom_support_email}
                  onChange={(e) => setBrandingForm({ ...brandingForm, custom_support_email: e.target.value })}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Shown in the footer of your custom verification portal.</p>
            </div>

            {/* Website URL */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Company Website URL
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Building size={16} />
                </div>
                <input
                  type="url"
                  placeholder="https://yourcompany.com"
                  value={brandingForm.custom_website_url}
                  onChange={(e) => setBrandingForm({ ...brandingForm, custom_website_url: e.target.value })}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Allows visitors to click back to your home website.</p>
            </div>

            {/* Sender Display Name */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Email Sender Display Name
              </label>
              <input
                type="text"
                placeholder="Acme Academy Certifications"
                value={brandingForm.custom_sender_name}
                onChange={(e) => setBrandingForm({ ...brandingForm, custom_sender_name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Recipients will see this name on certificate delivery emails:{" "}
                <span className="font-semibold text-slate-700">
                  "{brandingForm.custom_sender_name || settings?.company_name || 'ProofDeck'} &lt;notifications@proofdeck.app&gt;"
                </span>
              </p>
            </div>
          </div>

          {/* Remove Badge Toggle */}
          <div className="pt-4 border-t border-slate-100 flex items-start gap-4">
            <input
              type="checkbox"
              id="hide_badge"
              checked={brandingForm.hide_proofdeck_badge}
              onChange={(e) => setBrandingForm({ ...brandingForm, hide_proofdeck_badge: e.target.checked })}
              className="mt-1 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
            />
            <label htmlFor="hide_badge" className="cursor-pointer select-none">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900">
                  Remove "Powered by ProofDeck" Footer Badge
                </span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  White-Label
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 mb-0">
                100% unbranded verification experience with zero third-party platform badges.
              </p>
            </label>
          </div>

          {/* Submit */}
          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={savingBranding}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-2 shadow-sm"
            >
              {savingBranding ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save size={14} /> Save Branding Preferences
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WhitelabelSettingsTab;
