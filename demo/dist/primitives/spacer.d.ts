import { SazamiComponent } from './base';
declare const spacerConfig: {
    readonly properties: {
        readonly size: {
            readonly type: "string";
            readonly reflect: false;
        };
    };
};
export declare class SazamiSpacer extends SazamiComponent<typeof spacerConfig> {
    size: string;
    render(): void;
}
export {};
