/**
 * String escaping utilities for preventing injection in various contexts.
 */
/**
 * Escape HTML special characters for safe insertion into HTML.
 * Escapes: & < > " '
 *
 * Use this for:
 * - Text content in elements
 * - Attribute values
 * - Any context where the value will be parsed as HTML
 */
export declare function escapeHtml(str: string): string;
/**
 * Unescape HTML entities back to characters.
 */
export declare function unescapeHtml(str: string): string;
/**
 * Escape a string for safe use in a URL (encodes special chars).
 */
export declare function escapeUrl(str: string): string;
/**
 * Escape a string for safe use in a CSS selector.
 * Escapes characters that have special meaning in CSS.
 */
export declare function escapeCss(str: string): string;
