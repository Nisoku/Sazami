/**
 * @jest-environment jsdom
 */
import { registerComponents, COMPONENT_REGISTRY } from "../src/primitives/registry";
import { generateThemeCSS } from "../src/config/generator";

describe("Primitive Components - Behavior", () => {
  beforeAll(() => {
    // Apply CSS variables to document for tests
    const style = document.createElement("style");
    style.textContent = generateThemeCSS();
    document.head.appendChild(style);
    
    registerComponents();
  });

  describe("saz-card", () => {
    test("renders with Shadow DOM and slot", () => {
      const el = document.createElement("saz-card");
      document.body.appendChild(el);
      expect(el.shadowRoot).toBeTruthy();
      expect(el.shadowRoot!.querySelector("slot")).toBeTruthy();
      el.remove();
    });

    test("supports layout=row attribute", () => {
      const el = document.createElement("saz-card");
      el.setAttribute("layout", "row");
      document.body.appendChild(el);
      const style = el.shadowRoot!.querySelector("style");
      expect(style?.textContent).toContain('layout="row"');
      el.remove();
    });

    test("supports variant attribute styles", () => {
      const el = document.createElement("saz-card");
      el.setAttribute("variant", "accent");
      document.body.appendChild(el);
      const style = el.shadowRoot!.querySelector("style");
      expect(style?.textContent).toContain('variant="accent"');
      el.remove();
    });
  });

  describe("saz-button", () => {
    test("renders with Shadow DOM", () => {
      const el = document.createElement("saz-button");
      document.body.appendChild(el);
      expect(el.shadowRoot).toBeTruthy();
      el.remove();
    });

    test("has cursor pointer style", () => {
      const el = document.createElement("saz-button");
      document.body.appendChild(el);
      const style = el.shadowRoot!.querySelector("style");
      expect(style?.textContent).toContain("cursor: pointer");
      el.remove();
    });

    test("has disabled styles", () => {
      const el = document.createElement("saz-button");
      el.setAttribute("disabled", "");
      document.body.appendChild(el);
      const style = el.shadowRoot!.querySelector("style");
      expect(style?.textContent).toContain("pointer-events: none");
      el.remove();
    });

    test("supports all variant types in stylesheet", () => {
      const el = document.createElement("saz-button");
      document.body.appendChild(el);
      const style = el.shadowRoot!.querySelector("style")?.textContent || "";
      for (const v of ["accent", "primary", "secondary", "danger", "success", "dim"]) {
        expect(style).toContain(`variant="${v}"`);
      }
      el.remove();
    });

    test("supports size variants in stylesheet", () => {
      const el = document.createElement("saz-button");
      document.body.appendChild(el);
      const style = el.shadowRoot!.querySelector("style")?.textContent || "";
      expect(style).toContain('size="small"');
      expect(style).toContain('size="large"');
      el.remove();
    });

    test("supports shape variants in stylesheet", () => {
      const el = document.createElement("saz-button");
      document.body.appendChild(el);
      const style = el.shadowRoot!.querySelector("style")?.textContent || "";
      expect(style).toContain('shape="pill"');
      expect(style).toContain('shape="round"');
      expect(style).toContain('shape="square"');
      el.remove();
    });

    test("supports loading state in stylesheet", () => {
      const el = document.createElement("saz-button");
      document.body.appendChild(el);
      const style = el.shadowRoot!.querySelector("style")?.textContent || "";
      expect(style).toContain("[loading]");
      el.remove();
    });
  });

  describe("saz-input", () => {
    test("renders real input element in Shadow DOM", () => {
      const el = document.createElement("saz-input");
      document.body.appendChild(el);
      const input = el.shadowRoot!.querySelector("input");
      expect(input).toBeTruthy();
      expect(input?.tagName).toBe("INPUT");
      el.remove();
    });

    test("sets placeholder attribute", () => {
      const el = document.createElement("saz-input");
      el.setAttribute("placeholder", "Type here");
      document.body.appendChild(el);
      const input = el.shadowRoot!.querySelector("input");
      expect(input?.getAttribute("placeholder")).toBe("Type here");
      el.remove();
    });

    test("sets type attribute", () => {
      const el = document.createElement("saz-input");
      el.setAttribute("type", "password");
      document.body.appendChild(el);
      const input = el.shadowRoot!.querySelector("input");
      expect(input?.getAttribute("type")).toBe("password");
      el.remove();
    });

    test("dispatches saz-input event on input", () => {
      const el = document.createElement("saz-input");
      document.body.appendChild(el);
      const input = el.shadowRoot!.querySelector("input")!;

      let eventValue: string | null = null;
      el.addEventListener("saz-input", ((e: CustomEvent) => {
        eventValue = e.detail.value;
      }) as EventListener);

      input.value = "test";
      input.dispatchEvent(new Event("input", { bubbles: true }));
      expect(eventValue).toBe("test");
      el.remove();
    });

    test("renders disabled input when disabled attribute is set", () => {
      const el = document.createElement("saz-input");
      el.setAttribute("disabled", "");
      document.body.appendChild(el);
      const input = el.shadowRoot!.querySelector("input");
      expect(input?.hasAttribute("disabled")).toBe(true);
      el.remove();
    });
  });

  describe("saz-checkbox", () => {
    test("renders checkbox box element", () => {
      const el = document.createElement("saz-checkbox");
      document.body.appendChild(el);
      const box = el.shadowRoot!.querySelector(".box");
      expect(box).toBeTruthy();
      el.remove();
    });

    test("toggles checked on click", () => {
      const el = document.createElement("saz-checkbox");
      document.body.appendChild(el);

      expect(el.hasAttribute("checked")).toBe(false);
      el.click();
      expect(el.hasAttribute("checked")).toBe(true);
      el.click();
      expect(el.hasAttribute("checked")).toBe(false);
      el.remove();
    });

    test("dispatches saz-change event on toggle", () => {
      const el = document.createElement("saz-checkbox");
      document.body.appendChild(el);

      let checkedState: boolean | null = null;
      el.addEventListener("saz-change", ((e: CustomEvent) => {
        checkedState = e.detail.checked;
      }) as EventListener);

      el.click();
      expect(checkedState).toBe(true);
      el.click();
      expect(checkedState).toBe(false);
      el.remove();
    });

    test("does not toggle when disabled", () => {
      const el = document.createElement("saz-checkbox");
      el.setAttribute("disabled", "");
      document.body.appendChild(el);

      el.click();
      expect(el.hasAttribute("checked")).toBe(false);
      el.remove();
    });

    test("renders label text", () => {
      const el = document.createElement("saz-checkbox");
      el.textContent = "Accept terms";
      document.body.appendChild(el);
      const label = el.shadowRoot!.querySelector(".label");
      expect(label?.textContent).toBe("Accept terms");
      el.remove();
    });
  });

  describe("saz-toggle", () => {
    test("renders track and thumb elements", () => {
      const el = document.createElement("saz-toggle");
      document.body.appendChild(el);
      expect(el.shadowRoot!.querySelector(".track")).toBeTruthy();
      expect(el.shadowRoot!.querySelector(".thumb")).toBeTruthy();
      el.remove();
    });

    test("toggles checked on click", () => {
      const el = document.createElement("saz-toggle");
      document.body.appendChild(el);

      expect(el.hasAttribute("checked")).toBe(false);
      el.click();
      expect(el.hasAttribute("checked")).toBe(true);
      el.click();
      expect(el.hasAttribute("checked")).toBe(false);
      el.remove();
    });

    test("dispatches saz-change event", () => {
      const el = document.createElement("saz-toggle");
      document.body.appendChild(el);

      let checked: boolean | null = null;
      el.addEventListener("saz-change", ((e: CustomEvent) => {
        checked = e.detail.checked;
      }) as EventListener);

      el.click();
      expect(checked).toBe(true);
      el.remove();
    });

    test("does not toggle when disabled", () => {
      const el = document.createElement("saz-toggle");
      el.setAttribute("disabled", "");
      document.body.appendChild(el);

      el.click();
      expect(el.hasAttribute("checked")).toBe(false);
      el.remove();
    });
  });

  describe("saz-text", () => {
    test("renders with Shadow DOM", () => {
      const el = document.createElement("saz-text");
      document.body.appendChild(el);
      expect(el.shadowRoot).toBeTruthy();
      el.remove();
    });

    test("supports size and weight variants in stylesheet", () => {
      const el = document.createElement("saz-text");
      document.body.appendChild(el);
      const style = el.shadowRoot!.querySelector("style")?.textContent || "";
      expect(style).toContain('size="small"');
      expect(style).toContain('size="large"');
      expect(style).toContain('weight="bold"');
      expect(style).toContain('tone="dim"');
      el.remove();
    });
  });

  describe("saz-grid", () => {
    test("renders with grid display", () => {
      const el = document.createElement("saz-grid");
      document.body.appendChild(el);
      const style = el.shadowRoot!.querySelector("style")?.textContent || "";
      expect(style).toContain("display: grid");
      el.remove();
    });

    test("uses cols attribute for grid-template-columns", () => {
      const el = document.createElement("saz-grid");
      el.setAttribute("cols", "4");
      document.body.appendChild(el);
      const style = el.shadowRoot!.querySelector("style")?.textContent || "";
      expect(style).toContain("repeat(4, minmax(0, 1fr))");
      el.remove();
    });

    test("adds responsive media queries for md:cols", () => {
      const el = document.createElement("saz-grid");
      el.setAttribute("cols", "1");
      el.setAttribute("md:cols", "2");
      document.body.appendChild(el);
      const style = el.shadowRoot!.querySelector("style")?.textContent || "";
      expect(style).toContain("768px");
      expect(style).toContain("repeat(2, minmax(0, 1fr))");
      el.remove();
    });

    test("adds responsive media queries for lg:cols", () => {
      const el = document.createElement("saz-grid");
      el.setAttribute("cols", "1");
      el.setAttribute("lg:cols", "3");
      document.body.appendChild(el);
      const style = el.shadowRoot!.querySelector("style")?.textContent || "";
      expect(style).toContain("1024px");
      expect(style).toContain("repeat(3, minmax(0, 1fr))");
      el.remove();
    });
  });

  describe("saz-icon", () => {
    test("renders SVG for known icon", () => {
      const el = document.createElement("saz-icon");
      el.textContent = "play";
      document.body.appendChild(el);
      const svg = el.shadowRoot!.querySelector("svg");
      expect(svg).toBeTruthy();
      el.remove();
    });

    test("passes through unknown icon text", () => {
      const el = document.createElement("saz-icon");
      el.textContent = "custom";
      document.body.appendChild(el);
      const span = el.shadowRoot!.querySelector("span");
      expect(span?.textContent).toBe("custom");
      el.remove();
    });
  });

  describe("saz-icon-button", () => {
    test("renders SVG for known icon", () => {
      const el = document.createElement("saz-icon-button");
      el.textContent = "pause";
      document.body.appendChild(el);
      const svg = el.shadowRoot!.querySelector("svg");
      expect(svg).toBeTruthy();
      el.remove();
    });

    test("renders SVG with size and variant attributes", () => {
      const el = document.createElement("saz-icon-button");
      el.setAttribute("size", "large");
      el.setAttribute("variant", "primary");
      el.textContent = "play";
      document.body.appendChild(el);
      const svg = el.shadowRoot!.querySelector("svg");
      expect(svg).toBeTruthy();
      expect(el.getAttribute("size")).toBe("large");
      expect(el.getAttribute("variant")).toBe("primary");
      el.remove();
    });
  });

  describe("saz-image", () => {
    test("renders img element with src", () => {
      const el = document.createElement("saz-image");
      el.setAttribute("src", "test.jpg");
      document.body.appendChild(el);
      const img = el.shadowRoot!.querySelector("img");
      expect(img).toBeTruthy();
      expect(img?.getAttribute("src")).toBe("test.jpg");
      el.remove();
    });
  });

  describe("saz-coverart", () => {
    test("renders img element with src from textContent", () => {
      const el = document.createElement("saz-coverart");
      el.textContent = "album.jpg";
      document.body.appendChild(el);
      const img = el.shadowRoot!.querySelector("img");
      expect(img).toBeTruthy();
      expect(img?.getAttribute("src")).toBe("album.jpg");
      el.remove();
    });

    test("shows empty when no src", () => {
      const el = document.createElement("saz-coverart");
      document.body.appendChild(el);
      const img = el.shadowRoot!.querySelector("img");
      expect(img).toBeNull();
      el.remove();
    });
  });

  describe("saz-badge", () => {
    test("renders with pill shape", () => {
      const el = document.createElement("saz-badge");
      document.body.appendChild(el);
      const style = el.shadowRoot!.querySelector("style")?.textContent || "";
      expect(style).toContain("var(--saz-radius-round)");
      el.remove();
    });
  });

  describe("saz-divider", () => {
    test("renders as block", () => {
      const el = document.createElement("saz-divider");
      document.body.appendChild(el);
      const style = el.shadowRoot!.querySelector("style")?.textContent || "";
      expect(style).toContain("display: block");
      el.remove();
    });

    test("supports vertical mode in stylesheet", () => {
      const el = document.createElement("saz-divider");
      document.body.appendChild(el);
      const style = el.shadowRoot!.querySelector("style")?.textContent || "";
      expect(style).toContain("[vertical]");
      el.remove();
    });
  });

  describe("saz-spacer", () => {
    test("renders with flex: 1 by default", () => {
      const el = document.createElement("saz-spacer");
      document.body.appendChild(el);
      const style = el.shadowRoot!.querySelector("style")?.textContent || "";
      expect(style).toContain("flex: 1");
      el.remove();
    });
  });

  describe("saz-section", () => {
    test("renders with Shadow DOM and slot", () => {
      const el = document.createElement("saz-section");
      document.body.appendChild(el);
      expect(el.shadowRoot).toBeTruthy();
      expect(el.shadowRoot!.querySelector("slot")).toBeTruthy();
      el.remove();
    });
  });

  describe("saz-row", () => {
    test("supports wrap attribute in stylesheet", () => {
      const el = document.createElement("saz-row");
      document.body.appendChild(el);
      const style = el.shadowRoot!.querySelector("style")?.textContent || "";
      expect(style).toContain("[wrap]");
      expect(style).toContain("flex-wrap: wrap");
      el.remove();
    });

    test("supports justify variants", () => {
      const el = document.createElement("saz-row");
      document.body.appendChild(el);
      const style = el.shadowRoot!.querySelector("style")?.textContent || "";
      expect(style).toContain("space-between");
      expect(style).toContain("space-around");
      el.remove();
    });
  });

  describe("saz-stack", () => {
    test("uses flex column layout", () => {
      const el = document.createElement("saz-stack");
      document.body.appendChild(el);
      const style = el.shadowRoot!.querySelector("style")?.textContent || "";
      expect(style).toContain("flex-direction: column");
      el.remove();
    });
  });

  describe("saz-heading", () => {
    test("defaults to bold weight", () => {
      const el = document.createElement("saz-heading");
      document.body.appendChild(el);
      const style = el.shadowRoot!.querySelector("style")?.textContent || "";
      expect(style).toContain("var(--saz-text-weight-bold)");
      el.remove();
    });
  });

  describe("saz-details and saz-controls (generics)", () => {
    test("saz-details renders with Shadow DOM", () => {
      const el = document.createElement("saz-details");
      document.body.appendChild(el);
      expect(el.shadowRoot).toBeTruthy();
      expect(el.shadowRoot!.querySelector("slot")).toBeTruthy();
      el.remove();
    });

    test("saz-controls renders with Shadow DOM", () => {
      const el = document.createElement("saz-controls");
      document.body.appendChild(el);
      expect(el.shadowRoot).toBeTruthy();
      expect(el.shadowRoot!.querySelector("slot")).toBeTruthy();
      el.remove();
    });

    test("saz-details supports layout=row", () => {
      const el = document.createElement("saz-details");
      document.body.appendChild(el);
      const style = el.shadowRoot!.querySelector("style")?.textContent || "";
      expect(style).toContain('layout="row"');
      el.remove();
    });
  });

  describe("Component Registry", () => {
    test("registry has all required components", () => {
      const expected = [
        "saz-row", "saz-column", "saz-grid", "saz-stack",
        "saz-card", "saz-text", "saz-heading", "saz-label",
        "saz-button", "saz-icon-button", "saz-input", "saz-checkbox", "saz-toggle",
        "saz-image", "saz-coverart", "saz-icon",
        "saz-badge", "saz-tag", "saz-divider", "saz-spacer",
        "saz-section", "saz-details", "saz-controls",
      ];
      for (const tag of expected) {
        expect(COMPONENT_REGISTRY[tag]).toBeTruthy();
      }
    });

    test("all registry entries are constructable", () => {
      for (const [tag, cls] of Object.entries(COMPONENT_REGISTRY)) {
        expect(typeof cls).toBe("function");
      }
    });
  });

  describe("Accessibility", () => {
    test("saz-button has role=button and tabindex", () => {
      const el = document.createElement("saz-button");
      document.body.appendChild(el);
      expect(el.getAttribute("role")).toBe("button");
      expect(el.getAttribute("tabindex")).toBe("0");
      el.remove();
    });

    test("saz-icon-button has role=button and aria-label", () => {
      const el = document.createElement("saz-icon-button");
      el.setAttribute("icon", "play");
      document.body.appendChild(el);
      expect(el.getAttribute("role")).toBe("button");
      expect(el.getAttribute("aria-label")).toBe("play");
      el.remove();
    });

    test("saz-checkbox has role=checkbox and aria-checked", () => {
      const el = document.createElement("saz-checkbox");
      document.body.appendChild(el);
      expect(el.getAttribute("role")).toBe("checkbox");
      expect(el.getAttribute("aria-checked")).toBe("false");
      el.click();
      expect(el.getAttribute("aria-checked")).toBe("true");
      el.remove();
    });

    test("saz-toggle has role=switch and aria-checked", () => {
      const el = document.createElement("saz-toggle");
      document.body.appendChild(el);
      expect(el.getAttribute("role")).toBe("switch");
      expect(el.getAttribute("aria-checked")).toBe("false");
      el.click();
      expect(el.getAttribute("aria-checked")).toBe("true");
      el.remove();
    });

    test("interactive elements have focus-visible styles", () => {
      const button = document.createElement("saz-button");
      document.body.appendChild(button);
      const btnStyle = button.shadowRoot!.querySelector("style")?.textContent || "";
      expect(btnStyle).toContain("focus-visible");

      const iconBtn = document.createElement("saz-icon-button");
      document.body.appendChild(iconBtn);
      const iconStyle = iconBtn.shadowRoot!.querySelector("style")?.textContent || "";
      expect(iconStyle).toContain("focus-visible");

      const toggle = document.createElement("saz-toggle");
      document.body.appendChild(toggle);
      const toggleStyle = toggle.shadowRoot!.querySelector("style")?.textContent || "";
      expect(toggleStyle).toContain("focus-visible");

      const checkbox = document.createElement("saz-checkbox");
      document.body.appendChild(checkbox);
      const cbStyle = checkbox.shadowRoot!.querySelector("style")?.textContent || "";
      expect(cbStyle).toContain("focus-visible");

      button.remove();
      iconBtn.remove();
      toggle.remove();
      checkbox.remove();
    });
  });

  describe("saz-modal", () => {
    test("renders with Shadow DOM", () => {
      const el = document.createElement("saz-modal");
      document.body.appendChild(el);
      expect(el.shadowRoot).toBeTruthy();
      expect(el.shadowRoot!.querySelector(".dialog")).toBeTruthy();
      expect(el.shadowRoot!.querySelector(".overlay")).toBeTruthy();
      el.remove();
    });

    test("shows modal when open attribute is set", () => {
      const el = document.createElement("saz-modal");
      el.setAttribute("open", "");
      document.body.appendChild(el);
      expect(el.hasAttribute("open")).toBe(true);
      el.remove();
    });

    test("dispatches saz-open event when opened", () => {
      const el = document.createElement("saz-modal");
      document.body.appendChild(el);
      
      let opened = false;
      el.addEventListener("saz-open", () => { opened = true; });
      
      el.setAttribute("open", "");
      expect(opened).toBe(true);
      el.remove();
    });

    test("renders title from attribute", () => {
      const el = document.createElement("saz-modal");
      el.setAttribute("title", "My Modal");
      document.body.appendChild(el);
      const title = el.shadowRoot!.querySelector(".title");
      expect(title?.textContent).toBe("My Modal");
      el.remove();
    });

    test("has close button", () => {
      const el = document.createElement("saz-modal");
      document.body.appendChild(el);
      const closeBtn = el.shadowRoot!.querySelector(".close-btn");
      expect(closeBtn).toBeTruthy();
      el.remove();
    });
  });

  describe("saz-toast", () => {
    test("renders with Shadow DOM", () => {
      const el = document.createElement("saz-toast");
      document.body.appendChild(el);
      expect(el.shadowRoot).toBeTruthy();
      el.remove();
    });

    test("shows message from attribute", () => {
      const el = document.createElement("saz-toast");
      el.setAttribute("message", "Saved successfully");
      document.body.appendChild(el);
      const msg = el.shadowRoot!.querySelector(".message");
      expect(msg?.textContent).toBe("Saved successfully");
      el.remove();
    });

    test("shows different icons for variants", () => {
      const successEl = document.createElement("saz-toast");
      successEl.setAttribute("variant", "success");
      document.body.appendChild(successEl);
      expect(successEl.shadowRoot!.querySelector(".icon")).toBeTruthy();
      successEl.remove();

      const errorEl = document.createElement("saz-toast");
      errorEl.setAttribute("variant", "error");
      document.body.appendChild(errorEl);
      expect(errorEl.shadowRoot!.querySelector(".icon")).toBeTruthy();
      errorEl.remove();
    });

    test("has visible attribute after rendering", () => {
      const el = document.createElement("saz-toast");
      document.body.appendChild(el);
      expect(el.hasAttribute("visible")).toBe(true);
      el.remove();
    });
  });

  describe("saz-tabs", () => {
    test("renders with Shadow DOM", () => {
      const el = document.createElement("saz-tabs");
      document.body.appendChild(el);
      expect(el.shadowRoot).toBeTruthy();
      el.remove();
    });

    test("renders tab buttons from slot", () => {
      const el = document.createElement("saz-tabs");
      const tab1 = document.createElement("div");
      tab1.setAttribute("slot", "tab");
      tab1.setAttribute("label", "Tab One");
      const tab2 = document.createElement("div");
      tab2.setAttribute("slot", "tab");
      tab2.setAttribute("label", "Tab Two");
      el.appendChild(tab1);
      el.appendChild(tab2);
      document.body.appendChild(el);
      
      const tabs = el.shadowRoot!.querySelectorAll(".tab");
      expect(tabs.length).toBe(2);
      expect(tabs[0].textContent).toBe("Tab One");
      el.remove();
    });

    test("has active attribute for active tab", async () => {
      const el = document.createElement("saz-tabs");
      const tab1 = document.createElement("div");
      tab1.setAttribute("slot", "tab");
      const tab2 = document.createElement("div");
      tab2.setAttribute("slot", "tab");
      el.appendChild(tab1);
      el.appendChild(tab2);
      el.setAttribute("active", "1");
      document.body.appendChild(el);
      
      await Promise.resolve();
      const tabButtons = el.shadowRoot!.querySelectorAll(".tab");
      expect(tabButtons[1].classList.contains("active")).toBe(true);
      el.remove();
    });

    test("dispatches saz-change event when tab is clicked", () => {
      const el = document.createElement("saz-tabs");
      const tab1 = document.createElement("div");
      tab1.setAttribute("slot", "tab");
      const panel1 = document.createElement("div");
      panel1.setAttribute("slot", "panel");
      el.appendChild(tab1);
      el.appendChild(panel1);
      document.body.appendChild(el);
      
      let activeIndex: string | null = null;
      el.addEventListener("saz-change", ((e: CustomEvent) => {
        activeIndex = e.detail.activeIndex;
      }) as EventListener);
      
      const tabButton = el.shadowRoot!.querySelector(".tab") as HTMLElement;
      tabButton?.click();
      
      expect(activeIndex).toBe("0");
      el.remove();
    });
  });

  describe("saz-accordion", () => {
    test("renders with Shadow DOM", () => {
      const el = document.createElement("saz-accordion");
      document.body.appendChild(el);
      expect(el.shadowRoot).toBeTruthy();
      el.remove();
    });

    test("renders items from children with heading attribute", () => {
      const el = document.createElement("saz-accordion");
      const item1 = document.createElement("div");
      item1.setAttribute("heading", "Section 1");
      item1.textContent = "Content 1";
      el.appendChild(item1);
      document.body.appendChild(el);
      
      const headers = el.shadowRoot!.querySelectorAll(".title");
      expect(headers.length).toBe(1);
      expect(headers[0].textContent).toBe("Section 1");
      el.remove();
    });

    test("supports single-open attribute", () => {
      const el = document.createElement("saz-accordion");
      el.setAttribute("single-open", "");
      document.body.appendChild(el);
      expect(el.hasAttribute("single-open")).toBe(true);
      el.remove();
    });

    test("expands item on header click", () => {
      const el = document.createElement("saz-accordion");
      const item1 = document.createElement("div");
      item1.setAttribute("heading", "Section 1");
      el.appendChild(item1);
      document.body.appendChild(el);
      
      const header = el.shadowRoot!.querySelector(".header") as HTMLElement;
      header?.click();
      
      const item = el.shadowRoot!.querySelector(".item");
      expect(item?.hasAttribute("open")).toBe(true);
      el.remove();
    });
  });

  describe("saz-select", () => {
    test("renders with Shadow DOM", () => {
      const el = document.createElement("saz-select");
      document.body.appendChild(el);
      expect(el.shadowRoot).toBeTruthy();
      expect(el.shadowRoot!.querySelector(".trigger")).toBeTruthy();
      el.remove();
    });

    test("shows placeholder when no value", () => {
      const el = document.createElement("saz-select");
      el.setAttribute("placeholder", "Choose...");
      document.body.appendChild(el);
      
      const valueEl = el.shadowRoot!.querySelector(".value");
      expect(valueEl?.textContent).toBe("Choose...");
      el.remove();
    });

    test("renders options from slot", () => {
      const el = document.createElement("saz-select");
      const opt1 = document.createElement("option");
      opt1.setAttribute("value", "a");
      opt1.textContent = "Option A";
      const opt2 = document.createElement("option");
      opt2.setAttribute("value", "b");
      opt2.textContent = "Option B";
      el.appendChild(opt1);
      el.appendChild(opt2);
      document.body.appendChild(el);
      
      const options = el.shadowRoot!.querySelectorAll(".option");
      expect(options.length).toBe(2);
      expect(options[0].textContent).toBe("Option A");
      el.remove();
    });

    test("shows selected value", () => {
      const el = document.createElement("saz-select");
      el.setAttribute("value", "b");
      const opt1 = document.createElement("option");
      opt1.setAttribute("value", "a");
      opt1.textContent = "Option A";
      const opt2 = document.createElement("option");
      opt2.setAttribute("value", "b");
      opt2.textContent = "Option B";
      el.appendChild(opt1);
      el.appendChild(opt2);
      document.body.appendChild(el);
      
      const valueEl = el.shadowRoot!.querySelector(".value");
      expect(valueEl?.textContent).toBe("Option B");
      el.remove();
    });

    test("toggles dropdown on trigger click", () => {
      const el = document.createElement("saz-select");
      const opt1 = document.createElement("option");
      opt1.setAttribute("value", "a");
      el.appendChild(opt1);
      document.body.appendChild(el);
      
      const trigger = el.shadowRoot!.querySelector(".trigger") as HTMLElement;
      trigger?.click();
      
      expect(el.hasAttribute("open")).toBe(true);
      el.remove();
    });

    test("dispatches saz-change when option is selected", () => {
      const el = document.createElement("saz-select");
      const opt1 = document.createElement("option");
      opt1.setAttribute("value", "a");
      opt1.textContent = "Option A";
      el.appendChild(opt1);
      document.body.appendChild(el);
      
      let newValue: string | null = null;
      el.addEventListener("saz-change", ((e: CustomEvent) => {
        newValue = e.detail.value;
      }) as EventListener);
      
      const trigger = el.shadowRoot!.querySelector(".trigger") as HTMLElement;
      trigger?.click();
      
      const option = el.shadowRoot!.querySelector(".option") as HTMLElement;
      option?.click();
      
      expect(newValue).toBe("a");
      el.remove();
    });
  });

  describe("saz-button variants", () => {
    test("primary variant has correct styles", () => {
      const el = document.createElement("saz-button");
      el.setAttribute("variant", "primary");
      document.body.appendChild(el);
      const style = el.shadowRoot!.querySelector("style")?.textContent || "";
      expect(style).toContain('variant="primary"');
      expect(style).toContain("saz-color-primary");
      el.remove();
    });

    test("secondary variant has transparent background", () => {
      const el = document.createElement("saz-button");
      el.setAttribute("variant", "secondary");
      document.body.appendChild(el);
      const style = el.shadowRoot!.querySelector("style")?.textContent || "";
      expect(style).toContain('variant="secondary"');
      expect(style).toContain("background: transparent");
      el.remove();
    });

    test("accent variant has accent color", () => {
      const el = document.createElement("saz-button");
      el.setAttribute("variant", "accent");
      document.body.appendChild(el);
      const style = el.shadowRoot!.querySelector("style")?.textContent || "";
      expect(style).toContain('variant="accent"');
      expect(style).toContain("saz-color-accent");
      el.remove();
    });

    test("danger variant has danger color", () => {
      const el = document.createElement("saz-button");
      el.setAttribute("variant", "danger");
      document.body.appendChild(el);
      const style = el.shadowRoot!.querySelector("style")?.textContent || "";
      expect(style).toContain('variant="danger"');
      expect(style).toContain("saz-color-danger");
      el.remove();
    });

    test("dim variant has dim color", () => {
      const el = document.createElement("saz-button");
      el.setAttribute("variant", "dim");
      document.body.appendChild(el);
      const style = el.shadowRoot!.querySelector("style")?.textContent || "";
      expect(style).toContain('variant="dim"');
      expect(style).toContain("saz-color-text-dim");
      el.remove();
    });

    test("supports tone attribute", () => {
      const el = document.createElement("saz-button");
      el.setAttribute("tone", "dim");
      document.body.appendChild(el);
      const style = el.shadowRoot!.querySelector("style")?.textContent || "";
      expect(style).toContain('tone="dim"');
      el.remove();
    });

    test("supports shape pill", () => {
      const el = document.createElement("saz-button");
      el.setAttribute("shape", "pill");
      document.body.appendChild(el);
      const style = el.shadowRoot!.querySelector("style")?.textContent || "";
      expect(style).toContain('shape="pill"');
      expect(style).toContain("saz-radius-round");
      el.remove();
    });
  });

  describe("saz-slider", () => {
    test("renders with Shadow DOM", () => {
      const el = document.createElement("saz-slider");
      document.body.appendChild(el);
      expect(el.shadowRoot).toBeTruthy();
      expect(el.shadowRoot!.querySelector(".slider")).toBeTruthy();
      el.remove();
    });

    test("renders range input", () => {
      const el = document.createElement("saz-slider");
      document.body.appendChild(el);
      const input = el.shadowRoot!.querySelector('input[type="range"]');
      expect(input).toBeTruthy();
      el.remove();
    });

    test("uses min/max from attributes", () => {
      const el = document.createElement("saz-slider");
      el.setAttribute("min", "0");
      el.setAttribute("max", "50");
      document.body.appendChild(el);
      const input = el.shadowRoot!.querySelector('input[type="range"]') as HTMLInputElement;
      expect(input?.min).toBe("0");
      expect(input?.max).toBe("50");
      el.remove();
    });

    test("dispatches saz-input event on change", () => {
      const el = document.createElement("saz-slider");
      document.body.appendChild(el);
      
      let value: number | null = null;
      el.addEventListener("saz-input", ((e: CustomEvent) => {
        value = e.detail.value;
      }) as EventListener);
      
      const input = el.shadowRoot!.querySelector('input[type="range"]') as HTMLInputElement;
      input.value = "75";
      input.dispatchEvent(new Event("input", { bubbles: true }));
      
      expect(value).toBe(75);
      el.remove();
    });
  });

  describe("saz-radio", () => {
    test("renders with Shadow DOM", () => {
      const el = document.createElement("saz-radio");
      document.body.appendChild(el);
      expect(el.shadowRoot).toBeTruthy();
      el.remove();
    });

    test("renders radio circle", () => {
      const el = document.createElement("saz-radio");
      document.body.appendChild(el);
      expect(el.shadowRoot!.querySelector(".radio")).toBeTruthy();
      el.remove();
    });

    test("toggles checked on click", () => {
      const el = document.createElement("saz-radio");
      document.body.appendChild(el);
      
      expect(el.hasAttribute("checked")).toBe(false);
      el.click();
      expect(el.hasAttribute("checked")).toBe(true);
      el.remove();
    });

    test("dispatches saz-change event", () => {
      const el = document.createElement("saz-radio");
      document.body.appendChild(el);
      
      let value: string | null = null;
      el.addEventListener("saz-change", ((e: CustomEvent) => {
        value = e.detail.value;
      }) as EventListener);
      
      el.click();
      expect(value).toBe("");
      el.remove();
    });
  });

  describe("saz-switch", () => {
    test("renders with Shadow DOM", () => {
      const el = document.createElement("saz-switch");
      document.body.appendChild(el);
      expect(el.shadowRoot).toBeTruthy();
      el.remove();
    });

    test("toggles checked on click", () => {
      const el = document.createElement("saz-switch");
      document.body.appendChild(el);
      
      expect(el.hasAttribute("checked")).toBe(false);
      el.click();
      expect(el.hasAttribute("checked")).toBe(true);
      el.remove();
    });

    test("dispatches saz-change event with checked value", () => {
      const el = document.createElement("saz-switch");
      document.body.appendChild(el);
      
      let detail: any = null;
      el.addEventListener("saz-change", ((e: CustomEvent) => {
        detail = e.detail;
      }) as EventListener);
      
      el.click();
      expect(detail).toBeTruthy();
      expect(detail.checked).toBe(true);
      el.remove();
    });
  });

  describe("saz-card variants and props", () => {
    test("supports layout=row", () => {
      const el = document.createElement("saz-card");
      el.setAttribute("layout", "row");
      document.body.appendChild(el);
      const style = el.shadowRoot!.querySelector("style")?.textContent || "";
      expect(style).toContain('layout="row"');
      expect(style).toContain("flex-direction: row");
      el.remove();
    });

    test("supports size variants", () => {
      const small = document.createElement("saz-card");
      small.setAttribute("size", "small");
      document.body.appendChild(small);
      const smallStyle = small.shadowRoot!.querySelector("style")?.textContent || "";
      expect(smallStyle).toContain('size="small"');
      small.remove();

      const large = document.createElement("saz-card");
      large.setAttribute("size", "large");
      document.body.appendChild(large);
      const largeStyle = large.shadowRoot!.querySelector("style")?.textContent || "";
      expect(largeStyle).toContain('size="large"');
      large.remove();
    });

    test("supports variant background", () => {
      const el = document.createElement("saz-card");
      el.setAttribute("variant", "accent");
      document.body.appendChild(el);
      const style = el.shadowRoot!.querySelector("style")?.textContent || "";
      expect(style).toContain('variant="accent"');
      expect(style).toContain("saz-color-accent");
      el.remove();
    });
  });

  describe("saz-section", () => {
    test("renders with Shadow DOM", () => {
      const el = document.createElement("saz-section");
      document.body.appendChild(el);
      expect(el.shadowRoot).toBeTruthy();
      el.remove();
    });

    test("supports layout=row", () => {
      const el = document.createElement("saz-section");
      el.setAttribute("layout", "row");
      document.body.appendChild(el);
      const style = el.shadowRoot!.querySelector("style")?.textContent || "";
      expect(style).toContain('layout="row"');
      el.remove();
    });
  });

  describe("saz-column", () => {
    test("renders with flex column layout", () => {
      const el = document.createElement("saz-column");
      document.body.appendChild(el);
      const style = el.shadowRoot!.querySelector("style")?.textContent || "";
      expect(style).toContain("flex-direction: column");
      el.remove();
    });

    test("supports justify variants", () => {
      const el = document.createElement("saz-column");
      el.setAttribute("justify", "space-between");
      document.body.appendChild(el);
      const style = el.shadowRoot!.querySelector("style")?.textContent || "";
      expect(style).toContain("space-between");
      el.remove();
    });
  });
});
