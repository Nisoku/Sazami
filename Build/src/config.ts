import type { SatoriInstance, SatoriLogger } from "@nisoku/satori";

export interface SazamiConfig {
  satori: SatoriInstance | null;
}

let currentConfig: SazamiConfig = {
  satori: null,
};

export function configureSazami(config: Partial<SazamiConfig>): void {
  if (config.satori !== undefined) {
    currentConfig.satori = config.satori;
  }
}

export function getSazamiLogger(): SatoriLogger | null {
  if (!currentConfig.satori) {
    return null;
  }
  return currentConfig.satori.createLogger("sazami");
}

export function getSazamiConfig(): Readonly<SazamiConfig> {
  return { ...currentConfig };
}
