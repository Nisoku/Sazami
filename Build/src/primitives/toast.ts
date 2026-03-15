import { SazamiComponent, component } from "./base";
import { INTERACTIVE_HOVER } from "./shared";
import { ICON_SVGS } from "../icons/index";

const STYLES = `
:host {
  position: fixed;
  bottom: var(--saz-space-large);
  right: var(--saz-space-large);
  z-index: 9998;
  display: flex;
  align-items: center;
  gap: var(--saz-space-small);
  padding: var(--saz-space-small) var(--saz-space-large);
  background: var(--saz-color-background);
  border-radius: var(--saz-radius-medium);
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
:host([variant="success"]) .icon { color: var(--saz-color-success); }
:host([variant="error"]) .icon { color: var(--saz-color-danger); }
:host([variant="danger"]) .icon { color: var(--saz-color-danger); }
:host([variant="warning"]) .icon { color: #f59e0b; }
:host([variant="info"]) .icon { color: var(--saz-color-primary); }

.message {
  flex: 1;
  font-size: var(--saz-text-size-medium);
  color: var(--saz-color-text);
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
  color: var(--saz-color-text-dim);
  border-radius: var(--saz-radius-soft);
  transition: background 0.15s ease;
}
${INTERACTIVE_HOVER}
.close-btn svg {
  width: 18px;
  height: 18px;
}
`;

const toastConfig = {
  properties: {
    message: { type: "string" as const, reflect: false },
    variant: { type: "string" as const, reflect: false },
    duration: { type: "number" as const, reflect: false, default: 3000 },
    visible: { type: "boolean" as const, reflect: false },
  },
  events: {
    close: { name: "saz-close", detail: {} },
  },
} as const;

@component(toastConfig)
export class SazamiToast extends SazamiComponent<typeof toastConfig> {
  declare message: string;
  declare variant: string;
  declare duration: number;
  declare visible: boolean;

  private _hideTimeout?: ReturnType<typeof setTimeout>;
  private _closeHandler = () => this.hide();
  private _handleKeydown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      this.hide();
    }
  };

  disconnectedCallback() {
    if (this._hideTimeout) {
      clearTimeout(this._hideTimeout);
    }
    super.disconnectedCallback();
  }

  render() {
    const variant = this.getAttribute("variant") || "default";
    const message =
      this.getAttribute("message") || this.textContent?.trim() || "";
    const rawDuration = this.getAttribute("duration");
    let duration = 3000;
    if (rawDuration !== null && rawDuration !== "") {
      const parsed = parseInt(rawDuration, 10);
      if (!Number.isNaN(parsed)) {
        duration = parsed;
      }
    }
    const showClose = !this.hasAttribute("no-close");

    const icon =
      variant === "success"
        ? ICON_SVGS.check
        : variant === "error" || variant === "danger"
          ? ICON_SVGS.close
          : variant === "warning"
            ? "⚠"
            : "ℹ";

    const urgent = variant === "error" || variant === "danger";
    if (!this.hasAttribute("role")) {
      this.setAttribute("role", urgent ? "alert" : "status");
    }
    if (!this.hasAttribute("aria-live")) {
      this.setAttribute("aria-live", urgent ? "assertive" : "polite");
    }
    this.setAttribute("aria-atomic", "true");

    const messageEl = `<span class="message"></span>`;
    const closeBtnEl = showClose
      ? `<button class="close-btn" aria-label="Close">${ICON_SVGS.close}</button>`
      : "";

    this.mount(
      STYLES,
      `
      <span class="icon">${icon}</span>
      ${messageEl}
      ${closeBtnEl}
    `,
    );

    const messageSpan = this.$(".message");
    if (messageSpan) {
      messageSpan.textContent = message;
    }

    if (showClose) {
      const closeBtn = this.$(".close-btn");
      this.removeHandler("click", this._closeHandler);
      this.addHandler("click", this._closeHandler, {
        internal: true,
        element: closeBtn as HTMLElement,
      });
    }

    // Keyboard support: Escape to dismiss
    this.removeHandler("keydown", this._handleKeydown);
    this.addHandler("keydown", this._handleKeydown, { internal: true });

    if (!this.hasAttribute("visible")) {
      this.setAttribute("visible", "");
    }

    if (duration > 0) {
      if (this._hideTimeout) clearTimeout(this._hideTimeout);
      this._hideTimeout = setTimeout(() => this.hide(), duration);
    }
  }

  hide() {
    if (this._hideTimeout) {
      clearTimeout(this._hideTimeout);
      this._hideTimeout = undefined;
    }
    this.removeAttribute("visible");
    setTimeout(() => {
      this.dispatchEventTyped("close", {});
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
