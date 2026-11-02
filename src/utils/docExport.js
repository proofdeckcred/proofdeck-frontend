import { jsPDF } from "jspdf";

/**
 * Decode HTML entities (&nbsp;, &amp;, etc.) into clean plain text
 */
export function decodeHtmlEntities(str = "") {
  if (!str) return "";
  if (typeof document !== "undefined") {
    const txt = document.createElement("textarea");
    txt.innerHTML = str.replace(/&nbsp;/gi, " ");
    return txt.value;
  }
  return str
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");
}

/**
 * Parse CSS RGB/Hex color into [r, g, b] array for jsPDF
 */
function parseCssColor(colorStr, fallback = [17, 24, 39]) {
  if (!colorStr) return fallback;
  const s = colorStr.trim();
  if (s.startsWith("#")) {
    const hex = s.slice(1);
    if (hex.length === 3) {
      return [
        parseInt(hex[0] + hex[0], 16),
        parseInt(hex[1] + hex[1], 16),
        parseInt(hex[2] + hex[2], 16),
      ];
    }
    if (hex.length >= 6) {
      return [
        parseInt(hex.slice(0, 2), 16),
        parseInt(hex.slice(2, 4), 16),
        parseInt(hex.slice(4, 6), 16),
      ];
    }
  }
  const rgbMatch = s.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (rgbMatch) {
    return [
      parseInt(rgbMatch[1], 10),
      parseInt(rgbMatch[2], 10),
      parseInt(rgbMatch[3], 10),
    ];
  }
  return fallback;
}

/**
 * Map editor font family to standard jsPDF font family
 */
function mapPdfFont(fontFamily = "") {
  const f = fontFamily.toLowerCase();
  if (f.includes("times") || f.includes("georgia") || f.includes("garamond") || f.includes("merriweather") || f.includes("playfair") || f.includes("serif")) {
    return "times";
  }
  if (f.includes("courier") || f.includes("mono") || f.includes("consolas")) {
    return "courier";
  }
  return "helvetica";
}

/**
 * Extract styled text runs from a DOM element for PDF/DOCX rendering
 */
function extractRuns(node, inherited = { bold: false, italic: false, underline: false, strike: false, fontSizePt: null, color: null, fontFamily: null }) {
  const runs = [];
  if (!node) return runs;

  if (node.nodeType === Node.TEXT_NODE) {
    const text = decodeHtmlEntities(node.nodeValue || "").replace(/\u00A0/g, " ");
    if (text) {
      runs.push({ text, ...inherited });
    }
    return runs;
  }

  if (node.nodeType !== Node.ELEMENT_NODE) return runs;
  const el = node;
  const tag = el.tagName.toUpperCase();

  if (tag === "BR") {
    runs.push({ text: "\n", ...inherited });
    return runs;
  }

  const nextStyle = { ...inherited };
  if (tag === "B" || tag === "STRONG") nextStyle.bold = true;
  if (tag === "I" || tag === "EM") nextStyle.italic = true;
  if (tag === "U") nextStyle.underline = true;
  if (tag === "S" || tag === "STRIKE" || tag === "DEL") nextStyle.strike = true;

  if (el.classList && el.classList.contains("pd-chip")) {
    nextStyle.bold = true;
  }

  if (el.style) {
    const fw = el.style.fontWeight;
    if (fw === "bold" || parseInt(fw, 10) >= 600) nextStyle.bold = true;
    if (el.style.fontStyle === "italic") nextStyle.italic = true;
    if (el.style.textDecoration && el.style.textDecoration.includes("underline")) nextStyle.underline = true;
    if (el.style.fontSize) {
      const val = parseFloat(el.style.fontSize);
      if (!isNaN(val)) {
        nextStyle.fontSizePt = el.style.fontSize.includes("px") ? Math.round(val * 0.75) : val;
      }
    }
    if (el.style.color) {
      nextStyle.color = el.style.color;
    }
    if (el.style.fontFamily) {
      nextStyle.fontFamily = el.style.fontFamily;
    }
  }

  if (tag === "FONT" && el.getAttribute("face")) {
    nextStyle.fontFamily = el.getAttribute("face");
  }
  if (tag === "A") {
    nextStyle.underline = true;
    if (!nextStyle.color) nextStyle.color = "#2563EB";
  }

  el.childNodes.forEach((child) => {
    runs.push(...extractRuns(child, nextStyle));
  });

  return runs;
}

