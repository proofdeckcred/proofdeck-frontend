// frontend/src/components/bulk/BulkLockedState.jsx

import React from "react";
import { Link } from "react-router-dom";
import { Lock, Sparkles, Table2, Mail, Zap, CheckCircle2, ArrowRight } from "lucide-react";

const BulkLockedState = () => {
  return (
    <div className="max-w-3xl mx-auto my-8 bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2">
      {/* Top Banner Accent */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent pointer-events-none" />
        
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 mb-4 text-indigo-300">
          <Lock size={22} />
        </div>
        
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-2">
          Bulk Credential Issuance
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
          Issue dozens, hundreds, or thousands of verifiable certificates simultaneously with our built-in spreadsheet and smart column mapping.
        </p>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 mt-4 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-[11px] font-semibold text-indigo-200">
          <Sparkles size={12} className="text-indigo-300" />
          <span>Available on Growth, Pro & Enterprise Plans</span>
        </div>
      </div>

      {/* Feature Value Props Grid */}
      <div className="p-6 sm:p-8 bg-slate-50/50">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 text-center sm:text-left">
          What you get with Bulk Issuance
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="flex items-start gap-3 p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-xs">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-650 shrink-0 mt-0.5">
              <Table2 size={16} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-850 mb-0.5">In-Page Spreadsheet Editor</h4>
              <p className="text-[11px] text-slate-500 leading-normal">
                Type directly, edit rows live, paste multi-column data from Excel or Google Sheets, and validate emails instantly.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-xs">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-650 shrink-0 mt-0.5">
              <Sparkles size={16} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-850 mb-0.5">Smart Column Mapping</h4>
              <p className="text-[11px] text-slate-500 leading-normal">
                Upload any sheet structure. ProofDeck automatically maps your headings and merges split First and Last names.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-xs">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-650 shrink-0 mt-0.5">
              <Zap size={16} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-850 mb-0.5">Background Batch Engine</h4>
              <p className="text-[11px] text-slate-500 leading-normal">
                Generate thousands of documents in the background without browser freeze, complete with progress tracking.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-xs">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-650 shrink-0 mt-0.5">
              <Mail size={16} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-850 mb-0.5">Automated Recipient Delivery</h4>
              <p className="text-[11px] text-slate-500 leading-normal">
                Send beautiful credentials and unique verification QR codes directly to each recipient's email in one click.
              </p>
            </div>
          </div>
        </div>

        {/* Upgrade CTA */}
        <div className="bg-white rounded-xl border border-indigo-150 p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div>
            <h4 className="text-sm font-bold text-slate-900 mb-1">
              Ready to automate your credential pipeline?
            </h4>
            <p className="text-xs text-slate-500 mb-0">
              Upgrade to the Growth plan to unlock bulk tools, or Pro for advanced AI mapping and API access.
            </p>
          </div>

          <Link
            to="/pricing"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-650 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all shrink-0 decoration-none"
          >
            <span>Upgrade to Growth</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BulkLockedState;
