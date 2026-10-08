// frontend/src/utils/columnMapping.js

import { aiMapColumns } from "../api";

export const PROOFDECK_CORE_FIELDS = [
  {
    key: "recipient_name",
    label: "Recipient Name",
    required: true,
    description: "Full name of the certificate holder",
    placeholder: "Jane Doe",
    synonyms: [
      "name", "full name", "student name", "learner", "trainee", "participant",
      "attendee", "employee", "candidate", "awardee", "recipient", "graduate",
      "member", "student", "pupil", "scholar", "person", "delegate", "inductee",
      "honoree", "participant name", "learner name", "employee name", "recipient name",
      "student full name", "attendee name", "candidate name", "member name"
    ]
  },
  {
    key: "recipient_email",
    label: "Recipient Email",
    required: true,
    description: "Email address for credential delivery and verification",
    placeholder: "jane@example.com",
    synonyms: [
      "email", "e-mail", "email address", "mail", "contact email", "user email",
      "recipient email", "attendee email", "student email", "electronic mail",
      "email id", "contact mail", "learner email", "e mail", "emailaddress"
    ]
  },
  {
    key: "course_title",
    label: "Course / Event Title",
    required: true,
    description: "Title of the completed course, webinar, or achievement",
    placeholder: "Advanced React Workshop",
    synonyms: [
      "course", "programme", "program", "training", "workshop", "certificate title",
      "award", "achievement", "event", "class", "subject", "topic", "course title",
      "program name", "programme name", "certification", "webinar", "bootcamp",
      "boot camp", "degree", "diploma", "track", "module", "event title",
      "training title", "course name", "credential title", "specialization"
    ]
  },
  {
    key: "issuer_name",
    label: "Issuer Name",
    required: false,
    description: "Issuing organization, academy, or company",
    placeholder: "Acme Tech Academy",
    synonyms: [
      "issuer", "issued by", "organisation", "organization", "institution", "school",
      "company", "academy", "facilitator", "university", "college", "provider",
      "publisher", "authority", "entity", "certifier", "conferred by", "presented by",
      "issuing body", "training provider", "host", "organizer", "organising body"
    ]
  },
  {
    key: "issue_date",
    label: "Issue Date",
    required: false,
    description: "Date of credential issuance or completion (YYYY-MM-DD)",
    placeholder: new Date().toISOString().split("T")[0],
    synonyms: [
      "date", "date issued", "completion date", "graduation date", "awarded on",
      "date completed", "issue date", "event date", "end date", "finish date",
      "timestamp", "cert date", "given date", "date of completion", "awarded date",
      "effective date", "date of issue", "passed on"
    ]
  },
  {
    key: "signature",
    label: "Signature Text",
    required: false,
    description: "Signer name, director, or authorized instructor",
    placeholder: "Dr. John Smith",
    synonyms: [
      "signature", "signed by", "signatory", "director", "principal", "ceo",
      "authorized by", "signatory name", "signature text", "instructor",
      "instructor signature", "dean", "president", "coordinator", "headmaster",
      "head of school", "authorized signatory", "authorized officer", "chairperson"
    ]
  }
];

export const SPLIT_FIRST_SYNONYMS = ["first name", "firstname", "given name", "first", "fname", "forename"];
export const SPLIT_LAST_SYNONYMS = ["last name", "lastname", "surname", "family name", "last", "lname", "other names", "other name"];

/**
 * Normalizes header string: lowercase, strip punctuation, collapse whitespace.
 */
export function normalizeHeader(str) {
  if (!str) return "";
  return String(str)
    .trim()
    .toLowerCase()
    .replace(/[-_/\\.]+/g, " ")
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Levenshtein distance for fuzzy typo matching.
 */
export function levenshteinSimilarity(s1, s2) {
  const a = normalizeHeader(s1);
  const b = normalizeHeader(s2);
  if (!a || !b) return 0;
  if (a === b) return 1;

  const track = Array(b.length + 1).fill(null).map(() =>
    Array(a.length + 1).fill(null));
  for (let i = 0; i <= a.length; i += 1) {
    track[0][i] = i;
  }
  for (let j = 0; j <= b.length; j += 1) {
    track[j][0] = j;
  }
  for (let j = 1; j <= b.length; j += 1) {
    for (let i = 1; i <= a.length; i += 1) {
      const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
      track[j][i] = Math.min(
        track[j][i - 1] + 1, // deletion
        track[j - 1][i] + 1, // insertion
        track[j - 1][i - 1] + indicator // substitution
      );
    }
  }
  const distance = track[b.length][a.length];
  const maxLen = Math.max(a.length, b.length);
  return 1 - distance / maxLen;
}

// --- VALUE INSPECTION HELPERS ---
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function looksLikeEmail(val) {
  if (val === null || val === undefined) return false;
  return EMAIL_REGEX.test(String(val).trim());
}

export function looksLikeDate(val) {
  if (val === null || val === undefined) return false;
  if (typeof val === "number" && val >= 35000 && val <= 65000) return true;
  const s = String(val).trim();
  if (s.length < 4 || s.length > 30) return false;
  // Patterns like 2026-10-08, 08/10/2026, Oct 8 2026
  if (/^\d{4}[-/.]\d{1,2}[-/.]\d{1,2}/.test(s)) return true;
  if (/^\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4}/.test(s)) return true;
  if (/^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i.test(s)) return true;
  const parsed = Date.parse(s);
  return !isNaN(parsed);
}

