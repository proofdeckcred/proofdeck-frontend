// frontend/src/utils/docUuid.js

const MASK_HIGH = 0x8f4b2e;
const MASK_LOW = 0x193c7a;

/**
 * Deterministically encodes a numeric template/document ID into a canonical 36-char UUID
 * e.g. 98 -> "c4a8e912-7b3d-4f6a-9e21-8f4b2e193c18"
 * Reversible in O(1) on the client without exposing sequential integers in the URL.
 */
export function encodeDocUuid(id) {
  const num = Number(id);
  if (!Number.isFinite(num) || num <= 0) {
    return String(id || "");
  }

  // Already a UUID
  if (typeof id === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return id.toLowerCase();
  }

  // Deterministic pseudo-random prefix from numeric ID
  const h1 = ((Math.imul(num, 0x9e3779b1) ^ 0x7f4a7c15) >>> 0).toString(16).padStart(8, "0");
  const h2 = (((Math.imul(num, 0x85ebca6b) ^ 0xc2b2ae35) >>> 16) & 0xffff).toString(16).padStart(4, "0");
  const h3 = ((0x4000 | (((Math.imul(num, 0x27d4eb2f) >>> 16) & 0x0fff))) >>> 0).toString(16).padStart(4, "0");
  const h4 = ((0x8000 | (((Math.imul(num, 0x165667b1) >>> 16) & 0x3fff))) >>> 0).toString(16).padStart(4, "0");

  const highPart = Math.floor(num / 0x1000000);
  const lowPart = num % 0x1000000;

  const encHigh = ((highPart ^ MASK_HIGH) >>> 0).toString(16).padStart(6, "0").slice(-6);
  const encLow = ((lowPart ^ MASK_LOW) >>> 0).toString(16).padStart(6, "0").slice(-6);

  return `${h1}-${h2}-${h3}-${h4}-${encHigh}${encLow}`.toLowerCase();
}

/**
 * Decodes a 36-char document UUID (or legacy numeric string) back into the numeric template ID.
 */
export function decodeDocUuid(uuidOrId) {
  if (!uuidOrId) return null;
  const str = String(uuidOrId).trim();

  // Legacy plain integer support
  if (/^\d+$/.test(str)) {
    return parseInt(str, 10);
  }

  // Match canonical UUID format
  const match = str.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-([0-9a-f]{6})([0-9a-f]{6})$/i);
  if (!match) return null;

  const encHigh = parseInt(match[1], 16);
  const encLow = parseInt(match[2], 16);

  const highPart = (encHigh ^ MASK_HIGH) >>> 0;
  const lowPart = (encLow ^ MASK_LOW) >>> 0;

  const decoded = highPart * 0x1000000 + lowPart;
  return decoded > 0 && Number.isSafeInteger(decoded) ? decoded : null;
}
