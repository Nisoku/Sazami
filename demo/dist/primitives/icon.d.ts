import { SazamiComponent } from './base';
declare const iconConfig: {
    readonly properties: {
        readonly icon: {
            readonly type: "string";
            readonly reflect: true;
        };
        readonly size: {
            readonly type: "string";
            readonly reflect: true;
        };
        readonly variant: {
            readonly type: "string";
            readonly reflect: true;
        };
    };
};
export declare class SazamiIcon extends SazamiComponent<typeof iconConfig> {
    icon: string;
    size: string;
    variant: string;
    static get observedAttributes(): string[];
    render(): void;
}
export {};
