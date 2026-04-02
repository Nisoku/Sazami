import { SazamiComponent } from "./base";
import { type Readable } from "@nisoku/sairin";
declare const sliderConfig: {
    readonly properties: {
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
    min: number;
    max: number;
    step: number;
    size: string;
    private _valueSignal;
    private _disabledSignal;
    private _sliderElement;
    private _filledElement;
    private _rangeMin;
    private _rangeMax;
    private _isReadableNum;
    private _isReadableBool;
    set value(valueOrSignal: number | Readable<number>);
    get value(): number | Readable<number>;
    set disabled(value: boolean | Readable<boolean>);
    get disabled(): boolean | Readable<boolean>;
    private _setDisabled;
    private _getIsDisabled;
    private _setupValueBinding;
    private _updateSliderValue;
    render(): void;
    static get observedAttributes(): string[];
    attributeChangedCallback(name: string, oldVal: string | null, newVal: string | null): void;
}
export {};
