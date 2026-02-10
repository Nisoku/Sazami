import { ASTNode } from "../parser/parser";
import { parseModifiers } from "../primitives/modifier-map";

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
};

export function getTag(name: string): string {
  const entry = SAZAMI_REGISTRY[name];
  if (!entry) {
    if (typeof console !== "undefined") {
      console.warn(`[sazami] Unknown component "${name}", using saz-${name}`);
    }
    return `saz-${name}`;
  }
  return entry.tag;
}

const ICON_COMPONENTS = new Set(["saz-icon", "saz-icon-button"]);

export function transformAST(node: ASTNode): VNode | VNode[] {
  if (node.type === "inline") {
    const tag = getTag(node.name);
    const props = parseModifiers(node.modifiers);
    // For icon components, pass the value as an "icon" attribute
    // so connectedCallback can read it reliably.
    if (ICON_COMPONENTS.has(tag) && node.value && !props.icon) {
      props.icon = node.value;
    }
    return {
      type: tag,
      props,
      children: [node.value],
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
