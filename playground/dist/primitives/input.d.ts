import { SazamiComponent } from "./base";
import { type Readable } from "@nisoku/sairin";
declare const inputConfig: {
    readonly properties: {
        readonly placeholder: {
            readonly type: "string";
            readonly reflect: false;
        };
        readonly type: {
            readonly type: "string";
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
        readonly disabled: {
            readonly type: "boolean";
            readonly reflect: false;
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
export declare class SazamiInput extends SazamiComponent<typeof inputConfig> {
    placeholder: string;
    type: string;
    disabled: boolean;
    size: string;
    variant: string;
    private _valueSignal;
    private _input;
    private _valueEffectDisposer;
    private _inputHandler;
    private _isReadableStr;
    set value(valueOrSignal: string | Readable<string>);
    private _disposeValueBindings;
    get value(): string | Readable<string>;
    render(): void;
    static get observedAttributes(): string[];
    attributeChangedCallback(name: string, oldVal: string | null, newVal: string | null): void;
}
export {};
