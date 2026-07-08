let logger: {
  info: (msg: string, opts?: Record<string, unknown>) => void;
  warn: (msg: string, opts?: Record<string, unknown>) => void;
  error: (msg: string, opts?: Record<string, unknown>) => void;
} | null = null;

function getLogger(scope: string) {
  if (!logger) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const satori = require("@nisoku/satori-log");
      const s = satori.createSatori({ logLevel: "error", enableConsole: true });
      logger = s.createLogger(scope);
    } catch {
      logger = {
        info: (msg: string, opts?: unknown) =>
          console.log(`[${scope}] ${msg}`, opts),
        warn: (msg: string, opts?: unknown) =>
          console.warn(`[${scope}] ${msg}`, opts),
        error: (msg: string, opts?: unknown) =>
          console.error(`[${scope}] ${msg}`, opts),
      };
    }
  }
  return logger;
}

export interface ComponentErrorOptions {
  tag?: string;
  suggestion?: string;
  cause?: string;
}

export function unknownComponentError(
  component: string,
  suggestion?: string,
): void {
  const log = getLogger("sazami");
  log.warn(`Unknown component "${component}", using saz-${component}`, {
    suggest: suggestion,
    tags: ["registry", "warning"],
  });
}

export function propertyError(
  message: string,
  options: ComponentErrorOptions,
): void {
  const log = getLogger("sazami");
  log.error(message, {
    state: { tag: options.tag },
    suggest: options.suggestion,
    cause: options.cause,
    tags: ["component", "error"],
  });
}

export function eventError(
  message: string,
  options: ComponentErrorOptions,
): void {
  const log = getLogger("sazami");
  log.error(message, {
    state: { tag: options.tag },
    suggest: options.suggestion,
    cause: options.cause,
    tags: ["events", "error"],
  });
}

export function renderError(
  message: string,
  options: { suggestion?: string; cause?: string },
): void {
  const log = getLogger("sazami");
  log.error(message, {
    suggest: options.suggestion,
    cause: options.cause,
    tags: ["renderer", "error"],
  });
}

export function bindingError(
  message: string,
  options: { property?: string; suggestion?: string },
): void {
  const log = getLogger("sazami");
  log.error(message, {
    state: { property: options.property },
    suggest: options.suggestion,
    tags: ["binding", "error"],
  });
}
