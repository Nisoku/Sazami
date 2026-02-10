import { VNode } from "./transformer";

export function render(vnode: VNode | string, parent: HTMLElement): void {
  if (typeof vnode === "string") {
    parent.appendChild(document.createTextNode(vnode));
    return;
  }

  const element = document.createElement(vnode.type);

  Object.entries(vnode.props).forEach(([key, value]) => {
    if (typeof value === "boolean" && value) {
      element.setAttribute(key, "");
    } else if (value !== undefined && value !== null && value !== false) {
      element.setAttribute(key, String(value));
    }
  });

  vnode.children.forEach((child) => {
    if (Array.isArray(child)) {
      (child as (VNode | string)[]).forEach((item) => render(item, element));
    } else {
      render(child, element);
    }
  });

  parent.appendChild(element);
}
