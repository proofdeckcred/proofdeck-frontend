// frontend/src/components/bulk/ColumnMappingModal.jsx

import React, { useState, useMemo } from "react";
import {
  X,
  Wand2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Split,
  Table,
  Loader2,
  RotateCcw,
  Info
} from "lucide-react";
import {
  PROOFDECK_CORE_FIELDS,
  requestAiMapping,
  saveMappingMemory
} from "../../utils/columnMapping";
import toast from "react-hot-toast";

const ColumnMappingModal = ({
  isOpen,
  onClose,
  headers = [],
  rawRows = [],
  initialMapping = {},
  splitNames = null,
  batchDefaults = {},
  onConfirmMapping,
  onLiveMappingChange,
  isProOrEnterprise = false,
  templateCustomFields = []
}) => {
  if (!isOpen) return null;

  // Snapshot of state prior to opening (used for clean revert on cancel/close)
  const initialSnapshotRef = React.useRef({
    mapping: initialMapping,
    splitNames,
    batchDefaults
  });

  // Active mappings: { fieldKey: { sourceColumn: string | null, confidence: number, type: string } }
  const [currentMapping, setCurrentMapping] = useState(() => ({
    ...initialMapping
  }));

  // Split name state
  const [isSplitNameMode, setIsSplitNameMode] = useState(() => !!splitNames);
  const [splitFirstCol, setSplitFirstCol] = useState(
    () => splitNames?.firstNameColumn || ""
  );
  const [splitLastCol, setSplitLastCol] = useState(
    () => splitNames?.lastNameColumn || ""
  );

  // Batch defaults for optional fields
  const [defaults, setDefaults] = useState(() => ({
    issuer_name: batchDefaults.issuer_name || "",
    issue_date: batchDefaults.issue_date || new Date().toISOString().split("T")[0],
    signature: batchDefaults.signature || "",
    ...batchDefaults
  }));

  const [isAiLoading, setIsAiLoading] = useState(false);

  // Broadcast changes live to parent page & preview
  const notifyLiveUpdate = (newMapping, newSplitMode, newFirstCol, newLastCol, newDefaults) => {
    if (onLiveMappingChange) {
      onLiveMappingChange({
        mapping: newMapping,
        splitNames: newSplitMode && newFirstCol && newLastCol ? { firstNameColumn: newFirstCol, lastNameColumn: newLastCol } : null,
        batchDefaults: newDefaults
      });
    }
  };

  // Revert on cancel/close
  const handleCancel = () => {
    if (onLiveMappingChange && initialSnapshotRef.current) {
      onLiveMappingChange(initialSnapshotRef.current);
    }
    onClose();
  };

  // Handle ESC key to cancel
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleCancel();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // All combined target fields (6 core + any custom template placeholders)
  const allTargetFields = useMemo(() => {
    const list = [...PROOFDECK_CORE_FIELDS];
    templateCustomFields.forEach((cf) => {
      if (!list.some((f) => f.key === cf.key)) {
        list.push({
          key: cf.key,
          label: cf.label,
          required: false,
          description: `Template placeholder {{${cf.key}}}`,
          placeholder: `Value for ${cf.label}`
        });
      }
    });
    return list;
  }, [templateCustomFields]);

  // Handle single column change
  const handleSelectColumn = (fieldKey, selectedCol) => {
    const updated = {
      ...currentMapping,
      [fieldKey]: {
        sourceColumn: selectedCol === "__none__" ? null : selectedCol,
        confidence: selectedCol === "__none__" ? 0 : 1.0,
        type: "manual"
      }
    };
    setCurrentMapping(updated);
    notifyLiveUpdate(updated, isSplitNameMode, splitFirstCol, splitLastCol, defaults);
  };

  // Handle split name toggle
  const handleToggleSplitName = (enabled) => {
    setIsSplitNameMode(enabled);
    let updated = { ...currentMapping };
    if (enabled) {
      if (splitFirstCol && splitLastCol) {
        updated.recipient_name = {
          sourceColumn: `${splitFirstCol} + ${splitLastCol}`,
          confidence: 1.0,
          type: "split_combine",
          parts: [splitFirstCol, splitLastCol]
        };
      }
    } else {
      updated.recipient_name = {
        sourceColumn: null,
        confidence: 0,
        type: "manual"
      };
    }
    setCurrentMapping(updated);
    notifyLiveUpdate(updated, enabled, splitFirstCol, splitLastCol, defaults);
  };

  const handleSplitColsChange = (first, last) => {
    setSplitFirstCol(first);
    setSplitLastCol(last);
    let updated = { ...currentMapping };
    if (first && last) {
      updated.recipient_name = {
        sourceColumn: `${first} + ${last}`,
        confidence: 1.0,
        type: "split_combine",
        parts: [first, last]
      };
    }
    setCurrentMapping(updated);
    notifyLiveUpdate(updated, isSplitNameMode, first, last, defaults);
  };

  const handleDefaultChange = (fieldKey, val) => {
    const updatedDefaults = { ...defaults, [fieldKey]: val };
    setDefaults(updatedDefaults);
    notifyLiveUpdate(currentMapping, isSplitNameMode, splitFirstCol, splitLastCol, updatedDefaults);
  };

  // Trigger Layer B AI mapping (pre-fills for review, does not apply silently)
  const handleTriggerAiMapping = async () => {
    if (!isProOrEnterprise) return;
    setIsAiLoading(true);
    try {
      const res = await requestAiMapping(headers, rawRows);
      if (res?.mappings) {
        const formatted = {};
        Object.entries(res.mappings).forEach(([k, v]) => {
          formatted[k] = {
            sourceColumn: v.source_column || v.sourceColumn || null,
            confidence: v.confidence || 0.9,
            type: v.type || "ai"
          };
        });
        setCurrentMapping(formatted);

        let newSplit = isSplitNameMode;
        let newFirst = splitFirstCol;
        let newLast = splitLastCol;

        if (res.splitNames) {
          newSplit = true;
          newFirst = res.splitNames.first_name_column || res.splitNames.firstNameColumn || "";
          newLast = res.splitNames.last_name_column || res.splitNames.lastNameColumn || "";
          setIsSplitNameMode(true);
          setSplitFirstCol(newFirst);
          setSplitLastCol(newLast);
        }

        notifyLiveUpdate(formatted, newSplit, newFirst, newLast, defaults);
        toast.success("AI column suggestions loaded! Review before confirming.");
      } else {
        toast.error("Could not determine AI mapping. Keeping current suggestions.");
      }
    } catch (e) {
      toast.error("AI service error. Kept rule-based suggestions.");
    } finally {
      setIsAiLoading(false);
    }
  };

  // Check mandatory requirements
  const hasRecipientName = isSplitNameMode
    ? !!(splitFirstCol && splitLastCol)
    : !!currentMapping.recipient_name?.sourceColumn;
  const hasRecipientEmail = !!currentMapping.recipient_email?.sourceColumn;
  const hasCourseTitle = !!currentMapping.course_title?.sourceColumn;
  const canConfirm = hasRecipientName && hasRecipientEmail && hasCourseTitle;

  // Real-time preview of mapped rows
  const previewMappedRows = useMemo(() => {
    return rawRows.slice(0, 4).map((row) => {
      const mapped = {};

      allTargetFields.forEach((field) => {
        if (field.key === "recipient_name" && isSplitNameMode) {
          const fIdx = headers.indexOf(splitFirstCol);
          const lIdx = headers.indexOf(splitLastCol);
          const fVal = fIdx !== -1 && row[fIdx] !== undefined ? String(row[fIdx]).trim() : "";
          const lVal = lIdx !== -1 && row[lIdx] !== undefined ? String(row[lIdx]).trim() : "";
          mapped.recipient_name = `${fVal} ${lVal}`.trim() || "-";
        } else {
          const srcCol = currentMapping[field.key]?.sourceColumn;
          if (srcCol) {
            const idx = headers.indexOf(srcCol);
            mapped[field.key] = idx !== -1 && row[idx] !== undefined ? String(row[idx]).trim() : "";
          } else {
            // Apply default if set
            mapped[field.key] = defaults[field.key] || "-";
          }
        }
      });

      return mapped;
    });
  }, [rawRows, headers, currentMapping, isSplitNameMode, splitFirstCol, splitLastCol, defaults, allTargetFields]);

  // Submit and confirm
  const handleConfirm = () => {
    if (!canConfirm) {
      toast.error("Please map all mandatory fields: Recipient Name, Email, and Course Title.");
      return;
    }

    // Save mapping pattern to localStorage for future 1-click upload
    saveMappingMemory(headers, {
      currentMapping,
      isSplitNameMode,
      splitFirstCol,
      splitLastCol
    });

    onConfirmMapping({
      mapping: currentMapping,
      splitNames: isSplitNameMode ? { firstNameColumn: splitFirstCol, lastNameColumn: splitLastCol } : null,
      batchDefaults: defaults
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      <div
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-650 flex items-center justify-center">
              <Table size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-850 mb-0">
                Map Spreadsheet Columns
              </h2>
              <p className="text-[11px] text-slate-500 mb-0">
                Match your spreadsheet's columns to ProofDeck credential fields
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* AI AUTO-MAP BUTTON (Pro/Enterprise gated) */}
            {isProOrEnterprise ? (
              <button
                type="button"
                onClick={handleTriggerAiMapping}
                disabled={isAiLoading}
                className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-200 text-indigo-700 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs disabled:opacity-50"
                title="Use AI to automatically classify columns"
              >
                {isAiLoading ? (
                  <Loader2 size={13} className="animate-spin text-indigo-650" />
                ) : (
                  <Wand2 size={13} className="text-indigo-650" />
                )}
                <span>AI Auto-Map</span>
              </button>
            ) : (
              <div
                className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-400 text-[11px] font-medium flex items-center gap-1 cursor-default"
                title="AI auto-mapping is available on Pro & Enterprise plans"
              >
                <Wand2 size={11} className="text-slate-400" />
                <span>AI Mapping (Pro)</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleCancel}
              className="p-1.5 text-slate-400 hover:text-slate-650 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* MODAL BODY (SCROLLABLE) */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1">
          {/* Status banner */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-start gap-2.5 text-xs text-slate-600">
            <Info size={15} className="text-indigo-500 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              ProofDeck detected <span className="font-bold text-slate-800">{headers.length} columns</span> in your sheet.
              Confirm the matches below or select different columns. Unmapped optional fields can use a batch default.
            </div>
          </div>

          {/* COLUMN MAPPING ROWS */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between">
              <span>Required & Core Fields</span>
              <span className="text-[10px] text-slate-400 font-normal">
                * Indicates mandatory field
              </span>
            </h3>

            <div className="space-y-2.5">
              {allTargetFields.map((field) => {
                const mapInfo = currentMapping[field.key] || { sourceColumn: null, confidence: 0 };
                const isSelected = !!mapInfo.sourceColumn;
                const isRecipientName = field.key === "recipient_name";

                return (
                  <div
                    key={field.key}
                    className={`p-3 rounded-xl border transition-all ${
                      isSelected || (isRecipientName && isSplitNameMode && splitFirstCol && splitLastCol)
                        ? "bg-white border-slate-200/90 shadow-2xs"
                        : field.required
                        ? "bg-red-50/40 border-red-200"
                        : "bg-slate-50/50 border-slate-200/60"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      {/* Left: ProofDeck Field Info */}
                      <div className="sm:w-2/5">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-xs font-bold text-slate-850">
                            {field.label}
                          </span>
                          {field.required && (
                            <span className="text-red-500 text-xs font-bold">*</span>
                          )}
                          {mapInfo.confidence >= 0.8 && mapInfo.sourceColumn && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-bold">
                              <CheckCircle2 size={9} />
                              <span>{Math.round(mapInfo.confidence * 100)}% match</span>
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 mb-0">
                          {field.description}
                        </p>
                      </div>

                      {/* Right: User Column Dropdown or Split Controls */}
                      <div className="sm:w-3/5 space-y-2">
                        {isRecipientName ? (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <button
                                type="button"
                                onClick={() => handleToggleSplitName(!isSplitNameMode)}
                                className="text-[10px] font-bold text-indigo-650 hover:text-indigo-800 flex items-center gap-1"
                              >
                                <Split size={11} />
                                <span>
                                  {isSplitNameMode
                                    ? "Switch to single name column"
                                    : "Combine First & Last Name columns"}
                                </span>
                              </button>
                            </div>

                            {isSplitNameMode ? (
                              <div className="grid grid-cols-2 gap-2 bg-indigo-50/40 p-2 rounded-lg border border-indigo-150">
                                <div>
                                  <label className="block text-[9px] font-bold text-slate-500 uppercase mb-0.5">
                                    First Name Column
                                  </label>
                                  <select
                                    value={splitFirstCol}
                                    onChange={(e) => handleSplitColsChange(e.target.value, splitLastCol)}
                                    className="w-full text-xs py-1 px-2 rounded border border-slate-200 bg-white focus:outline-none focus:border-indigo-500"
                                  >
                                    <option value="">-- Choose Column --</option>
                                    {headers.map((h) => (
                                      <option key={h} value={h}>{h}</option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-[9px] font-bold text-slate-500 uppercase mb-0.5">
                                    Last Name Column
                                  </label>
                                  <select
                                    value={splitLastCol}
                                    onChange={(e) => handleSplitColsChange(splitFirstCol, e.target.value)}
                                    className="w-full text-xs py-1 px-2 rounded border border-slate-200 bg-white focus:outline-none focus:border-indigo-500"
                                  >
                                    <option value="">-- Choose Column --</option>
                                    {headers.map((h) => (
                                      <option key={h} value={h}>{h}</option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                            ) : (
                              <select
                                value={mapInfo.sourceColumn || "__none__"}
                                onChange={(e) => handleSelectColumn(field.key, e.target.value)}
                                className="w-full text-xs py-1.5 px-2.5 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-indigo-500 shadow-2xs"
                              >
                                <option value="__none__">-- Do not import --</option>
                                {headers.map((h) => (
                                  <option key={h} value={h}>
                                    {h}
                                  </option>
                                ))}
                              </select>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <select
                              value={mapInfo.sourceColumn || "__none__"}
                              onChange={(e) => handleSelectColumn(field.key, e.target.value)}
                              className="flex-1 text-xs py-1.5 px-2.5 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-indigo-500 shadow-2xs"
                            >
                              <option value="__none__">
                                {field.required ? "-- Choose column * --" : "-- Use batch default / None --"}
                              </option>
                              {headers.map((h) => (
                                <option key={h} value={h}>
                                  {h}
                                </option>
                              ))}
                            </select>

                            {/* Batch default input for optional fields */}
                            {!field.required && (
                              <input
                                type={field.key === "issue_date" ? "date" : "text"}
                                placeholder={`Batch default...`}
                                value={defaults[field.key] || ""}
                                onChange={(e) => handleDefaultChange(field.key, e.target.value)}
                                className="w-1/3 text-xs py-1.5 px-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-indigo-500 text-slate-700 shadow-2xs"
                                title="Default applied if column is empty or unmapped"
                              />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* LIVE TRANSFORMED PREVIEW */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <div className="bg-slate-50 px-3.5 py-2 border-b border-slate-200 flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                <Table size={12} className="text-indigo-650" />
                <span>Live Mapped Preview (First 4 Rows)</span>
              </span>
              <span className="text-[10px] text-slate-400">
                Transforms dynamically as you change columns
              </span>
            </div>

            <div className="overflow-x-auto max-h-48 overflow-y-auto">
              <table className="min-w-full divide-y divide-slate-100 text-[11px]">
                <thead className="bg-white sticky top-0 border-b border-slate-100">
                  <tr>
                    <th className="px-3 py-2 text-left font-bold text-slate-600">Recipient Name</th>
                    <th className="px-3 py-2 text-left font-bold text-slate-600">Email</th>
                    <th className="px-3 py-2 text-left font-bold text-slate-600">Course / Event</th>
                    <th className="px-3 py-2 text-left font-bold text-slate-600">Issuer</th>
                    <th className="px-3 py-2 text-left font-bold text-slate-600">Issue Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100 text-slate-700">
                  {previewMappedRows.map((r, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60">
                      <td className="px-3 py-2 font-medium">{r.recipient_name}</td>
                      <td className="px-3 py-2 text-slate-500">{r.recipient_email}</td>
                      <td className="px-3 py-2">{r.course_title}</td>
                      <td className="px-3 py-2 text-slate-500">{r.issuer_name}</td>
                      <td className="px-3 py-2 text-slate-500">{r.issue_date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={!canConfirm}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>Confirm & Open Editor</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ColumnMappingModal;
