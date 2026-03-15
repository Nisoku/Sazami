import { SazamiComponent } from './base';
declare const badgeConfig: {
    readonly properties: {
        readonly size: {
            readonly type: "string";
            readonly reflect: true;
        };
        readonly variant: {
            readonly type: "string";
            readonly reflect: true;
        };
        readonly shape: {
            readonly type: "string";
            readonly reflect: true;
        };
    };
};
export declare class SazamiBadge extends SazamiComponent<typeof badgeConfig> {
    size: string;
    variant: string;
    shape: string;
    render(): void;
}
export {};
