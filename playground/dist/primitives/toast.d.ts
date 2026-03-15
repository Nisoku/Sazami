import { SazamiComponent } from './base';
declare const toastConfig: {
    readonly properties: {
        readonly message: {
            readonly type: "string";
            readonly reflect: false;
        };
        readonly variant: {
            readonly type: "string";
            readonly reflect: false;
        };
        readonly duration: {
            readonly type: "number";
            readonly reflect: false;
            readonly default: 3000;
        };
        readonly visible: {
            readonly type: "boolean";
            readonly reflect: false;
        };
    };
    readonly events: {
        readonly close: {
            readonly name: "saz-close";
            readonly detail: {};
        };
    };
};
export declare class SazamiToast extends SazamiComponent<typeof toastConfig> {
    message: string;
    variant: string;
    duration: number;
    visible: boolean;
    private _hideTimeout?;
    private _removeTimeout?;
    private _closeHandler;
    private _handleKeydown;
    disconnectedCallback(): void;
    render(): void;
    hide(): void;
    static show(message: string, variant?: string, duration?: number): HTMLElement;
}
export {};
