import { SazamiComponent } from "./base";
import { type Readable } from "@nisoku/sairin";
declare const progressConfig: {
    readonly properties: {
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
    max: number;
    min: number;
    size: string;
    variant: string;
    indeterminate: boolean;
    private _valueSignal;
    private _barElement;
    private _rangeMin;
    private _rangeMax;
    private _valueBindingCleanup;
    private _isReadableNum;
    set value(valueOrSignal: number | Readable<number>);
    get value(): number | Readable<number>;
    private _setupValueBinding;
    private _updateBarWidth;
    render(): void;
    static get observedAttributes(): string[];
    attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void;
}
export {};
