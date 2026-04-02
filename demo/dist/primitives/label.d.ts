import { SazamiComponent } from "./base";
import { type Readable } from "@nisoku/sairin";
declare const labelConfig: {
    readonly properties: {
        readonly for: {
            readonly type: "string";
            readonly reflect: true;
        };
    };
};
export declare class SazamiLabel extends SazamiComponent<typeof labelConfig> {
    for: string;
    private _content;
    private _contentSignal;
    private _textNode;
    private _contentDispose;
    private _isReadable;
    set content(value: string | Readable<string>);
    get content(): string | Readable<string>;
    private _setTextContent;
    private _setupSignalBinding;
    render(): void;
}
export {};
