import { baseStyles } from "./shared";
import { ICON_SVGS } from "../icons/index";

export class SazamiAccordion extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    const items = Array.from(this.querySelectorAll(":scope > *")).map(
      (el, i) => ({
        title:
          (el as HTMLElement).getAttribute("heading") || `Section ${i + 1}`,
        content: el.innerHTML,
        open: el.hasAttribute("open"),
      }),
    );

    this.shadowRoot!.innerHTML =
      baseStyles(`
:host { display: block; }
.item {
  border-bottom: 1px solid var(--saz-color-border, #e0e0e0);
}
.item:first-child { border-top: 1px solid var(--saz-color-border, #e0e0e0); }
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--saz-space-medium, 12px) var(--saz-space-small, 8px);
  cursor: pointer;
  background: transparent;
  border: none;
  width: 100%;
  text-align: left;
  font-size: inherit;
  font-family: inherit;
  color: var(--saz-color-text, #1f2937);
  transition: background 0.15s ease;
}
.header:hover {
  background: var(--saz-color-surface, #f8f9fa);
}
.header:focus-visible {
  outline: 2px solid var(--saz-color-primary, #2563eb);
  outline-offset: -2px;
}
.title {
  font-weight: 500;
  font-size: var(--saz-text-size-medium, 14px);
}
.chevron {
  width: 20px;
  height: 20px;
  color: var(--saz-color-text-dim, #6b7280);
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
  padding: 0 var(--saz-space-small, 8px);
}
.item[open] .content {
  max-height: 500px;
  padding-bottom: var(--saz-space-medium, 12px);
}
.inner-content {
  font-size: var(--saz-text-size-medium, 14px);
  color: var(--saz-color-text-dim, #6b7280);
  line-height: 1.5;
}
`) +
      items
        .map(
          (item, i) => `
        <div class="item" ${item.open ? "open" : ""}>
          <button class="header" aria-expanded="${item.open}" aria-controls="accordion-content-${i}">
            <span class="title">${item.title}</span>
            <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
          </button>
          <div class="content" id="accordion-content-${i}">
            <div class="inner-content">${item.content}</div>
          </div>
        </div>
      `,
        )
        .join("");

    const headers = this.shadowRoot!.querySelectorAll(".header");
    headers.forEach((header, i) => {
      header.addEventListener("click", () => {
        const item = header.parentElement;
        const isOpen = item?.hasAttribute("open");

        if (this.hasAttribute("single-open")) {
          this.shadowRoot!.querySelectorAll(".item").forEach((el) =>
            el.removeAttribute("open"),
          );
          headers.forEach((h) => h.setAttribute("aria-expanded", "false"));
        }

        if (isOpen) {
          item?.removeAttribute("open");
          header.setAttribute("aria-expanded", "false");
        } else {
          item?.setAttribute("open", "");
          header.setAttribute("aria-expanded", "true");
        }

        this.dispatchEvent(
          new CustomEvent("saz-change", {
            detail: { index: i, open: !isOpen },
            bubbles: true,
            composed: true,
          }),
        );
      });
    });
  }
}
