import { SazamiComponent } from './base';
declare const toggleConfig: {
    readonly properties: {
        readonly checked: {
            readonly type: "boolean";
            readonly reflect: true;
        };
        readonly disabled: {
            readonly type: "boolean";
            readonly reflect: true;
        };
        readonly variant: {
            readonly type: "string";
            readonly reflect: false;
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
export declare class SazamiToggle extends SazamiComponent<typeof toggleConfig> {
    checked: boolean;
    disabled: boolean;
    variant: string;
    render(): void;
    private _handleClick;
    private _handleKeydown;
    private _updateAria;
    attributeChangedCallback(name: string, oldVal: string, newVal: string): void;
}
export {};
