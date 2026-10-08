// frontend/src/components/bulk/SpreadsheetGrid.jsx

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Filter,
  Copy,
  Download,
  Info,
  Calendar,
  User,
  Mail,
  FileText,
  PenTool,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Zap
} from "lucide-react";
import { PROOFDECK_CORE_FIELDS, looksLikeEmail, looksLikeDate } from "../../utils/columnMapping";
import toast from "react-hot-toast";

const PAGE_SIZE_OPTIONS = [25, 50, 100];

const SpreadsheetGrid = ({
  rows = [],
  onChangeRows,
  userQuota = 0,
  batchDefaults = {},
  onChangeBatchDefaults,
  onOpenMappingModal,
  templateCustomFields = [],
  isProOrEnterprise = false
}) => {
  // Columns definition (Core 6 + custom template placeholders)
  const columns = useMemo(() => {
    const cols = PROOFDECK_CORE_FIELDS.map((f) => ({
      key: f.key,
      label: f.label,
      required: f.required,
      type: f.key === "issue_date" ? "date" : f.key === "recipient_email" ? "email" : "text",
      icon: f.key === "recipient_name" ? User : f.key === "recipient_email" ? Mail : f.key === "course_title" ? FileText : f.key === "issue_date" ? Calendar : PenTool
    }));

    templateCustomFields.forEach((cf) => {
      if (!cols.some((c) => c.key === cf.key)) {
        cols.push({
          key: cf.key,
          label: cf.label,
          required: false,
          type: "text",
          icon: Sparkles
        });
      }
    });

    return cols;
  }, [templateCustomFields]);

  // Active cell selection & edit state
  const [activeCell, setActiveCell] = useState({ rowIdx: 0, colKey: "recipient_name" });
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef(null);

  // Filter state: show only rows needing attention
  const [filterNeedsAttention, setFilterNeedsAttention] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Validate all rows
  const validationMap = useMemo(() => {
    const map = new Map();
    const emailCounts = new Map();

    // Pass 1: Count email frequencies to identify duplicates
    rows.forEach((r, idx) => {
      const email = String(r.recipient_email || "").trim().toLowerCase();
      if (email && looksLikeEmail(email)) {
        emailCounts.set(email, (emailCounts.get(email) || 0) + 1);
      }
    });

    // Pass 2: Inspect row cells
    rows.forEach((r, idx) => {
      const cellErrors = {};
      let rowHasErrors = false;

      // 1. Mandatory fields: name, email, course_title
      if (!r.recipient_name || !String(r.recipient_name).trim()) {
        cellErrors.recipient_name = "Recipient Name is required";
        rowHasErrors = true;
      }

      if (!r.recipient_email || !String(r.recipient_email).trim()) {
        cellErrors.recipient_email = "Email is required";
        rowHasErrors = true;
      } else if (!looksLikeEmail(r.recipient_email)) {
        cellErrors.recipient_email = "Invalid email format";
        rowHasErrors = true;
      } else {
        const cleanEmail = String(r.recipient_email).trim().toLowerCase();
        if (emailCounts.get(cleanEmail) > 1) {
          cellErrors.recipient_email = "Duplicate email in batch";
          rowHasErrors = true;
        }
      }

      if (!r.course_title || !String(r.course_title).trim()) {
        cellErrors.course_title = "Course Title is required";
        rowHasErrors = true;
      }

      // 2. Date validation (if provided)
      if (r.issue_date && String(r.issue_date).trim() && !looksLikeDate(r.issue_date)) {
        cellErrors.issue_date = "Unparseable date";
        rowHasErrors = true;
      }

      map.set(idx, { cellErrors, hasErrors: rowHasErrors });
    });

    return map;
  }, [rows]);

  // Row counts
  const totalRows = rows.length;
  const invalidRowsCount = useMemo(() => {
    let count = 0;
    validationMap.forEach((v) => {
      if (v.hasErrors) count += 1;
    });
    return count;
  }, [validationMap]);
  const readyRowsCount = totalRows - invalidRowsCount;

  // Filtered rows indices
  const displayedRowIndices = useMemo(() => {
    const indices = [];
    rows.forEach((_, idx) => {
      if (!filterNeedsAttention || validationMap.get(idx)?.hasErrors) {
        indices.push(idx);
      }
    });
    return indices;
  }, [rows, filterNeedsAttention, validationMap]);

  // Paginated slice of indices
  const totalPages = Math.max(1, Math.ceil(displayedRowIndices.length / pageSize));
  const currentIndices = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return displayedRowIndices.slice(start, start + pageSize);
  }, [displayedRowIndices, currentPage, pageSize]);

  // Adjust page if out of bounds
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Start editing a cell
  const startEditing = useCallback(
    (rowIdx, colKey) => {
      setActiveCell({ rowIdx, colKey });
      setEditValue(rows[rowIdx]?.[colKey] ?? "");
      setIsEditing(true);
    },
    [rows]
  );

  // Commit editing change
  const commitEdit = useCallback(() => {
    if (!isEditing) return;
    const { rowIdx, colKey } = activeCell;
    const newRows = [...rows];
    if (newRows[rowIdx]) {
      newRows[rowIdx] = {
        ...newRows[rowIdx],
        [colKey]: editValue.trim()
      };
      onChangeRows(newRows);
    }
    setIsEditing(false);
  }, [isEditing, activeCell, editValue, rows, onChangeRows]);

  // Add empty row
  const handleAddRow = () => {
    const newRow = {
      recipient_name: "",
      recipient_email: "",
      course_title: batchDefaults.course_title || "",
      issuer_name: batchDefaults.issuer_name || "",
      issue_date: batchDefaults.issue_date || new Date().toISOString().split("T")[0],
      signature: batchDefaults.signature || ""
    };
    onChangeRows([...rows, newRow]);
    // Move to new row
    setActiveCell({ rowIdx: rows.length, colKey: "recipient_name" });
  };

  // Delete specific row
  const handleDeleteRow = (rowIdx) => {
    const newRows = rows.filter((_, idx) => idx !== rowIdx);
    onChangeRows(newRows);
    if (activeCell.rowIdx >= newRows.length) {
      setActiveCell((prev) => ({ ...prev, rowIdx: Math.max(0, newRows.length - 1) }));
    }
  };

  // Clear all rows
  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to clear all spreadsheet rows?")) {
      onChangeRows([]);
      setActiveCell({ rowIdx: 0, colKey: "recipient_name" });
    }
  };

  // Apply batch defaults to all empty cells in the batch
  const handleApplyDefaultsToBatch = () => {
    const updated = rows.map((r) => ({
      ...r,
      issuer_name: r.issuer_name || batchDefaults.issuer_name || "",
      issue_date: r.issue_date || batchDefaults.issue_date || "",
      signature: r.signature || batchDefaults.signature || ""
    }));
    onChangeRows(updated);
    toast.success("Batch defaults applied to all rows!");
  };

  // Multi-row, multi-column paste handler (Excel / Google Sheets)
  const handlePaste = useCallback(
    (e) => {
      const text = e.clipboardData.getData("text");
      if (!text || (!text.includes("\t") && !text.includes("\n"))) {
        // Normal single cell paste, let input handle it if editing
        return;
      }

      e.preventDefault();

      // Parse lines and tabs
      const lines = text.split(/\r\n|\n|\r/).filter((l) => l.trim() !== "");
      if (lines.length === 0) return;

      const pasteMatrix = lines.map((line) => line.split("\t"));
      const startRowIdx = activeCell.rowIdx;
      const startColIdx = columns.findIndex((c) => c.key === activeCell.colKey);
      const validColIdx = startColIdx === -1 ? 0 : startColIdx;

      const newRows = [...rows];
      const targetRowCount = Math.max(newRows.length, startRowIdx + pasteMatrix.length);

      // Ensure enough rows exist
      while (newRows.length < targetRowCount) {
        newRows.push({
          recipient_name: "",
          recipient_email: "",
          course_title: "",
          issuer_name: batchDefaults.issuer_name || "",
          issue_date: batchDefaults.issue_date || new Date().toISOString().split("T")[0],
          signature: batchDefaults.signature || ""
        });
      }

      // Fill cells
      pasteMatrix.forEach((pRow, rOffset) => {
        const destRowIdx = startRowIdx + rOffset;
        pRow.forEach((cellVal, cOffset) => {
          const destColIdx = validColIdx + cOffset;
          if (destColIdx < columns.length) {
            const colKey = columns[destColIdx].key;
            newRows[destRowIdx][colKey] = cellVal.trim();
          }
        });
      });

      onChangeRows(newRows);
      setIsEditing(false);
      toast.success(`Pasted ${pasteMatrix.length} rows of data!`);
    },
    [activeCell, columns, rows, batchDefaults, onChangeRows]
  );

  // Spreadsheet keyboard navigation
  const handleKeyDown = useCallback(
    (e) => {
      const { rowIdx, colKey } = activeCell;
      const colIdx = columns.findIndex((c) => c.key === colKey);

      if (isEditing) {
        if (e.key === "Enter") {
          e.preventDefault();
          commitEdit();
          // Move down
          if (rowIdx < rows.length - 1) {
            setActiveCell({ rowIdx: rowIdx + 1, colKey });
          } else {
            // Append row on Enter at bottom
            handleAddRow();
          }
        } else if (e.key === "Tab") {
          e.preventDefault();
          commitEdit();
          if (e.shiftKey) {
            // Move left
            if (colIdx > 0) {
              setActiveCell({ rowIdx, colKey: columns[colIdx - 1].key });
            } else if (rowIdx > 0) {
              setActiveCell({ rowIdx: rowIdx - 1, colKey: columns[columns.length - 1].key });
            }
          } else {
            // Move right
            if (colIdx < columns.length - 1) {
              setActiveCell({ rowIdx, colKey: columns[colIdx + 1].key });
            } else if (rowIdx < rows.length - 1) {
              setActiveCell({ rowIdx: rowIdx + 1, colKey: columns[0].key });
            }
          }
        } else if (e.key === "Escape") {
          e.preventDefault();
          setIsEditing(false);
        }
        return;
      }

      // Not editing: Navigation mode
      if (e.key === "ArrowUp") {
        e.preventDefault();
        if (rowIdx > 0) setActiveCell({ rowIdx: rowIdx - 1, colKey });
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        if (rowIdx < rows.length - 1) setActiveCell({ rowIdx: rowIdx + 1, colKey });
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (colIdx > 0) setActiveCell({ rowIdx, colKey: columns[colIdx - 1].key });
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        if (colIdx < columns.length - 1) setActiveCell({ rowIdx, colKey: columns[colIdx + 1].key });
      } else if (e.key === "Enter" || e.key === "F2") {
        e.preventDefault();
        startEditing(rowIdx, colKey);
      } else if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        const newRows = [...rows];
        if (newRows[rowIdx]) {
          newRows[rowIdx] = { ...newRows[rowIdx], [colKey]: "" };
          onChangeRows(newRows);
        }
      } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        // Typing enters edit mode immediately
        setActiveCell({ rowIdx, colKey });
        setEditValue(e.key);
        setIsEditing(true);
      }
    },
    [isEditing, activeCell, columns, rows, commitEdit, startEditing, handleAddRow, onChangeRows]
  );

  // Credit calculation
  const creditsNeeded = totalRows;
  const hasSufficientCredits = userQuota >= creditsNeeded;

  return (
    <div
      className="space-y-3.5 outline-none select-none"
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      tabIndex={0}
    >
      {/* 1. TOP STATUS & VALIDATION METRIC BAR */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        {/* Left: Validation Counts & Filter */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-2xs">
            <CheckCircle2 size={13} className="text-emerald-600" />
            <span>{readyRowsCount} ready</span>
          </div>

          {invalidRowsCount > 0 ? (
            <button
              type="button"
              onClick={() => setFilterNeedsAttention(!filterNeedsAttention)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all border shadow-2xs ${
                filterNeedsAttention
                  ? "bg-amber-500 text-white border-amber-600"
                  : "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100"
              }`}
            >
              <AlertTriangle size={13} className={filterNeedsAttention ? "text-white" : "text-amber-600"} />
              <span>{invalidRowsCount} need attention</span>
              {filterNeedsAttention && <span className="text-[10px] ml-1">(Filtering)</span>}
            </button>
          ) : (
            <span className="text-xs text-slate-400 font-medium">
              All rows valid
            </span>
          )}

          {totalRows > 0 && onOpenMappingModal && (
            <button
              type="button"
              onClick={onOpenMappingModal}
              className="text-indigo-650 hover:text-indigo-800 text-xs font-bold flex items-center gap-1 ml-2 transition-colors"
            >
              <Filter size={12} />
              <span>Review Column Mapping</span>
            </button>
          )}
        </div>

        {/* Right: Credit Quota Status */}
        <div className="flex items-center gap-3">
          <div
            className={`px-3 py-1 rounded-lg text-xs font-bold border flex items-center gap-1.5 ${
              hasSufficientCredits
                ? "bg-slate-50 text-slate-800 border-slate-200"
                : "bg-red-50 text-red-700 border-red-200"
            }`}
          >
            <Zap size={13} className={hasSufficientCredits ? "text-indigo-500" : "text-red-500"} />
            <span>
              Batch requires <strong className="font-extrabold">{creditsNeeded}</strong> credits
            </span>
            <span className="text-slate-400 font-normal">|</span>
            <span className="text-slate-500 font-normal">
              You have <strong className="font-bold text-slate-800">{userQuota}</strong> available
            </span>
          </div>

          {totalRows > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Clear all rows"
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      </div>

      {/* INSUFFICIENT CREDITS WARNING ALERT */}
      {!hasSufficientCredits && totalRows > 0 && (
        <div className="bg-red-50/90 border border-red-200 p-3 rounded-xl flex items-center justify-between text-xs text-red-800 animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-red-600 shrink-0" />
            <span>
              <strong>Insufficient credits:</strong> This batch requires {creditsNeeded} credits, but you only have {userQuota} credits remaining.
            </span>
          </div>
          <a
            href="/pricing"
            target="_blank"
            rel="noreferrer"
            className="font-bold underline text-red-900 hover:text-black shrink-0 ml-2"
          >
            Buy Credits &rarr;
          </a>
        </div>
      )}

      {/* 2. BATCH DEFAULTS BAR (Fill once for the whole batch) */}
      <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-700 font-bold">
          <Sparkles size={14} className="text-indigo-600" />
          <span>Batch Defaults:</span>
          <span className="text-[11px] font-normal text-slate-400">
            Apply to empty optional cells across all rows
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            placeholder="Batch Issuer..."
            value={batchDefaults.issuer_name || ""}
            onChange={(e) =>
              onChangeBatchDefaults((prev) => ({ ...prev, issuer_name: e.target.value }))
            }
            className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-indigo-500 w-32 shadow-2xs"
          />

          <input
            type="date"
            value={batchDefaults.issue_date || ""}
            onChange={(e) =>
              onChangeBatchDefaults((prev) => ({ ...prev, issue_date: e.target.value }))
            }
            className="px-2 py-1 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-indigo-500 shadow-2xs"
          />

          <input
            type="text"
            placeholder="Batch Signatory..."
            value={batchDefaults.signature || ""}
            onChange={(e) =>
              onChangeBatchDefaults((prev) => ({ ...prev, signature: e.target.value }))
            }
            className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-indigo-500 w-32 shadow-2xs"
          />

          <button
            type="button"
            onClick={handleApplyDefaultsToBatch}
            className="px-2.5 py-1 text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-700 transition-colors shadow-2xs"
          >
            Apply to all
          </button>
        </div>
      </div>

      {/* 3. INTERACTIVE SPREADSHEET TABLE */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto max-h-[500px] overflow-y-auto scrollbar-thin">
          <table className="min-w-full divide-y divide-slate-150 border-collapse text-xs">
            {/* SPREADSHEET HEADER */}
            <thead className="bg-slate-50 sticky top-0 z-10 select-none">
              <tr>
                <th className="w-10 px-2 py-2 text-center font-bold text-slate-400 border-r border-slate-200 bg-slate-100/80">
                  #
                </th>
                {columns.map((col) => {
                  const Icon = col.icon;
                  return (
                    <th
                      key={col.key}
                      className="px-3 py-2 text-left font-bold text-slate-700 border-r border-slate-200 min-w-[160px]"
                    >
                      <div className="flex items-center gap-1.5">
                        <Icon size={12} className="text-slate-400 shrink-0" />
                        <span className="truncate">{col.label}</span>
                        {col.required && <span className="text-red-500 font-bold">*</span>}
                      </div>
                    </th>
                  );
                })}
                <th className="w-10 px-2 py-2 text-center text-slate-400"></th>
              </tr>
            </thead>

            {/* SPREADSHEET BODY */}
            <tbody className="divide-y divide-slate-100 bg-white">
              {currentIndices.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + 2}
                    className="py-12 text-center text-slate-400"
                  >
                    <p className="text-xs font-semibold mb-1">Spreadsheet is empty</p>
                    <p className="text-[11px] text-slate-400 mb-3">
                      Type rows manually, paste from Excel/Sheets (Ctrl+V), or upload a file.
                    </p>
                    <button
                      type="button"
                      onClick={handleAddRow}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-black transition-all"
                    >
                      <Plus size={13} />
                      <span>Add First Row</span>
                    </button>
                  </td>
                </tr>
              ) : (
                currentIndices.map((realRowIdx, pageOffset) => {
                  const row = rows[realRowIdx];
                  const rowValidation = validationMap.get(realRowIdx);
                  const isRowInvalid = rowValidation?.hasErrors;

                  return (
                    <tr
                      key={realRowIdx}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        isRowInvalid ? "bg-red-50/20" : ""
                      }`}
                    >
                      {/* Row Index Indicator */}
                      <td className="px-2 py-1.5 text-center text-[10px] font-mono text-slate-400 bg-slate-50/60 border-r border-slate-200">
                        {realRowIdx + 1}
                      </td>

                      {/* Cells */}
                      {columns.map((col) => {
                        const cellValue = row?.[col.key] ?? "";
                        const isCellSelected =
                          activeCell.rowIdx === realRowIdx && activeCell.colKey === col.key;
                        const cellError = rowValidation?.cellErrors?.[col.key];

                        return (
                          <td
                            key={col.key}
                            onClick={() => {
                              setActiveCell({ rowIdx: realRowIdx, colKey: col.key });
                              setIsEditing(false);
                            }}
                            onDoubleClick={() => startEditing(realRowIdx, col.key)}
                            className={`px-2.5 py-1.5 border-r border-slate-200 relative truncate cursor-pointer transition-all ${
                              isCellSelected
                                ? "outline-2 outline-indigo-500 bg-indigo-50/30 z-2"
                                : ""
                            } ${cellError ? "bg-red-50/60" : ""}`}
                            title={cellError || cellValue}
                          >
                            {isEditing && isCellSelected ? (
                              <input
                                ref={inputRef}
                                type={col.type === "date" ? "date" : "text"}
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onBlur={commitEdit}
                                className="w-full text-xs p-0 border-none bg-transparent focus:outline-none text-slate-900"
                              />
                            ) : (
                              <div className="flex items-center justify-between gap-1">
                                <span
                                  className={`truncate ${
                                    !cellValue
                                      ? "text-slate-300 italic text-[11px]"
                                      : "text-slate-800"
                                  }`}
                                >
                                  {cellValue || (col.required ? "Required" : "-")}
                                </span>

                                {cellError && (
                                  <AlertCircle
                                    size={12}
                                    className="text-red-500 shrink-0"
                                    title={cellError}
                                  />
                                )}
                              </div>
                            )}
                          </td>
                        );
                      })}

                      {/* Row Delete Action */}
                      <td className="px-2 py-1 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteRow(realRowIdx)}
                          className="text-slate-300 hover:text-red-600 transition-colors p-1"
                          title="Delete row"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 4. SPREADSHEET FOOTER BAR */}
        <div className="bg-slate-50 px-4 py-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAddRow}
              className="inline-flex items-center gap-1 px-3 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all shadow-2xs"
            >
              <Plus size={13} />
              <span>Add Row</span>
            </button>

            <span className="text-[11px] text-slate-400">
              Tip: Paste directly from Excel or Google Sheets (Ctrl+V)
            </span>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-500">
                Page {currentPage} of {totalPages} ({displayedRowIndices.length} rows)
              </span>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1 rounded bg-white border border-slate-200 text-slate-600 disabled:opacity-40"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1 rounded bg-white border border-slate-200 text-slate-600 disabled:opacity-40"
                >
                  <ChevronRight size={14} />
                </button>
              </div>

              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="text-[11px] py-0.5 px-1.5 rounded bg-white border border-slate-200 text-slate-600"
              >
                {PAGE_SIZE_OPTIONS.map((sz) => (
                  <option key={sz} value={sz}>{sz} / page</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpreadsheetGrid;
