import { SazamiComponent, component } from "./base";
import { INTERACTIVE_HOVER } from "./shared";
import { ICON_SVGS } from "../icons/index";
import { escapeHtml } from "../escape";

const STYLES = `
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
  background: var(--saz-color-background);
  border-radius: var(--saz-radius-medium);
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
  padding: var(--saz-space-large);
  border-bottom: 1px solid var(--saz-color-border);
}
.title {
  font-size: var(--saz-text-size-large);
  font-weight: 600;
  color: var(--saz-color-text);
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
  border-radius: var(--saz-radius-soft);
  cursor: pointer;
  color: var(--saz-color-text-dim);
  transition: background 0.15s ease, color 0.15s ease;
}
${INTERACTIVE_HOVER}
.close-btn svg {
  width: 20px;
  height: 20px;
}
.content {
  padding: var(--saz-space-large);
}
`;

const modalConfig = {
  properties: {
    title: { type: "string" as const, reflect: false },
    open: { type: "boolean" as const, reflect: true },
  },
  events: {
    open: { name: "saz-open", detail: {} },
    close: { name: "saz-close", detail: {} },
  },
} as const;

@component(modalConfig)
export class SazamiModal extends SazamiComponent<typeof modalConfig> {
  declare title: string;
  declare open: boolean;

  render() {
    const title = escapeHtml(this.getAttribute("title") || "");

    this.mount(
      STYLES,
      `
      <div class="overlay"></div>
      <div class="dialog" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div class="header">
          <h2 class="title" id="modal-title">${title}</h2>
          <button class="close-btn" aria-label="Close">
            ${ICON_SVGS.close || "×"}
          </button>
        </div>
        <div class="content"><slot></slot></div>
      </div>
    `,
    );

    const closeBtn = this.$(".close-btn");
    this.addHandler("click", () => this._close(), { internal: true, element: closeBtn as HTMLElement });

    const overlay = this.$(".overlay");
    this.addHandler("click", () => this._close(), { internal: true, element: overlay as HTMLElement });

    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && this.hasAttribute("open")) {
        this._close();
      }
    };
    document.addEventListener("keydown", handleKeydown);
    this.onCleanup(() => document.removeEventListener("keydown", handleKeydown));
  }

  private _open() {
    this.setAttribute("open", "");
  }

  private _close() {
    this.removeAttribute("open");
  }

  attributeChangedCallback(name: string, oldVal: string | null, newVal: string | null) {
    if (oldVal === newVal) return;
    if (name === "open") {
      if (newVal !== null) {
        this.dispatchEventTyped("open", {});
      } else {
        this.dispatchEventTyped("close", {});
      }
    }
  }
}
