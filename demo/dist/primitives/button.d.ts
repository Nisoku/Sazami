import { SazamiComponent } from "./base";
import { type Readable } from "@nisoku/sairin";
declare const buttonConfig: {
    readonly properties: {
        readonly disabled: {
            readonly type: "boolean";
            readonly reflect: true;
        };
        readonly loading: {
            readonly type: "boolean";
            readonly reflect: true;
        };
        readonly active: {
            readonly type: "boolean";
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
        readonly shape: {
            readonly type: "string";
            readonly reflect: true;
        };
        readonly tone: {
            readonly type: "string";
            readonly reflect: true;
        };
    };
    readonly events: {
        readonly click: {
            readonly name: "saz-click";
            readonly detail: {};
        };
    };
};
export declare class SazamiButton extends SazamiComponent<typeof buttonConfig> {
    loading: boolean;
    private _disabledSignal;
    private _disabledValue;
    private _disabledDispose;
    private _isReadableBool;
    set disabled(value: boolean | Readable<boolean>);
    get disabled(): boolean | Readable<boolean>;
    private _setDisabled;
    private _getIsDisabled;
    render(): void;
    private _handleClick;
    private _handleKeydown;
}
export {};
