import { SazamiComponent } from "./base";
import { Signal } from "@nisoku/sairin";
declare const chipConfig: {
    readonly properties: {
        readonly label: {
            readonly type: "string";
            readonly reflect: false;
        };
        readonly variant: {
            readonly type: "string";
            readonly reflect: false;
        };
        readonly removable: {
            readonly type: "boolean";
            readonly reflect: false;
        };
        readonly selected: {
            readonly type: "boolean";
            readonly reflect: true;
        };
        readonly disabled: {
            readonly type: "boolean";
            readonly reflect: true;
        };
        readonly size: {
            readonly type: "string";
            readonly reflect: false;
        };
    };
    readonly events: {
        readonly change: {
            readonly name: "saz-change";
            readonly detail: {
                readonly selected: "selected";
            };
        };
        readonly remove: {
            readonly name: "saz-remove";
            readonly detail: {};
        };
    };
};
export declare class SazamiChip extends SazamiComponent<typeof chipConfig> {
    label: string;
    variant: string;
    removable: boolean;
    size: string;
    selected: boolean;
    disabled: boolean;
    disabledSignal?: Signal<boolean>;
    selectedSignal?: Signal<boolean>;
    render(): void;
    private _updateTabIndex;
    private _handleClick;
    private _handleKeydown;
}
export {};
