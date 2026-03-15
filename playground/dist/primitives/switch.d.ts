import { SazamiComponent } from './base';
declare const switchConfig: {
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
export declare class SazamiSwitch extends SazamiComponent<typeof switchConfig> {
    checked: boolean;
    disabled: boolean;
    variant: string;
    render(): void;
    private _updateAria;
    private _handleClick;
    private _handleKeydown;
    static get observedAttributes(): string[];
    attributeChangedCallback(name: string, oldVal: string | null, newVal: string | null): void;
}
export {};
