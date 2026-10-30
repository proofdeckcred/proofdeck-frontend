import React, { useState } from "react";
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
  Layers,
  HelpCircle,
  FolderLock
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

function DesktopActivationModal({ isOpen, onActivated, currentConfig }) {
  const [licenseKey, setLicenseKey] = useState("");
  const [institutionName, setInstitutionName] = useState(currentConfig?.institution_name || "");
  const [signatoryName, setSignatoryName] = useState(currentConfig?.signatory_name || "Prof. Academic Registrar");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleActivate = async (e) => {
    e.preventDefault();
    const cleanKey = licenseKey.trim().toUpperCase();
    if (!cleanKey) {
      return toast.error("Please enter your Enterprise License Key.");
    }
    if (!institutionName.trim()) {
      return toast.error("Please enter your Institution Name.");
    }

    setLoading(true);
    const toastId = toast.loading("Verifying Enterprise License...");

    try {
      const res = await axios.post("/api/desktop/activate-license", {
        license_key: cleanKey,
        institution_name: institutionName.trim(),
        signatory_name: signatoryName.trim()
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
      toast.error(err.response?.data?.msg || "License verification failed. Please check the key.", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md select-none">
      <Toaster position="top-center" />

      <div className="bg-white rounded-3xl max-w-xl w-full p-8 sm:p-10 shadow-2xl border border-slate-200/90 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Glow Accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header Icon + Brand */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200 shrink-0">
            <KeyRound size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-slate-900 tracking-tight mb-0">
                ProofDeck Enterprise
              </h2>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                Desktop Edition
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-0 mt-0.5">
              100% On-Premise Institutional Credential Engine
            </p>
          </div>
        </div>

        {/* Notice Card */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 mb-6 space-y-2">
          <div className="flex items-start gap-2.5">
            <ShieldCheck size={18} className="text-indigo-600 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-600 leading-relaxed">
              <strong className="text-slate-900 font-bold block mb-0.5">Activate Your Workstation</strong>
              Enter the annual Enterprise License Key provided by ProofDeck for your institution.
              Once activated, this workstation operates completely offline with on-premise student data sovereignty.
            </div>
          </div>
        </div>

        <form onSubmit={handleActivate} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-800 mb-1.5">
              Enterprise License Key <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                placeholder="PD-ENT-NILE-9F8A-7B2C-1E4D"
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value.toUpperCase())}
                className="w-full pl-10 pr-4 py-2.5 font-mono text-xs font-bold uppercase tracking-wider bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition-all text-slate-900 placeholder-slate-400"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1.5">
              Institution / Department Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Building2 size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                placeholder="e.g. Nile University — Academic Division"
                value={institutionName}
                onChange={(e) => setInstitutionName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition-all text-slate-800 placeholder-slate-400"
              />
            </div>
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
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition-all text-slate-800 placeholder-slate-400"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 disabled:opacity-50 transition-all"
            >
              <span>{loading ? "Activating Workstation..." : "Activate Enterprise Workstation"}</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </form>

        {/* Footer Badges */}
        <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <WifiOff size={13} className="text-slate-400" /> Works 100% Offline
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
