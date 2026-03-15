import { SazamiComponent } from './base';
declare const sliderConfig: {
    readonly properties: {
        readonly value: {
            readonly type: "number";
            readonly reflect: false;
            readonly default: 50;
        };
        readonly min: {
            readonly type: "number";
            readonly reflect: false;
            readonly default: 0;
        };
        readonly max: {
            readonly type: "number";
            readonly reflect: false;
            readonly default: 100;
        };
        readonly step: {
            readonly type: "number";
            readonly reflect: false;
            readonly default: 1;
        };
        readonly disabled: {
            readonly type: "boolean";
            readonly reflect: true;
        };
        readonly size: {
            readonly type: "string";
            readonly reflect: false;
            readonly default: "medium";
        };
    };
    readonly events: {
        readonly input: {
            readonly name: "saz-input";
            readonly detail: {
                readonly value: "value";
            };
        };
    };
};
export declare class SazamiSlider extends SazamiComponent<typeof sliderConfig> {
    value: number;
    min: number;
    max: number;
    step: number;
    disabled: boolean;
    size: string;
    render(): void;
    static get observedAttributes(): string[];
    attributeChangedCallback(name: string, oldVal: string | null, newVal: string | null): void;
}
export {};