export function looksLikePersonName(val) {
  if (val === null || val === undefined) return false;
  const s = String(val).trim();
  if (s.length < 3 || s.length > 50 || s.includes("@") || s.includes("/") || /\d/.test(s)) return false;
  const words = s.split(/\s+/);
  return words.length >= 2 && words.length <= 4;
}

/**
 * Scattered Sheet Cleaner:
 * Detects banner rows, title text, blank rows, and notes at the bottom.
 * Returns: { cleanedHeaders, cleanedRows, headerRowIndex }
 */
export function cleanScatteredSheet(matrix) {
  if (!matrix || matrix.length === 0) {
    return { cleanedHeaders: [], cleanedRows: [], headerRowIndex: 0 };
  }

  let headerRowIndex = 0;
  let maxCols = 0;

  // Search first 10 rows for the true header row
  for (let idx = 0; idx < Math.min(matrix.length, 10); idx += 1) {
    const row = matrix[idx];
    if (!Array.isArray(row)) continue;
    const nonBlank = row.filter((c) => c !== null && c !== undefined && String(c).trim() !== "");
    const count = nonBlank.length;

    // Check if row has common column keywords
    const hasKeywords = nonBlank.some((c) => {
      const norm = normalizeHeader(c);
      return ["name", "email", "course", "date", "student", "attendee", "participant", "issuer", "sign"].some((k) => norm.includes(k));
    });

    if (hasKeywords && count >= 2) {
      headerRowIndex = idx;
      break;
    }

    if (count > maxCols) {
      maxCols = count;
      headerRowIndex = idx;
    }
  }

  const rawHeaders = (matrix[headerRowIndex] || []).map((h, i) =>
    h !== null && h !== undefined && String(h).trim() !== "" ? String(h).trim() : `Column_${i + 1}`
  );

  const dataRows = matrix.slice(headerRowIndex + 1);

  // Filter out blank rows and summary notes at the bottom
  const cleanedRows = [];
  dataRows.forEach((row) => {
    if (!Array.isArray(row)) return;
    const nonBlank = row.filter((c) => c !== null && c !== undefined && String(c).trim() !== "");
    if (nonBlank.length === 0) return;

    const firstCell = String(nonBlank[0]).trim().toLowerCase();
    if (
      firstCell.startsWith("total") ||
      firstCell.startsWith("note") ||
      firstCell.startsWith("summary") ||
      firstCell.startsWith("generated by") ||
      firstCell.startsWith("page ")
    ) {
      return;
    }
    cleanedRows.push(row);
  });

  return { cleanedHeaders: rawHeaders, cleanedRows, headerRowIndex };
}

/**
 * Layer A: Rules + Fuzzy + Value Inspection (Free, instant, client-side)
 */
