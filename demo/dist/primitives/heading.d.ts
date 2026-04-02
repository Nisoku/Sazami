import { SazamiComponent } from "./base";
import { type Readable } from "@nisoku/sairin";
declare const headingConfig: {
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
    };
};
export declare class SazamiHeading extends SazamiComponent<typeof headingConfig> {
    size: string;
    weight: string;
    tone: string;
    private _content;
    private _contentSignal;
    private _textNode;
    private _isReadable;
    set content(value: string | Readable<string>);
    get content(): string | Readable<string>;
    private _setTextContent;
    private _setupSignalBinding;
    render(): void;
}
export {};
