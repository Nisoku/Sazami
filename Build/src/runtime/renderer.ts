import { VNode } from "./transformer";
import { bindText, type Readable } from "@nisoku/sairin";

export function render(vnode: VNode | string | Readable<string>, parent: HTMLElement): void {
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

  Object.entries(vnode.props).forEach(([key, value]) => {
    if (key.startsWith("__")) return;
    if (isReadable(value)) {
      (element as any)[key] = value;
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
  return (
    v !== null &&
    typeof v === "object" &&
    "get" in v &&
    typeof (v as any).get === "function" &&
    "subscribe" in v &&
    typeof (v as any).subscribe === "function"
  );
}
