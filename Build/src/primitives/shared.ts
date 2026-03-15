export function baseStyles(extra: string = ""): string {
  return `<style>
*, *::before, *::after { box-sizing: border-box; }
:host {
  font-family: var(--saz-font-family);
}
:host([hidden]) { display: none !important; }
${extra}
</style>`;
}

// LAYOUT
export const LAYOUT_FLEX = `
:host {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
`;

export const GAP_RULES = `
:host([gap="xsmall"])  { gap: var(--saz-space-xsmall); }
:host([gap="tiny"])    { gap: var(--saz-space-tiny); }
:host([gap="small"])   { gap: var(--saz-space-small); }
:host([gap="medium"])  { gap: var(--saz-space-medium); }
:host([gap="large"])   { gap: var(--saz-space-large); }
:host([gap="xlarge"]) { gap: var(--saz-space-xlarge); }
`;

// SIZES
export const SIZE_RULES = `
:host([size="xsmall"])  { font-size: var(--saz-text-size-xsmall); }
:host([size="tiny"])    { font-size: var(--saz-text-size-tiny); }
:host([size="small"])   { font-size: var(--saz-text-size-small); }
:host([size="medium"])  { font-size: var(--saz-text-size-medium); }
:host([size="large"])   { font-size: var(--saz-text-size-large); }
:host([size="xlarge"]) { font-size: var(--saz-text-size-xlarge); }
`;

export const SIZE_PADDING_RULES = `
:host([size="xsmall"])  { padding: var(--saz-space-xsmall) var(--saz-space-tiny); }
:host([size="tiny"])    { padding: var(--saz-space-tiny) var(--saz-space-small); }
:host([size="small"])   { padding: var(--saz-space-tiny) var(--saz-space-small); }
:host([size="medium"])  { padding: var(--saz-space-small) var(--saz-space-medium); }
:host([size="large"])   { padding: var(--saz-space-medium) var(--saz-space-large); min-width: 120px; width: auto; }
:host([size="xlarge"]) { padding: var(--saz-space-large) var(--saz-space-xlarge); min-width: 160px; width: auto; }
`;

// VARIANTS
export const VARIANT_BG_RULES = `
:host([variant="accent"])    { background: var(--saz-color-accent); color: var(--saz-color-on-accent); border-color: transparent; }
:host([variant="primary"])   { background: var(--saz-color-primary); color: var(--saz-color-on-primary); border-color: transparent; }
:host([variant="secondary"]) { background: transparent; color: var(--saz-color-text); border-color: var(--saz-color-border); }
:host([variant="danger"])    { background: var(--saz-color-danger); color: var(--saz-color-on-danger); border-color: transparent; }
:host([variant="success"])   { background: var(--saz-color-success); color: var(--saz-color-on-success); border-color: transparent; }
:host([variant="warning"])   { background: #fef3c7; color: #92400e; border-color: transparent; }
:host([variant="dim"])       { background: transparent; color: var(--saz-color-text-dim); border-color: transparent; }
:host([variant="dim"]:hover) { color: var(--saz-color-text); }
`;

export const VARIANT_TEXT_RULES = `
:host([variant="accent"])    { color: var(--saz-color-accent); }
:host([variant="primary"])   { color: var(--saz-color-primary); }
:host([variant="secondary"]) { color: var(--saz-color-secondary); }
:host([variant="danger"])    { color: var(--saz-color-danger); }
:host([variant="success"])   { color: var(--saz-color-success); }
:host([variant="dim"])       { color: var(--saz-color-text-dim); }
:host([variant="dimmer"])    { color: var(--saz-color-text-dimmer); }
`;

// SHAPES
export const SHAPE_RULES = `
:host([shape="round"])   { border-radius: var(--saz-radius-round); }
:host([shape="pill"])   { border-radius: var(--saz-radius-round); }
:host([shape="square"]) { border-radius: var(--saz-radius-none); }
:host([shape="rounded"]) { border-radius: var(--saz-radius-soft); }
:host([shape="circle"]) { border-radius: 50%; }
`;

// STATES
export const STATE_DISABLED = `
:host([disabled]) {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}
`;

export const STATE_LOADING = `
:host([loading]) {
  opacity: 0.7;
  cursor: wait;
  pointer-events: none;
}
`;

export const STATE_ACTIVE = `
:host([active]),
:host([checked]) {
  filter: brightness(0.9);
}
`;

// INTERACTIVE
export const INTERACTIVE_FOCUS = `
:host(:focus-visible) {
  outline: 2px solid var(--saz-color-primary);
  outline-offset: 2px;
}
`;

export const INTERACTIVE_HOVER = `
:host(:hover) {
  filter: brightness(1.05);
}
:host(:active) {
  transform: scale(0.97);
}
`;

// TYPOGRAPHY
export const TYPO_WEIGHT = `
:host([weight="light"])   { font-weight: var(--saz-text-weight-light); }
:host([weight="normal"]) { font-weight: var(--saz-text-weight-normal); }
:host([weight="medium"]) { font-weight: var(--saz-text-weight-medium); }
:host([weight="bold"])   { font-weight: var(--saz-text-weight-bold); }
`;

export const TYPO_TONE = `
:host([tone="dim"])       { color: var(--saz-color-text-dim); }
:host([tone="dimmer"])    { color: var(--saz-color-text-dimmer); }
`;
