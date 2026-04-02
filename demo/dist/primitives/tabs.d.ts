import { SazamiComponent } from "./base";
import { Signal } from "@nisoku/sairin";
declare const tabsConfig: {
    readonly properties: {
        readonly active: {
            readonly type: "string";
            readonly reflect: true;
        };
    };
    readonly events: {
        readonly change: {
            readonly name: "saz-change";
            readonly detail: {
                readonly activeIndex: "active";
            };
        };
    };
};
export declare class SazamiTabs extends SazamiComponent<typeof tabsConfig> {
    active: string;
    activeSignal?: Signal<string>;
    private _tabs;
    private _panelElements;
    private _handlersAdded;
    render(): void;
    private _activateTab;
    static get observedAttributes(): string[];
    attributeChangedCallback(name: string, oldVal: string | null, newVal: string | null): void;
}
export {};
