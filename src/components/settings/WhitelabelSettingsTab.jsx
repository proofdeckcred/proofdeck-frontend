import React, { useState, useEffect } from "react";
import {
  Globe,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Copy,
  ExternalLink,
  Palette,
  Sparkles,
  RefreshCw,
  Trash2,
  Check,
  Building,
  Mail,
  Shield,
  Layers
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
      if (res.data?.is_active) {
        toast.success("Domain verified and SSL is active!");
      } else {
        toast("DNS verification pending. Please allow up to a few minutes for propagation.", {
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
            <span>10,000 Credential Credits Included</span>
          </div>
        </div>
        {onUpgrade && (
          <button
            onClick={onUpgrade}
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm cursor-pointer"
          >
            Upgrade to Enterprise (₦650,000)
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
        {status === "pending_dns" && (
          <div className="space-y-6">
            <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <AlertCircle size={20} className="text-amber-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-amber-900 mb-1">
                    DNS Configuration Required for <span className="font-mono">{domain}</span>
                  </h4>
                  <p className="text-xs text-amber-800 leading-relaxed mb-4">
                    Add the following CNAME record in your domain registrar (GoDaddy, Namecheap, Cloudflare, Route53, etc.).
                  </p>

                  {/* DNS Record Box */}
                  <div className="bg-white border border-amber-300/80 rounded-lg p-3 sm:p-4 font-mono text-xs overflow-x-auto shadow-2xs">
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
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-sans font-semibold transition-colors flex items-center gap-1 shrink-0"
                        >
                          {copiedTarget ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                          {copiedTarget ? "Copied" : "Copy"}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={handleVerifyDns}
                      disabled={checkingDns}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm"
                    >
                      {checkingDns ? (
                        <>
                          <Loader2 size={14} className="animate-spin" /> Verifying DNS...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 size={14} /> Verify DNS & Activate
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleDisconnectDomain}
                      className="px-3.5 py-2 bg-white text-slate-600 border border-slate-200 rounded-lg text-xs font-medium hover:bg-slate-50 transition-colors"
                    >
                      Cancel / Change Domain
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- CASE C: UNCONFIGURED --- */}
        {status === "unconfigured" && (
          <form onSubmit={handleConnectDomain} className="space-y-4">
            <div className="max-w-xl">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Domain or Subdomain
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Globe size={16} />
                  </div>
                  <input
                    type="text"
                    placeholder="credentials.yourcompany.com"
                    value={domainInput}
                    onChange={(e) => setDomainInput(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={connectingDomain || !domainInput.trim()}
                  className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 shrink-0 shadow-sm"
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
                Example: <span className="font-mono text-slate-600">credentials.acme.edu</span> or{" "}
                <span className="font-mono text-slate-600">verify.acme.com</span>
              </p>
            </div>
          </form>
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
                  <Sparkles size={14} /> Save Branding Preferences
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
