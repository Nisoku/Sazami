import { SazamiComponent } from './base';
declare const inputConfig: {
    readonly properties: {
        readonly value: {
            readonly type: "string";
            readonly reflect: true;
        };
        readonly placeholder: {
            readonly type: "string";
            readonly reflect: false;
        };
        readonly type: {
            readonly type: "string";
            readonly reflect: false;
        };
        readonly disabled: {
            readonly type: "boolean";
            readonly reflect: true;
        };
        readonly size: {
            readonly type: "string";
            readonly reflect: false;
        };
        readonly variant: {
            readonly type: "string";
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
    value: string;
    placeholder: string;
    type: string;
    disabled: boolean;
    size: string;
    variant: string;
    render(): void;
    static get observedAttributes(): string[];
    attributeChangedCallback(name: string, oldVal: string | null, newVal: string | null): void;
}
export {};
