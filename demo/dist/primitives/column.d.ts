import { SazamiComponent } from './base';
declare const columnConfig: {
    readonly properties: {
        readonly justify: {
            readonly type: "string";
            readonly reflect: false;
        };
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
export declare class SazamiColumn extends SazamiComponent<typeof columnConfig> {
    justify: string;
    align: string;
    gap: string;
    render(): void;
}
export {};
