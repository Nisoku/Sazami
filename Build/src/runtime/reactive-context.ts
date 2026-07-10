import {
  signal,
  derived,
  effect,
  path,
  bindInputValue,
  type Readable,
  type Signal,
} from "@nisoku/sairin";
import type { InterpolatedTextPart } from "@nisoku/sakko";

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getReferencedVars(code: string, knownNames: string[]): string[] {
  return knownNames.filter((name) => {
    if (!/^[A-Za-z_]\w*$/.test(name)) return false;
    const re = new RegExp(`\\b${escapeRegExp(name)}\\b`);
    return re.test(code);
  });
}

function addGetCalls(code: string, varNames: string[]): string {
  const strings: string[] = [];
  let processed = code.replace(/'[^']*'|"[^"]*"/g, (m) => {
    strings.push(m);
    return `__STR${strings.length - 1}__`;
  });

  for (const name of varNames) {
    if (!/^[A-Za-z_]\w*$/.test(name)) continue;
    const escaped = escapeRegExp(name);
    const regex = new RegExp(
      `(?<![A-Za-z0-9_$.])${escaped}(?![A-Za-z0-9_$])(?!\\.get|\\.set|\\s*=(?!=))`,
      "g",
    );
    processed = processed.replace(regex, `${name}.get()`);
  }

  return processed.replace(/__STR(\d+)__/g, (_, i) => strings[+i]);
}

function transformHandlerBody(code: string, varNames: string[]): string {
  let result = code;
  for (const name of varNames) {
    if (!/^[A-Za-z_]\w*$/.test(name)) continue;
    const escaped = escapeRegExp(name);

    result = result.replace(
      new RegExp(`(?<![A-Za-z0-9_$])${escaped}(?![A-Za-z0-9_$])\\+\\+`, "g"),
      `${name}.set(${name}.get() + 1)`,
    );

    result = result.replace(
      new RegExp(`(?<![A-Za-z0-9_$])${escaped}(?![A-Za-z0-9_$])--`, "g"),
      `${name}.set(${name}.get() - 1)`,
    );

    result = result.replace(
      new RegExp(
        `(?<![A-Za-z0-9_$])${escaped}(?![A-Za-z0-9_$])\\s*\\+=\\s*([^;]+)`,
        "g",
      ),
      (_, expr) =>
        `${name}.set(${name}.get() + ${addGetCalls(expr.trim(), varNames)})`,
    );

    result = result.replace(
      new RegExp(
        `(?<![A-Za-z0-9_$])${escaped}(?![A-Za-z0-9_$])\\s*-=\\s*([^;]+)`,
        "g",
      ),
      (_, expr) =>
        `${name}.set(${name}.get() - ${addGetCalls(expr.trim(), varNames)})`,
    );

    result = result.replace(
      new RegExp(
        `(?<![A-Za-z0-9_$])${escaped}(?![A-Za-z0-9_$])\\s*=(?!\\s*=(?!=))\\s*([^;]+)`,
        "g",
      ),
      (_, expr) => {
        if (expr.includes(".set(")) return _;
        return `${name}.set(${addGetCalls(expr.trim(), varNames)})`;
      },
    );
  }

  return addGetCalls(result, varNames);
}

function evaluateStatic(expr: string): unknown {
  const trimmed = expr.trim();
  if (trimmed === "true") return true;
  if (trimmed === "false") return false;
  if (trimmed === "null") return null;
  if (trimmed === "undefined") return undefined;
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    try {
      return JSON.parse(trimmed);
    } catch {
      return trimmed.slice(1, -1);
    }
  }
  if (!isNaN(Number(trimmed)) && trimmed !== "") return Number(trimmed);
  if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
    try {
      return new Function(`return ${trimmed}`)();
    } catch {
      return trimmed;
    }
  }
  return trimmed;
}

type SignalLike = ReturnType<typeof signal> | ReturnType<typeof derived>;

export class ReactiveContext {
  private signals = new Map<string, ReturnType<typeof signal>>();
  private deriveds = new Map<string, ReturnType<typeof derived>>();
  readonly rootName: string;
  private interpCounter = 0;

  constructor(rootName: string) {
    this.rootName = rootName;
  }

  addState(name: string, initialValue: string): void {
    const sig = signal(
      path("component", this.rootName, name),
      evaluateStatic(initialValue),
    );
    this.signals.set(name, sig);
  }

  addDerived(name: string, expr: string): void {
    const allNames = this.getAllSignalNames();
    const refd = getReferencedVars(expr, allNames);

    if (refd.length === 0) {
      const sig = derived(path("component", this.rootName, name), () =>
        evaluateStatic(expr),
      );
      this.deriveds.set(name, sig);
      return;
    }

    const transformed = addGetCalls(expr, refd);
    const fn = new Function(...refd, `return ${transformed}`);
    const sig = derived(path("component", this.rootName, name), () => {
      const signals = refd.map((n) => this.getSignal(n)!);
      return fn(...signals);
    });
    this.deriveds.set(name, sig);
  }

