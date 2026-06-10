import type { ASTNode, InterpolatedText } from "@nisoku/sakko";
import { parseModifiers } from "../primitives/modifier-map";
import { unknownComponentError } from "../errors";
import type { Readable } from "@nisoku/sairin";
import { ReactiveContext } from "./reactive-context";

export type VNode = {
  type: string;
  props: Record<string, any>;
  children: (VNode | string | Readable<string>)[];
  afterRender?: (el: HTMLElement) => void;
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
const CONTENT_SLOT_COMPONENTS = new Set([
  "saz-heading",
  "saz-badge",
  "saz-tag",
  "saz-text",
  "saz-label",
]);

function serializeValue(
  value:
    | string
    | InterpolatedText,
): string {
  if (typeof value === "string") return value;
  return value.parts.map((p) => p.value).join("");
}

function hasReactiveExpr(
  value: string | InterpolatedText,
  context: ReactiveContext | undefined,
): boolean {
  if (!context || typeof value === "string") return false;
  const signalNames = context.getAllSignalNames();
  if (signalNames.length === 0) return false;
  return value.parts.some(
    (p) =>
      p.type === "expr" &&
      signalNames.some((name) => {
        const re = new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`);
        return re.test(p.value);
      }),
  );
}

export function transformAST(
  node: ASTNode,
  context?: ReactiveContext,
): VNode | VNode[] {
  if (node.type === "inline") {
    const tag = getTag(node.name);
    const props = parseModifiers(node.modifiers);
    const afterRenderFns: Array<(el: HTMLElement) => void> = [];

    const events = props.__events as
      | Array<{ event: string; handler: string }>
      | undefined;
    delete props.__events;

    const bindSignal = props.__bind as string | undefined;
    delete props.__bind;

    let value:
      | string
      | Readable<string>
      | undefined;

    if (node.value) {
      if (typeof node.value === "string") {
        value = node.value;
      } else if (hasReactiveExpr(node.value, context)) {
        value = context!.createInterpolated(node.value.parts);
      } else {
        value = serializeValue(node.value);
      }
    }

    if (events && context) {
      for (const evt of events) {
        const handler = context.createEventHandler(evt.handler);
        afterRenderFns.push((el: HTMLElement) => {
          el.addEventListener(evt.event, handler);
        });
      }
    }

    if (bindSignal && context) {
      const bindFn = context.createBindHandler(bindSignal, node.name);
      if (bindFn) {
        afterRenderFns.push(bindFn);
      }
    }

    if (ICON_COMPONENTS.has(tag) && value && !props.icon) {
      props.icon = value;
    }
    if (CONTENT_SLOT_COMPONENTS.has(tag) && value && !props.content) {
      props.content = value;
    }

    const vnode: VNode = {
      type: tag,
      props,
      children: CONTENT_SLOT_COMPONENTS.has(tag)
        ? []
        : value !== undefined && value !== ""
          ? [value]
          : [],
    };

    if (afterRenderFns.length > 0) {
      vnode.afterRender = (el: HTMLElement) => {
        afterRenderFns.forEach((fn) => fn(el));
      };
    }

    return vnode;
  }

  if (node.type === "element") {
    const children: (VNode | string | Readable<string>)[] = [];
    for (const child of node.children) {
      const result = transformAST(child, context);
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
      const result = transformAST(item, context);
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
