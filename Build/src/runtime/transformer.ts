import type { ASTNode } from "@nisoku/sakko";
import { parseModifiers } from "../primitives/modifier-map";
import { unknownComponentError } from "../errors";

export type VNode = {
  type: string;
  props: Record<string, any>;
  children: (VNode | string)[];
};

const SAZAMI_REGISTRY: Record<string, { tag: string }> = {
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
  accordion: { tag: "saz-accordion" },
};

export function getTag(name: string): string {
  const entry = SAZAMI_REGISTRY[name];
  if (!entry) {
    unknownComponentError(name);
    return `saz-${name}`;
  }
  return entry.tag;
}

const ICON_COMPONENTS = new Set(["saz-icon", "saz-icon-button"]);

function serializeValue(value: string | { type: "interpolated"; parts: Array<{ type: "text" | "expr"; value: string }> }): string {
  if (typeof value === "string") return value;
  return value.parts.map(p => p.value).join("");
}

export function transformAST(node: ASTNode): VNode | VNode[] {
  if (node.type === "inline") {
    const tag = getTag(node.name);
    const props = parseModifiers(node.modifiers);
    const value = typeof node.value === "string" ? node.value : serializeValue(node.value);
    // For icon components, pass the value as an "icon" attribute
    // so connectedCallback can read it reliably.
    if (ICON_COMPONENTS.has(tag) && node.value && !props.icon) {
      props.icon = node.value;
    }
    return {
      type: tag,
      props,
      children: [value],
    };
  }

  if (node.type === "element") {
    const children: (VNode | string)[] = [];
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
      children,
    };
  }

  if (node.type === "list") {
    const items: VNode[] = [];
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

  throw new Error(`Unknown node type: ${(node as any).type}`);
}
