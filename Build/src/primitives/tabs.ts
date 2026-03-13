import { baseStyles } from "./shared";

export class SazamiTabs extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    const tabs = Array.from(this.querySelectorAll(":scope > [slot='tab']")).map(
      (tab, i) => ({
        label: tab.getAttribute("label") || tab.textContent || `Tab ${i + 1}`,
        panelId: `panel-${i}`,
        tabId: `tab-${i}`,
      }),
    );

    const panels = Array.from(this.querySelectorAll(":scope > [slot='panel']"));
    const activeTab = this.getAttribute("active") || "0";

    this.shadowRoot!.innerHTML =
      baseStyles(`
:host { display: block; }
.tabs {
  display: flex;
  border-bottom: 1px solid var(--saz-color-border, #e0e0e0);
  gap: var(--saz-space-tiny, 4px);
}
.tab {
  padding: var(--saz-space-small, 8px) var(--saz-space-large, 16px);
  border: none;
  background: transparent;
  color: var(--saz-color-text-dim, #6b7280);
  font-size: var(--saz-text-size-medium, 14px);
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
  background: var(--saz-color-primary, #2563eb);
  transform: scaleX(0);
  transition: transform 0.25s ease;
}
.tab.active,
.tab[active] {
  color: var(--saz-color-primary, #2563eb);
}
.tab.active::after,
.tab[active]::after {
  transform: scaleX(1);
}
.tab:focus-visible {
  outline: 2px solid var(--saz-color-primary, #2563eb);
  outline-offset: -2px;
}
.panels {
  padding: var(--saz-space-large, 16px) 0;
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
.panel {
  display: none;
  animation: slideIn 0.25s ease;
}
.panel.active {
  display: block;
}
@keyframes slideIn {
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
}
`) +
      `<div class="tabs" role="tablist">
         ${tabs.map((t, i) => `<button class="tab${i.toString() === activeTab ? " active" : ""}" role="tab" id="${t.tabId}" aria-selected="${i.toString() === activeTab}" aria-controls="${t.panelId}">${t.label}</button>`).join("")}
       </div>
        <div class="panels">
          ${panels.map((panel, i) => {
              const content = panel.innerHTML || `Panel ${i + 1}`;
              return `<div class="panel${i.toString() === activeTab ? " active" : ""}" role="tabpanel" id="panel-${i}" aria-labelledby="tab-${i}" style="display: ${i.toString() === activeTab ? "block" : "none"}">${content}</div>`;
            })
            .join("")}
        </div>`;

    const tabButtons = this.shadowRoot!.querySelectorAll(".tab");
    const panelElements = this.shadowRoot!.querySelectorAll(".panel");

    tabButtons.forEach((btn, i) => {
      btn.addEventListener("click", () => {
        tabButtons.forEach((b, j) => {
          b.classList.toggle("active", j === i);
          b.setAttribute("aria-selected", j === i ? "true" : "false");
        });
        panelElements.forEach((p, j) => {
          (p as HTMLElement).style.display = j === i ? "block" : "none";
        });
        this.setAttribute("active", i.toString());
        this.dispatchEvent(
          new CustomEvent("saz-change", {
            detail: { activeIndex: i },
            bubbles: true,
            composed: true,
          }),
        );
      });
    });
  }
}
