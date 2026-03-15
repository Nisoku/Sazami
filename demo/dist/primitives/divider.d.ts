import { SazamiComponent } from './base';
declare const dividerConfig: {
    readonly properties: {
        readonly vertical: {
            readonly type: "boolean";
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
    };
};
export declare class SazamiDivider extends SazamiComponent<typeof dividerConfig> {
    vertical: boolean;
    size: string;
    variant: string;
    render(): void;
}
export {};