/**
 * Export multi-page HTML document directly to a crisp, selectable A4 Vector PDF
 */
export function exportDocumentToPdf({
  title = "ProofDeck_Document",
  pagesHtml = [],
  pageMarginMm = 25,
  includeQrCode = false,
  qrPosition = "bottom-right",
}) {
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidthMm = 210;
  const pageHeightMm = 297;
  const marginMm = Math.max(15, Math.min(35, Number(pageMarginMm) || 25));
  const contentWidthMm = pageWidthMm - marginMm * 2;
  const maxBottomY = pageHeightMm - marginMm;

  const ptToMm = (pt) => pt * 0.352778;

  const parser = new DOMParser();

  pagesHtml.forEach((rawHtml, pageIdx) => {
    if (pageIdx > 0) {
      pdf.addPage();
    }

    let cursorY = marginMm;

    const ensureSpace = (neededMm) => {
      if (cursorY + neededMm > maxBottomY) {
        pdf.addPage();
        cursorY = marginMm;
      }
    };

    const doc = parser.parseFromString(`<div>${rawHtml || ""}</div>`, "text/html");
    const root = doc.body.firstElementChild || doc.body;

    const renderBlockElement = (el, listPrefix = null, indentMm = 0) => {
      if (el.nodeType === Node.TEXT_NODE) {
        const txt = decodeHtmlEntities(el.nodeValue || "").trim();
        if (!txt) return;
        const p = doc.createElement("p");
        p.textContent = txt;
        renderBlockElement(p);
        return;
      }

      if (el.nodeType !== Node.ELEMENT_NODE) return;
      const tag = el.tagName.toUpperCase();

      if (el.classList && el.classList.contains("pd-page-break")) {
        pdf.addPage();
        cursorY = marginMm;
        return;
      }

      if (tag === "HR") {
        ensureSpace(6);
        cursorY += 2;
        pdf.setDrawColor(203, 213, 225);
        pdf.setLineWidth(0.3);
        pdf.line(marginMm, cursorY, pageWidthMm - marginMm, cursorY);
        cursorY += 4;
        return;
      }

      if (tag === "UL" || tag === "OL") {
        const items = Array.from(el.children).filter((c) => c.tagName.toUpperCase() === "LI");
        items.forEach((li, idx) => {
          const prefix = tag === "OL" ? `${idx + 1}. ` : "• ";
          renderBlockElement(li, prefix, indentMm + 6);
        });
        cursorY += 1.5;
        return;
      }

      if (tag === "TABLE") {
        const rows = Array.from(el.querySelectorAll("tr"));
        if (rows.length === 0) return;

        const colCount = Math.max(
          1,
          ...rows.map((r) => r.querySelectorAll("th, td").length)
        );
        const colWidth = contentWidthMm / colCount;

        cursorY += 2;

        rows.forEach((row, rIdx) => {
          const cells = Array.from(row.querySelectorAll("th, td"));
          const isHeader = row.parentElement?.tagName.toUpperCase() === "THEAD" || cells.some((c) => c.tagName.toUpperCase() === "TH");
          const cellFontSizePt = 10;
          const lineHeightMm = ptToMm(cellFontSizePt) * 1.45;

          // Wrap text for each cell to determine row height
          const cellLines = cells.map((cell) => {
            const rawText = decodeHtmlEntities(cell.textContent || "").replace(/\s+/g, " ").trim();
            pdf.setFont("helvetica", isHeader ? "bold" : "normal");
            pdf.setFontSize(cellFontSizePt);
            return pdf.splitTextToSize(rawText || " ", Math.max(10, colWidth - 5));
          });

          const maxLines = Math.max(1, ...cellLines.map((l) => l.length));
          const rowHeightMm = maxLines * lineHeightMm + 4.5;

          ensureSpace(rowHeightMm);

          cells.forEach((cell, cIdx) => {
            const cellX = marginMm + cIdx * colWidth;
            if (isHeader) {
              pdf.setFillColor(248, 250, 252);
              pdf.rect(cellX, cursorY, colWidth, rowHeightMm, "FD");
            } else {
              pdf.setDrawColor(203, 213, 225);
              pdf.setLineWidth(0.25);
              pdf.rect(cellX, cursorY, colWidth, rowHeightMm, "S");
            }

            pdf.setFont("helvetica", isHeader ? "bold" : "normal");
            pdf.setFontSize(cellFontSizePt);
            pdf.setTextColor(17, 24, 39);

            const lines = cellLines[cIdx] || [];
            lines.forEach((line, lIdx) => {
              pdf.text(
                String(line),
                cellX + 2.5,
                cursorY + 3.5 + (lIdx + 0.75) * lineHeightMm
              );
            });
          });

          cursorY += rowHeightMm;
        });

        cursorY += 3;
        return;
      }

      // Check if container DIV holds multiple block children
      const blockChildTags = ["P", "H1", "H2", "H3", "H4", "UL", "OL", "TABLE", "HR", "BLOCKQUOTE"];
      const hasBlockChildren = Array.from(el.children).some((c) =>
        blockChildTags.includes(c.tagName.toUpperCase())
      );
      if (tag === "DIV" && hasBlockChildren) {
        Array.from(el.childNodes).forEach((child) => renderBlockElement(child, null, indentMm));
        return;
      }

      // Determine block typography defaults
      let baseSizePt = 11;
      let baseBold = false;
      let baseColor = [17, 24, 39];
      let spaceBeforeMm = 0;
      let spaceAfterMm = 2.8;

      if (el.classList?.contains("doc-title")) {
        baseSizePt = 26;
        baseBold = true;
        spaceBeforeMm = 2;
        spaceAfterMm = 4.5;
      } else if (el.classList?.contains("doc-subtitle")) {
        baseSizePt = 15;
        baseColor = [100, 116, 139];
        spaceBeforeMm = 1;
        spaceAfterMm = 4;
      } else if (tag === "H1") {
        baseSizePt = 20;
        baseBold = true;
        spaceBeforeMm = 4;
        spaceAfterMm = 3;
      } else if (tag === "H2") {
        baseSizePt = 16;
        baseBold = true;
        spaceBeforeMm = 3.5;
        spaceAfterMm = 2.5;
      } else if (tag === "H3") {
        baseSizePt = 13.5;
        baseBold = true;
        spaceBeforeMm = 3;
        spaceAfterMm = 2;
      } else if (tag === "H4") {
        baseSizePt = 11.5;
        baseBold = true;
        spaceBeforeMm = 2.5;
        spaceAfterMm = 2;
      }

      if (el.style?.fontSize) {
        const parsed = parseFloat(el.style.fontSize);
        if (!isNaN(parsed)) {
          baseSizePt = el.style.fontSize.includes("px") ? Math.round(parsed * 0.75) : parsed;
        }
      }
      if (el.style?.color) {
        baseColor = parseCssColor(el.style.color, baseColor);
      }

      const align = el.style?.textAlign || "left";
      const pdfFont = mapPdfFont(el.style?.fontFamily || "");

      const runs = extractRuns(el, {
        bold: baseBold,
        italic: false,
        underline: false,
        strike: false,
        fontSizePt: baseSizePt,
        color: el.style?.color || null,
        fontFamily: el.style?.fontFamily || null,
      });

      const fullText = (listPrefix || "") + runs.map((r) => r.text).join("");
      if (!fullText.trim()) {
        cursorY += ptToMm(baseSizePt) * 0.85;
        return;
      }

      // Use dominant run styling for clean paragraph rendering
      const dominantSizePt = runs.find((r) => r.fontSizePt)?.fontSizePt || baseSizePt;
      const isAllBold = baseBold || (runs.length > 0 && runs.every((r) => !r.text.trim() || r.bold));
      const isAllItalic = runs.length > 0 && runs.every((r) => !r.text.trim() || r.italic);
      const fontStyle = isAllBold && isAllItalic ? "bolditalic" : isAllBold ? "bold" : isAllItalic ? "italic" : "normal";
      const textColor = runs.find((r) => r.color)?.color
        ? parseCssColor(runs.find((r) => r.color).color, baseColor)
        : baseColor;

      pdf.setFont(pdfFont, fontStyle);
      pdf.setFontSize(dominantSizePt);
      pdf.setTextColor(textColor[0], textColor[1], textColor[2]);

      const availableWidth = Math.max(20, contentWidthMm - indentMm);
      const wrappedLines = pdf.splitTextToSize(fullText.replace(/\n+/g, " "), availableWidth);
      const lineHeightMm = ptToMm(dominantSizePt) * 1.5;

      cursorY += spaceBeforeMm;

      wrappedLines.forEach((lineStr) => {
        ensureSpace(lineHeightMm);
        let xPos = marginMm + indentMm;
        if (align === "center") {
          xPos = marginMm + indentMm + availableWidth / 2;
          pdf.text(String(lineStr), xPos, cursorY + ptToMm(dominantSizePt), { align: "center" });
        } else if (align === "right") {
          xPos = marginMm + indentMm + availableWidth;
          pdf.text(String(lineStr), xPos, cursorY + ptToMm(dominantSizePt), { align: "right" });
        } else {
          pdf.text(String(lineStr), xPos, cursorY + ptToMm(dominantSizePt));
        }
        cursorY += lineHeightMm;
      });

      cursorY += spaceAfterMm;
    };

    Array.from(root.childNodes).forEach((node) => renderBlockElement(node));

    // Render Verification Stamp on the final page if enabled
    if (includeQrCode && pageIdx === pagesHtml.length - 1) {
      ensureSpace(22);
      const stampY = Math.max(cursorY + 6, pageHeightMm - marginMm - 18);
      pdf.setDrawColor(226, 232, 240);
      pdf.setLineWidth(0.3);
      pdf.line(marginMm, stampY, pageWidthMm - marginMm, stampY);

      const isRight = qrPosition === "bottom-right";
      const boxX = isRight ? pageWidthMm - marginMm - 62 : marginMm;
      pdf.setDrawColor(99, 102, 241);
      pdf.roundedRect(boxX, stampY + 3, 62, 13, 1.5, 1.5, "S");
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8.5);
      pdf.setTextColor(30, 41, 59);
      pdf.text("Verified ProofDeck Document", boxX + 3, stampY + 8);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7);
      pdf.setTextColor(100, 116, 139);
      pdf.text("Scan QR on official copy to verify ledger", boxX + 3, stampY + 13);
    }
  });

  const safeFilename = (title || "ProofDeck_Document").replace(/[^a-zA-Z0-9_-]/g, "_");
  pdf.save(`${safeFilename}.pdf`);
}

