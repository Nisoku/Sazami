import { SazamiComponent } from "./base";
import { type Readable } from "@nisoku/sairin";
declare const cardConfig: {
    readonly properties: {
        readonly layout: {
            readonly type: "string";
            readonly reflect: false;
        };
        readonly align: {
            readonly type: "string";
            readonly reflect: false;
        };
        readonly justify: {
            readonly type: "string";
            readonly reflect: false;
        };
        readonly size: {
            readonly type: "string";
            readonly reflect: false;
        };
        readonly variant: {
            readonly type: "string";
            readonly reflect: false;
        };
        readonly gap: {
            readonly type: "string";
            readonly reflect: false;
        };
    };
};
export declare class SazamiCard extends SazamiComponent<typeof cardConfig> {
    layout: string;
    align: string;
    justify: string;
    size: string;
    variant: string;
    gap: string;
    private _loadingSignal;
    private _isReadableBool;
    set loading(value: boolean | Readable<boolean>);
    get loading(): boolean | Readable<boolean>;
    render(): void;
}
export {};
