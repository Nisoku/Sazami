import { SazamiComponent, component, SazamiComponentConfig } from "./base";
import { GAP_RULES } from "./shared";

const STYLES = `
:host {
  display: flex;
  flex-direction: column;
}
:host([layout="row"]) { flex-direction: row; }
${GAP_RULES}
:host([align="center"]) { align-items: center; }
:host([justify="space-between"]) { justify-content: space-between; }
`;

export function createGenericClass<C extends SazamiComponentConfig = any>(
  config?: C,
): { new (): SazamiComponent<C> } {
  class Generic extends SazamiComponent<C> {
    render() {
      this.mount(STYLES, `<slot></slot>`);
    }
  }

  if (config) {
    component(config)(Generic as any);
  }

  return Generic as { new (): SazamiComponent<C> };
}
