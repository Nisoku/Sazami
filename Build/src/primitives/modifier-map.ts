import type { Modifier } from "@nisoku/sakko";

export const MODIFIER_MAP: Record<string, Record<string, string | boolean>> = {
  accent: { variant: "accent" },
  primary: { variant: "primary" },
  secondary: { variant: "secondary" },
  danger: { variant: "danger" },
  success: { variant: "success" },
  dim: { tone: "dim", variant: "dim" },

  small: { size: "small" },
  medium: { size: "medium" },
  large: { size: "large" },
  xlarge: { size: "xlarge" },
  tiny: { size: "tiny" },

  bold: { weight: "bold" },
  normal: { weight: "normal" },
  light: { weight: "light" },

  round: { shape: "round" },
  square: { shape: "square" },
  pill: { shape: "pill" },

  row: { layout: "row" },
  column: { layout: "column" },
  center: { align: "center" },
  "space-between": { justify: "space-between" },

  curved: { curved: true },
  flat: { curved: false },

  disabled: { disabled: true },
  active: { active: true },
  loading: { loading: true },
  checked: { checked: true },
  selected: { selected: true },
  removable: { removable: true },

  "center-point": { "center-point": true },
  vertical: { vertical: true },
  wrap: { wrap: true },

  indeterminate: { indeterminate: true },

  heading: { heading: true },
  open: { open: true },

  // Layout / display flags
  absolute: { position: "absolute" },
  fixed: { position: "fixed" },
  relative: { position: "relative" },
  sticky: { position: "sticky" },
  "inline-block": { display: "inline-block" },
  "inline-flex": { display: "inline-flex" },
  block: { display: "block" },
  flex: { display: "flex" },
  hidden: { display: "none" },
};

const CSS_STYLE_KEYS = new Set([
  "position",
  "top",
  "right",
  "bottom",
  "left",
  "inset",
  "z-index",
  "display",
  "overflow",
  "float",
  "margin",
  "padding",
  "width",
  "height",
  "transform",
  "transition",
  "opacity",
  "flex",
  "order",
  "align-self",
  "justify-self",
]);

export function parseModifiers(modifiers: Modifier[]): Record<string, unknown> {
  const props: Record<string, unknown> = {};

  modifiers.forEach((mod) => {
    if (mod.type === "flag") {
      const mapping = MODIFIER_MAP[mod.value];
      if (mapping) {
        for (const [k, v] of Object.entries(mapping)) {
          if (CSS_STYLE_KEYS.has(k)) {
            const style = (props.__style || {}) as Record<string, string>;
            style[k] = v as string;
            props.__style = style;
          } else {
            props[k] = v;
          }
        }
      } else {
        throw new Error(
          `Unknown modifier "${mod.value}". ` +
            `Valid modifiers: ${Object.keys(MODIFIER_MAP).join(", ")}`,
        );
      }
    } else if (mod.type === "pair") {
      if (CSS_STYLE_KEYS.has(mod.key)) {
        const style = (props.__style || {}) as Record<string, string>;
        style[mod.key] = mod.value;
        props.__style = style;
      } else {
        props[mod.key] = mod.value;
      }
    } else if (mod.type === "event") {
      if (!props.__events) props.__events = [];
      (props.__events as Modifier[]).push(mod);
    } else if (mod.type === "atcode") {
      if (mod.name === "bind") {
        props.__bind = mod.body;
      } else if (mod.name === "style") {
        props.__style = props.__style || {};
        try {
          const parsed = JSON.parse(mod.body);
          if (typeof parsed === "object" && parsed !== null) {
            Object.assign(props.__style as Record<string, string>, parsed);
          }
        } catch {
          // Treat as raw CSS string
          props.__rawStyle = mod.body;
        }
      } else if (mod.name === "if") {
        props.__if = mod.body;
      }
    }
  });

  return props;
}
