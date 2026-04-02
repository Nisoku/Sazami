import { SazamiComponent } from "./base";
import { type Readable } from "@nisoku/sairin";
declare const checkboxConfig: {
    readonly properties: {
        readonly checked: {
            readonly type: "boolean";
            readonly reflect: true;
        };
        readonly disabled: {
            readonly type: "boolean";
            readonly reflect: true;
        };
    };
    readonly events: {
        readonly change: {
            readonly name: "saz-change";
            readonly detail: {
                readonly checked: "checked";
            };
        };
    };
    readonly binds: {
        readonly checked: "attribute";
        readonly disabled: "attribute";
    };
};
export declare class SazamiCheckbox extends SazamiComponent<typeof checkboxConfig> {
    private _checkedSignal;
    private _disabledSignal;
    private _isReadableBool;
    set checked(value: boolean | Readable<boolean>);
    get checked(): boolean | Readable<boolean>;
    private _setChecked;
    set disabled(value: boolean | Readable<boolean>);
    get disabled(): boolean | Readable<boolean>;
    private _setDisabled;
    private _getIsDisabled;
    render(): void;
    private _handleClick;
    private _handleKeydown;
    private _updateAria;
}
export {};
