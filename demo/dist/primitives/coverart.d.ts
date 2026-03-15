import { SazamiComponent } from './base';
declare const coverartConfig: {
    readonly properties: {
        readonly src: {
            readonly type: "string";
            readonly reflect: false;
        };
        readonly alt: {
            readonly type: "string";
            readonly reflect: false;
        };
        readonly size: {
            readonly type: "string";
            readonly reflect: false;
        };
        readonly shape: {
            readonly type: "string";
            readonly reflect: false;
        };
    };
};
export declare class SazamiCoverart extends SazamiComponent<typeof coverartConfig> {
    src: string;
    alt: string;
    size: string;
    shape: string;
    render(): void;
}
export {};
