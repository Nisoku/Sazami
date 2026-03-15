import { SazamiComponent } from './base';
declare const labelConfig: {
    readonly properties: {
        readonly for: {
            readonly type: "string";
            readonly reflect: true;
        };
    };
};
export declare class SazamiLabel extends SazamiComponent<typeof labelConfig> {
    for: string;
    render(): void;
}
export {};
