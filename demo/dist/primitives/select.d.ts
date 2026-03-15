import { SazamiComponent } from './base';
declare const selectConfig: {
    readonly properties: {
        readonly placeholder: {
            readonly type: "string";
            readonly reflect: true;
        };
        readonly value: {
            readonly type: "string";
            readonly reflect: true;
        };
        readonly disabled: {
            readonly type: "boolean";
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
    placeholder: string;
    value: string;
    disabled: boolean;
    open: boolean;
    private _options;
    private _handleDocumentClick;
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
