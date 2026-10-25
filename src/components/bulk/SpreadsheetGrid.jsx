// frontend/src/components/bulk/SpreadsheetGrid.jsx

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Modal } from "react-bootstrap";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import {
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Filter,
  Copy,
  Download,
  Calendar,
  User,
  Mail,
  FileText,
  PenTool,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Tag,
  Zap,
  Save,
  FolderOpen,
  FileSpreadsheet,
  Undo2,
  Redo2,
  ArrowDownToLine,
  FilePlus2,
  Check,
  X
} from "lucide-react";
import {
  PROOFDECK_CORE_FIELDS,
  looksLikeEmail,
  isRowNonEmpty,
  validateRow
} from "../../utils/columnMapping";
import toast from "react-hot-toast";

const PAGE_SIZE_OPTIONS = [25, 50, 100];
export const MIN_STARTER_ROWS = 15;

export function createEmptySpreadsheetRow(batchDefaults = {}) {
  return {
    recipient_name: "",
    recipient_email: "",
    course_title: batchDefaults.course_title || "",
    issuer_name: batchDefaults.issuer_name || "",
    issue_date: batchDefaults.issue_date || new Date().toISOString().split("T")[0],
    signature: batchDefaults.signature || ""
  };
}

export function ensureMinimumRows(rows = [], minCount = MIN_STARTER_ROWS, batchDefaults = {}) {
  const result = Array.isArray(rows) ? [...rows] : [];
  while (result.length < minCount) {
    result.push(createEmptySpreadsheetRow(batchDefaults));
  }
  return result;
}

