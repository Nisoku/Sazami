import { SazamiComponent } from './base';
declare const spinnerConfig: {
    readonly properties: {
        readonly size: {
            readonly type: "string";
            readonly reflect: true;
        };
        readonly variant: {
            readonly type: "string";
            readonly reflect: true;
        };
        readonly label: {
            readonly type: "string";
            readonly reflect: true;
        };
    };
};
export declare class SazamiSpinner extends SazamiComponent<typeof spinnerConfig> {
    size: string;
    variant: string;
    label: string;
    render(): void;
}
export {};
