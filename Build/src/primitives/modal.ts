import { baseStyles } from "./shared";

export class SazamiModal extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    const title = this.getAttribute("title") || "";
    const open = this.hasAttribute("open");

    this.shadowRoot!.innerHTML =
      baseStyles(`
:host {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  visibility: hidden;
  opacity: 0;
  transition: opacity 0.2s ease, visibility 0.2s ease;
}
:host([open]) {
  visibility: visible;
  opacity: 1;
}
.overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
}
.dialog {
  position: relative;
  background: var(--saz-color-background, #fff);
  border-radius: var(--saz-radius-medium, 12px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  max-width: 90vw;
  max-height: 90vh;
  overflow: auto;
  transform: scale(0.95);
  transition: transform 0.2s ease;
}
:host([open]) .dialog {
  transform: scale(1);
}
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--saz-space-large, 16px);
  border-bottom: 1px solid var(--saz-color-border, #e0e0e0);
}
.title {
  font-size: var(--saz-text-size-large, 18px);
  font-weight: 600;
  color: var(--saz-color-text, #1f2937);
  margin: 0;
}
.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: var(--saz-radius-soft, 4px);
  cursor: pointer;
  color: var(--saz-color-text-dim, #6b7280);
  transition: background 0.15s ease, color 0.15s ease;
}
.close-btn:hover {
  background: var(--saz-color-surface, #f3f4f6);
  color: var(--saz-color-text, #1f2937);
}
.close-btn svg {
  width: 20px;
  height: 20px;
}
.content {
  padding: var(--saz-space-large, 16px);
}
`) +
      `<div class="overlay"></div>
       <div class="dialog" role="dialog" aria-modal="true" aria-labelledby="modal-title">
         <div class="header">
           <h2 class="title" id="modal-title">${title}</h2>
           <button class="close-btn" aria-label="Close">
             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
           </button>
         </div>
         <div class="content"><slot></slot></div>
       </div>`;

    const closeBtn = this.shadowRoot!.querySelector(".close-btn");
    closeBtn?.addEventListener("click", () => this.close());

    const overlay = this.shadowRoot!.querySelector(".overlay");
    overlay?.addEventListener("click", () => this.close());

    this.addEventListener("keydown", (e: Event) => {
      const ke = e as KeyboardEvent;
      if (ke.key === "Escape" && this.hasAttribute("open")) {
        this.close();
      }
    });

    if (open) this.open();
  }

  open() {
    this.setAttribute("open", "");
    this.dispatchEvent(
      new CustomEvent("saz-open", { bubbles: true, composed: true }),
    );
  }

  close() {
    this.removeAttribute("open");
    this.dispatchEvent(
      new CustomEvent("saz-close", { bubbles: true, composed: true }),
    );
  }
}
