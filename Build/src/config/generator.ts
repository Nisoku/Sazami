import { defaultTokens } from "./tokens";

export function generateCSSVariables(tokens: Record<string, string>): string {
  const entries = Object.entries(tokens);
  if (entries.length === 0) return "";

  const lines = entries.map(([key, value]) => {
    const cssVar = `--saz-${key.replace(/\./g, "-")}`;
    return `  ${cssVar}: ${value};`;
  });

  return `:root {\n${lines.join("\n")}\n}`;
}

export function generateThemeCSS(
  customTokens?: Record<string, string>,
): string {
  const merged = { ...defaultTokens, ...(customTokens || {}) };
  return generateCSSVariables(merged);
}

export function getTokenValue(
  key: string,
  customTokens?: Record<string, string>,
): string | undefined {
  if (customTokens && key in customTokens) {
    return customTokens[key];
  }
  return defaultTokens[key];
}
