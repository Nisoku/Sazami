import { SazamiComponent } from './base';
declare const sectionConfig: {
    readonly properties: {
        readonly layout: {
            readonly type: "string";
            readonly reflect: true;
        };
        readonly align: {
            readonly type: "string";
            readonly reflect: true;
        };
        readonly gap: {
            readonly type: "string";
            readonly reflect: true;
        };
        readonly "center-point": {
            readonly type: "boolean";
            readonly reflect: false;
        };
    };
};
export declare class SazamiSection extends SazamiComponent<typeof sectionConfig> {
    layout: string;
    align: string;
    gap: string;
    "center-point": boolean;
    private _resizeObserver?;
    private _boundComputeAndSetCenter;
    private _slot?;
    private _computeAndSetCenter;
    private _attachSlotListener;
    connectedCallback(): void;
    private _setupResizeObserver;
    disconnectedCallback(): void;
    render(): void;
    static get observedAttributes(): string[];
    attributeChangedCallback(name: string, oldVal: string | null, newVal: string | null): void;
}
export {};