  addEffect(body: string): void {
    const allNames = this.getAllSignalNames();
    const refd = getReferencedVars(body, allNames);

    if (refd.length === 0) {
      effect(() => {
        new Function(body)();
      });
      return;
    }

    const transformed = addGetCalls(body, refd);
    const fn = new Function(...refd, transformed);
    effect(() => {
      const signals = refd.map((n) => this.getSignal(n)!);
      fn(...signals);
    });
  }

  getAllSignalNames(): string[] {
    return [...this.signals.keys(), ...this.deriveds.keys()];
  }

  getSignal(name: string): SignalLike | undefined {
    return this.signals.get(name) ?? this.deriveds.get(name);
  }

  getSignals(): Map<string, SignalLike> {
    const all = new Map<string, SignalLike>();
    for (const [k, v] of this.signals) all.set(k, v);
    for (const [k, v] of this.deriveds) all.set(k, v);
    return all;
  }

  /**
   * Register a read-only signal for `name` in this context.
   * Used by @each to expose the iteration variable to template children.
   */
  setSignalValue(name: string, initial: unknown): void {
    if (this.signals.has(name) || this.deriveds.has(name)) return;
    const sig = signal(
      path("component", this.rootName, `__each_${name}`),
      initial,
    );
    this.signals.set(name, sig);
  }

  /** Create a child context with all parent signals plus a new signal. */
  forkWithSignal(name: string, initial: unknown): ReactiveContext {
    const child = new ReactiveContext(this.rootName);
    child.interpCounter = this.interpCounter;
    for (const [k, v] of this.signals) child.signals.set(k, v);
    for (const [k, v] of this.deriveds) child.deriveds.set(k, v);
    child.setSignalValue(name, initial);
    return child;
  }

  createInterpolated(parts: InterpolatedTextPart[]): Readable<string> {
    const allNames = this.getAllSignalNames();
    const allRefd = new Set<string>();
    const id = this.interpCounter++;

    for (const part of parts) {
      if (part.type === "expr") {
        for (const name of getReferencedVars(part.value, allNames)) {
          allRefd.add(name);
        }
      }
    }

    const refd = [...allRefd];
    const exprFns = parts.map((p) => {
      if (p.type === "text") return null;
      const partRefd = getReferencedVars(p.value, allNames);
      if (partRefd.length === 0) {
        return () => String(evaluateStatic(p.value));
      }
      const transformed = addGetCalls(p.value, partRefd);
      const fn = new Function(...partRefd, `return String(${transformed})`);
      return (signalMap: Record<string, unknown>) =>
        fn(...partRefd.map((n) => signalMap[n]));
    });

    const interpPath = path("component", this.rootName, `__interp_${id}`);

    if (refd.length === 0) {
      const staticVal = parts
        .map((p) =>
          p.type === "text" ? p.value : String(evaluateStatic(p.value)),
        )
        .join("");
      return derived(interpPath, () => staticVal);
    }

    const d = derived(interpPath, () => {
      const signalMap: Record<string, SignalLike> = {};
      for (const name of refd) {
        const sig = this.getSignal(name)!;
        signalMap[name] = sig;
        sig.get();
      }
      return parts
        .map((p, i) => {
          const fn = exprFns[i];
          if (!fn) return (p as { value: string }).value;
          return fn(signalMap);
        })
        .join("");
    });

    return d;
  }

  createEventHandler(handlerBody: string): (e: Event) => void {
    const allNames = this.getAllSignalNames();
    const refd = getReferencedVars(handlerBody, allNames);
    const transformed = transformHandlerBody(handlerBody, refd);

    const fn = new Function(...refd, "e", transformed);
    return (e: Event) => {
      const signals = refd.map((n) => this.getSignal(n)!);
      fn(...signals, e);
    };
  }

  createBindHandler(
    signalName: string,
    elementType: string,
  ): ((el: HTMLElement) => void) | null {
    const sig = this.getSignal(signalName);
    if (!sig) return null;
    const tag = (el: HTMLElement) => el.tagName.toLowerCase();
    return (el: HTMLElement) => {
      const t = tag(el);
      if (t === "saz-checkbox" || t === "saz-switch" || t === "saz-toggle") {
        (el as unknown as Record<string, unknown>).checked = sig;
      } else if (
        t === "saz-input" || t === "saz-select" || t === "saz-textarea"
      ) {
        (el as unknown as Record<string, unknown>).value = sig;
      } else {
        bindInputValue(el as HTMLInputElement, sig as Signal<string>);
      }
    };
  }
}
