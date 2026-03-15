type EscapeMap = Record<string, string>;

const HTML_ESCAPE_MAP: EscapeMap = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

const HTML_UNESCAPE_MAP: EscapeMap = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
};

/**
 * Escape HTML special characters in a string.
 * Prevents XSS when interpolating user input into innerHTML.
 */
export function escapeHtml(str: string): string {
  return str.replace(/[&<>"']/g, (char) => HTML_ESCAPE_MAP[char] || char);
}

/**
 * Unescape HTML entities back to characters.
 */
export function unescapeHtml(str: string): string {
  return str.replace(/&(?:amp|lt|gt|quot|#39);/g, (entity) => HTML_UNESCAPE_MAP[entity] || entity);
}

/**
 * Escape a string for use in a URL (encodeURIComponent wrapper).
 */
export function escapeUrl(str: string): string {
  return encodeURIComponent(str);
}

/**
 * Escape a string for use in a CSS selector.
 * Escapes characters that have special meaning in CSS.
 */
export function escapeCss(str: string): string {
  return str.replace(/[!"#$%&'()*+,.\/:;<=>?@[\\\]^`{|}~]/g, '\\$&');
}

/**
 * Create a safe HTML string by interpolating values with escaping.
 * Usage: html`<div>${userInput}</div>` (template literal tag)
 */
export function html(strings: TemplateStringsArray, ...values: unknown[]): string {
  let result = '';
  for (let i = 0; i < strings.length; i++) {
    result += strings[i];
    if (i < values.length) {
      const value = values[i];
      if (value === null || value === undefined) {
        result += '';
      } else if (typeof value === 'string') {
        result += escapeHtml(value);
      } else if (typeof value === 'number' || typeof value === 'boolean') {
        result += String(value);
      } else {
        result += escapeHtml(String(value));
      }
    }
  }
  return result;
}