// ============================================================================
// NATIVE MICROSOFT WORD (.DOCX) GENERATOR (Office Open XML ZIP Archive)
// ============================================================================

function xmlEscape(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// Standard CRC-32 calculation for PKZIP archive
const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c >>> 0;
  }
  return table;
})();

function crc32(bytes) {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    crc = CRC_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

/**
 * Create a standard PKZIP archive (Store method 0) from [{ name, content }]
 */
function createZipBlob(files) {
  const encoder = new TextEncoder();
  const fileEntries = files.map((f) => {
    const nameBytes = encoder.encode(f.name);
    const dataBytes = typeof f.content === "string" ? encoder.encode(f.content) : f.content;
    const crc = crc32(dataBytes);
    return { nameBytes, dataBytes, crc };
  });

  let localTotalSize = 0;
  let centralTotalSize = 0;
  fileEntries.forEach((e) => {
    localTotalSize += 30 + e.nameBytes.length + e.dataBytes.length;
    centralTotalSize += 46 + e.nameBytes.length;
  });

  const totalSize = localTotalSize + centralTotalSize + 22;
  const out = new Uint8Array(totalSize);
  const view = new DataView(out.buffer);

  let offset = 0;
  const localOffsets = [];

  // Write Local File Headers + Data
  fileEntries.forEach((e) => {
    localOffsets.push(offset);
    view.setUint32(offset, 0x04034b50, true); // Local file header signature
    view.setUint16(offset + 4, 20, true); // Version needed to extract (2.0)
    view.setUint16(offset + 6, 0x0800, true); // UTF-8 flag
    view.setUint16(offset + 8, 0, true); // Compression method 0 (Store)
    view.setUint16(offset + 10, 0, true); // Mod time
    view.setUint16(offset + 12, 0x21, true); // Mod date
    view.setUint32(offset + 14, e.crc, true); // CRC-32
    view.setUint32(offset + 18, e.dataBytes.length, true); // Compressed size
    view.setUint32(offset + 22, e.dataBytes.length, true); // Uncompressed size
    view.setUint16(offset + 26, e.nameBytes.length, true); // File name length
    view.setUint16(offset + 28, 0, true); // Extra field length
    offset += 30;
    out.set(e.nameBytes, offset);
    offset += e.nameBytes.length;
    out.set(e.dataBytes, offset);
    offset += e.dataBytes.length;
  });

  const centralDirOffset = offset;

  // Write Central Directory Headers
  fileEntries.forEach((e, idx) => {
    view.setUint32(offset, 0x02014b50, true); // Central file header signature
    view.setUint16(offset + 4, 20, true); // Version made by
    view.setUint16(offset + 6, 20, true); // Version needed
    view.setUint16(offset + 8, 0x0800, true); // UTF-8 flag
    view.setUint16(offset + 10, 0, true); // Compression method 0
    view.setUint16(offset + 12, 0, true); // Mod time
    view.setUint16(offset + 14, 0x21, true); // Mod date
    view.setUint32(offset + 16, e.crc, true); // CRC-32
    view.setUint32(offset + 20, e.dataBytes.length, true);
    view.setUint32(offset + 24, e.dataBytes.length, true);
    view.setUint16(offset + 28, e.nameBytes.length, true);
    view.setUint16(offset + 30, 0, true);
    view.setUint16(offset + 32, 0, true);
    view.setUint16(offset + 34, 0, true);
    view.setUint16(offset + 36, 0, true);
    view.setUint32(offset + 38, 0, true);
    view.setUint32(offset + 42, localOffsets[idx], true);
    offset += 46;
    out.set(e.nameBytes, offset);
    offset += e.nameBytes.length;
  });

  const centralDirSize = offset - centralDirOffset;

  // End of Central Directory Record (EOCD)
  view.setUint32(offset, 0x06054b50, true);
  view.setUint16(offset + 4, 0, true);
  view.setUint16(offset + 6, 0, true);
  view.setUint16(offset + 8, fileEntries.length, true);
  view.setUint16(offset + 10, fileEntries.length, true);
  view.setUint32(offset + 12, centralDirSize, true);
  view.setUint32(offset + 16, centralDirOffset, true);
  view.setUint16(offset + 20, 0, true);

  return new Blob([out], {
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
}

/**
 * Convert HTML pages into WordprocessingML (<w:body>) and download as a real .docx file
 */
export function exportDocumentToDocx({ title = "ProofDeck_Document", pagesHtml = [] }) {
  const parser = new DOMParser();
  const bodyParts = [];

  const buildParagraphXml = (el, { prefix = "", forceBold = false, sizePt = 11, styleId = null } = {}) => {
    const runs = extractRuns(el, {
      bold: forceBold,
      italic: false,
      underline: false,
      strike: false,
      fontSizePt: sizePt,
      color: null,
      fontFamily: el.style?.fontFamily || "Arial",
    });

    if (prefix) {
      runs.unshift({
        text: prefix,
        bold: forceBold,
        italic: false,
        underline: false,
        strike: false,
        fontSizePt: sizePt,
        fontFamily: "Arial",
      });
    }

    const alignAttr = el.style?.textAlign;
    const wAlign =
      alignAttr === "center"
        ? "center"
        : alignAttr === "right"
        ? "right"
        : alignAttr === "justify"
        ? "both"
        : "left";

    const pPr = `<w:pPr>${styleId ? `<w:pStyle w:val="${styleId}"/>` : ""}<w:jc w:val="${wAlign}"/><w:spacing w:after="160" w:line="320" w:lineRule="auto"/></w:pPr>`;

    const runsXml = runs
      .map((r) => {
        const halfPts = Math.round((r.fontSizePt || sizePt) * 2);
        const fontClean = (r.fontFamily || "Arial").split(",")[0].replace(/['"]/g, "").trim() || "Arial";
        const rPr = [
          `<w:rFonts w:ascii="${xmlEscape(fontClean)}" w:hAnsi="${xmlEscape(fontClean)}" w:cs="${xmlEscape(fontClean)}"/>`,
          r.bold ? "<w:b/>" : "",
          r.italic ? "<w:i/>" : "",
          r.underline ? '<w:u w:val="single"/>' : "",
          r.strike ? "<w:strike/>" : "",
          `<w:sz w:val="${halfPts}"/><w:szCs w:val="${halfPts}"/>`,
        ].join("");

        const lines = String(r.text || "").split("\n");
        const textNodes = lines
          .map((seg, idx) => `${idx > 0 ? "<w:br/>" : ""}<w:t xml:space="preserve">${xmlEscape(seg)}</w:t>`)
          .join("");

        return `<w:r><w:rPr>${rPr}</w:rPr>${textNodes}</w:r>`;
      })
      .join("");

    return `<w:p>${pPr}${runsXml}</w:p>`;
  };

  const processNode = (node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const txt = decodeHtmlEntities(node.nodeValue || "").trim();
      if (txt) {
        bodyParts.push(
          `<w:p><w:r><w:t xml:space="preserve">${xmlEscape(txt)}</w:t></w:r></w:p>`
        );
      }
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const el = node;
    const tag = el.tagName.toUpperCase();

    if (el.classList?.contains("pd-page-break")) {
      bodyParts.push(`<w:p><w:r><w:br w:type="page"/></w:r></w:p>`);
      return;
    }

    if (tag === "H1") {
      const sz = el.classList?.contains("doc-title") ? 26 : 20;
      bodyParts.push(buildParagraphXml(el, { forceBold: true, sizePt: sz, styleId: "Heading1" }));
      return;
    }
    if (tag === "H2") {
      bodyParts.push(buildParagraphXml(el, { forceBold: true, sizePt: 16, styleId: "Heading2" }));
      return;
    }
    if (tag === "H3") {
      bodyParts.push(buildParagraphXml(el, { forceBold: true, sizePt: 13.5, styleId: "Heading3" }));
      return;
    }
    if (tag === "H4") {
      bodyParts.push(buildParagraphXml(el, { forceBold: true, sizePt: 11.5, styleId: "Heading4" }));
      return;
    }

    if (tag === "UL" || tag === "OL") {
      const items = Array.from(el.children).filter((c) => c.tagName.toUpperCase() === "LI");
      items.forEach((li, idx) => {
        const prefix = tag === "OL" ? `${idx + 1}. ` : "• ";
        bodyParts.push(buildParagraphXml(li, { prefix, sizePt: 11 }));
      });
      return;
    }

    if (tag === "TABLE") {
      const rows = Array.from(el.querySelectorAll("tr"));
      if (rows.length === 0) return;
      const trXml = rows
        .map((row) => {
          const cells = Array.from(row.querySelectorAll("th, td"));
          const tcXml = cells
            .map((cell) => {
              const isTh = cell.tagName.toUpperCase() === "TH";
              const pXml = buildParagraphXml(cell, { forceBold: isTh, sizePt: 10.5 });
              return `<w:tc><w:tcPr><w:tcBorders><w:top w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/><w:left w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/><w:bottom w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/><w:right w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/></w:tcBorders></w:tcPr>${pXml}</w:tc>`;
            })
            .join("");
          return `<w:tr>${tcXml}</w:tr>`;
        })
        .join("");

      bodyParts.push(
        `<w:tbl><w:tblPr><w:tblW w:w="5000" w:type="pct"/></w:tblPr>${trXml}</w:tbl>`
      );
      return;
    }

    const blockChildTags = ["P", "H1", "H2", "H3", "H4", "UL", "OL", "TABLE", "HR", "BLOCKQUOTE"];
    const hasBlockChildren = Array.from(el.children).some((c) =>
      blockChildTags.includes(c.tagName.toUpperCase())
    );
    if (tag === "DIV" && hasBlockChildren) {
      Array.from(el.childNodes).forEach(processNode);
      return;
    }

    const sz = el.classList?.contains("doc-subtitle") ? 15 : 11;
    bodyParts.push(buildParagraphXml(el, { sizePt: sz }));
  };

  pagesHtml.forEach((pageHtml, pageIdx) => {
    if (pageIdx > 0) {
      bodyParts.push(`<w:p><w:r><w:br w:type="page"/></w:r></w:p>`);
    }
    const doc = parser.parseFromString(`<div>${pageHtml || ""}</div>`, "text/html");
    const root = doc.body.firstElementChild || doc.body;
    Array.from(root.childNodes).forEach(processNode);
  });

  const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
</Types>`;

  const relsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

  const docRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;

  const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal">
    <w:name w:val="Normal"/>
    <w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:sz w:val="22"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading1">
    <w:name w:val="heading 1"/>
    <w:rPr><w:b/><w:sz w:val="40"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading2">
    <w:name w:val="heading 2"/>
    <w:rPr><w:b/><w:sz w:val="32"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading3">
    <w:name w:val="heading 3"/>
    <w:rPr><w:b/><w:sz w:val="27"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading4">
    <w:name w:val="heading 4"/>
    <w:rPr><w:b/><w:sz w:val="23"/></w:rPr>
  </w:style>
</w:styles>`;

  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${bodyParts.join("\n    ")}
    <w:sectPr>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="1417" w:right="1417" w:bottom="1417" w:left="1417" w:header="708" w:footer="708" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>`;

  const zipBlob = createZipBlob([
    { name: "[Content_Types].xml", content: contentTypesXml },
    { name: "_rels/.rels", content: relsXml },
    { name: "word/_rels/document.xml.rels", content: docRelsXml },
    { name: "word/styles.xml", content: stylesXml },
    { name: "word/document.xml", content: documentXml },
  ]);

  const url = URL.createObjectURL(zipBlob);
  const a = document.createElement("a");
  a.href = url;
  const safeFilename = (title || "ProofDeck_Document").replace(/[^a-zA-Z0-9_-]/g, "_");
  a.download = `${safeFilename}.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
