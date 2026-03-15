import { SazamiComponent } from './base';
declare const imageConfig: {
    readonly properties: {
        readonly src: {
            readonly type: "string";
            readonly reflect: true;
        };
        readonly alt: {
            readonly type: "string";
            readonly reflect: true;
        };
        readonly size: {
            readonly type: "string";
            readonly reflect: true;
        };
        readonly shape: {
            readonly type: "string";
            readonly reflect: true;
        };
    };
};
export declare class SazamiImage extends SazamiComponent<typeof imageConfig> {
    src: string;
    alt: string;
    size: string;
    shape: string;
    render(): void;
}
export {};
