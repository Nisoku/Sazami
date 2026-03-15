import { SazamiComponent } from './base';
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
    checked: boolean;
    disabled: boolean;
    render(): void;
    private _handleClick;
    private _handleKeydown;
    private _updateAria;
}
export {};
