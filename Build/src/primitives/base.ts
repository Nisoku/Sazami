import {
  propertyError,
  eventError,
  bindingError,
  renderError,
} from "../errors";
import { type Signal, type Readable } from "@nisoku/sairin";
import {
  bindText,
  bindHtml,
  bindAttribute,
  bindProperty,
  bindClass,
  bindStyle,
  bindInputValue,
  bindInputChecked,
  bindSelectValue,
  bindVisibility,
  bindDisabled,
  bindBooleanAttribute,
} from "@nisoku/sairin";

export type BindTarget =
  | "textContent"
  | "innerHTML"
  | "value"
  | "checked"
  | "disabled"
  | "visible"
  | string;

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

export type AnyPropertyConfig =
  | PropertyConfig
  | PropertyConfigNumber
  | PropertyConfigBoolean;

export interface EventConfig {
  name: string;
  detail?: Record<string, string>;
}

export type BindingType = "attribute" | "property" | "input";

// Get property config safely
type GetPropConfig<C extends SazamiComponentConfig, P extends string> =
  C["properties"] extends Record<string, AnyPropertyConfig>
    ? P extends keyof C["properties"]
      ? C["properties"][P]
      : never
    : never;

// Map property name -> its actual TS type
type PropType<C extends SazamiComponentConfig, P extends string> =
  GetPropConfig<C, P> extends AnyPropertyConfig
    ? GetPropConfig<C, P>["type"] extends "boolean"
      ? boolean
      : GetPropConfig<C, P>["type"] extends "number"
        ? number
        : string
    : string;

// Map event's detail object -> inferred detail type
type EventDetail<
  C extends SazamiComponentConfig,
  D extends Record<string, string>,
> = {
  [K in keyof D]: D[K] extends string ? PropType<C, D[K]> : never;
};

// All properties with their types
export type InferProps<C extends SazamiComponentConfig> =
  C["properties"] extends Record<string, AnyPropertyConfig>
    ? { [P in keyof C["properties"]]: PropType<C, P & string> }
    : {};

// All events with their detail types
export type InferEvents<C extends SazamiComponentConfig> =
  C["events"] extends Record<string, EventConfig>
    ? {
        [E in keyof C["events"]]: C["events"][E] extends EventConfig
          ? C["events"][E]["detail"] extends Record<string, string>
            ? EventDetail<C, C["events"][E]["detail"]>
            : {}
          : {};
      }
    : {};

// Decorator stores metadata on prototype for base class to consume
export function component<C extends SazamiComponentConfig>(config: C) {
  return function <T extends { new (): SazamiComponent<C> }>(Constructor: T) {
    Object.defineProperty(Constructor.prototype, "sazamiConfig", {
      value: config,
      writable: false,
      configurable: true,
    });
    return Constructor;
  };
}

export class SazamiComponent<
  C extends SazamiComponentConfig = any,
