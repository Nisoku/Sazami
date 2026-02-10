/**
 * @jest-environment jsdom
 */
import { registerComponents, COMPONENT_REGISTRY } from "../src/primitives/registry";

describe("Primitive Components - Behavior", () => {
  beforeAll(() => {
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
      expect(style).toContain("9999px");
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
      expect(style).toContain("700");
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
});
