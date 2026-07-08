import { describe, test, expect } from '@jest/globals';
import { parseModifiers, MODIFIER_MAP } from "../src/primitives/modifier-map";
import type { Modifier } from "@nisoku/sakko";

describe("Modifier Map", () => {
  test("maps accent to variant", () => {
    const modifiers: Modifier[] = [{ type: "flag", value: "accent" }];
    const result = parseModifiers(modifiers);
    expect(result.variant).toBe("accent");
  });

  test("maps large to size", () => {
    const modifiers: Modifier[] = [{ type: "flag", value: "large" }];
    const result = parseModifiers(modifiers);
    expect(result.size).toBe("large");
  });

  test("maps pill to shape", () => {
    const modifiers: Modifier[] = [{ type: "flag", value: "pill" }];
    const result = parseModifiers(modifiers);
    expect(result.shape).toBe("pill");
  });

  test("maps disabled to boolean", () => {
    const modifiers: Modifier[] = [{ type: "flag", value: "disabled" }];
    const result = parseModifiers(modifiers);
    expect(result.disabled).toBe(true);
  });

  test("handles empty array", () => {
    const result = parseModifiers([]);
    expect(result).toEqual({});
  });

  test("throws on unknown modifier", () => {
    const modifiers: Modifier[] = [{ type: "flag", value: "unknown" }];
    expect(() => parseModifiers(modifiers)).toThrow();
  });

  test("combines multiple modifiers", () => {
    const modifiers: Modifier[] = [
      { type: "flag", value: "large" },
      { type: "flag", value: "pill" },
      { type: "flag", value: "disabled" },
    ];
    const result = parseModifiers(modifiers);
    expect(result.size).toBe("large");
    expect(result.shape).toBe("pill");
    expect(result.disabled).toBe(true);
  });

  test("maps key-value modifiers", () => {
    const modifiers: Modifier[] = [
      { type: "pair", key: "custom", value: "value" },
    ];
    const result = parseModifiers(modifiers);
    expect(result.custom).toBe("value");
  });
});

describe("Modifier Map CSS Style Pairs", () => {
  test("converts position pair to __style", () => {
    const modifiers: Modifier[] = [
      { type: "pair", key: "position", value: "absolute" },
      { type: "pair", key: "top", value: "10" },
      { type: "pair", key: "left", value: "20" },
    ];
    const result = parseModifiers(modifiers);
    expect(result.__style).toEqual({
      position: "absolute",
      top: "10",
      left: "20",
    });
  });

  test("converts display pair to __style", () => {
    const modifiers: Modifier[] = [
      { type: "pair", key: "display", value: "flex" },
      { type: "pair", key: "width", value: "100%" },
    ];
    const result = parseModifiers(modifiers);
    expect(result.__style).toEqual({
      display: "flex",
      width: "100%",
    });
  });

  test("merges CSS flags with __style pairs", () => {
    const modifiers: Modifier[] = [
      { type: "flag", value: "absolute" },
      { type: "pair", key: "top", value: "10" },
      { type: "pair", key: "left", value: "20" },
    ];
    const result = parseModifiers(modifiers);
    expect(result.__style).toEqual({
      position: "absolute",
      top: "10",
      left: "20",
    });
  });

  test("@style string becomes __rawStyle", () => {
    const modifiers: Modifier[] = [
      { type: "atcode", name: "style", body: "color: red; background: blue" },
    ];
    const result = parseModifiers(modifiers);
    expect(result.__rawStyle).toBe("color: red; background: blue");
  });

  test("@style with JSON object merges into __style", () => {
    const modifiers: Modifier[] = [
      { type: "atcode", name: "style", body: '{"color": "red", "background": "blue"}' },
    ];
    const result = parseModifiers(modifiers);
    expect(result.__style).toEqual({ color: "red", background: "blue" });
  });

  test("@if becomes __if", () => {
    const modifiers: Modifier[] = [
      { type: "atcode", name: "if", body: "isVisible" },
    ];
    const result = parseModifiers(modifiers);
    expect(result.__if).toBe("isVisible");
  });
});

describe("Modifier Map Constants", () => {
  test("has text variants", () => {
    expect(MODIFIER_MAP.accent).toEqual({ variant: "accent" });
    expect(MODIFIER_MAP.primary).toEqual({ variant: "primary" });
    expect(MODIFIER_MAP.secondary).toEqual({ variant: "secondary" });
    expect(MODIFIER_MAP.danger).toEqual({ variant: "danger" });
    expect(MODIFIER_MAP.success).toEqual({ variant: "success" });
    expect(MODIFIER_MAP.dim).toEqual({ tone: "dim", variant: "dim" });
  });

  test("has size values", () => {
    expect(MODIFIER_MAP.small).toEqual({ size: "small" });
    expect(MODIFIER_MAP.medium).toEqual({ size: "medium" });
    expect(MODIFIER_MAP.large).toEqual({ size: "large" });
    expect(MODIFIER_MAP.xlarge).toEqual({ size: "xlarge" });
    expect(MODIFIER_MAP.tiny).toEqual({ size: "tiny" });
  });

  test("has shape values", () => {
    expect(MODIFIER_MAP.round).toEqual({ shape: "round" });
    expect(MODIFIER_MAP.square).toEqual({ shape: "square" });
    expect(MODIFIER_MAP.pill).toEqual({ shape: "pill" });
  });

  test("has boolean modifiers", () => {
    expect(MODIFIER_MAP.disabled).toEqual({ disabled: true });
    expect(MODIFIER_MAP.active).toEqual({ active: true });
    expect(MODIFIER_MAP.loading).toEqual({ loading: true });
    expect(MODIFIER_MAP.checked).toEqual({ checked: true });
  });

  test("has layout modifiers", () => {
    expect(MODIFIER_MAP.row).toEqual({ layout: "row" });
    expect(MODIFIER_MAP.column).toEqual({ layout: "column" });
    expect(MODIFIER_MAP.center).toEqual({ align: "center" });
    expect(MODIFIER_MAP["space-between"]).toEqual({ justify: "space-between" });
  });

  test("has dim modifier with both tone and variant", () => {
    expect(MODIFIER_MAP.dim.tone).toBe("dim");
    expect(MODIFIER_MAP.dim.variant).toBe("dim");
  });

  test("has position modifier flags", () => {
    expect(MODIFIER_MAP.absolute).toEqual({ position: "absolute" });
    expect(MODIFIER_MAP.fixed).toEqual({ position: "fixed" });
    expect(MODIFIER_MAP.relative).toEqual({ position: "relative" });
    expect(MODIFIER_MAP.sticky).toEqual({ position: "sticky" });
  });

  test("has display modifier flags", () => {
    expect(MODIFIER_MAP.block).toEqual({ display: "block" });
    expect(MODIFIER_MAP.flex).toEqual({ display: "flex" });
    expect(MODIFIER_MAP.hidden).toEqual({ display: "none" });
    expect(MODIFIER_MAP["inline-block"]).toEqual({ display: "inline-block" });
    expect(MODIFIER_MAP["inline-flex"]).toEqual({ display: "inline-flex" });
  });
});
