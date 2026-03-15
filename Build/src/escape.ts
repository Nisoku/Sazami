/**
 * String escaping utilities for preventing injection in various contexts.
 */

type EscapeMap = Record<string, string>;

const HTML_ESCAPE_MAP: EscapeMap = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

const HTML_UNESCAPE_MAP: EscapeMap = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
};

/**
 * Escape HTML special characters for safe insertion into HTML.
 * Escapes: & < > " '
 *
 * Use this for:
 * - Text content in elements
 * - Attribute values
 * - Any context where the value will be parsed as HTML
 */
export function escapeHtml(str: string): string {
  return str.replace(/[&<>"']/g, (char) => HTML_ESCAPE_MAP[char] || char);
}

/**
 * Unescape HTML entities back to characters.
 */
export function unescapeHtml(str: string): string {
  return str.replace(
    /&(?:amp|lt|gt|quot|#39);/g,
    (entity) => HTML_UNESCAPE_MAP[entity] || entity,
  );
}

/**
 * Escape a string for safe use in a URL (encodes special chars).
 */
export function escapeUrl(str: string): string {
  return encodeURIComponent(str);
}

/**
 * Escape a string for safe use in a CSS selector.
 * Escapes characters that have special meaning in CSS.
 */
export function escapeCss(str: string): string {
  return str.replace(/[!"#$%&'()*+,.\/:;<=>?@[\\\]^`{|}~]/g, "\\$&");
}
