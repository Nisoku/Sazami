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
  "center-point": { "center-point": true },
  vertical: { vertical: true },
  wrap: { wrap: true }
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
const ICON_SVGS = {
  play: '<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="8,5 19,12 8,19"/></svg>',
  pause: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>',
  stop: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="12" height="14" rx="1"/></svg>',
  previous: '<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="16,5 16,19 7,12"/><rect x="5" y="5" width="2" height="14"/></svg>',
  next: '<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="8,5 8,19 17,12"/><rect x="17" y="5" width="2" height="14"/></svg>',
  skip: '<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="6,5 6,19 13,12"/><polygon points="13,5 13,19 20,12"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="21" y2="21"/></svg>',
  settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>',
  heart: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>',
  star: '<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
  minus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>',
  edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
  share: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>',
  download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
  upload: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>',
  refresh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>',
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
  back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>',
  forward: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>',
  up: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>',
  down: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>',
  warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
  info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
  user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>',
  mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22 6 12 13 2 6"/></svg>',
  calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>',
  copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>',
  eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
  "eye-off": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>',
  filter: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>',
  link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>'
};
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
  width: var(--saz-icon-size-medium, 20px);
  height: var(--saz-icon-size-medium, 20px);
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
:host([size="small"]) {
  width: var(--saz-icon-size-small, 16px);
  height: var(--saz-icon-size-small, 16px);
  padding: var(--saz-space-tiny, 4px);
}
:host([size="large"]) {
  width: var(--saz-icon-size-large, 24px);
  height: var(--saz-icon-size-large, 24px);
  padding: var(--saz-space-medium, 12px);
}
:host([variant="accent"]) { color: var(--saz-color-accent, #ff4d8a); }
:host([variant="primary"]) { color: var(--saz-color-primary, #2563eb); }
:host([variant="dim"]) { color: var(--saz-color-text-dim, #6b7280); }
:host([disabled]) { opacity: 0.5; cursor: not-allowed; pointer-events: none; }
:host(:focus-visible) {
  outline: 2px solid var(--saz-color-primary, #2563eb);
  outline-offset: 2px;
}
svg { width: 100%; height: 100%; pointer-events: none; }
.glyph { pointer-events: none; }
`) + (svg || `<span class="glyph">${icon}</span>`);
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
  "saz-controls": createGenericClass()
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
  section: { tag: "saz-section" }
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
  Parser,
  applyCurvomorphism,
  compileSakko,
  defaultTokens,
  enableCurvomorphism,
  generateCSSVariables,
  generateThemeCSS,
  getTokenValue,
  injectThemeCSS,
  parseModifiers,
  parseSakko,
  registerComponents,
  render,
  tokenize,
  transformAST
};
//# sourceMappingURL=index.mjs.map
