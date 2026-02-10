/**
 * @jest-environment jsdom
 */
import { compileSakko, parseSakko, transformAST, injectThemeCSS } from "../src/index";

describe("Full Pipeline - Advanced", () => {
  beforeEach(() => {
    document.head.innerHTML = "";
  });

  test("compiles the music player example from GUIDE.md", () => {
    const source = `
      <player {
        card(row medium center curved) {
          coverart(round): "album.jpg"
          details {
            text(bold large): "Midnight City"
            text(dim small): "M83"
            badge(accent): "Synthwave"
          }
          controls {
            icon-btn: play;
            icon-btn: skip;
            badge(accent): LIVE
          }
        }
        card(curved medium) {
          heading: "Up Next"
          column(gap small): [
            row(space-between gap medium) {
              text: "Track 1"
              text(dim small): "3:45"
            },
            row(space-between gap medium) {
              text: "Track 2"
              text(dim small): "4:12"
            }
          ]
        }
        row(space-between gap large curved) {
          button(dim): Library
          button(accent): Discover
          button(dim): Settings
        }
      }>
    `;
    const container = document.createElement("div");
    compileSakko(source, container);

    expect(container.querySelector("saz-card")).toBeTruthy();
    expect(container.querySelector("saz-coverart")).toBeTruthy();
    expect(container.querySelector("saz-details")).toBeTruthy();
    expect(container.querySelector("saz-controls")).toBeTruthy();
    expect(container.querySelector("saz-badge")).toBeTruthy();
    expect(container.querySelector("saz-icon-button")).toBeTruthy();
    expect(container.querySelector("saz-heading")).toBeTruthy();
    expect(container.querySelector("saz-column")).toBeTruthy();
    expect(container.querySelector("saz-row")).toBeTruthy();

    const cards = container.querySelectorAll("saz-card");
    expect(cards).toHaveLength(2);

    const firstCard = cards[0];
    expect(firstCard.getAttribute("layout")).toBe("row");
    expect(firstCard.getAttribute("curved")).toBe("");
    expect(firstCard.getAttribute("align")).toBe("center");

    const buttons = container.querySelectorAll("saz-button");
    expect(buttons).toHaveLength(3);
    expect(buttons[0].getAttribute("tone")).toBe("dim");
    expect(buttons[1].getAttribute("variant")).toBe("accent");
  });

  test("compiles simple page example", () => {
    const source = `
      <page {
        card {
          heading: Welcome
          text: "This is a simple card"
          button(primary): "Click Me"
        }
        grid(cols 2 gap medium): [
          card { text: "Card 1" },
          card { text: "Card 2" },
          card { text: "Card 3" },
          card { text: "Card 4" }
        ]
      }>
    `;
    const container = document.createElement("div");
    compileSakko(source, container);

    const grid = container.querySelector("saz-grid");
    expect(grid?.getAttribute("cols")).toBe("2");
    expect(grid?.getAttribute("gap")).toBe("medium");

    const cards = grid?.querySelectorAll("saz-card");
    expect(cards).toHaveLength(4);
  });

  test("handles form elements", () => {
    const source = `
      <page {
        card {
          label: "Username"
          input: ""
          label: "Password"
          input: ""
          row(gap medium): [
            checkbox: "Remember me",
            toggle: ""
          ]
          button(primary): "Login"
        }
      }>
    `;
    const container = document.createElement("div");
    compileSakko(source, container);

    expect(container.querySelectorAll("saz-label")).toHaveLength(2);
    expect(container.querySelectorAll("saz-input")).toHaveLength(2);
    expect(container.querySelector("saz-checkbox")).toBeTruthy();
    expect(container.querySelector("saz-toggle")).toBeTruthy();
  });

  test("handles deeply nested layout", () => {
    const source = `
      <page {
        grid(cols 2 gap large): [
          card {
            column(gap small) {
              row(space-between) {
                text(bold): "Title"
                badge(accent): "New"
              }
              text(dim): "Description"
              divider: ""
              row(gap small): [
                button(primary small): "Edit",
                button(danger small): "Delete"
              ]
            }
          },
          card {
            stack {
              image: "bg.jpg"
              text(bold): "Overlay"
            }
          }
        ]
      }>
    `;
    const container = document.createElement("div");
    compileSakko(source, container);

    expect(container.querySelector("saz-stack")).toBeTruthy();
    expect(container.querySelector("saz-divider")).toBeTruthy();
    expect(container.querySelector("saz-image")).toBeTruthy();
  });

  test("theme injection creates a style element", () => {
    injectThemeCSS();
    const styles = document.querySelectorAll("style[data-sazami-theme]");
    expect(styles.length).toBeGreaterThanOrEqual(1);
    expect(styles[0].textContent).toContain("--saz-color-primary");
  });

  test("injectThemeCSS updates existing theme", () => {
    injectThemeCSS();
    injectThemeCSS({ "color.primary": "#ff0000" });
    const style = document.querySelector("style[data-sazami-theme]");
    expect(style?.textContent).toContain("--saz-color-primary: #ff0000");
  });

  test("icon-btn maps to saz-icon-button", () => {
    const source = '<page { icon-btn: play }>';
    const container = document.createElement("div");
    compileSakko(source, container);
    expect(container.querySelector("saz-icon-button")).toBeTruthy();
  });

  test("preserves text content through pipeline", () => {
    const source = '<page { text: "Hello World with spaces and 123" }>';
    const container = document.createElement("div");
    compileSakko(source, container);
    const text = container.querySelector("saz-text");
    expect(text?.textContent).toBe("Hello World with spaces and 123");
  });

  test("section with center-point attribute", () => {
    const source = `
      <page {
        section(center-point) {
          grid(cols 2): [
            card(curved): [ text: "A" ],
            card(curved): [ text: "B" ]
          ]
        }
      }>
    `;
    const container = document.createElement("div");
    compileSakko(source, container);
    const section = container.querySelector("saz-section");
    expect(section?.hasAttribute("center-point")).toBe(true);
  });
});

