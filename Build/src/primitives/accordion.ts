import { SazamiComponent, component } from "./base";
import { ICON_SVGS } from "../icons/index";

const STYLES = `
:host { display: block; }
.item {
  border-bottom: 1px solid var(--saz-color-border);
}
.item:first-child { border-top: 1px solid var(--saz-color-border); }
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--saz-space-medium) var(--saz-space-small);
  cursor: pointer;
  background: transparent;
  border: none;
  width: 100%;
  text-align: left;
  font-size: inherit;
  font-family: inherit;
  color: var(--saz-color-text);
  transition: background 0.15s ease;
}
.header:hover {
  background: var(--saz-color-surface);
}
.header:focus-visible {
  outline: 2px solid var(--saz-color-primary);
  outline-offset: -2px;
}
.title {
  font-weight: 500;
  font-size: var(--saz-text-size-medium);
}
.chevron {
  width: 20px;
  height: 20px;
  color: var(--saz-color-text-dim);
  transition: transform 0.2s ease;
  flex-shrink: 0;
}
.chevron svg {
  width: 100%;
  height: 100%;
  fill: none;
  stroke: currentColor;
}
.item[open] .chevron {
  transform: rotate(180deg);
}
.content {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease, padding 0.3s ease;
  padding: 0 var(--saz-space-small);
}
.item[open] .content {
  max-height: 500px;
  padding-bottom: var(--saz-space-medium);
}
.inner-content {
  font-size: var(--saz-text-size-medium);
  color: var(--saz-color-text-dim);
  line-height: 1.5;
}
`;

const accordionConfig = {
  properties: {
    "single-open": { type: "boolean" as const, reflect: false },
    index: { type: "string" as const, reflect: false },
    open: { type: "boolean" as const, reflect: false },
  },
  events: {
    change: { name: "saz-change", detail: { index: "index", open: "open" } },
  },
} as const;

@component(accordionConfig)
export class SazamiAccordion extends SazamiComponent<typeof accordionConfig> {
  declare "single-open": boolean;
  declare index: string;
  declare open: boolean;

  private _itemElements: HTMLElement[] = [];
  private _handlersAdded = false;

  render() {
    const items = Array.from(this.querySelectorAll(":scope > *")).map(
      (el, i) => ({
        title:
          (el as HTMLElement).getAttribute("heading") || `Section ${i + 1}`,
        element: el as HTMLElement,
        open: el.hasAttribute("open"),
      }),
    );

    if (this._itemElements.length === 0) {
      this._itemElements = items.map((item, i) => {
        const wrapper = document.createElement("div");
        wrapper.className = "item";
        if (item.open) wrapper.setAttribute("open", "");

        const header = document.createElement("button");
        header.className = "header";
        header.setAttribute("aria-expanded", String(item.open));
        header.id = `accordion-header-${i}`;

        const titleSpan = document.createElement("span");
        titleSpan.className = "title";
        titleSpan.textContent = item.title;

        const chevron = document.createElement("div");
        chevron.className = "chevron";
        chevron.innerHTML = ICON_SVGS["chevron-down"] || "";

        header.appendChild(titleSpan);
        header.appendChild(chevron);

        const content = document.createElement("div");
        content.className = "content";
        content.id = `accordion-content-${i}`;

        const innerContent = document.createElement("div");
        innerContent.className = "inner-content";
        while (item.element.firstChild) {
          innerContent.appendChild(item.element.firstChild);
        }
        content.appendChild(innerContent);

        wrapper.appendChild(header);
        wrapper.appendChild(content);

        return wrapper;
      });
    }

    this.mount(STYLES, "");

    const container = document.createElement("div");
    container.className = "accordion-container";
    this._itemElements.forEach((wrapper, i) => {
      if (!container.contains(wrapper)) {
        container.appendChild(wrapper);
      }
      const header = wrapper.querySelector(".header") as HTMLElement;
      const isOpen = wrapper.hasAttribute("open");
      header.setAttribute("aria-expanded", String(isOpen));
      header.setAttribute("aria-controls", `accordion-content-${i}`);
    });
    this.shadow.appendChild(container);

    if (!this._handlersAdded) {
      this._handlersAdded = true;
      const headers = this.shadow.querySelectorAll(".header");
      headers.forEach((header, i) => {
        const handleClick = () => {
          const item = header.parentElement;
          const isOpen = item?.hasAttribute("open");

          if (this.hasAttribute("single-open")) {
            this._itemElements.forEach((el) => {
              el.removeAttribute("open");
            });
            headers.forEach((h) => {
              (h as HTMLElement).setAttribute("aria-expanded", "false");
            });
          }

          if (isOpen) {
            item?.removeAttribute("open");
            (header as HTMLElement).setAttribute("aria-expanded", "false");
          } else {
            item?.setAttribute("open", "");
            (header as HTMLElement).setAttribute("aria-expanded", "true");
          }

          this.dispatchEventTyped("change", {
            index: i.toString(),
            open: !isOpen,
          });
        };
        this.addHandler("click", handleClick, {
          internal: true,
          element: header as HTMLElement,
        });
      });
    }
  }
}
