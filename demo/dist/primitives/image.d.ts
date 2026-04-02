import { SazamiComponent } from "./base";
import { type Readable } from "@nisoku/sairin";
declare const imageConfig: {
    readonly properties: {
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
    alt: string;
    size: string;
    shape: string;
    private _srcSignal;
    private _imgElement;
    private _pendingSrc;
    private _srcDispose;
    private _isReadableStr;
    set src(value: string | Readable<string>);
    get src(): string | Readable<string>;
    private _updateSrc;
    private _createImageElement;
    private _setupSrcBinding;
    private _getCurrentSrc;
    render(): void;
}
export {};
