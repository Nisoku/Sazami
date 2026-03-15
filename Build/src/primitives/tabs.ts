import { SazamiComponent, component } from "./base";

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

    this.mount(
      STYLES,
      `
      <div class="tabs" role="tablist">
        ${this._tabs.map((t, i) => `<button class="tab${i.toString() === activeTab ? " active" : ""}" role="tab" id="${t.tabId}" aria-selected="${i.toString() === activeTab}" aria-controls="${t.panelId}">${t.label}</button>`).join("")}
      </div>
      <div class="panels">
        ${panels
          .map((panel, i) => {
            const content = panel.innerHTML || `Panel ${i + 1}`;
            return `<div class="panel${i.toString() === activeTab ? " active" : ""}" role="tabpanel" id="panel-${i}" aria-labelledby="tab-${i}" style="display: ${i.toString() === activeTab ? "block" : "none"}">${content}</div>`;
          })
          .join("")}
      </div>
    `,
    );

    const tabButtons = this.shadow.querySelectorAll(".tab");
    const panelElements = this.shadow.querySelectorAll(".panel");

    // Keyboard support: Left/Right arrows to switch tabs
    tabButtons.forEach((btn, i) => {
      this.addHandler("click", () => this._activateTab(i), { internal: true, element: btn });
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
      this.addHandler("keydown", handleKeydown, { internal: true, element: btn });
    });
  }

  private _activateTab(index: number) {
    const tabButtons = this.shadow.querySelectorAll(".tab");
    const panelElements = this.shadow.querySelectorAll(".panel");
    tabButtons.forEach((b, j) => {
      b.classList.toggle("active", j === index);
      (b as HTMLElement).setAttribute(
        "aria-selected",
        j === index ? "true" : "false",
      );
    });
    panelElements.forEach((p, j) => {
      (p as HTMLElement).style.display = j === index ? "block" : "none";
    });
    this.active = index.toString();
    this.dispatchEventTyped("change", { activeIndex: index.toString() });
  }
}
