import { SazamiComponent } from './base';
declare const textConfig: {
    readonly properties: {
        readonly size: {
            readonly type: "string";
            readonly reflect: false;
        };
        readonly weight: {
            readonly type: "string";
            readonly reflect: false;
        };
        readonly tone: {
            readonly type: "string";
            readonly reflect: false;
        };
        readonly leading: {
            readonly type: "string";
            readonly reflect: false;
        };
    };
};
export declare class SazamiText extends SazamiComponent<typeof textConfig> {
    size: string;
    weight: string;
    tone: string;
    leading: string;
    render(): void;
}
export {};