const SpreadsheetGrid = ({
  rows = [],
  onChangeRows,
  userQuota = 0,
  batchDefaults = {},
  onChangeBatchDefaults,
  onOpenMappingModal,
  templateCustomFields = [],
  userCustomColumns = [],
  onChangeUserCustomColumns,
  sheetName = "Untitled Sheet",
  onChangeSheetName,
  savedSheets = [],
  onSaveSheet,
  onLoadSavedSheet,
  onDeleteSavedSheet,
  onNewSheet,
  lastAutoSavedAt = null,
  isProOrEnterprise = false
}) => {
  // Ensure we always have at least MIN_STARTER_ROWS so it looks & works like a real spreadsheet
  useEffect(() => {
    if (!rows || rows.length < MIN_STARTER_ROWS) {
      onChangeRows(ensureMinimumRows(rows, MIN_STARTER_ROWS, batchDefaults));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows.length]);

  // Undo / Redo history stack
  const [history, setHistory] = useState([]);
  const [future, setFuture] = useState([]);

  const updateRowsWithHistory = useCallback(
    (nextRowsOrUpdater) => {
      onChangeRows((prevRows) => {
        const nextRows =
          typeof nextRowsOrUpdater === "function"
            ? nextRowsOrUpdater(prevRows)
            : nextRowsOrUpdater;
        setHistory((h) => [...h.slice(-29), prevRows]);
        setFuture([]);
        return ensureMinimumRows(nextRows, MIN_STARTER_ROWS, batchDefaults);
      });
    },
    [onChangeRows, batchDefaults]
  );

  const handleUndo = useCallback(() => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    setFuture((f) => [rows, ...f.slice(0, 29)]);
    onChangeRows(previous);
  }, [history, rows, onChangeRows]);

  const handleRedo = useCallback(() => {
    if (future.length === 0) return;
    const next = future[0];
    setFuture((f) => f.slice(1));
    setHistory((h) => [...h.slice(-29), rows]);
    onChangeRows(next);
  }, [future, rows, onChangeRows]);

  // Columns definition (Core 6 + template placeholders + user-added custom columns)
  const columns = useMemo(() => {
    const cols = PROOFDECK_CORE_FIELDS.map((f) => ({
      key: f.key,
      label: f.label,
      required: f.required,
      placeholder: f.placeholder || "",
      type: f.key === "issue_date" ? "date" : f.key === "recipient_email" ? "email" : "text",
      icon:
        f.key === "recipient_name"
          ? User
          : f.key === "recipient_email"
          ? Mail
          : f.key === "course_title"
          ? FileText
          : f.key === "issue_date"
          ? Calendar
          : PenTool,
      isCustom: false
    }));

    templateCustomFields.forEach((cf) => {
      if (!cols.some((c) => c.key === cf.key)) {
        cols.push({
          key: cf.key,
          label: cf.label,
          required: false,
          placeholder: "",
          type: "text",
          icon: Tag,
          isCustom: false
        });
      }
    });

    userCustomColumns.forEach((uc) => {
      if (!cols.some((c) => c.key === uc.key)) {
        cols.push({
          key: uc.key,
          label: uc.label,
          required: false,
          placeholder: "",
          type: "text",
          icon: Tag,
          isCustom: true
        });
      }
    });

    return cols;
  }, [templateCustomFields, userCustomColumns]);

  // Active cell selection & edit state
  const [activeCell, setActiveCell] = useState({ rowIdx: 0, colKey: "recipient_name" });
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef(null);
  const gridContainerRef = useRef(null);

  // Add Custom Column Modal / Popover state
  const [showAddColModal, setShowAddColModal] = useState(false);
  const [newColName, setNewColName] = useState("");

  // Save / Load Sheet UI state
  const [showSavedSheetsModal, setShowSavedSheetsModal] = useState(false);
  const [showSaveAsModal, setShowSaveAsModal] = useState(false);
  const [saveAsName, setSaveAsName] = useState(sheetName || "Untitled Sheet");

  useEffect(() => {
    setSaveAsName(sheetName || "Untitled Sheet");
  }, [sheetName]);

  // Filter state: show only rows needing attention
  const [filterNeedsAttention, setFilterNeedsAttention] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const customKeys = useMemo(
    () => [
      ...templateCustomFields.map((cf) => cf.key),
      ...userCustomColumns.map((uc) => uc.key)
    ],
    [templateCustomFields, userCustomColumns]
  );

  // Validate all rows using single source of truth
  const { validationMap, nonEmptyRowsCount, readyRowsCount, invalidRowsCount } = useMemo(() => {
    const map = new Map();
    const emailCounts = new Map();

    // Pass 1: Count email frequencies strictly among non-empty rows
    rows.forEach((r) => {
      if (isRowNonEmpty(r, customKeys)) {
        const email = String(r.recipient_email || "").trim().toLowerCase();
        if (email && looksLikeEmail(email)) {
          emailCounts.set(email, (emailCounts.get(email) || 0) + 1);
        }
      }
    });

    let nonEmptyCount = 0;
    let invalidCount = 0;

    // Pass 2: Inspect row cells
    rows.forEach((r, idx) => {
      const isNonEmpty = isRowNonEmpty(r, customKeys);
      if (!isNonEmpty) {
        map.set(idx, { cellErrors: {}, hasErrors: false, isEmpty: true });
        return;
      }

      nonEmptyCount += 1;
      const { isValid, cellErrors } = validateRow(r, emailCounts);
      if (!isValid) {
        invalidCount += 1;
      }

      map.set(idx, { cellErrors, hasErrors: !isValid, isEmpty: false });
    });

    return {
      validationMap: map,
      nonEmptyRowsCount: nonEmptyCount,
      invalidRowsCount: invalidCount,
      readyRowsCount: nonEmptyCount - invalidCount
    };
  }, [rows, customKeys]);

  // Filtered rows indices
  const displayedRowIndices = useMemo(() => {
    const indices = [];
    rows.forEach((_, idx) => {
      const v = validationMap.get(idx);
      if (filterNeedsAttention) {
        if (!v?.isEmpty && v?.hasErrors) {
          indices.push(idx);
        }
      } else {
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
    }
  }, [isEditing, activeCell]);

  // Start editing a cell
  const startEditing = useCallback(
    (rowIdx, colKey, initialVal = undefined) => {
      setActiveCell({ rowIdx, colKey });
      setEditValue(initialVal !== undefined ? initialVal : rows[rowIdx]?.[colKey] ?? "");
      setIsEditing(true);
    },
    [rows]
  );

  // Commit editing change
  const commitEdit = useCallback(() => {
    if (!isEditing) return;
    const { rowIdx, colKey } = activeCell;
    const currentVal = rows[rowIdx]?.[colKey] ?? "";
    const trimmed = editValue.trim();
    if (String(currentVal) !== trimmed) {
      updateRowsWithHistory((prev) => {
        const next = [...prev];
        if (next[rowIdx]) {
          next[rowIdx] = {
            ...next[rowIdx],
            [colKey]: trimmed
          };
        }
        return next;
      });
    }
    setIsEditing(false);
  }, [isEditing, activeCell, editValue, rows, updateRowsWithHistory]);

  // Add 1 or N empty rows
  const handleAddRows = useCallback(
    (count = 1) => {
      const targetRowIdx = rows.length;
      updateRowsWithHistory((prev) => {
        const added = Array.from({ length: count }, () =>
          createEmptySpreadsheetRow(batchDefaults)
        );
        return [...prev, ...added];
      });
      setActiveCell({ rowIdx: targetRowIdx, colKey: "recipient_name" });
    },
    [rows.length, batchDefaults, updateRowsWithHistory]
  );

  // Insert a row below a given row index
  const handleInsertRowBelow = (rowIdx) => {
    updateRowsWithHistory((prev) => {
      const next = [...prev];
      next.splice(rowIdx + 1, 0, createEmptySpreadsheetRow(batchDefaults));
      return next;
    });
    setActiveCell({ rowIdx: rowIdx + 1, colKey: "recipient_name" });
  };

  // Duplicate a specific row
  const handleDuplicateRow = (rowIdx) => {
    updateRowsWithHistory((prev) => {
      const next = [...prev];
      const source = prev[rowIdx] || createEmptySpreadsheetRow(batchDefaults);
      const clone = { ...source };
      delete clone.id;
      delete clone.verification_id;
      next.splice(rowIdx + 1, 0, clone);
      return next;
    });
    toast.success(`Row ${rowIdx + 1} duplicated`);
  };

  // Delete specific row (or clear it if at minimum rows)
  const handleDeleteRow = (rowIdx) => {
    updateRowsWithHistory((prev) => {
      const next = prev.filter((_, idx) => idx !== rowIdx);
      return ensureMinimumRows(next, MIN_STARTER_ROWS, batchDefaults);
    });
    if (activeCell.rowIdx >= rows.length - 1) {
      setActiveCell((prev) => ({ ...prev, rowIdx: Math.max(0, rows.length - 2) }));
    }
  };

  // Fill Down: Copy active cell's value down to all non-empty rows below (or next 10 rows if empty)
  const handleFillDown = useCallback(() => {
    const { rowIdx, colKey } = activeCell;
    const sourceVal = isEditing ? editValue.trim() : String(rows[rowIdx]?.[colKey] ?? "");
    if (isEditing) setIsEditing(false);

    updateRowsWithHistory((prev) => {
      const next = [...prev];
      // Find last non-empty row index
      let lastNonEmptyIdx = -1;
      next.forEach((r, idx) => {
        if (isRowNonEmpty(r, customKeys)) lastNonEmptyIdx = idx;
      });
      const endIdx = lastNonEmptyIdx > rowIdx ? lastNonEmptyIdx : Math.min(next.length - 1, rowIdx + 5);
      for (let i = rowIdx + 1; i <= endIdx; i += 1) {
        next[i] = { ...next[i], [colKey]: sourceVal };
      }
      return next;
    });

    const colLabel = columns.find((c) => c.key === colKey)?.label || colKey;
    toast.success(`Filled "${colLabel}" down from row ${rowIdx + 1}`);
  }, [activeCell, isEditing, editValue, rows, customKeys, columns, updateRowsWithHistory]);

  // Add Custom Column
  const handleAddCustomColumn = (e) => {
    e.preventDefault();
    const raw = newColName.trim();
    if (!raw) return;
    const key = raw
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");
    if (!key) return toast.error("Please enter a valid column name.");
    if (columns.some((c) => c.key === key)) {
      return toast.error("A column with that name already exists.");
    }
    if (onChangeUserCustomColumns) {
      onChangeUserCustomColumns((prev) => [...prev, { key, label: raw }]);
    }
    setNewColName("");
    setShowAddColModal(false);
    toast.success(`Added column "${raw}"`);
  };

  const handleRemoveCustomColumn = (colKey) => {
    if (onChangeUserCustomColumns) {
      onChangeUserCustomColumns((prev) => prev.filter((c) => c.key !== colKey));
    }
    if (activeCell.colKey === colKey) {
      setActiveCell((prev) => ({ ...prev, colKey: "recipient_name" }));
    }
  };

  const [showClearModal, setShowClearModal] = useState(false);

  const handleConfirmClearAll = () => {
    updateRowsWithHistory(ensureMinimumRows([], MIN_STARTER_ROWS, batchDefaults));
    setActiveCell({ rowIdx: 0, colKey: "recipient_name" });
    setShowClearModal(false);
    toast.success("Spreadsheet cleared");
  };

  // Apply batch defaults to all non-empty rows (or empty cells in non-empty rows)
  const handleApplyDefaultsToBatch = () => {
    updateRowsWithHistory((prev) =>
      prev.map((r) => {
        if (!isRowNonEmpty(r, customKeys)) {
          return {
            ...r,
            course_title: r.course_title || batchDefaults.course_title || "",
            issuer_name: r.issuer_name || batchDefaults.issuer_name || "",
            issue_date: r.issue_date || batchDefaults.issue_date || "",
            signature: r.signature || batchDefaults.signature || ""
          };
        }
        return {
          ...r,
          course_title: r.course_title || batchDefaults.course_title || "",
          issuer_name: r.issuer_name || batchDefaults.issuer_name || "",
          issue_date: r.issue_date || batchDefaults.issue_date || "",
          signature: r.signature || batchDefaults.signature || ""
        };
      })
    );
    toast.success("Batch defaults applied to all rows!");
  };

  // Export current spreadsheet to CSV or Excel (.xlsx)
  const handleExportFile = (format = "xlsx") => {
    const nonEmpty = rows.filter((r) => isRowNonEmpty(r, customKeys));
    const sourceRows = nonEmpty.length > 0 ? nonEmpty : rows.slice(0, 5);

    const exportData = sourceRows.map((r) => {
      const obj = {};
      columns.forEach((col) => {
        obj[col.label] = r[col.key] ?? "";
      });
      return obj;
    });

    const safeFileBase =
      (sheetName || "proofdeck_spreadsheet")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9-_]+/g, "_") || "proofdeck_spreadsheet";

    if (format === "csv") {
      const csvStr = Papa.unparse(exportData);
      const blob = new Blob([csvStr], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${safeFileBase}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success(`Downloaded ${safeFileBase}.csv`);
    } else {
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Recipients");
      XLSX.writeFile(wb, `${safeFileBase}.xlsx`);
      toast.success(`Downloaded ${safeFileBase}.xlsx`);
    }
  };

  // Copy active cell value to clipboard
  const handleCopy = useCallback(
    (e) => {
      if (isEditing) return; // let native input selection copy work
      const { rowIdx, colKey } = activeCell;
      const val = rows[rowIdx]?.[colKey] ?? "";
      if (e.clipboardData) {
        e.clipboardData.setData("text/plain", String(val));
        e.preventDefault();
        toast.success("Copied cell", { duration: 1200 });
      }
    },
    [isEditing, activeCell, rows]
  );

  // Multi-row, multi-column paste handler (Excel / Google Sheets)
  const handlePaste = useCallback(
    (e) => {
      const text = e.clipboardData.getData("text");
      if (!text) return;

      const isMultiCell = text.includes("\t") || text.includes("\n") || text.includes("\r");
      if (!isMultiCell && isEditing) {
        // Normal single-cell paste while editing input: let browser handle it
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

      updateRowsWithHistory((prev) => {
        const newRows = [...prev];
        const targetRowCount = Math.max(
          MIN_STARTER_ROWS,
          newRows.length,
          startRowIdx + pasteMatrix.length + 2
        );

        while (newRows.length < targetRowCount) {
          newRows.push(createEmptySpreadsheetRow(batchDefaults));
        }

        pasteMatrix.forEach((pRow, rOffset) => {
          const destRowIdx = startRowIdx + rOffset;
          newRows[destRowIdx] = { ...newRows[destRowIdx] };
          pRow.forEach((cellVal, cOffset) => {
            const destColIdx = validColIdx + cOffset;
            if (destColIdx < columns.length) {
              const colKey = columns[destColIdx].key;
              newRows[destRowIdx][colKey] = cellVal.trim();
            }
          });
        });

        return newRows;
      });

      setIsEditing(false);
      if (pasteMatrix.length > 1 || pasteMatrix[0].length > 1) {
        toast.success(`Pasted ${pasteMatrix.length} ${pasteMatrix.length === 1 ? "row" : "rows"} of data!`);
      }
    },
    [activeCell, columns, isEditing, batchDefaults, updateRowsWithHistory]
  );

  // Ensure active row is visible on current page when navigating with keyboard
  const ensureRowPageVisible = useCallback(
    (targetRowIdx) => {
      const pos = displayedRowIndices.indexOf(targetRowIdx);
      if (pos !== -1) {
        const targetPage = Math.floor(pos / pageSize) + 1;
        if (targetPage !== currentPage) {
          setCurrentPage(targetPage);
        }
      }
    },
    [displayedRowIndices, pageSize, currentPage]
  );

  // Spreadsheet keyboard navigation & shortcuts
  const handleKeyDown = useCallback(
    (e) => {
      // Undo / Redo shortcuts
      if ((e.ctrlKey || e.metaKey) && !isEditing) {
        if (e.key.toLowerCase() === "z") {
          e.preventDefault();
          if (e.shiftKey) {
            handleRedo();
          } else {
            handleUndo();
          }
          return;
        }
        if (e.key.toLowerCase() === "y") {
          e.preventDefault();
          handleRedo();
          return;
        }
        if (e.key.toLowerCase() === "d") {
          e.preventDefault();
          handleFillDown();
          return;
        }
        if (e.key.toLowerCase() === "s") {
          e.preventDefault();
          setShowSaveAsModal(true);
          return;
        }
      }

      const { rowIdx, colKey } = activeCell;
      const colIdx = columns.findIndex((c) => c.key === colKey);

      if (isEditing) {
        if (e.key === "Enter") {
          e.preventDefault();
          commitEdit();
          if (e.shiftKey) {
            const prevRow = Math.max(0, rowIdx - 1);
            setActiveCell({ rowIdx: prevRow, colKey });
            ensureRowPageVisible(prevRow);
          } else if (rowIdx < rows.length - 1) {
            const nextRow = rowIdx + 1;
            setActiveCell({ rowIdx: nextRow, colKey });
            ensureRowPageVisible(nextRow);
          } else {
            handleAddRows(1);
          }
        } else if (e.key === "Tab") {
          e.preventDefault();
          commitEdit();
          if (e.shiftKey) {
            if (colIdx > 0) {
              setActiveCell({ rowIdx, colKey: columns[colIdx - 1].key });
            } else if (rowIdx > 0) {
              const prevRow = rowIdx - 1;
              setActiveCell({ rowIdx: prevRow, colKey: columns[columns.length - 1].key });
              ensureRowPageVisible(prevRow);
            }
          } else {
            if (colIdx < columns.length - 1) {
              setActiveCell({ rowIdx, colKey: columns[colIdx + 1].key });
            } else if (rowIdx < rows.length - 1) {
              const nextRow = rowIdx + 1;
              setActiveCell({ rowIdx: nextRow, colKey: columns[0].key });
              ensureRowPageVisible(nextRow);
            } else {
              handleAddRows(1);
            }
          }
        } else if (e.key === "Escape") {
          e.preventDefault();
          setIsEditing(false);
          gridContainerRef.current?.focus();
        }
        return;
      }

      // Not editing: Grid navigation mode
      if (e.key === "ArrowUp") {
        e.preventDefault();
        if (rowIdx > 0) {
          const prevRow = rowIdx - 1;
          setActiveCell({ rowIdx: prevRow, colKey });
          ensureRowPageVisible(prevRow);
        }
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        if (rowIdx < rows.length - 1) {
          const nextRow = rowIdx + 1;
          setActiveCell({ rowIdx: nextRow, colKey });
          ensureRowPageVisible(nextRow);
        } else {
          handleAddRows(1);
        }
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (colIdx > 0) setActiveCell({ rowIdx, colKey: columns[colIdx - 1].key });
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        if (colIdx < columns.length - 1) setActiveCell({ rowIdx, colKey: columns[colIdx + 1].key });
      } else if (e.key === "Tab") {
        e.preventDefault();
        if (e.shiftKey) {
          if (colIdx > 0) {
            setActiveCell({ rowIdx, colKey: columns[colIdx - 1].key });
          } else if (rowIdx > 0) {
            const prevRow = rowIdx - 1;
            setActiveCell({ rowIdx: prevRow, colKey: columns[columns.length - 1].key });
            ensureRowPageVisible(prevRow);
          }
        } else {
          if (colIdx < columns.length - 1) {
            setActiveCell({ rowIdx, colKey: columns[colIdx + 1].key });
          } else if (rowIdx < rows.length - 1) {
            const nextRow = rowIdx + 1;
            setActiveCell({ rowIdx: nextRow, colKey: columns[0].key });
            ensureRowPageVisible(nextRow);
          }
        }
      } else if (e.key === "Enter" || e.key === "F2") {
        e.preventDefault();
        startEditing(rowIdx, colKey);
      } else if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        if (rows[rowIdx]?.[colKey]) {
          updateRowsWithHistory((prev) => {
            const next = [...prev];
            if (next[rowIdx]) {
              next[rowIdx] = { ...next[rowIdx], [colKey]: "" };
            }
            return next;
          });
        }
      } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        // Typing any character overwrites cell immediately like Excel / Google Sheets
        e.preventDefault();
        startEditing(rowIdx, colKey, e.key);
      }
    },
    [
      isEditing,
      activeCell,
      columns,
      rows,
      commitEdit,
      startEditing,
      handleAddRows,
      handleUndo,
      handleRedo,
      handleFillDown,
      ensureRowPageVisible,
      updateRowsWithHistory
    ]
  );

  // Credit calculation (strictly based on valid ready rows)
  const creditsNeeded = readyRowsCount;
  const hasSufficientCredits = userQuota >= creditsNeeded;

  return (
    <div
      ref={gridContainerRef}
      className="space-y-3 outline-none select-none"
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      onCopy={handleCopy}
      tabIndex={0}
    >
      {/* 1. SPREADSHEET WORKBOOK TOOLBAR (Sheet Name, Auto-Save Status, Save/Load/Export, Undo/Redo) */}
      <div className="bg-white p-2.5 sm:p-3 rounded-xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-2.5">
        {/* Left: Sheet Name + Auto-Save Badge */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1">
            <FileSpreadsheet size={14} className="text-emerald-600 shrink-0" />
            <input
              type="text"
              value={sheetName}
              onChange={(e) => onChangeSheetName && onChangeSheetName(e.target.value)}
              onKeyDown={(e) => e.stopPropagation()}
              placeholder="Sheet name..."
              className="text-xs font-bold text-slate-800 bg-transparent border-none focus:outline-none w-32 sm:w-40 truncate"
              title="Click to rename spreadsheet"
            />
          </div>

          {lastAutoSavedAt && (
            <span
              className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 bg-emerald-50/80 border border-emerald-200/70 px-2 py-0.5 rounded-full"
              title="Your spreadsheet is automatically saved in this browser so you can close and continue anytime"
            >
              <Check size={10} className="text-emerald-600" />
              <span>Auto-saved</span>
            </span>
          )}

          {/* Undo / Redo / Fill Down */}
          <div className="flex items-center gap-1 border-l border-slate-200 pl-2">
            <button
              type="button"
              onClick={handleUndo}
              disabled={history.length === 0}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-35 transition-colors cursor-pointer"
              title="Undo (Ctrl+Z)"
            >
              <Undo2 size={13} />
            </button>
            <button
              type="button"
              onClick={handleRedo}
              disabled={future.length === 0}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-35 transition-colors cursor-pointer"
              title="Redo (Ctrl+Y)"
            >
              <Redo2 size={13} />
            </button>
            <button
              type="button"
              onClick={handleFillDown}
              className="px-2 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              title="Copy active cell value down to rows below (Ctrl+D)"
            >
              <ArrowDownToLine size={12} className="text-indigo-600" />
              <span className="hidden sm:inline">Fill Down</span>
            </button>
          </div>
        </div>

        {/* Right: Save Sheet, Saved Sheets, Export Excel/CSV, New Sheet */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => {
              setSaveAsName(sheetName || "Untitled Sheet");
              setShowSaveAsModal(true);
            }}
            className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
            title="Save this spreadsheet to your Saved Sheets list (Ctrl+S)"
          >
            <Save size={13} />
            <span>Save Sheet</span>
          </button>

          <button
            type="button"
            onClick={() => setShowSavedSheetsModal(true)}
            className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
            title="Open a previously saved spreadsheet"
          >
            <FolderOpen size={13} className="text-indigo-600" />
            <span>Saved Sheets</span>
            {savedSheets.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold">
                {savedSheets.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => handleExportFile("xlsx")}
            className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 shadow-2xs transition-all cursor-pointer"
            title="Download as Excel (.xlsx) file"
          >
            <Download size={13} className="text-emerald-600" />
            <span>Excel</span>
          </button>

          <button
            type="button"
            onClick={() => handleExportFile("csv")}
            className="px-2 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 text-xs font-semibold flex items-center gap-1 shadow-2xs transition-all cursor-pointer"
            title="Download as CSV (.csv) file"
          >
            <span>CSV</span>
          </button>

          {onNewSheet && (
            <button
              type="button"
              onClick={onNewSheet}
              className="p-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              title="Start a new blank spreadsheet"
            >
              <FilePlus2 size={14} />
            </button>
          )}
        </div>
      </div>

      {/* 2. VALIDATION METRICS & CREDIT STATUS BAR */}
      <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        {/* Left: Validation Counts & Filter */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {nonEmptyRowsCount === 0 ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-xs font-semibold shadow-2xs">
              <CheckCircle2 size={13} className="text-slate-400" />
              <span>Ready — Only Recipient Name is compulsory</span>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-2xs">
                <CheckCircle2 size={13} className="text-emerald-600" />
                <span>{readyRowsCount} ready</span>
              </div>

              {invalidRowsCount > 0 ? (
                <button
                  type="button"
                  onClick={() => setFilterNeedsAttention(!filterNeedsAttention)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all border shadow-2xs cursor-pointer ${
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
                <span className="text-xs text-slate-500 font-medium">
                  All {readyRowsCount} {readyRowsCount === 1 ? "row" : "rows"} valid (Email &amp; other fields are optional)
                </span>
              )}

              {onOpenMappingModal && (
                <button
                  type="button"
                  onClick={onOpenMappingModal}
                  className="text-indigo-650 hover:text-indigo-800 text-xs font-bold flex items-center gap-1 ml-1 transition-colors cursor-pointer"
                >
                  <Filter size={12} />
                  <span>Map Columns</span>
                </button>
              )}
            </>
          )}
        </div>

        {/* Right: Credit Quota Status */}
        <div className="flex items-center gap-2.5">
          <div
            className={`px-3 py-1 rounded-lg text-xs font-bold border flex items-center gap-1.5 ${
              hasSufficientCredits
                ? "bg-slate-50 text-slate-800 border-slate-200"
                : "bg-red-50 text-red-700 border-red-200"
            }`}
          >
            <Zap size={13} className={hasSufficientCredits ? "text-indigo-500" : "text-red-500"} />
            <span>
              Requires <strong className="font-extrabold">{creditsNeeded}</strong> credits
            </span>
            <span className="text-slate-400 font-normal">|</span>
            <span className="text-slate-500 font-normal">
              <strong className="font-bold text-slate-800">{userQuota}</strong> available
            </span>
          </div>

          {nonEmptyRowsCount > 0 && (
            <button
              type="button"
              onClick={() => setShowClearModal(true)}
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
              title="Clear all rows"
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      </div>

      {/* INSUFFICIENT CREDITS WARNING ALERT */}
      {!hasSufficientCredits && creditsNeeded > 0 && (
        <div className="bg-red-50/90 border border-red-200 p-3 rounded-xl flex items-center justify-between text-xs text-red-800 animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-red-600 shrink-0" />
            <span>
              <strong>Insufficient credits:</strong> This batch requires {creditsNeeded} credits, but you have {userQuota} remaining. You can still save or export your spreadsheet now and issue later.
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

      {/* 3. BATCH DEFAULTS BAR (Fill once for the whole batch) */}
      <div className="bg-slate-50/80 p-2.5 sm:p-3 rounded-xl border border-slate-200/80 flex flex-wrap items-center justify-between gap-2.5 text-xs">
        <div className="flex items-center gap-1.5 text-slate-700 font-bold">
          <SlidersHorizontal size={13} className="text-indigo-600 shrink-0" />
          <span>Batch Defaults (Optional):</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            placeholder="Batch Course / Event..."
            value={batchDefaults.course_title || ""}
            onChange={(e) =>
              onChangeBatchDefaults((prev) => ({ ...prev, course_title: e.target.value }))
            }
            onKeyDown={(e) => e.stopPropagation()}
            className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-indigo-500 w-36 shadow-2xs"
          />

          <input
            type="text"
            placeholder="Batch Issuer..."
            value={batchDefaults.issuer_name || ""}
            onChange={(e) =>
              onChangeBatchDefaults((prev) => ({ ...prev, issuer_name: e.target.value }))
            }
            onKeyDown={(e) => e.stopPropagation()}
            className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-indigo-500 w-32 shadow-2xs"
          />

          <input
            type="date"
            value={batchDefaults.issue_date || ""}
            onChange={(e) =>
              onChangeBatchDefaults((prev) => ({ ...prev, issue_date: e.target.value }))
            }
            onKeyDown={(e) => e.stopPropagation()}
            className="px-2 py-1 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-indigo-500 shadow-2xs"
          />

          <input
            type="text"
            placeholder="Batch Signatory..."
            value={batchDefaults.signature || ""}
            onChange={(e) =>
              onChangeBatchDefaults((prev) => ({ ...prev, signature: e.target.value }))
            }
            onKeyDown={(e) => e.stopPropagation()}
            className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-indigo-500 w-32 shadow-2xs"
          />

          <button
            type="button"
            onClick={handleApplyDefaultsToBatch}
            className="px-2.5 py-1 text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-700 transition-colors shadow-2xs cursor-pointer"
          >
            Apply to all rows
          </button>
        </div>
      </div>

      {/* 4. INTERACTIVE SPREADSHEET TABLE */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto max-h-[480px] overflow-y-auto scrollbar-thin">
          <table className="min-w-full divide-y divide-slate-200 border-collapse text-xs">
            {/* SPREADSHEET HEADER */}
            <thead className="bg-slate-100 sticky top-0 z-10 select-none">
              <tr>
                <th className="w-10 px-2 py-2 text-center font-bold text-slate-500 border-r border-b border-slate-200 bg-slate-100">
                  #
                </th>
                {columns.map((col, cIdx) => {
                  const Icon = col.icon;
                  const colLetter = String.fromCharCode(65 + (cIdx % 26));
                  const isActiveCol = activeCell.colKey === col.key;
                  return (
                    <th
                      key={col.key}
                      className={`px-3 py-2 text-left font-bold border-r border-b border-slate-200 min-w-[165px] transition-colors ${
                        isActiveCol ? "bg-indigo-50/70 text-indigo-900" : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-[10px] font-mono text-slate-400 bg-white/80 px-1 rounded border border-slate-200/80">
                            {colLetter}
                          </span>
                          <Icon size={12} className="text-slate-400 shrink-0" />
                          <span className="truncate">{col.label}</span>
                          {col.required ? (
                            <span
                              className="text-red-500 font-bold"
                              title="Compulsory column"
                            >
                              *
                            </span>
                          ) : (
                            <span className="text-[9px] font-normal text-slate-400">
                              (optional)
                            </span>
                          )}
                        </div>
                        {col.isCustom && (
                          <button
                            type="button"
                            onClick={() => handleRemoveCustomColumn(col.key)}
                            className="text-slate-400 hover:text-red-600 p-0.5 rounded"
                            title={`Remove custom column "${col.label}"`}
                          >
                            <X size={11} />
                          </button>
                        )}
                      </div>
                    </th>
                  );
                })}
                {/* Add Custom Column Header Button */}
                <th className="w-24 px-2 py-1.5 text-center border-b border-slate-200 bg-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddColModal(true)}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded bg-white hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 border border-slate-200 text-[10px] font-bold transition-colors cursor-pointer"
                    title="Add a custom column (e.g. Grade, Matric No, Department)"
                  >
                    <Plus size={11} />
                    <span>Column</span>
                  </button>
                </th>
              </tr>
            </thead>

            {/* SPREADSHEET BODY */}
            <tbody className="divide-y divide-slate-200/70 bg-white">
              {currentIndices.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + 2}
                    className="py-10 text-center text-slate-400"
                  >
                    <p className="text-xs font-semibold mb-2">No rows match the current filter</p>
                    <button
                      type="button"
                      onClick={() => setFilterNeedsAttention(false)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-black transition-all"
                    >
                      <span>Show All Rows</span>
                    </button>
                  </td>
                </tr>
              ) : (
                currentIndices.map((realRowIdx) => {
                  const row = rows[realRowIdx];
                  const rowValidation = validationMap.get(realRowIdx);
                  const isRowInvalid = rowValidation?.hasErrors && !rowValidation?.isEmpty;
                  const isActiveRow = activeCell.rowIdx === realRowIdx;

                  return (
                    <tr
                      key={realRowIdx}
                      className={`transition-colors ${
                        isRowInvalid
                          ? "bg-red-50/25"
                          : isActiveRow
                          ? "bg-indigo-50/15"
                          : "hover:bg-slate-50/60"
                      }`}
                    >
                      {/* Row Number Indicator */}
                      <td
                        className={`px-2 py-1.5 text-center text-[10px] font-mono border-r border-slate-200 select-none ${
                          isActiveRow
                            ? "bg-indigo-100/80 text-indigo-800 font-bold"
                            : "bg-slate-50 text-slate-400"
                        }`}
                      >
                        {realRowIdx + 1}
                      </td>

                      {/* Cells */}
                      {columns.map((col) => {
                        const cellValue = row?.[col.key] ?? "";
                        const isCellSelected =
                          activeCell.rowIdx === realRowIdx && activeCell.colKey === col.key;
                        const cellError = !rowValidation?.isEmpty
                          ? rowValidation?.cellErrors?.[col.key]
                          : null;

                        return (
                          <td
                            key={col.key}
                            onClick={() => {
                              if (
                                isEditing &&
                                (activeCell.rowIdx !== realRowIdx || activeCell.colKey !== col.key)
                              ) {
                                commitEdit();
                              }
                              setActiveCell({ rowIdx: realRowIdx, colKey: col.key });
                            }}
                            onDoubleClick={() => startEditing(realRowIdx, col.key)}
                            className={`px-2.5 py-1.5 border-r border-slate-200 relative truncate cursor-cell transition-all h-8 ${
                              isCellSelected
                                ? "outline-2 -outline-offset-2 outline-indigo-600 bg-indigo-50/40 z-2"
                                : ""
                            } ${cellError ? "bg-red-50/70" : ""}`}
                            title={
                              cellError ||
                              cellValue ||
                              "Click to select, start typing or double-click to edit"
                            }
                          >
                            {isEditing && isCellSelected ? (
                              <input
                                ref={inputRef}
                                type={col.type === "date" ? "date" : "text"}
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onBlur={commitEdit}
                                className="w-full text-xs p-0 border-none bg-transparent focus:outline-none text-slate-900 font-medium"
                              />
                            ) : (
                              <div className="flex items-center justify-between gap-1 min-h-[18px]">
                                <span
                                  className={`truncate ${
                                    !cellValue
                                      ? "text-slate-300 text-[11px]"
                                      : col.key === "recipient_name"
                                      ? "text-slate-900 font-medium"
                                      : "text-slate-800"
                                  }`}
                                >
                                  {cellValue ||
                                    (!rowValidation?.isEmpty && col.required ? "Required *" : "")}
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

                      {/* Row Actions (Insert Below, Duplicate, Delete) */}
                      <td className="px-1.5 py-1 text-center whitespace-nowrap">
                        <div className="inline-flex items-center gap-0.5">
                          <button
                            type="button"
                            onClick={() => handleInsertRowBelow(realRowIdx)}
                            className="text-slate-300 hover:text-indigo-600 transition-colors p-1 rounded"
                            title="Insert row below"
                          >
                            <Plus size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDuplicateRow(realRowIdx)}
                            className="text-slate-300 hover:text-indigo-600 transition-colors p-1 rounded"
                            title="Duplicate row"
                          >
                            <Copy size={11} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteRow(realRowIdx)}
                            className="text-slate-300 hover:text-red-600 transition-colors p-1 rounded"
                            title="Delete / clear row"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 5. SPREADSHEET FOOTER BAR */}
        <div className="bg-slate-50 px-3.5 py-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => handleAddRows(1)}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer"
            >
              <Plus size={12} />
              <span>+1 Row</span>
            </button>

            <button
              type="button"
              onClick={() => handleAddRows(10)}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold transition-all shadow-2xs cursor-pointer"
            >
              <Plus size={12} />
              <span>+10 Rows</span>
            </button>

            <span className="text-[11px] text-slate-400 hidden md:inline">
              Shortcuts: Type directly to edit &bull; <kbd className="px-1 py-0.5 bg-white border border-slate-200 rounded text-[10px]">Ctrl+V</kbd> Paste from Excel &bull; <kbd className="px-1 py-0.5 bg-white border border-slate-200 rounded text-[10px]">Ctrl+Z</kbd> Undo &bull; <kbd className="px-1 py-0.5 bg-white border border-slate-200 rounded text-[10px]">Ctrl+D</kbd> Fill Down
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

      {/* SAVE SHEET MODAL */}
      <Modal
        show={showSaveAsModal}
        onHide={() => setShowSaveAsModal(false)}
        centered
        contentClassName="rounded-xl border border-slate-200 shadow-xl overflow-hidden bg-white"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const finalName = saveAsName.trim() || "Untitled Sheet";
            if (onChangeSheetName) onChangeSheetName(finalName);
            if (onSaveSheet) onSaveSheet(finalName);
            setShowSaveAsModal(false);
          }}
        >
          <Modal.Body className="p-5 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <Save size={18} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-800 mb-0">
                  Save Spreadsheet Draft
                </h3>
                <p className="text-xs text-slate-500 mb-0">
                  Save your work to resume anytime, even if you&apos;re not issuing certificates right now.
                </p>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Spreadsheet Name
              </label>
              <input
                type="text"
                value={saveAsName}
                onChange={(e) => setSaveAsName(e.target.value)}
                onKeyDown={(e) => e.stopPropagation()}
                placeholder="e.g. Cohort 4 Graduating List"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500"
                autoFocus
              />
            </div>
          </Modal.Body>
          <Modal.Footer className="border-0 pt-0 bg-slate-50/70 p-3.5 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowSaveAsModal(false)}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-2xs"
            >
              Save Spreadsheet
            </button>
          </Modal.Footer>
        </form>
      </Modal>

      {/* SAVED SHEETS MANAGER MODAL */}
      <Modal
        show={showSavedSheetsModal}
        onHide={() => setShowSavedSheetsModal(false)}
        centered
        contentClassName="rounded-xl border border-slate-200 shadow-xl overflow-hidden bg-white"
      >
        <Modal.Body className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <FolderOpen size={18} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-800 mb-0">
                  Saved Spreadsheets
                </h3>
                <p className="text-xs text-slate-500 mb-0">
                  Load a saved spreadsheet draft or export it to Excel/CSV
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowSavedSheetsModal(false)}
              className="p-1 text-slate-400 hover:text-slate-600 rounded"
            >
              <X size={16} />
            </button>
          </div>

          {savedSheets.length === 0 ? (
            <div className="text-center py-8 bg-slate-50 rounded-xl border border-slate-200/70">
              <FileSpreadsheet size={24} className="mx-auto text-slate-400 mb-2" />
              <p className="text-xs font-semibold text-slate-700 mb-1">
                No named spreadsheets saved yet
              </p>
              <p className="text-[11px] text-slate-400 mb-0 px-4">
                Your active spreadsheet is auto-saved automatically. Click <strong>&ldquo;Save Sheet&rdquo;</strong> in the toolbar to save named snapshots you can switch between.
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {savedSheets.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl border border-slate-200 hover:border-indigo-200 bg-slate-50/60 flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-800 truncate">
                      {item.name}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {item.rowCount || 0} recipient {item.rowCount === 1 ? "row" : "rows"} &bull; Saved{" "}
                      {item.updatedAt
                        ? new Date(item.updatedAt).toLocaleString()
                        : "recently"}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        if (onLoadSavedSheet) onLoadSavedSheet(item);
                        setShowSavedSheetsModal(false);
                      }}
                      className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-black text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      Open
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteSavedSheet && onDeleteSavedSheet(item.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Delete saved sheet"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Modal.Body>
      </Modal>

      {/* ADD CUSTOM COLUMN MODAL */}
      <Modal
        show={showAddColModal}
        onHide={() => setShowAddColModal(false)}
        centered
        contentClassName="rounded-xl border border-slate-200 shadow-xl overflow-hidden bg-white"
      >
        <form onSubmit={handleAddCustomColumn}>
          <Modal.Body className="p-5 space-y-3">
            <h3 className="font-bold text-sm text-slate-800 mb-1">
              Add Custom Column
            </h3>
            <p className="text-xs text-slate-500 mb-2">
              Add an extra column to your spreadsheet (e.g., Grade, Department, Score, Matric Number). If your template has a matching <code className="text-indigo-600">{"{{column_name}}"}</code> placeholder, it will populate automatically.
            </p>
            <input
              type="text"
              value={newColName}
              onChange={(e) => setNewColName(e.target.value)}
              onKeyDown={(e) => e.stopPropagation()}
              placeholder="e.g. Grade or Department"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500"
              autoFocus
            />
          </Modal.Body>
          <Modal.Footer className="border-0 pt-0 bg-slate-50/70 p-3.5 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddColModal(false)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-black rounded-lg"
            >
              Add Column
            </button>
          </Modal.Footer>
        </form>
      </Modal>

      {/* CLEAR ALL ROWS CONFIRMATION MODAL */}
      <Modal
        show={showClearModal}
        onHide={() => setShowClearModal(false)}
        centered
        contentClassName="rounded-xl border border-slate-200/80 dark:border-zinc-800 shadow-xl overflow-hidden bg-white dark:bg-zinc-900"
      >
        <Modal.Body className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-full shrink-0">
              <AlertCircle size={22} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800 dark:text-zinc-100 mb-1.5">
                Clear All Spreadsheet Rows?
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed mb-0">
                Are you sure you want to clear all{" "}
                <strong className="text-slate-700 dark:text-zinc-200">{nonEmptyRowsCount} entered rows</strong> from the
                spreadsheet?
              </p>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0 bg-slate-50/50 dark:bg-zinc-900/60 p-4">
          <button
            type="button"
            onClick={() => setShowClearModal(false)}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-700 rounded-lg transition-colors shadow-2xs"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmClearAll}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-2xs transition-colors"
          >
            Clear All Rows
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default SpreadsheetGrid;
