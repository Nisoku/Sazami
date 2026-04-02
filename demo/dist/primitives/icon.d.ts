import { SazamiComponent } from "./base";
import { type Readable } from "@nisoku/sairin";
declare const iconConfig: {
    readonly properties: {
        readonly icon: {
            readonly type: "string";
            readonly reflect: true;
        };
        readonly size: {
            readonly type: "string";
            readonly reflect: true;
        };
        readonly variant: {
            readonly type: "string";
            readonly reflect: true;
        };
    };
};
export declare class SazamiIcon extends SazamiComponent<typeof iconConfig> {
    size: string;
    variant: string;
    private _iconSignal;
    private _iconElement;
    private _iconEffectDispose;
    private _isReadableStr;
    set icon(value: string | Readable<string>);
    get icon(): string | Readable<string>;
    private _updateIcon;
    private _setupIconBinding;
    render(): void;
}
export {};
