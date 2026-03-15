export interface SazamiComponentConfig {
    observedAttributes?: readonly string[] | string[];
    properties?: Record<string, AnyPropertyConfig>;
    events?: Record<string, EventConfig>;
    binds?: Record<string, BindingType>;
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
export type AnyPropertyConfig = PropertyConfig | PropertyConfigNumber | PropertyConfigBoolean;
export interface EventConfig {
    name: string;
    detail?: Record<string, string>;
}
export type BindingType = "attribute" | "property" | "input";
type GetPropConfig<C extends SazamiComponentConfig, P extends string> = C["properties"] extends Record<string, AnyPropertyConfig> ? P extends keyof C["properties"] ? C["properties"][P] : never : never;
type PropType<C extends SazamiComponentConfig, P extends string> = GetPropConfig<C, P> extends AnyPropertyConfig ? GetPropConfig<C, P>["type"] extends "boolean" ? boolean : GetPropConfig<C, P>["type"] extends "number" ? number : string : string;
type EventDetail<C extends SazamiComponentConfig, D extends Record<string, string>> = {
    [K in keyof D]: D[K] extends string ? PropType<C, D[K]> : never;
};
export type InferProps<C extends SazamiComponentConfig> = C["properties"] extends Record<string, AnyPropertyConfig> ? {
    [P in keyof C["properties"]]: PropType<C, P & string>;
} : {};
export type InferEvents<C extends SazamiComponentConfig> = C["events"] extends Record<string, EventConfig> ? {
    [E in keyof C["events"]]: C["events"][E] extends EventConfig ? C["events"][E]["detail"] extends Record<string, string> ? EventDetail<C, C["events"][E]["detail"]> : {} : {};
} : {};
export declare function component<C extends SazamiComponentConfig>(config: C): <T extends {
    new (): SazamiComponent<C>;
}>(Constructor: T) => T;
export declare class SazamiComponent<C extends SazamiComponentConfig = any> extends HTMLElement {
    sazamiConfig: C;
    protected shadow: ShadowRoot;
    protected _cleanupFns: Array<() => void>;
    private _rendered;
    private _propStorage;
    private _handlerId;
    private _handlers;
    constructor();
    static get observedAttributes(): string[];
    connectedCallback(): void;
    disconnectedCallback(): void;
    attributeChangedCallback(name: string, oldVal: string | null, newVal: string | null): void;
    render(): void;
    /**
     * Mounts the component's shadow DOM with the given styles and template.
     * @param styles - CSS styles to inject
     * @param template - HTML template string. Callers are responsible for escaping
     *   user-provided data using escapeHtml() before interpolating into the template.
     */
    protected mount(styles: string, template: string): void;
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
