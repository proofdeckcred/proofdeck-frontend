import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  KeyRound,
  ShieldCheck,
  Building2,
  Lock,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  WifiOff,
  FolderLock,
  Loader2
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

function DesktopActivationModal({ isOpen, onActivated, currentConfig }) {
  const [licenseKey, setLicenseKey] = useState("");
  const [institutionName, setInstitutionName] = useState("");
  const [signatoryName, setSignatoryName] = useState("");
  const [isVerifyingKey, setIsVerifyingKey] = useState(false);
  const [keyVerified, setKeyVerified] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  // Auto-verify & auto-fetch institution name as soon as a complete key is typed or pasted
  const checkKey = async (rawKey) => {
    const cleanKey = rawKey.trim().toUpperCase();
    if (cleanKey.length < 12) {
      setKeyVerified(false);
      return;
    }

    setIsVerifyingKey(true);
    try {
      const res = await axios.post("/api/desktop/verify-key", { license_key: cleanKey });
      if (res.data.valid) {
        setKeyVerified(true);
        if (res.data.institution_name) {
          setInstitutionName(res.data.institution_name);
        }
        if (res.data.signatory_name || res.data.contact_person) {
          setSignatoryName(res.data.signatory_name || res.data.contact_person);
        }
        toast.success(`License recognized: ${res.data.institution_name}`, { id: "key-recognized" });
      }
    } catch (err) {
      setKeyVerified(false);
    } finally {
      setIsVerifyingKey(false);
    }
  };

  const handleKeyChange = (e) => {
    const val = e.target.value.toUpperCase();
    setLicenseKey(val);
    checkKey(val);
  };

  const handleActivate = async (e) => {
    e.preventDefault();
    const cleanKey = licenseKey.trim().toUpperCase();
    if (!cleanKey) {
      return toast.error("Please enter your Enterprise License Key.");
    }
    if (!institutionName.trim()) {
      return toast.error("Please enter or verify your Institution Name.");
    }

    setLoading(true);
    const toastId = toast.loading("Activating Enterprise Workstation...");

    try {
      const res = await axios.post("/api/desktop/activate-license", {
        license_key: cleanKey,
        institution_name: institutionName.trim(),
        signatory_name: signatoryName.trim() || "Prof. Academic Registrar"
      });

      if (res.data.success) {
        toast.success(res.data.msg || "Enterprise Activated!", { id: toastId });
        if (onActivated) {
          onActivated(res.data.config);
        }
        setTimeout(() => {
          window.location.reload();
        }, 800);
      }
    } catch (err) {
      toast.error(err.response?.data?.msg || "License verification failed.", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs select-none">
      <Toaster position="top-center" />

      <div className="bg-white rounded-2xl max-w-lg w-full p-8 shadow-2xl border border-slate-200 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header Icon + Brand */}
        <div className="flex items-center gap-3.5 mb-6">
          <div className="w-11 h-11 rounded-xl bg-slate-900 flex items-center justify-center text-white shrink-0">
            <KeyRound size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 tracking-tight mb-0">
                ProofDeck Enterprise
              </h2>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                Workstation Edition
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-0 mt-0.5">
              100% On-Premise Institutional Credential Engine
            </p>
          </div>
        </div>

        {/* Notice Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 mb-5">
          <p className="text-xs text-slate-600 mb-0 leading-relaxed">
            Enter the Enterprise License Key provided to your university. The workstation will verify authorization and configure your local offline vault.
          </p>
        </div>

        <form onSubmit={handleActivate} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-800 mb-1.5 flex items-center justify-between">
              <span>Enterprise License Key <span className="text-red-500">*</span></span>
              {isVerifyingKey && (
                <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                  <Loader2 size={11} className="animate-spin" /> Verifying key...
                </span>
              )}
              {keyVerified && (
                <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle2 size={12} /> Key Verified
                </span>
              )}
            </label>
            <div className="relative">
              <input
                type="text"
                required
                autoFocus
                placeholder="PD-ENT-..."
                value={licenseKey}
                onChange={handleKeyChange}
                className={`w-full px-3.5 py-2.5 font-mono text-xs font-semibold uppercase tracking-wider bg-slate-50 border rounded-xl outline-none focus:bg-white transition-all text-slate-900 placeholder-slate-400 ${
                  keyVerified
                    ? "border-emerald-500"
                    : "border-slate-200 focus:border-slate-900"
                }`}
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1.5">
              Institution / Department Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder={keyVerified ? "" : "Auto-populates when key is entered..."}
              value={institutionName}
              onChange={(e) => setInstitutionName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-slate-900 transition-all text-slate-800 placeholder-slate-400"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1.5">
              Default Authorized Signatory
            </label>
            <input
              type="text"
              placeholder="e.g. Prof. Academic Registrar"
              value={signatoryName}
              onChange={(e) => setSignatoryName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-slate-900 transition-all text-slate-800 placeholder-slate-400"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 transition-all cursor-pointer"
            >
              <span>{loading ? "Activating Workstation..." : "Activate Workstation"}</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </form>

        {/* Footer Badges */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <WifiOff size={13} className="text-slate-400" /> Offline Capable
          </span>
          <span className="flex items-center gap-1.5">
            <FolderLock size={13} className="text-slate-400" /> Local Data Vault
          </span>
          <span className="font-semibold text-slate-500">v1.0 Desktop</span>
        </div>
      </div>
    </div>
  );
}

export default DesktopActivationModal;
