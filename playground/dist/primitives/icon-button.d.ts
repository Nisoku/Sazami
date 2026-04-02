import { SazamiComponent } from "./base";
import { type Readable } from "@nisoku/sairin";
declare const iconButtonConfig: {
    readonly properties: {
        readonly icon: {
            readonly type: "string";
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
    };
    readonly events: {
        readonly click: {
            readonly name: "saz-click";
            readonly detail: {};
        };
    };
};
export declare class SazamiIconButton extends SazamiComponent<typeof iconButtonConfig> {
    icon: string;
    size: string;
    variant: string;
    private _handlersAdded;
    private _autoAriaLabel;
    private _disabledSignal;
    private _isReadableBool;
    set disabled(value: boolean | Readable<boolean>);
    get disabled(): boolean | Readable<boolean>;
    private _setDisabled;
    private _getIsDisabled;
    render(): void;
    private _updateTabIndex;
    static get observedAttributes(): string[];
    attributeChangedCallback(name: string, oldVal: string | null, newVal: string | null): void;
    private _handleClick;
    private _handleKeydown;
    disconnectedCallback(): void;
}
export {};
