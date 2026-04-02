import { SazamiComponent } from "./base";
import { type Readable } from "@nisoku/sairin";
declare const tagConfig: {
    readonly observedAttributes: readonly ["content"];
    readonly properties: {
        readonly variant: {
            readonly type: "string";
            readonly reflect: true;
        };
    };
};
export declare class SazamiTag extends SazamiComponent<typeof tagConfig> {
    variant: string;
    private _contentSignal;
    private _contentValue;
    private _textNode;
    private _isReadableStr;
    set content(value: string | Readable<string>);
    get content(): string | Readable<string>;
    private _updateContent;
    private _setupContentBinding;
    render(): void;
    attributeChangedCallback(name: string, oldVal: string | null, newVal: string | null): void;
}
export {};
