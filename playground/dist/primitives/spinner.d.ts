import { SazamiComponent } from "./base";
import { type Readable } from "@nisoku/sairin";
declare const spinnerConfig: {
    readonly properties: {
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
export declare class SazamiSpinner extends SazamiComponent<typeof spinnerConfig> {
    private _labelSignal;
    private _visibleSignal;
    private _labelElement;
    private _isReadableStr;
    private _isReadableBool;
    set label(value: string | Readable<string>);
    get label(): string | Readable<string>;
    set visible(value: boolean | Readable<boolean>);
    get visible(): boolean | Readable<boolean>;
    private _updateLabel;
    private _setupLabelBinding;
    render(): void;
}
export {};
