import { SazamiComponent } from "./base";
declare const rowConfig: {
    readonly properties: {
        readonly justify: {
            readonly type: "string";
            readonly reflect: true;
        };
        readonly align: {
            readonly type: "string";
            readonly reflect: true;
        };
        readonly wrap: {
            readonly type: "boolean";
            readonly reflect: true;
        };
        readonly gap: {
            readonly type: "string";
            readonly reflect: true;
        };
    };
};
export declare class SazamiRow extends SazamiComponent<typeof rowConfig> {
    justify: string;
    align: string;
    wrap: boolean;
    gap: string;
    render(): void;
}
export {};
