import { SatoriInstance, SatoriLogger } from '@nisoku/satori';
export interface SazamiConfig {
    satori: SatoriInstance | null;
}
export declare function configureSazami(config: Partial<SazamiConfig>): void;
export declare function getSazamiLogger(): SatoriLogger | null;
export declare function getSazamiConfig(): Readonly<SazamiConfig>;
