export declare class SazamiToast extends HTMLElement {
    constructor();
    connectedCallback(): void;
    hide(): void;
    static show(message: string, variant?: string, duration?: number): HTMLElement;
}
