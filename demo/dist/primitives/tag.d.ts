import { SazamiComponent } from './base';
declare const tagConfig: {
    readonly properties: {
        readonly variant: {
            readonly type: "string";
            readonly reflect: true;
        };
    };
};
export declare class SazamiTag extends SazamiComponent<typeof tagConfig> {
    variant: string;
    render(): void;
}
export {};
