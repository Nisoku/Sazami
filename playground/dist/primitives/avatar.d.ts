import { SazamiComponent } from "./base";
import { type Readable } from "@nisoku/sairin";
declare const avatarConfig: {
    readonly properties: {
        readonly alt: {
            readonly type: "string";
            readonly reflect: true;
        };
        readonly initials: {
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
        readonly src: {
            readonly type: "string";
            readonly reflect: true;
        };
    };
    readonly structuralRoots: {
        readonly image: "img";
        readonly initials: "span";
    };
};
export declare class SazamiAvatar extends SazamiComponent<typeof avatarConfig> {
    private _srcSignal;
    private _imgElement;
    private _initialsElement;
    private _srcDisposer;
    private _modeEffectDisposer;
    private _altObserver;
    private _isImageMode;
    protected getRenderMode(): string;
    private _isReadableStr;
    private _disposeSrcBinding;
    private _getCurrentSrc;
    private _isImageModeNow;
    set src(value: string | Readable<string>);
    get src(): string | Readable<string>;
    private _setupSrcBinding;
    private _updateDisplay;
    render(): void;
    private _setupSignalWatcher;
    private _getInitials;
    static get observedAttributes(): string[];
    attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void;
}
export {};
