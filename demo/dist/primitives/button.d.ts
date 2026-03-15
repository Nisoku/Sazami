import { SazamiComponent } from './base';
declare const buttonConfig: {
    readonly properties: {
        readonly disabled: {
            readonly type: "boolean";
            readonly reflect: true;
        };
        readonly loading: {
            readonly type: "boolean";
            readonly reflect: true;
        };
        readonly active: {
            readonly type: "boolean";
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
        readonly shape: {
            readonly type: "string";
            readonly reflect: true;
        };
        readonly tone: {
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
export declare class SazamiButton extends SazamiComponent<typeof buttonConfig> {
    disabled: boolean;
    loading: boolean;
    active: boolean;
    size: string;
    variant: string;
    shape: string;
    tone: string;
    render(): void;
    private _handleClick;
    private _handleKeydown;
}
export {};