export function inferMappingLayerA(headers, sampleRows = []) {
  const result = {
    mappings: {},
    splitNames: null,
    isConfident: true,
    unmappedHeaders: [],
    source: "rules"
  };

  const normHeaders = headers.map(normalizeHeader);
  const usedIndices = new Set();

  // 1. Detect Split Name Columns
  let firstIdx = -1;
  let lastIdx = -1;
  normHeaders.forEach((nh, idx) => {
    if (SPLIT_FIRST_SYNONYMS.some((fn) => nh === fn || nh.includes(fn))) {
      firstIdx = idx;
    } else if (SPLIT_LAST_SYNONYMS.some((ln) => nh === ln || nh.includes(ln))) {
      lastIdx = idx;
    }
  });

  if (firstIdx !== -1 && lastIdx !== -1 && firstIdx !== lastIdx) {
    result.splitNames = {
      firstNameColumn: headers[firstIdx],
      lastNameColumn: headers[lastIdx]
    };
    result.mappings.recipient_name = {
      sourceColumn: `${headers[firstIdx]} + ${headers[lastIdx]}`,
      confidence: 0.98,
      type: "split_combine",
      parts: [headers[firstIdx], headers[lastIdx]]
    };
    usedIndices.add(firstIdx);
    usedIndices.add(lastIdx);
  }

  // 2. Map Core Fields
  PROOFDECK_CORE_FIELDS.forEach((field) => {
    if (field.key === "recipient_name" && result.mappings.recipient_name) {
      return;
    }

    let bestScore = 0;
    let bestIdx = -1;

    normHeaders.forEach((nh, idx) => {
      if (usedIndices.has(idx)) return;

      let score = 0;

      // Exact match to field key or label
      if (nh === normalizeHeader(field.key) || nh === normalizeHeader(field.label)) {
        score = 1.0;
      }

      // Synonym match
      if (score < 1.0) {
        for (const syn of field.synonyms) {
          const normSyn = normalizeHeader(syn);
          if (nh === normSyn) {
            score = Math.max(score, 0.95);
            break;
          } else if (normSyn.includes(nh) || nh.includes(normSyn)) {
            score = Math.max(score, 0.85);
          } else {
            const fz = levenshteinSimilarity(nh, normSyn);
            if (fz > 0.82) {
              score = Math.max(score, 0.78);
            }
          }
        }
      }

      // Value inspection boost
      if (sampleRows.length > 0) {
        const colSamples = sampleRows
          .map((r) => r[idx])
          .filter((v) => v !== null && v !== undefined && String(v).trim() !== "");
        
        if (colSamples.length > 0) {
          if (field.key === "recipient_email") {
            const emailRatio = colSamples.filter(looksLikeEmail).length / colSamples.length;
            if (emailRatio >= 0.5) score = Math.max(score + 0.3, 0.95);
          } else if (field.key === "issue_date") {
            const dateRatio = colSamples.filter(looksLikeDate).length / colSamples.length;
            if (dateRatio >= 0.5) score = Math.max(score + 0.3, 0.90);
          } else if (field.key === "recipient_name" && !result.mappings.recipient_name) {
            const nameRatio = colSamples.filter(looksLikePersonName).length / colSamples.length;
            if (nameRatio >= 0.5) score = Math.max(score + 0.2, 0.82);
          }
        }
      }

      if (score > bestScore) {
        bestScore = score;
        bestIdx = idx;
      }
    });

    if (bestIdx !== -1 && bestScore >= 0.65) {
      result.mappings[field.key] = {
        sourceColumn: headers[bestIdx],
        confidence: Math.min(Number(bestScore.toFixed(2)), 1.0),
        type: "direct"
      };
      usedIndices.add(bestIdx);
    } else {
      result.mappings[field.key] = {
        sourceColumn: null,
        confidence: 0,
        type: "unmapped"
      };
    }
  });

  // 3. Confidence determination (Mandatory fields must be confidently mapped)
  const mandatoryKeys = ["recipient_name", "recipient_email", "course_title"];
  result.isConfident = mandatoryKeys.every((k) => {
    const m = result.mappings[k];
    return m && m.sourceColumn && m.confidence >= 0.75;
  });

  // Track unmapped headers
  headers.forEach((h, idx) => {
    if (!usedIndices.has(idx)) {
      result.unmappedHeaders.push(h);
    }
  });

  return result;
}

/**
 * LocalStorage Memory for Saved Mappings
 */
export function getSavedMappingSignature(headers) {
  return headers.map(normalizeHeader).sort().join("|");
}

export function getSavedMapping(headers) {
  try {
    const key = `pd_col_map_${getSavedMappingSignature(headers)}`;
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : null;
  } catch (e) {
    return null;
  }
}

export function saveMappingMemory(headers, mapping) {
  try {
    const key = `pd_col_map_${getSavedMappingSignature(headers)}`;
    localStorage.setItem(key, JSON.stringify(mapping));
  } catch (e) {}
}

/**
 * Layer B: Call Backend AI Mapping (Pro/Enterprise only) with Graceful Fallback
 */
export async function requestAiMapping(headers, sampleRows) {
  try {
    const response = await aiMapColumns({
      headers,
      sample_rows: sampleRows.slice(0, 4)
    });
    if (response?.data?.success && response.data.mappings) {
      return {
        success: true,
        mappings: response.data.mappings,
        splitNames: response.data.split_names,
        isConfident: response.data.is_confident ?? true,
        source: "ai"
      };
    }
    // Server responded with fallback
    return {
      success: false,
      mappings: response?.data?.mappings,
      splitNames: response?.data?.split_names,
      isConfident: response?.data?.is_confident ?? false,
      source: "rules_fallback",
      message: response?.data?.msg || "AI not available"
    };
  } catch (error) {
    // Graceful fallback to Layer A
    const fallback = inferMappingLayerA(headers, sampleRows);
    return {
      success: false,
      ...fallback,
      message: error?.response?.data?.msg || "Could not reach AI mapping. Reverted to smart rules."
    };
  }
}
