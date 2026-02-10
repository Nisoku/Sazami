// Shared utilities for Sazami Web Components.

export function baseStyles(extra: string = ""): string {
  return `<style>
*, *::before, *::after { box-sizing: border-box; }
:host {
  font-family: var(--saz-font-family, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif);
}
:host([hidden]) { display: none !important; }
${extra}
</style>`;
}

// Common gap rules reused by layout primitives.
export const GAP_RULES = `
:host([gap="tiny"])   { gap: var(--saz-space-tiny, 4px); }
:host([gap="small"])  { gap: var(--saz-space-small, 8px); }
:host([gap="medium"]) { gap: var(--saz-space-medium, 12px); }
:host([gap="large"])  { gap: var(--saz-space-large, 16px); }
:host([gap="xlarge"]) { gap: var(--saz-space-xlarge, 24px); }
`;

// Common variant background rules.
export const VARIANT_BG_RULES = `
:host([variant="accent"])    { background: var(--saz-color-accent, #ff4d8a); color: var(--saz-color-on-accent, #fff); border-color: transparent; }
:host([variant="primary"])   { background: var(--saz-color-primary, #2563eb); color: var(--saz-color-on-primary, #fff); border-color: transparent; }
:host([variant="secondary"]) { background: var(--saz-color-secondary, #6b7280); color: #fff; border-color: transparent; }
:host([variant="danger"])    { background: var(--saz-color-danger, #ef4444); color: #fff; border-color: transparent; }
:host([variant="success"])   { background: var(--saz-color-success, #10b981); color: #fff; border-color: transparent; }
:host([variant="dim"])       { background: transparent; border-color: var(--saz-color-border, #e0e0e0); box-shadow: none; }
`;
