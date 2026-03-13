// @ts-expect-error
const iconModules = import.meta.glob("./*.svg", { query: "?raw", import: "default", eager: true });

export const ICON_SVGS: Record<string, string> = {};

for (const path in iconModules) {
  const name = path.replace("./", "").replace(".svg", "");
  ICON_SVGS[name] = iconModules[path] as string;
}
