import { SazamiComponent } from "./base";
import { type Readable } from "@nisoku/sairin";
declare const badgeConfig: {
    readonly properties: {
        readonly size: {
            readonly type: "string";
            readonly reflect: true;
        };
        readonly variant: {
            readonly type: "string";
            readonly reflect: true;
        };
        readonly shape: {
            readonly type: "string";
            readonly reflect: true;
        };
    };
};
export declare class SazamiBadge extends SazamiComponent<typeof badgeConfig> {
    size: string;
    variant: string;
    shape: string;
    private _contentSignal;
    private _textNode;
    private _textContent;
    private _contentDispose;
    private _isReadable;
    set content(value: string | Readable<string>);
    get content(): string | Readable<string> | undefined;
    render(): void;
}
export {};
