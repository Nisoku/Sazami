import { SazamiComponent } from "./base";
declare const accordionConfig: {
    readonly properties: {
        readonly "single-open": {
            readonly type: "boolean";
            readonly reflect: false;
        };
        readonly index: {
            readonly type: "string";
            readonly reflect: false;
        };
        readonly open: {
            readonly type: "boolean";
            readonly reflect: false;
        };
    };
    readonly events: {
        readonly change: {
            readonly name: "saz-change";
            readonly detail: {
                readonly index: "index";
                readonly open: "open";
            };
        };
    };
};
export declare class SazamiAccordion extends SazamiComponent<typeof accordionConfig> {
    "single-open": boolean;
    index: string;
    open: boolean;
    private _itemElements;
    private _handlersAdded;
    render(): void;
}
export {};
