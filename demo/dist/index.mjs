const defaultTokens = {
  "color.background": "#ffffff",
  "color.surface": "#f8f9fa",
  "color.border": "#e0e0e0",
  "color.primary": "#2563eb",
  "color.accent": "#ff4d8a",
  "color.success": "#10b981",
  "color.danger": "#ef4444",
  "color.secondary": "#6b7280",
  "color.text": "#1f2937",
  "color.text-dim": "#6b7280",
  "color.text-dimmer": "#9ca3af",
  "color.on-accent": "#ffffff",
  "color.on-primary": "#ffffff",
  "color.on-success": "#ffffff",
  "color.on-danger": "#ffffff",
  "space.tiny": "4px",
  "space.small": "8px",
  "space.medium": "12px",
  "space.large": "16px",
  "space.xlarge": "24px",
  "space.xxlarge": "32px",
  "font.family": '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  "text.size.small": "12px",
  "text.size.medium": "14px",
  "text.size.large": "16px",
  "text.size.xlarge": "20px",
  "text.weight.light": "300",
  "text.weight.normal": "400",
  "text.weight.medium": "500",
  "text.weight.bold": "700",
  "text.leading.tight": "1.25",
  "text.leading.normal": "1.5",
  "text.leading.loose": "1.75",
  "radius.none": "0px",
  "radius.soft": "4px",
  "radius.medium": "8px",
  "radius.strong": "12px",
  "radius.round": "9999px",
  "shadow.soft": "0 1px 3px rgba(0,0,0,0.1)",
  "shadow.medium": "0 4px 6px rgba(0,0,0,0.1)",
  "shadow.strong": "0 10px 15px rgba(0,0,0,0.1)",
  "icon.size.small": "16px",
  "icon.size.medium": "20px",
  "icon.size.large": "24px",
  "icon.size.xlarge": "32px"
};
function generateCSSVariables(tokens) {
  const entries = Object.entries(tokens);
  if (entries.length === 0) return "";
  const lines = entries.map(([key, value]) => {
    const cssVar = `--saz-${key.replace(/\./g, "-")}`;
    return `  ${cssVar}: ${value};`;
  });
  return `:root {
${lines.join("\n")}
}`;
}
function generateThemeCSS(customTokens) {
  const merged = { ...defaultTokens, ...customTokens || {} };
  return generateCSSVariables(merged);
}
function getTokenValue(key, customTokens) {
  if (customTokens && key in customTokens) {
    return customTokens[key];
  }
  return defaultTokens[key];
}
const MODIFIER_MAP = {
  accent: { variant: "accent" },
  primary: { variant: "primary" },
  secondary: { variant: "secondary" },
  danger: { variant: "danger" },
  success: { variant: "success" },
  dim: { tone: "dim", variant: "dim" },
  small: { size: "small" },
  medium: { size: "medium" },
  large: { size: "large" },
  xlarge: { size: "xlarge" },
  tiny: { size: "tiny" },
  bold: { weight: "bold" },
  normal: { weight: "normal" },
  light: { weight: "light" },
  round: { shape: "round" },
  square: { shape: "square" },
  pill: { shape: "pill" },
  row: { layout: "row" },
  column: { layout: "column" },
  center: { align: "center" },
  "space-between": { justify: "space-between" },
  curved: { curved: true },
  flat: { curved: false },
  disabled: { disabled: true },
  active: { active: true },
  loading: { loading: true },
  checked: { checked: true },
  selected: { selected: true },
  removable: { removable: true },
  "center-point": { "center-point": true },
  vertical: { vertical: true },
  wrap: { wrap: true },
  indeterminate: { indeterminate: true },
  heading: { heading: true },
  open: { open: true }
};
function parseModifiers(modifiers) {
  const props = {};
  modifiers.forEach((mod) => {
    if (mod.type === "flag") {
      const mapping = MODIFIER_MAP[mod.value];
      if (mapping) {
        Object.assign(props, mapping);
      } else {
        throw new Error(
          `Unknown modifier "${mod.value}". Valid modifiers: ${Object.keys(MODIFIER_MAP).join(", ")}`
        );
      }
    } else {
      props[mod.key] = mod.value;
    }
  });
  return props;
}
function baseStyles(extra = "") {
  return `<style>
*, *::before, *::after { box-sizing: border-box; }
:host {
  font-family: var(--saz-font-family, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif);
}
:host([hidden]) { display: none !important; }
${extra}
</style>`;
}
const GAP_RULES = `
:host([gap="tiny"])   { gap: var(--saz-space-tiny, 4px); }
:host([gap="small"])  { gap: var(--saz-space-small, 8px); }
:host([gap="medium"]) { gap: var(--saz-space-medium, 12px); }
:host([gap="large"])  { gap: var(--saz-space-large, 16px); }
:host([gap="xlarge"]) { gap: var(--saz-space-xlarge, 24px); }
`;
const VARIANT_BG_RULES = `
:host([variant="accent"])    { background: var(--saz-color-accent, #ff4d8a); color: var(--saz-color-on-accent, #fff); border-color: transparent; }
:host([variant="primary"])   { background: var(--saz-color-primary, #2563eb); color: var(--saz-color-on-primary, #fff); border-color: transparent; }
:host([variant="secondary"]) { background: var(--saz-color-secondary, #6b7280); color: #fff; border-color: transparent; }
:host([variant="danger"])    { background: var(--saz-color-danger, #ef4444); color: #fff; border-color: transparent; }
:host([variant="success"])   { background: var(--saz-color-success, #10b981); color: #fff; border-color: transparent; }
:host([variant="dim"])       { background: transparent; border-color: var(--saz-color-border, #e0e0e0); box-shadow: none; }
`;
class SazamiRow extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    this.shadowRoot.innerHTML = baseStyles(`
:host {
  display: flex;
  flex-direction: row;
  gap: var(--saz-space-medium, 12px);
  align-items: center;
}
${GAP_RULES}
:host([justify="space-between"]) { justify-content: space-between; }
:host([justify="center"])        { justify-content: center; }
:host([justify="flex-end"])      { justify-content: flex-end; }
:host([justify="space-around"])  { justify-content: space-around; }
:host([justify="space-evenly"])  { justify-content: space-evenly; }
:host([align="center"])    { align-items: center; }
:host([align="flex-end"])  { align-items: flex-end; }
:host([align="stretch"])   { align-items: stretch; }
:host([align="baseline"])  { align-items: baseline; }
:host([wrap])              { flex-wrap: wrap; }
`) + "<slot></slot>";
  }
}
class SazamiColumn extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    this.shadowRoot.innerHTML = baseStyles(`
:host {
  display: flex;
  flex-direction: column;
  gap: var(--saz-space-medium, 12px);
}
${GAP_RULES}
:host([justify="space-between"]) { justify-content: space-between; }
:host([justify="center"])        { justify-content: center; }
:host([align="center"])    { align-items: center; }
:host([align="stretch"])   { align-items: stretch; }
`) + "<slot></slot>";
  }
}
class SazamiGrid extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    const cols = this.getAttribute("cols") || "3";
    const mdCols = this.getAttribute("md:cols");
    const lgCols = this.getAttribute("lg:cols");
    let responsive = "";
    if (mdCols) {
      responsive += `@media (min-width: 768px) { :host { grid-template-columns: repeat(${mdCols}, minmax(0, 1fr)); } }
`;
    }
    if (lgCols) {
      responsive += `@media (min-width: 1024px) { :host { grid-template-columns: repeat(${lgCols}, minmax(0, 1fr)); } }
`;
    }
    this.shadowRoot.innerHTML = baseStyles(`
:host {
  display: grid;
  grid-template-columns: repeat(${cols}, minmax(0, 1fr));
  gap: var(--saz-space-medium, 12px);
}
${GAP_RULES}
${responsive}
`) + "<slot></slot>";
  }
}
class SazamiStack extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    this.shadowRoot.innerHTML = baseStyles(`
:host {
  display: flex;
  flex-direction: column;
  gap: var(--saz-space-medium, 12px);
}
${GAP_RULES}
:host([align="center"])  { align-items: center; }
:host([align="stretch"]) { align-items: stretch; }
`) + "<slot></slot>";
  }
}
class SazamiCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    this.shadowRoot.innerHTML = baseStyles(`
:host {
  display: flex;
  flex-direction: column;
  background: var(--saz-color-surface, #f8f9fa);
  border: 1px solid var(--saz-color-border, #e0e0e0);
  padding: var(--saz-space-large, 16px);
  border-radius: var(--saz-radius-medium, 8px);
  box-shadow: var(--saz-shadow-soft, 0 1px 3px rgba(0,0,0,0.1));
  color: var(--saz-color-text, #1f2937);
  transition: box-shadow 0.25s ease, transform 0.25s ease, background 0.2s ease;
  gap: var(--saz-space-large, 16px);
}
:host(:hover) { box-shadow: var(--saz-shadow-medium, 0 4px 6px rgba(0,0,0,0.1)); }
:host([layout="row"])    { flex-direction: row; }
:host([layout="column"]) { flex-direction: column; }
:host([align="center"])    { align-items: center; }
:host([align="stretch"])   { align-items: stretch; }
:host([justify="space-between"]) { justify-content: space-between; }
:host([justify="center"])        { justify-content: center; }
${GAP_RULES}
:host([size="small"])  { padding: var(--saz-space-small, 8px); }
:host([size="medium"]) { padding: var(--saz-space-medium, 12px); }
:host([size="large"])  { padding: var(--saz-space-large, 16px); }
:host([size="xlarge"]) { padding: var(--saz-space-xlarge, 24px); }
${VARIANT_BG_RULES}
`) + "<slot></slot>";
  }
}
class SazamiText extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    this.shadowRoot.innerHTML = baseStyles(`
:host {
  display: block;
  font-size: var(--saz-text-size-medium, 14px);
  font-weight: var(--saz-text-weight-normal, 400);
  line-height: var(--saz-text-leading-normal, 1.5);
  color: inherit;
}
:host([size="small"])  { font-size: var(--saz-text-size-small, 12px); }
:host([size="medium"]) { font-size: var(--saz-text-size-medium, 14px); }
:host([size="large"])  { font-size: var(--saz-text-size-large, 16px); }
:host([size="xlarge"]) { font-size: var(--saz-text-size-xlarge, 20px); }
:host([weight="light"])  { font-weight: 300; }
:host([weight="normal"]) { font-weight: var(--saz-text-weight-normal, 400); }
:host([weight="medium"]) { font-weight: var(--saz-text-weight-medium, 500); }
:host([weight="bold"])   { font-weight: var(--saz-text-weight-bold, 700); }
:host([tone="dim"])    { color: var(--saz-color-text-dim, #6b7280); }
:host([tone="dimmer"]) { color: var(--saz-color-text-dimmer, #9ca3af); }
:host([leading="tight"])  { line-height: var(--saz-text-leading-tight, 1.25); }
:host([leading="normal"]) { line-height: var(--saz-text-leading-normal, 1.5); }
:host([leading="loose"])  { line-height: var(--saz-text-leading-loose, 1.75); }
`) + "<slot></slot>";
  }
}
class SazamiHeading extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    this.shadowRoot.innerHTML = baseStyles(`
:host {
  display: block;
  font-size: var(--saz-text-size-xlarge, 20px);
  font-weight: var(--saz-text-weight-bold, 700);
  line-height: var(--saz-text-leading-tight, 1.25);
  color: inherit;
  margin: 0 0 var(--saz-space-small, 8px) 0;
}
:host([size="small"])  { font-size: var(--saz-text-size-medium, 14px); }
:host([size="medium"]) { font-size: var(--saz-text-size-large, 16px); }
:host([size="large"])  { font-size: var(--saz-text-size-xlarge, 20px); }
:host([size="xlarge"]) { font-size: 24px; }
:host([weight="normal"]) { font-weight: var(--saz-text-weight-normal, 400); }
:host([weight="medium"]) { font-weight: var(--saz-text-weight-medium, 500); }
:host([tone="dim"]) { color: var(--saz-color-text-dim, #6b7280); }
`) + "<slot></slot>";
  }
}
class SazamiLabel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    this.shadowRoot.innerHTML = baseStyles(`
:host {
  display: block;
  font-size: var(--saz-text-size-small, 12px);
  font-weight: var(--saz-text-weight-medium, 500);
  color: var(--saz-color-text-dim, #6b7280);
  margin-bottom: var(--saz-space-tiny, 4px);
  line-height: var(--saz-text-leading-normal, 1.5);
  cursor: default;
  user-select: none;
}
`) + "<slot></slot>";
  }
}
class SazamiButton extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    if (!this.hasAttribute("role")) this.setAttribute("role", "button");
    if (!this.hasAttribute("tabindex")) this.setAttribute("tabindex", "0");
    this.shadowRoot.innerHTML = baseStyles(`
:host {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--saz-space-small, 8px);
  padding: var(--saz-space-small, 8px) var(--saz-space-large, 16px);
  border: 1px solid transparent;
  border-radius: var(--saz-radius-medium, 8px);
  font-size: var(--saz-text-size-medium, 14px);
  font-weight: var(--saz-text-weight-medium, 500);
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
  transition: background 0.2s ease, color 0.2s ease,
              box-shadow 0.2s ease, opacity 0.2s ease,
              transform 0.15s ease;
  background: var(--saz-color-primary, #2563eb);
  color: var(--saz-color-on-primary, #ffffff);
}
:host(:hover) { filter: brightness(1.1); }
:host(:active) { transform: scale(0.97); }
:host(:focus-visible) {
  outline: 2px solid var(--saz-color-primary, #2563eb);
  outline-offset: 2px;
}
:host([size="small"]) {
  padding: var(--saz-space-tiny, 4px) var(--saz-space-medium, 12px);
  font-size: var(--saz-text-size-small, 12px);
}
:host([size="large"]) {
  padding: var(--saz-space-medium, 12px) var(--saz-space-xlarge, 24px);
  font-size: var(--saz-text-size-large, 16px);
}
:host([size="xlarge"]) {
  padding: var(--saz-space-large, 16px) var(--saz-space-xxlarge, 32px);
  font-size: var(--saz-text-size-xlarge, 20px);
}
:host([variant="accent"]) {
  background: var(--saz-color-accent, #ff4d8a);
  color: var(--saz-color-on-accent, #ffffff);
}
:host([variant="primary"]) {
  background: var(--saz-color-primary, #2563eb);
  color: var(--saz-color-on-primary, #ffffff);
}
:host([variant="secondary"]) {
  background: transparent;
  color: var(--saz-color-text, #1f2937);
  border-color: var(--saz-color-border, #e0e0e0);
}
:host([variant="danger"]) {
  background: var(--saz-color-danger, #ef4444);
  color: #ffffff;
}
:host([variant="success"]) {
  background: var(--saz-color-success, #10b981);
  color: #ffffff;
}
:host([variant="dim"]) {
  background: transparent;
  color: var(--saz-color-text-dim, #6b7280);
  border-color: transparent;
}
:host([variant="dim"]:hover) { color: var(--saz-color-text, #1f2937); }
:host([shape="pill"])   { border-radius: var(--saz-radius-round, 9999px); }
:host([shape="round"])  { border-radius: var(--saz-radius-round, 9999px); }
:host([shape="square"]) { border-radius: var(--saz-radius-none, 0); }
:host([disabled]) {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}
:host([loading]) {
  opacity: 0.7;
  cursor: wait;
  pointer-events: none;
}
:host([active]) { filter: brightness(0.9); }
`) + "<slot></slot>";
    this.addEventListener("keydown", (e) => {
      const ke = e;
      if (ke.key === "Enter" || ke.key === " ") {
        ke.preventDefault();
        this.click();
      }
    });
  }
}
const __vite_glob_0_0 = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>\n';
const __vite_glob_0_1 = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>';
const __vite_glob_0_2 = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>';
const __vite_glob_0_3 = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>';
const __vite_glob_0_4 = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>';
const __vite_glob_0_5 = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>\n';
const __vite_glob_0_6 = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>';
const __vite_glob_0_7 = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>\n';
const __vite_glob_0_8 = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
const __vite_glob_0_9 = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>\n';
const __vite_glob_0_10 = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>\n';
const __vite_glob_0_11 = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>\n';
const __vite_glob_0_12 = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>';
const __vite_glob_0_13 = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>';
const __vite_glob_0_14 = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>\n';
const __vite_glob_0_15 = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>';
const __vite_glob_0_16 = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>\n';
const __vite_glob_0_17 = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>\n';
const __vite_glob_0_18 = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>';
const __vite_glob_0_19 = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>';
const __vite_glob_0_20 = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>';
const __vite_glob_0_21 = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>';
const __vite_glob_0_22 = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>\n';
const __vite_glob_0_23 = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>\n';
const __vite_glob_0_24 = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><polygon points="8,5 8,19 17,12"/><rect x="17" y="5" width="2" height="14"/></svg>\n';
const __vite_glob_0_25 = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>\n';
const __vite_glob_0_26 = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>';
const __vite_glob_0_27 = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>';
const __vite_glob_0_28 = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><polygon points="8,5 19,12 8,19"/></svg>\n';
const __vite_glob_0_29 = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>\n';
const __vite_glob_0_30 = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><polygon points="16,5 16,19 7,12"/><rect x="5" y="5" width="2" height="14"/></svg>\n';
const __vite_glob_0_31 = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>\n';
const __vite_glob_0_32 = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="21" y2="21"/></svg>\n';
const __vite_glob_0_33 = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>\n';
const __vite_glob_0_34 = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>\n';
const __vite_glob_0_35 = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><polygon points="6,5 6,19 13,12"/><polygon points="13,5 13,19 20,12"/></svg>\n';
const __vite_glob_0_36 = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>\n';
const __vite_glob_0_37 = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="12" height="14" rx="1"/></svg>\n';
const __vite_glob_0_38 = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>';
const __vite_glob_0_39 = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>\n';
const __vite_glob_0_40 = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>\n';
const __vite_glob_0_41 = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
const __vite_glob_0_42 = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>';
const iconModules = /* @__PURE__ */ Object.assign({
  "./back.svg": __vite_glob_0_0,
  "./bell.svg": __vite_glob_0_1,
  "./bookmark.svg": __vite_glob_0_2,
  "./calendar.svg": __vite_glob_0_3,
  "./camera.svg": __vite_glob_0_4,
  "./check.svg": __vite_glob_0_5,
  "./clock.svg": __vite_glob_0_6,
  "./close.svg": __vite_glob_0_7,
  "./copy.svg": __vite_glob_0_8,
  "./down.svg": __vite_glob_0_9,
  "./download.svg": __vite_glob_0_10,
  "./edit.svg": __vite_glob_0_11,
  "./file.svg": __vite_glob_0_12,
  "./folder.svg": __vite_glob_0_13,
  "./forward.svg": __vite_glob_0_14,
  "./globe.svg": __vite_glob_0_15,
  "./heart.svg": __vite_glob_0_16,
  "./home.svg": __vite_glob_0_17,
  "./image.svg": __vite_glob_0_18,
  "./link.svg": __vite_glob_0_19,
  "./lock.svg": __vite_glob_0_20,
  "./mail.svg": __vite_glob_0_21,
  "./menu.svg": __vite_glob_0_22,
  "./minus.svg": __vite_glob_0_23,
  "./next.svg": __vite_glob_0_24,
  "./pause.svg": __vite_glob_0_25,
  "./phone.svg": __vite_glob_0_26,
  "./pin.svg": __vite_glob_0_27,
  "./play.svg": __vite_glob_0_28,
  "./plus.svg": __vite_glob_0_29,
  "./previous.svg": __vite_glob_0_30,
  "./refresh.svg": __vite_glob_0_31,
  "./search.svg": __vite_glob_0_32,
  "./settings.svg": __vite_glob_0_33,
  "./share.svg": __vite_glob_0_34,
  "./skip.svg": __vite_glob_0_35,
  "./star.svg": __vite_glob_0_36,
  "./stop.svg": __vite_glob_0_37,
  "./trash.svg": __vite_glob_0_38,
  "./up.svg": __vite_glob_0_39,
  "./upload.svg": __vite_glob_0_40,
  "./user.svg": __vite_glob_0_41,
  "./users.svg": __vite_glob_0_42
});
const ICON_SVGS = {};
for (const path in iconModules) {
  const name = path.replace("./", "").replace(".svg", "");
  ICON_SVGS[name] = iconModules[path];
}
class SazamiIconButton extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    if (!this.hasAttribute("role")) this.setAttribute("role", "button");
    if (!this.hasAttribute("tabindex")) this.setAttribute("tabindex", "0");
    if (!this.hasAttribute("aria-label")) {
      const icon2 = this.getAttribute("icon") || this.textContent?.trim() || "";
      this.setAttribute("aria-label", icon2);
    }
    const icon = this.getAttribute("icon") || this.textContent?.trim() || "";
    const svg = ICON_SVGS[icon];
    this.shadowRoot.innerHTML = baseStyles(`
:host {
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--saz-space-small, 8px);
  border: none;
  border-radius: var(--saz-radius-round, 9999px);
  background: transparent;
  color: var(--saz-color-text, #1f2937);
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease, transform 0.15s ease;
  line-height: 1;
}
:host(:hover) { background: var(--saz-color-border, #e0e0e0); }
:host(:active) { transform: scale(0.9); }
:host([size="small"]) { padding: var(--saz-space-tiny, 4px); }
:host([size="large"]) { padding: var(--saz-space-medium, 12px); }
:host([size="xlarge"]) { padding: var(--saz-space-large, 16px); }
:host([variant="accent"]) { color: var(--saz-color-accent, #ff4d8a); }
:host([variant="primary"]) { color: var(--saz-color-primary, #2563eb); }
:host([variant="dim"]) { color: var(--saz-color-text-dim, #6b7280); }
:host([disabled]) { opacity: 0.5; cursor: not-allowed; pointer-events: none; }
:host(:focus-visible) {
  outline: 2px solid var(--saz-color-primary, #2563eb);
  outline-offset: 2px;
}
.icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--saz-icon-size-medium, 20px);
  height: var(--saz-icon-size-medium, 20px);
}
:host([size="small"]) .icon {
  width: var(--saz-icon-size-small, 16px);
  height: var(--saz-icon-size-small, 16px);
}
:host([size="large"]) .icon {
  width: var(--saz-icon-size-large, 24px);
  height: var(--saz-icon-size-large, 24px);
}
:host([size="xlarge"]) .icon {
  width: var(--saz-icon-size-xlarge, 32px);
  height: var(--saz-icon-size-xlarge, 32px);
}
.icon svg { width: 100%; height: 100%; pointer-events: none; }
`) + `<div class="icon">${svg || `<span class="glyph">${icon}</span>`}</div>`;
    this.addEventListener("keydown", (e) => {
      const ke = e;
      if (ke.key === "Enter" || ke.key === " ") {
        ke.preventDefault();
        this.click();
      }
    });
  }
}
class SazamiInput extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    const placeholder = this.getAttribute("placeholder") || "";
    const type = this.getAttribute("type") || "text";
    const value = this.getAttribute("value") || this.textContent?.trim() || "";
    this.shadowRoot.innerHTML = baseStyles(`
:host { display: block; }
input {
  width: 100%;
  padding: var(--saz-space-small, 8px) var(--saz-space-large, 16px);
  border: 1px solid var(--saz-color-border, #e0e0e0);
  border-radius: var(--saz-radius-medium, 8px);
  font-size: var(--saz-text-size-medium, 14px);
  font-family: inherit;
  color: var(--saz-color-text, #1f2937);
  background: var(--saz-color-background, #ffffff);
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
  box-sizing: border-box;
}
input:focus {
  border-color: var(--saz-color-primary, #2563eb);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
}
input::placeholder { color: var(--saz-color-text-dimmer, #9ca3af); }
:host([size="small"]) input {
  padding: var(--saz-space-tiny, 4px) var(--saz-space-small, 8px);
  font-size: var(--saz-text-size-small, 12px);
}
:host([size="large"]) input {
  padding: var(--saz-space-medium, 12px) var(--saz-space-large, 16px);
  font-size: var(--saz-text-size-large, 16px);
}
:host([size="xlarge"]) input {
  padding: var(--saz-space-large, 16px) var(--saz-space-xlarge, 24px);
  font-size: var(--saz-text-size-xlarge, 20px);
}
:host([disabled]) input {
  opacity: 0.5;
  cursor: not-allowed;
  background: var(--saz-color-surface, #f8f9fa);
}
:host([variant="accent"]) input:focus {
  border-color: var(--saz-color-accent, #ff4d8a);
  box-shadow: 0 0 0 3px rgba(255, 77, 138, 0.15);
}
`) + `<input type="${type}" placeholder="${placeholder}" value="${value}" ${this.hasAttribute("disabled") ? "disabled" : ""} />`;
    const input = this.shadowRoot.querySelector("input");
    if (input) {
      input.addEventListener("input", (e) => {
        this.dispatchEvent(
          new CustomEvent("saz-input", {
            detail: { value: e.target.value },
            bubbles: true,
            composed: true
          })
        );
      });
    }
  }
}
class SazamiCheckbox extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    if (!this.hasAttribute("role")) this.setAttribute("role", "checkbox");
    if (!this.hasAttribute("tabindex")) this.setAttribute("tabindex", "0");
    this.setAttribute(
      "aria-checked",
      this.hasAttribute("checked") ? "true" : "false"
    );
    const label = this.textContent?.trim() || "";
    this.shadowRoot.innerHTML = baseStyles(`
:host {
  display: inline-flex;
  align-items: center;
  gap: var(--saz-space-small, 8px);
  cursor: pointer;
  user-select: none;
}
.box {
  width: 18px;
  height: 18px;
  border: 2px solid var(--saz-color-border, #e0e0e0);
  border-radius: var(--saz-radius-soft, 4px);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s ease, border-color 0.15s ease;
  flex-shrink: 0;
  background: var(--saz-color-background, #fff);
}
:host([checked]) .box {
  background: var(--saz-color-primary, #2563eb);
  border-color: var(--saz-color-primary, #2563eb);
}
.check {
  color: #fff;
  width: 12px;
  height: 12px;
  opacity: 0;
  transition: opacity 0.1s ease;
}
.check svg { width: 100%; height: 100%; }
:host([checked]) .check { opacity: 1; }
.label {
  font-size: var(--saz-text-size-medium, 14px);
  color: var(--saz-color-text, #1f2937);
}
:host([disabled]) {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}
:host(:focus-visible) .box {
  outline: 2px solid var(--saz-color-primary, #2563eb);
  outline-offset: 2px;
}
`) + `<span class="box"><span class="check">${ICON_SVGS.check}</span></span>${label ? `<span class="label">${label}</span>` : ""}`;
    this.addEventListener("click", () => {
      if (this.hasAttribute("disabled")) return;
      this.toggleAttribute("checked");
      this.setAttribute(
        "aria-checked",
        this.hasAttribute("checked") ? "true" : "false"
      );
      this.dispatchEvent(
        new CustomEvent("saz-change", {
          detail: { checked: this.hasAttribute("checked") },
          bubbles: true,
          composed: true
        })
      );
    });
    this.addEventListener("keydown", (e) => {
      const ke = e;
      if (ke.key === "Enter" || ke.key === " ") {
        ke.preventDefault();
        this.click();
      }
    });
  }
}
class SazamiToggle extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    if (!this.hasAttribute("role")) this.setAttribute("role", "switch");
    if (!this.hasAttribute("tabindex")) this.setAttribute("tabindex", "0");
    this.setAttribute(
      "aria-checked",
      this.hasAttribute("checked") ? "true" : "false"
    );
    this.shadowRoot.innerHTML = baseStyles(`
:host {
  display: inline-flex;
  align-items: center;
  gap: var(--saz-space-small, 8px);
  cursor: pointer;
  user-select: none;
}
.track {
  width: 40px;
  height: 22px;
  border-radius: 11px;
  background: var(--saz-color-border, #e0e0e0);
  position: relative;
  transition: background 0.2s ease;
  flex-shrink: 0;
}
.thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #fff;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}
:host([checked]) .track { background: var(--saz-color-primary, #2563eb); }
:host([checked]) .thumb { transform: translateX(18px); }
:host([variant="accent"][checked]) .track { background: var(--saz-color-accent, #ff4d8a); }
:host([disabled]) { opacity: 0.5; cursor: not-allowed; pointer-events: none; }
:host(:focus-visible) .track {
  outline: 2px solid var(--saz-color-primary, #2563eb);
  outline-offset: 2px;
}
`) + `<span class="track"><span class="thumb"></span></span><slot></slot>`;
    this.addEventListener("click", () => {
      if (this.hasAttribute("disabled")) return;
      this.toggleAttribute("checked");
      this.setAttribute(
        "aria-checked",
        this.hasAttribute("checked") ? "true" : "false"
      );
      this.dispatchEvent(
        new CustomEvent("saz-change", {
          detail: { checked: this.hasAttribute("checked") },
          bubbles: true,
          composed: true
        })
      );
    });
    this.addEventListener("keydown", (e) => {
      const ke = e;
      if (ke.key === "Enter" || ke.key === " ") {
        ke.preventDefault();
        this.click();
      }
    });
  }
}
class SazamiImage extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    const src = this.getAttribute("src") || this.textContent?.trim() || "";
    const alt = this.getAttribute("alt") || "";
    this.shadowRoot.innerHTML = baseStyles(`
:host {
  display: block;
  overflow: hidden;
  border-radius: var(--saz-radius-medium, 8px);
  line-height: 0;
}
img {
  width: 100%;
  height: auto;
  display: block;
  object-fit: cover;
}
:host([shape="round"]) { border-radius: var(--saz-radius-round, 9999px); }
:host([shape="square"]) { border-radius: var(--saz-radius-none, 0); }
:host([size="small"])  { max-width: 120px; }
:host([size="medium"]) { max-width: 240px; }
:host([size="large"])  { max-width: 480px; }
:host([size="xlarge"]) { max-width: 640px; }
`) + `<img src="${src}" alt="${alt}" />`;
  }
}
class SazamiCoverart extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    const src = this.getAttribute("src") || this.textContent?.trim() || "";
    const alt = this.getAttribute("alt") || "Cover art";
    this.shadowRoot.innerHTML = baseStyles(`
:host {
  display: block;
  width: 64px;
  height: 64px;
  border-radius: var(--saz-radius-medium, 8px);
  overflow: hidden;
  flex-shrink: 0;
  background: var(--saz-color-border, #e0e0e0);
}
img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
:host([shape="round"]) { border-radius: var(--saz-radius-round, 9999px); }
:host([size="small"])  { width: 40px; height: 40px; }
:host([size="medium"]) { width: 64px; height: 64px; }
:host([size="large"])  { width: 96px; height: 96px; }
:host([size="xlarge"]) { width: 128px; height: 128px; }
`) + (src ? `<img src="${src}" alt="${alt}" />` : "");
  }
}
class SazamiIcon extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    const icon = this.getAttribute("icon") || this.textContent?.trim() || "";
    const svg = ICON_SVGS[icon];
    this.shadowRoot.innerHTML = baseStyles(`
:host {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--saz-icon-size-medium, 20px);
  height: var(--saz-icon-size-medium, 20px);
  color: inherit;
  line-height: 1;
}
:host([size="small"]) {
  width: var(--saz-icon-size-small, 16px);
  height: var(--saz-icon-size-small, 16px);
}
:host([size="large"]) {
  width: var(--saz-icon-size-large, 24px);
  height: var(--saz-icon-size-large, 24px);
}
:host([size="xlarge"]) {
  width: var(--saz-icon-size-xlarge, 32px);
  height: var(--saz-icon-size-xlarge, 32px);
}
:host([variant="accent"]) { color: var(--saz-color-accent, #ff4d8a); }
:host([variant="primary"]) { color: var(--saz-color-primary, #2563eb); }
:host([variant="dim"]) { color: var(--saz-color-text-dim, #6b7280); }
svg { width: 100%; height: 100%; }
`) + (svg || `<span>${icon}</span>`);
  }
}
class SazamiBadge extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    this.shadowRoot.innerHTML = baseStyles(`
:host {
  display: inline-flex;
  align-items: center;
  padding: var(--saz-space-tiny, 4px) var(--saz-space-small, 8px);
  border-radius: var(--saz-radius-round, 9999px);
  font-size: var(--saz-text-size-small, 12px);
  font-weight: var(--saz-text-weight-medium, 500);
  line-height: 1;
  white-space: nowrap;
  background: var(--saz-color-surface, #f8f9fa);
  color: var(--saz-color-text, #1f2937);
  border: 1px solid var(--saz-color-border, #e0e0e0);
}
:host([variant="accent"])    { background: var(--saz-color-accent, #ff4d8a); color: var(--saz-color-on-accent, #fff); border-color: transparent; }
:host([variant="primary"])   { background: var(--saz-color-primary, #2563eb); color: var(--saz-color-on-primary, #fff); border-color: transparent; }
:host([variant="secondary"]) { background: var(--saz-color-secondary, #6b7280); color: #fff; border-color: transparent; }
:host([variant="danger"])    { background: var(--saz-color-danger, #ef4444); color: #fff; border-color: transparent; }
:host([variant="success"])   { background: var(--saz-color-success, #10b981); color: #fff; border-color: transparent; }
:host([variant="dim"])       { background: transparent; color: var(--saz-color-text-dim, #6b7280); }
:host([size="small"]) { font-size: 10px; padding: 2px var(--saz-space-tiny, 4px); }
:host([size="large"]) { font-size: var(--saz-text-size-medium, 14px); padding: var(--saz-space-small, 8px) var(--saz-space-medium, 12px); }
:host([size="xlarge"]) { font-size: var(--saz-text-size-large, 16px); padding: var(--saz-space-medium, 12px) var(--saz-space-large, 16px); }
`) + "<slot></slot>";
  }
}
class SazamiTag extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    this.shadowRoot.innerHTML = baseStyles(`
:host {
  display: inline-flex;
  align-items: center;
  padding: var(--saz-space-small, 8px) var(--saz-space-medium, 12px);
  border-radius: var(--saz-radius-medium, 8px);
  font-size: var(--saz-text-size-small, 12px);
  font-weight: var(--saz-text-weight-medium, 500);
  background: var(--saz-color-surface, #f8f9fa);
  color: var(--saz-color-text, #1f2937);
  border: 1px solid var(--saz-color-border, #e0e0e0);
}
:host([variant="accent"])  { background: var(--saz-color-accent, #ff4d8a); color: #fff; border-color: transparent; }
:host([variant="primary"]) { background: var(--saz-color-primary, #2563eb); color: #fff; border-color: transparent; }
:host([variant="danger"])  { background: var(--saz-color-danger, #ef4444); color: #fff; border-color: transparent; }
:host([variant="success"]) { background: var(--saz-color-success, #10b981); color: #fff; border-color: transparent; }
:host([variant="dim"])     { background: transparent; color: var(--saz-color-text-dim, #6b7280); }
`) + "<slot></slot>";
  }
}
class SazamiDivider extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    this.shadowRoot.innerHTML = baseStyles(`
:host {
  display: block;
  border: none;
  background: var(--saz-color-border, #e0e0e0);
  margin: var(--saz-space-medium, 12px) 0;
}
:host(:not([vertical])) { height: 1px; width: 100%; }
:host([vertical]) {
  width: 1px;
  height: 100%;
  margin: 0 var(--saz-space-medium, 12px);
  align-self: stretch;
}
:host([size="small"]) { margin: var(--saz-space-small, 8px) 0; }
:host([size="large"]) { margin: var(--saz-space-large, 16px) 0; }
:host([size="xlarge"]) { margin: var(--saz-space-xlarge, 24px) 0; }
:host([variant="dim"]) { background: var(--saz-color-surface, #f8f9fa); }
`) + "";
  }
}
class SazamiSpacer extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    this.shadowRoot.innerHTML = baseStyles(`
:host { display: block; flex: 1; }
:host([size="small"])  { flex: none; width: var(--saz-space-small, 8px); height: var(--saz-space-small, 8px); }
:host([size="medium"]) { flex: none; width: var(--saz-space-medium, 12px); height: var(--saz-space-medium, 12px); }
:host([size="large"])  { flex: none; width: var(--saz-space-large, 16px); height: var(--saz-space-large, 16px); }
:host([size="xlarge"]) { flex: none; width: var(--saz-space-xlarge, 24px); height: var(--saz-space-xlarge, 24px); }
`) + "";
  }
}
class SazamiSection extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    this.shadowRoot.innerHTML = baseStyles(`
:host {
  display: flex;
  flex-direction: column;
}
:host([layout="row"]) { flex-direction: row; }
${GAP_RULES}
:host([align="center"]) { align-items: center; }
`) + "<slot></slot>";
    if (this.hasAttribute("center-point")) {
      requestAnimationFrame(() => {
        const rect = this.getBoundingClientRect();
        this.dataset.centerX = (rect.left + rect.width / 2).toString();
        this.dataset.centerY = (rect.top + rect.height / 2).toString();
      });
    }
  }
}
function createGenericClass() {
  return class extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
    }
    connectedCallback() {
      this.shadowRoot.innerHTML = baseStyles(`
:host {
  display: flex;
  flex-direction: column;
}
:host([layout="row"]) { flex-direction: row; }
${GAP_RULES}
:host([align="center"]) { align-items: center; }
:host([justify="space-between"]) { justify-content: space-between; }
`) + "<slot></slot>";
    }
  };
}
class SazamiModal extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    const title = this.getAttribute("title") || "";
    const open = this.hasAttribute("open");
    this.shadowRoot.innerHTML = baseStyles(`
:host {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  visibility: hidden;
  opacity: 0;
  transition: opacity 0.2s ease, visibility 0.2s ease;
}
:host([open]) {
  visibility: visible;
  opacity: 1;
}
.overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
}
.dialog {
  position: relative;
  background: var(--saz-color-background, #fff);
  border-radius: var(--saz-radius-medium, 12px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  max-width: 90vw;
  max-height: 90vh;
  overflow: auto;
  transform: scale(0.95);
  transition: transform 0.2s ease;
}
:host([open]) .dialog {
  transform: scale(1);
}
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--saz-space-large, 16px);
  border-bottom: 1px solid var(--saz-color-border, #e0e0e0);
}
.title {
  font-size: var(--saz-text-size-large, 18px);
  font-weight: 600;
  color: var(--saz-color-text, #1f2937);
  margin: 0;
}
.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: var(--saz-radius-soft, 4px);
  cursor: pointer;
  color: var(--saz-color-text-dim, #6b7280);
  transition: background 0.15s ease, color 0.15s ease;
}
.close-btn:hover {
  background: var(--saz-color-surface, #f3f4f6);
  color: var(--saz-color-text, #1f2937);
}
.close-btn svg {
  width: 20px;
  height: 20px;
}
.content {
  padding: var(--saz-space-large, 16px);
}
`) + `<div class="overlay"></div>
       <div class="dialog" role="dialog" aria-modal="true" aria-labelledby="modal-title">
         <div class="header">
           <h2 class="title" id="modal-title">${title}</h2>
           <button class="close-btn" aria-label="Close">
             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
           </button>
         </div>
         <div class="content"><slot></slot></div>
       </div>`;
    const closeBtn = this.shadowRoot.querySelector(".close-btn");
    closeBtn?.addEventListener("click", () => this.close());
    const overlay = this.shadowRoot.querySelector(".overlay");
    overlay?.addEventListener("click", () => this.close());
    this.addEventListener("keydown", (e) => {
      const ke = e;
      if (ke.key === "Escape" && this.hasAttribute("open")) {
        this.close();
      }
    });
    if (open) this.open();
  }
  open() {
    this.setAttribute("open", "");
    this.dispatchEvent(
      new CustomEvent("saz-open", { bubbles: true, composed: true })
    );
  }
  close() {
    this.removeAttribute("open");
    this.dispatchEvent(
      new CustomEvent("saz-close", { bubbles: true, composed: true })
    );
  }
}
class SazamiSelect extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    const placeholder = this.getAttribute("placeholder") || "Select...";
    const value = this.getAttribute("value") || "";
    const disabled = this.hasAttribute("disabled");
    const options = Array.from(this.querySelectorAll("option")).map((opt) => ({
      value: opt.getAttribute("value") || opt.textContent || "",
      label: opt.textContent || ""
    }));
    const selectedOption = options.find((o) => o.value === value);
    this.shadowRoot.innerHTML = baseStyles(`
:host {
  display: block;
  position: relative;
  width: 100%;
}
.trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: var(--saz-space-small, 8px) var(--saz-space-large, 16px);
  border: 1px solid var(--saz-color-border, #e0e0e0);
  border-radius: var(--saz-radius-medium, 8px);
  background: var(--saz-color-background, #fff);
  color: var(--saz-color-text, #1f2937);
  font-size: var(--saz-text-size-medium, 14px);
  cursor: pointer;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}
.trigger:hover {
  border-color: var(--saz-color-primary, #2563eb);
}
.trigger:focus {
  outline: none;
  border-color: var(--saz-color-primary, #2563eb);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
}
.trigger svg {
  width: 16px;
  height: 16px;
  color: var(--saz-color-text-dim, #6b7280);
  transition: transform 0.2s ease;
}
:host([open]) .trigger svg {
  transform: rotate(180deg);
}
:host([disabled]) .trigger {
  opacity: 0.5;
  cursor: not-allowed;
}
.dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 4px;
  background: var(--saz-color-background, #fff);
  border: 1px solid var(--saz-color-border, #e0e0e0);
  border-radius: var(--saz-radius-medium, 8px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 100;
  visibility: hidden;
  opacity: 0;
  transform: translateY(-8px);
  transition: opacity 0.15s ease, transform 0.15s ease, visibility 0.15s ease;
  max-height: 200px;
  overflow-y: auto;
}
:host([open]) .dropdown {
  visibility: visible;
  opacity: 1;
  transform: translateY(0);
}
.option {
  padding: var(--saz-space-small, 8px) var(--saz-space-large, 16px);
  cursor: pointer;
  transition: background 0.1s ease;
}
.option:hover {
  background: var(--saz-color-surface, #f3f4f6);
}
.option.selected,
.option:hover {
  background: var(--saz-color-primary, #2563eb);
  color: var(--saz-color-on-primary, #fff);
}
`) + `<div class="trigger" role="combobox" aria-haspopup="listbox" aria-expanded="false">
         <span class="value">${selectedOption?.label || placeholder}</span>
         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
       </div>
       <div class="dropdown" role="listbox">
         ${options.map((opt, i) => `<div class="option${opt.value === value ? " selected" : ""}" role="option" data-value="${opt.value}">${opt.label}</div>`).join("")}
       </div>`;
    if (disabled) return;
    const trigger = this.shadowRoot.querySelector(".trigger");
    const dropdown = this.shadowRoot.querySelector(".dropdown");
    trigger?.addEventListener("click", () => {
      this.toggleAttribute("open");
    });
    dropdown?.addEventListener("click", (e) => {
      const target = e.target;
      if (target.classList.contains("option")) {
        const newValue = target.getAttribute("data-value") || "";
        this.setAttribute("value", newValue);
        this.removeAttribute("open");
        this.dispatchEvent(
          new CustomEvent("saz-change", {
            detail: { value: newValue },
            bubbles: true,
            composed: true
          })
        );
      }
    });
    document.addEventListener("click", (e) => {
      if (!this.contains(e.target)) {
        this.removeAttribute("open");
      }
    });
  }
}
class SazamiTabs extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    const tabs = Array.from(this.querySelectorAll(":scope > [slot='tab']")).map(
      (tab, i) => ({
        label: tab.getAttribute("label") || tab.textContent || `Tab ${i + 1}`,
        panelId: `panel-${i}`,
        tabId: `tab-${i}`
      })
    );
    const panels = Array.from(this.querySelectorAll(":scope > [slot='panel']"));
    const activeTab = this.getAttribute("active") || "0";
    this.shadowRoot.innerHTML = baseStyles(`
:host { display: block; }
.tabs {
  display: flex;
  border-bottom: 1px solid var(--saz-color-border, #e0e0e0);
  gap: var(--saz-space-tiny, 4px);
}
.tab {
  padding: var(--saz-space-small, 8px) var(--saz-space-large, 16px);
  border: none;
  background: transparent;
  color: var(--saz-color-text-dim, #6b7280);
  font-size: var(--saz-text-size-medium, 14px);
  font-weight: 500;
  cursor: pointer;
  position: relative;
  transition: color 0.2s ease;
}
.tab::after {
  content: "";
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 2px;
  background: var(--saz-color-primary, #2563eb);
  transform: scaleX(0);
  transition: transform 0.25s ease;
}
.tab.active,
.tab[active] {
  color: var(--saz-color-primary, #2563eb);
}
.tab.active::after,
.tab[active]::after {
  transform: scaleX(1);
}
.tab:focus-visible {
  outline: 2px solid var(--saz-color-primary, #2563eb);
  outline-offset: -2px;
}
.panels {
  padding: var(--saz-space-large, 16px) 0;
  position: relative;
  overflow: hidden;
  min-height: 60px;
}
.panel {
  display: none;
  animation: slideIn 0.25s ease;
}
.panel.active {
  display: block;
}
@keyframes slideIn {
  from { opacity: 0; transform: translateX(12px); }
  to { opacity: 1; transform: translateX(0); }
}
.panel {
  display: none;
  animation: slideIn 0.25s ease;
}
.panel.active {
  display: block;
}
@keyframes slideIn {
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
}
`) + `<div class="tabs" role="tablist">
         ${tabs.map((t, i) => `<button class="tab${i.toString() === activeTab ? " active" : ""}" role="tab" id="${t.tabId}" aria-selected="${i.toString() === activeTab}" aria-controls="${t.panelId}">${t.label}</button>`).join("")}
       </div>
        <div class="panels">
          ${panels.map((panel, i) => {
      const content = panel.innerHTML || `Panel ${i + 1}`;
      return `<div class="panel${i.toString() === activeTab ? " active" : ""}" role="tabpanel" id="panel-${i}" aria-labelledby="tab-${i}" style="display: ${i.toString() === activeTab ? "block" : "none"}">${content}</div>`;
    }).join("")}
        </div>`;
    const tabButtons = this.shadowRoot.querySelectorAll(".tab");
    const panelElements = this.shadowRoot.querySelectorAll(".panel");
    tabButtons.forEach((btn, i) => {
      btn.addEventListener("click", () => {
        tabButtons.forEach((b, j) => {
          b.classList.toggle("active", j === i);
          b.setAttribute("aria-selected", j === i ? "true" : "false");
        });
        panelElements.forEach((p, j) => {
          p.style.display = j === i ? "block" : "none";
        });
        this.setAttribute("active", i.toString());
        this.dispatchEvent(
          new CustomEvent("saz-change", {
            detail: { activeIndex: i },
            bubbles: true,
            composed: true
          })
        );
      });
    });
  }
}
class SazamiSlider extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    const min = parseFloat(this.getAttribute("min") || "0");
    const max = parseFloat(this.getAttribute("max") || "100");
    const value = parseFloat(this.getAttribute("value") || "50");
    const step = parseFloat(this.getAttribute("step") || "1");
    const disabled = this.hasAttribute("disabled");
    const size = this.getAttribute("size") || "medium";
    const percent = (value - min) / (max - min) * 100;
    const sizes = {
      tiny: { track: "4px", thumb: "16px" },
      small: { track: "6px", thumb: "18px" },
      medium: { track: "8px", thumb: "20px" },
      large: { track: "10px", thumb: "24px" },
      xlarge: { track: "14px", thumb: "28px" }
    };
    const trackHeight = sizes[size]?.track || sizes.medium.track;
    const thumbSize = sizes[size]?.thumb || sizes.medium.thumb;
    this.shadowRoot.innerHTML = baseStyles(`
:host {
  display: block;
  width: 100%;
  padding: 8px 0;
  box-sizing: border-box;
}
.slider-container {
  position: relative;
  width: 100%;
  height: ${thumbSize};
  display: flex;
  align-items: center;
}
.track {
  position: absolute;
  width: 100%;
  height: ${trackHeight};
  background: var(--saz-color-border, #e0e0e0);
  border-radius: 999px;
  overflow: hidden;
}
.filled {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background: var(--saz-color-primary, #2563eb);
  border-radius: 999px;
}
.slider {
  position: relative;
  width: 100%;
  height: ${thumbSize};
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
  cursor: pointer;
  z-index: 1;
}
.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: ${thumbSize};
  height: ${thumbSize};
  border-radius: 50%;
  background: var(--saz-color-primary, #2563eb);
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(37, 99, 235, 0.3);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.slider::-webkit-slider-thumb:hover {
  transform: scale(1.15);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
}
.slider::-moz-range-thumb {
  width: ${thumbSize};
  height: ${thumbSize};
  border: none;
  border-radius: 50%;
  background: var(--saz-color-primary, #2563eb);
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(37, 99, 235, 0.3);
}
.slider:focus-visible {
  outline: none;
}
.slider:focus-visible::-webkit-slider-thumb {
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.3), 0 2px 6px rgba(37, 99, 235, 0.3);
}
.labels {
  display: flex;
  justify-content: space-between;
  margin-top: var(--saz-space-small, 8px);
  font-size: var(--saz-text-size-small, 12px);
  color: var(--saz-color-text-dim, #6b7280);
}
:host([disabled]) .slider {
  opacity: 0.5;
  cursor: not-allowed;
}
:host([disabled]) .slider::-webkit-slider-thumb {
  cursor: not-allowed;
}
`) + `<div class="slider-container">
         <div class="track">
           <div class="filled" style="width: ${percent}%"></div>
         </div>
         <input type="range" class="slider" min="${min}" max="${max}" step="${step}" value="${value}" ${disabled ? "disabled" : ""} />
       </div>
       <div class="labels">
         <span>${min}</span>
         <span>${max}</span>
       </div>`;
    const slider = this.shadowRoot.querySelector(
      ".slider"
    );
    const filled = this.shadowRoot.querySelector(".filled");
    slider?.addEventListener("input", () => {
      const val = parseFloat(slider.value);
      const pct = (val - min) / (max - min) * 100;
      filled.style.width = `${pct}%`;
      this.dispatchEvent(
        new CustomEvent("saz-input", {
          detail: { value: val },
          bubbles: true,
          composed: true
        })
      );
    });
  }
  static get observedAttributes() {
    return ["value", "min", "max", "size"];
  }
  attributeChangedCallback() {
    this.connectedCallback();
  }
}
class SazamiRadio extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    const name = this.getAttribute("name") || "";
    const value = this.getAttribute("value") || "";
    this.hasAttribute("checked");
    const disabled = this.hasAttribute("disabled");
    const label = this.textContent?.trim() || "";
    this.shadowRoot.innerHTML = baseStyles(`
:host {
  display: inline-flex;
  align-items: center;
  gap: var(--saz-space-small, 8px);
  cursor: pointer;
  user-select: none;
}
.radio {
  width: 18px;
  height: 18px;
  border: 2px solid var(--saz-color-border, #e0e0e0);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.15s ease;
  flex-shrink: 0;
  background: var(--saz-color-background, #fff);
}
.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--saz-color-primary, #2563eb);
  opacity: 0;
  transform: scale(0);
  transition: opacity 0.15s ease, transform 0.15s ease;
}
:host([checked]) .radio {
  border-color: var(--saz-color-primary, #2563eb);
}
:host([checked]) .dot {
  opacity: 1;
  transform: scale(1);
}
.label {
  font-size: var(--saz-text-size-medium, 14px);
  color: var(--saz-color-text, #1f2937);
}
:host([disabled]) {
  opacity: 0.5;
  cursor: not-allowed;
}
:host(:focus-visible) .radio {
  outline: 2px solid var(--saz-color-primary, #2563eb);
  outline-offset: 2px;
}
`) + `<div class="radio"><div class="dot"></div></div>${label ? `<span class="label">${label}</span>` : ""}`;
    if (disabled) return;
    this.addEventListener("click", () => {
      if (this.hasAttribute("disabled")) return;
      document.querySelectorAll(`saz-radio[name="${name}"]`).forEach((el) => {
        el.removeAttribute("checked");
      });
      this.setAttribute("checked", "");
      this.dispatchEvent(
        new CustomEvent("saz-change", {
          detail: { value },
          bubbles: true,
          composed: true
        })
      );
    });
    this.addEventListener("keydown", (e) => {
      const ke = e;
      if (ke.key === "Enter" || ke.key === " ") {
        ke.preventDefault();
        this.click();
      }
    });
  }
}
class SazamiSwitch extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    this.hasAttribute("checked");
    const disabled = this.hasAttribute("disabled");
    const label = this.textContent?.trim() || "";
    this.shadowRoot.innerHTML = baseStyles(`
:host {
  display: inline-flex;
  align-items: center;
  gap: var(--saz-space-small, 8px);
  cursor: pointer;
  user-select: none;
}
.switch {
  width: 44px;
  height: 24px;
  border-radius: 12px;
  background: var(--saz-color-border, #e0e0e0);
  position: relative;
  transition: background 0.2s ease;
  flex-shrink: 0;
}
.thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s ease;
}
:host([checked]) .switch {
  background: var(--saz-color-primary, #2563eb);
}
:host([checked]) .thumb {
  transform: translateX(20px);
}
:host([variant="accent"]) .switch {
  background: var(--saz-color-border, #e0e0e0);
}
:host([variant="accent"][checked]) .switch {
  background: var(--saz-color-accent, #ff4d8a);
}
:host([variant="success"]) .switch {
  background: var(--saz-color-border, #e0e0e0);
}
:host([variant="success"][checked]) .switch {
  background: var(--saz-color-success, #10b981);
}
.label {
  font-size: var(--saz-text-size-medium, 14px);
  color: var(--saz-color-text, #1f2937);
}
:host([disabled]) {
  opacity: 0.5;
  cursor: not-allowed;
}
:host(:focus-visible) .switch {
  outline: 2px solid var(--saz-color-primary, #2563eb);
  outline-offset: 2px;
}
`) + `<div class="switch"><div class="thumb"></div></div>${label ? `<span class="label">${label}</span>` : ""}`;
    if (disabled) return;
    this.addEventListener("click", () => {
      this.toggleAttribute("checked");
      this.dispatchEvent(
        new CustomEvent("saz-change", {
          detail: { checked: this.hasAttribute("checked") },
          bubbles: true,
          composed: true
        })
      );
    });
    this.addEventListener("keydown", (e) => {
      const ke = e;
      if (ke.key === "Enter" || ke.key === " ") {
        ke.preventDefault();
        this.click();
      }
    });
  }
}
class SazamiToast extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    const variant = this.getAttribute("variant") || "default";
    const message = this.getAttribute("message") || this.textContent?.trim() || "";
    const duration = parseInt(this.getAttribute("duration") || "3000");
    const showClose = !this.hasAttribute("no-close");
    const icon = variant === "success" ? ICON_SVGS.check : variant === "error" || variant === "danger" ? ICON_SVGS.close : variant === "warning" ? "⚠" : "ℹ";
    this.shadowRoot.innerHTML = baseStyles(`
:host {
  position: fixed;
  bottom: var(--saz-space-large, 16px);
  right: var(--saz-space-large, 16px);
  z-index: 9998;
  display: flex;
  align-items: center;
  gap: var(--saz-space-small, 8px);
  padding: var(--saz-space-small, 8px) var(--saz-space-large, 16px);
  background: var(--saz-color-background, #fff);
  border-radius: var(--saz-radius-medium, 8px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(100px);
  opacity: 0;
  transition: transform 0.3s ease, opacity 0.3s ease;
  max-width: 320px;
}
:host([visible]) {
  transform: translateY(0);
  opacity: 1;
}
.icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}
:host([variant="success"]) .icon { color: var(--saz-color-success, #10b981); }
:host([variant="error"]) .icon { color: var(--saz-color-danger, #ef4444); }
:host([variant="warning"]) .icon { color: #f59e0b; }
:host([variant="info"]) .icon { color: var(--saz-color-primary, #2563eb); }

.message {
  flex: 1;
  font-size: var(--saz-text-size-medium, 14px);
  color: var(--saz-color-text, #1f2937);
}
.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--saz-color-text-dim, #6b7280);
  border-radius: var(--saz-radius-soft, 4px);
  transition: background 0.15s ease;
}
.close-btn:hover {
  background: var(--saz-color-surface, #f3f4f6);
}
.close-btn svg {
  width: 18px;
  height: 18px;
}
`) + `<span class="icon">${icon}</span>
       <span class="message">${message}</span>
       ${showClose ? `<button class="close-btn" aria-label="Close">${ICON_SVGS.close}</button>` : ""}`;
    if (showClose) {
      const closeBtn = this.shadowRoot.querySelector(".close-btn");
      closeBtn?.addEventListener("click", () => this.hide());
    }
    requestAnimationFrame(() => {
      this.setAttribute("visible", "");
    });
    if (duration > 0) {
      setTimeout(() => this.hide(), duration);
    }
  }
  hide() {
    this.removeAttribute("visible");
    setTimeout(() => {
      this.dispatchEvent(
        new CustomEvent("saz-close", { bubbles: true, composed: true })
      );
      this.remove();
    }, 300);
  }
  static show(message, variant = "info", duration = 3e3) {
    const toast = document.createElement("saz-toast");
    toast.setAttribute("message", message);
    toast.setAttribute("variant", variant);
    toast.setAttribute("duration", duration.toString());
    document.body.appendChild(toast);
    return toast;
  }
}
class SazamiAvatar extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    const src = this.getAttribute("src") || "";
    const alt = this.getAttribute("alt") || "";
    const initialsAttr = this.getAttribute("initials") || "";
    this.getAttribute("size") || "medium";
    const textContent = this.textContent?.trim() || "";
    const initials = initialsAttr || this.getInitials(alt || textContent);
    this.shadowRoot.innerHTML = baseStyles(`
:host {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  overflow: hidden;
  background: var(--saz-color-primary, #2563eb);
  color: var(--saz-color-on-primary, #fff);
  font-weight: 600;
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  font-size: 14px;
}
:host([size="tiny"])   { width: 24px; height: 24px; font-size: 10px; }
:host([size="small"])  { width: 32px; height: 32px; font-size: 12px; }
:host([size="medium"]) { width: 40px; height: 40px; font-size: 14px; }
:host([size="large"])  { width: 56px; height: 56px; font-size: 20px; }
:host([size="xlarge"]) { width: 80px; height: 80px; font-size: 28px; }
.image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.initials {
  text-transform: uppercase;
  user-select: none;
}
:host([shape="square"]) { border-radius: var(--saz-radius-medium, 8px); }
:host([shape="rounded"]) { border-radius: var(--saz-radius-soft, 4px); }
`) + (src ? `<img class="image" src="${src}" alt="${alt}" />` : `<span class="initials">${initials}</span>`);
  }
  getInitials(name) {
    return name.split(" ").map((n) => n[0]).slice(0, 2).join("");
  }
}
class SazamiChip extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    const label = this.getAttribute("label") || this.textContent?.trim() || "";
    this.getAttribute("variant") || "default";
    const removable = this.hasAttribute("removable");
    this.hasAttribute("selected");
    this.shadowRoot.innerHTML = baseStyles(`
:host {
  display: inline-flex;
  align-items: center;
  gap: var(--saz-space-tiny, 4px);
  padding: var(--saz-space-tiny, 4px) var(--saz-space-small, 8px);
  border-radius: var(--saz-radius-round, 9999px);
  font-size: var(--saz-text-size-small, 12px);
  font-weight: 500;
  cursor: pointer;
  user-select: none;
  transition: background 0.15s ease, color 0.15s ease;
}
:host(:not([size])) {
  padding: var(--saz-space-tiny, 4px) var(--saz-space-small, 8px);
  font-size: var(--saz-text-size-small, 12px);
}
:host([size="small"]) {
  padding: 2px var(--saz-space-tiny, 4px);
  font-size: 10px;
}
:host([size="large"]) {
  padding: var(--saz-space-small, 8px) var(--saz-space-medium, 12px);
  font-size: var(--saz-text-size-medium, 14px);
}
:host([size="xlarge"]) {
  padding: var(--saz-space-medium, 12px) var(--saz-space-large, 16px);
  font-size: var(--saz-text-size-large, 16px);
}
:host([variant="default"]) {
  background: var(--saz-color-surface, #f3f4f6);
  color: var(--saz-color-text, #1f2937);
}
:host([variant="primary"]) {
  background: var(--saz-color-primary, #2563eb);
  color: var(--saz-color-on-primary, #fff);
}
:host([variant="accent"]) {
  background: var(--saz-color-accent, #ff4d8a);
  color: var(--saz-color-on-accent, #fff);
}
:host([variant="success"]) {
  background: var(--saz-color-success, #10b981);
  color: #fff;
}
:host([variant="warning"]) {
  background: #fef3c7;
  color: #92400e;
}
:host([variant="danger"]) {
  background: var(--saz-color-danger, #ef4444);
  color: #fff;
}
:host([selected]) {
  background: var(--saz-color-primary, #2563eb);
  color: var(--saz-color-on-primary, #fff);
}
:host(:hover) {
  filter: brightness(0.95);
}
:host([disabled]) {
  opacity: 0.5;
  cursor: not-allowed;
}
.remove-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 50%;
  color: inherit;
  opacity: 0.7;
  transition: opacity 0.15s ease, background 0.15s ease;
}
.remove-btn:hover {
  opacity: 1;
  background: rgba(0, 0, 0, 0.1);
}
.remove-btn svg {
  width: 16px;
  height: 16px;
}
`) + `${label}${removable ? `<button class="remove-btn" aria-label="Remove">${ICON_SVGS.close}</button>` : ""}`;
    if (removable) {
      const btn = this.shadowRoot.querySelector(".remove-btn");
      btn?.addEventListener("click", (e) => {
        e.stopPropagation();
        this.dispatchEvent(
          new CustomEvent("saz-remove", { bubbles: true, composed: true })
        );
        this.remove();
      });
    }
    this.addEventListener("click", () => {
      if (this.hasAttribute("disabled")) return;
      this.toggleAttribute("selected");
      this.dispatchEvent(
        new CustomEvent("saz-change", {
          detail: { selected: this.hasAttribute("selected") },
          bubbles: true,
          composed: true
        })
      );
    });
  }
}
class SazamiSpinner extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    this.getAttribute("size") || "medium";
    const label = this.getAttribute("label") || "Loading...";
    this.shadowRoot.innerHTML = baseStyles(`
:host {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--saz-space-small, 8px);
}
.spinner {
  animation: spin 1s linear infinite;
  color: var(--saz-color-primary, #2563eb);
}
:host(:not([size])) .spinner,
:host([size="medium"]) .spinner { width: 24px; height: 24px; }
:host([size="tiny"]) .spinner { width: 12px; height: 12px; }
:host([size="small"]) .spinner { width: 16px; height: 16px; }
:host([size="large"]) .spinner { width: 32px; height: 32px; }
:host([size="xlarge"]) .spinner { width: 48px; height: 48px; }
:host([variant="accent"]) .spinner { color: var(--saz-color-accent, #ff4d8a); }
:host([variant="light"]) .spinner { color: #fff; }
.label {
  font-size: var(--saz-text-size-small, 12px);
  color: var(--saz-color-text-dim, #6b7280);
}
:host([label=""]) .label,
:host(:not([label])) .label { display: none; }
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
`) + `<svg class="spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
         <circle cx="12" cy="12" r="10" stroke-opacity="0.25"/>
         <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"/>
       </svg>
       ${`<span class="label">${label}</span>`}`;
  }
}
class SazamiProgress extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    const value = parseFloat(this.getAttribute("value") || "50");
    const max = parseFloat(this.getAttribute("max") || "100");
    const min = parseFloat(this.getAttribute("min") || "0");
    const indeterminate = this.hasAttribute("indeterminate");
    this.getAttribute("size") || "medium";
    const percent = Math.min(
      100,
      Math.max(0, (value - min) / (max - min) * 100)
    );
    this.shadowRoot.innerHTML = baseStyles(`
:host { display: block; width: 100%; }
.track {
  width: 100%;
  background: var(--saz-color-surface, #f3f4f6);
  border-radius: var(--saz-radius-round, 9999px);
  overflow: hidden;
  border: 2px solid var(--saz-color-border, #e0e0e0);
}
:host(:not([size])) .track,
:host([size="medium"]) .track { height: 12px; }
:host([size="tiny"]) .track { height: 6px; }
:host([size="small"]) .track { height: 8px; }
:host([size="large"]) .track { height: 16px; }
:host([size="xlarge"]) .track { height: 20px; }
.bar {
  height: 100%;
  background: var(--saz-color-primary, #2563eb);
  border-radius: var(--saz-radius-round, 9999px);
  transition: width 0.3s ease;
}
:host([variant="accent"]) .bar { background: var(--saz-color-accent, #ff4d8a); }
:host([variant="success"]) .bar { background: var(--saz-color-success, #10b981); }
:host([variant="danger"]) .bar { background: var(--saz-color-danger, #ef4444); }
:host([indeterminate]) .bar {
  width: 30% !important;
  animation: indeterminate 1.5s ease-in-out infinite;
}
@keyframes indeterminate {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(400%); }
}
`) + `<div class="track">
         <div class="bar" style="width: ${indeterminate ? "30%" : percent + "%"}"></div>
       </div>`;
  }
  static get observedAttributes() {
    return ["value", "max", "min"];
  }
  attributeChangedCallback() {
    this.connectedCallback();
  }
}
class SazamiAccordion extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    const items = Array.from(this.querySelectorAll(":scope > *")).map(
      (el, i) => ({
        title: el.getAttribute("heading") || `Section ${i + 1}`,
        content: el.innerHTML,
        open: el.hasAttribute("open")
      })
    );
    this.shadowRoot.innerHTML = baseStyles(`
:host { display: block; }
.item {
  border-bottom: 1px solid var(--saz-color-border, #e0e0e0);
}
.item:first-child { border-top: 1px solid var(--saz-color-border, #e0e0e0); }
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--saz-space-medium, 12px) var(--saz-space-small, 8px);
  cursor: pointer;
  background: transparent;
  border: none;
  width: 100%;
  text-align: left;
  font-size: inherit;
  font-family: inherit;
  color: var(--saz-color-text, #1f2937);
  transition: background 0.15s ease;
}
.header:hover {
  background: var(--saz-color-surface, #f8f9fa);
}
.header:focus-visible {
  outline: 2px solid var(--saz-color-primary, #2563eb);
  outline-offset: -2px;
}
.title {
  font-weight: 500;
  font-size: var(--saz-text-size-medium, 14px);
}
.chevron {
  width: 20px;
  height: 20px;
  color: var(--saz-color-text-dim, #6b7280);
  transition: transform 0.2s ease;
  flex-shrink: 0;
}
.item[open] .chevron {
  transform: rotate(180deg);
}
.content {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease, padding 0.3s ease;
  padding: 0 var(--saz-space-small, 8px);
}
.item[open] .content {
  max-height: 500px;
  padding-bottom: var(--saz-space-medium, 12px);
}
.inner-content {
  font-size: var(--saz-text-size-medium, 14px);
  color: var(--saz-color-text-dim, #6b7280);
  line-height: 1.5;
}
`) + items.map(
      (item, i) => `
        <div class="item" ${item.open ? "open" : ""}>
          <button class="header" aria-expanded="${item.open}" aria-controls="accordion-content-${i}">
            <span class="title">${item.title}</span>
            <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
          </button>
          <div class="content" id="accordion-content-${i}">
            <div class="inner-content">${item.content}</div>
          </div>
        </div>
      `
    ).join("");
    const headers = this.shadowRoot.querySelectorAll(".header");
    headers.forEach((header, i) => {
      header.addEventListener("click", () => {
        const item = header.parentElement;
        const isOpen = item?.hasAttribute("open");
        if (this.hasAttribute("single-open")) {
          this.shadowRoot.querySelectorAll(".item").forEach(
            (el) => el.removeAttribute("open")
          );
          headers.forEach((h) => h.setAttribute("aria-expanded", "false"));
        }
        if (isOpen) {
          item?.removeAttribute("open");
          header.setAttribute("aria-expanded", "false");
        } else {
          item?.setAttribute("open", "");
          header.setAttribute("aria-expanded", "true");
        }
        this.dispatchEvent(
          new CustomEvent("saz-change", {
            detail: { index: i, open: !isOpen },
            bubbles: true,
            composed: true
          })
        );
      });
    });
  }
}
const COMPONENT_REGISTRY = {
  "saz-row": SazamiRow,
  "saz-column": SazamiColumn,
  "saz-grid": SazamiGrid,
  "saz-stack": SazamiStack,
  "saz-card": SazamiCard,
  "saz-text": SazamiText,
  "saz-heading": SazamiHeading,
  "saz-label": SazamiLabel,
  "saz-button": SazamiButton,
  "saz-icon-button": SazamiIconButton,
  "saz-input": SazamiInput,
  "saz-checkbox": SazamiCheckbox,
  "saz-toggle": SazamiToggle,
  "saz-image": SazamiImage,
  "saz-coverart": SazamiCoverart,
  "saz-icon": SazamiIcon,
  "saz-badge": SazamiBadge,
  "saz-tag": SazamiTag,
  "saz-divider": SazamiDivider,
  "saz-spacer": SazamiSpacer,
  "saz-section": SazamiSection,
  "saz-details": createGenericClass(),
  "saz-controls": createGenericClass(),
  "saz-modal": SazamiModal,
  "saz-select": SazamiSelect,
  "saz-tabs": SazamiTabs,
  "saz-slider": SazamiSlider,
  "saz-radio": SazamiRadio,
  "saz-switch": SazamiSwitch,
  "saz-toast": SazamiToast,
  "saz-avatar": SazamiAvatar,
  "saz-chip": SazamiChip,
  "saz-spinner": SazamiSpinner,
  "saz-progress": SazamiProgress,
  "saz-accordion": SazamiAccordion
};
function registerComponents() {
  if (typeof customElements === "undefined") return;
  Object.entries(COMPONENT_REGISTRY).forEach(([tag, cls]) => {
    if (!customElements.get(tag)) {
      customElements.define(tag, cls);
    }
  });
}
const SAZAMI_REGISTRY = {
  card: { tag: "saz-card" },
  text: { tag: "saz-text" },
  heading: { tag: "saz-heading" },
  label: { tag: "saz-label" },
  button: { tag: "saz-button" },
  "icon-btn": { tag: "saz-icon-button" },
  input: { tag: "saz-input" },
  checkbox: { tag: "saz-checkbox" },
  toggle: { tag: "saz-toggle" },
  image: { tag: "saz-image" },
  coverart: { tag: "saz-coverart" },
  icon: { tag: "saz-icon" },
  badge: { tag: "saz-badge" },
  tag: { tag: "saz-tag" },
  divider: { tag: "saz-divider" },
  spacer: { tag: "saz-spacer" },
  row: { tag: "saz-row" },
  column: { tag: "saz-column" },
  grid: { tag: "saz-grid" },
  stack: { tag: "saz-stack" },
  details: { tag: "saz-details" },
  controls: { tag: "saz-controls" },
  section: { tag: "saz-section" },
  div: { tag: "div" },
  span: { tag: "span" },
  option: { tag: "option" },
  tab: { tag: "tab" },
  panel: { tag: "panel" },
  modal: { tag: "saz-modal" },
  select: { tag: "saz-select" },
  tabs: { tag: "saz-tabs" },
  slider: { tag: "saz-slider" },
  radio: { tag: "saz-radio" },
  switch: { tag: "saz-switch" },
  toast: { tag: "saz-toast" },
  avatar: { tag: "saz-avatar" },
  chip: { tag: "saz-chip" },
  spinner: { tag: "saz-spinner" },
  progress: { tag: "saz-progress" },
  accordion: { tag: "saz-accordion" }
};
function getTag(name) {
  const entry = SAZAMI_REGISTRY[name];
  if (!entry) {
    if (typeof console !== "undefined") {
      console.warn(`[sazami] Unknown component "${name}", using saz-${name}`);
    }
    return `saz-${name}`;
  }
  return entry.tag;
}
const ICON_COMPONENTS = /* @__PURE__ */ new Set(["saz-icon", "saz-icon-button"]);
function transformAST(node) {
  if (node.type === "inline") {
    const tag = getTag(node.name);
    const props = parseModifiers(node.modifiers);
    if (ICON_COMPONENTS.has(tag) && node.value && !props.icon) {
      props.icon = node.value;
    }
    return {
      type: tag,
      props,
      children: [node.value]
    };
  }
  if (node.type === "element") {
    const children = [];
    for (const child of node.children) {
      const result = transformAST(child);
      if (Array.isArray(result)) {
        children.push(...result);
      } else {
        children.push(result);
      }
    }
    return {
      type: getTag(node.name),
      props: parseModifiers(node.modifiers),
      children
    };
  }
  if (node.type === "list") {
    const items = [];
    for (const item of node.items) {
      const result = transformAST(item);
      if (Array.isArray(result)) {
        items.push(...result);
      } else {
        items.push(result);
      }
    }
    return items;
  }
  throw new Error(`Unknown node type: ${node.type}`);
}
function render(vnode, parent) {
  if (typeof vnode === "string") {
    parent.appendChild(document.createTextNode(vnode));
    return;
  }
  const element = document.createElement(vnode.type);
  Object.entries(vnode.props).forEach(([key, value]) => {
    if (typeof value === "boolean" && value) {
      element.setAttribute(key, "");
    } else if (value !== void 0 && value !== null && value !== false) {
      element.setAttribute(key, String(value));
    }
  });
  vnode.children.forEach((child) => {
    if (Array.isArray(child)) {
      child.forEach((item) => render(item, element));
    } else {
      render(child, element);
    }
  });
  parent.appendChild(element);
}
function applyCurvomorphism(element, centerX, centerY, radiusValue = "12px") {
  const rect = element.getBoundingClientRect();
  const elCenterX = rect.left + rect.width / 2;
  const elCenterY = rect.top + rect.height / 2;
  const r = radiusValue;
  const s = "0px";
  const leftIn = elCenterX > centerX;
  const rightIn = elCenterX < centerX;
  const topIn = elCenterY > centerY;
  const bottomIn = elCenterY < centerY;
  element.style.borderTopLeftRadius = topIn && leftIn ? r : s;
  element.style.borderTopRightRadius = topIn && rightIn ? r : s;
  element.style.borderBottomLeftRadius = bottomIn && leftIn ? r : s;
  element.style.borderBottomRightRadius = bottomIn && rightIn ? r : s;
}
function findCenter(el) {
  let node = el.parentElement;
  while (node) {
    if (node.dataset.centerX && node.dataset.centerY) {
      return {
        x: parseFloat(node.dataset.centerX),
        y: parseFloat(node.dataset.centerY)
      };
    }
    node = node.parentElement;
  }
  return {
    x: typeof window !== "undefined" ? window.innerWidth / 2 : 0,
    y: typeof window !== "undefined" ? window.innerHeight / 2 : 0
  };
}
function enableCurvomorphism(element, options = {}) {
  const radiusType = options.radius || "medium";
  let radiusValue = "12px";
  if (typeof window !== "undefined" && window.getComputedStyle) {
    const v = window.getComputedStyle(document.documentElement).getPropertyValue(`--saz-radius-${radiusType}`);
    if (v && v.trim()) radiusValue = v.trim();
  }
  const apply = () => {
    const cx = options.centerX ?? findCenter(element).x;
    const cy = options.centerY ?? findCenter(element).y;
    applyCurvomorphism(element, cx, cy, radiusValue);
  };
  if (typeof window !== "undefined") {
    requestAnimationFrame(apply);
    window.addEventListener("resize", apply);
  }
  return () => {
    if (typeof window !== "undefined") {
      window.removeEventListener("resize", apply);
    }
  };
}
function tokenize(input) {
  const tokens = [];
  let i = 0;
  let line = 1;
  let col = 1;
  while (i < input.length) {
    const ch = input[i];
    if (ch === "\n") {
      i++;
      line++;
      col = 1;
      continue;
    }
    if (ch === "\r") {
      i++;
      if (input[i] === "\n") i++;
      line++;
      col = 1;
      continue;
    }
    if (ch === " " || ch === "	") {
      i++;
      col++;
      continue;
    }
    if (ch === "/" && i + 1 < input.length && input[i + 1] === "/") {
      while (i < input.length && input[i] !== "\n" && input[i] !== "\r") {
        i++;
      }
      continue;
    }
    const SYMBOLS = {
      "<": "LT",
      ">": "GT",
      "{": "LBRACE",
      "}": "RBRACE",
      "(": "LPAREN",
      ")": "RPAREN",
      "[": "LBRACKET",
      "]": "RBRACKET",
      ":": "COLON",
      ";": "SEMI",
      ",": "COMMA"
    };
    if (SYMBOLS[ch]) {
      tokens.push({ type: SYMBOLS[ch], value: ch, line, col });
      i++;
      col++;
      continue;
    }
    if (ch === '"') {
      const startCol = col;
      i++;
      col++;
      let str = "";
      while (i < input.length && input[i] !== '"') {
        if (input[i] === "\n") {
          line++;
          col = 1;
        } else {
          col++;
        }
        str += input[i];
        i++;
      }
      if (i >= input.length) {
        throw new Error(`Unterminated string at line ${line}, col ${startCol}`);
      }
      i++;
      col++;
      tokens.push({ type: "STRING", value: str, line, col: startCol });
      continue;
    }
    if (/[a-zA-Z0-9_\-]/.test(ch)) {
      const startCol = col;
      let ident = "";
      while (i < input.length && /[a-zA-Z0-9_\-]/.test(input[i])) {
        ident += input[i];
        i++;
        col++;
      }
      tokens.push({ type: "IDENT", value: ident, line, col: startCol });
      continue;
    }
    throw new Error(`Unexpected character: ${ch} at line ${line}, col ${col}`);
  }
  return tokens;
}
const KNOWN_KEYS = /* @__PURE__ */ new Set([
  "cols",
  "gap",
  "radius",
  "md:cols",
  "lg:cols",
  "placeholder",
  "type",
  "size",
  "variant",
  "layout",
  "src",
  "alt",
  "icon",
  "label",
  "value",
  "center-point"
]);
class Parser {
  constructor(tokens, source) {
    this.tokens = tokens;
    this.position = 0;
    this.source = source || "";
  }
  errorAt(msg, token) {
    if (!token || !this.source) return new Error(msg);
    const lines = this.source.split("\n");
    const lineText = lines[token.line - 1] || "";
    const pointer = " ".repeat(Math.max(0, token.col - 1)) + "^";
    return new Error(
      `${msg} at line ${token.line}, col ${token.col}
  ${lineText}
  ${pointer}`
    );
  }
  peek() {
    return this.tokens[this.position];
  }
  consume() {
    const token = this.tokens[this.position];
    if (!token) {
      const last = this.tokens[this.tokens.length - 1];
      throw this.errorAt("Unexpected end of input", last);
    }
    this.position++;
    return token;
  }
  check(type) {
    return this.peek()?.type === type;
  }
  expect(type, errorMsg) {
    const token = this.peek();
    if (!token || token.type !== type) {
      const msg = errorMsg || `Expected ${type} but got ${token?.type || "end of input"}`;
      throw this.errorAt(msg, token);
    }
    return this.consume();
  }
  parseRoot() {
    this.expect("LT", "Expected '<'");
    const nameToken = this.peek();
    if (!nameToken || nameToken.type !== "IDENT") {
      throw this.errorAt("Expected identifier after '<'", nameToken);
    }
    const name = this.consume().value;
    const modifiers = this.check("LPAREN") ? this.parseModifiers() : [];
    this.expect("LBRACE", "Expected '{'");
    const children = [];
    while (!this.check("RBRACE")) {
      if (!this.peek()) {
        throw this.errorAt(
          "Unexpected end of input, expected '}'",
          this.tokens[this.tokens.length - 1]
        );
      }
      children.push(this.parseNode());
      if (this.check("SEMI")) this.consume();
      if (this.check("COMMA")) this.consume();
    }
    this.expect("RBRACE", "Expected '}'");
    this.expect("GT", "Expected '>'");
    return { type: "root", name, modifiers, children };
  }
  parseNode() {
    const token = this.peek();
    if (!token || token.type !== "IDENT") {
      throw this.errorAt(
        `Expected identifier but got ${token?.type || "end of input"}`,
        token
      );
    }
    const name = this.consume().value;
    const modifiers = this.check("LPAREN") ? this.parseModifiers() : [];
    if (this.check("COLON")) {
      this.consume();
      if (this.check("LBRACKET")) {
        const list = this.parseList();
        return { type: "element", name, modifiers, children: [list] };
      }
      const valToken = this.peek();
      if (!valToken || valToken.type !== "IDENT" && valToken.type !== "STRING") {
        throw this.errorAt(
          `Expected value after ':' but got ${valToken?.type || "end of input"}`,
          valToken
        );
      }
      const value = this.consume().value;
      return { type: "inline", name, modifiers, value };
    }
    if (this.check("LBRACKET")) {
      const list = this.parseList();
      return { type: "element", name, modifiers, children: [list] };
    }
    if (this.check("LBRACE")) {
      this.consume();
      const children = [];
      while (!this.check("RBRACE")) {
        if (!this.peek()) {
          throw this.errorAt(
            "Unexpected end of input, expected '}'",
            this.tokens[this.tokens.length - 1]
          );
        }
        children.push(this.parseNode());
        if (this.check("SEMI")) this.consume();
        if (this.check("COMMA")) this.consume();
      }
      this.consume();
      return { type: "element", name, modifiers, children };
    }
    return { type: "inline", name, modifiers, value: "" };
  }
  parseModifiers() {
    this.consume();
    const modifiers = [];
    while (!this.check("RPAREN")) {
      if (!this.peek()) {
        throw this.errorAt(
          "Unexpected end of input, expected ')'",
          this.tokens[this.tokens.length - 1]
        );
      }
      const token = this.peek();
      if (!token || token.type !== "IDENT") {
        throw this.errorAt(
          `Expected identifier in modifiers but got ${token?.type || "end of input"}`,
          token
        );
      }
      this.consume();
      const next = this.peek();
      if (KNOWN_KEYS.has(token.value) && next && (next.type === "IDENT" || next.type === "STRING") && !this.check("RPAREN")) {
        modifiers.push({
          type: "pair",
          key: token.value,
          value: this.consume().value
        });
      } else {
        modifiers.push({ type: "flag", value: token.value });
      }
    }
    this.consume();
    return modifiers;
  }
  parseList() {
    this.consume();
    const items = [];
    while (!this.check("RBRACKET")) {
      if (!this.peek()) {
        throw this.errorAt(
          "Unexpected end of input, expected ']'",
          this.tokens[this.tokens.length - 1]
        );
      }
      items.push(this.parseNode());
      if (this.check("COMMA")) {
        this.consume();
      } else if (!this.check("RBRACKET")) {
        throw this.errorAt('Expected "," or "]"', this.peek());
      }
    }
    this.consume();
    return { type: "list", items };
  }
}
function parseSakko(input) {
  const tokens = tokenize(input);
  if (tokens.length === 0) {
    throw new Error("Empty input");
  }
  const parser = new Parser(tokens, input);
  return parser.parseRoot();
}
let themeInjected = false;
function injectThemeCSS(customTokens) {
  if (typeof document === "undefined") return;
  const existing = document.querySelector("style[data-sazami-theme]");
  const themeCSS = generateThemeCSS(customTokens);
  if (existing) {
    existing.textContent = themeCSS;
  } else {
    const style = document.createElement("style");
    style.setAttribute("data-sazami-theme", "");
    style.textContent = themeCSS;
    document.head.appendChild(style);
  }
  themeInjected = true;
}
function compileSakko(source, target, options) {
  if (typeof customElements !== "undefined") {
    registerComponents();
  }
  if (!themeInjected) {
    injectThemeCSS(options?.tokens);
  }
  const trimmed = source.trim();
  const wrapped = trimmed.startsWith("<") && trimmed.endsWith(">") ? trimmed : `<${trimmed}>`;
  const ast = parseSakko(wrapped);
  const rootVNode = {
    type: getTag(ast.name),
    props: ast.modifiers ? parseModifiers(ast.modifiers) : {},
    children: []
  };
  for (const child of ast.children) {
    const result = transformAST(child);
    if (Array.isArray(result)) {
      rootVNode.children.push(...result);
    } else {
      rootVNode.children.push(result);
    }
  }
  render(rootVNode, target);
  if (typeof window !== "undefined") {
    requestAnimationFrame(() => {
      target.querySelectorAll("[curved]").forEach((el) => {
        if (el instanceof HTMLElement) {
          enableCurvomorphism(el, {
            radius: el.getAttribute("radius") || void 0
          });
        }
      });
    });
  }
}
export {
  COMPONENT_REGISTRY,
  ICON_SVGS,
  MODIFIER_MAP,
  applyCurvomorphism,
  compileSakko,
  defaultTokens,
  enableCurvomorphism,
  generateCSSVariables,
  generateThemeCSS,
  getTokenValue,
  injectThemeCSS,
  parseModifiers,
  registerComponents,
  render,
  transformAST
};
//# sourceMappingURL=index.mjs.map
