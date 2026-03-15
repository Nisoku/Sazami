import { SazamiComponent } from './base';
declare const headingConfig: {
    readonly properties: {
        readonly size: {
            readonly type: "string";
            readonly reflect: false;
        };
        readonly weight: {
            readonly type: "string";
            readonly reflect: false;
        };
        readonly tone: {
            readonly type: "string";
            readonly reflect: false;
        };
    };
};
export declare class SazamiHeading extends SazamiComponent<typeof headingConfig> {
    size: string;
    weight: string;
    tone: string;
    render(): void;
}
export {};
