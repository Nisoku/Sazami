import { SazamiComponent, component } from "./base";
import { escapeHtml } from "../escape";

const STYLES = `
:host { display: block; }
.tabs {
  display: flex;
  border-bottom: 1px solid var(--saz-color-border);
  gap: var(--saz-space-tiny);
}
.tab {
  padding: var(--saz-space-small) var(--saz-space-large);
  border: none;
  background: transparent;
  color: var(--saz-color-text-dim);
  font-size: var(--saz-text-size-medium);
  font-weight: 500;
  cursor: pointer;
  position: relative;
  transition: color 0.2s ease;
}
.tab::after {
  content: "";
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 2px;
  background: var(--saz-color-primary);
  transform: scaleX(0);
  transition: transform 0.25s ease;
}
.tab.active {
  color: var(--saz-color-primary);
}
.tab.active::after {
  transform: scaleX(1);
}
.tab:focus-visible {
  outline: 2px solid var(--saz-color-primary);
  outline-offset: -2px;
}
.panels {
  padding: var(--saz-space-large) 0;
  position: relative;
  overflow: hidden;
  min-height: 60px;
}
.panel {
  display: none;
  animation: slideIn 0.25s ease;
}
.panel.active {
  display: block;
}
@keyframes slideIn {
  from { opacity: 0; transform: translateX(12px); }
  to { opacity: 1; transform: translateX(0); }
}
`;

const tabsConfig = {
  properties: {
    active: { type: "string" as const, reflect: true },
  },
  events: {
    change: { name: "saz-change", detail: { activeIndex: "active" } },
  },
} as const;

@component(tabsConfig)
export class SazamiTabs extends SazamiComponent<typeof tabsConfig> {
  declare active: string;

  private _tabs: Array<{ label: string; panelId: string; tabId: string }> = [];
  private _panelElements: HTMLElement[] = [];
  private _handlersAdded = false;

  render() {
    this._tabs = Array.from(this.querySelectorAll(':scope > [slot="tab"]')).map(
      (tab, i) => ({
        label: tab.getAttribute("label") || tab.textContent || `Tab ${i + 1}`,
        panelId: `panel-${i}`,
        tabId: `tab-${i}`,
      }),
    );

    const panels = Array.from(this.querySelectorAll(':scope > [slot="panel"]'));
    const activeTab = this.getAttribute("active") || "0";

    if (this._panelElements.length === 0) {
      this._panelElements = panels.map((panel, i) => {
        const el = document.createElement("div");
        el.className = "panel";
        el.setAttribute("role", "tabpanel");
        el.id = `panel-${i}`;
        el.setAttribute("aria-labelledby", `tab-${i}`);
        while (panel.firstChild) {
          el.appendChild(panel.firstChild);
        }
        return el;
      });
    }

    this.mount(
      STYLES,
      `
      <div class="tabs" role="tablist">
        ${this._tabs.map((t, i) => `<button class="tab${i.toString() === activeTab ? " active" : ""}" role="tab" id="${t.tabId}" aria-selected="${i.toString() === activeTab}" aria-controls="${t.panelId}">${escapeHtml(t.label)}</button>`).join("")}
      </div>
      <div class="panels"></div>
    `,
    );

    const panelsContainer = this.shadow.querySelector(".panels") as HTMLElement;
    this._panelElements.forEach((el, i) => {
      el.classList.toggle("active", i.toString() === activeTab);
      el.style.display = i.toString() === activeTab ? "block" : "none";
      if (!panelsContainer.contains(el)) {
        panelsContainer.appendChild(el);
      }
    });

    const tabButtons = this.shadow.querySelectorAll(".tab");

    if (!this._handlersAdded) {
      this._handlersAdded = true;
      tabButtons.forEach((btn, i) => {
        this.addHandler("click", () => this._activateTab(i), {
          internal: true,
          element: btn as HTMLElement,
        });
        const handleKeydown: EventListener = (e) => {
          const ke = e as KeyboardEvent;
          if (ke.key === "ArrowRight") {
            ke.preventDefault();
            this._activateTab((i + 1) % this._tabs.length);
          } else if (ke.key === "ArrowLeft") {
            ke.preventDefault();
            this._activateTab((i - 1 + this._tabs.length) % this._tabs.length);
          }
        };
        this.addHandler("keydown", handleKeydown, {
          internal: true,
          element: btn as HTMLElement,
        });
      });
    }
  }

  private _activateTab(index: number, emit = true) {
    const tabButtons = this.shadow.querySelectorAll(".tab");
    tabButtons.forEach((b, j) => {
      b.classList.toggle("active", j === index);
      (b as HTMLElement).setAttribute(
        "aria-selected",
        j === index ? "true" : "false",
      );
    });
    this._panelElements.forEach((p, j) => {
      p.classList.toggle("active", j === index);
      p.style.display = j === index ? "block" : "none";
    });
    if (tabButtons[index]) {
      (tabButtons[index] as HTMLElement).focus();
    }
    if (this.active !== index.toString()) {
      this.active = index.toString();
    }
    if (emit) {
      this.dispatchEventTyped("change", { activeIndex: index.toString() });
    }
  }

  static get observedAttributes() {
    return ["active"];
  }

  attributeChangedCallback(
    name: string,
    oldVal: string | null,
    newVal: string | null,
  ) {
    if (
      name === "active" &&
      oldVal !== newVal &&
      this.shadow.childNodes.length
    ) {
      const parsedIndex = Number(newVal ?? 0);
      const tabCount = this._tabs.length;
      const validIndex = Math.max(0, Math.min(parsedIndex, tabCount - 1));
      this._activateTab(validIndex, false);
    }
  }
}
