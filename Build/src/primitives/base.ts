export interface SazamiComponentConfig {
  observedAttributes?: readonly string[] | string[];
  properties?: Record<string, PropertyConfig>;
  events?: Record<string, EventConfig>;
  binds?: Record<string, BindingType>;
}

import {
  propertyError,
  eventError,
  bindingError,
  renderError,
} from "../errors";

export interface PropertyConfig {
  type: "string" | "number" | "boolean";
  reflect?: boolean;
  default?: string | number | boolean;
}

export interface EventConfig {
  name: string;
  detail?: Record<string, string>;
}

export type BindingType = "attribute" | "property" | "input";

// Get property config safely
type GetPropConfig<C extends SazamiComponentConfig, P extends string> =
  C["properties"] extends Record<string, PropertyConfig>
    ? P extends keyof C["properties"]
      ? C["properties"][P]
      : never
    : never;

// Map property name -> its actual TS type
type PropType<C extends SazamiComponentConfig, P extends string> =
  GetPropConfig<C, P> extends PropertyConfig
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
  C["properties"] extends Record<string, PropertyConfig>
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

  protected shadow: ShadowRoot;
  protected _cleanupFns: Array<() => void> = [];
  private _rendered = false;

  // Handler registry: { type: [{ id, fn, source, target }] }
  private _handlerId = 0;
  private _handlers: Map<
    string,
    Array<{ id: number; fn: EventListener; source: "internal" | "user"; target: EventTarget }>
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
    this._cleanupFns.forEach((fn) => fn());
    this._cleanupFns = [];
  }

  attributeChangedCallback(name: string, oldVal: string | null, newVal: string | null) {
    if (oldVal === newVal) return;
    if (this._rendered) {
      this.render();
    }
  }

  // Override in subclass
  render(): void {
    // no-op, subclass must implement
  }

  // mount template + styles
  protected mount(styles: string, template: string) {
    try {
      this.shadow.innerHTML = `<style>${styles}</style>${template}`;
    } catch (e) {
      renderError(`Failed to render component: ${(e as Error).message}`, {
        suggestion: "Check the template syntax and styles",
      });
    }
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
  protected removeHandler(typeOrId: string | number, idOrFn?: number | Function) {
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
      if (cfg.reflect) {
        this._createReflector(prop, cfg.type, cfg.default);
      }
    }
  }

  private _createReflector(
    prop: string,
    type: "string" | "number" | "boolean",
    defaultValue?: string | number | boolean,
  ) {
    const attr = prop;

    Object.defineProperty(this, prop, {
      get() {
        if (type === "boolean") {
          return this.hasAttribute(attr);
        }
        const raw = this.getAttribute(attr);
        if (type === "number") {
          const val = raw !== null ? parseFloat(raw) : defaultValue;
          return typeof val === "number" && !isNaN(val) ? val : 0;
        }
        return raw ?? defaultValue ?? "";
      },
      set(value: boolean | string | number) {
        if (type === "boolean") {
          if (value) {
            this.setAttribute(attr, "");
          } else {
            this.removeAttribute(attr);
          }
        } else {
          if (value != null && value !== "") {
            this.setAttribute(attr, String(value));
          } else {
            this.removeAttribute(attr);
          }
        }
      },
      configurable: true,
    });
  }
}
