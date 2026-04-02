import { SazamiComponent } from "./base";
import { type Readable } from "@nisoku/sairin";
declare const radioConfig: {
    readonly properties: {
        readonly name: {
            readonly type: "string";
            readonly reflect: false;
        };
        readonly value: {
            readonly type: "string";
            readonly reflect: false;
        };
    };
    readonly events: {
        readonly change: {
            readonly name: "saz-change";
            readonly detail: {
                readonly value: "value";
            };
        };
    };
};
export declare class SazamiRadio extends SazamiComponent<typeof radioConfig> {
    name: string;
    value: string;
    private _handlersInstalled;
    private _checkedSignal;
    private _checkedBindingDispose;
    private _disabledSignal;
    private _disabledBindingDispose;
    private _isReadableBool;
    set checked(value: boolean | Readable<boolean>);
    get checked(): boolean | Readable<boolean>;
    private _setChecked;
    set disabled(value: boolean | Readable<boolean>);
    get disabled(): boolean | Readable<boolean>;
    private _setDisabled;
    private _getIsDisabled;
    private _getIsChecked;
    render(): void;
    private _updateAria;
    private _handleClick;
    private _handleKeydown;
    static get observedAttributes(): string[];
    attributeChangedCallback(name: string, oldVal: string | null, newVal: string | null): void;
    disconnectedCallback(): void;
}
export {};
