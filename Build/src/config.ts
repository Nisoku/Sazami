import type { SatoriInstance, SatoriLogger } from "@nisoku/satori";

export interface SazamiConfig {
  satori: SatoriInstance | null;
}

let currentConfig: SazamiConfig = {
  satori: null,
};

let cachedLogger: SatoriLogger | null = null;

export function configureSazami(config: Partial<SazamiConfig>): void {
  if (config.satori !== undefined) {
    currentConfig.satori = config.satori;
    cachedLogger = null;
  }
}

export function getSazamiLogger(): SatoriLogger | null {
  if (!currentConfig.satori) {
    return null;
  }
  if (!cachedLogger) {
    cachedLogger = currentConfig.satori.createLogger("sazami");
  }
  return cachedLogger;
}

export function getSazamiConfig(): Readonly<SazamiConfig> {
  return { ...currentConfig };
}
