import { VNode } from "./transformer";
import { bindText, type Readable } from "@nisoku/sairin";

const CSS_LENGTH_PROPS = new Set([
  "top",
  "right",
  "bottom",
  "left",
  "inset",
  "margin",
  "margin-top",
  "margin-right",
  "margin-bottom",
  "margin-left",
  "padding",
  "padding-top",
  "padding-right",
  "padding-bottom",
  "padding-left",
  "width",
  "height",
  "min-width",
  "min-height",
  "max-width",
  "max-height",
  "font-size",
  "gap",
  "row-gap",
  "column-gap",
  "border-radius",
  "border-width",
  "border",
  "transform-origin",
  "perspective",
]);

const NUMERIC_RE = /^-?\d+(\.\d+)?$/;

function styleValue(key: string, val: string): string {
  if (CSS_LENGTH_PROPS.has(key) && NUMERIC_RE.test(val)) {
    return val + "px";
  }
  return val;
}

export function render(
  vnode: VNode | string | Readable<string>,
  parent: HTMLElement,
): void {
  if (typeof vnode === "string") {
    parent.appendChild(document.createTextNode(vnode));
    return;
  }

  if (isReadable(vnode)) {
    const textNode = document.createTextNode("");
    bindText(textNode, vnode);
    parent.appendChild(textNode);
    return;
  }

  const element = document.createElement(vnode.type);

  // Apply inline styles before other props
  if (vnode.props.__rawStyle) {
    element.style.cssText = vnode.props.__rawStyle as string;
  }
  if (vnode.props.__style) {
    for (const [key, val] of Object.entries(vnode.props.__style)) {
      (element.style as unknown as Record<string, string>)[key] = styleValue(
        key,
        String(val),
      );
    }
  }

  Object.entries(vnode.props).forEach(([key, value]) => {
    if (key.startsWith("__")) return;
    if (isReadable(value)) {
      (element as unknown as Record<string, unknown>)[key] = value;
    } else if (typeof value === "boolean" && value) {
      element.setAttribute(key, "");
    } else if (value !== undefined && value !== null && value !== false) {
      element.setAttribute(key, String(value));
    }
  });

  vnode.children.forEach((child) => {
    if (Array.isArray(child)) {
      (child as (VNode | string | Readable<string>)[]).forEach((item) =>
        render(item, element),
      );
    } else {
      render(child, element);
    }
  });

  parent.appendChild(element);

  if (vnode.afterRender) {
    vnode.afterRender(element);
  }
}

function isReadable(v: unknown): v is Readable<string> {
  if (v === null || typeof v !== "object") return false;
  const maybe = v as { get?: unknown; subscribe?: unknown };
  return (
    typeof maybe.get === "function" && typeof maybe.subscribe === "function"
  );
}
