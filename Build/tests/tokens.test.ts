/**
 * @jest-environment jsdom
 */
import { generateThemeCSS, generateCSSVariables, getTokenValue } from "../src/config/generator";
import { defaultTokens } from "../src/config/tokens";

describe("Token Generator", () => {
  test("generates CSS variables with correct format", () => {
    const css = generateCSSVariables({ "color.primary": "#ff0000" });
    expect(css).toContain("--saz-color-primary: #ff0000");
  });

  test("generates :root selector", () => {
    const css = generateCSSVariables({ "color.primary": "#ff0000" });
    expect(css).toContain(":root {");
    expect(css).toContain("}");
  });

  test("converts dot notation to dash notation", () => {
    const css = generateCSSVariables({ "color.primary": "#ff0000", "text.size.large": "20px" });
    expect(css).toContain("--saz-color-primary");
    expect(css).toContain("--saz-text-size-large");
  });

  test("generates empty string for empty tokens", () => {
    const css = generateCSSVariables({});
    expect(css).toBe("");
  });
});

describe("Theme CSS Generation", () => {
  test("includes all default tokens", () => {
    const css = generateThemeCSS();
    
    expect(css).toContain("--saz-color-primary: #2563eb");
    expect(css).toContain("--saz-color-accent: #ff4d8a");
    expect(css).toContain("--saz-color-background: #ffffff");
    expect(css).toContain("--saz-radius-medium: 8px");
    expect(css).toContain("--saz-space-medium: 12px");
  });

  test("merges custom tokens with defaults", () => {
    const css = generateThemeCSS({ "color.primary": "#00ff00" });
    
    expect(css).toContain("--saz-color-primary: #00ff00");
    expect(css).toContain("--saz-color-accent: #ff4d8a");
  });

  test("custom tokens override defaults", () => {
    const css = generateThemeCSS({ "color.text": "#000000" });
    expect(css).toContain("--saz-color-text: #000000");
  });
});

describe("Token Value Retrieval", () => {
  test("returns value from default tokens", () => {
    expect(getTokenValue("color.primary")).toBe("#2563eb");
    expect(getTokenValue("color.accent")).toBe("#ff4d8a");
    expect(getTokenValue("space.medium")).toBe("12px");
  });

  test("returns value from custom tokens when provided", () => {
    expect(getTokenValue("color.primary", { "color.primary": "#999999" })).toBe("#999999");
  });

  test("custom tokens take precedence over defaults", () => {
    expect(getTokenValue("color.background", { "color.background": "#000" })).toBe("#000");
  });

  test("returns undefined for unknown token", () => {
    expect(getTokenValue("nonexistent")).toBeUndefined();
  });
});

describe("Default Tokens Completeness", () => {
  test("has all required color tokens", () => {
    expect(defaultTokens["color.primary"]).toBeDefined();
    expect(defaultTokens["color.accent"]).toBeDefined();
    expect(defaultTokens["color.background"]).toBeDefined();
    expect(defaultTokens["color.surface"]).toBeDefined();
    expect(defaultTokens["color.border"]).toBeDefined();
    expect(defaultTokens["color.text"]).toBeDefined();
    expect(defaultTokens["color.text-dim"]).toBeDefined();
  });

  test("has all required spacing tokens", () => {
    expect(defaultTokens["space.xsmall"]).toBeDefined();
    expect(defaultTokens["space.tiny"]).toBeDefined();
    expect(defaultTokens["space.small"]).toBeDefined();
    expect(defaultTokens["space.medium"]).toBeDefined();
    expect(defaultTokens["space.large"]).toBeDefined();
    expect(defaultTokens["space.xlarge"]).toBeDefined();
  });

  test("has all required text size tokens", () => {
    expect(defaultTokens["text.size.small"]).toBeDefined();
    expect(defaultTokens["text.size.medium"]).toBeDefined();
    expect(defaultTokens["text.size.large"]).toBeDefined();
  });

  test("has all required radius tokens", () => {
    expect(defaultTokens["radius.none"]).toBeDefined();
    expect(defaultTokens["radius.soft"]).toBeDefined();
    expect(defaultTokens["radius.medium"]).toBeDefined();
    expect(defaultTokens["radius.round"]).toBeDefined();
  });
});
