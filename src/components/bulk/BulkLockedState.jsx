// frontend/src/components/bulk/BulkLockedState.jsx

import React from "react";
import { Link } from "react-router-dom";
import { Lock, Table2, FileSpreadsheet, CheckCircle2, ArrowRight, X } from "lucide-react";

const BulkLockedState = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="max-w-lg w-full bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden relative">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/20 transition-all cursor-pointer"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {/* Top Header Accent */}
        <div className="bg-slate-900 p-6 text-white text-center relative">
          <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-white/10 border border-white/15 mb-3 text-indigo-300">
            <Table2 size={20} />
          </div>

          <h2 className="text-lg sm:text-xl font-bold tracking-tight mb-1.5 text-white">
            In-Page Spreadsheet Editor
          </h2>
          <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed mb-3">
            Type directly, paste multi-column data from Excel or Google Sheets, and validate rows live in your browser.
          </p>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[11px] font-semibold text-slate-200">
            <Lock size={11} className="text-amber-400" />
            <span>Available on Growth, Pro & Enterprise Plans</span>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 bg-slate-50/60 space-y-4">
          <div className="space-y-2.5">
            <div className="flex items-start gap-3 p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
              <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 shrink-0">
                <Table2 size={15} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800 mb-0.5">Live Interactive Grid</h4>
                <p className="text-[11px] text-slate-500 leading-normal mb-0">
                  Add, edit, and navigate cells with spreadsheet keyboard shortcuts directly inside ProofDeck.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
              <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 shrink-0">
                <FileSpreadsheet size={15} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800 mb-0.5">Excel & Sheets Multi-Paste</h4>
                <p className="text-[11px] text-slate-500 leading-normal mb-0">
                  Copy rows or entire tables from Excel or Google Sheets and paste them right into the editor.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
              <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 shrink-0">
                <CheckCircle2 size={15} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800 mb-0.5">Real-time Cell Validation</h4>
                <p className="text-[11px] text-slate-500 leading-normal mb-0">
                  Instant live highlights for duplicate emails, invalid formats, and missing required fields.
                </p>
              </div>
            </div>
          </div>

          {/* Note for Free Plan */}
          <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 text-[11px] text-slate-600 leading-relaxed">
            <span className="font-bold text-indigo-900">Good news:</span> You can still upload your CSV or Excel file directly using the file uploader below on the <strong>Free plan</strong>.
          </div>

          {/* Upgrade CTA & Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 rounded-lg transition-colors order-2 sm:order-1"
            >
              Continue with File Upload
            </button>
            <Link
              to="/pricing"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-black text-white rounded-lg text-xs font-bold shadow-md transition-all shrink-0 decoration-none order-1 sm:order-2"
            >
              <span>Upgrade to Growth</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkLockedState;
