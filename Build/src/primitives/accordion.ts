import { SazamiComponent, component } from "./base";
import { ICON_SVGS } from "../icons/index";
import { escapeHtml } from "../escape";

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

  render() {
    const items = Array.from(this.querySelectorAll(":scope > *")).map(
      (el, i) => ({
        title:
          (el as HTMLElement).getAttribute("heading") || `Section ${i + 1}`,
        content: el.innerHTML,
        open: el.hasAttribute("open"),
      }),
    );

    this.mount(
      STYLES,
      items
        .map(
          (item, i) => `
        <div class="item" ${item.open ? "open" : ""}>
          <button class="header" aria-expanded="${item.open}" aria-controls="accordion-content-${i}">
            <span class="title">${escapeHtml(item.title)}</span>
            <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
          </button>
          <div class="content" id="accordion-content-${i}">
            <div class="inner-content">${item.content}</div>
          </div>
        </div>
      `,
        )
        .join(""),
    );

    const headers = this.shadow.querySelectorAll(".header");
    headers.forEach((header, i) => {
      const handleClick = () => {
        const item = header.parentElement;
        const isOpen = item?.hasAttribute("open");

        if (this.hasAttribute("single-open")) {
          this.shadow.querySelectorAll(".item").forEach((el) => {
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
        element: header,
      });
    });
  }
}
