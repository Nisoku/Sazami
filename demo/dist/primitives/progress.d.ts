import { SazamiComponent } from './base';
declare const progressConfig: {
    readonly properties: {
        readonly value: {
            readonly type: "number";
            readonly reflect: true;
            readonly default: 0;
        };
        readonly max: {
            readonly type: "number";
            readonly reflect: true;
            readonly default: 100;
        };
        readonly min: {
            readonly type: "number";
            readonly reflect: true;
            readonly default: 0;
        };
        readonly size: {
            readonly type: "string";
            readonly reflect: true;
        };
        readonly variant: {
            readonly type: "string";
            readonly reflect: true;
        };
        readonly indeterminate: {
            readonly type: "boolean";
            readonly reflect: true;
        };
    };
};
export declare class SazamiProgress extends SazamiComponent<typeof progressConfig> {
    value: number;
    max: number;
    min: number;
    size: string;
    variant: string;
    indeterminate: boolean;
    render(): void;
    static get observedAttributes(): string[];
    attributeChangedCallback(): void;
}
export {};
