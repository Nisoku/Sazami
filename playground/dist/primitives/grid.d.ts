import { SazamiComponent } from './base';
declare const gridConfig: {
    readonly properties: {
        readonly cols: {
            readonly type: "string";
            readonly reflect: false;
        };
        readonly "md:cols": {
            readonly type: "string";
            readonly reflect: false;
        };
        readonly "lg:cols": {
            readonly type: "string";
            readonly reflect: false;
        };
        readonly gap: {
            readonly type: "string";
            readonly reflect: false;
        };
    };
};
export declare class SazamiGrid extends SazamiComponent<typeof gridConfig> {
    cols: string;
    "md:cols": string;
    "lg:cols": string;
    gap: string;
    render(): void;
}
export {};
