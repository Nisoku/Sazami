import { SazamiComponent } from "./base";
import { type Readable } from "@nisoku/sairin";
declare const coverartConfig: {
    readonly properties: {
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
    alt: string;
    size: string;
    shape: string;
    private _srcSignal;
    private _imgElement;
    private _pendingSrc;
    private _srcEffectDispose;
    private _isReadableStr;
    set src(value: string | Readable<string>);
    get src(): string | Readable<string>;
    private _updateSrc;
    private _setupSrcEffect;
    render(): void;
}
export {};
