import { SazamiComponent } from "./base";
import { type Readable } from "@nisoku/sairin";
declare const selectConfig: {
    readonly properties: {
        readonly placeholder: {
            readonly type: "string";
            readonly reflect: true;
        };
        readonly open: {
            readonly type: "boolean";
            readonly reflect: true;
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
    readonly binds: {
        readonly value: "attribute";
        readonly disabled: "attribute";
    };
};
export declare class SazamiSelect extends SazamiComponent<typeof selectConfig> {
    open: boolean;
    private _options;
    private _valueSignal;
    private _valueEffectDisposer;
    private _valueBindingInitialized;
    private _disabledSignal;
    private _disabledEffectDisposer;
    private _handleDocumentClick;
    private _isReadableStr;
    private _isReadableBool;
    set value(valueOrSignal: string | Readable<string>);
    get value(): string | Readable<string>;
    private _getValue;
    private _setupValueBinding;
    set disabled(value: boolean | Readable<boolean>);
    get disabled(): boolean | Readable<boolean>;
    private _setDisabled;
    private _getIsDisabled;
    connectedCallback(): void;
    disconnectedCallback(): void;
    render(): void;
    private _wireHandlers;
    private toggleOpen;
    private _navigateOption;
    private _updateSelectedState;
    private _updateDisplay;
    private _updateTabIndex;
    static get observedAttributes(): string[];
    attributeChangedCallback(name: string, oldVal: string | null, newVal: string | null): void;
}
export {};
