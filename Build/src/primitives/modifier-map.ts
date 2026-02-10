import { Modifier } from "../parser/parser";

export const MODIFIER_MAP: Record<string, Record<string, any>> = {
  accent: { variant: "accent" },
  primary: { variant: "primary" },
  secondary: { variant: "secondary" },
  danger: { variant: "danger" },
  success: { variant: "success" },
  dim: { tone: "dim", variant: "dim" },

  small: { size: "small" },
  medium: { size: "medium" },
  large: { size: "large" },

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

  "center-point": { "center-point": true },
  vertical: { vertical: true },
  wrap: { wrap: true },
};

export function parseModifiers(modifiers: Modifier[]): Record<string, any> {
  const props: Record<string, any> = {};

  modifiers.forEach((mod) => {
    if (mod.type === "flag") {
      const mapping = MODIFIER_MAP[mod.value];
      if (mapping) {
        Object.assign(props, mapping);
      } else {
        throw new Error(
          `Unknown modifier "${mod.value}". ` +
            `Valid modifiers: ${Object.keys(MODIFIER_MAP).join(", ")}`,
        );
      }
    } else {
      props[mod.key] = mod.value;
    }
  });

  return props;
}
