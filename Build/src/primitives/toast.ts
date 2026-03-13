import { baseStyles } from "./shared";
import { ICON_SVGS } from "../icons/index";

export class SazamiToast extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    const variant = this.getAttribute("variant") || "default";
    const message =
      this.getAttribute("message") || this.textContent?.trim() || "";
    const duration = parseInt(this.getAttribute("duration") || "3000");
    const showClose = !this.hasAttribute("no-close");

    const icon =
      variant === "success"
        ? ICON_SVGS.check
        : variant === "error" || variant === "danger"
          ? ICON_SVGS.close
          : variant === "warning"
            ? "⚠"
            : "ℹ";

    this.shadowRoot!.innerHTML =
      baseStyles(`
:host {
  position: fixed;
  bottom: var(--saz-space-large, 16px);
  right: var(--saz-space-large, 16px);
  z-index: 9998;
  display: flex;
  align-items: center;
  gap: var(--saz-space-small, 8px);
  padding: var(--saz-space-small, 8px) var(--saz-space-large, 16px);
  background: var(--saz-color-background, #fff);
  border-radius: var(--saz-radius-medium, 8px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(100px);
  opacity: 0;
  transition: transform 0.3s ease, opacity 0.3s ease;
  max-width: 320px;
}
:host([visible]) {
  transform: translateY(0);
  opacity: 1;
}
.icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}
:host([variant="success"]) .icon { color: var(--saz-color-success, #10b981); }
:host([variant="error"]) .icon { color: var(--saz-color-danger, #ef4444); }
:host([variant="warning"]) .icon { color: #f59e0b; }
:host([variant="info"]) .icon { color: var(--saz-color-primary, #2563eb); }

.message {
  flex: 1;
  font-size: var(--saz-text-size-medium, 14px);
  color: var(--saz-color-text, #1f2937);
}
.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--saz-color-text-dim, #6b7280);
  border-radius: var(--saz-radius-soft, 4px);
  transition: background 0.15s ease;
}
.close-btn:hover {
  background: var(--saz-color-surface, #f3f4f6);
}
.close-btn svg {
  width: 18px;
  height: 18px;
}
`) +
      `<span class="icon">${icon}</span>
       <span class="message">${message}</span>
       ${showClose ? `<button class="close-btn" aria-label="Close">${ICON_SVGS.close}</button>` : ""}`;

    if (showClose) {
      const closeBtn = this.shadowRoot!.querySelector(".close-btn");
      closeBtn?.addEventListener("click", () => this.hide());
    }

    requestAnimationFrame(() => {
      this.setAttribute("visible", "");
    });

    if (duration > 0) {
      setTimeout(() => this.hide(), duration);
    }
  }

  hide() {
    this.removeAttribute("visible");
    setTimeout(() => {
      this.dispatchEvent(
        new CustomEvent("saz-close", { bubbles: true, composed: true }),
      );
      this.remove();
    }, 300);
  }

  static show(message: string, variant = "info", duration = 3000) {
    const toast = document.createElement("saz-toast");
    toast.setAttribute("message", message);
    toast.setAttribute("variant", variant);
    toast.setAttribute("duration", duration.toString());
    document.body.appendChild(toast);
    return toast;
  }
}