describe("Parser - Complex Real-World Examples", () => {
  test("parses nested lists within blocks", () => {
    const ast = parseSakko(`
      <page {
        grid(cols 3 gap medium): [
          card { text: "A"; badge(accent): "1" },
          card { text: "B"; badge(success): "2" },
          card { text: "C"; badge(danger): "3" }
        ]
      }>
    `);
    expect(ast.name).toBe("page");
    const grid = ast.children[0];
    expect(grid.type).toBe("element");
    if (grid.type === "element") {
      expect(grid.children).toHaveLength(1);
      const list = grid.children[0];
      if (list.type === "list") {
        expect(list.items).toHaveLength(3);
      }
    }
  });

  test("parses multiple root children", () => {
    const ast = parseSakko(`
      <page {
        text: "First"
        text: "Second"
        text: "Third"
      }>
    `);
    expect(ast.children).toHaveLength(3);
  });

  test("handles all modifier categories in one element", () => {
    const ast = parseSakko('<page { button(accent large bold curved pill disabled): "Click" }>');
    const btn = ast.children[0];
    if (btn.type === "inline") {
      expect(btn.modifiers.map(m => m.type === "flag" ? m.value : `${m.key}:${m.value}`)).toEqual([
        "accent", "large", "bold", "curved", "pill", "disabled",
      ]);
    }
  });

  test("transformer maps all modifiers correctly for complex element", () => {
    const ast = parseSakko('<page { card(accent row center curved gap large): [ text: "Hi" ] }>');
    const vnode = transformAST(ast.children[0]);
    if (!Array.isArray(vnode)) {
      expect(vnode.props.variant).toBe("accent");
      expect(vnode.props.layout).toBe("row");
      expect(vnode.props.align).toBe("center");
      expect(vnode.props.curved).toBe(true);
      expect(vnode.props.gap).toBe("large");
    }
  });
});
