import { SazamiComponent } from "./base";
import { Signal } from "@nisoku/sairin";
declare const modalConfig: {
    readonly properties: {
        readonly title: {
            readonly type: "string";
            readonly reflect: false;
        };
        readonly open: {
            readonly type: "boolean";
            readonly reflect: true;
        };
    };
    readonly events: {
        readonly open: {
            readonly name: "saz-open";
            readonly detail: {};
        };
        readonly close: {
            readonly name: "saz-close";
            readonly detail: {};
        };
    };
};
export declare class SazamiModal extends SazamiComponent<typeof modalConfig> {
    title: string;
    open: boolean;
    openSignal?: Signal<boolean>;
    render(): void;
    private _open;
    private _close;
    attributeChangedCallback(name: string, oldVal: string | null, newVal: string | null): void;
}
export {};
