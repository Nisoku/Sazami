import { SazamiComponent } from './base';
declare const radioConfig: {
    readonly properties: {
        readonly checked: {
            readonly type: "boolean";
            readonly reflect: true;
        };
        readonly disabled: {
            readonly type: "boolean";
            readonly reflect: true;
        };
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
    checked: boolean;
    disabled: boolean;
    name: string;
    value: string;
    private _handlersInstalled;
    render(): void;
    private _updateAria;
    private _handleClick;
    private _handleKeydown;
    static get observedAttributes(): string[];
    attributeChangedCallback(name: string, oldVal: string | null, newVal: string | null): void;
    disconnectedCallback(): void;
}
export {};
