import type { ASTNode, InterpolatedText } from "@nisoku/sakko";
import { parseModifiers } from "../primitives/modifier-map";
import type { Readable } from "@nisoku/sairin";
import { ReactiveContext } from "./reactive-context";

export type VNode = {
  type: string;
  props: Record<string, unknown>;
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

function serializeValue(value: string | InterpolatedText): string {
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
        const re = new RegExp(
          `\\b${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
        );
        return re.test(p.value);
      }),
  );
}

function isReadable(v: unknown): v is Readable<string> {
  if (v === null || typeof v !== "object") return false;
  const maybe = v as { get?: unknown; subscribe?: unknown };
  return (
    typeof maybe.get === "function" && typeof maybe.subscribe === "function"
  );
}

function renderVNode(
  vnode: VNode | string | Readable<string>,
  parent: HTMLElement,
): void {
  if (typeof vnode === "string") {
    parent.appendChild(document.createTextNode(vnode));
    return;
  }
  if (isReadable(vnode)) {
    const textNode = document.createTextNode("");
    parent.appendChild(textNode);
    const update = () => { textNode.textContent = vnode.get(); };
    update();
    vnode.subscribe(update);
    return;
  }
  const el = document.createElement(vnode.type);
  if (vnode.props.__rawStyle) {
    el.style.cssText = vnode.props.__rawStyle as string;
  }
  if (vnode.props.__style) {
    for (const [key, val] of Object.entries(vnode.props.__style)) {
      (el.style as unknown as Record<string, string>)[key] = String(val);
    }
  }
  for (const [key, value] of Object.entries(vnode.props)) {
    if (key.startsWith("__")) continue;
    if (typeof value === "boolean" && value) {
      el.setAttribute(key, "");
    } else if (value !== undefined && value !== null && value !== false) {
      el.setAttribute(key, String(value));
    }
  }
  for (const child of vnode.children) {
    if (Array.isArray(child)) {
      (child as (VNode | string | Readable<string>)[]).forEach((item) =>
        renderVNode(item, el),
      );
    } else {
      renderVNode(child, el);
    }
  }
  parent.appendChild(el);
  if (vnode.afterRender) {
    vnode.afterRender(el);
  }
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
      Array<{ event: string; handler: string }> | undefined;
    delete props.__events;

    const bindSignal = props.__bind as string | undefined;
    delete props.__bind;

    const ifSignal = props.__if as string | undefined;
    delete props.__if;

    let value: string | Readable<string> | undefined;

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

    if (ifSignal && context) {
      const sig = context.getSignal(ifSignal);
      if (sig) {
        afterRenderFns.push((el: HTMLElement) => {
          const update = () => {
            el.style.display = sig.get() ? "" : "none";
          };
          update();
          (el as unknown as Record<string, unknown>).__sazamiIfDisposer =
            sig.subscribe(update);
        });
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
    const props = parseModifiers(node.modifiers);
    const eachStr = props.__each as string | undefined;
    delete props.__each;

    if (eachStr) {
      const match = eachStr.match(/^(\w+)\s+in\s+(\w+)$/);
      if (!match) throw new Error(`Invalid @each syntax: "${eachStr}"`);
      const [, itemVar, sourceName] = match;

      const tag = getTag(node.name);
      const rawTemplate = node.children;

      return {
        type: tag,
        props,
        children: [],
        afterRender: (el) => {
          const sourceSig = context?.getSignal(sourceName);
          if (!sourceSig) return;

          let disposers: Array<() => void> = [];

          const renderList = () => {
            disposers.forEach((d) => d());
            disposers = [];
            el.innerHTML = "";

            const items = sourceSig.get();
            if (!Array.isArray(items)) return;

            for (const item of items) {
              const subCtx = context!.forkWithSignal(itemVar, item);
              for (const child of rawTemplate) {
                const result = transformAST(child, subCtx);
                if (Array.isArray(result)) {
                  result.forEach((v) => renderVNode(v, el));
                } else {
                  renderVNode(result, el);
                }
              }
            }
          };

          renderList();
          const unsub = sourceSig.subscribe(renderList);
          disposers.push(unsub);
        },
      };
    }

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

  throw new Error(`Unknown node type: ${(node as { type: string }).type}`);
}
