import { SazamiComponent } from "./base";
declare const stackConfig: {
    readonly properties: {
        readonly align: {
            readonly type: "string";
            readonly reflect: false;
        };
        readonly gap: {
            readonly type: "string";
            readonly reflect: false;
        };
    };
};
export declare class SazamiStack extends SazamiComponent<typeof stackConfig> {
    align: string;
    gap: string;
    render(): void;
}
export {};
