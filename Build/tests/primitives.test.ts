/**
 * @jest-environment jsdom
 */
import { compileSakko } from "../src/index";

describe("Sazami Primitives", () => {
  beforeEach(() => {
    document.head.innerHTML = "";
  });

  test("should render basic card component", () => {
    const source = '<page { card { text: "Hello World" } }>';
    const container = document.createElement("div");

    compileSakko(source, container);

    const card = container.querySelector("saz-card");
    expect(card).toBeTruthy();
    expect(card?.getAttribute("variant")).toBeNull();
    expect(card?.shadowRoot).toBeTruthy();

    const text = card?.querySelector("saz-text");
    expect(text).toBeTruthy();
  });

  test("should render button with variant", () => {
    const source = '<page { button(accent): "Click Me" }>';
    const container = document.createElement("div");

    compileSakko(source, container);

    const button = container.querySelector("saz-button");
    expect(button).toBeTruthy();
    expect(button?.getAttribute("variant")).toBe("accent");
    expect(button?.textContent).toBe("Click Me");
  });

  test("should render row with gap", () => {
    const source = '<page { row(gap large): [ button: "1", button: "2" ] }>';
    const container = document.createElement("div");

    compileSakko(source, container);

    const row = container.querySelector("saz-row");
    expect(row).toBeTruthy();
    expect(row?.getAttribute("gap")).toBe("large");

    const buttons = row?.querySelectorAll("saz-button");
    expect(buttons).toHaveLength(2);
  });

  test("should render grid with columns", () => {
    const source =
      '<page { grid(cols 3): [ card { text: "1" }, card { text: "2" }, card { text: "3" } ] }>';
    const container = document.createElement("div");

    compileSakko(source, container);

    const grid = container.querySelector("saz-grid");
    expect(grid).toBeTruthy();
    expect(grid?.getAttribute("cols")).toBe("3");

    const cards = grid?.querySelectorAll("saz-card");
    expect(cards).toHaveLength(3);
  });

  test("should render badge with variant", () => {
    const source = '<page { badge(success): "Active" }>';
    const container = document.createElement("div");

    compileSakko(source, container);

    const badge = container.querySelector("saz-badge");
    expect(badge).toBeTruthy();
    expect(badge?.getAttribute("variant")).toBe("success");
    expect(badge?.textContent).toBe("Active");
  });

  test("should render nested structure", () => {
    const source = `
      <page {
        card {
          text(bold): "Welcome"
          text(dim): "Description"
          row(space-between): [
            button: "Cancel",
            button(primary): "Submit"
          ]
        }
      }>
    `;
    const container = document.createElement("div");

    compileSakko(source, container);

    const card = container.querySelector("saz-card");
    expect(card).toBeTruthy();

    const texts = card?.querySelectorAll("saz-text");
    expect(texts).toHaveLength(2);

    const row = card?.querySelector("saz-row");
    expect(row).toBeTruthy();
    expect(row?.getAttribute("justify")).toBe("space-between");

    const buttons = row?.querySelectorAll("saz-button");
    expect(buttons).toHaveLength(2);
  });

  test("should handle multiple modifiers", () => {
    const source = '<page { text(bold large dim): "Styled Text" }>';
    const container = document.createElement("div");

    compileSakko(source, container);

    const text = container.querySelector("saz-text");
    expect(text).toBeTruthy();
    expect(text?.getAttribute("weight")).toBe("bold");
    expect(text?.getAttribute("size")).toBe("large");
    expect(text?.getAttribute("tone")).toBe("dim");
  });
});
