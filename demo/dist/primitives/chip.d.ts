import { SazamiComponent } from './base';
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
    selected: boolean;
    disabled: boolean;
    size: string;
    render(): void;
    private _updateTabIndex;
    private _handleClick;
    private _handleKeydown;
}
export {};