> extends HTMLElement {
  // Declare sazamiConfig, set by decorator on prototype
  declare sazamiConfig: C;

  componentId: string = `${this.tagName?.toLowerCase() ?? "element"}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

  protected shadow: ShadowRoot;
  protected _cleanupFns: Array<() => void> = [];
  private _rendered = false;
  private _propStorage: Map<string, string | number | boolean> = new Map();

  // Batching and backpressure
  private _dirty = false;
  private _pendingStyles: string | null = null;
  private _pendingTemplate: string | null = null;

  // Template identity, skip no-op renders
  private _lastTemplate = "";

  // Handler registry: { type: [{ id, fn, source, target }] }
  private _handlerId = 0;
  private _handlers: Map<
    string,
    Array<{
      id: number;
      fn: EventListener;
      source: "internal" | "user";
      target: EventTarget;
    }>
  > = new Map();

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
    this._installPropertyReflectors();
  }

  // Static observedAttributes derived from properties with reflect: true
  static get observedAttributes(): string[] {
    const cfg = (this.prototype as any).sazamiConfig as
      | SazamiComponentConfig
      | undefined;
    if (!cfg) return [];

    // If explicitly provided, use that
    if (cfg.observedAttributes) {
      return [...cfg.observedAttributes];
    }

    // Otherwise derive from properties with reflect: true
    if (cfg.properties) {
      return Object.entries(cfg.properties)
        .filter(([_, prop]) => prop.reflect)
        .map(([name]) => name);
    }

    return [];
  }

  // Lifecycle
  connectedCallback() {
    if (!this._rendered) {
      this.render();
      this._rendered = true;
    }
  }

  disconnectedCallback() {
    this.removeAllHandlers();
    for (const fn of this._cleanupFns) {
      fn();
    }
    this._cleanupFns = [];
    this._rendered = false;
  }

  attributeChangedCallback(
    name: string,
    oldVal: string | null,
    newVal: string | null,
  ) {
    if (oldVal === newVal) return;
    if (this._rendered) {
      this.render();
    }
  }

  // Override in subclass
  render(): void {
    // no-op, subclass must implement
  }

  /**
   * Mounts the component's shadow DOM with the given styles and template.
   * @param styles - CSS styles to inject
   * @param template - HTML template string. Callers are responsible for escaping
   *   user-provided data using escapeHtml() before interpolating into the template.
   */
  protected mount(styles: string, template: string) {
    if (!this._rendered) {
      // First render: synchronous, establishes DOM structure for Sairin to bind to
      try {
        this.shadow.innerHTML = `<style>${styles}</style>${template}`;
      } catch (e) {
        renderError(`Failed to render component: ${(e as Error).message}`, {
          suggestion: "Check the template syntax and styles",
        });
      }
    } else {
      // Subsequent renders: batched, backpressured
      // Once Sairin is wired this path should rarely fire
      this.scheduleRender(styles, template);
    }
  }

  /**
   * Schedules a render to occur in the next microtask.
   * Collapses multiple render() calls within the same tick into one DOM write.
   * Uses backpressure, if a render is already queued, subsequent calls are dropped.
   */
  protected scheduleRender(styles: string, template: string): void {
    this._pendingStyles = styles;
    this._pendingTemplate = template;
    if (this._dirty) return;
    this._dirty = true;
    queueMicrotask(() => {
      this._dirty = false;
      if (this._pendingTemplate !== null) {
        this._flush(this._pendingStyles!, this._pendingTemplate);
        this._pendingStyles = null;
        this._pendingTemplate = null;
      }
    });
  }

  /**
   * Flushes pending styles and template to the shadow DOM.
   * Called by scheduleRender when the microtask runs.
   * Phase 2: skips no-op renders if template is identical.
   */
  private _flush(styles: string, template: string): void {
    // Template identity check, skip if template hasn't changed
    if (template === this._lastTemplate) return;
    this._lastTemplate = template;

    try {
      this.shadow.innerHTML = `<style>${styles}</style>${template}`;
    } catch (e) {
      renderError(`Failed to render component: ${(e as Error).message}`, {
        suggestion: "Check the template syntax and styles",
      });
    }
  }

  // Unified binding API - delegates to Sairin's dom/bindings
  protected bind(selector: string, target: BindTarget, readable: Readable<any>): void {
    const element = selector === ":host" ? this : this.$(selector);
    if (!element) {
      bindingError(`Element not found: ${selector}`, {});
      return;
    }

    let dispose: (() => void) | undefined;

    switch (target) {
      case "textContent":
        dispose = bindText(element, readable as Readable<string>);
        break;
      case "innerHTML":
        dispose = bindHtml(element, readable as Readable<string>);
        break;
      case "value":
        if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
          dispose = bindInputValue(element, readable as Signal<string>);
        }
        break;
      case "checked":
        if (element instanceof HTMLInputElement) {
          dispose = bindInputChecked(element, readable as Signal<boolean>);
        } else {
          dispose = bindBooleanAttribute(element, "checked", readable as Readable<boolean>);
        }
        break;
      case "disabled":
        dispose = bindDisabled(element, readable as Readable<boolean>);
        break;
      case "visible":
        dispose = bindVisibility(element, readable as Readable<boolean>);
        break;
      default:
        if (typeof target === "string") {
          dispose = bindAttribute(element, target, readable);
        }
    }

    if (dispose) {
      this._cleanupFns.push(dispose);
    }
  }

  protected bindText(selector: string, readable: Readable<string>): void {
    this.bind(selector, "textContent", readable);
  }

  protected bindHtml(selector: string, readable: Readable<string>): void {
    this.bind(selector, "innerHTML", readable);
  }

  protected bindValue(selector: string, readable: Readable<string>): void {
    this.bind(selector, "value", readable);
  }

  protected bindChecked(selector: string, readable: Readable<boolean>): void {
    this.bind(selector, "checked", readable);
  }

  protected bindDisabled(selector: string, readable: Readable<boolean>): void {
    this.bind(selector, "disabled", readable);
  }

  protected bindVisible(selector: string, readable: Readable<boolean>): void {
    this.bind(selector, "visible", readable);
  }

  protected bindAttribute(selector: string, attr: string, readable: Readable<any>): void {
    this.bind(selector, attr, readable);
  }

  protected bindProperty<T>(selector: string, prop: string, readable: Readable<T>): void {
    const element = this.$(selector);
    if (!element) {
      bindingError(`Element not found: ${selector}`, {});
      return;
    }
    const dispose = bindProperty(element, prop as any, readable);
    this._cleanupFns.push(dispose);
  }

  protected bindStyle(selector: string, styleProp: string, readable: Readable<string>): void {
    const element = this.$(selector) as HTMLElement;
    if (!element) {
      bindingError(`Element not found: ${selector}`, {});
      return;
    }
    const dispose = bindStyle(element, styleProp, readable);
    this._cleanupFns.push(dispose);
  }

  protected bindClass(selector: string, className: string, readable: Readable<boolean>): void {
    const element = this.$(selector);
    if (!element) {
      bindingError(`Element not found: ${selector}`, {});
      return;
    }
    const dispose = bindClass(element, readable as unknown as Readable<string>);
    this._cleanupFns.push(dispose);
  }

  protected bindToggleClass(selector: string, className: string, readable: Readable<boolean>): void {
    const element = this.$(selector);
    if (!element) {
      bindingError(`Element not found: ${selector}`, {});
      return;
    }
    const dispose = bindProperty(element, "className", {
      get: () => {
        const current = element.className;
        const active = readable.get();
        if (active) {
          return current ? `${current} ${className}` : className;
        } else {
          return current.split(" ").filter(c => c !== className).join(" ");
        }
      }
    } as unknown as Readable<string>);
    this._cleanupFns.push(dispose);
  }

  protected bindWidthPercent(
    selector: string,
    readable: Readable<number>,
    min: number = 0,
    max: number = 100
  ): void {
    const element = selector === ":host" ? this : this.$(selector) as HTMLElement;
    if (!element) {
      bindingError(`Element not found: ${selector}`, {});
      return;
    }
    const dispose = bindStyle(element, "width", {
      get: () => {
        const value = readable.get();
        const range = max - min;
        const percent = range > 0 ? Math.min(100, Math.max(0, ((value - min) / range) * 100)) : 0;
        return `${percent}%`;
      }
    } as unknown as Readable<string>);
    this._cleanupFns.push(dispose);
  }

  protected bindWidthPercentAttribute(
    selector: string,
    attr: string,
    readable: Readable<number>,
    min: number = 0,
    max: number = 100
  ): void {
    const element = selector === ":host" ? this : this.$(selector);
    if (!element) {
      bindingError(`Element not found: ${selector}`, {});
      return;
    }
    const dispose = bindAttribute(element, attr, {
      get: () => {
        const value = readable.get();
        const range = max - min;
        const percent = range > 0 ? Math.min(100, Math.max(0, ((value - min) / range) * 100)) : 0;
        return String(percent);
      }
    } as unknown as Readable<string>);
    this._cleanupFns.push(dispose);
  }

  // query stable internal nodes
  protected $<K extends keyof HTMLElementTagNameMap>(
    selector: K,
  ): HTMLElementTagNameMap[K] | null;
  protected $<E extends HTMLElement = HTMLElement>(selector: string): E | null;
  protected $(selector: string) {
    return this.shadow.querySelector(selector);
  }

  // Handler registry: addHandler returns an ID for later removal
  // Using Function type to accept both EventListener and specific event handlers like KeyboardEvent
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected addHandler(
    type: string,
    handler: Function,
    options?: { internal?: boolean; element?: EventTarget },
  ): number {
    const id = ++this._handlerId;
    const source: "internal" | "user" = options?.internal ? "internal" : "user";
    const target = options?.element || this;

    target.addEventListener(type, handler as EventListener);

    const handlers = this._handlers.get(type) || [];
    handlers.push({ id, fn: handler as EventListener, source, target });
    this._handlers.set(type, handlers);

    return id;
  }

  // Remove handler by ID, function reference, or type+id/type+fn
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected removeHandler(
    typeOrId: string | number,
    idOrFn?: number | Function,
  ) {
    // If only one arg and it's a number, remove by ID across all types
    if (typeof typeOrId === "number") {
      for (const [type, handlers] of this._handlers) {
        const index = handlers.findIndex((h) => h.id === typeOrId);
        if (index !== -1) {
          const handler = handlers[index];
          handler.target.removeEventListener(type, handler.fn);
          handlers.splice(index, 1);
          return;
        }
      }
      return;
    }

    // If two args, remove by ID or fn from specific type
    const handlers = this._handlers.get(typeOrId);
    if (!handlers || idOrFn === undefined) return;

    const index = handlers.findIndex((h) =>
      typeof idOrFn === "number" ? h.id === idOrFn : h.fn === idOrFn,
    );

    if (index !== -1) {
      const handler = handlers[index];
      handler.target.removeEventListener(typeOrId, handler.fn);
      handlers.splice(index, 1);
    }
  }

  // Remove handlers with filters
  protected removeAllHandlers(options?: {
    type?: string;
    source?: "internal" | "user";
  }) {
    const types = options?.type
      ? [options.type]
      : Array.from(this._handlers.keys());

    for (const type of types) {
      const handlers = this._handlers.get(type);
      if (!handlers) continue;

      const toRemove = options?.source
        ? handlers.filter((h) => h.source === options.source)
        : handlers;

      toRemove.forEach((h) => {
        (h.target || this).removeEventListener(type, h.fn);
      });

      if (options?.source) {
        this._handlers.set(
          type,
          handlers.filter((h) => h.source !== options.source),
        );
      } else {
        this._handlers.delete(type);
      }
    }
  }

  // dispatch custom events
  protected dispatch<T = any>(
    name: string,
    detail?: T,
    options: { bubbles?: boolean; composed?: boolean } = {},
  ) {
    this.dispatchEvent(
      new CustomEvent(name, {
        detail: detail ?? {},
        bubbles: options.bubbles ?? true,
        composed: options.composed ?? true,
      }),
    );
  }

  // dispatch typed events based on metadata
  protected dispatchEventTyped<E extends keyof InferEvents<C>>(
    event: E,
    detail: InferEvents<C>[E],
  ) {
    const config = this.sazamiConfig;
    const events = config.events;
    if (!events) return;

    // Find the event config by key
    const eventKey = event as string;
    const eventConfig = (events as any)[eventKey];

    if (!eventConfig) {
      eventError(`Event "${String(event)}" not defined in metadata`, {
        tag: this.tagName,
        suggestion: `Add "${String(event)}" to the events config`,
      });
      return;
    }

    this.dispatchEvent(
      new CustomEvent(eventConfig.name, {
        detail: detail as any,
        bubbles: true,
        composed: true,
      }),
    );
  }

  // mount cleanup for Sairin bindings
  protected onCleanup(fn: () => void) {
    this._cleanupFns.push(fn);
  }

  // Auto-install property reflectors from metadata
  private _installPropertyReflectors() {
    const config = this.sazamiConfig;
    if (!config) return;
    const props = config.properties;

    if (!props) return;

    for (const [prop, cfg] of Object.entries(props)) {
      // Skip if subclass has a custom setter for this property
      const descriptor = Object.getOwnPropertyDescriptor(
        Object.getPrototypeOf(this),
        prop
      );
      if (descriptor && 'set' in descriptor) {
        continue;
      }
      this._createReflector(prop, cfg.type, cfg.default, cfg.reflect);
    }
  }

  private _createReflector(
    prop: string,
    type: "string" | "number" | "boolean",
    defaultValue?: string | number | boolean,
    reflect?: boolean,
  ) {
    const attr = prop;

    Object.defineProperty(this, prop, {
      get() {
        if (type === "boolean") {
          return this.hasAttribute(attr);
        }
        if (this._propStorage.has(attr)) {
          return this._propStorage.get(attr);
        }
        const raw = this.getAttribute(attr);
        if (raw !== null) {
          if (type === "number") {
            const val = parseFloat(raw);
            return !isNaN(val) ? val : (defaultValue ?? 0);
          }
          return raw;
        }
        return defaultValue ?? (type === "number" ? 0 : "");
      },
      set(value: boolean | string | number) {
        if (type === "boolean") {
          if (value) {
            this.setAttribute(attr, "");
          } else {
            this.removeAttribute(attr);
          }
        } else {
          if (reflect && value != null && value !== "") {
            this.setAttribute(attr, String(value));
          } else if (reflect) {
            this.removeAttribute(attr);
          } else {
            this._propStorage.set(attr, value);
          }
        }
      },
      configurable: true,
    });
  }
}
