import { SazamiComponent } from "./base";
import { type Readable } from "@nisoku/sairin";
declare const textConfig: {
    readonly properties: {
        readonly size: {
            readonly type: "string";
            readonly reflect: false;
        };
        readonly weight: {
            readonly type: "string";
            readonly reflect: false;
        };
        readonly tone: {
            readonly type: "string";
            readonly reflect: false;
        };
        readonly leading: {
            readonly type: "string";
            readonly reflect: false;
        };
    };
};
export declare class SazamiText extends SazamiComponent<typeof textConfig> {
    size: string;
    weight: string;
    tone: string;
    leading: string;
    private _content;
    private _textNode;
    private _isReadable;
    set content(value: string | Readable<string>);
    get content(): string | Readable<string>;
    private _setTextContent;
    private _bindContentSignal;
    render(): void;
}
export {};
