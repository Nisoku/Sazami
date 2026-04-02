import { type Readable } from "@nisoku/sairin";
export declare type BindTarget = "textContent" | "innerHTML" | "value" | "checked" | "disabled" | "visible" | string;
export interface SazamiComponentConfig {
    observedAttributes?: readonly string[] | string[];
    properties?: Record<string, AnyPropertyConfig>;
    events?: Record<string, EventConfig>;
    binds?: Record<string, BindingType>;
    structuralRoots?: Record<string, string>;
}
export interface PropertyConfig {
    type: "string";
    reflect?: boolean;
    default?: string;
}
export interface PropertyConfigNumber {
    type: "number";
    reflect?: boolean;
    default: number;
}
export interface PropertyConfigBoolean {
    type: "boolean";
    reflect?: boolean;
    default?: boolean;
}
export declare type AnyPropertyConfig = PropertyConfig | PropertyConfigNumber | PropertyConfigBoolean;
export interface EventConfig {
    name: string;
    detail?: Record<string, string>;
}
export declare type BindingType = "attribute" | "property" | "input";
declare type GetPropConfig<C extends SazamiComponentConfig, P extends string> = C["properties"] extends Record<string, AnyPropertyConfig> ? P extends keyof C["properties"] ? C["properties"][P] : never : never;
declare type PropType<C extends SazamiComponentConfig, P extends string> = GetPropConfig<C, P> extends AnyPropertyConfig ? GetPropConfig<C, P>["type"] extends "boolean" ? boolean : GetPropConfig<C, P>["type"] extends "number" ? number : string : string;
declare type EventDetail<C extends SazamiComponentConfig, D extends Record<string, string>> = {
    [K in keyof D]: D[K] extends string ? PropType<C, D[K]> : never;
};
export declare type InferProps<C extends SazamiComponentConfig> = C["properties"] extends Record<string, AnyPropertyConfig> ? {
    [P in keyof C["properties"]]: PropType<C, P & string>;
} : {};
export declare type InferEvents<C extends SazamiComponentConfig> = C["events"] extends Record<string, EventConfig> ? {
    [E in keyof C["events"]]: C["events"][E] extends EventConfig ? C["events"][E]["detail"] extends Record<string, string> ? EventDetail<C, C["events"][E]["detail"]> : {} : {};
} : {};
export declare function component<C extends SazamiComponentConfig>(config: C): <T extends new () => SazamiComponent<C>>(Constructor: T) => T;
export declare class SazamiComponent<C extends SazamiComponentConfig = any> extends HTMLElement {
    sazamiConfig: C;
    componentId: string;
    protected shadow: ShadowRoot;
    protected _cleanupFns: Array<() => void>;
    private _rendered;
    private _propStorage;
    private _dirty;
    private _pendingStyles;
    private _pendingTemplate;
    private _lastTemplate;
    private _lastStyles;
    private _currentRootElement;
    private _handlerId;
    private _handlers;
    constructor();
    static get observedAttributes(): string[];
    protected getStructuralRoot(): string | null;
    protected getRenderMode(): string;
    private _extractRootElement;
    connectedCallback(): void;
    disconnectedCallback(): void;
    attributeChangedCallback(name: string, oldVal: string | null, newVal: string | null): void;
    render(): void;
    /**
     * Mounts the component's shadow DOM with the given styles and template.
     * Auto-detects structural changes and renders synchronously when needed.
     * For non-structural re-renders, defers to a microtask for batching.
     * @param styles - CSS styles to inject
     * @param template - HTML template string. Callers are responsible for escaping
     *   user-provided data using escapeHtml() before interpolating into the template.
     */
    protected mount(styles: string, template: string): void;
    /**
     * Mounts the component's shadow DOM synchronously.
     * Use this when you need to query/bind immediately after mounting.
     * @param styles - CSS styles to inject
     * @param template - HTML template string. Callers are responsible for escaping
     *   user-provided data using escapeHtml() before interpolating into the template.
     */
    protected mountSync(styles: string, template: string): void;
    /**
     * Schedules a render to occur in the next microtask.
     * Collapses multiple render() calls within the same tick into one DOM write.
     * Uses backpressure, if a render is already queued, subsequent calls are dropped.
     */
    protected scheduleRender(styles: string, template: string): void;
    /**
     * Flushes pending styles and template to the shadow DOM.
     * Called by scheduleRender when the microtask runs.
     * Skips stale renders if structural change made them obsolete.
     */
    private _flush;
    protected bind(selector: string, target: BindTarget, readable: Readable<any>): void;
    protected bindText(selector: string, readable: Readable<string>): void;
    protected bindHtml(selector: string, readable: Readable<string>): void;
    protected bindValue(selector: string, readable: Readable<string>): void;
    protected bindChecked(selector: string, readable: Readable<boolean>): void;
    protected bindDisabled(selector: string, readable: Readable<boolean>): void;
    protected bindVisible(selector: string, readable: Readable<boolean>): void;
    protected bindAttribute(selector: string, attr: string, readable: Readable<any>): (() => void) | void;
    protected bindProperty<T>(selector: string, prop: string, readable: Readable<T>): void;
    protected bindStyle(selector: string, styleProp: string, readable: Readable<string>): void;
    protected bindToggleClass(selector: string, className: string, readable: Readable<boolean>): void;
    protected bindWidthPercent(selector: string, readable: Readable<number>, min?: number, max?: number): () => void;
    protected bindWidthPercentAttribute(selector: string, attr: string, readable: Readable<number>, min?: number, max?: number): void;
    protected $<K extends keyof HTMLElementTagNameMap>(selector: K): HTMLElementTagNameMap[K] | null;
    protected $<E extends HTMLElement = HTMLElement>(selector: string): E | null;
    protected addHandler(type: string, handler: Function, options?: {
        internal?: boolean;
        element?: EventTarget;
    }): number;
    protected removeHandler(typeOrId: string | number, idOrFn?: number | Function): void;
    protected removeAllHandlers(options?: {
        type?: string;
        source?: "internal" | "user";
    }): void;
    protected dispatch<T = any>(name: string, detail?: T, options?: {
        bubbles?: boolean;
        composed?: boolean;
    }): void;
    protected dispatchEventTyped<E extends keyof InferEvents<C>>(event: E, detail: InferEvents<C>[E]): void;
    protected onCleanup(fn: () => void): void;
    private _installPropertyReflectors;
    private _createReflector;
}
export {};
