const defaultTokens = {
  "color.background": "#ffffff",
  "color.surface": "#f8f9fa",
  "color.surface-hover": "#d6d6d6ff",
  "color.surface-active": "#b0b0b09c",
  "color.border": "#e0e0e0",
  "color.primary": "#2563eb",
  "color.accent": "#ff4d8a",
  "color.success": "#10b981",
  "color.danger": "#ef4444",
  "color.secondary": "#6b7280",
  "color.text": "#1f2937",
  "color.text-dim": "#6b7280",
  "color.text-dimmer": "#9ca3af",
  "color.on-accent": "#ffffff",
  "color.on-primary": "#ffffff",
  "color.on-secondary": "#1f2937",
  "color.on-success": "#ffffff",
  "color.on-danger": "#ffffff",
  "space.xsmall": "2px",
  "space.tiny": "4px",
  "space.small": "8px",
  "space.medium": "12px",
  "space.large": "16px",
  "space.xlarge": "24px",
  "space.xxlarge": "32px",
  "font.family": '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  "text.size.small": "12px",
  "text.size.medium": "14px",
  "text.size.large": "16px",
  "text.size.xlarge": "20px",
  "text.size.xsmall": "10px",
  "text.size.tiny": "11px",
  "text.weight.light": "300",
  "text.weight.normal": "400",
  "text.weight.medium": "500",
  "text.weight.bold": "700",
  "text.leading.tight": "1.25",
  "text.leading.normal": "1.5",
  "text.leading.loose": "1.75",
  "radius.none": "0px",
  "radius.soft": "4px",
  "radius.medium": "8px",
  "radius.strong": "12px",
  "radius.round": "9999px",
  "shadow.soft": "0 1px 3px rgba(0,0,0,0.1)",
  "shadow.medium": "0 4px 6px rgba(0,0,0,0.1)",
  "shadow.strong": "0 10px 15px rgba(0,0,0,0.1)",
  "icon.size.small": "16px",
  "icon.size.medium": "20px",
  "icon.size.large": "24px",
  "icon.size.xlarge": "32px",
  "icon.size.xsmall": "12px"
};
function generateCSSVariables(tokens) {
  const entries = Object.entries(tokens);
  if (entries.length === 0) return "";
  const lines = entries.map(([key, value]) => {
    const cssVar = `--saz-${key.replace(/\./g, "-")}`;
    return `  ${cssVar}: ${value};`;
  });
  return `:root {
${lines.join("\n")}
}`;
}
function generateThemeCSS(customTokens) {
  const merged = { ...defaultTokens, ...customTokens || {} };
  return generateCSSVariables(merged);
}
function getTokenValue(key, customTokens) {
  if (customTokens && key in customTokens) {
    return customTokens[key];
  }
  return defaultTokens[key];
}
const MODIFIER_MAP = {
  accent: { variant: "accent" },
  primary: { variant: "primary" },
  secondary: { variant: "secondary" },
  danger: { variant: "danger" },
  success: { variant: "success" },
  dim: { tone: "dim", variant: "dim" },
  small: { size: "small" },
  medium: { size: "medium" },
  large: { size: "large" },
  xlarge: { size: "xlarge" },
  tiny: { size: "tiny" },
  bold: { weight: "bold" },
  normal: { weight: "normal" },
  light: { weight: "light" },
  round: { shape: "round" },
  square: { shape: "square" },
  pill: { shape: "pill" },
  row: { layout: "row" },
  column: { layout: "column" },
  center: { align: "center" },
  "space-between": { justify: "space-between" },
  curved: { curved: true },
  flat: { curved: false },
  disabled: { disabled: true },
  active: { active: true },
  loading: { loading: true },
  checked: { checked: true },
  selected: { selected: true },
  removable: { removable: true },
  "center-point": { "center-point": true },
  vertical: { vertical: true },
  wrap: { wrap: true },
  indeterminate: { indeterminate: true },
  heading: { heading: true },
  open: { open: true }
};
function parseModifiers(modifiers) {
  const props = {};
  modifiers.forEach((mod) => {
    if (mod.type === "flag") {
      const mapping = MODIFIER_MAP[mod.value];
      if (mapping) {
        Object.assign(props, mapping);
      } else {
        throw new Error(
          `Unknown modifier "${mod.value}". Valid modifiers: ${Object.keys(MODIFIER_MAP).join(", ")}`
        );
      }
    } else if (mod.type === "pair") {
      props[mod.key] = mod.value;
    } else {
      throw new Error(
        `Unknown modifier type "${mod.type}". Expected "flag" or "pair". Modifier: ${JSON.stringify(mod)}`
      );
    }
  });
  return props;
}
let logger$1 = null;
function getLogger$1(scope) {
  if (!logger$1) {
    try {
      const satori = require("@nisoku/satori-log");
      const s = satori.createSatori({ logLevel: "error", enableConsole: true });
      logger$1 = s.createLogger(scope);
    } catch {
      logger$1 = {
        info: (msg, opts) => console.log(`[${scope}] ${msg}`, opts),
        warn: (msg, opts) => console.warn(`[${scope}] ${msg}`, opts),
        error: (msg, opts) => console.error(`[${scope}] ${msg}`, opts)
      };
    }
  }
  return logger$1;
}
function unknownComponentError(component2, suggestion) {
  const log = getLogger$1("sazami");
  log.warn(`Unknown component "${component2}", using saz-${component2}`, {
    suggest: suggestion,
    tags: ["registry", "warning"]
  });
}
function eventError(message, options) {
  const log = getLogger$1("sazami");
  log.error(message, {
    state: { tag: options.tag },
    suggest: options.suggestion,
    cause: options.cause,
    tags: ["events", "error"]
  });
}
function renderError(message, options) {
  const log = getLogger$1("sazami");
  log.error(message, {
    suggest: options.suggestion,
    cause: options.cause,
    tags: ["renderer", "error"]
  });
}
function bindingError(message, options) {
  const log = getLogger$1("sazami");
  log.error(message, {
    state: { property: options.property },
    suggest: options.suggestion,
    tags: ["binding", "error"]
  });
}
var globalActiveComputation = null;
function getGlobalActiveComputation() {
  return globalActiveComputation;
}
function setGlobalActiveComputation(computation) {
  globalActiveComputation = computation;
}
var uniqueIdCounter = 0;
var uniqueIdRandom = Math.random().toString(36).slice(2, 8);
function generateUniqueId() {
  uniqueIdCounter++;
  return `${uniqueIdRandom}${uniqueIdCounter.toString(36)}`;
}
var M = class {
  constructor(e) {
    this.config = e;
  }
  eventTimestamps = [];
  buffer = [];
  droppedCount = 0;
  sampledCount = 0;
  /**
   * Check if an event should be allowed through
   * Returns: { allowed: boolean, sampled?: boolean }
   */
  shouldAllow(e) {
    if (!this.config.enabled)
      return { allowed: true, sampled: false };
    const t = Date.now();
    if (this.eventTimestamps = this.eventTimestamps.filter((r) => t - r < 1e3), this.eventTimestamps.length < this.config.maxEventsPerSecond)
      return this.eventTimestamps.push(t), { allowed: true, sampled: false };
    switch (this.config.strategy) {
      case "drop":
        return this.droppedCount++, { allowed: false, sampled: false };
      case "sample":
        return Math.random() < this.config.samplingRate ? (this.eventTimestamps.push(t), this.sampledCount++, { allowed: true, sampled: true }) : (this.droppedCount++, { allowed: false, sampled: false });
      case "buffer":
        return this.buffer.length < (this.config.bufferSize || 100) ? this.buffer.push(e) : this.droppedCount++, { allowed: false, sampled: false };
      default:
        return { allowed: true, sampled: false };
    }
  }
  /**
   * Get buffered events and clear the buffer
   */
  flushBuffer() {
    const e = [...this.buffer];
    return this.buffer = [], e;
  }
  /**
   * Get current rate (events per second)
   */
  getCurrentRate() {
    const e = Date.now();
    return this.eventTimestamps = this.eventTimestamps.filter((t) => e - t < 1e3), this.eventTimestamps.length;
  }
  /**
   * Get statistics
   */
  getStats() {
    return {
      dropped: this.droppedCount,
      sampled: this.sampledCount,
      buffered: this.buffer.length,
      currentRate: this.getCurrentRate()
    };
  }
  /**
   * Reset statistics
   */
  reset() {
    this.eventTimestamps = [], this.buffer = [], this.droppedCount = 0, this.sampledCount = 0;
  }
  /**
   * Update configuration
   */
  updateConfig(e) {
    this.config = { ...this.config, ...e };
  }
};
function g(s, e, t = /* @__PURE__ */ new WeakMap()) {
  if (s === e) return true;
  if (typeof s == "number" && typeof e == "number")
    return Number.isNaN(s) && Number.isNaN(e) ? true : s === e;
  if (s === null || e === null || s === void 0 || e === void 0) return s === e;
  if (typeof s != typeof e || typeof s != "object") return false;
  const i = s, r = e;
  if (t.has(i))
    return t.get(i) === r;
  if (t.set(i, r), s instanceof Date && e instanceof Date)
    return s.getTime() === e.getTime();
  if (s instanceof Date || e instanceof Date) return false;
  if (s instanceof RegExp && e instanceof RegExp)
    return s.source === e.source && s.flags === e.flags;
  if (s instanceof RegExp || e instanceof RegExp) return false;
  if (s instanceof Map && e instanceof Map) {
    if (s.size !== e.size) return false;
    for (const [c, l] of s)
      if (!e.has(c) || !g(l, e.get(c), t)) return false;
    return true;
  }
  if (s instanceof Map || e instanceof Map) return false;
  if (s instanceof Set && e instanceof Set) {
    if (s.size !== e.size) return false;
    const c = Array.from(s), l = Array.from(e);
    for (const u of c) {
      let d = false;
      for (const h of l)
        if (g(u, h, t)) {
          d = true;
          break;
        }
      if (!d) return false;
    }
    return true;
  }
  if (s instanceof Set || e instanceof Set) return false;
  if (Array.isArray(s) && Array.isArray(e)) {
    if (s.length !== e.length) return false;
    const c = Object.keys(s).filter((h) => /^\d+$/.test(h)).map(Number), l = Object.keys(e).filter((h) => /^\d+$/.test(h)).map(Number);
    if (c.length !== l.length) return false;
    for (const h of c)
      if (!l.includes(h)) return false;
    for (let h = 0; h < s.length; h++) {
      const T = Object.prototype.hasOwnProperty.call(s, h), $ = Object.prototype.hasOwnProperty.call(e, h);
      if (T !== $ || T && !g(s[h], e[h], t)) return false;
    }
    const u = Object.keys(s).filter((h) => !/^\d+$/.test(h)), d = Object.keys(e).filter((h) => !/^\d+$/.test(h));
    if (u.length !== d.length) return false;
    for (const h of u)
      if (!Object.prototype.hasOwnProperty.call(e, h) || !g(s[h], e[h], t)) return false;
    return true;
  }
  if (Array.isArray(s) !== Array.isArray(e)) return false;
  const n = s, o = e, a = Object.keys(n), f = Object.keys(o);
  if (a.length !== f.length) return false;
  for (const c of a)
    if (!Object.prototype.hasOwnProperty.call(o, c) || !g(n[c], o[c], t)) return false;
  return true;
}
function p(s, e = /* @__PURE__ */ new WeakMap()) {
  if (s == null || typeof s != "object") return s;
  const t = s;
  if (e.has(t))
    return e.get(t);
  if (s instanceof Date)
    return new Date(s.getTime());
  if (s instanceof RegExp)
    return new RegExp(s.source, s.flags);
  if (s instanceof Map) {
    const r = /* @__PURE__ */ new Map();
    e.set(t, r);
    for (const [n, o] of s)
      r.set(p(n, e), p(o, e));
    return r;
  }
  if (s instanceof Set) {
    const r = /* @__PURE__ */ new Set();
    e.set(t, r);
    for (const n of s)
      r.add(p(n, e));
    return r;
  }
  if (Array.isArray(s)) {
    const r = [];
    e.set(t, r);
    for (let n = 0; n < s.length; n++)
      Object.prototype.hasOwnProperty.call(s, n) && (r[n] = p(s[n], e));
    for (const n of Object.keys(s))
      /^\d+$/.test(n) || (r[n] = p(s[n], e));
    return r;
  }
  const i = {};
  e.set(t, i);
  for (const r of Object.keys(s))
    i[r] = p(s[r], e);
  return i;
}
function b(s, e = /* @__PURE__ */ new WeakSet()) {
  return s === null ? "null" : s === void 0 ? "undefined" : typeof s == "string" ? `s:${s}` : typeof s == "number" ? Number.isNaN(s) ? "n:NaN" : `n:${s}` : typeof s == "boolean" ? `b:${s}` : typeof s != "object" ? String(s) : e.has(s) ? "[Circular]" : (e.add(s), s instanceof Date ? `d:${s.getTime()}` : s instanceof RegExp ? `r:${s.source}:${s.flags}` : s instanceof Map ? `m:{${Array.from(s.entries()).map(([r, n]) => `${b(r, e)}=>${b(n, e)}`).sort().join(",")}}` : s instanceof Set ? `set:{${Array.from(s).map((r) => b(r, e)).sort().join(",")}}` : Array.isArray(s) ? `a:[${s.map((r, n) => Object.prototype.hasOwnProperty.call(s, n) ? b(r, e) : "<empty>").join(",")}]` : `o:{${Object.entries(s).sort(([i], [r]) => i.localeCompare(r)).map(([i, r]) => `${i}:${b(r, e)}`).join(",")}}`);
}
var F = class {
  constructor(e) {
    this.config = e;
  }
  cache = /* @__PURE__ */ new Map();
  deduplicatedCount = 0;
  /**
   * Compute a deduplication key for an entry based on configured fields
   */
  computeDedupKey(e) {
    const t = [];
    for (const i of this.config.fields)
      switch (i) {
        case "message":
          t.push(`m:${e.message}`);
          break;
        case "scope":
          t.push(`s:${e.scope}`);
          break;
        case "level":
          t.push(`l:${e.level}`);
          break;
        case "tags":
          t.push(`t:${e.tags.sort().join(",")}`);
          break;
        case "state":
          e.state && t.push(`st:${b(e.state)}`);
          break;
      }
    return t.join("|");
  }
  /**
   * Check if an event is a duplicate
   * Returns: { isDuplicate: boolean, originalId?: string, duplicateCount: number }
   */
  isDuplicate(e) {
    if (!this.config.enabled)
      return { isDuplicate: false, duplicateCount: 0 };
    const t = Date.now(), i = this.computeDedupKey(e);
    this.cleanExpired(t);
    const r = this.cache.get(i);
    return r && t - r.timestamp < this.config.windowMs ? (r.count++, this.deduplicatedCount++, { isDuplicate: true, duplicateCount: r.count }) : (this.cache.set(i, {
      hash: i,
      timestamp: t,
      count: 1
    }), this.cache.size > this.config.maxCacheSize && this.evictOldest(), { isDuplicate: false, duplicateCount: 1 });
  }
  /**
   * Clean expired entries from cache
   */
  cleanExpired(e) {
    for (const [t, i] of this.cache.entries())
      e - i.timestamp >= this.config.windowMs && this.cache.delete(t);
  }
  /**
   * Evict oldest entries when cache is full
   */
  evictOldest() {
    let e = null, t = 1 / 0;
    for (const [i, r] of this.cache.entries())
      r.timestamp < t && (t = r.timestamp, e = i);
    e && this.cache.delete(e);
  }
  /**
   * Get statistics
   */
  getStats() {
    return {
      cacheSize: this.cache.size,
      deduplicatedCount: this.deduplicatedCount
    };
  }
  /**
   * Reset the deduplicator
   */
  reset() {
    this.cache.clear(), this.deduplicatedCount = 0;
  }
  /**
   * Update configuration
   */
  updateConfig(e) {
    this.config = { ...this.config, ...e };
  }
};
var I = class {
  constructor(e, t = {}) {
    this.config = e, this.events = t;
  }
  state = "closed";
  failureCount = 0;
  successCount = 0;
  lastFailureTime = 0;
  totalFailures = 0;
  totalSuccesses = 0;
  /**
   * Execute a function with circuit breaker protection
   */
  async execute(e) {
    if (!this.config.enabled)
      return e();
    if (!this.canExecute())
      throw new L("Circuit breaker is open");
    try {
      const t = await e();
      return this.recordSuccess(), t;
    } catch (t) {
      throw this.recordFailure(
        t instanceof Error ? t : new Error(String(t))
      ), t;
    }
  }
  /**
   * Execute synchronously with circuit breaker protection
   */
  executeSync(e) {
    if (!this.config.enabled)
      return e();
    if (!this.canExecute())
      throw new L("Circuit breaker is open");
    try {
      const t = e();
      return this.recordSuccess(), t;
    } catch (t) {
      throw this.recordFailure(
        t instanceof Error ? t : new Error(String(t))
      ), t;
    }
  }
  /**
   * Check if execution is allowed
   */
  canExecute() {
    return this.state === "closed" ? true : this.state === "open" ? Date.now() - this.lastFailureTime >= this.config.resetTimeout ? (this.transitionTo("half-open"), true) : false : true;
  }
  /**
   * Record a successful execution
   */
  recordSuccess() {
    this.totalSuccesses++, this.events.onSuccess?.(this.successCount + 1), this.state === "half-open" ? (this.successCount++, this.successCount >= this.config.successThreshold && this.transitionTo("closed")) : this.state === "closed" && (this.failureCount = 0);
  }
  /**
   * Record a failed execution
   */
  recordFailure(e) {
    this.totalFailures++, this.failureCount++, this.lastFailureTime = Date.now(), this.events.onFailure?.(e, this.failureCount), this.state === "half-open" ? this.transitionTo("open") : this.state === "closed" && this.failureCount >= this.config.failureThreshold && this.transitionTo("open");
  }
  /**
   * Transition to a new state
   */
  transitionTo(e) {
    const t = this.state;
    this.state = e, e === "closed" ? (this.failureCount = 0, this.successCount = 0, this.events.onClose?.()) : e === "open" ? (this.successCount = 0, this.events.onOpen?.()) : e === "half-open" && (this.successCount = 0, this.events.onHalfOpen?.()), this.events.onStateChange?.(e, t);
  }
  /**
   * Get current state
   */
  getState() {
    return this.state;
  }
  /**
   * Get statistics
   */
  getStats() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      totalFailures: this.totalFailures,
      totalSuccesses: this.totalSuccesses,
      lastFailureTime: this.lastFailureTime
    };
  }
  /**
   * Manually reset the circuit breaker
   */
  reset() {
    this.transitionTo("closed"), this.failureCount = 0, this.successCount = 0, this.totalFailures = 0, this.totalSuccesses = 0, this.lastFailureTime = 0;
  }
  /**
   * Force the circuit open (for testing/manual intervention)
   */
  forceOpen() {
    this.transitionTo("open"), this.lastFailureTime = Date.now();
  }
  /**
   * Force the circuit closed (for testing/manual intervention)
   */
  forceClose() {
    this.transitionTo("closed");
  }
};
var L = class extends Error {
  constructor(e) {
    super(e), this.name = "CircuitOpenError";
  }
};
var C = class {
  startTime;
  totalPublished = 0;
  totalDropped = 0;
  totalSampled = 0;
  totalDeduplicated = 0;
  recentEvents = [];
  loggerCount = 0;
  watcherCount = 0;
  subscriberCount = 0;
  bufferSize = 0;
  circuitState = "closed";
  // For tracking events per second
  eventTimestamps = [];
  // Historical snapshots for trending
  snapshots = [];
  maxSnapshots = 60;
  // Keep last 60 snapshots (e.g., 1 per second = 1 minute)
  constructor() {
    this.startTime = Date.now();
  }
  /**
   * Record a published event
   */
  recordPublished() {
    this.totalPublished++;
    const e = Date.now();
    this.eventTimestamps.push(e), this.eventTimestamps = this.eventTimestamps.filter((t) => e - t < 1e3);
  }
  /**
   * Record a dropped event
   */
  recordDropped() {
    this.totalDropped++;
  }
  /**
   * Record a sampled event
   */
  recordSampled() {
    this.totalSampled++;
  }
  /**
   * Record a deduplicated event
   */
  recordDeduplicated() {
    this.totalDeduplicated++;
  }
  /**
   * Update logger count
   */
  setLoggerCount(e) {
    this.loggerCount = e;
  }
  /**
   * Update watcher count
   */
  setWatcherCount(e) {
    this.watcherCount = e;
  }
  /**
   * Update subscriber count
   */
  setSubscriberCount(e) {
    this.subscriberCount = e;
  }
  /**
   * Update buffer size
   */
  setBufferSize(e) {
    this.bufferSize = e;
  }
  /**
   * Update circuit state
   */
  setCircuitState(e) {
    this.circuitState = e;
  }
  /**
   * Get current events per second
   */
  getEventsPerSecond() {
    const e = Date.now();
    return this.eventTimestamps = this.eventTimestamps.filter((t) => e - t < 1e3), this.eventTimestamps.length;
  }
  /**
   * Get current bus metrics
   */
  getBusMetrics() {
    return {
      totalPublished: this.totalPublished,
      totalDropped: this.totalDropped,
      totalSampled: this.totalSampled,
      totalDeduplicated: this.totalDeduplicated,
      eventsPerSecond: this.getEventsPerSecond(),
      bufferSize: this.bufferSize,
      subscriberCount: this.subscriberCount
    };
  }
  /**
   * Get full Satori metrics
   */
  getMetrics() {
    return {
      bus: this.getBusMetrics(),
      loggerCount: this.loggerCount,
      watcherCount: this.watcherCount,
      circuitState: this.circuitState,
      uptime: Date.now() - this.startTime
    };
  }
  /**
   * Take a snapshot for historical tracking
   */
  takeSnapshot() {
    const e = {
      timestamp: Date.now(),
      bus: this.getBusMetrics(),
      loggerCount: this.loggerCount,
      watcherCount: this.watcherCount,
      circuitState: this.circuitState,
      uptime: Date.now() - this.startTime
    };
    return this.snapshots.push(e), this.snapshots.length > this.maxSnapshots && (this.snapshots = this.snapshots.slice(-this.maxSnapshots)), e;
  }
  /**
   * Get historical snapshots
   */
  getSnapshots() {
    return [...this.snapshots];
  }
  /**
   * Get average events per second over time
   */
  getAverageEventsPerSecond() {
    return this.snapshots.length === 0 ? 0 : this.snapshots.reduce(
      (t, i) => t + i.bus.eventsPerSecond,
      0
    ) / this.snapshots.length;
  }
  /**
   * Reset all metrics
   */
  reset() {
    this.startTime = Date.now(), this.totalPublished = 0, this.totalDropped = 0, this.totalSampled = 0, this.totalDeduplicated = 0, this.eventTimestamps = [], this.snapshots = [];
  }
};
var k = {
  enabled: false,
  maxEventsPerSecond: 1e3,
  samplingRate: 0.1,
  strategy: "sample",
  bufferSize: 100
};
var B = {
  enabled: false,
  windowMs: 5e3,
  fields: ["message", "scope", "level"],
  maxCacheSize: 1e3
};
var E = {
  enabled: false,
  failureThreshold: 5,
  resetTimeout: 3e4,
  successThreshold: 3
};
var y = {
  enableCallsite: true,
  enableEnvInfo: true,
  enableStateSnapshot: false,
  enableCausalLinks: true,
  enableMetrics: true,
  enableConsole: true,
  stateSelectors: [],
  maxBufferSize: 1e3,
  logLevel: "info",
  appVersion: "1.0.0",
  pollingInterval: 250,
  // More reasonable default
  customLevels: [],
  rateLimiting: k,
  deduplication: B,
  circuitBreaker: E
};
var R = class {
  subscribers = [];
  middleware = [];
  buffer = [];
  maxBufferSize;
  rateLimiter;
  deduplicator;
  circuitBreaker;
  metrics;
  enableMetrics;
  constructor(e = {}) {
    typeof e == "number" && (e = { maxBufferSize: e }), this.maxBufferSize = e.maxBufferSize || 1e3, this.enableMetrics = e.enableMetrics ?? true, this.rateLimiter = new M({
      ...k,
      ...e.rateLimiting
    }), this.deduplicator = new F({
      ...B,
      ...e.deduplication
    }), this.circuitBreaker = new I(
      {
        ...E,
        ...e.circuitBreaker
      },
      {
        onStateChange: (t) => {
          this.enableMetrics && this.metrics.setCircuitState(t);
        }
      }
    ), this.metrics = new C();
  }
  publish(e) {
    if (!e.__internal?.isReplay && !e.skipDedup && this.deduplicator.isDuplicate(e).isDuplicate) {
      this.enableMetrics && this.metrics.recordDeduplicated();
      return;
    }
    if (!e.__internal?.isReplay && !e.skipRateLimit) {
      const t = this.rateLimiter.shouldAllow(e);
      if (!t.allowed) {
        this.enableMetrics && this.metrics.recordDropped();
        return;
      }
      t.sampled && (e.__internal = e.__internal || {}, e.__internal.sampled = true, this.enableMetrics && this.metrics.recordSampled());
    }
    try {
      this.circuitBreaker.executeSync(() => {
        this.doPublish(e);
      }), this.enableMetrics && (this.metrics.recordPublished(), this.metrics.setBufferSize(this.buffer.length), this.metrics.setSubscriberCount(this.subscribers.length));
    } catch {
      this.enableMetrics && this.metrics.recordDropped();
    }
  }
  doPublish(e) {
    let t = 0;
    const i = () => {
      if (t >= this.middleware.length) {
        this.subscribers.forEach((n) => n(e)), this.addToBuffer(e);
        return;
      }
      const r = this.middleware[t];
      t++, r(e, i);
    };
    i();
  }
  subscribe(e) {
    return this.subscribers.push(e), this.enableMetrics && this.metrics.setSubscriberCount(this.subscribers.length), () => {
      const t = this.subscribers.indexOf(e);
      t >= 0 && (this.subscribers.splice(t, 1), this.enableMetrics && this.metrics.setSubscriberCount(this.subscribers.length));
    };
  }
  use(e) {
    this.middleware.push(e);
  }
  getReplayBuffer() {
    return [...this.buffer];
  }
  getMetrics() {
    return this.metrics.getBusMetrics();
  }
  /**
   * Get the rate limiter instance for advanced configuration
   */
  getRateLimiter() {
    return this.rateLimiter;
  }
  /**
   * Get the deduplicator instance for advanced configuration
   */
  getDeduplicator() {
    return this.deduplicator;
  }
  /**
   * Get the circuit breaker instance for advanced configuration
   */
  getCircuitBreaker() {
    return this.circuitBreaker;
  }
  /**
   * Clear the event buffer
   */
  clearBuffer() {
    this.buffer.length = 0, this.enableMetrics && this.metrics.setBufferSize(0);
  }
  /**
   * Reset all state
   */
  reset() {
    this.buffer.length = 0, this.middleware.length = 0, this.rateLimiter.reset(), this.deduplicator.reset(), this.circuitBreaker.reset(), this.metrics.reset();
  }
  addToBuffer(e) {
    this.buffer.push(e), this.buffer.length > this.maxBufferSize && this.buffer.shift();
  }
};
var A = 0;
var N = Date.now().toString(36);
function O() {
  return `${N}-${++A}`;
}
function z() {
  return Date.now();
}
function j(s = 2) {
  try {
    const e = new Error().stack;
    if (!e) return;
    const i = e.split(`
`)[s];
    if (!i) return;
    const r = i.match(/at\s+(.+?)\s+\((.+?):(\d+):(\d+)\)/) || i.match(/at\s+(.+?):(\d+):(\d+)/);
    if (r) {
      const [, n, o, a, f] = r;
      return `${o}:${a}:${f}${n ? ` (${n})` : ""}`;
    }
    return i.trim();
  } catch {
    return;
  }
}
function P() {
  return typeof globalThis < "u" && "Deno" in globalThis ? "deno" : typeof globalThis < "u" && "Bun" in globalThis ? "bun" : typeof globalThis < "u" && "caches" in globalThis && typeof globalThis.caches == "object" && !("window" in globalThis) ? "cloudflare-workers" : typeof globalThis < "u" && "EdgeRuntime" in globalThis ? "edge" : typeof window < "u" && typeof document < "u" ? "browser" : typeof process < "u" && process.versions && process.versions.node ? "node" : "unknown";
}
function V(s) {
  const e = P(), t = {
    platform: e,
    appVersion: s.appVersion
  };
  switch (e) {
    case "browser":
      typeof navigator < "u" && (t.userAgent = navigator.userAgent), typeof window < "u" && (t.url = window.location?.href, typeof document < "u" && (t.referrer = document.referrer));
      break;
    case "node":
      typeof process < "u" && (t.nodeVersion = process.version, t.arch = process.arch, process.env.NODE_ENV && (t.nodeEnv = process.env.NODE_ENV));
      break;
    case "deno":
      try {
        const i = globalThis.Deno;
        i?.version && (t.denoVersion = i.version.deno, t.v8Version = i.version.v8, t.typescriptVersion = i.version.typescript), i?.build && (t.os = i.build.os, t.arch = i.build.arch);
      } catch {
      }
      break;
    case "bun":
      try {
        const i = globalThis.Bun;
        i?.version && (t.bunVersion = i.version), i?.revision && (t.bunRevision = i.revision);
      } catch {
      }
      break;
    case "cloudflare-workers":
      t.runtime = "cloudflare-workers";
      break;
    case "edge":
      try {
        const i = globalThis.EdgeRuntime;
        t.edgeRuntime = i;
      } catch {
      }
      break;
  }
  return t;
}
function _(s) {
  if (!s.stateSelectors || s.stateSelectors.length === 0)
    return;
  const e = {};
  for (let t = 0; t < s.stateSelectors.length; t++) {
    const i = s.stateSelectors[t], r = typeof i == "function" ? i : i.selector, n = typeof i == "function" ? `selector_${t}` : i.name || `selector_${t}`;
    try {
      const o = r();
      o != null && (e[n] = p(o));
    } catch (o) {
      e[`${n}_error`] = o instanceof Error ? o.message : String(o);
    }
  }
  return Object.keys(e).length > 0 ? e : void 0;
}
var W = class {
  nodes = /* @__PURE__ */ new Map();
  scopeLastEvent = /* @__PURE__ */ new Map();
  globalLastEvent;
  maxNodes = 1e4;
  /**
   * Add a new event to the causal graph
   */
  addEvent(e, t, i) {
    const r = {
      eventId: e,
      scope: t,
      timestamp: Date.now(),
      causes: i || [],
      effects: []
    };
    if (i)
      for (const n of i) {
        const o = this.nodes.get(n);
        o && o.effects.push(e);
      }
    this.nodes.set(e, r), this.scopeLastEvent.set(t, e), this.globalLastEvent = e, this.nodes.size > this.maxNodes && this.pruneOldest(Math.floor(this.maxNodes * 0.1));
  }
  /**
   * Get the causal link for a new event
   */
  getCausalLink(e, t) {
    return t || this.scopeLastEvent.get(e) || this.globalLastEvent;
  }
  /**
   * Get all causes (direct and transitive) for an event
   */
  getCauses(e, t = 1 / 0) {
    const i = /* @__PURE__ */ new Set(), r = /* @__PURE__ */ new Set(), n = (o, a) => {
      if (r.has(o) || a > t) return;
      r.add(o);
      const f = this.nodes.get(o);
      if (f)
        for (const c of f.causes)
          i.add(c), n(c, a + 1);
    };
    return n(e, 0), Array.from(i);
  }
  /**
   * Get all effects (direct and transitive) for an event
   */
  getEffects(e, t = 1 / 0) {
    const i = /* @__PURE__ */ new Set(), r = /* @__PURE__ */ new Set(), n = (o, a) => {
      if (r.has(o) || a > t) return;
      r.add(o);
      const f = this.nodes.get(o);
      if (f)
        for (const c of f.effects)
          i.add(c), n(c, a + 1);
    };
    return n(e, 0), Array.from(i);
  }
  /**
   * Get the causal chain from root to an event
   */
  getCausalChain(e) {
    const t = [];
    let i = e;
    const r = /* @__PURE__ */ new Set();
    for (; i && !r.has(i); ) {
      r.add(i), t.unshift(i);
      const n = this.nodes.get(i);
      if (!n || n.causes.length === 0) break;
      i = n.causes[0];
    }
    return t;
  }
  /**
   * Get node information
   */
  getNode(e) {
    return this.nodes.get(e);
  }
  /**
   * Check if two events are causally related
   */
  areCausallyRelated(e, t) {
    const i = this.getCauses(e), r = this.getEffects(e);
    return i.includes(t) || r.includes(t);
  }
  /**
   * Get events in the same scope
   */
  getEventsByScope(e) {
    const t = [];
    for (const [i, r] of this.nodes)
      r.scope === e && t.push(i);
    return t;
  }
  /**
   * Prune oldest nodes to stay within memory limits
   */
  pruneOldest(e) {
    const t = Array.from(this.nodes.entries()).sort(([, i], [, r]) => i.timestamp - r.timestamp).slice(0, e);
    for (const [i] of t) {
      const r = this.nodes.get(i);
      if (r) {
        for (const n of r.causes) {
          const o = this.nodes.get(n);
          o && (o.effects = o.effects.filter((a) => a !== i));
        }
        for (const n of r.effects) {
          const o = this.nodes.get(n);
          o && (o.causes = o.causes.filter((a) => a !== i));
        }
      }
      this.nodes.delete(i);
    }
  }
  /**
   * Clear all causal links
   */
  clear() {
    this.nodes.clear(), this.scopeLastEvent.clear(), this.globalLastEvent = void 0;
  }
  /**
   * Get statistics about the causal graph
   */
  getStats() {
    let e = 0, t = 0;
    for (const r of this.nodes.values())
      e += r.causes.length, t += r.effects.length;
    const i = this.nodes.size || 1;
    return {
      nodeCount: this.nodes.size,
      avgCauses: e / i,
      avgEffects: t / i
    };
  }
};
var m = new W();
var x = /* @__PURE__ */ new Map();
function K(s, e) {
  return m.getCausalLink(s, e);
}
function H(s, e, t) {
  m.addEvent(e, s, t), x.set(s, e);
}
function G(s, e, t) {
  const i = O(), r = z(), n = [...s.inheritedTags || [], ...s.options?.tags || []], o = {
    id: i,
    timestamp: r,
    level: s.level,
    scope: s.scope,
    message: s.message,
    tags: n,
    cause: s.inheritedCause || s.options?.cause,
    causeEventId: s.inheritedCauseEventId || s.options?.causeEventId,
    suggest: s.options?.suggest
  };
  if (s.options?.state && (o.state = { ...s.options.state }), e.enableCallsite && !o.__internal?.isReplay && (o.callsite = j(4)), e.enableEnvInfo && !o.__internal?.isReplay && (o.env = V(e)), e.enableStateSnapshot && !o.__internal?.isReplay) {
    const a = _(e);
    a && (o.state = { ...o.state, ...a });
  }
  if (e.enableCausalLinks && !o.__internal?.isReplay) {
    const a = K(s.scope, t);
    a && (o.previousEventId = a);
  }
  return o;
}
var U = class {
  constructor(e, t) {
    this.logger = e, this.config = t, this.circuitBreaker = new I(
      {
        ...E,
        enabled: t.circuitBreaker?.enabled ?? false,
        ...t.circuitBreaker
      },
      {
        onOpen: () => {
          this.logger.warn(
            "WatcherEngine circuit breaker opened: too many errors",
            {
              tags: ["watcher", "circuit-breaker"]
            }
          );
        },
        onClose: () => {
          this.logger.info("WatcherEngine circuit breaker closed: recovered", {
            tags: ["watcher", "circuit-breaker"]
          });
        }
      }
    );
  }
  watchers = /* @__PURE__ */ new Map();
  whenHandlers = /* @__PURE__ */ new Map();
  circuitBreaker;
  disposed = false;
  watch(e, t) {
    if (this.disposed)
      throw new Error("WatcherEngine has been disposed");
    const i = this.generateId(), r = typeof e == "function" ? e : () => e, n = {
      id: i,
      getValue: r,
      label: t,
      lastValue: void 0,
      errorCount: 0,
      disposed: false
    }, o = () => {
      if (!(n.disposed || this.disposed))
        try {
          this.circuitBreaker.executeSync(() => {
            const f = r();
            if (!g(f, n.lastValue)) {
              const c = t || `watch_${i}`;
              let l;
              if (typeof f == "object" && f !== null)
                l = `${c}: state changed`;
              else {
                const u = this.formatValue(n.lastValue), d = this.formatValue(f);
                l = `${c}: ${u} -> ${d}`;
              }
              this.logger.info(l, {
                tags: ["watch"],
                state: {
                  [`${c}_prev`]: p(n.lastValue),
                  [`${c}_current`]: p(f)
                }
              }), n.lastValue = p(f);
            }
            n.errorCount = 0;
          });
        } catch (f) {
          n.errorCount++, (n.errorCount <= 3 || n.errorCount % 10 === 0) && this.logger.error(
            `Watch error for ${t || i} (count: ${n.errorCount})`,
            {
              tags: ["watch", "error"],
              state: {
                error: f instanceof Error ? f.message : String(f)
              }
            }
          ), n.errorCount >= 50 && (this.logger.error(
            `Watch ${t || i} disposed due to repeated errors`,
            {
              tags: ["watch", "error", "auto-disposed"]
            }
          ), this.disposeWatcher(i));
        }
    };
    o();
    const a = setInterval(o, this.config.pollingInterval || 250);
    return n.intervalId = a, this.watchers.set(i, n), {
      dispose: () => this.disposeWatcher(i)
    };
  }
  when(e, t, i) {
    if (this.disposed)
      throw new Error("WatcherEngine has been disposed");
    const r = this.generateId(), n = typeof e == "function" ? e : () => e, o = {
      id: r,
      getValue: n,
      predicate: t,
      onTrigger: i,
      lastValue: void 0,
      intervalId: null,
      errorCount: 0,
      disposed: false
    }, f = setInterval(() => {
      if (!(o.disposed || this.disposed))
        try {
          this.circuitBreaker.executeSync(() => {
            const c = n(), l = o.lastValue !== void 0 ? p(o.lastValue) : void 0, u = p(c);
            t(l, u) && i(u, l), o.lastValue = u, o.errorCount = 0;
          });
        } catch (c) {
          o.errorCount++, (o.errorCount <= 3 || o.errorCount % 10 === 0) && this.logger.error(
            `When condition error for ${r} (count: ${o.errorCount})`,
            {
              tags: ["when", "error"],
              state: {
                error: c instanceof Error ? c.message : String(c)
              }
            }
          ), o.errorCount >= 50 && (this.logger.error(
            `When handler ${r} disposed due to repeated errors`,
            {
              tags: ["when", "error", "auto-disposed"]
            }
          ), this.disposeWhenHandler(r));
        }
    }, this.config.pollingInterval || 250);
    return o.intervalId = f, this.whenHandlers.set(r, o), {
      dispose: () => this.disposeWhenHandler(r)
    };
  }
  disposeWatcher(e) {
    const t = this.watchers.get(e);
    t && (t.disposed = true, t.intervalId && clearInterval(t.intervalId), this.watchers.delete(e));
  }
  disposeWhenHandler(e) {
    const t = this.whenHandlers.get(e);
    t && (t.disposed = true, t.intervalId && clearInterval(t.intervalId), this.whenHandlers.delete(e));
  }
  generateId() {
    return Math.random().toString(36).substring(2, 11);
  }
  formatValue(e) {
    return e === void 0 ? "undefined" : e === null ? "null" : typeof e == "string" ? `"${e}"` : typeof e == "number" || typeof e == "boolean" ? String(e) : Array.isArray(e) ? `Array(${e.length})` : typeof e == "object" ? `Object(${Object.keys(e).length} keys)` : String(e);
  }
  /**
   * Get the number of active watchers
   */
  getWatcherCount() {
    return this.watchers.size + this.whenHandlers.size;
  }
  /**
   * Get circuit breaker state
   */
  getCircuitState() {
    return this.circuitBreaker.getState();
  }
  /**
   * Dispose all watchers and clean up
   */
  dispose() {
    this.disposed || (this.disposed = true, this.watchers.forEach((e) => {
      e.disposed = true, e.intervalId && clearInterval(e.intervalId);
    }), this.whenHandlers.forEach((e) => {
      e.disposed = true, e.intervalId && clearInterval(e.intervalId);
    }), this.watchers.clear(), this.whenHandlers.clear());
  }
  /**
   * Check if the engine has been disposed
   */
  isDisposed() {
    return this.disposed;
  }
};
var q = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
};
var v = class _v {
  constructor(e, t, i, r) {
    if (this.scope = e, this.config = t, this.bus = i, this.lastEventId = r, this.watcherEngine = new U(this, t), this.levelSeverities = { ...q }, t.customLevels)
      for (const n of t.customLevels)
        this.levelSeverities[n.name] = n.severity;
  }
  inheritedTags = [];
  inheritedCause;
  inheritedCauseEventId;
  watcherEngine;
  disposed = false;
  levelSeverities;
  event(e, t) {
    this.log("info", e, t);
  }
  info(e, t) {
    this.log("info", e, t);
  }
  warn(e, t) {
    this.log("warn", e, t);
  }
  error(e, t) {
    this.log("error", e, t);
  }
  debug(e, t) {
    this.log("debug", e, t);
  }
  /**
   * Log with any level (built-in or custom)
   */
  log(e, t, i) {
    if (this.disposed) {
      console.warn(
        `Attempted to log on disposed logger (scope: ${this.scope})`
      );
      return;
    }
    e in this.levelSeverities || (console.warn(`Unknown log level: ${e}, defaulting to info`), e = "info");
    const r = this.config.logLevel || "info", n = this.levelSeverities[r] ?? 1;
    if ((this.levelSeverities[e] ?? 1) < n)
      return;
    const a = G(
      {
        level: e,
        scope: this.scope,
        message: t,
        options: i,
        inheritedTags: this.inheritedTags,
        inheritedCause: this.inheritedCause,
        inheritedCauseEventId: this.inheritedCauseEventId
      },
      this.config,
      this.lastEventId
    ), f = this.inheritedCauseEventId ? [this.inheritedCauseEventId] : void 0;
    H(this.scope, a.id, f), this.lastEventId = a.id, this.bus.publish(a);
  }
  tag(...e) {
    const t = new _v(
      this.scope,
      this.config,
      this.bus,
      this.lastEventId
    );
    return t.inheritedTags = [...this.inheritedTags, ...e], t.inheritedCause = this.inheritedCause, t.inheritedCauseEventId = this.inheritedCauseEventId, t;
  }
  causedBy(e) {
    const t = new _v(
      this.scope,
      this.config,
      this.bus,
      this.lastEventId
    );
    return t.inheritedTags = [...this.inheritedTags], typeof e == "string" ? t.inheritedCause = e : (t.inheritedCause = e.message, t.inheritedCauseEventId = e.id), t;
  }
  watch(e, t) {
    if (this.disposed)
      throw new Error(
        `Cannot create watch on disposed logger (scope: ${this.scope})`
      );
    return this.watcherEngine.watch(e, t);
  }
  when(e, t, i) {
    if (this.disposed)
      throw new Error(
        `Cannot create when handler on disposed logger (scope: ${this.scope})`
      );
    return this.watcherEngine.when(e, t, i);
  }
  /**
   * Get the number of active watchers on this logger
   */
  getWatcherCount() {
    return this.watcherEngine.getWatcherCount();
  }
  /**
   * Dispose this logger and all its watchers
   */
  dispose() {
    this.disposed || (this.disposed = true, this.watcherEngine.dispose());
  }
  /**
   * Check if this logger has been disposed
   */
  isDisposed() {
    return this.disposed;
  }
};
var S = ["debug", "info", "warn", "error"];
function D(s) {
  const e = [], t = [];
  if (s.enableCallsite !== void 0 && typeof s.enableCallsite != "boolean" && e.push("enableCallsite must be a boolean"), s.enableEnvInfo !== void 0 && typeof s.enableEnvInfo != "boolean" && e.push("enableEnvInfo must be a boolean"), s.enableStateSnapshot !== void 0 && typeof s.enableStateSnapshot != "boolean" && e.push("enableStateSnapshot must be a boolean"), s.enableCausalLinks !== void 0 && typeof s.enableCausalLinks != "boolean" && e.push("enableCausalLinks must be a boolean"), s.stateSelectors !== void 0 && (Array.isArray(s.stateSelectors) ? s.stateSelectors.forEach((i, r) => {
    typeof i != "function" && e.push(`stateSelectors[${r}] must be a function`);
  }) : e.push("stateSelectors must be an array")), s.maxBufferSize !== void 0 && (typeof s.maxBufferSize != "number" ? e.push("maxBufferSize must be a number") : s.maxBufferSize < 1 ? e.push("maxBufferSize must be at least 1") : s.maxBufferSize > 1e5 && t.push(
    "maxBufferSize is very large (>100000), this may cause memory issues"
  )), s.logLevel !== void 0 && (S.includes(s.logLevel) || e.push(`logLevel must be one of: ${S.join(", ")}`)), s.appVersion !== void 0 && typeof s.appVersion != "string" && e.push("appVersion must be a string"), s.pollingInterval !== void 0 && (typeof s.pollingInterval != "number" ? e.push("pollingInterval must be a number") : s.pollingInterval < 10 ? e.push("pollingInterval must be at least 10ms") : s.pollingInterval < 50 && t.push(
    "pollingInterval is very low (<50ms), this may impact performance"
  )), s.rateLimiting !== void 0)
    if (typeof s.rateLimiting != "object" || s.rateLimiting === null)
      e.push("rateLimiting must be an object");
    else {
      const i = s.rateLimiting;
      i.enabled !== void 0 && typeof i.enabled != "boolean" && e.push("rateLimiting.enabled must be a boolean"), i.maxEventsPerSecond !== void 0 && (typeof i.maxEventsPerSecond != "number" ? e.push("rateLimiting.maxEventsPerSecond must be a number") : i.maxEventsPerSecond < 1 && e.push("rateLimiting.maxEventsPerSecond must be at least 1")), i.samplingRate !== void 0 && (typeof i.samplingRate != "number" ? e.push("rateLimiting.samplingRate must be a number") : (i.samplingRate < 0 || i.samplingRate > 1) && e.push("rateLimiting.samplingRate must be between 0 and 1"));
    }
  if (s.deduplication !== void 0)
    if (typeof s.deduplication != "object" || s.deduplication === null)
      e.push("deduplication must be an object");
    else {
      const i = s.deduplication;
      if (i.enabled !== void 0 && typeof i.enabled != "boolean" && e.push("deduplication.enabled must be a boolean"), i.windowMs !== void 0 && (typeof i.windowMs != "number" ? e.push("deduplication.windowMs must be a number") : i.windowMs < 100 && e.push("deduplication.windowMs must be at least 100ms")), i.fields !== void 0)
        if (!Array.isArray(i.fields))
          e.push("deduplication.fields must be an array");
        else {
          const r = ["message", "scope", "level", "tags", "state"];
          i.fields.forEach((n, o) => {
            typeof n != "string" ? e.push(`deduplication.fields[${o}] must be a string`) : r.includes(n) || e.push(
              `deduplication.fields[${o}] "${n}" is not a valid field. Valid fields: ${r.join(", ")}`
            );
          });
        }
    }
  if (s.customLevels !== void 0)
    if (!Array.isArray(s.customLevels))
      e.push("customLevels must be an array");
    else {
      const i = /* @__PURE__ */ new Set(), r = ["log", "event"];
      s.customLevels.forEach((n, o) => {
        typeof n.name != "string" || n.name.trim() === "" ? e.push(`customLevels[${o}].name must be a non-empty string`) : (i.has(n.name) && e.push(
          `customLevels[${o}].name "${n.name}" is a duplicate`
        ), i.add(n.name), r.includes(n.name.toLowerCase()) && e.push(
          `customLevels[${o}].name "${n.name}" is a reserved method name`
        ), S.includes(n.name) && t.push(
          `customLevels[${o}].name "${n.name}" shadows a built-in level`
        )), typeof n.severity != "number" && e.push(`customLevels[${o}].severity must be a number`);
      });
    }
  return {
    valid: e.length === 0,
    errors: e,
    warnings: t
  };
}
var J = class {
  buffer = [];
  flushTimer = null;
  config;
  constructor(e) {
    this.config = e, e.enabled && e.flushInterval && this.startAutoFlush();
  }
  /**
   * Add an entry to the persistence buffer
   */
  add(e) {
    this.config.enabled && (this.buffer.push(e), this.config.batchSize && this.buffer.length >= this.config.batchSize && this.flush());
  }
  /**
   * Flush the buffer to the adapter
   */
  async flush() {
    if (this.buffer.length === 0) return;
    const e = [...this.buffer];
    this.buffer = [];
    try {
      await this.config.adapter.write(e);
    } catch (t) {
      throw this.buffer.length < 1e4 && (this.buffer = [...e, ...this.buffer]), t;
    }
  }
  /**
   * Start auto-flush timer
   */
  startAutoFlush() {
    this.flushTimer || (this.flushTimer = setInterval(() => {
      this.flush().catch(console.error);
    }, this.config.flushInterval));
  }
  /**
   * Stop auto-flush and close adapter
   */
  async close() {
    this.flushTimer && (clearInterval(this.flushTimer), this.flushTimer = null), await this.flush(), await this.config.adapter.close?.();
  }
  /**
   * Get buffer size
   */
  getBufferSize() {
    return this.buffer.length;
  }
};
function Ie(s = {}) {
  const e = D(s);
  if (!e.valid)
    throw new Error(
      `Invalid Satori configuration:
${e.errors.join(`
`)}`
    );
  e.warnings.length > 0 && console.warn("Satori configuration warnings:", e.warnings);
  const t = {
    ...y,
    ...s,
    // Merge nested configs properly
    rateLimiting: { ...y.rateLimiting, ...s.rateLimiting },
    deduplication: { ...y.deduplication, ...s.deduplication },
    circuitBreaker: {
      ...y.circuitBreaker,
      ...s.circuitBreaker
    }
  }, i = new R({
    maxBufferSize: t.maxBufferSize,
    rateLimiting: t.rateLimiting,
    deduplication: t.deduplication,
    circuitBreaker: t.circuitBreaker,
    enableMetrics: t.enableMetrics
  });
  !(typeof process < "u" && process.env?.NODE_ENV === "test") && t.enableConsole !== false && typeof console < "u" && i.subscribe((l) => {
    const u = l.level;
    (console[u === "debug" ? "log" : u] ?? console.log)(`[${l.scope}] ${l.message}`, l);
  });
  const n = new v("root", t, i), o = /* @__PURE__ */ new Map();
  o.set("root", n);
  let a = null;
  t.persistence?.enabled && (a = new J(t.persistence), i.subscribe((l) => {
    a?.add(l);
  }));
  const f = new C(), c = Date.now();
  return {
    config: t,
    bus: i,
    rootLogger: n,
    createLogger(l) {
      const u = new v(l, t, i);
      return o.set(l, u), f.setLoggerCount(o.size), u;
    },
    getMetrics() {
      let l = 0;
      for (const u of o.values())
        u.isDisposed() || (l += u.getWatcherCount());
      return f.setWatcherCount(l), {
        bus: i.getMetrics(),
        loggerCount: o.size,
        watcherCount: l,
        circuitState: i.getCircuitBreaker().getState(),
        uptime: Date.now() - c
      };
    },
    async flush() {
      a && await a.flush();
    },
    dispose() {
      for (const u of o.values())
        u.dispose();
      o.clear();
      const l = i.getReplayBuffer?.();
      l && (l.length = 0), i.reset(), a && a.close().catch(console.error);
    }
  };
}
var currentConfig = {
  lockViolation: "throw",
  satori: Ie({ logLevel: "debug" })
};
function getSairinConfig() {
  return currentConfig;
}
function getSairinLogger() {
  return currentConfig.satori.createLogger("sairin");
}
var nodeRegistry = /* @__PURE__ */ new Map();
function pathToString(p2) {
  return p2.raw;
}
function getOrCreateNode(p2, kind) {
  const key = pathToString(p2);
  let node = nodeRegistry.get(key);
  if (!node) {
    node = createNode(p2, kind);
    nodeRegistry.set(key, node);
  }
  if (node.kind !== kind) {
    throw new TypeError(
      `Node kind mismatch for path "${key}": existing=${node.kind} requested=${kind}`
    );
  }
  return node;
}
function createNode(p2, kind) {
  const node = {
    path: p2,
    kind,
    version: 0,
    subscribers: /* @__PURE__ */ new Set()
  };
  if (kind === "signal") {
    return {
      ...node,
      kind: "signal",
      value: void 0
    };
  }
  if (kind === "derived") {
    return {
      ...node,
      kind: "derived",
      compute: void 0,
      cached: void 0,
      dirty: true
    };
  }
  return {
    ...node,
    kind: "effect",
    fn: void 0,
    cleanup: void 0,
    disposed: false
  };
}
function getAllNodes() {
  return nodeRegistry.values();
}
function subscribe(node, fn) {
  node.subscribers.add(fn);
  return () => {
    node.subscribers.delete(fn);
  };
}
function unsubscribe(node, fn) {
  node.subscribers.delete(fn);
}
function notifySubscribers(node) {
  node.version++;
  const called = /* @__PURE__ */ new Set();
  for (const fn of node.subscribers) {
    if (called.has(fn)) continue;
    called.add(fn);
    fn();
  }
}
function trackNode(node) {
  const computation = getGlobalActiveComputation();
  if (computation) {
    const checked = computation.__circularCheck;
    if (!checked) {
      computation.__circularCheck = /* @__PURE__ */ new Set();
    }
    const nodes = computation.__circularCheck;
    if (nodes.has(node)) {
      const logger2 = getSairinLogger();
      logger2.error(`Circular dependency detected: ${node.path.raw}`, {
        tags: ["graph", "cycle"]
      });
      return;
    }
    nodes.add(node);
    subscribe(node, computation);
    nodes.delete(node);
  }
}
var lockedPaths = /* @__PURE__ */ new Map();
function isLocked(path3) {
  const key = path3.raw;
  for (const [lockedKey, lock2] of lockedPaths) {
    if (lock2.shallow) {
      if (key === lockedKey) return true;
    } else {
      if (key.startsWith(lockedKey + "/") || key === lockedKey) return true;
    }
  }
  return false;
}
function checkLock(path3, owner) {
  const key = path3.raw;
  for (const [lockedKey, lock2] of lockedPaths) {
    if (lock2.owner === owner) continue;
    if (lock2.shallow) {
      if (key === lockedKey) return false;
    } else {
      if (key.startsWith(lockedKey + "/") || key === lockedKey) return false;
    }
  }
  return true;
}
function handleLockViolation(path3, owner, attemptedOwner) {
  const logger2 = getSairinLogger();
  const message = `Lock violation: cannot write to "${path3.raw}", owned by different scope${attemptedOwner ? ` (attempted by: ${attemptedOwner})` : ""}`;
  {
    logger2.error(message, { tags: ["lock", "write"] });
  }
  {
    throw new Error(message);
  }
}
function assertLock(path3, owner, attemptedOwner) {
  if (!checkLock(path3, owner)) {
    handleLockViolation(path3, owner, attemptedOwner);
    const config = getSairinConfig();
    return config.lockViolation === "warn";
  }
  return true;
}
var Signal = class {
  id;
  path;
  _node;
  constructor(path3, initial, forceSet = false) {
    this.id = parseInt(generateUniqueId(), 36);
    this.path = path3;
    this._node = getOrCreateNode(path3, "signal");
    if (forceSet || initial !== void 0) {
      this._node.value = initial;
    }
  }
  get() {
    trackNode(this._node);
    return this._node.value;
  }
  set(next, options) {
    const pathIsLocked = isLocked(this.path);
    if (pathIsLocked) {
      const attempted = options?.owner ?? "";
      if (!assertLock(this.path, attempted, attempted)) return;
    }
    if (Object.is(this._node.value, next)) return;
    this._node.value = next;
    notifySubscribers(this._node);
  }
  update(fn, options) {
    this.set(fn(this._node.value), options);
  }
  subscribe(fn) {
    return subscribe(this._node, fn);
  }
  unsubscribe(fn) {
    unsubscribe(this._node, fn);
  }
  getSubscriberCount() {
    return this._node.subscribers.size;
  }
  peek() {
    return this._node.value;
  }
  get version() {
    return this._node.version;
  }
};
function isSignal(value) {
  return value instanceof Signal;
}
var Derived = class {
  id;
  path;
  _node;
  _tracker = null;
  _sources = /* @__PURE__ */ new Set();
  _isComputing = false;
  constructor(path3, fn, options = {}) {
    this.id = parseInt(generateUniqueId(), 36);
    this.path = path3;
    this._node = getOrCreateNode(path3, "derived");
    this._node.compute = fn;
    if (options.eager) {
      this.recompute();
    }
  }
  recompute() {
    if (this._tracker) {
      for (const source of this._sources) {
        source.subscribers.delete(this._tracker);
      }
    }
    this._sources.clear();
    this._isComputing = true;
    let trackerInitialized = false;
    const trackedVersions = /* @__PURE__ */ new Map();
    const tracker = () => {
      if (this._isComputing || !trackerInitialized) return;
      for (const [source, prevVersion] of trackedVersions) {
        if (source.version !== prevVersion) {
          if (!this._node.dirty) {
            this._node.dirty = true;
            notifySubscribers(this._node);
          }
          return;
        }
      }
    };
    this._tracker = tracker;
    const prevComputation = getGlobalActiveComputation();
    setGlobalActiveComputation(tracker);
    try {
      this._node.cached = this._node.compute();
      this._node.dirty = false;
    } finally {
      const nodes = getAllNodes();
      const newSources = [];
      for (const node of nodes) {
        if (node.subscribers.has(tracker)) {
          newSources.push(node);
          trackedVersions.set(node, node.version);
        }
      }
      trackerInitialized = true;
      this._isComputing = false;
      for (const node of newSources) {
        this._sources.add(node);
      }
      setGlobalActiveComputation(prevComputation);
    }
  }
  get() {
    if (this._node.dirty) {
      this.recompute();
    }
    trackNode(this._node);
    return this._node.cached;
  }
  subscribe(fn) {
    return subscribe(this._node, fn);
  }
  unsubscribe(fn) {
    unsubscribe(this._node, fn);
  }
  getSubscriberCount() {
    return this._node.subscribers.size;
  }
  isDirty() {
    return this._node.dirty;
  }
  peek() {
    if (this._node.dirty) {
      this.recompute();
    }
    return this._node.cached;
  }
  get version() {
    return this._node.version;
  }
};
var pendingEffects = /* @__PURE__ */ new Set();
var flushScheduled = false;
function scheduleEffect(fn) {
  pendingEffects.add(fn);
  if (!flushScheduled) {
    flushScheduled = true;
    queueMicrotask(() => {
      flushScheduled = false;
      const effects = [...pendingEffects];
      pendingEffects.clear();
      effects.forEach((effect2) => effect2());
    });
  }
}
function runCleanup(cleanups) {
  while (cleanups.length > 0) {
    const fn = cleanups.pop();
    if (fn) fn();
  }
}
function createEffect(fn, schedule) {
  let cleanupFn;
  let disposed = false;
  const logger2 = getSairinLogger();
  const effectContext = { cleanups: [] };
  const runner = () => {
    if (disposed) return;
    runCleanup(effectContext.cleanups);
    if (typeof cleanupFn === "function") {
      cleanupFn();
    }
    const prev = getGlobalActiveComputation();
    effectContext.cleanups = [];
    setGlobalActiveComputation(runner);
    try {
      cleanupFn = fn();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger2.error(`Effect threw: ${message}`, {
        tags: ["effect", "runtime"]
      });
    } finally {
      setGlobalActiveComputation(prev);
    }
  };
  schedule(runner);
  return () => {
    disposed = true;
    runCleanup(effectContext.cleanups);
    if (typeof cleanupFn === "function") {
      cleanupFn();
    }
  };
}
var effect = (fn) => createEffect(fn, scheduleEffect);
function bindText(el, readable) {
  const update = () => {
    const value = readable.get();
    if (el.textContent !== value) {
      el.textContent = value;
    }
  };
  return effect(() => {
    update();
  });
}
function bindHtml(el, readable) {
  return effect(() => {
    const value = readable.get();
    if (el.innerHTML !== value) {
      el.innerHTML = value;
    }
  });
}
function bindAttribute(el, attr, readable) {
  return effect(() => {
    const value = readable.get();
    if (value == null) {
      el.removeAttribute(attr);
    } else {
      el.setAttribute(attr, String(value));
    }
  });
}
function bindProperty(el, prop, readable) {
  return effect(() => {
    const value = readable.get();
    if (el[prop] !== value) {
      el[prop] = value;
    }
  });
}
function bindStyle(el, styleProp, readable) {
  return effect(() => {
    const value = readable.get();
    el.style[styleProp] = value;
  });
}
function bindInputValue(input, sig) {
  const updateValue = () => {
    const value = sig.get();
    if (input.value !== value) {
      input.value = value;
    }
  };
  return effect(() => {
    updateValue();
  });
}
function bindInputChecked(input, sig) {
  const updateChecked = () => {
    input.checked = sig.get();
  };
  const handleChange = () => {
    if ("set" in sig && typeof sig.set === "function") {
      sig.set(input.checked);
    }
  };
  input.addEventListener("change", handleChange);
  return effect(() => {
    updateChecked();
    return () => {
      input.removeEventListener("change", handleChange);
    };
  });
}
function bindSelectValue(select, sig) {
  const updateValue = () => {
    const value = sig.get();
    if (select.value !== value) {
      select.value = value;
    }
  };
  const handleChange = () => {
    if ("set" in sig && typeof sig.set === "function") {
      sig.set(select.value);
    }
  };
  select.addEventListener("change", handleChange);
  return effect(() => {
    updateValue();
    return () => {
      select.removeEventListener("change", handleChange);
    };
  });
}
function bindVisibility(el, readable) {
  return effect(() => {
    const visible = readable.get();
    if (visible) {
      el.removeAttribute("hidden");
    } else {
      el.setAttribute("hidden", "");
    }
  });
}
function bindDisabled(el, readable) {
  return effect(() => {
    const disabled = readable.get();
    if (disabled) {
      el.setAttribute("disabled", "");
    } else {
      el.removeAttribute("disabled");
    }
  });
}
function bindBooleanAttribute(el, attr, readable) {
  return effect(() => {
    const value = readable.get();
    if (value) {
      el.setAttribute(attr, "");
    } else {
      el.removeAttribute(attr);
    }
  });
}
function component(config) {
  return function(Constructor) {
    Object.defineProperty(Constructor.prototype, "sazamiConfig", {
      value: config,
      writable: false,
      configurable: true
    });
    return Constructor;
  };
}
let _nextComponentId = 0;
class SazamiComponent extends HTMLElement {
  constructor() {
    super();
    this.componentId = `${this.tagName?.toLowerCase() ?? "element"}_${++_nextComponentId}`;
    this._cleanupFns = [];
    this._rendered = false;
    this._propStorage = /* @__PURE__ */ new Map();
    this._dirty = false;
    this._pendingStyles = null;
    this._pendingTemplate = null;
    this._lastTemplate = "";
    this._lastStyles = "";
    this._currentRootElement = null;
    this._handlerId = 0;
    this._handlers = /* @__PURE__ */ new Map();
    this.shadow = this.attachShadow({ mode: "open" });
    this._installPropertyReflectors();
  }
  // Static observedAttributes derived from properties with reflect: true
  static get observedAttributes() {
    const cfg = this.prototype.sazamiConfig;
    if (!cfg) return [];
    if (cfg.observedAttributes) {
      return [...cfg.observedAttributes];
    }
    if (cfg.properties) {
      return Object.entries(cfg.properties).filter(([_2, prop]) => prop.reflect).map(([name]) => name);
    }
    return [];
  }
  getStructuralRoot() {
    const cfg = this.sazamiConfig;
    if (cfg?.structuralRoots) {
      const mode = this.getRenderMode();
      return cfg.structuralRoots[mode] ?? null;
    }
    return this._currentRootElement;
  }
  getRenderMode() {
    return "";
  }
  _extractRootElement(template) {
    const match = template.match(/<([a-z][a-z0-9-]*)/i);
    return match ? match[1].toLowerCase() : "";
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
  attributeChangedCallback(name, oldVal, newVal) {
    if (oldVal === newVal) return;
    if (this._rendered) {
      this.render();
    }
  }
  // Override in subclass
  render() {
  }
  /**
   * Mounts the component's shadow DOM with the given styles and template.
   * Auto-detects structural changes and renders synchronously when needed.
   * For non-structural re-renders, defers to a microtask for batching.
   * @param styles - CSS styles to inject
   * @param template - HTML template string. Callers are responsible for escaping
   *   user-provided data using escapeHtml() before interpolating into the template.
   */
  mount(styles, template) {
    const newRootElement = this._extractRootElement(template);
    const isStructuralChange = newRootElement !== "" && newRootElement !== this._currentRootElement;
    if (!this._rendered || isStructuralChange) {
      try {
        this.shadow.innerHTML = `<style>${styles}</style>${template}`;
        this._currentRootElement = newRootElement;
      } catch (e) {
        renderError(`Failed to render component: ${e.message}`, {
          suggestion: "Check the template syntax and styles"
        });
      }
    } else {
      this.scheduleRender(styles, template);
    }
  }
  /**
   * Mounts the component's shadow DOM synchronously.
   * Use this when you need to query/bind immediately after mounting.
   * @param styles - CSS styles to inject
   * @param template - HTML template string. Callers are responsible for escaping
   *   user-provided data using escapeHtml() before interpolating into the template.
   */
  mountSync(styles, template) {
    const newRootElement = this._extractRootElement(template);
    this._pendingStyles = null;
    this._pendingTemplate = null;
    this._dirty = false;
    this._lastTemplate = template;
    this._lastStyles = styles;
    try {
      this.shadow.innerHTML = `<style>${styles}</style>${template}`;
      this._currentRootElement = newRootElement;
    } catch (e) {
      renderError(`Failed to render component: ${e.message}`, {
        suggestion: "Check the template syntax and styles"
      });
    }
  }
  /**
   * Schedules a render to occur in the next microtask.
   * Collapses multiple render() calls within the same tick into one DOM write.
   * Uses backpressure, if a render is already queued, subsequent calls are dropped.
   */
  scheduleRender(styles, template) {
    this._pendingStyles = styles;
    this._pendingTemplate = template;
    if (this._dirty) return;
    this._dirty = true;
    queueMicrotask(() => {
      this._dirty = false;
      if (this._pendingTemplate !== null) {
        const currentTemplate = this._pendingTemplate;
        const currentStyles = this._pendingStyles;
        this._pendingStyles = null;
        this._pendingTemplate = null;
        this._flush(currentStyles, currentTemplate);
      }
    });
  }
  /**
   * Flushes pending styles and template to the shadow DOM.
   * Called by scheduleRender when the microtask runs.
   * Skips stale renders if structural change made them obsolete.
   */
  _flush(styles, template) {
    const pendingRoot = this._extractRootElement(template);
    if (pendingRoot !== "" && pendingRoot !== this._currentRootElement) {
      return;
    }
    if (template === this._lastTemplate && styles === this._lastStyles) return;
    this._lastTemplate = template;
    this._lastStyles = styles;
    try {
      this.shadow.innerHTML = `<style>${styles}</style>${template}`;
      this._currentRootElement = pendingRoot || this._currentRootElement;
    } catch (e) {
      renderError(`Failed to render component: ${e.message}`, {
        suggestion: "Check the template syntax and styles"
      });
    }
  }
  // Unified binding API - delegates to Sairin's dom/bindings
  bind(selector, target, readable) {
    const element = selector === ":host" ? this : this.$(selector);
    if (!element) {
      bindingError(`Element not found: ${selector}`, {});
      return;
    }
    let dispose;
    switch (target) {
      case "textContent":
        dispose = bindText(element, readable);
        break;
      case "innerHTML":
        dispose = bindHtml(element, readable);
        break;
      case "value":
        if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
          if (!("set" in readable)) {
            bindingError(
              `"value" binding requires a writable Signal, got a read-only Readable`,
              {
                suggestion: "Use Signal instead of Derived for two-way bindings"
              }
            );
            break;
          }
          dispose = bindInputValue(element, readable);
        } else if (element instanceof HTMLSelectElement) {
          if ("set" in readable) {
            dispose = bindSelectValue(element, readable);
          } else {
            dispose = bindProperty(element, "value", readable);
          }
        } else {
          bindingError(
            `Cannot bind "value" to element type: ${element.constructor.name}`,
            {
              suggestion: "Use bindAttribute or bindProperty for this element type"
            }
          );
        }
        break;
      case "checked":
        if (element instanceof HTMLInputElement) {
          if (!("set" in readable)) {
            bindingError(
              `"checked" binding requires a writable Signal, got a read-only Readable`,
              {
                suggestion: "Use Signal instead of Derived for two-way bindings"
              }
            );
            break;
          }
          dispose = bindInputChecked(element, readable);
        } else {
          dispose = bindBooleanAttribute(
            element,
            "checked",
            readable
          );
        }
        break;
      case "disabled":
        dispose = bindDisabled(element, readable);
        break;
      case "visible":
        dispose = bindVisibility(element, readable);
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
  bindText(selector, readable) {
    this.bind(selector, "textContent", readable);
  }
  bindHtml(selector, readable) {
    this.bind(selector, "innerHTML", readable);
  }
  bindValue(selector, readable) {
    this.bind(selector, "value", readable);
  }
  bindChecked(selector, readable) {
    this.bind(selector, "checked", readable);
  }
  bindDisabled(selector, readable) {
    this.bind(selector, "disabled", readable);
  }
  bindVisible(selector, readable) {
    this.bind(selector, "visible", readable);
  }
  bindAttribute(selector, attr, readable) {
    return this.bind(selector, attr, readable);
  }
  bindProperty(selector, prop, readable) {
    const element = this.$(selector);
    if (!element) {
      bindingError(`Element not found: ${selector}`, {});
      return;
    }
    const dispose = bindProperty(element, prop, readable);
    this._cleanupFns.push(dispose);
  }
  bindStyle(selector, styleProp, readable) {
    const element = this.$(selector);
    if (!element) {
      bindingError(`Element not found: ${selector}`, {});
      return;
    }
    const dispose = bindStyle(element, styleProp, readable);
    this._cleanupFns.push(dispose);
  }
  bindToggleClass(selector, className, readable) {
    const element = this.$(selector);
    if (!element) {
      bindingError(`Element not found: ${selector}`, {});
      return;
    }
    this._cleanupFns.push(
      effect(() => {
        const active = readable.get();
        if (active) {
          element.classList.add(className);
        } else {
          element.classList.remove(className);
        }
      })
    );
  }
  bindWidthPercent(selector, readable, min = 0, max = 100) {
    const element = selector === ":host" ? this : this.$(selector);
    if (!element) {
      bindingError(`Element not found: ${selector}`, {});
      return () => {
      };
    }
    const dispose = effect(() => {
      const value = readable.get();
      const range = max - min;
      const percent = range > 0 ? Math.min(100, Math.max(0, (value - min) / range * 100)) : 0;
      element.style.width = `${percent}%`;
    });
    this._cleanupFns.push(dispose);
    return dispose;
  }
  bindWidthPercentAttribute(selector, attr, readable, min = 0, max = 100) {
    const element = selector === ":host" ? this : this.$(selector);
    if (!element) {
      bindingError(`Element not found: ${selector}`, {});
      return;
    }
    this._cleanupFns.push(
      effect(() => {
        const value = readable.get();
        const range = max - min;
        const percent = range > 0 ? Math.min(100, Math.max(0, (value - min) / range * 100)) : 0;
        element.setAttribute(attr, String(percent));
      })
    );
  }
  $(selector) {
    return this.shadow.querySelector(selector);
  }
  // Handler registry: addHandler returns an ID for later removal
  // Using Function type to accept both EventListener and specific event handlers like KeyboardEvent
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  addHandler(type, handler, options) {
    const id = ++this._handlerId;
    const source = options?.internal ? "internal" : "user";
    const target = options?.element || this;
    target.addEventListener(type, handler);
    const handlers = this._handlers.get(type) || [];
    handlers.push({ id, fn: handler, source, target });
    this._handlers.set(type, handlers);
    return id;
  }
  // Remove handler by ID, function reference, or type+id/type+fn
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  removeHandler(typeOrId, idOrFn) {
    if (typeof typeOrId === "number") {
      for (const [type, handlers2] of this._handlers) {
        const index2 = handlers2.findIndex((h) => h.id === typeOrId);
        if (index2 !== -1) {
          const handler = handlers2[index2];
          handler.target.removeEventListener(type, handler.fn);
          handlers2.splice(index2, 1);
          return;
        }
      }
      return;
    }
    const handlers = this._handlers.get(typeOrId);
    if (!handlers || idOrFn === void 0) return;
    const index = handlers.findIndex(
      (h) => typeof idOrFn === "number" ? h.id === idOrFn : h.fn === idOrFn
    );
    if (index !== -1) {
      const handler = handlers[index];
      handler.target.removeEventListener(typeOrId, handler.fn);
      handlers.splice(index, 1);
    }
  }
  // Remove handlers with filters
  removeAllHandlers(options) {
    const types = options?.type ? [options.type] : Array.from(this._handlers.keys());
    for (const type of types) {
      const handlers = this._handlers.get(type);
      if (!handlers) continue;
      const toRemove = options?.source ? handlers.filter((h) => h.source === options.source) : handlers;
      toRemove.forEach((h) => {
        (h.target || this).removeEventListener(type, h.fn);
      });
      if (options?.source) {
        this._handlers.set(
          type,
          handlers.filter((h) => h.source !== options.source)
        );
      } else {
        this._handlers.delete(type);
      }
    }
  }
  // dispatch custom events
  dispatch(name, detail, options = {}) {
    this.dispatchEvent(
      new CustomEvent(name, {
        detail: detail ?? {},
        bubbles: options.bubbles ?? true,
        composed: options.composed ?? true
      })
    );
  }
  // dispatch typed events based on metadata
  dispatchEventTyped(event, detail) {
    const config = this.sazamiConfig;
    const events = config.events;
    if (!events) return;
    const eventKey = event;
    const eventConfig = events[eventKey];
    if (!eventConfig) {
      eventError(`Event "${String(event)}" not defined in metadata`, {
        tag: this.tagName,
        suggestion: `Add "${String(event)}" to the events config`
      });
      return;
    }
    this.dispatchEvent(
      new CustomEvent(eventConfig.name, {
        detail,
        bubbles: true,
        composed: true
      })
    );
  }
  // mount cleanup for Sairin bindings
  onCleanup(fn) {
    this._cleanupFns.push(fn);
  }
  // Auto-install property reflectors from metadata
  _installPropertyReflectors() {
    const config = this.sazamiConfig;
    if (!config) return;
    const props = config.properties;
    if (!props) return;
    for (const [prop, cfg] of Object.entries(props)) {
      const descriptor = Object.getOwnPropertyDescriptor(
        Object.getPrototypeOf(this),
        prop
      );
      if (descriptor && "set" in descriptor) {
        continue;
      }
      this._createReflector(prop, cfg.type, cfg.default, cfg.reflect);
    }
  }
  _createReflector(prop, type, defaultValue, reflect) {
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
            return !isNaN(val) ? val : defaultValue ?? 0;
          }
          return raw;
        }
        return defaultValue ?? (type === "number" ? 0 : "");
      },
      set(value) {
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
      configurable: true
    });
  }
}
const GAP_RULES = `
:host([gap="xsmall"])  { gap: var(--saz-space-xsmall); }
:host([gap="tiny"])    { gap: var(--saz-space-tiny); }
:host([gap="small"])   { gap: var(--saz-space-small); }
:host([gap="medium"])  { gap: var(--saz-space-medium); }
:host([gap="large"])   { gap: var(--saz-space-large); }
:host([gap="xlarge"]) { gap: var(--saz-space-xlarge); }
`;
const SIZE_RULES = `
:host([size="xsmall"])  { font-size: var(--saz-text-size-xsmall); }
:host([size="tiny"])    { font-size: var(--saz-text-size-tiny); }
:host([size="small"])   { font-size: var(--saz-text-size-small); }
:host([size="medium"])  { font-size: var(--saz-text-size-medium); }
:host([size="large"])   { font-size: var(--saz-text-size-large); }
:host([size="xlarge"]) { font-size: var(--saz-text-size-xlarge); }
`;
const SIZE_PADDING_RULES = `
:host([size="xsmall"])  { padding: var(--saz-space-xsmall) var(--saz-space-tiny); }
:host([size="tiny"])    { padding: var(--saz-space-tiny) var(--saz-space-small); }
:host([size="small"])   { padding: var(--saz-space-tiny) var(--saz-space-small); }
:host([size="medium"])  { padding: var(--saz-space-small) var(--saz-space-medium); }
:host([size="large"])   { padding: var(--saz-space-medium) var(--saz-space-large); min-width: 120px; width: auto; }
:host([size="xlarge"]) { padding: var(--saz-space-large) var(--saz-space-xlarge); min-width: 160px; width: auto; }
`;
const VARIANT_BG_RULES = `
:host([variant="accent"])    { background: var(--saz-color-accent); color: var(--saz-color-on-accent); border-color: transparent; }
:host([variant="primary"])   { background: var(--saz-color-primary); color: var(--saz-color-on-primary); border-color: transparent; }
:host([variant="secondary"]) { background: transparent; color: var(--saz-color-text); border-color: var(--saz-color-border); }
:host([variant="danger"])    { background: var(--saz-color-danger); color: var(--saz-color-on-danger); border-color: transparent; }
:host([variant="success"])   { background: var(--saz-color-success); color: var(--saz-color-on-success); border-color: transparent; }
:host([variant="warning"])   { background: #fef3c7; color: #92400e; border-color: transparent; }
:host([variant="dim"])       { background: transparent; color: var(--saz-color-text-dim); border-color: transparent; }
:host([variant="dim"]:hover) { color: var(--saz-color-text); }
`;
const VARIANT_TEXT_RULES = `
:host([variant="accent"])    { color: var(--saz-color-accent); }
:host([variant="primary"])   { color: var(--saz-color-primary); }
:host([variant="secondary"]) { color: var(--saz-color-secondary); }
:host([variant="danger"])    { color: var(--saz-color-danger); }
:host([variant="success"])   { color: var(--saz-color-success); }
:host([variant="dim"])       { color: var(--saz-color-text-dim); }
:host([variant="dimmer"])    { color: var(--saz-color-text-dimmer); }
`;
const SHAPE_RULES = `
:host([shape="round"])   { border-radius: var(--saz-radius-round); }
:host([shape="pill"])   { border-radius: var(--saz-radius-round); }
:host([shape="square"]) { border-radius: var(--saz-radius-none); }
:host([shape="rounded"]) { border-radius: var(--saz-radius-soft); }
:host([shape="circle"]) { border-radius: 50%; }
`;
const STATE_DISABLED = `
:host([disabled]) {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}
`;
const STATE_LOADING = `
:host([loading]) {
  opacity: 0.7;
  cursor: wait;
  pointer-events: none;
}
`;
const STATE_ACTIVE = `
:host([active]),
:host([checked]) {
  filter: brightness(0.9);
}
`;
const INTERACTIVE_FOCUS = `
:host(:focus-visible) {
  outline: 2px solid var(--saz-color-primary);
  outline-offset: 2px;
}
`;
const INTERACTIVE_HOVER = `
:host(:hover) {
  filter: brightness(1.05);
}
:host(:active) {
  transform: scale(0.97);
}
`;
const TYPO_WEIGHT = `
:host([weight="light"])   { font-weight: var(--saz-text-weight-light); }
:host([weight="normal"]) { font-weight: var(--saz-text-weight-normal); }
:host([weight="medium"]) { font-weight: var(--saz-text-weight-medium); }
:host([weight="bold"])   { font-weight: var(--saz-text-weight-bold); }
`;
const TYPO_TONE = `
:host([tone="dim"])       { color: var(--saz-color-text-dim); }
:host([tone="dimmer"])    { color: var(--saz-color-text-dimmer); }
`;
var __create$w = Object.create;
var __defProp$w = Object.defineProperty;
var __getOwnPropDesc$w = Object.getOwnPropertyDescriptor;
var __knownSymbol$w = (name, symbol) => (symbol = Symbol[name]) ? symbol : /* @__PURE__ */ Symbol.for("Symbol." + name);
var __typeError$w = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp$w = (obj, key, value) => key in obj ? __defProp$w(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __name$w = (target, value) => __defProp$w(target, "name", { value, configurable: true });
var __decoratorStart$w = (base) => [, , , __create$w(base?.[__knownSymbol$w("metadata")] ?? null)];
var __decoratorStrings$w = ["class", "method", "getter", "setter", "accessor", "field", "value", "get", "set"];
var __expectFn$w = (fn) => fn !== void 0 && typeof fn !== "function" ? __typeError$w("Function expected") : fn;
var __decoratorContext$w = (kind, name, done, metadata, fns) => ({ kind: __decoratorStrings$w[kind], name, metadata, addInitializer: (fn) => done._ ? __typeError$w("Already initialized") : fns.push(__expectFn$w(fn || null)) });
var __decoratorMetadata$w = (array, target) => __defNormalProp$w(target, __knownSymbol$w("metadata"), array[3]);
var __runInitializers$w = (array, flags, self, value) => {
  for (var i = 0, fns = array[flags >> 1], n = fns && fns.length; i < n; i++) fns[i].call(self);
  return value;
};
var __decorateElement$w = (array, flags, name, decorators, target, extra) => {
  var it, done, ctx, k2 = flags & 7, p2 = false;
  var j2 = 0;
  var extraInitializers = array[j2] || (array[j2] = []);
  var desc = k2 && (target = target.prototype, k2 < 5 && (k2 > 3 || !p2) && __getOwnPropDesc$w(target, name));
  __name$w(target, name);
  for (var i = decorators.length - 1; i >= 0; i--) {
    ctx = __decoratorContext$w(k2, name, done = {}, array[3], extraInitializers);
    it = (0, decorators[i])(target, ctx), done._ = 1;
    __expectFn$w(it) && (target = it);
  }
  return __decoratorMetadata$w(array, target), desc && __defProp$w(target, name, desc), p2 ? k2 ^ 4 ? extra : desc : target;
};
var _SazamiRow_decorators, _init$w, _a$w;
const STYLES$x = `
:host {
  display: flex;
  flex-direction: row;
  gap: var(--saz-space-medium);
  align-items: center;
}
${GAP_RULES}
:host([justify="space-between"]) { justify-content: space-between; }
:host([justify="center"])        { justify-content: center; }
:host([justify="flex-end"])      { justify-content: flex-end; }
:host([justify="space-around"])  { justify-content: space-around; }
:host([justify="space-evenly"])  { justify-content: space-evenly; }
:host([align="center"])    { align-items: center; }
:host([align="flex-end"])  { align-items: flex-end; }
:host([align="stretch"])   { align-items: stretch; }
:host([align="baseline"])  { align-items: baseline; }
:host([wrap])              { flex-wrap: wrap; }
`;
const rowConfig = {
  properties: {
    justify: { type: "string", reflect: true },
    align: { type: "string", reflect: true },
    wrap: { type: "boolean", reflect: true },
    gap: { type: "string", reflect: true }
  }
};
_SazamiRow_decorators = [component(rowConfig)];
class SazamiRow extends (_a$w = SazamiComponent) {
  render() {
    this.mount(STYLES$x, `<slot></slot>`);
  }
}
_init$w = __decoratorStart$w(_a$w);
SazamiRow = __decorateElement$w(_init$w, 0, "SazamiRow", _SazamiRow_decorators, SazamiRow);
__runInitializers$w(_init$w, 1, SazamiRow);
var __create$v = Object.create;
var __defProp$v = Object.defineProperty;
var __getOwnPropDesc$v = Object.getOwnPropertyDescriptor;
var __knownSymbol$v = (name, symbol) => (symbol = Symbol[name]) ? symbol : /* @__PURE__ */ Symbol.for("Symbol." + name);
var __typeError$v = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp$v = (obj, key, value) => key in obj ? __defProp$v(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __name$v = (target, value) => __defProp$v(target, "name", { value, configurable: true });
var __decoratorStart$v = (base) => [, , , __create$v(base?.[__knownSymbol$v("metadata")] ?? null)];
var __decoratorStrings$v = ["class", "method", "getter", "setter", "accessor", "field", "value", "get", "set"];
var __expectFn$v = (fn) => fn !== void 0 && typeof fn !== "function" ? __typeError$v("Function expected") : fn;
var __decoratorContext$v = (kind, name, done, metadata, fns) => ({ kind: __decoratorStrings$v[kind], name, metadata, addInitializer: (fn) => done._ ? __typeError$v("Already initialized") : fns.push(__expectFn$v(fn || null)) });
var __decoratorMetadata$v = (array, target) => __defNormalProp$v(target, __knownSymbol$v("metadata"), array[3]);
var __runInitializers$v = (array, flags, self, value) => {
  for (var i = 0, fns = array[flags >> 1], n = fns && fns.length; i < n; i++) fns[i].call(self);
  return value;
};
var __decorateElement$v = (array, flags, name, decorators, target, extra) => {
  var it, done, ctx, k2 = flags & 7, p2 = false;
  var j2 = 0;
  var extraInitializers = array[j2] || (array[j2] = []);
  var desc = k2 && (target = target.prototype, k2 < 5 && (k2 > 3 || !p2) && __getOwnPropDesc$v(target, name));
  __name$v(target, name);
  for (var i = decorators.length - 1; i >= 0; i--) {
    ctx = __decoratorContext$v(k2, name, done = {}, array[3], extraInitializers);
    it = (0, decorators[i])(target, ctx), done._ = 1;
    __expectFn$v(it) && (target = it);
  }
  return __decoratorMetadata$v(array, target), desc && __defProp$v(target, name, desc), p2 ? k2 ^ 4 ? extra : desc : target;
};
var _SazamiColumn_decorators, _init$v, _a$v;
const STYLES$w = `
:host {
  display: flex;
  flex-direction: column;
  gap: var(--saz-space-medium);
}
${GAP_RULES}
:host([justify="space-between"]) { justify-content: space-between; }
:host([justify="center"])        { justify-content: center; }
:host([align="center"])    { align-items: center; }
:host([align="stretch"])   { align-items: stretch; }
`;
const columnConfig = {
  properties: {
    justify: { type: "string", reflect: false },
    align: { type: "string", reflect: false },
    gap: { type: "string", reflect: false }
  }
};
_SazamiColumn_decorators = [component(columnConfig)];
class SazamiColumn extends (_a$v = SazamiComponent) {
  render() {
    this.mount(STYLES$w, `<slot></slot>`);
  }
}
_init$v = __decoratorStart$v(_a$v);
SazamiColumn = __decorateElement$v(_init$v, 0, "SazamiColumn", _SazamiColumn_decorators, SazamiColumn);
__runInitializers$v(_init$v, 1, SazamiColumn);
var __create$u = Object.create;
var __defProp$u = Object.defineProperty;
var __getOwnPropDesc$u = Object.getOwnPropertyDescriptor;
var __knownSymbol$u = (name, symbol) => (symbol = Symbol[name]) ? symbol : /* @__PURE__ */ Symbol.for("Symbol." + name);
var __typeError$u = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp$u = (obj, key, value) => key in obj ? __defProp$u(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __name$u = (target, value) => __defProp$u(target, "name", { value, configurable: true });
var __decoratorStart$u = (base) => [, , , __create$u(base?.[__knownSymbol$u("metadata")] ?? null)];
var __decoratorStrings$u = ["class", "method", "getter", "setter", "accessor", "field", "value", "get", "set"];
var __expectFn$u = (fn) => fn !== void 0 && typeof fn !== "function" ? __typeError$u("Function expected") : fn;
var __decoratorContext$u = (kind, name, done, metadata, fns) => ({ kind: __decoratorStrings$u[kind], name, metadata, addInitializer: (fn) => done._ ? __typeError$u("Already initialized") : fns.push(__expectFn$u(fn || null)) });
var __decoratorMetadata$u = (array, target) => __defNormalProp$u(target, __knownSymbol$u("metadata"), array[3]);
var __runInitializers$u = (array, flags, self, value) => {
  for (var i = 0, fns = array[flags >> 1], n = fns && fns.length; i < n; i++) fns[i].call(self);
  return value;
};
var __decorateElement$u = (array, flags, name, decorators, target, extra) => {
  var it, done, ctx, k2 = flags & 7, p2 = false;
  var j2 = 0;
  var extraInitializers = array[j2] || (array[j2] = []);
  var desc = k2 && (target = target.prototype, k2 < 5 && (k2 > 3 || !p2) && __getOwnPropDesc$u(target, name));
  __name$u(target, name);
  for (var i = decorators.length - 1; i >= 0; i--) {
    ctx = __decoratorContext$u(k2, name, done = {}, array[3], extraInitializers);
    it = (0, decorators[i])(target, ctx), done._ = 1;
    __expectFn$u(it) && (target = it);
  }
  return __decoratorMetadata$u(array, target), desc && __defProp$u(target, name, desc), p2 ? k2 ^ 4 ? extra : desc : target;
};
var _SazamiGrid_decorators, _init$u, _a$u;
const STYLES$v = `
:host {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--saz-space-medium);
}
${GAP_RULES}
:host([cols="1"]) { grid-template-columns: repeat(1, minmax(0, 1fr)); }
:host([cols="2"]) { grid-template-columns: repeat(2, minmax(0, 1fr)); }
:host([cols="3"]) { grid-template-columns: repeat(3, minmax(0, 1fr)); }
:host([cols="4"]) { grid-template-columns: repeat(4, minmax(0, 1fr)); }
:host([cols="5"]) { grid-template-columns: repeat(5, minmax(0, 1fr)); }
:host([cols="6"]) { grid-template-columns: repeat(6, minmax(0, 1fr)); }

@media (min-width: 768px) {
  :host([md\\:cols="1"]) { grid-template-columns: repeat(1, minmax(0, 1fr)); }
  :host([md\\:cols="2"]) { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  :host([md\\:cols="3"]) { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  :host([md\\:cols="4"]) { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  :host([md\\:cols="5"]) { grid-template-columns: repeat(5, minmax(0, 1fr)); }
  :host([md\\:cols="6"]) { grid-template-columns: repeat(6, minmax(0, 1fr)); }
}

@media (min-width: 1024px) {
  :host([lg\\:cols="1"]) { grid-template-columns: repeat(1, minmax(0, 1fr)); }
  :host([lg\\:cols="2"]) { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  :host([lg\\:cols="3"]) { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  :host([lg\\:cols="4"]) { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  :host([lg\\:cols="5"]) { grid-template-columns: repeat(5, minmax(0, 1fr)); }
  :host([lg\\:cols="6"]) { grid-template-columns: repeat(6, minmax(0, 1fr)); }
}
`;
const gridConfig = {
  properties: {
    cols: { type: "string", reflect: false },
    "md:cols": { type: "string", reflect: false },
    "lg:cols": { type: "string", reflect: false },
    gap: { type: "string", reflect: false }
  }
};
_SazamiGrid_decorators = [component(gridConfig)];
class SazamiGrid extends (_a$u = SazamiComponent) {
  render() {
    this.mount(STYLES$v, `<slot></slot>`);
  }
}
_init$u = __decoratorStart$u(_a$u);
SazamiGrid = __decorateElement$u(_init$u, 0, "SazamiGrid", _SazamiGrid_decorators, SazamiGrid);
__runInitializers$u(_init$u, 1, SazamiGrid);
var __create$t = Object.create;
var __defProp$t = Object.defineProperty;
var __getOwnPropDesc$t = Object.getOwnPropertyDescriptor;
var __knownSymbol$t = (name, symbol) => (symbol = Symbol[name]) ? symbol : /* @__PURE__ */ Symbol.for("Symbol." + name);
var __typeError$t = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp$t = (obj, key, value) => key in obj ? __defProp$t(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __name$t = (target, value) => __defProp$t(target, "name", { value, configurable: true });
var __decoratorStart$t = (base) => [, , , __create$t(base?.[__knownSymbol$t("metadata")] ?? null)];
var __decoratorStrings$t = ["class", "method", "getter", "setter", "accessor", "field", "value", "get", "set"];
var __expectFn$t = (fn) => fn !== void 0 && typeof fn !== "function" ? __typeError$t("Function expected") : fn;
var __decoratorContext$t = (kind, name, done, metadata, fns) => ({ kind: __decoratorStrings$t[kind], name, metadata, addInitializer: (fn) => done._ ? __typeError$t("Already initialized") : fns.push(__expectFn$t(fn || null)) });
var __decoratorMetadata$t = (array, target) => __defNormalProp$t(target, __knownSymbol$t("metadata"), array[3]);
var __runInitializers$t = (array, flags, self, value) => {
  for (var i = 0, fns = array[flags >> 1], n = fns && fns.length; i < n; i++) fns[i].call(self);
  return value;
};
var __decorateElement$t = (array, flags, name, decorators, target, extra) => {
  var it, done, ctx, k2 = flags & 7, p2 = false;
  var j2 = 0;
  var extraInitializers = array[j2] || (array[j2] = []);
  var desc = k2 && (target = target.prototype, k2 < 5 && (k2 > 3 || !p2) && __getOwnPropDesc$t(target, name));
  __name$t(target, name);
  for (var i = decorators.length - 1; i >= 0; i--) {
    ctx = __decoratorContext$t(k2, name, done = {}, array[3], extraInitializers);
    it = (0, decorators[i])(target, ctx), done._ = 1;
    __expectFn$t(it) && (target = it);
  }
  return __decoratorMetadata$t(array, target), desc && __defProp$t(target, name, desc), p2 ? k2 ^ 4 ? extra : desc : target;
};
var _SazamiStack_decorators, _init$t, _a$t;
const STYLES$u = `
:host {
  display: flex;
  flex-direction: column;
  gap: var(--saz-space-medium);
}
${GAP_RULES}
:host([align="center"])  { align-items: center; }
:host([align="stretch"]) { align-items: stretch; }
`;
const stackConfig = {
  properties: {
    align: { type: "string", reflect: false },
    gap: { type: "string", reflect: false }
  }
};
_SazamiStack_decorators = [component(stackConfig)];
class SazamiStack extends (_a$t = SazamiComponent) {
  render() {
    this.mount(STYLES$u, `<slot></slot>`);
  }
}
_init$t = __decoratorStart$t(_a$t);
SazamiStack = __decorateElement$t(_init$t, 0, "SazamiStack", _SazamiStack_decorators, SazamiStack);
__runInitializers$t(_init$t, 1, SazamiStack);
var __create$s = Object.create;
var __defProp$s = Object.defineProperty;
var __getOwnPropDesc$s = Object.getOwnPropertyDescriptor;
var __knownSymbol$s = (name, symbol) => (symbol = Symbol[name]) ? symbol : /* @__PURE__ */ Symbol.for("Symbol." + name);
var __typeError$s = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp$s = (obj, key, value) => key in obj ? __defProp$s(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __name$s = (target, value) => __defProp$s(target, "name", { value, configurable: true });
var __decoratorStart$s = (base) => [, , , __create$s(base?.[__knownSymbol$s("metadata")] ?? null)];
var __decoratorStrings$s = ["class", "method", "getter", "setter", "accessor", "field", "value", "get", "set"];
var __expectFn$s = (fn) => fn !== void 0 && typeof fn !== "function" ? __typeError$s("Function expected") : fn;
var __decoratorContext$s = (kind, name, done, metadata, fns) => ({ kind: __decoratorStrings$s[kind], name, metadata, addInitializer: (fn) => done._ ? __typeError$s("Already initialized") : fns.push(__expectFn$s(fn || null)) });
var __decoratorMetadata$s = (array, target) => __defNormalProp$s(target, __knownSymbol$s("metadata"), array[3]);
var __runInitializers$s = (array, flags, self, value) => {
  for (var i = 0, fns = array[flags >> 1], n = fns && fns.length; i < n; i++) fns[i].call(self);
  return value;
};
var __decorateElement$s = (array, flags, name, decorators, target, extra) => {
  var it, done, ctx, k2 = flags & 7, p2 = false;
  var j2 = 0;
  var extraInitializers = array[j2] || (array[j2] = []);
  var desc = k2 && (target = target.prototype, k2 < 5 && (k2 > 3 || !p2) && __getOwnPropDesc$s(target, name));
  __name$s(target, name);
  for (var i = decorators.length - 1; i >= 0; i--) {
    ctx = __decoratorContext$s(k2, name, done = {}, array[3], extraInitializers);
    it = (0, decorators[i])(target, ctx), done._ = 1;
    __expectFn$s(it) && (target = it);
  }
  return __decoratorMetadata$s(array, target), desc && __defProp$s(target, name, desc), p2 ? k2 ^ 4 ? extra : desc : target;
};
var _SazamiCard_decorators, _init$s, _a$s;
const STYLES$t = `
:host {
  display: flex;
  flex-direction: column;
  background: var(--saz-color-surface);
  border: 1px solid var(--saz-color-border);
  padding: var(--saz-space-large);
  border-radius: var(--saz-radius-medium);
  box-shadow: var(--saz-shadow-soft);
  color: var(--saz-color-text);
  transition: box-shadow 0.25s ease, transform 0.25s ease, background 0.2s ease;
  gap: var(--saz-space-large);
}
:host(:hover) { box-shadow: var(--saz-shadow-medium); }
${GAP_RULES}
:host([layout="row"])    { flex-direction: row; }
:host([layout="column"]) { flex-direction: column; }
:host([align="center"])    { align-items: center; }
:host([align="stretch"])   { align-items: stretch; }
:host([justify="space-between"]) { justify-content: space-between; }
:host([justify="center"])        { justify-content: center; }
:host([size="small"])  { padding: var(--saz-space-small); }
:host([size="medium"]) { padding: var(--saz-space-medium); }
:host([size="large"])  { padding: var(--saz-space-large); }
:host([size="xlarge"]) { padding: var(--saz-space-xlarge); }
${VARIANT_BG_RULES}
`;
const cardConfig = {
  properties: {
    layout: { type: "string", reflect: false },
    align: { type: "string", reflect: false },
    justify: { type: "string", reflect: false },
    size: { type: "string", reflect: false },
    variant: { type: "string", reflect: false },
    gap: { type: "string", reflect: false }
  }
};
_SazamiCard_decorators = [component(cardConfig)];
class SazamiCard extends (_a$s = SazamiComponent) {
  constructor() {
    super(...arguments);
    this._loadingSignal = null;
  }
  _isReadableBool(value) {
    return isSignal(value) || value instanceof Derived;
  }
  set loading(value) {
    if (this._isReadableBool(value)) {
      this._loadingSignal = value;
      this.onCleanup(
        effect(() => {
          const loading = value.get();
          if (loading) {
            this.setAttribute("loading", "");
          } else {
            this.removeAttribute("loading");
          }
        })
      );
    } else {
      this._loadingSignal = null;
      if (value) {
        this.setAttribute("loading", "");
      } else {
        this.removeAttribute("loading");
      }
    }
  }
  get loading() {
    return this._loadingSignal || this.hasAttribute("loading");
  }
  render() {
    this.mount(STYLES$t, `<slot></slot>`);
  }
}
_init$s = __decoratorStart$s(_a$s);
SazamiCard = __decorateElement$s(_init$s, 0, "SazamiCard", _SazamiCard_decorators, SazamiCard);
__runInitializers$s(_init$s, 1, SazamiCard);
var __create$r = Object.create;
var __defProp$r = Object.defineProperty;
var __getOwnPropDesc$r = Object.getOwnPropertyDescriptor;
var __knownSymbol$r = (name, symbol) => (symbol = Symbol[name]) ? symbol : /* @__PURE__ */ Symbol.for("Symbol." + name);
var __typeError$r = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp$r = (obj, key, value) => key in obj ? __defProp$r(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __name$r = (target, value) => __defProp$r(target, "name", { value, configurable: true });
var __decoratorStart$r = (base) => [, , , __create$r(base?.[__knownSymbol$r("metadata")] ?? null)];
var __decoratorStrings$r = ["class", "method", "getter", "setter", "accessor", "field", "value", "get", "set"];
var __expectFn$r = (fn) => fn !== void 0 && typeof fn !== "function" ? __typeError$r("Function expected") : fn;
var __decoratorContext$r = (kind, name, done, metadata, fns) => ({ kind: __decoratorStrings$r[kind], name, metadata, addInitializer: (fn) => done._ ? __typeError$r("Already initialized") : fns.push(__expectFn$r(fn || null)) });
var __decoratorMetadata$r = (array, target) => __defNormalProp$r(target, __knownSymbol$r("metadata"), array[3]);
var __runInitializers$r = (array, flags, self, value) => {
  for (var i = 0, fns = array[flags >> 1], n = fns && fns.length; i < n; i++) fns[i].call(self);
  return value;
};
var __decorateElement$r = (array, flags, name, decorators, target, extra) => {
  var it, done, ctx, k2 = flags & 7, p2 = false;
  var j2 = 0;
  var extraInitializers = array[j2] || (array[j2] = []);
  var desc = k2 && (target = target.prototype, k2 < 5 && (k2 > 3 || !p2) && __getOwnPropDesc$r(target, name));
  __name$r(target, name);
  for (var i = decorators.length - 1; i >= 0; i--) {
    ctx = __decoratorContext$r(k2, name, done = {}, array[3], extraInitializers);
    it = (0, decorators[i])(target, ctx), done._ = 1;
    __expectFn$r(it) && (target = it);
  }
  return __decoratorMetadata$r(array, target), desc && __defProp$r(target, name, desc), p2 ? k2 ^ 4 ? extra : desc : target;
};
var _SazamiText_decorators, _init$r, _a$r;
const STYLES$s = `
:host {
  display: block;
  font-size: var(--saz-text-size-medium);
  font-weight: var(--saz-text-weight-normal);
  line-height: var(--saz-text-leading-normal);
  color: inherit;
}
${SIZE_RULES}
${TYPO_WEIGHT}
${TYPO_TONE}
:host([leading="tight"])  { line-height: var(--saz-text-leading-tight); }
:host([leading="normal"]) { line-height: var(--saz-text-leading-normal); }
:host([leading="loose"])  { line-height: var(--saz-text-leading-loose); }
`;
const textConfig = {
  observedAttributes: ["content"],
  properties: {
    size: { type: "string", reflect: false },
    weight: { type: "string", reflect: false },
    tone: { type: "string", reflect: false },
    leading: { type: "string", reflect: false }
  }
};
_SazamiText_decorators = [component(textConfig)];
class SazamiText extends (_a$r = SazamiComponent) {
  constructor() {
    super(...arguments);
    this._content = "";
    this._textNode = null;
  }
  _isReadable(value) {
    return isSignal(value) || value instanceof Derived;
  }
  set content(value) {
    this._content = value;
    if (this._isReadable(value)) {
      this._bindContentSignal(value);
    } else {
      this._setTextContent(value);
    }
  }
  get content() {
    return this._content;
  }
  _setTextContent(value) {
    if (this._textNode) {
      this._textNode.textContent = value ?? "";
    }
  }
  _bindContentSignal(sig) {
    const textNode = this._textNode;
    if (!textNode) return;
    const dispose = bindText(textNode, sig);
    this.onCleanup(dispose);
  }
  render() {
    this.mountSync(STYLES$s, `<slot></slot>`);
    const slot = this.shadow.querySelector("slot");
    if (slot) {
      this._textNode = document.createTextNode("");
      slot.replaceWith(this._textNode);
    } else {
      this._textNode = this.shadow.appendChild(document.createTextNode(""));
    }
    if (this._isReadable(this._content)) {
      this._bindContentSignal(this._content);
    } else {
      const staticContent = this._content;
      if (staticContent) {
        this._setTextContent(staticContent);
      } else {
        const slottedText = this.textContent?.trim() || "";
        if (slottedText) {
          this._setTextContent(slottedText);
        }
      }
    }
  }
  attributeChangedCallback(name, oldVal, newVal) {
    super.attributeChangedCallback(name, oldVal, newVal);
    if (name === "content" && newVal !== null) {
      this.content = newVal;
    }
  }
}
_init$r = __decoratorStart$r(_a$r);
SazamiText = __decorateElement$r(_init$r, 0, "SazamiText", _SazamiText_decorators, SazamiText);
__runInitializers$r(_init$r, 1, SazamiText);
var __create$q = Object.create;
var __defProp$q = Object.defineProperty;
var __getOwnPropDesc$q = Object.getOwnPropertyDescriptor;
var __knownSymbol$q = (name, symbol) => (symbol = Symbol[name]) ? symbol : /* @__PURE__ */ Symbol.for("Symbol." + name);
var __typeError$q = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp$q = (obj, key, value) => key in obj ? __defProp$q(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __name$q = (target, value) => __defProp$q(target, "name", { value, configurable: true });
var __decoratorStart$q = (base) => [, , , __create$q(base?.[__knownSymbol$q("metadata")] ?? null)];
var __decoratorStrings$q = ["class", "method", "getter", "setter", "accessor", "field", "value", "get", "set"];
var __expectFn$q = (fn) => fn !== void 0 && typeof fn !== "function" ? __typeError$q("Function expected") : fn;
var __decoratorContext$q = (kind, name, done, metadata, fns) => ({ kind: __decoratorStrings$q[kind], name, metadata, addInitializer: (fn) => done._ ? __typeError$q("Already initialized") : fns.push(__expectFn$q(fn || null)) });
var __decoratorMetadata$q = (array, target) => __defNormalProp$q(target, __knownSymbol$q("metadata"), array[3]);
var __runInitializers$q = (array, flags, self, value) => {
  for (var i = 0, fns = array[flags >> 1], n = fns && fns.length; i < n; i++) fns[i].call(self);
  return value;
};
var __decorateElement$q = (array, flags, name, decorators, target, extra) => {
  var it, done, ctx, k2 = flags & 7, p2 = false;
  var j2 = 0;
  var extraInitializers = array[j2] || (array[j2] = []);
  var desc = k2 && (target = target.prototype, k2 < 5 && (k2 > 3 || !p2) && __getOwnPropDesc$q(target, name));
  __name$q(target, name);
  for (var i = decorators.length - 1; i >= 0; i--) {
    ctx = __decoratorContext$q(k2, name, done = {}, array[3], extraInitializers);
    it = (0, decorators[i])(target, ctx), done._ = 1;
    __expectFn$q(it) && (target = it);
  }
  return __decoratorMetadata$q(array, target), desc && __defProp$q(target, name, desc), p2 ? k2 ^ 4 ? extra : desc : target;
};
var _SazamiHeading_decorators, _init$q, _a$q;
const STYLES$r = `
:host {
  display: block;
  font-size: var(--saz-text-size-xlarge);
  font-weight: var(--saz-text-weight-bold);
  line-height: var(--saz-text-leading-tight);
  color: inherit;
  margin: 0 0 var(--saz-space-small) 0;
}
${SIZE_RULES}
${TYPO_WEIGHT}
${TYPO_TONE}
`;
const headingConfig = {
  observedAttributes: ["content"],
  properties: {
    size: { type: "string", reflect: false },
    weight: { type: "string", reflect: false },
    tone: { type: "string", reflect: false }
  }
};
_SazamiHeading_decorators = [component(headingConfig)];
class SazamiHeading extends (_a$q = SazamiComponent) {
  constructor() {
    super(...arguments);
    this._content = "";
    this._contentSignal = null;
    this._textNode = null;
  }
  _isReadable(value) {
    return isSignal(value) || value instanceof Derived;
  }
  set content(value) {
    this._content = value;
    if (this._isReadable(value)) {
      this._contentSignal = value;
      this._setupSignalBinding();
    } else {
      this._contentSignal = null;
      this._setTextContent(value);
    }
  }
  get content() {
    return this._content;
  }
  _setTextContent(value) {
    if (this._textNode) {
      this._textNode.textContent = value ?? "";
    }
  }
  _setupSignalBinding() {
    const textNode = this._textNode;
    if (!textNode) return;
    const dispose = bindText(textNode, this._contentSignal);
    this.onCleanup(dispose);
  }
  render() {
    this.mountSync(STYLES$r, `<slot></slot>`);
    const slot = this.shadow.querySelector("slot");
    if (slot) {
      this._textNode = document.createTextNode("");
      slot.replaceWith(this._textNode);
    } else {
      this._textNode = this.shadow.appendChild(document.createTextNode(""));
    }
    if (this._contentSignal) {
      this._setupSignalBinding();
    } else {
      this._setTextContent(this._content);
    }
  }
  attributeChangedCallback(name, oldVal, newVal) {
    super.attributeChangedCallback(name, oldVal, newVal);
    if (name === "content" && newVal !== null) {
      this.content = newVal;
    }
  }
}
_init$q = __decoratorStart$q(_a$q);
SazamiHeading = __decorateElement$q(_init$q, 0, "SazamiHeading", _SazamiHeading_decorators, SazamiHeading);
__runInitializers$q(_init$q, 1, SazamiHeading);
var __create$p = Object.create;
var __defProp$p = Object.defineProperty;
var __getOwnPropDesc$p = Object.getOwnPropertyDescriptor;
var __knownSymbol$p = (name, symbol) => (symbol = Symbol[name]) ? symbol : /* @__PURE__ */ Symbol.for("Symbol." + name);
var __typeError$p = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp$p = (obj, key, value) => key in obj ? __defProp$p(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __name$p = (target, value) => __defProp$p(target, "name", { value, configurable: true });
var __decoratorStart$p = (base) => [, , , __create$p(base?.[__knownSymbol$p("metadata")] ?? null)];
var __decoratorStrings$p = ["class", "method", "getter", "setter", "accessor", "field", "value", "get", "set"];
var __expectFn$p = (fn) => fn !== void 0 && typeof fn !== "function" ? __typeError$p("Function expected") : fn;
var __decoratorContext$p = (kind, name, done, metadata, fns) => ({ kind: __decoratorStrings$p[kind], name, metadata, addInitializer: (fn) => done._ ? __typeError$p("Already initialized") : fns.push(__expectFn$p(fn || null)) });
var __decoratorMetadata$p = (array, target) => __defNormalProp$p(target, __knownSymbol$p("metadata"), array[3]);
var __runInitializers$p = (array, flags, self, value) => {
  for (var i = 0, fns = array[flags >> 1], n = fns && fns.length; i < n; i++) fns[i].call(self);
  return value;
};
var __decorateElement$p = (array, flags, name, decorators, target, extra) => {
  var it, done, ctx, k2 = flags & 7, p2 = false;
  var j2 = 0;
  var extraInitializers = array[j2] || (array[j2] = []);
  var desc = k2 && (target = target.prototype, k2 < 5 && (k2 > 3 || !p2) && __getOwnPropDesc$p(target, name));
  __name$p(target, name);
  for (var i = decorators.length - 1; i >= 0; i--) {
    ctx = __decoratorContext$p(k2, name, done = {}, array[3], extraInitializers);
    it = (0, decorators[i])(target, ctx), done._ = 1;
    __expectFn$p(it) && (target = it);
  }
  return __decoratorMetadata$p(array, target), desc && __defProp$p(target, name, desc), p2 ? k2 ^ 4 ? extra : desc : target;
};
var _SazamiLabel_decorators, _init$p, _a$p;
const STYLES$q = `
:host {
  display: block;
  font-size: var(--saz-text-size-small);
  font-weight: var(--saz-text-weight-medium);
  color: var(--saz-color-text-dim);
  margin-bottom: var(--saz-space-tiny);
  line-height: var(--saz-text-leading-normal);
  cursor: default;
  user-select: none;
}
`;
const labelConfig = {
  observedAttributes: ["content"],
  properties: {
    for: { type: "string", reflect: true }
  }
};
_SazamiLabel_decorators = [component(labelConfig)];
class SazamiLabel extends (_a$p = SazamiComponent) {
  constructor() {
    super(...arguments);
    this._content = "";
    this._contentSignal = null;
    this._textNode = null;
    this._contentDispose = null;
  }
  _isReadable(value) {
    return isSignal(value) || value instanceof Derived;
  }
  set content(value) {
    this._content = value;
    if (this._isReadable(value)) {
      this._contentSignal = value;
      this._setupSignalBinding();
    } else {
      this._contentSignal = null;
      if (this._contentDispose) {
        this._contentDispose();
        this._contentDispose = null;
      }
      this._setTextContent(value);
    }
  }
  get content() {
    return this._content;
  }
  _setTextContent(value) {
    if (this._textNode) {
      this._textNode.textContent = value ?? "";
    }
  }
  _setupSignalBinding() {
    const textNode = this._textNode;
    if (!textNode) return;
    if (this._contentDispose) {
      this._contentDispose();
    }
    const dispose = bindText(textNode, this._contentSignal);
    this._contentDispose = dispose;
    this.onCleanup(dispose);
  }
  render() {
    this.mountSync(STYLES$q, `<label><slot></slot></label>`);
    const label = this.shadow.querySelector("label");
    if (label) {
      if (!this._textNode) {
        this._textNode = document.createTextNode("");
        label.prepend(this._textNode);
      }
      if (this._contentSignal) {
        this._setupSignalBinding();
      } else {
        this._setTextContent(this._content);
      }
      if (this.hasAttribute("for")) {
        label.setAttribute("for", this.getAttribute("for") || "");
      }
    }
  }
  attributeChangedCallback(name, oldVal, newVal) {
    super.attributeChangedCallback(name, oldVal, newVal);
    if (name === "content" && newVal !== null) {
      this.content = newVal;
    }
  }
}
_init$p = __decoratorStart$p(_a$p);
SazamiLabel = __decorateElement$p(_init$p, 0, "SazamiLabel", _SazamiLabel_decorators, SazamiLabel);
__runInitializers$p(_init$p, 1, SazamiLabel);
var __create$o = Object.create;
var __defProp$o = Object.defineProperty;
var __getOwnPropDesc$o = Object.getOwnPropertyDescriptor;
var __knownSymbol$o = (name, symbol) => (symbol = Symbol[name]) ? symbol : /* @__PURE__ */ Symbol.for("Symbol." + name);
var __typeError$o = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp$o = (obj, key, value) => key in obj ? __defProp$o(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __name$o = (target, value) => __defProp$o(target, "name", { value, configurable: true });
var __decoratorStart$o = (base) => [, , , __create$o(base?.[__knownSymbol$o("metadata")] ?? null)];
var __decoratorStrings$o = ["class", "method", "getter", "setter", "accessor", "field", "value", "get", "set"];
var __expectFn$o = (fn) => fn !== void 0 && typeof fn !== "function" ? __typeError$o("Function expected") : fn;
var __decoratorContext$o = (kind, name, done, metadata, fns) => ({ kind: __decoratorStrings$o[kind], name, metadata, addInitializer: (fn) => done._ ? __typeError$o("Already initialized") : fns.push(__expectFn$o(fn || null)) });
var __decoratorMetadata$o = (array, target) => __defNormalProp$o(target, __knownSymbol$o("metadata"), array[3]);
var __runInitializers$o = (array, flags, self, value) => {
  for (var i = 0, fns = array[flags >> 1], n = fns && fns.length; i < n; i++) fns[i].call(self);
  return value;
};
var __decorateElement$o = (array, flags, name, decorators, target, extra) => {
  var it, done, ctx, k2 = flags & 7, p2 = false;
  var j2 = 0;
  var extraInitializers = array[j2] || (array[j2] = []);
  var desc = k2 && (target = target.prototype, k2 < 5 && (k2 > 3 || !p2) && __getOwnPropDesc$o(target, name));
  __name$o(target, name);
  for (var i = decorators.length - 1; i >= 0; i--) {
    ctx = __decoratorContext$o(k2, name, done = {}, array[3], extraInitializers);
    it = (0, decorators[i])(target, ctx), done._ = 1;
    __expectFn$o(it) && (target = it);
  }
  return __decoratorMetadata$o(array, target), desc && __defProp$o(target, name, desc), p2 ? k2 ^ 4 ? extra : desc : target;
};
var _SazamiButton_decorators, _init$o, _a$o;
const STYLES$p = `
:host {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--saz-space-small);
  padding: var(--saz-space-small) var(--saz-space-large);
  border: 1px solid transparent;
  border-radius: var(--saz-radius-medium);
  font-size: var(--saz-text-size-medium);
  font-weight: var(--saz-text-weight-medium);
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
  transition: background 0.2s ease, color 0.2s ease,
              box-shadow 0.2s ease, opacity 0.2s ease,
              transform 0.15s ease;
  background: var(--saz-color-primary);
  color: var(--saz-color-on-primary);
}
${SIZE_PADDING_RULES}
${VARIANT_BG_RULES}
${SHAPE_RULES}
${STATE_DISABLED}
${STATE_LOADING}
${STATE_ACTIVE}
${INTERACTIVE_FOCUS}
${INTERACTIVE_HOVER}
${TYPO_TONE}
`;
const buttonConfig = {
  properties: {
    disabled: { type: "boolean", reflect: true },
    loading: { type: "boolean", reflect: true },
    active: { type: "boolean", reflect: true },
    size: { type: "string", reflect: true },
    variant: { type: "string", reflect: true },
    shape: { type: "string", reflect: true },
    tone: { type: "string", reflect: true }
  },
  events: {
    click: { name: "saz-click", detail: {} }
  }
};
_SazamiButton_decorators = [component(buttonConfig)];
class SazamiButton extends (_a$o = SazamiComponent) {
  constructor() {
    super(...arguments);
    this._disabledSignal = null;
    this._disabledValue = false;
    this._disabledDispose = null;
    this._handleClick = () => {
      if (this._getIsDisabled()) return;
      this.dispatchEventTyped("click", {});
    };
    this._handleKeydown = (e) => {
      if (this._getIsDisabled()) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        this.click();
      }
    };
  }
  _isReadableBool(value) {
    return isSignal(value) || value instanceof Derived;
  }
  set disabled(value) {
    if (this._disabledDispose) {
      this._disabledDispose();
      this._disabledDispose = null;
    }
    if (this._isReadableBool(value)) {
      this._disabledSignal = value;
      const dispose = bindDisabled(this, value);
      this._disabledDispose = dispose;
    } else {
      this._disabledSignal = null;
      this._setDisabled(value);
    }
  }
  get disabled() {
    return this._disabledSignal || this._disabledValue;
  }
  _setDisabled(value) {
    this._disabledValue = value;
    if (value) {
      this.setAttribute("disabled", "");
    } else {
      this.removeAttribute("disabled");
    }
  }
  _getIsDisabled() {
    let baseDisabled = false;
    if (this._disabledSignal) {
      baseDisabled = this._disabledSignal.get();
    } else if (this._disabledValue) {
      baseDisabled = true;
    } else if (this.hasAttribute("disabled")) {
      baseDisabled = true;
    }
    return baseDisabled || !!this.loading;
  }
  render() {
    this.mount(STYLES$p, `<slot></slot>`);
    if (!this.hasAttribute("role")) this.setAttribute("role", "button");
    const isInert = this._getIsDisabled();
    if (isInert) {
      this.setAttribute("aria-disabled", "true");
      this.setAttribute("tabindex", "-1");
    } else {
      this.removeAttribute("aria-disabled");
      const currentTabindex = this.getAttribute("tabindex");
      if (currentTabindex === "-1" || !this.hasAttribute("tabindex")) {
        this.setAttribute("tabindex", "0");
      }
    }
    this.removeHandler("click", this._handleClick);
    this.removeHandler("keydown", this._handleKeydown);
    this.addHandler("click", this._handleClick, { internal: true });
    this.addHandler("keydown", this._handleKeydown, { internal: true });
  }
}
_init$o = __decoratorStart$o(_a$o);
SazamiButton = __decorateElement$o(_init$o, 0, "SazamiButton", _SazamiButton_decorators, SazamiButton);
__runInitializers$o(_init$o, 1, SazamiButton);
const __vite_glob_0_0 = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>\n';
const __vite_glob_0_1 = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>';
const __vite_glob_0_2 = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>';
const __vite_glob_0_3 = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>';
const __vite_glob_0_4 = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>';
const __vite_glob_0_5 = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>\n';
const __vite_glob_0_6 = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>\n';
const __vite_glob_0_7 = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>';
const __vite_glob_0_8 = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>\n';
const __vite_glob_0_9 = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
const __vite_glob_0_10 = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>\n';
const __vite_glob_0_11 = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>\n';
const __vite_glob_0_12 = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>\n';
const __vite_glob_0_13 = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>';
const __vite_glob_0_14 = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>';
const __vite_glob_0_15 = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>\n';
const __vite_glob_0_16 = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>';
const __vite_glob_0_17 = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>\n';
const __vite_glob_0_18 = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>\n';
const __vite_glob_0_19 = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>';
const __vite_glob_0_20 = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>';
const __vite_glob_0_21 = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>';
const __vite_glob_0_22 = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>';
const __vite_glob_0_23 = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>\n';
const __vite_glob_0_24 = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>\n';
const __vite_glob_0_25 = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><polygon points="8,5 8,19 17,12"/><rect x="17" y="5" width="2" height="14"/></svg>\n';
const __vite_glob_0_26 = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>\n';
const __vite_glob_0_27 = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>';
const __vite_glob_0_28 = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>';
const __vite_glob_0_29 = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><polygon points="8,5 19,12 8,19"/></svg>\n';
const __vite_glob_0_30 = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>\n';
const __vite_glob_0_31 = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><polygon points="16,5 16,19 7,12"/><rect x="5" y="5" width="2" height="14"/></svg>\n';
const __vite_glob_0_32 = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>\n';
const __vite_glob_0_33 = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="21" y2="21"/></svg>\n';
const __vite_glob_0_34 = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>\n';
const __vite_glob_0_35 = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>\n';
const __vite_glob_0_36 = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><polygon points="6,5 6,19 13,12"/><polygon points="13,5 13,19 20,12"/></svg>\n';
const __vite_glob_0_37 = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><circle cx="12" cy="12" r="10" stroke-opacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"/></svg>\n';
const __vite_glob_0_38 = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>\n';
const __vite_glob_0_39 = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="12" height="14" rx="1"/></svg>\n';
const __vite_glob_0_40 = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>';
const __vite_glob_0_41 = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>\n';
const __vite_glob_0_42 = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>\n';
const __vite_glob_0_43 = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
const __vite_glob_0_44 = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>';
const iconModules = /* @__PURE__ */ Object.assign({
  "./back.svg": __vite_glob_0_0,
  "./bell.svg": __vite_glob_0_1,
  "./bookmark.svg": __vite_glob_0_2,
  "./calendar.svg": __vite_glob_0_3,
  "./camera.svg": __vite_glob_0_4,
  "./check.svg": __vite_glob_0_5,
  "./chevron-down.svg": __vite_glob_0_6,
  "./clock.svg": __vite_glob_0_7,
  "./close.svg": __vite_glob_0_8,
  "./copy.svg": __vite_glob_0_9,
  "./down.svg": __vite_glob_0_10,
  "./download.svg": __vite_glob_0_11,
  "./edit.svg": __vite_glob_0_12,
  "./file.svg": __vite_glob_0_13,
  "./folder.svg": __vite_glob_0_14,
  "./forward.svg": __vite_glob_0_15,
  "./globe.svg": __vite_glob_0_16,
  "./heart.svg": __vite_glob_0_17,
  "./home.svg": __vite_glob_0_18,
  "./image.svg": __vite_glob_0_19,
  "./link.svg": __vite_glob_0_20,
  "./lock.svg": __vite_glob_0_21,
  "./mail.svg": __vite_glob_0_22,
  "./menu.svg": __vite_glob_0_23,
  "./minus.svg": __vite_glob_0_24,
  "./next.svg": __vite_glob_0_25,
  "./pause.svg": __vite_glob_0_26,
  "./phone.svg": __vite_glob_0_27,
  "./pin.svg": __vite_glob_0_28,
  "./play.svg": __vite_glob_0_29,
  "./plus.svg": __vite_glob_0_30,
  "./previous.svg": __vite_glob_0_31,
  "./refresh.svg": __vite_glob_0_32,
  "./search.svg": __vite_glob_0_33,
  "./settings.svg": __vite_glob_0_34,
  "./share.svg": __vite_glob_0_35,
  "./skip.svg": __vite_glob_0_36,
  "./spinner.svg": __vite_glob_0_37,
  "./star.svg": __vite_glob_0_38,
  "./stop.svg": __vite_glob_0_39,
  "./trash.svg": __vite_glob_0_40,
  "./up.svg": __vite_glob_0_41,
  "./upload.svg": __vite_glob_0_42,
  "./user.svg": __vite_glob_0_43,
  "./users.svg": __vite_glob_0_44
});
const ICON_SVGS = {};
for (const path in iconModules) {
  const name = path.replace("./", "").replace(".svg", "");
  ICON_SVGS[name] = iconModules[path];
}
var __create$n = Object.create;
var __defProp$n = Object.defineProperty;
var __getOwnPropDesc$n = Object.getOwnPropertyDescriptor;
var __knownSymbol$n = (name, symbol) => (symbol = Symbol[name]) ? symbol : /* @__PURE__ */ Symbol.for("Symbol." + name);
var __typeError$n = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp$n = (obj, key, value) => key in obj ? __defProp$n(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __name$n = (target, value) => __defProp$n(target, "name", { value, configurable: true });
var __decoratorStart$n = (base) => [, , , __create$n(base?.[__knownSymbol$n("metadata")] ?? null)];
var __decoratorStrings$n = ["class", "method", "getter", "setter", "accessor", "field", "value", "get", "set"];
var __expectFn$n = (fn) => fn !== void 0 && typeof fn !== "function" ? __typeError$n("Function expected") : fn;
var __decoratorContext$n = (kind, name, done, metadata, fns) => ({ kind: __decoratorStrings$n[kind], name, metadata, addInitializer: (fn) => done._ ? __typeError$n("Already initialized") : fns.push(__expectFn$n(fn || null)) });
var __decoratorMetadata$n = (array, target) => __defNormalProp$n(target, __knownSymbol$n("metadata"), array[3]);
var __runInitializers$n = (array, flags, self, value) => {
  for (var i = 0, fns = array[flags >> 1], n = fns && fns.length; i < n; i++) fns[i].call(self);
  return value;
};
var __decorateElement$n = (array, flags, name, decorators, target, extra) => {
  var it, done, ctx, k2 = flags & 7, p2 = false;
  var j2 = 0;
  var extraInitializers = array[j2] || (array[j2] = []);
  var desc = k2 && (target = target.prototype, k2 < 5 && (k2 > 3 || !p2) && __getOwnPropDesc$n(target, name));
  __name$n(target, name);
  for (var i = decorators.length - 1; i >= 0; i--) {
    ctx = __decoratorContext$n(k2, name, done = {}, array[3], extraInitializers);
    it = (0, decorators[i])(target, ctx), done._ = 1;
    __expectFn$n(it) && (target = it);
  }
  return __decoratorMetadata$n(array, target), desc && __defProp$n(target, name, desc), p2 ? k2 ^ 4 ? extra : desc : target;
};
var _SazamiIconButton_decorators, _init$n, _a$n;
const STYLES$o = `
:host {
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--saz-space-small);
  border: none;
  border-radius: var(--saz-radius-round);
  background: transparent;
  color: var(--saz-color-text);
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease, transform 0.1s ease;
  line-height: 1;
}
:host(:hover) {
  background: var(--saz-color-surface-hover);
}
:host(:active) {
  background: var(--saz-color-surface-active);
  transform: scale(0.75);
}
${VARIANT_TEXT_RULES}
${STATE_DISABLED}
${STATE_ACTIVE}
${INTERACTIVE_FOCUS}
:host([size="small"]) { padding: var(--saz-space-tiny); }
:host([size="large"]) { padding: var(--saz-space-medium); }
:host([size="xlarge"]) { padding: var(--saz-space-large); }
.icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--saz-icon-size-medium);
  height: var(--saz-icon-size-medium);
}
:host([size="small"]) .icon {
  width: var(--saz-icon-size-small);
  height: var(--saz-icon-size-small);
}
:host([size="large"]) .icon {
  width: var(--saz-icon-size-large);
  height: var(--saz-icon-size-large);
}
:host([size="xlarge"]) .icon {
  width: var(--saz-icon-size-xlarge);
  height: var(--saz-icon-size-xlarge);
}
.icon svg { width: 100%; height: 100%; pointer-events: none; }
`;
const iconButtonConfig = {
  properties: {
    icon: { type: "string", reflect: true },
    size: { type: "string", reflect: true },
    variant: { type: "string", reflect: true }
  },
  events: {
    click: { name: "saz-click", detail: {} }
  }
};
_SazamiIconButton_decorators = [component(iconButtonConfig)];
class SazamiIconButton extends (_a$n = SazamiComponent) {
  constructor() {
    super(...arguments);
    this._handlersAdded = false;
    this._autoAriaLabel = false;
    this._disabledSignal = null;
    this._handleClick = () => {
      if (this._getIsDisabled()) return;
      this.dispatchEventTyped("click", {});
    };
    this._handleKeydown = (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        this._handleClick();
      }
    };
  }
  _isReadableBool(value) {
    return isSignal(value) || value instanceof Derived;
  }
  set disabled(value) {
    if (this._isReadableBool(value)) {
      this._disabledSignal = value;
      this.bindDisabled(":host", value);
    } else {
      this._disabledSignal = null;
      this._setDisabled(value);
    }
  }
  get disabled() {
    return this._disabledSignal || this._disabled || false;
  }
  _setDisabled(value) {
    this._disabled = value;
    if (value) {
      this.setAttribute("disabled", "");
    } else {
      this.removeAttribute("disabled");
    }
  }
  _getIsDisabled() {
    if (this._disabledSignal) return this._disabledSignal.get();
    if (this._disabled !== void 0) return !!this._disabled;
    return this.hasAttribute("disabled");
  }
  render() {
    const icon = this.getAttribute("icon") || this.textContent?.trim() || "";
    const svg = ICON_SVGS[icon];
    if (svg) {
      this.mount(
        STYLES$o,
        `
        <div class="icon">${svg}</div>
      `
      );
    } else {
      this.mount(STYLES$o, `<div class="icon"><span class="glyph"></span></div>`);
      const glyph = this.$(".glyph");
      if (glyph) glyph.textContent = icon;
    }
    if (!this.hasAttribute("role")) this.setAttribute("role", "button");
    this._updateTabIndex();
    if (!this.hasAttribute("aria-label")) {
      this.setAttribute("aria-label", icon);
      this._autoAriaLabel = true;
    } else {
      this._autoAriaLabel = false;
    }
    if (!this._handlersAdded) {
      this._handlersAdded = true;
      this.addHandler("click", this._handleClick, { internal: true });
      this.addHandler("keydown", this._handleKeydown, { internal: true });
    }
  }
  _updateTabIndex() {
    if (this._getIsDisabled()) {
      this.setAttribute("tabindex", "-1");
      this.setAttribute("aria-disabled", "true");
    } else {
      this.setAttribute("tabindex", "0");
      this.removeAttribute("aria-disabled");
    }
  }
  static get observedAttributes() {
    return ["disabled", "icon", "size", "variant"];
  }
  attributeChangedCallback(name, oldVal, newVal) {
    if (oldVal === newVal) return;
    if (name === "disabled") {
      this._updateTabIndex();
    }
    if (name === "icon") {
      if (this._autoAriaLabel) {
        this.removeAttribute("aria-label");
      }
      this.render();
    } else if (name === "size" || name === "variant") {
      this.render();
    }
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this._handlersAdded = false;
  }
}
_init$n = __decoratorStart$n(_a$n);
SazamiIconButton = __decorateElement$n(_init$n, 0, "SazamiIconButton", _SazamiIconButton_decorators, SazamiIconButton);
__runInitializers$n(_init$n, 1, SazamiIconButton);
const HTML_ESCAPE_MAP = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
};
const HTML_UNESCAPE_MAP = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'"
};
function escapeHtml(str) {
  return str.replace(/[&<>"']/g, (char) => HTML_ESCAPE_MAP[char] || char);
}
function unescapeHtml(str) {
  return str.replace(
    /&(?:amp|lt|gt|quot|#39);/g,
    (entity) => HTML_UNESCAPE_MAP[entity] || entity
  );
}
function escapeUrl(str) {
  return encodeURIComponent(str);
}
function escapeCss(str) {
  return str.replace(/[!"#$%&'()*+,.\/:;<=>?@[\\\]^`{|}~]/g, "\\$&");
}
var __create$m = Object.create;
var __defProp$m = Object.defineProperty;
var __getOwnPropDesc$m = Object.getOwnPropertyDescriptor;
var __knownSymbol$m = (name, symbol) => (symbol = Symbol[name]) ? symbol : /* @__PURE__ */ Symbol.for("Symbol." + name);
var __typeError$m = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp$m = (obj, key, value) => key in obj ? __defProp$m(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __name$m = (target, value) => __defProp$m(target, "name", { value, configurable: true });
var __decoratorStart$m = (base) => [, , , __create$m(base?.[__knownSymbol$m("metadata")] ?? null)];
var __decoratorStrings$m = ["class", "method", "getter", "setter", "accessor", "field", "value", "get", "set"];
var __expectFn$m = (fn) => fn !== void 0 && typeof fn !== "function" ? __typeError$m("Function expected") : fn;
var __decoratorContext$m = (kind, name, done, metadata, fns) => ({ kind: __decoratorStrings$m[kind], name, metadata, addInitializer: (fn) => done._ ? __typeError$m("Already initialized") : fns.push(__expectFn$m(fn || null)) });
var __decoratorMetadata$m = (array, target) => __defNormalProp$m(target, __knownSymbol$m("metadata"), array[3]);
var __runInitializers$m = (array, flags, self, value) => {
  for (var i = 0, fns = array[flags >> 1], n = fns && fns.length; i < n; i++) fns[i].call(self);
  return value;
};
var __decorateElement$m = (array, flags, name, decorators, target, extra) => {
  var it, done, ctx, k2 = flags & 7, p2 = false;
  var j2 = 0;
  var extraInitializers = array[j2] || (array[j2] = []);
  var desc = k2 && (target = target.prototype, k2 < 5 && (k2 > 3 || !p2) && __getOwnPropDesc$m(target, name));
  __name$m(target, name);
  for (var i = decorators.length - 1; i >= 0; i--) {
    ctx = __decoratorContext$m(k2, name, done = {}, array[3], extraInitializers);
    it = (0, decorators[i])(target, ctx), done._ = 1;
    __expectFn$m(it) && (target = it);
  }
  return __decoratorMetadata$m(array, target), desc && __defProp$m(target, name, desc), p2 ? k2 ^ 4 ? extra : desc : target;
};
var _SazamiInput_decorators, _init$m, _a$m;
const STYLES$n = `
:host { display: block; }
input {
  width: 100%;
  padding: var(--saz-space-small) var(--saz-space-large);
  border: 1px solid var(--saz-color-border);
  border-radius: var(--saz-radius-medium);
  font-size: var(--saz-text-size-medium);
  font-family: inherit;
  color: var(--saz-color-text);
  background: var(--saz-color-background);
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
  box-sizing: border-box;
}
input:focus {
  border-color: var(--saz-color-primary);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
}
input::placeholder { color: var(--saz-color-text-dimmer); }
${SIZE_PADDING_RULES}
${STATE_DISABLED}
:host([variant="accent"]) input:focus {
  border-color: var(--saz-color-accent);
  box-shadow: 0 0 0 3px rgba(255, 77, 138, 0.15);
}
`;
const inputConfig = {
  properties: {
    placeholder: { type: "string", reflect: false },
    type: { type: "string", reflect: false },
    size: { type: "string", reflect: false },
    variant: { type: "string", reflect: false },
    disabled: { type: "boolean", reflect: false }
  },
  events: {
    input: { name: "saz-input", detail: { value: "value" } }
  }
};
_SazamiInput_decorators = [component(inputConfig)];
class SazamiInput extends (_a$m = SazamiComponent) {
  constructor() {
    super(...arguments);
    this._valueSignal = null;
    this._input = null;
    this._valueEffectDisposer = null;
    this._inputHandler = null;
  }
  _isReadableStr(value) {
    return isSignal(value) || value instanceof Derived;
  }
  set value(valueOrSignal) {
    if (this._isReadableStr(valueOrSignal)) {
      this._disposeValueBindings();
      this._valueSignal = valueOrSignal;
      if (this._input) {
        this._input.value = valueOrSignal.get();
        const dispose = effect(() => {
          const val = valueOrSignal.get();
          if (this._input && this._input.value !== val) {
            this._input.value = val;
          }
        });
        this._valueEffectDisposer = dispose;
        this.onCleanup(dispose);
        this._inputHandler = (e) => {
          const target = e.target;
          valueOrSignal.set(target.value);
        };
        this._input.addEventListener("input", this._inputHandler);
        this.onCleanup(() => {
          if (this._input && this._inputHandler) {
            this._input.removeEventListener("input", this._inputHandler);
          }
        });
      }
    } else {
      this._disposeValueBindings();
      this._valueSignal = null;
      this._value = valueOrSignal;
      if (this._input && this._input.value !== valueOrSignal) {
        this._input.value = valueOrSignal || "";
      }
    }
  }
  _disposeValueBindings() {
    if (this._valueEffectDisposer) {
      this._valueEffectDisposer();
      this._valueEffectDisposer = null;
    }
    if (this._inputHandler && this._input) {
      this._input.removeEventListener("input", this._inputHandler);
      this._inputHandler = null;
    }
  }
  get value() {
    if (this._valueSignal) return this._valueSignal.get();
    if (this._value) return this._value;
    if (this._input) return this._input.value;
    return this.getAttribute("value") || "";
  }
  render() {
    this._disposeValueBindings();
    const placeholder = this.getAttribute("placeholder") || "";
    const type = this.getAttribute("type") || "text";
    const initialValue = this._valueSignal ? this._valueSignal.get() : this.getAttribute("value") || this._value || "";
    this.mount(
      STYLES$n,
      `
      <input type="${escapeHtml(type)}" placeholder="${escapeHtml(placeholder)}" value="${escapeHtml(initialValue)}" ${this.disabled ? "disabled" : ""} />
    `
    );
    this._input = this.$("input");
    if (this._input) {
      this.removeAllHandlers({ type: "input", source: "internal" });
      if (this._valueSignal) {
        this._valueEffectDisposer = effect(() => {
          const val = this._valueSignal.get();
          if (this._input && this._input.value !== val) {
            this._input.value = val;
          }
        });
        this.onCleanup(this._valueEffectDisposer);
        this._inputHandler = (e) => {
          const target = e.target;
          if (isSignal(this._valueSignal)) {
            this._valueSignal.set(target.value);
          }
          this.dispatchEventTyped("input", { value: target.value });
        };
        this._input.addEventListener("input", this._inputHandler);
        this.onCleanup(() => {
          if (this._input && this._inputHandler) {
            this._input.removeEventListener("input", this._inputHandler);
          }
        });
      } else {
        this.addHandler(
          "input",
          (e) => {
            const target = e.target;
            this._value = target.value;
            this.dispatchEventTyped("input", { value: target.value });
          },
          { internal: true, element: this._input }
        );
      }
    }
  }
  static get observedAttributes() {
    return ["value", "disabled", "placeholder", "type"];
  }
  attributeChangedCallback(name, oldVal, newVal) {
    if (!this._input) return;
    if (name === "value") {
      if (this._valueSignal) return;
      if (newVal === null) {
        if (this._input.value !== "") this._input.value = "";
      } else if (this._input.value !== newVal) {
        this._input.value = newVal;
      }
    } else if (name === "disabled") {
      this._input.disabled = newVal !== null;
    } else if (name === "placeholder") {
      this._input.placeholder = newVal ?? "";
    } else if (name === "type") {
      this._input.type = newVal ?? "text";
    }
  }
}
_init$m = __decoratorStart$m(_a$m);
SazamiInput = __decorateElement$m(_init$m, 0, "SazamiInput", _SazamiInput_decorators, SazamiInput);
__runInitializers$m(_init$m, 1, SazamiInput);
var __create$l = Object.create;
var __defProp$l = Object.defineProperty;
var __getOwnPropDesc$l = Object.getOwnPropertyDescriptor;
var __knownSymbol$l = (name, symbol) => (symbol = Symbol[name]) ? symbol : /* @__PURE__ */ Symbol.for("Symbol." + name);
var __typeError$l = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp$l = (obj, key, value) => key in obj ? __defProp$l(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __name$l = (target, value) => __defProp$l(target, "name", { value, configurable: true });
var __decoratorStart$l = (base) => [, , , __create$l(base?.[__knownSymbol$l("metadata")] ?? null)];
var __decoratorStrings$l = ["class", "method", "getter", "setter", "accessor", "field", "value", "get", "set"];
var __expectFn$l = (fn) => fn !== void 0 && typeof fn !== "function" ? __typeError$l("Function expected") : fn;
var __decoratorContext$l = (kind, name, done, metadata, fns) => ({ kind: __decoratorStrings$l[kind], name, metadata, addInitializer: (fn) => done._ ? __typeError$l("Already initialized") : fns.push(__expectFn$l(fn || null)) });
var __decoratorMetadata$l = (array, target) => __defNormalProp$l(target, __knownSymbol$l("metadata"), array[3]);
var __runInitializers$l = (array, flags, self, value) => {
  for (var i = 0, fns = array[flags >> 1], n = fns && fns.length; i < n; i++) fns[i].call(self);
  return value;
};
var __decorateElement$l = (array, flags, name, decorators, target, extra) => {
  var it, done, ctx, k2 = flags & 7, p2 = false;
  var j2 = 0;
  var extraInitializers = array[j2] || (array[j2] = []);
  var desc = k2 && (target = target.prototype, k2 < 5 && (k2 > 3 || !p2) && __getOwnPropDesc$l(target, name));
  __name$l(target, name);
  for (var i = decorators.length - 1; i >= 0; i--) {
    ctx = __decoratorContext$l(k2, name, done = {}, array[3], extraInitializers);
    it = (0, decorators[i])(target, ctx), done._ = 1;
    __expectFn$l(it) && (target = it);
  }
  return __decoratorMetadata$l(array, target), desc && __defProp$l(target, name, desc), p2 ? k2 ^ 4 ? extra : desc : target;
};
var _SazamiCheckbox_decorators, _init$l, _a$l;
const STYLES$m = `
:host {
  display: inline-flex;
  align-items: center;
  align-self: center;
  vertical-align: middle;
  height: fit-content;
  gap: var(--saz-space-small);
  cursor: pointer;
  user-select: none;
}
.box {
  width: 18px;
  height: 18px;
  border: 2px solid var(--saz-color-border);
  border-radius: var(--saz-radius-soft);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s ease, border-color 0.15s ease;
  flex-shrink: 0;
  align-self: center;
  background: var(--saz-color-background);
}
:host([checked]) .box {
  background: var(--saz-color-primary);
  border-color: var(--saz-color-primary);
}
.check {
  color: #fff;
  width: 12px;
  height: 12px;
  opacity: 0;
  transition: opacity 0.1s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 0;
}
.check svg { width: 100%; height: 100%; display: block; }
:host([checked]) .check { opacity: 1; }
.label {
  font-size: var(--saz-text-size-medium);
  color: var(--saz-color-text);
}
${STATE_DISABLED}
${INTERACTIVE_FOCUS}
`;
const checkboxConfig = {
  // observedAttributes auto-derived from properties with reflect: true
  properties: {
    checked: { type: "boolean", reflect: true },
    disabled: { type: "boolean", reflect: true }
  },
  events: {
    change: { name: "saz-change", detail: { checked: "checked" } }
  },
  binds: {
    checked: "attribute",
    disabled: "attribute"
  }
};
_SazamiCheckbox_decorators = [component(checkboxConfig)];
class SazamiCheckbox extends (_a$l = SazamiComponent) {
  constructor() {
    super(...arguments);
    this._checkedSignal = null;
    this._disabledSignal = null;
    this._handleClick = () => {
      if (this._getIsDisabled()) return;
      if (this._checkedSignal) {
        if ("set" in this._checkedSignal) {
          const newValue = !this._checkedSignal.get();
          this._checkedSignal.set(newValue);
          this._updateAria(newValue);
          this.dispatchEventTyped("change", { checked: newValue });
        } else {
          this._updateAria();
        }
      } else {
        const newValue = !(this._checked || false);
        this._setChecked(newValue);
        this._updateAria(newValue);
        this.dispatchEventTyped("change", { checked: newValue });
      }
    };
    this._handleKeydown = (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        this._handleClick();
      }
    };
  }
  _isReadableBool(value) {
    return isSignal(value) || value instanceof Derived;
  }
  set checked(value) {
    if (this._isReadableBool(value)) {
      this._checkedSignal = value;
      this.bindAttribute(":host", "checked", value);
    } else {
      this._checkedSignal = null;
      this._setChecked(value);
    }
  }
  get checked() {
    return this._checkedSignal || this._checked || false;
  }
  _setChecked(value) {
    this._checked = value;
    if (value) {
      this.setAttribute("checked", "");
    } else {
      this.removeAttribute("checked");
    }
    this._updateAria();
  }
  set disabled(value) {
    if (this._isReadableBool(value)) {
      this._disabledSignal = value;
      this.bindDisabled(":host", value);
    } else {
      this._disabledSignal = null;
      this._setDisabled(value);
    }
  }
  get disabled() {
    return this._disabledSignal || this._disabled || false;
  }
  _setDisabled(value) {
    this._disabled = value;
    if (value) {
      this.setAttribute("disabled", "");
    } else {
      this.removeAttribute("disabled");
    }
    this._updateAria();
  }
  _getIsDisabled() {
    if (this._disabledSignal) return this._disabledSignal.get();
    if (this._disabled !== void 0) return !!this._disabled;
    return this.hasAttribute("disabled");
  }
  render() {
    const label = this.textContent?.trim() || "";
    this.mount(
      STYLES$m,
      `
      <span class="box">
        <span class="check">${ICON_SVGS.check || ""}</span>
      </span>
      ${label ? `<span class="label">${escapeHtml(label)}</span>` : ""}
    `
    );
    if (!this.hasAttribute("role")) this.setAttribute("role", "checkbox");
    this._updateAria();
    this.removeHandler("click", this._handleClick);
    this.removeHandler("keydown", this._handleKeydown);
    this.addHandler("click", this._handleClick, { internal: true });
    this.addHandler("keydown", this._handleKeydown, { internal: true });
  }
  _updateAria(checked) {
    const isChecked = checked !== void 0 ? checked : this._checkedSignal ? this._checkedSignal.get() : !!this._checked;
    const isDisabled = this._getIsDisabled();
    this.setAttribute("aria-checked", isChecked ? "true" : "false");
    if (isDisabled) {
      this.setAttribute("tabindex", "-1");
      this.setAttribute("aria-disabled", "true");
    } else {
      this.setAttribute("tabindex", "0");
      this.removeAttribute("aria-disabled");
    }
  }
}
_init$l = __decoratorStart$l(_a$l);
SazamiCheckbox = __decorateElement$l(_init$l, 0, "SazamiCheckbox", _SazamiCheckbox_decorators, SazamiCheckbox);
__runInitializers$l(_init$l, 1, SazamiCheckbox);
var __create$k = Object.create;
var __defProp$k = Object.defineProperty;
var __getOwnPropDesc$k = Object.getOwnPropertyDescriptor;
var __knownSymbol$k = (name, symbol) => (symbol = Symbol[name]) ? symbol : /* @__PURE__ */ Symbol.for("Symbol." + name);
var __typeError$k = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp$k = (obj, key, value) => key in obj ? __defProp$k(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __name$k = (target, value) => __defProp$k(target, "name", { value, configurable: true });
var __decoratorStart$k = (base) => [, , , __create$k(base?.[__knownSymbol$k("metadata")] ?? null)];
var __decoratorStrings$k = ["class", "method", "getter", "setter", "accessor", "field", "value", "get", "set"];
var __expectFn$k = (fn) => fn !== void 0 && typeof fn !== "function" ? __typeError$k("Function expected") : fn;
var __decoratorContext$k = (kind, name, done, metadata, fns) => ({ kind: __decoratorStrings$k[kind], name, metadata, addInitializer: (fn) => done._ ? __typeError$k("Already initialized") : fns.push(__expectFn$k(fn || null)) });
var __decoratorMetadata$k = (array, target) => __defNormalProp$k(target, __knownSymbol$k("metadata"), array[3]);
var __runInitializers$k = (array, flags, self, value) => {
  for (var i = 0, fns = array[flags >> 1], n = fns && fns.length; i < n; i++) fns[i].call(self);
  return value;
};
var __decorateElement$k = (array, flags, name, decorators, target, extra) => {
  var it, done, ctx, k2 = flags & 7, p2 = false;
  var j2 = 0;
  var extraInitializers = array[j2] || (array[j2] = []);
  var desc = k2 && (target = target.prototype, k2 < 5 && (k2 > 3 || !p2) && __getOwnPropDesc$k(target, name));
  __name$k(target, name);
  for (var i = decorators.length - 1; i >= 0; i--) {
    ctx = __decoratorContext$k(k2, name, done = {}, array[3], extraInitializers);
    it = (0, decorators[i])(target, ctx), done._ = 1;
    __expectFn$k(it) && (target = it);
  }
  return __decoratorMetadata$k(array, target), desc && __defProp$k(target, name, desc), p2 ? k2 ^ 4 ? extra : desc : target;
};
var _SazamiToggle_decorators, _init$k, _a$k;
const STYLES$l = `
:host {
  display: inline-flex;
  align-items: center;
  gap: var(--saz-space-small);
  cursor: pointer;
  user-select: none;
}
.track {
  width: 40px;
  height: 22px;
  border-radius: 11px;
  background: var(--saz-color-border);
  position: relative;
  transition: background 0.2s ease;
  flex-shrink: 0;
}
.thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #fff;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}
:host([checked]) .track { background: var(--saz-color-primary); }
:host([checked]) .thumb { transform: translateX(18px); }
:host([variant="accent"][checked]) .track { background: var(--saz-color-accent); }
${STATE_DISABLED}
${INTERACTIVE_FOCUS}
`;
const toggleConfig = {
  properties: {
    checked: { type: "boolean", reflect: true },
    disabled: { type: "boolean", reflect: true },
    variant: { type: "string", reflect: false }
  },
  events: {
    change: { name: "saz-change", detail: { checked: "checked" } }
  },
  binds: {
    checked: "attribute",
    disabled: "attribute"
  }
};
_SazamiToggle_decorators = [component(toggleConfig)];
class SazamiToggle extends (_a$k = SazamiComponent) {
  constructor() {
    super(...arguments);
    this._checkedSignal = null;
    this._checkedBindingDispose = null;
    this._disabledSignal = null;
    this._disabledBindingDispose = null;
    this._handleClick = () => {
      if (this._getIsDisabled()) return;
      const newValue = this._checkedSignal ? !this._checkedSignal.get() : !(this._checked || false);
      if (this._checkedSignal) {
        if ("set" in this._checkedSignal) {
          this._checkedSignal.set(newValue);
          this._updateAria();
        }
      } else {
        this._setChecked(newValue);
        this._updateAria();
      }
      this.dispatchEventTyped("change", { checked: newValue });
    };
    this._handleKeydown = (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        this._handleClick();
      }
    };
  }
  _isReadableBool(value) {
    return isSignal(value) || value instanceof Derived;
  }
  set checked(value) {
    if (this._checkedBindingDispose) {
      this._checkedBindingDispose();
      this._checkedBindingDispose = null;
    }
    if (this._isReadableBool(value)) {
      this._checkedSignal = value;
      const dispose = this.bindAttribute(":host", "checked", value);
      if (typeof dispose === "function") {
        this._checkedBindingDispose = dispose;
      }
    } else {
      this._checkedSignal = null;
      this._setChecked(value);
    }
  }
  get checked() {
    return this._checkedSignal || this._checked || false;
  }
  _setChecked(value) {
    this._checked = value;
    if (value) {
      this.setAttribute("checked", "");
    } else {
      this.removeAttribute("checked");
    }
    this._updateAria();
  }
  set disabled(value) {
    if (this._disabledBindingDispose) {
      this._disabledBindingDispose();
      this._disabledBindingDispose = null;
    }
    if (this._isReadableBool(value)) {
      this._disabledSignal = value;
      const dispose = this.bindDisabled(":host", value);
      if (typeof dispose === "function") {
        this._disabledBindingDispose = dispose;
      }
    } else {
      this._disabledSignal = null;
      this._setDisabled(value);
    }
  }
  get disabled() {
    return this._disabledSignal || this._disabled || false;
  }
  _setDisabled(value) {
    this._disabled = value;
    if (value) {
      this.setAttribute("disabled", "");
    } else {
      this.removeAttribute("disabled");
    }
    this._updateAria();
  }
  _getIsDisabled() {
    if (this._disabledSignal) return this._disabledSignal.get();
    if (this._disabled !== void 0) return !!this._disabled;
    return this.hasAttribute("disabled");
  }
  render() {
    this.mount(
      STYLES$l,
      `
      <span class="track"><span class="thumb"></span></span>
      <slot></slot>
    `
    );
    if (!this.hasAttribute("role")) this.setAttribute("role", "switch");
    this._updateAria();
    this.addHandler("click", this._handleClick, { internal: true });
    this.addHandler("keydown", this._handleKeydown, { internal: true });
  }
  _updateAria() {
    const isChecked = this._checkedSignal ? this._checkedSignal.get() : !!this._checked;
    const isDisabled = this._getIsDisabled();
    this.setAttribute("aria-checked", isChecked ? "true" : "false");
    if (isDisabled) {
      this.setAttribute("tabindex", "-1");
      this.setAttribute("aria-disabled", "true");
    } else {
      this.setAttribute("tabindex", "0");
      this.removeAttribute("aria-disabled");
    }
  }
  attributeChangedCallback(name, oldVal, newVal) {
    if (oldVal === newVal) return;
    if (name === "checked" || name === "disabled") {
      this._updateAria();
    }
  }
}
_init$k = __decoratorStart$k(_a$k);
SazamiToggle = __decorateElement$k(_init$k, 0, "SazamiToggle", _SazamiToggle_decorators, SazamiToggle);
__runInitializers$k(_init$k, 1, SazamiToggle);
var __create$j = Object.create;
var __defProp$j = Object.defineProperty;
var __getOwnPropDesc$j = Object.getOwnPropertyDescriptor;
var __knownSymbol$j = (name, symbol) => (symbol = Symbol[name]) ? symbol : /* @__PURE__ */ Symbol.for("Symbol." + name);
var __typeError$j = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp$j = (obj, key, value) => key in obj ? __defProp$j(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __name$j = (target, value) => __defProp$j(target, "name", { value, configurable: true });
var __decoratorStart$j = (base) => [, , , __create$j(base?.[__knownSymbol$j("metadata")] ?? null)];
var __decoratorStrings$j = ["class", "method", "getter", "setter", "accessor", "field", "value", "get", "set"];
var __expectFn$j = (fn) => fn !== void 0 && typeof fn !== "function" ? __typeError$j("Function expected") : fn;
var __decoratorContext$j = (kind, name, done, metadata, fns) => ({ kind: __decoratorStrings$j[kind], name, metadata, addInitializer: (fn) => done._ ? __typeError$j("Already initialized") : fns.push(__expectFn$j(fn || null)) });
var __decoratorMetadata$j = (array, target) => __defNormalProp$j(target, __knownSymbol$j("metadata"), array[3]);
var __runInitializers$j = (array, flags, self, value) => {
  for (var i = 0, fns = array[flags >> 1], n = fns && fns.length; i < n; i++) fns[i].call(self);
  return value;
};
var __decorateElement$j = (array, flags, name, decorators, target, extra) => {
  var it, done, ctx, k2 = flags & 7, p2 = false;
  var j2 = 0;
  var extraInitializers = array[j2] || (array[j2] = []);
  var desc = k2 && (target = target.prototype, k2 < 5 && (k2 > 3 || !p2) && __getOwnPropDesc$j(target, name));
  __name$j(target, name);
  for (var i = decorators.length - 1; i >= 0; i--) {
    ctx = __decoratorContext$j(k2, name, done = {}, array[3], extraInitializers);
    it = (0, decorators[i])(target, ctx), done._ = 1;
    __expectFn$j(it) && (target = it);
  }
  return __decoratorMetadata$j(array, target), desc && __defProp$j(target, name, desc), p2 ? k2 ^ 4 ? extra : desc : target;
};
var _SazamiImage_decorators, _init$j, _a$j;
const STYLES$k = `
:host {
  display: block;
  overflow: hidden;
  border-radius: var(--saz-radius-medium);
  line-height: 0;
}
img {
  width: 100%;
  height: auto;
  display: block;
  object-fit: cover;
}
${SHAPE_RULES}
:host([size="small"])  { max-width: 120px; }
:host([size="medium"]) { max-width: 240px; }
:host([size="large"])  { max-width: 480px; }
:host([size="xlarge"]) { max-width: 640px; }
`;
const imageConfig = {
  properties: {
    alt: { type: "string", reflect: true },
    size: { type: "string", reflect: true },
    shape: { type: "string", reflect: true }
  }
};
_SazamiImage_decorators = [component(imageConfig)];
class SazamiImage extends (_a$j = SazamiComponent) {
  constructor() {
    super(...arguments);
    this._srcSignal = null;
    this._imgElement = null;
    this._pendingSrc = null;
    this._srcDispose = null;
  }
  _isReadableStr(value) {
    return isSignal(value) || value instanceof Derived;
  }
  set src(value) {
    if (this._isReadableStr(value)) {
      this._srcSignal = value;
      this._pendingSrc = null;
      if (!this._imgElement) {
        this._createImageElement();
      }
      this._setupSrcBinding();
    } else {
      this._srcSignal = null;
      this._pendingSrc = value;
      this._src = value;
      this._updateSrc(value);
    }
  }
  get src() {
    return this._srcSignal || this._src || "";
  }
  _updateSrc(value) {
    if (!value) {
      if (this._srcDispose) {
        this._srcDispose();
        this._srcDispose = null;
      }
      this._imgElement = null;
      return;
    }
    if (!this._imgElement) {
      this._createImageElement();
    }
    if (this._imgElement) {
      this._imgElement.src = value;
    }
  }
  _createImageElement() {
    const alt = this.alt || "";
    const currentSrc = this._getCurrentSrc();
    this.mountSync(
      STYLES$k,
      `<img src="${escapeHtml(currentSrc)}" alt="${escapeHtml(alt)}" />`
    );
    this._imgElement = this.$("img");
  }
  _setupSrcBinding() {
    if (!this._imgElement) return;
    if (this._srcDispose) {
      this._srcDispose();
    }
    const dispose = bindProperty(this._imgElement, "src", this._srcSignal);
    this._srcDispose = dispose;
  }
  _getCurrentSrc() {
    if (this._srcSignal) return this._srcSignal.get();
    if (this._pendingSrc !== void 0 && this._pendingSrc !== null)
      return this._pendingSrc;
    if (this._src !== void 0 && this._src !== null)
      return this._src;
    return this.getAttribute("src") || "";
  }
  render() {
    const currentSrc = this._getCurrentSrc();
    if (!currentSrc) {
      if (this._srcDispose) {
        this._srcDispose();
        this._srcDispose = null;
      }
      this._imgElement = null;
      this.mountSync(STYLES$k, "");
      return;
    }
    const alt = this.alt || "";
    this.mountSync(
      STYLES$k,
      `<img src="${escapeHtml(currentSrc)}" alt="${escapeHtml(alt)}" />`
    );
    this._imgElement = this.$("img");
    if (this._srcSignal) {
      this._setupSrcBinding();
    }
  }
}
_init$j = __decoratorStart$j(_a$j);
SazamiImage = __decorateElement$j(_init$j, 0, "SazamiImage", _SazamiImage_decorators, SazamiImage);
__runInitializers$j(_init$j, 1, SazamiImage);
var __create$i = Object.create;
var __defProp$i = Object.defineProperty;
var __getOwnPropDesc$i = Object.getOwnPropertyDescriptor;
var __knownSymbol$i = (name, symbol) => (symbol = Symbol[name]) ? symbol : /* @__PURE__ */ Symbol.for("Symbol." + name);
var __typeError$i = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp$i = (obj, key, value) => key in obj ? __defProp$i(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __name$i = (target, value) => __defProp$i(target, "name", { value, configurable: true });
var __decoratorStart$i = (base) => [, , , __create$i(base?.[__knownSymbol$i("metadata")] ?? null)];
var __decoratorStrings$i = ["class", "method", "getter", "setter", "accessor", "field", "value", "get", "set"];
var __expectFn$i = (fn) => fn !== void 0 && typeof fn !== "function" ? __typeError$i("Function expected") : fn;
var __decoratorContext$i = (kind, name, done, metadata, fns) => ({ kind: __decoratorStrings$i[kind], name, metadata, addInitializer: (fn) => done._ ? __typeError$i("Already initialized") : fns.push(__expectFn$i(fn || null)) });
var __decoratorMetadata$i = (array, target) => __defNormalProp$i(target, __knownSymbol$i("metadata"), array[3]);
var __runInitializers$i = (array, flags, self, value) => {
  for (var i = 0, fns = array[flags >> 1], n = fns && fns.length; i < n; i++) fns[i].call(self);
  return value;
};
var __decorateElement$i = (array, flags, name, decorators, target, extra) => {
  var it, done, ctx, k2 = flags & 7, p2 = false;
  var j2 = 0;
  var extraInitializers = array[j2] || (array[j2] = []);
  var desc = k2 && (target = target.prototype, k2 < 5 && (k2 > 3 || !p2) && __getOwnPropDesc$i(target, name));
  __name$i(target, name);
  for (var i = decorators.length - 1; i >= 0; i--) {
    ctx = __decoratorContext$i(k2, name, done = {}, array[3], extraInitializers);
    it = (0, decorators[i])(target, ctx), done._ = 1;
    __expectFn$i(it) && (target = it);
  }
  return __decoratorMetadata$i(array, target), desc && __defProp$i(target, name, desc), p2 ? k2 ^ 4 ? extra : desc : target;
};
var _SazamiCoverart_decorators, _init$i, _a$i;
const STYLES$j = `
:host {
  display: block;
  width: 64px;
  height: 64px;
  border-radius: var(--saz-radius-medium);
  overflow: hidden;
  flex-shrink: 0;
  background: var(--saz-color-border);
}
img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
${SHAPE_RULES}
:host([size="small"])  { width: 40px; height: 40px; }
:host([size="medium"]) { width: 64px; height: 64px; }
:host([size="large"])  { width: 96px; height: 96px; }
:host([size="xlarge"]) { width: 128px; height: 128px; }
`;
const coverartConfig = {
  properties: {
    alt: { type: "string", reflect: false },
    size: { type: "string", reflect: false },
    shape: { type: "string", reflect: false }
  }
};
_SazamiCoverart_decorators = [component(coverartConfig)];
class SazamiCoverart extends (_a$i = SazamiComponent) {
  constructor() {
    super(...arguments);
    this._srcSignal = null;
    this._imgElement = null;
    this._pendingSrc = null;
    this._srcEffectDispose = null;
  }
  _isReadableStr(value) {
    return isSignal(value) || value instanceof Derived;
  }
  set src(value) {
    if (this._isReadableStr(value)) {
      if (this._srcEffectDispose) {
        this._srcEffectDispose();
        this._srcEffectDispose = null;
      }
      this._srcSignal = value;
      this._pendingSrc = null;
      if (!this._imgElement) {
        this.render();
      } else {
        this._setupSrcEffect();
      }
    } else {
      this._srcSignal = null;
      if (this._srcEffectDispose) {
        this._srcEffectDispose();
        this._srcEffectDispose = null;
      }
      this._pendingSrc = value;
      this._src = value;
      if (!this._imgElement) {
        this.render();
      } else {
        this._updateSrc(value);
      }
    }
  }
  get src() {
    return this._srcSignal || this._src || "";
  }
  _updateSrc(value) {
    if (this._imgElement) {
      this._imgElement.src = value;
    }
  }
  _setupSrcEffect() {
    if (!this._srcSignal || !this._imgElement) return;
    const dispose = effect(() => {
      const src = this._srcSignal.get();
      if (this._imgElement) {
        this._imgElement.src = src;
      }
    });
    this._srcEffectDispose = dispose;
    this.onCleanup(dispose);
  }
  render() {
    const currentSrc = this._srcSignal ? this._srcSignal.get() : this._pendingSrc || this._src || this.getAttribute("src") || this.textContent?.trim() || "";
    const alt = this.getAttribute("alt") || "Cover art";
    if (!currentSrc) {
      if (this._srcEffectDispose) {
        this._srcEffectDispose();
        this._srcEffectDispose = null;
      }
      this.mount(STYLES$j, "");
      this._imgElement = null;
      if (this._srcSignal) {
        this._setupSrcEffect();
      }
      return;
    }
    this.mount(
      STYLES$j,
      `<img src="${escapeHtml(currentSrc)}" alt="${escapeHtml(alt)}" />`
    );
    this._imgElement = this.$("img");
    if (this._pendingSrc) {
      this._updateSrc(this._pendingSrc);
      this._pendingSrc = null;
    }
    if (this._srcSignal && this._imgElement) {
      this._setupSrcEffect();
    }
  }
}
_init$i = __decoratorStart$i(_a$i);
SazamiCoverart = __decorateElement$i(_init$i, 0, "SazamiCoverart", _SazamiCoverart_decorators, SazamiCoverart);
__runInitializers$i(_init$i, 1, SazamiCoverart);
var __create$h = Object.create;
var __defProp$h = Object.defineProperty;
var __getOwnPropDesc$h = Object.getOwnPropertyDescriptor;
var __knownSymbol$h = (name, symbol) => (symbol = Symbol[name]) ? symbol : /* @__PURE__ */ Symbol.for("Symbol." + name);
var __typeError$h = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp$h = (obj, key, value) => key in obj ? __defProp$h(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __name$h = (target, value) => __defProp$h(target, "name", { value, configurable: true });
var __decoratorStart$h = (base) => [, , , __create$h(base?.[__knownSymbol$h("metadata")] ?? null)];
var __decoratorStrings$h = ["class", "method", "getter", "setter", "accessor", "field", "value", "get", "set"];
var __expectFn$h = (fn) => fn !== void 0 && typeof fn !== "function" ? __typeError$h("Function expected") : fn;
var __decoratorContext$h = (kind, name, done, metadata, fns) => ({ kind: __decoratorStrings$h[kind], name, metadata, addInitializer: (fn) => done._ ? __typeError$h("Already initialized") : fns.push(__expectFn$h(fn || null)) });
var __decoratorMetadata$h = (array, target) => __defNormalProp$h(target, __knownSymbol$h("metadata"), array[3]);
var __runInitializers$h = (array, flags, self, value) => {
  for (var i = 0, fns = array[flags >> 1], n = fns && fns.length; i < n; i++) fns[i].call(self);
  return value;
};
var __decorateElement$h = (array, flags, name, decorators, target, extra) => {
  var it, done, ctx, k2 = flags & 7, p2 = false;
  var j2 = 0;
  var extraInitializers = array[j2] || (array[j2] = []);
  var desc = k2 && (target = target.prototype, k2 < 5 && (k2 > 3 || !p2) && __getOwnPropDesc$h(target, name));
  __name$h(target, name);
  for (var i = decorators.length - 1; i >= 0; i--) {
    ctx = __decoratorContext$h(k2, name, done = {}, array[3], extraInitializers);
    it = (0, decorators[i])(target, ctx), done._ = 1;
    __expectFn$h(it) && (target = it);
  }
  return __decoratorMetadata$h(array, target), desc && __defProp$h(target, name, desc), p2 ? k2 ^ 4 ? extra : desc : target;
};
var _SazamiIcon_decorators, _init$h, _a$h;
const STYLES$i = `
:host {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--saz-icon-size-medium);
  height: var(--saz-icon-size-medium);
  color: inherit;
  line-height: 1;
}
:host([size="small"]) {
  width: var(--saz-icon-size-small);
  height: var(--saz-icon-size-small);
}
:host([size="large"]) {
  width: var(--saz-icon-size-large);
  height: var(--saz-icon-size-large);
}
:host([size="xlarge"]) {
  width: var(--saz-icon-size-xlarge);
  height: var(--saz-icon-size-xlarge);
}
${VARIANT_TEXT_RULES}
svg { width: 100%; height: 100%; }
`;
const iconConfig = {
  properties: {
    icon: { type: "string", reflect: true },
    size: { type: "string", reflect: true },
    variant: { type: "string", reflect: true }
  }
};
_SazamiIcon_decorators = [component(iconConfig)];
class SazamiIcon extends (_a$h = SazamiComponent) {
  constructor() {
    super(...arguments);
    this._iconSignal = null;
    this._iconElement = null;
    this._iconEffectDispose = null;
  }
  _isReadableStr(value) {
    return isSignal(value) || value instanceof Derived;
  }
  set icon(value) {
    if (this._isReadableStr(value)) {
      this._iconSignal = value;
      if (this._iconElement) {
        this._setupIconBinding();
      }
    } else {
      this._iconSignal = null;
      if (this._iconEffectDispose) {
        this._iconEffectDispose();
        this._iconEffectDispose = null;
      }
      this._icon = value;
      this._updateIcon(value);
    }
  }
  get icon() {
    return this._iconSignal || this._icon || "";
  }
  _updateIcon(iconName) {
    if (!this._iconElement) return;
    const svg = ICON_SVGS[iconName];
    const isSvg = !!svg;
    const currentIsSvg = this._iconElement.tagName.toLowerCase() === "svg";
    if (isSvg !== currentIsSvg) {
      const parent = this._iconElement.parentNode;
      let newElement;
      if (svg) {
        const wrapper = document.createElement("div");
        wrapper.innerHTML = svg;
        newElement = wrapper.firstElementChild;
      } else {
        newElement = document.createElement("span");
        newElement.textContent = iconName;
      }
      parent?.replaceChild(newElement, this._iconElement);
      this._iconElement = newElement;
    } else if (svg) {
      const wrapper = document.createElement("div");
      wrapper.innerHTML = svg;
      const newSvg = wrapper.firstElementChild;
      this._iconElement.innerHTML = newSvg.innerHTML;
    } else {
      this._iconElement.textContent = iconName;
    }
  }
  _setupIconBinding() {
    if (!this._iconElement || !this._iconSignal) return;
    if (this._iconEffectDispose) {
      this._iconEffectDispose();
    }
    const sig = this._iconSignal;
    const dispose = effect(() => {
      const iconName = sig.get();
      const svg = ICON_SVGS[iconName];
      const isSvg = !!svg;
      const currentEl = this._iconElement;
      if (!currentEl) return;
      const currentIsSvg = currentEl.tagName.toLowerCase() === "svg";
      if (isSvg !== currentIsSvg) {
        const parent = currentEl.parentNode;
        let newElement;
        if (svg) {
          const wrapper = document.createElement("div");
          wrapper.innerHTML = svg;
          newElement = wrapper.firstElementChild;
        } else {
          newElement = document.createElement("span");
          newElement.textContent = iconName;
        }
        parent?.replaceChild(newElement, currentEl);
        this._iconElement = newElement;
      } else if (svg) {
        const parent = currentEl.parentNode;
        const wrapper = document.createElement("div");
        wrapper.innerHTML = svg;
        const newElement = wrapper.firstElementChild;
        parent?.replaceChild(newElement, currentEl);
        this._iconElement = newElement;
      } else {
        currentEl.textContent = iconName;
      }
    });
    this._iconEffectDispose = dispose;
    this.onCleanup(dispose);
  }
  render() {
    const iconName = this._iconSignal ? this._iconSignal.get() : this._icon || this.getAttribute("icon") || this.textContent?.trim() || "";
    const svg = ICON_SVGS[iconName];
    if (svg) {
      this.mountSync(STYLES$i, svg);
    } else {
      this.mountSync(STYLES$i, `<span>${escapeHtml(iconName)}</span>`);
    }
    this._iconElement = this.shadowRoot?.querySelector("svg") || this.shadowRoot?.querySelector("span");
    if (this._iconSignal) {
      this._setupIconBinding();
    }
  }
}
_init$h = __decoratorStart$h(_a$h);
SazamiIcon = __decorateElement$h(_init$h, 0, "SazamiIcon", _SazamiIcon_decorators, SazamiIcon);
__runInitializers$h(_init$h, 1, SazamiIcon);
var __create$g = Object.create;
var __defProp$g = Object.defineProperty;
var __getOwnPropDesc$g = Object.getOwnPropertyDescriptor;
var __knownSymbol$g = (name, symbol) => (symbol = Symbol[name]) ? symbol : /* @__PURE__ */ Symbol.for("Symbol." + name);
var __typeError$g = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp$g = (obj, key, value) => key in obj ? __defProp$g(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __name$g = (target, value) => __defProp$g(target, "name", { value, configurable: true });
var __decoratorStart$g = (base) => [, , , __create$g(base?.[__knownSymbol$g("metadata")] ?? null)];
var __decoratorStrings$g = ["class", "method", "getter", "setter", "accessor", "field", "value", "get", "set"];
var __expectFn$g = (fn) => fn !== void 0 && typeof fn !== "function" ? __typeError$g("Function expected") : fn;
var __decoratorContext$g = (kind, name, done, metadata, fns) => ({ kind: __decoratorStrings$g[kind], name, metadata, addInitializer: (fn) => done._ ? __typeError$g("Already initialized") : fns.push(__expectFn$g(fn || null)) });
var __decoratorMetadata$g = (array, target) => __defNormalProp$g(target, __knownSymbol$g("metadata"), array[3]);
var __runInitializers$g = (array, flags, self, value) => {
  for (var i = 0, fns = array[flags >> 1], n = fns && fns.length; i < n; i++) fns[i].call(self);
  return value;
};
var __decorateElement$g = (array, flags, name, decorators, target, extra) => {
  var it, done, ctx, k2 = flags & 7, p2 = false;
  var j2 = 0;
  var extraInitializers = array[j2] || (array[j2] = []);
  var desc = k2 && (target = target.prototype, k2 < 5 && (k2 > 3 || !p2) && __getOwnPropDesc$g(target, name));
  __name$g(target, name);
  for (var i = decorators.length - 1; i >= 0; i--) {
    ctx = __decoratorContext$g(k2, name, done = {}, array[3], extraInitializers);
    it = (0, decorators[i])(target, ctx), done._ = 1;
    __expectFn$g(it) && (target = it);
  }
  return __decoratorMetadata$g(array, target), desc && __defProp$g(target, name, desc), p2 ? k2 ^ 4 ? extra : desc : target;
};
var _SazamiBadge_decorators, _init$g, _a$g;
const STYLES$h = `
:host {
  display: inline-flex;
  align-items: center;
  padding: var(--saz-space-tiny) var(--saz-space-small);
  border-radius: var(--saz-radius-round);
  font-size: var(--saz-text-size-small);
  font-weight: var(--saz-text-weight-medium);
  line-height: 1;
  white-space: nowrap;
  background: var(--saz-color-surface);
  color: var(--saz-color-text);
  border: 1px solid var(--saz-color-border);
}
${SIZE_PADDING_RULES}
${VARIANT_BG_RULES}
${SHAPE_RULES}
`;
const badgeConfig = {
  observedAttributes: ["content"],
  properties: {
    size: { type: "string", reflect: true },
    variant: { type: "string", reflect: true },
    shape: { type: "string", reflect: true }
  }
};
_SazamiBadge_decorators = [component(badgeConfig)];
class SazamiBadge extends (_a$g = SazamiComponent) {
  constructor() {
    super(...arguments);
    this._contentSignal = null;
    this._textNode = null;
    this._textContent = "";
    this._contentDispose = null;
  }
  _isReadable(value) {
    return isSignal(value) || value instanceof Derived;
  }
  set content(value) {
    if (this._contentDispose) {
      this._contentDispose();
      this._contentDispose = null;
    }
    if (this._isReadable(value)) {
      this._contentSignal = value;
      if (this._textNode) {
        const dispose = bindText(this._textNode, value);
        this._contentDispose = dispose;
        this.onCleanup(dispose);
      }
    } else {
      this._contentSignal = null;
      this._textContent = value;
      if (this._textNode) {
        this._textNode.textContent = value ?? "";
      }
    }
  }
  get content() {
    return this._contentSignal || this._textContent;
  }
  render() {
    this.mountSync(STYLES$h, `<slot></slot>`);
    const slot = this.shadow.querySelector("slot");
    if (slot) {
      const initialText = this._contentSignal ? this._contentSignal.get() : this._textContent ?? "";
      this._textNode = document.createTextNode(initialText);
      slot.replaceWith(this._textNode);
    }
    if (this._contentSignal && !this._contentDispose) {
      const dispose = bindText(this._textNode, this._contentSignal);
      this._contentDispose = dispose;
      this.onCleanup(dispose);
    }
  }
  attributeChangedCallback(name, oldVal, newVal) {
    super.attributeChangedCallback(name, oldVal, newVal);
    if (name === "content" && newVal !== null) {
      this.content = newVal;
    }
  }
}
_init$g = __decoratorStart$g(_a$g);
SazamiBadge = __decorateElement$g(_init$g, 0, "SazamiBadge", _SazamiBadge_decorators, SazamiBadge);
__runInitializers$g(_init$g, 1, SazamiBadge);
var __create$f = Object.create;
var __defProp$f = Object.defineProperty;
var __getOwnPropDesc$f = Object.getOwnPropertyDescriptor;
var __knownSymbol$f = (name, symbol) => (symbol = Symbol[name]) ? symbol : /* @__PURE__ */ Symbol.for("Symbol." + name);
var __typeError$f = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp$f = (obj, key, value) => key in obj ? __defProp$f(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __name$f = (target, value) => __defProp$f(target, "name", { value, configurable: true });
var __decoratorStart$f = (base) => [, , , __create$f(base?.[__knownSymbol$f("metadata")] ?? null)];
var __decoratorStrings$f = ["class", "method", "getter", "setter", "accessor", "field", "value", "get", "set"];
var __expectFn$f = (fn) => fn !== void 0 && typeof fn !== "function" ? __typeError$f("Function expected") : fn;
var __decoratorContext$f = (kind, name, done, metadata, fns) => ({ kind: __decoratorStrings$f[kind], name, metadata, addInitializer: (fn) => done._ ? __typeError$f("Already initialized") : fns.push(__expectFn$f(fn || null)) });
var __decoratorMetadata$f = (array, target) => __defNormalProp$f(target, __knownSymbol$f("metadata"), array[3]);
var __runInitializers$f = (array, flags, self, value) => {
  for (var i = 0, fns = array[flags >> 1], n = fns && fns.length; i < n; i++) fns[i].call(self);
  return value;
};
var __decorateElement$f = (array, flags, name, decorators, target, extra) => {
  var it, done, ctx, k2 = flags & 7, p2 = false;
  var j2 = 0;
  var extraInitializers = array[j2] || (array[j2] = []);
  var desc = k2 && (target = target.prototype, k2 < 5 && (k2 > 3 || !p2) && __getOwnPropDesc$f(target, name));
  __name$f(target, name);
  for (var i = decorators.length - 1; i >= 0; i--) {
    ctx = __decoratorContext$f(k2, name, done = {}, array[3], extraInitializers);
    it = (0, decorators[i])(target, ctx), done._ = 1;
    __expectFn$f(it) && (target = it);
  }
  return __decoratorMetadata$f(array, target), desc && __defProp$f(target, name, desc), p2 ? k2 ^ 4 ? extra : desc : target;
};
var _SazamiTag_decorators, _init$f, _a$f;
const STYLES$g = `
:host {
  display: inline-flex;
  align-items: center;
  padding: var(--saz-space-small) var(--saz-space-medium);
  border-radius: var(--saz-radius-medium);
  font-size: var(--saz-text-size-small);
  font-weight: var(--saz-text-weight-medium);
  background: var(--saz-color-surface);
  color: var(--saz-color-text);
  border: 1px solid var(--saz-color-border);
}
${VARIANT_BG_RULES}
`;
const tagConfig = {
  observedAttributes: ["content"],
  properties: {
    variant: { type: "string", reflect: true }
  }
};
_SazamiTag_decorators = [component(tagConfig)];
class SazamiTag extends (_a$f = SazamiComponent) {
  constructor() {
    super(...arguments);
    this._contentSignal = null;
    this._contentValue = "";
    this._textNode = null;
  }
  _isReadableStr(value) {
    return isSignal(value) || value instanceof Derived;
  }
  set content(value) {
    if (this._isReadableStr(value)) {
      this._contentSignal = value;
      this._setupContentBinding();
    } else {
      this._contentSignal = null;
      this._contentValue = value;
      this._updateContent(value);
    }
  }
  get content() {
    return this._contentSignal || this._contentValue;
  }
  _updateContent(value) {
    if (this._textNode) {
      this._textNode.textContent = value ?? "";
    }
  }
  _setupContentBinding() {
    if (!this._textNode) return;
    const dispose = bindText(this._textNode, this._contentSignal);
    this.onCleanup(dispose);
  }
  render() {
    this.mountSync(STYLES$g, `<slot></slot>`);
    const slot = this.shadow.querySelector("slot");
    if (slot) {
      this._textNode = document.createTextNode("");
      slot.replaceWith(this._textNode);
    } else {
      this._textNode = this.shadow.appendChild(document.createTextNode(""));
    }
    if (this._contentSignal) {
      this._setupContentBinding();
    } else {
      this._updateContent(this._contentValue);
    }
  }
  attributeChangedCallback(name, oldVal, newVal) {
    super.attributeChangedCallback(name, oldVal, newVal);
    if (name === "content" && newVal !== null) {
      this.content = newVal;
    }
  }
}
_init$f = __decoratorStart$f(_a$f);
SazamiTag = __decorateElement$f(_init$f, 0, "SazamiTag", _SazamiTag_decorators, SazamiTag);
__runInitializers$f(_init$f, 1, SazamiTag);
var __create$e = Object.create;
var __defProp$e = Object.defineProperty;
var __getOwnPropDesc$e = Object.getOwnPropertyDescriptor;
var __knownSymbol$e = (name, symbol) => (symbol = Symbol[name]) ? symbol : /* @__PURE__ */ Symbol.for("Symbol." + name);
var __typeError$e = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp$e = (obj, key, value) => key in obj ? __defProp$e(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __name$e = (target, value) => __defProp$e(target, "name", { value, configurable: true });
var __decoratorStart$e = (base) => [, , , __create$e(base?.[__knownSymbol$e("metadata")] ?? null)];
var __decoratorStrings$e = ["class", "method", "getter", "setter", "accessor", "field", "value", "get", "set"];
var __expectFn$e = (fn) => fn !== void 0 && typeof fn !== "function" ? __typeError$e("Function expected") : fn;
var __decoratorContext$e = (kind, name, done, metadata, fns) => ({ kind: __decoratorStrings$e[kind], name, metadata, addInitializer: (fn) => done._ ? __typeError$e("Already initialized") : fns.push(__expectFn$e(fn || null)) });
var __decoratorMetadata$e = (array, target) => __defNormalProp$e(target, __knownSymbol$e("metadata"), array[3]);
var __runInitializers$e = (array, flags, self, value) => {
  for (var i = 0, fns = array[flags >> 1], n = fns && fns.length; i < n; i++) fns[i].call(self);
  return value;
};
var __decorateElement$e = (array, flags, name, decorators, target, extra) => {
  var it, done, ctx, k2 = flags & 7, p2 = false;
  var j2 = 0;
  var extraInitializers = array[j2] || (array[j2] = []);
  var desc = k2 && (target = target.prototype, k2 < 5 && (k2 > 3 || !p2) && __getOwnPropDesc$e(target, name));
  __name$e(target, name);
  for (var i = decorators.length - 1; i >= 0; i--) {
    ctx = __decoratorContext$e(k2, name, done = {}, array[3], extraInitializers);
    it = (0, decorators[i])(target, ctx), done._ = 1;
    __expectFn$e(it) && (target = it);
  }
  return __decoratorMetadata$e(array, target), desc && __defProp$e(target, name, desc), p2 ? k2 ^ 4 ? extra : desc : target;
};
var _SazamiDivider_decorators, _init$e, _a$e;
const STYLES$f = `
:host {
  display: block;
  border: none;
  background: var(--saz-color-border);
  margin: var(--saz-space-medium) 0;
}
:host(:not([vertical])) { height: 1px; width: 100%; }
:host([vertical]) {
  width: 1px;
  height: 100%;
  margin: 0 var(--saz-space-medium);
  align-self: stretch;
}
:host([size="small"]) { margin: var(--saz-space-small) 0; }
:host([size="large"]) { margin: var(--saz-space-large) 0; }
:host([size="xlarge"]) { margin: var(--saz-space-xlarge) 0; }
:host([variant="dim"]) { background: var(--saz-color-surface); }
`;
const dividerConfig = {
  properties: {
    vertical: { type: "boolean", reflect: false },
    size: { type: "string", reflect: false },
    variant: { type: "string", reflect: false }
  }
};
_SazamiDivider_decorators = [component(dividerConfig)];
class SazamiDivider extends (_a$e = SazamiComponent) {
  render() {
    this.mount(STYLES$f, "");
  }
}
_init$e = __decoratorStart$e(_a$e);
SazamiDivider = __decorateElement$e(_init$e, 0, "SazamiDivider", _SazamiDivider_decorators, SazamiDivider);
__runInitializers$e(_init$e, 1, SazamiDivider);
var __create$d = Object.create;
var __defProp$d = Object.defineProperty;
var __getOwnPropDesc$d = Object.getOwnPropertyDescriptor;
var __knownSymbol$d = (name, symbol) => (symbol = Symbol[name]) ? symbol : /* @__PURE__ */ Symbol.for("Symbol." + name);
var __typeError$d = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp$d = (obj, key, value) => key in obj ? __defProp$d(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __name$d = (target, value) => __defProp$d(target, "name", { value, configurable: true });
var __decoratorStart$d = (base) => [, , , __create$d(base?.[__knownSymbol$d("metadata")] ?? null)];
var __decoratorStrings$d = ["class", "method", "getter", "setter", "accessor", "field", "value", "get", "set"];
var __expectFn$d = (fn) => fn !== void 0 && typeof fn !== "function" ? __typeError$d("Function expected") : fn;
var __decoratorContext$d = (kind, name, done, metadata, fns) => ({ kind: __decoratorStrings$d[kind], name, metadata, addInitializer: (fn) => done._ ? __typeError$d("Already initialized") : fns.push(__expectFn$d(fn || null)) });
var __decoratorMetadata$d = (array, target) => __defNormalProp$d(target, __knownSymbol$d("metadata"), array[3]);
var __runInitializers$d = (array, flags, self, value) => {
  for (var i = 0, fns = array[flags >> 1], n = fns && fns.length; i < n; i++) fns[i].call(self);
  return value;
};
var __decorateElement$d = (array, flags, name, decorators, target, extra) => {
  var it, done, ctx, k2 = flags & 7, p2 = false;
  var j2 = 0;
  var extraInitializers = array[j2] || (array[j2] = []);
  var desc = k2 && (target = target.prototype, k2 < 5 && (k2 > 3 || !p2) && __getOwnPropDesc$d(target, name));
  __name$d(target, name);
  for (var i = decorators.length - 1; i >= 0; i--) {
    ctx = __decoratorContext$d(k2, name, done = {}, array[3], extraInitializers);
    it = (0, decorators[i])(target, ctx), done._ = 1;
    __expectFn$d(it) && (target = it);
  }
  return __decoratorMetadata$d(array, target), desc && __defProp$d(target, name, desc), p2 ? k2 ^ 4 ? extra : desc : target;
};
var _SazamiSpacer_decorators, _init$d, _a$d;
const STYLES$e = `
:host { display: block; flex: 1; }
:host([size="small"])  { flex: none; width: var(--saz-space-small); height: var(--saz-space-small); }
:host([size="medium"]) { flex: none; width: var(--saz-space-medium); height: var(--saz-space-medium); }
:host([size="large"])  { flex: none; width: var(--saz-space-large); height: var(--saz-space-large); }
:host([size="xlarge"]) { flex: none; width: var(--saz-space-xlarge); height: var(--saz-space-xlarge); }
`;
const spacerConfig = {
  properties: {
    size: { type: "string", reflect: false }
  }
};
_SazamiSpacer_decorators = [component(spacerConfig)];
class SazamiSpacer extends (_a$d = SazamiComponent) {
  render() {
    this.mount(STYLES$e, "");
  }
}
_init$d = __decoratorStart$d(_a$d);
SazamiSpacer = __decorateElement$d(_init$d, 0, "SazamiSpacer", _SazamiSpacer_decorators, SazamiSpacer);
__runInitializers$d(_init$d, 1, SazamiSpacer);
var __create$c = Object.create;
var __defProp$c = Object.defineProperty;
var __getOwnPropDesc$c = Object.getOwnPropertyDescriptor;
var __knownSymbol$c = (name, symbol) => (symbol = Symbol[name]) ? symbol : /* @__PURE__ */ Symbol.for("Symbol." + name);
var __typeError$c = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp$c = (obj, key, value) => key in obj ? __defProp$c(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __name$c = (target, value) => __defProp$c(target, "name", { value, configurable: true });
var __decoratorStart$c = (base) => [, , , __create$c(base?.[__knownSymbol$c("metadata")] ?? null)];
var __decoratorStrings$c = ["class", "method", "getter", "setter", "accessor", "field", "value", "get", "set"];
var __expectFn$c = (fn) => fn !== void 0 && typeof fn !== "function" ? __typeError$c("Function expected") : fn;
var __decoratorContext$c = (kind, name, done, metadata, fns) => ({ kind: __decoratorStrings$c[kind], name, metadata, addInitializer: (fn) => done._ ? __typeError$c("Already initialized") : fns.push(__expectFn$c(fn || null)) });
var __decoratorMetadata$c = (array, target) => __defNormalProp$c(target, __knownSymbol$c("metadata"), array[3]);
var __runInitializers$c = (array, flags, self, value) => {
  for (var i = 0, fns = array[flags >> 1], n = fns && fns.length; i < n; i++) fns[i].call(self);
  return value;
};
var __decorateElement$c = (array, flags, name, decorators, target, extra) => {
  var it, done, ctx, k2 = flags & 7, p2 = false;
  var j2 = 0;
  var extraInitializers = array[j2] || (array[j2] = []);
  var desc = k2 && (target = target.prototype, k2 < 5 && (k2 > 3 || !p2) && __getOwnPropDesc$c(target, name));
  __name$c(target, name);
  for (var i = decorators.length - 1; i >= 0; i--) {
    ctx = __decoratorContext$c(k2, name, done = {}, array[3], extraInitializers);
    it = (0, decorators[i])(target, ctx), done._ = 1;
    __expectFn$c(it) && (target = it);
  }
  return __decoratorMetadata$c(array, target), desc && __defProp$c(target, name, desc), p2 ? k2 ^ 4 ? extra : desc : target;
};
var _SazamiSection_decorators, _init$c, _a$c;
const STYLES$d = `
:host {
  display: flex;
  flex-direction: column;
}
:host([layout="row"]) { flex-direction: row; }
${GAP_RULES}
:host([align="center"]) { align-items: center; }
`;
const sectionConfig = {
  properties: {
    layout: { type: "string", reflect: true },
    align: { type: "string", reflect: true },
    gap: { type: "string", reflect: true },
    "center-point": { type: "boolean", reflect: false }
  }
};
_SazamiSection_decorators = [component(sectionConfig)];
class SazamiSection extends (_a$c = SazamiComponent) {
  constructor() {
    super(...arguments);
    this._resizeObserver = void 0;
    this._boundComputeAndSetCenter = this._computeAndSetCenter.bind(this);
    this._slot = void 0;
  }
  _computeAndSetCenter() {
    if (!this.hasAttribute("center-point")) return;
    const rect = this.getBoundingClientRect();
    this.dataset.centerX = (rect.left + rect.width / 2).toString();
    this.dataset.centerY = (rect.top + rect.height / 2).toString();
  }
  _attachSlotListener() {
    const slot = this.shadowRoot?.querySelector(
      "slot"
    );
    if (this._slot) {
      this._slot.removeEventListener(
        "slotchange",
        this._boundComputeAndSetCenter
      );
    }
    if (slot) {
      slot.addEventListener("slotchange", this._boundComputeAndSetCenter);
      this._slot = slot;
    }
  }
  connectedCallback() {
    super.connectedCallback();
    this._attachSlotListener();
    this._setupResizeObserver();
  }
  _setupResizeObserver() {
    if (!this.hasAttribute("center-point")) return;
    if (this._resizeObserver) return;
    this._resizeObserver = new ResizeObserver(() => {
      this._computeAndSetCenter();
    });
    this._resizeObserver.observe(this);
  }
  disconnectedCallback() {
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
      this._resizeObserver = void 0;
    }
    if (this._slot) {
      this._slot.removeEventListener(
        "slotchange",
        this._boundComputeAndSetCenter
      );
      this._slot = void 0;
    }
    super.disconnectedCallback();
  }
  render() {
    this.mount(STYLES$d, `<slot></slot>`);
    this._attachSlotListener();
    if (this.hasAttribute("center-point")) {
      requestAnimationFrame(() => {
        this._computeAndSetCenter();
      });
    }
  }
  static get observedAttributes() {
    return ["center-point"];
  }
  attributeChangedCallback(name, oldVal, newVal) {
    super.attributeChangedCallback(name, oldVal, newVal);
    if (name === "center-point" && oldVal !== newVal) {
      if (newVal !== null) {
        requestAnimationFrame(() => {
          this._computeAndSetCenter();
        });
        this._setupResizeObserver();
      } else {
        if (this._resizeObserver) {
          this._resizeObserver.disconnect();
          this._resizeObserver = void 0;
        }
        delete this.dataset.centerX;
        delete this.dataset.centerY;
      }
    }
  }
}
_init$c = __decoratorStart$c(_a$c);
SazamiSection = __decorateElement$c(_init$c, 0, "SazamiSection", _SazamiSection_decorators, SazamiSection);
__runInitializers$c(_init$c, 1, SazamiSection);
const STYLES$c = `
:host {
  display: flex;
  flex-direction: column;
}
:host([layout="row"]) { flex-direction: row; }
${GAP_RULES}
:host([align="center"]) { align-items: center; }
:host([justify="space-between"]) { justify-content: space-between; }
`;
function createGenericClass(config) {
  class Generic extends SazamiComponent {
    render() {
      this.mount(STYLES$c, `<slot></slot>`);
    }
  }
  return Generic;
}
var __create$b = Object.create;
var __defProp$b = Object.defineProperty;
var __getOwnPropDesc$b = Object.getOwnPropertyDescriptor;
var __knownSymbol$b = (name, symbol) => (symbol = Symbol[name]) ? symbol : /* @__PURE__ */ Symbol.for("Symbol." + name);
var __typeError$b = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp$b = (obj, key, value) => key in obj ? __defProp$b(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __name$b = (target, value) => __defProp$b(target, "name", { value, configurable: true });
var __decoratorStart$b = (base) => [, , , __create$b(base?.[__knownSymbol$b("metadata")] ?? null)];
var __decoratorStrings$b = ["class", "method", "getter", "setter", "accessor", "field", "value", "get", "set"];
var __expectFn$b = (fn) => fn !== void 0 && typeof fn !== "function" ? __typeError$b("Function expected") : fn;
var __decoratorContext$b = (kind, name, done, metadata, fns) => ({ kind: __decoratorStrings$b[kind], name, metadata, addInitializer: (fn) => done._ ? __typeError$b("Already initialized") : fns.push(__expectFn$b(fn || null)) });
var __decoratorMetadata$b = (array, target) => __defNormalProp$b(target, __knownSymbol$b("metadata"), array[3]);
var __runInitializers$b = (array, flags, self, value) => {
  for (var i = 0, fns = array[flags >> 1], n = fns && fns.length; i < n; i++) fns[i].call(self);
  return value;
};
var __decorateElement$b = (array, flags, name, decorators, target, extra) => {
  var it, done, ctx, k2 = flags & 7, p2 = false;
  var j2 = 0;
  var extraInitializers = array[j2] || (array[j2] = []);
  var desc = k2 && (target = target.prototype, k2 < 5 && (k2 > 3 || !p2) && __getOwnPropDesc$b(target, name));
  __name$b(target, name);
  for (var i = decorators.length - 1; i >= 0; i--) {
    ctx = __decoratorContext$b(k2, name, done = {}, array[3], extraInitializers);
    it = (0, decorators[i])(target, ctx), done._ = 1;
    __expectFn$b(it) && (target = it);
  }
  return __decoratorMetadata$b(array, target), desc && __defProp$b(target, name, desc), p2 ? k2 ^ 4 ? extra : desc : target;
};
var _SazamiModal_decorators, _init$b, _a$b;
const STYLES$b = `
:host {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  visibility: hidden;
  opacity: 0;
  transition: opacity 0.2s ease, visibility 0.2s ease;
}
:host([open]) {
  visibility: visible;
  opacity: 1;
}
.overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
}
.dialog {
  position: relative;
  background: var(--saz-color-background);
  border-radius: var(--saz-radius-medium);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  max-width: 90vw;
  max-height: 90vh;
  overflow: auto;
  transform: scale(0.95);
  transition: transform 0.2s ease;
}
:host([open]) .dialog {
  transform: scale(1);
}
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--saz-space-large);
  border-bottom: 1px solid var(--saz-color-border);
}
.title {
  font-size: var(--saz-text-size-large);
  font-weight: 600;
  color: var(--saz-color-text);
  margin: 0;
}
.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: var(--saz-radius-soft);
  cursor: pointer;
  color: var(--saz-color-text-dim);
  transition: background 0.15s ease, color 0.15s ease;
}
${INTERACTIVE_HOVER}
.close-btn svg {
  width: 20px;
  height: 20px;
}
.content {
  padding: var(--saz-space-large);
}
`;
const modalConfig = {
  properties: {
    title: { type: "string", reflect: false },
    open: { type: "boolean", reflect: true }
  },
  events: {
    open: { name: "saz-open", detail: {} },
    close: { name: "saz-close", detail: {} }
  }
};
_SazamiModal_decorators = [component(modalConfig)];
class SazamiModal extends (_a$b = SazamiComponent) {
  constructor() {
    super(...arguments);
    this.openSignal = void 0;
  }
  render() {
    const title = escapeHtml(this.getAttribute("title") || "");
    this.mount(
      STYLES$b,
      `
      <div class="overlay"></div>
      <div class="dialog" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div class="header">
          <h2 class="title" id="modal-title">${title}</h2>
          <button class="close-btn" aria-label="Close">
            ${ICON_SVGS.close || "×"}
          </button>
        </div>
        <div class="content"><slot></slot></div>
      </div>
    `
    );
    const closeBtn = this.$(".close-btn");
    this.addHandler("click", () => this._close(), {
      internal: true,
      element: closeBtn
    });
    const overlay = this.$(".overlay");
    this.addHandler("click", () => this._close(), {
      internal: true,
      element: overlay
    });
    const handleKeydown = (e) => {
      if (e.key === "Escape" && this.hasAttribute("open")) {
        this._close();
      }
    };
    document.addEventListener("keydown", handleKeydown);
    this.onCleanup(
      () => document.removeEventListener("keydown", handleKeydown)
    );
    if (this.openSignal) {
      this.bindVisible(":host", this.openSignal);
    }
  }
  _open() {
    this.setAttribute("open", "");
  }
  _close() {
    this.removeAttribute("open");
  }
  attributeChangedCallback(name, oldVal, newVal) {
    if (oldVal === newVal) return;
    if (name === "open") {
      if (newVal !== null) {
        this.dispatchEventTyped("open", {});
      } else {
        this.dispatchEventTyped("close", {});
      }
    }
  }
}
_init$b = __decoratorStart$b(_a$b);
SazamiModal = __decorateElement$b(_init$b, 0, "SazamiModal", _SazamiModal_decorators, SazamiModal);
__runInitializers$b(_init$b, 1, SazamiModal);
var __create$a = Object.create;
var __defProp$a = Object.defineProperty;
var __getOwnPropDesc$a = Object.getOwnPropertyDescriptor;
var __knownSymbol$a = (name, symbol) => (symbol = Symbol[name]) ? symbol : /* @__PURE__ */ Symbol.for("Symbol." + name);
var __typeError$a = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp$a = (obj, key, value) => key in obj ? __defProp$a(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __name$a = (target, value) => __defProp$a(target, "name", { value, configurable: true });
var __decoratorStart$a = (base) => [, , , __create$a(base?.[__knownSymbol$a("metadata")] ?? null)];
var __decoratorStrings$a = ["class", "method", "getter", "setter", "accessor", "field", "value", "get", "set"];
var __expectFn$a = (fn) => fn !== void 0 && typeof fn !== "function" ? __typeError$a("Function expected") : fn;
var __decoratorContext$a = (kind, name, done, metadata, fns) => ({ kind: __decoratorStrings$a[kind], name, metadata, addInitializer: (fn) => done._ ? __typeError$a("Already initialized") : fns.push(__expectFn$a(fn || null)) });
var __decoratorMetadata$a = (array, target) => __defNormalProp$a(target, __knownSymbol$a("metadata"), array[3]);
var __runInitializers$a = (array, flags, self, value) => {
  for (var i = 0, fns = array[flags >> 1], n = fns && fns.length; i < n; i++) fns[i].call(self);
  return value;
};
var __decorateElement$a = (array, flags, name, decorators, target, extra) => {
  var it, done, ctx, k2 = flags & 7, p2 = false;
  var j2 = 0;
  var extraInitializers = array[j2] || (array[j2] = []);
  var desc = k2 && (target = target.prototype, k2 < 5 && (k2 > 3 || !p2) && __getOwnPropDesc$a(target, name));
  __name$a(target, name);
  for (var i = decorators.length - 1; i >= 0; i--) {
    ctx = __decoratorContext$a(k2, name, done = {}, array[3], extraInitializers);
    it = (0, decorators[i])(target, ctx), done._ = 1;
    __expectFn$a(it) && (target = it);
  }
  return __decoratorMetadata$a(array, target), desc && __defProp$a(target, name, desc), p2 ? k2 ^ 4 ? extra : desc : target;
};
var _SazamiSelect_decorators, _init$a, _a$a;
const STYLES$a = `
:host {
  display: block;
  position: relative;
  width: 100%;
  box-sizing: border-box;
  overflow: visible;
}
.trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  box-sizing: border-box;
  padding: var(--saz-space-small) var(--saz-space-large);
  border: 1px solid var(--saz-color-border);
  border-radius: var(--saz-radius-medium);
  background: var(--saz-color-background);
  color: var(--saz-color-text);
  font-size: var(--saz-text-size-medium);
  cursor: pointer;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}
.trigger:hover {
  border-color: var(--saz-color-primary);
}
.trigger:focus {
  outline: none;
  border-color: var(--saz-color-primary);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
}
.trigger svg {
  width: 16px;
  height: 16px;
  color: var(--saz-color-text-dim);
  transition: transform 0.2s ease;
}
.trigger svg {
  fill: none;
  stroke: currentColor;
}
:host([open]) .trigger svg {
  transform: rotate(180deg);
}
${STATE_DISABLED}
${INTERACTIVE_FOCUS}
.dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 4px;
  background: var(--saz-color-background);
  border: 1px solid var(--saz-color-border);
  border-radius: var(--saz-radius-medium);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 100;
  visibility: hidden;
  opacity: 0;
  transform: translateY(-8px);
  transition: opacity 0.15s ease, transform 0.15s ease, visibility 0.15s ease;
  max-height: 200px;
  overflow-y: auto;
}
:host([open]) .dropdown {
  visibility: visible;
  opacity: 1;
  transform: translateY(0);
}
.option {
  padding: var(--saz-space-small) var(--saz-space-large);
  cursor: pointer;
  transition: background 0.1s ease;
  box-sizing: border-box;
}
.option:hover:not(.selected) {
  background: var(--saz-color-surface);
}
.option.selected {
  background: var(--saz-color-primary);
  color: var(--saz-color-on-primary);
}
.option.selected:hover {
  background: var(--saz-color-primary);
  color: var(--saz-color-on-primary);
}
`;
const selectConfig = {
  properties: {
    placeholder: { type: "string", reflect: true },
    open: { type: "boolean", reflect: true }
  },
  events: {
    change: { name: "saz-change", detail: { value: "value" } }
  },
  binds: {
    value: "attribute",
    disabled: "attribute"
  }
};
_SazamiSelect_decorators = [component(selectConfig)];
class SazamiSelect extends (_a$a = SazamiComponent) {
  constructor() {
    super(...arguments);
    this._options = [];
    this._valueSignal = null;
    this._valueEffectDisposer = null;
    this._valueBindingInitialized = false;
    this._disabledSignal = null;
    this._disabledEffectDisposer = null;
    this._handleDocumentClick = (e) => {
      if (!this.contains(e.target)) {
        this.open = false;
      }
    };
  }
  _isReadableStr(value) {
    return isSignal(value) || value instanceof Derived;
  }
  _isReadableBool(value) {
    return isSignal(value) || value instanceof Derived;
  }
  set value(valueOrSignal) {
    if (this._isReadableStr(valueOrSignal)) {
      this._valueSignal = valueOrSignal;
      this._setupValueBinding();
    } else {
      this._valueSignal = null;
      if (this._valueEffectDisposer) {
        this._valueEffectDisposer();
        this._valueEffectDisposer = null;
      }
      this._value = valueOrSignal;
      this._updateDisplay();
      this._updateSelectedState();
    }
  }
  get value() {
    return this._valueSignal || this._value || "";
  }
  _getValue() {
    if (this._valueSignal) return this._valueSignal.get();
    return this._value || this.getAttribute("value") || "";
  }
  _setupValueBinding() {
    if (this._valueEffectDisposer) {
      this._valueEffectDisposer();
    }
    const sig = this._valueSignal;
    const self = this;
    const dispose = effect(() => {
      const val = sig.get();
      self._value = val;
      self._updateDisplay();
      self._updateSelectedState();
    });
    this._valueEffectDisposer = dispose;
    this._valueBindingInitialized = true;
    this.onCleanup(dispose);
  }
  set disabled(value) {
    if (this._disabledEffectDisposer) {
      this._disabledEffectDisposer();
      this._disabledEffectDisposer = null;
    }
    if (this._isReadableBool(value)) {
      this._disabledSignal = value;
      const dispose = effect(() => {
        const disabled = value.get();
        if (disabled) {
          this.setAttribute("disabled", "");
        } else {
          this.removeAttribute("disabled");
        }
        this._updateTabIndex();
      });
      this._disabledEffectDisposer = dispose;
      this.onCleanup(dispose);
    } else {
      this._disabledSignal = null;
      this._setDisabled(value);
    }
  }
  get disabled() {
    return this._disabledSignal || this._disabled || false;
  }
  _setDisabled(value) {
    this._disabled = value;
    if (value) {
      this.setAttribute("disabled", "");
    } else {
      this.removeAttribute("disabled");
    }
    this._updateTabIndex();
  }
  _getIsDisabled() {
    if (this._disabledSignal) return this._disabledSignal.get();
    if (this._disabled !== void 0) return !!this._disabled;
    return this.hasAttribute("disabled");
  }
  connectedCallback() {
    super.connectedCallback();
    document.addEventListener("click", this._handleDocumentClick);
  }
  disconnectedCallback() {
    document.removeEventListener("click", this._handleDocumentClick);
    super.disconnectedCallback();
  }
  render() {
    const placeholder = this.getAttribute("placeholder") || "Select...";
    const currentValue = this._getValue();
    this._options = Array.from(this.querySelectorAll("option")).map((opt) => ({
      value: opt.getAttribute("value") || opt.textContent || "",
      label: opt.textContent || ""
    }));
    const selectedOption = this._options.find((o) => o.value === currentValue);
    this.mount(
      STYLES$a,
      `
      <div class="trigger" role="combobox" tabindex="${this._getIsDisabled() ? "-1" : "0"}" aria-haspopup="listbox" aria-expanded="${this.hasAttribute("open") ? "true" : "false"}">
        <span class="value">${escapeHtml(selectedOption?.label || placeholder)}</span>
        ${ICON_SVGS["chevron-down"] || ""}
      </div>
      <div class="dropdown" role="listbox">
        ${this._options.map((opt, i) => `<div class="option${opt.value === currentValue ? " selected" : ""}" role="option" data-value="${escapeHtml(opt.value)}" aria-selected="${opt.value === currentValue}">${escapeHtml(opt.label)}</div>`).join("")}
      </div>
    `
    );
    this._updateTabIndex();
    this._wireHandlers();
    if (this._valueSignal && !this._valueBindingInitialized) {
      this._setupValueBinding();
    }
  }
  _wireHandlers() {
    if (this._getIsDisabled()) return;
    const trigger = this.$(".trigger");
    const dropdown = this.$(".dropdown");
    this.addHandler("click", () => this.toggleOpen(), {
      internal: true,
      element: trigger
    });
    const handleKeydown = (e) => {
      if (this._options.length === 0) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        this.toggleOpen();
      } else if (e.key === "Escape" && this.hasAttribute("open")) {
        e.preventDefault();
        this.open = false;
      } else if (this.hasAttribute("open") && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
        e.preventDefault();
        this._navigateOption(e.key === "ArrowDown" ? 1 : -1);
      }
    };
    this.addHandler("keydown", handleKeydown, {
      internal: true,
      element: trigger
    });
    const handleDropdownClick = (e) => {
      const target = e.target;
      if (target.classList.contains("option")) {
        const newValue = target.getAttribute("data-value") || "";
        if (this._valueSignal) {
          if ("set" in this._valueSignal) {
            this._valueSignal.set(newValue);
          } else {
            this._value = newValue;
            this._updateDisplay();
            this._updateSelectedState();
          }
        } else {
          this._value = newValue;
          this._updateDisplay();
          this._updateSelectedState();
        }
        this.open = false;
        this.dispatchEventTyped("change", { value: newValue });
      }
    };
    this.addHandler("click", handleDropdownClick, {
      internal: true,
      element: dropdown
    });
  }
  toggleOpen() {
    if (this._getIsDisabled()) return;
    this.open = !this.open;
  }
  _navigateOption(delta) {
    if (!this._options || this._options.length === 0) return;
    const currentValue = this._getValue();
    const currentIndex = this._options.findIndex(
      (o) => o.value === currentValue
    );
    let newIndex = currentIndex + delta;
    if (newIndex < 0) newIndex = this._options.length - 1;
    if (newIndex >= this._options.length) newIndex = 0;
    const newValue = this._options[newIndex].value;
    if (this._valueSignal) {
      if ("set" in this._valueSignal) {
        this._valueSignal.set(newValue);
      } else {
        this._value = newValue;
        this._updateDisplay();
        this._updateSelectedState();
      }
    } else {
      this._value = newValue;
      this._updateDisplay();
      this._updateSelectedState();
    }
    this.dispatchEventTyped("change", { value: newValue });
  }
  _updateSelectedState() {
    const currentValue = this._getValue();
    const options = this.shadow.querySelectorAll(".option");
    options.forEach((opt) => {
      const optValue = opt.getAttribute("data-value");
      const isSelected = optValue === currentValue;
      opt.classList.toggle("selected", isSelected);
      opt.setAttribute("aria-selected", String(isSelected));
    });
  }
  _updateDisplay() {
    const trigger = this.$(".trigger");
    const placeholder = this.getAttribute("placeholder") || "Select...";
    const currentValue = this._getValue();
    const selectedOption = this._options.find((o) => o.value === currentValue);
    const valueEl = trigger?.querySelector(".value");
    if (valueEl) {
      valueEl.textContent = selectedOption?.label || placeholder;
    }
  }
  _updateTabIndex() {
    const trigger = this.$(".trigger");
    if (trigger) {
      trigger.setAttribute("tabindex", this._getIsDisabled() ? "-1" : "0");
    }
  }
  static get observedAttributes() {
    return ["open", "value", "disabled", "placeholder"];
  }
  attributeChangedCallback(name, oldVal, newVal) {
    if (oldVal === newVal) return;
    if (name === "open") {
      const trigger = this.$(".trigger");
      this.$(".dropdown");
      if (trigger) {
        trigger.setAttribute(
          "aria-expanded",
          newVal !== null ? "true" : "false"
        );
      }
    }
    if (name === "value") {
      this._updateDisplay();
      this._updateSelectedState();
    }
    if (name === "placeholder") {
      this._updateDisplay();
    }
    if (name === "disabled") {
      this.removeAllHandlers({ type: "click" });
      this.removeAllHandlers({ type: "keydown" });
      this._updateTabIndex();
      this._wireHandlers();
    }
  }
}
_init$a = __decoratorStart$a(_a$a);
SazamiSelect = __decorateElement$a(_init$a, 0, "SazamiSelect", _SazamiSelect_decorators, SazamiSelect);
__runInitializers$a(_init$a, 1, SazamiSelect);
var __create$9 = Object.create;
var __defProp$9 = Object.defineProperty;
var __getOwnPropDesc$9 = Object.getOwnPropertyDescriptor;
var __knownSymbol$9 = (name, symbol) => (symbol = Symbol[name]) ? symbol : /* @__PURE__ */ Symbol.for("Symbol." + name);
var __typeError$9 = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp$9 = (obj, key, value) => key in obj ? __defProp$9(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __name$9 = (target, value) => __defProp$9(target, "name", { value, configurable: true });
var __decoratorStart$9 = (base) => [, , , __create$9(base?.[__knownSymbol$9("metadata")] ?? null)];
var __decoratorStrings$9 = ["class", "method", "getter", "setter", "accessor", "field", "value", "get", "set"];
var __expectFn$9 = (fn) => fn !== void 0 && typeof fn !== "function" ? __typeError$9("Function expected") : fn;
var __decoratorContext$9 = (kind, name, done, metadata, fns) => ({ kind: __decoratorStrings$9[kind], name, metadata, addInitializer: (fn) => done._ ? __typeError$9("Already initialized") : fns.push(__expectFn$9(fn || null)) });
var __decoratorMetadata$9 = (array, target) => __defNormalProp$9(target, __knownSymbol$9("metadata"), array[3]);
var __runInitializers$9 = (array, flags, self, value) => {
  for (var i = 0, fns = array[flags >> 1], n = fns && fns.length; i < n; i++) fns[i].call(self);
  return value;
};
var __decorateElement$9 = (array, flags, name, decorators, target, extra) => {
  var it, done, ctx, k2 = flags & 7, p2 = false;
  var j2 = 0;
  var extraInitializers = array[j2] || (array[j2] = []);
  var desc = k2 && (target = target.prototype, k2 < 5 && (k2 > 3 || !p2) && __getOwnPropDesc$9(target, name));
  __name$9(target, name);
  for (var i = decorators.length - 1; i >= 0; i--) {
    ctx = __decoratorContext$9(k2, name, done = {}, array[3], extraInitializers);
    it = (0, decorators[i])(target, ctx), done._ = 1;
    __expectFn$9(it) && (target = it);
  }
  return __decoratorMetadata$9(array, target), desc && __defProp$9(target, name, desc), p2 ? k2 ^ 4 ? extra : desc : target;
};
var _SazamiTabs_decorators, _init$9, _a$9;
const STYLES$9 = `
:host { display: block; }
.tabs {
  display: flex;
  border-bottom: 1px solid var(--saz-color-border);
  gap: var(--saz-space-tiny);
}
.tab {
  padding: var(--saz-space-small) var(--saz-space-large);
  border: none;
  background: transparent;
  color: var(--saz-color-text-dim);
  font-size: var(--saz-text-size-medium);
  font-weight: 500;
  cursor: pointer;
  position: relative;
  transition: color 0.2s ease;
}
.tab::after {
  content: "";
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 2px;
  background: var(--saz-color-primary);
  transform: scaleX(0);
  transition: transform 0.25s ease;
}
.tab.active {
  color: var(--saz-color-primary);
}
.tab.active::after {
  transform: scaleX(1);
}
.tab:focus-visible {
  outline: 2px solid var(--saz-color-primary);
  outline-offset: -2px;
}
.panels {
  padding: var(--saz-space-large) 0;
  position: relative;
  overflow: hidden;
  min-height: 60px;
}
.panel {
  display: none;
  animation: slideIn 0.25s ease;
}
.panel.active {
  display: block;
}
@keyframes slideIn {
  from { opacity: 0; transform: translateX(12px); }
  to { opacity: 1; transform: translateX(0); }
}
`;
const tabsConfig = {
  properties: {
    active: { type: "string", reflect: true }
  },
  events: {
    change: { name: "saz-change", detail: { activeIndex: "active" } }
  }
};
_SazamiTabs_decorators = [component(tabsConfig)];
class SazamiTabs extends (_a$9 = SazamiComponent) {
  constructor() {
    super(...arguments);
    this.activeSignal = void 0;
    this._tabs = [];
    this._panelElements = [];
    this._handlersAdded = false;
  }
  render() {
    this._tabs = Array.from(this.querySelectorAll(':scope > [slot="tab"]')).map(
      (tab, i) => ({
        label: tab.getAttribute("label") || tab.textContent || `Tab ${i + 1}`,
        panelId: `panel-${i}`,
        tabId: `tab-${i}`
      })
    );
    const panels = Array.from(this.querySelectorAll(':scope > [slot="panel"]'));
    const activeTab = this.getAttribute("active") || "0";
    if (this._panelElements.length === 0) {
      this._panelElements = panels.map((panel, i) => {
        const el = document.createElement("div");
        el.className = "panel";
        el.setAttribute("role", "tabpanel");
        el.id = `panel-${i}`;
        el.setAttribute("aria-labelledby", `tab-${i}`);
        while (panel.firstChild) {
          el.appendChild(panel.firstChild);
        }
        return el;
      });
    }
    this.mount(
      STYLES$9,
      `
      <div class="tabs" role="tablist">
        ${this._tabs.map((t, i) => `<button class="tab${i.toString() === activeTab ? " active" : ""}" role="tab" id="${t.tabId}" aria-selected="${i.toString() === activeTab}" aria-controls="${t.panelId}">${escapeHtml(t.label)}</button>`).join("")}
      </div>
      <div class="panels"></div>
    `
    );
    const panelsContainer = this.shadow.querySelector(".panels");
    this._panelElements.forEach((el, i) => {
      el.classList.toggle("active", i.toString() === activeTab);
      el.style.display = i.toString() === activeTab ? "block" : "none";
      if (!panelsContainer.contains(el)) {
        panelsContainer.appendChild(el);
      }
    });
    const tabButtons = this.shadow.querySelectorAll(".tab");
    if (!this._handlersAdded) {
      this._handlersAdded = true;
      tabButtons.forEach((btn, i) => {
        this.addHandler("click", () => this._activateTab(i), {
          internal: true,
          element: btn
        });
        const handleKeydown = (e) => {
          const ke = e;
          if (ke.key === "ArrowRight") {
            ke.preventDefault();
            this._activateTab((i + 1) % this._tabs.length);
          } else if (ke.key === "ArrowLeft") {
            ke.preventDefault();
            this._activateTab((i - 1 + this._tabs.length) % this._tabs.length);
          }
        };
        this.addHandler("keydown", handleKeydown, {
          internal: true,
          element: btn
        });
      });
    }
    if (this.activeSignal) {
      this.bindAttribute(":host", "active", this.activeSignal);
    }
  }
  _activateTab(index, emit = true) {
    const tabButtons = this.shadow.querySelectorAll(".tab");
    tabButtons.forEach((b2, j2) => {
      b2.classList.toggle("active", j2 === index);
      b2.setAttribute(
        "aria-selected",
        j2 === index ? "true" : "false"
      );
    });
    this._panelElements.forEach((p2, j2) => {
      p2.classList.toggle("active", j2 === index);
      p2.style.display = j2 === index ? "block" : "none";
    });
    if (tabButtons[index]) {
      tabButtons[index].focus();
    }
    if (this.active !== index.toString()) {
      this.active = index.toString();
    }
    if (emit) {
      this.dispatchEventTyped("change", { activeIndex: index.toString() });
    }
  }
  static get observedAttributes() {
    return ["active"];
  }
  attributeChangedCallback(name, oldVal, newVal) {
    if (name === "active" && oldVal !== newVal && this.shadow.childNodes.length) {
      const parsedIndex = Number(newVal ?? 0);
      const tabCount = this._tabs.length;
      const validIndex = Math.max(0, Math.min(parsedIndex, tabCount - 1));
      this._activateTab(validIndex, false);
    }
  }
}
_init$9 = __decoratorStart$9(_a$9);
SazamiTabs = __decorateElement$9(_init$9, 0, "SazamiTabs", _SazamiTabs_decorators, SazamiTabs);
__runInitializers$9(_init$9, 1, SazamiTabs);
var __create$8 = Object.create;
var __defProp$8 = Object.defineProperty;
var __getOwnPropDesc$8 = Object.getOwnPropertyDescriptor;
var __knownSymbol$8 = (name, symbol) => (symbol = Symbol[name]) ? symbol : /* @__PURE__ */ Symbol.for("Symbol." + name);
var __typeError$8 = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp$8 = (obj, key, value) => key in obj ? __defProp$8(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __name$8 = (target, value) => __defProp$8(target, "name", { value, configurable: true });
var __decoratorStart$8 = (base) => [, , , __create$8(base?.[__knownSymbol$8("metadata")] ?? null)];
var __decoratorStrings$8 = ["class", "method", "getter", "setter", "accessor", "field", "value", "get", "set"];
var __expectFn$8 = (fn) => fn !== void 0 && typeof fn !== "function" ? __typeError$8("Function expected") : fn;
var __decoratorContext$8 = (kind, name, done, metadata, fns) => ({ kind: __decoratorStrings$8[kind], name, metadata, addInitializer: (fn) => done._ ? __typeError$8("Already initialized") : fns.push(__expectFn$8(fn || null)) });
var __decoratorMetadata$8 = (array, target) => __defNormalProp$8(target, __knownSymbol$8("metadata"), array[3]);
var __runInitializers$8 = (array, flags, self, value) => {
  for (var i = 0, fns = array[flags >> 1], n = fns && fns.length; i < n; i++) fns[i].call(self);
  return value;
};
var __decorateElement$8 = (array, flags, name, decorators, target, extra) => {
  var it, done, ctx, k2 = flags & 7, p2 = false;
  var j2 = 0;
  var extraInitializers = array[j2] || (array[j2] = []);
  var desc = k2 && (target = target.prototype, k2 < 5 && (k2 > 3 || !p2) && __getOwnPropDesc$8(target, name));
  __name$8(target, name);
  for (var i = decorators.length - 1; i >= 0; i--) {
    ctx = __decoratorContext$8(k2, name, done = {}, array[3], extraInitializers);
    it = (0, decorators[i])(target, ctx), done._ = 1;
    __expectFn$8(it) && (target = it);
  }
  return __decoratorMetadata$8(array, target), desc && __defProp$8(target, name, desc), p2 ? k2 ^ 4 ? extra : desc : target;
};
var _SazamiSlider_decorators, _init$8, _a$8;
const STYLES$8 = `
:host {
  display: block;
  width: 100%;
  padding: 8px 0;
  box-sizing: border-box;
}
.slider-container {
  position: relative;
  width: 100%;
  height: 20px;
  display: flex;
  align-items: center;
}
.track {
  position: absolute;
  width: 100%;
  height: 8px;
  background: var(--saz-color-border);
  border-radius: 999px;
  overflow: hidden;
}
.filled {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background: var(--saz-color-primary);
  border-radius: 999px;
}
.slider {
  position: relative;
  width: 100%;
  height: 20px;
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
  cursor: pointer;
  z-index: 1;
}
.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--saz-color-primary);
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(37, 99, 235, 0.3);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.slider::-webkit-slider-thumb:hover {
  transform: scale(1.15);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
}
.slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border: none;
  border-radius: 50%;
  background: var(--saz-color-primary);
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(37, 99, 235, 0.3);
}
.slider:focus-visible {
  outline: none;
}
.slider:focus-visible::-webkit-slider-thumb {
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.3), 0 2px 6px rgba(37, 99, 235, 0.3);
}
.labels {
  display: flex;
  justify-content: space-between;
  margin-top: var(--saz-space-small);
  font-size: var(--saz-text-size-small);
  color: var(--saz-color-text-dim);
}
${STATE_DISABLED}
`;
const sliderConfig = {
  properties: {
    min: { type: "number", reflect: false, default: 0 },
    max: { type: "number", reflect: false, default: 100 },
    step: { type: "number", reflect: false, default: 1 },
    size: { type: "string", reflect: false, default: "medium" }
  },
  events: {
    input: { name: "saz-input", detail: { value: "value" } }
  }
};
_SazamiSlider_decorators = [component(sliderConfig)];
class SazamiSlider extends (_a$8 = SazamiComponent) {
  constructor() {
    super(...arguments);
    this._valueSignal = null;
    this._disabledSignal = null;
    this._sliderElement = null;
    this._filledElement = null;
    this._rangeMin = 0;
    this._rangeMax = 100;
  }
  _isReadableNum(value) {
    return isSignal(value) || value instanceof Derived;
  }
  _isReadableBool(value) {
    return isSignal(value) || value instanceof Derived;
  }
  set value(valueOrSignal) {
    if (this._isReadableNum(valueOrSignal)) {
      this._valueSignal = valueOrSignal;
      this._setupValueBinding();
    } else {
      this._valueSignal = null;
      this._value = valueOrSignal;
      this._updateSliderValue(valueOrSignal);
    }
  }
  get value() {
    return this._valueSignal || this._value || 50;
  }
  set disabled(value) {
    if (this._isReadableBool(value)) {
      this._disabledSignal = value;
      this.bindDisabled(":host", value);
    } else {
      this._disabledSignal = null;
      this._setDisabled(value);
    }
  }
  get disabled() {
    return this._disabledSignal || this._disabled || false;
  }
  _setDisabled(value) {
    this._disabled = value;
    if (value) {
      this.setAttribute("disabled", "");
    } else {
      this.removeAttribute("disabled");
    }
  }
  _getIsDisabled() {
    if (this._disabledSignal) return this._disabledSignal.get();
    if (this._disabled !== void 0) return !!this._disabled;
    return this.hasAttribute("disabled");
  }
  _setupValueBinding() {
    if (!this._sliderElement || !this._filledElement) return;
    const slider = this._sliderElement;
    const filled = this._filledElement;
    const min = this._rangeMin;
    const max = this._rangeMax;
    const range = max - min;
    this.onCleanup(
      effect(() => {
        const val = this._valueSignal.get();
        if (slider.value !== String(val)) {
          slider.value = String(val);
        }
        const percent = range !== 0 ? (val - min) / range * 100 : 0;
        filled.style.width = `${percent}%`;
      })
    );
  }
  _updateSliderValue(value) {
    if (this._sliderElement) {
      this._sliderElement.value = String(value);
    }
    if (this._filledElement) {
      const range = this._rangeMax - this._rangeMin;
      const percent = range !== 0 ? (value - this._rangeMin) / range * 100 : 0;
      this._filledElement.style.width = `${percent}%`;
    }
  }
  render() {
    let min = this.min;
    let max = this.max;
    let step = this.step;
    if (!Number.isFinite(min)) min = 0;
    if (!Number.isFinite(max)) max = 100;
    if (!Number.isFinite(step)) step = 1;
    if (step <= 0) step = 1;
    if (min > max) [min, max] = [max, min];
    this._rangeMin = min;
    this._rangeMax = max;
    const currentValue = this._valueSignal ? this._valueSignal.get() : this._value || 50;
    let value = Number(currentValue);
    if (!Number.isFinite(value)) value = 50;
    if (value < min) value = min;
    if (value > max) value = max;
    const disabled = this._getIsDisabled();
    const size = this.size || "medium";
    const sizes = {
      tiny: { track: "4px", thumb: "16px" },
      small: { track: "6px", thumb: "18px" },
      medium: { track: "8px", thumb: "20px" },
      large: { track: "10px", thumb: "24px" },
      xlarge: { track: "14px", thumb: "28px" }
    };
    const trackHeight = sizes[size]?.track || sizes.medium.track;
    const thumbSize = sizes[size]?.thumb || sizes.medium.thumb;
    const range = max - min;
    const percent = range !== 0 ? (value - min) / range * 100 : 0;
    this.mount(
      STYLES$8,
      `
      <div class="slider-container" style="height: ${thumbSize}">
        <div class="track" style="height: ${trackHeight}">
          <div class="filled" style="width: ${percent}%"></div>
        </div>
        <input type="range" class="slider" min="${min}" max="${max}" step="${step}" value="${value}" ${disabled ? "disabled" : ""} style="height: ${thumbSize}" />
      </div>
      <div class="labels">
        <span>${min}</span>
        <span>${max}</span>
      </div>
    `
    );
    this._sliderElement = this.$(".slider");
    this._filledElement = this.$(".filled");
    if (this._sliderElement) {
      this.removeAllHandlers({ type: "input", source: "internal" });
      this.addHandler(
        "input",
        () => {
          const val = parseFloat(this._sliderElement.value);
          const pct = range !== 0 ? (val - min) / range * 100 : 0;
          this._filledElement.style.width = `${pct}%`;
          if (this._valueSignal && "set" in this._valueSignal) {
            this._valueSignal.set(val);
          } else {
            this._value = val;
          }
          this.dispatchEventTyped("input", { value: val });
        },
        { internal: true, element: this._sliderElement }
      );
    }
    if (this._valueSignal) {
      this._setupValueBinding();
    }
  }
  static get observedAttributes() {
    return [...super.observedAttributes, "value", "min", "max", "step", "size"];
  }
  attributeChangedCallback(name, oldVal, newVal) {
    if (name === "value" || name === "min" || name === "max" || name === "step") {
      let parsed = newVal !== null ? parseFloat(newVal) : null;
      if (parsed === null || Number.isNaN(parsed)) {
        parsed = name === "value" ? 50 : name === "step" ? 1 : name === "max" ? 100 : 0;
      }
      if (name === "step" && parsed <= 0) {
        parsed = 1;
      }
      this[name] = parsed;
      if (name === "value" || name === "min" || name === "max") {
        const min = this.min;
        const max = this.max;
        const currentVal = this._value || 50;
        if (currentVal < min) this.value = min;
        if (currentVal > max) this.value = max;
      }
    } else if (name === "size") {
      this[name] = newVal ?? "";
    }
    super.attributeChangedCallback(name, oldVal, newVal);
  }
}
_init$8 = __decoratorStart$8(_a$8);
SazamiSlider = __decorateElement$8(_init$8, 0, "SazamiSlider", _SazamiSlider_decorators, SazamiSlider);
__runInitializers$8(_init$8, 1, SazamiSlider);
var __create$7 = Object.create;
var __defProp$7 = Object.defineProperty;
var __getOwnPropDesc$7 = Object.getOwnPropertyDescriptor;
var __knownSymbol$7 = (name, symbol) => (symbol = Symbol[name]) ? symbol : /* @__PURE__ */ Symbol.for("Symbol." + name);
var __typeError$7 = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp$7 = (obj, key, value) => key in obj ? __defProp$7(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __name$7 = (target, value) => __defProp$7(target, "name", { value, configurable: true });
var __decoratorStart$7 = (base) => [, , , __create$7(base?.[__knownSymbol$7("metadata")] ?? null)];
var __decoratorStrings$7 = ["class", "method", "getter", "setter", "accessor", "field", "value", "get", "set"];
var __expectFn$7 = (fn) => fn !== void 0 && typeof fn !== "function" ? __typeError$7("Function expected") : fn;
var __decoratorContext$7 = (kind, name, done, metadata, fns) => ({ kind: __decoratorStrings$7[kind], name, metadata, addInitializer: (fn) => done._ ? __typeError$7("Already initialized") : fns.push(__expectFn$7(fn || null)) });
var __decoratorMetadata$7 = (array, target) => __defNormalProp$7(target, __knownSymbol$7("metadata"), array[3]);
var __runInitializers$7 = (array, flags, self, value) => {
  for (var i = 0, fns = array[flags >> 1], n = fns && fns.length; i < n; i++) fns[i].call(self);
  return value;
};
var __decorateElement$7 = (array, flags, name, decorators, target, extra) => {
  var it, done, ctx, k2 = flags & 7, p2 = false;
  var j2 = 0;
  var extraInitializers = array[j2] || (array[j2] = []);
  var desc = k2 && (target = target.prototype, k2 < 5 && (k2 > 3 || !p2) && __getOwnPropDesc$7(target, name));
  __name$7(target, name);
  for (var i = decorators.length - 1; i >= 0; i--) {
    ctx = __decoratorContext$7(k2, name, done = {}, array[3], extraInitializers);
    it = (0, decorators[i])(target, ctx), done._ = 1;
    __expectFn$7(it) && (target = it);
  }
  return __decoratorMetadata$7(array, target), desc && __defProp$7(target, name, desc), p2 ? k2 ^ 4 ? extra : desc : target;
};
var _SazamiRadio_decorators, _init$7, _a$7;
const STYLES$7 = `
:host {
  display: inline-flex;
  align-items: center;
  gap: var(--saz-space-small);
  cursor: pointer;
  user-select: none;
  vertical-align: middle;
}
.radio {
  width: 18px;
  height: 18px;
  border: 2px solid var(--saz-color-border);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.15s ease;
  flex-shrink: 0;
  align-self: center;
  background: var(--saz-color-background);
}
.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--saz-color-primary);
  opacity: 0;
  transform: scale(0);
  transition: opacity 0.15s ease, transform 0.15s ease;
}
:host([checked]) .radio {
  border-color: var(--saz-color-primary);
}
:host([checked]) .dot {
  opacity: 1;
  transform: scale(1);
}
.label {
  font-size: var(--saz-text-size-medium);
  color: var(--saz-color-text);
}
${STATE_DISABLED}
${INTERACTIVE_FOCUS}
`;
const radioConfig = {
  properties: {
    name: { type: "string", reflect: false },
    value: { type: "string", reflect: false }
  },
  events: {
    change: { name: "saz-change", detail: { value: "value" } }
  }
};
_SazamiRadio_decorators = [component(radioConfig)];
class SazamiRadio extends (_a$7 = SazamiComponent) {
  constructor() {
    super(...arguments);
    this._handlersInstalled = false;
    this._checkedSignal = null;
    this._checkedBindingDispose = null;
    this._disabledSignal = null;
    this._disabledBindingDispose = null;
    this._handleClick = () => {
      if (this._getIsDisabled()) return;
      if (this._getIsChecked()) return;
      const canWrite = !this._checkedSignal || "set" in this._checkedSignal;
      if (!canWrite) return;
      const name = this.getAttribute("name") || "";
      const value = this.getAttribute("value") || "";
      const root = this.getRootNode();
      if (root) {
        const escapedName = CSS.escape(name);
        root.querySelectorAll(`saz-radio[name="${escapedName}"]`).forEach((el) => {
          if (el === this) return;
          const siblingSignal = el._checkedSignal;
          if (siblingSignal && "set" in siblingSignal) {
            siblingSignal.set(false);
          } else {
            el.checked = false;
          }
        });
      }
      if (this._checkedSignal) {
        if ("set" in this._checkedSignal) {
          this._checkedSignal.set(true);
        }
      } else {
        this._setChecked(true);
      }
      this._updateAria();
      this.dispatchEventTyped("change", { value });
    };
    this._handleKeydown = (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        this._handleClick();
      }
    };
  }
  _isReadableBool(value) {
    return isSignal(value) || value instanceof Derived;
  }
  set checked(value) {
    if (this._checkedBindingDispose) {
      this._checkedBindingDispose();
      this._checkedBindingDispose = null;
    }
    if (this._isReadableBool(value)) {
      this._checkedSignal = value;
      const dispose = this.bindAttribute(":host", "checked", value);
      if (typeof dispose === "function") {
        this._checkedBindingDispose = dispose;
      }
    } else {
      this._checkedSignal = null;
      this._setChecked(value);
    }
  }
  get checked() {
    return this._checkedSignal || this._checked || false;
  }
  _setChecked(value) {
    this._checked = value;
    if (value) {
      this.setAttribute("checked", "");
    } else {
      this.removeAttribute("checked");
    }
  }
  set disabled(value) {
    if (this._disabledBindingDispose) {
      this._disabledBindingDispose();
      this._disabledBindingDispose = null;
    }
    if (this._isReadableBool(value)) {
      this._disabledSignal = value;
      const dispose = this.bindDisabled(":host", value);
      if (typeof dispose === "function") {
        this._disabledBindingDispose = dispose;
      }
    } else {
      this._disabledSignal = null;
      this._setDisabled(value);
    }
  }
  get disabled() {
    return this._disabledSignal || this._disabled || false;
  }
  _setDisabled(value) {
    this._disabled = value;
    if (value) {
      this.setAttribute("disabled", "");
    } else {
      this.removeAttribute("disabled");
    }
  }
  _getIsDisabled() {
    if (this._disabledSignal) return this._disabledSignal.get();
    if (this._disabled !== void 0) return !!this._disabled;
    return this.hasAttribute("disabled");
  }
  _getIsChecked() {
    if (this._checkedSignal) return this._checkedSignal.get();
    if (this.hasAttribute("checked")) return true;
    return !!this._checked;
  }
  render() {
    const label = this.textContent?.trim() || "";
    this.mount(
      STYLES$7,
      `
      <div class="radio"><div class="dot"></div></div>
      ${label ? `<span class="label">${escapeHtml(label)}</span>` : ""}
    `
    );
    if (!this.hasAttribute("role")) this.setAttribute("role", "radio");
    this._updateAria();
    if (!this._handlersInstalled) {
      this._handlersInstalled = true;
      this.addHandler("click", this._handleClick, { internal: true });
      this.addHandler("keydown", this._handleKeydown, { internal: true });
    }
  }
  _updateAria() {
    this.setAttribute("aria-checked", String(this._getIsChecked()));
    if (this._getIsDisabled()) {
      this.setAttribute("tabindex", "-1");
      this.setAttribute("aria-disabled", "true");
    } else {
      this.setAttribute("tabindex", "0");
      this.removeAttribute("aria-disabled");
    }
  }
  static get observedAttributes() {
    return ["checked", "disabled"];
  }
  attributeChangedCallback(name, oldVal, newVal) {
    super.attributeChangedCallback(name, oldVal, newVal);
    if (oldVal === newVal) return;
    if (name === "checked" || name === "disabled") {
      this._updateAria();
    }
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this._handlersInstalled = false;
  }
}
_init$7 = __decoratorStart$7(_a$7);
SazamiRadio = __decorateElement$7(_init$7, 0, "SazamiRadio", _SazamiRadio_decorators, SazamiRadio);
__runInitializers$7(_init$7, 1, SazamiRadio);
var __create$6 = Object.create;
var __defProp$6 = Object.defineProperty;
var __getOwnPropDesc$6 = Object.getOwnPropertyDescriptor;
var __knownSymbol$6 = (name, symbol) => (symbol = Symbol[name]) ? symbol : /* @__PURE__ */ Symbol.for("Symbol." + name);
var __typeError$6 = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp$6 = (obj, key, value) => key in obj ? __defProp$6(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __name$6 = (target, value) => __defProp$6(target, "name", { value, configurable: true });
var __decoratorStart$6 = (base) => [, , , __create$6(base?.[__knownSymbol$6("metadata")] ?? null)];
var __decoratorStrings$6 = ["class", "method", "getter", "setter", "accessor", "field", "value", "get", "set"];
var __expectFn$6 = (fn) => fn !== void 0 && typeof fn !== "function" ? __typeError$6("Function expected") : fn;
var __decoratorContext$6 = (kind, name, done, metadata, fns) => ({ kind: __decoratorStrings$6[kind], name, metadata, addInitializer: (fn) => done._ ? __typeError$6("Already initialized") : fns.push(__expectFn$6(fn || null)) });
var __decoratorMetadata$6 = (array, target) => __defNormalProp$6(target, __knownSymbol$6("metadata"), array[3]);
var __runInitializers$6 = (array, flags, self, value) => {
  for (var i = 0, fns = array[flags >> 1], n = fns && fns.length; i < n; i++) fns[i].call(self);
  return value;
};
var __decorateElement$6 = (array, flags, name, decorators, target, extra) => {
  var it, done, ctx, k2 = flags & 7, p2 = false;
  var j2 = 0;
  var extraInitializers = array[j2] || (array[j2] = []);
  var desc = k2 && (target = target.prototype, k2 < 5 && (k2 > 3 || !p2) && __getOwnPropDesc$6(target, name));
  __name$6(target, name);
  for (var i = decorators.length - 1; i >= 0; i--) {
    ctx = __decoratorContext$6(k2, name, done = {}, array[3], extraInitializers);
    it = (0, decorators[i])(target, ctx), done._ = 1;
    __expectFn$6(it) && (target = it);
  }
  return __decoratorMetadata$6(array, target), desc && __defProp$6(target, name, desc), p2 ? k2 ^ 4 ? extra : desc : target;
};
var _SazamiSwitch_decorators, _init$6, _a$6;
const STYLES$6 = `
:host {
  display: inline-flex;
  align-items: center;
  gap: var(--saz-space-small);
  cursor: pointer;
  user-select: none;
}
.switch {
  width: 44px;
  height: 24px;
  border-radius: 12px;
  background: var(--saz-color-border);
  position: relative;
  transition: background 0.2s ease;
  flex-shrink: 0;
}
.thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s ease;
}
:host([checked]) .switch {
  background: var(--saz-color-primary);
}
:host([checked]) .thumb {
  transform: translateX(20px);
}
:host([variant="accent"]) .switch {
  background: var(--saz-color-border);
}
:host([variant="accent"][checked]) .switch {
  background: var(--saz-color-accent);
}
:host([variant="success"]) .switch {
  background: var(--saz-color-border);
}
:host([variant="success"][checked]) .switch {
  background: var(--saz-color-success);
}
.label {
  font-size: var(--saz-text-size-medium);
  color: var(--saz-color-text);
}
${STATE_DISABLED}
${INTERACTIVE_FOCUS}
`;
const switchConfig = {
  properties: {
    checked: { type: "boolean", reflect: true },
    disabled: { type: "boolean", reflect: true },
    variant: { type: "string", reflect: false }
  },
  events: {
    change: { name: "saz-change", detail: { checked: "checked" } }
  },
  binds: {
    checked: "attribute",
    disabled: "attribute"
  }
};
_SazamiSwitch_decorators = [component(switchConfig)];
class SazamiSwitch extends (_a$6 = SazamiComponent) {
  constructor() {
    super(...arguments);
    this._checkedSignal = null;
    this._checkedBindingDispose = null;
    this._disabledSignal = null;
    this._disabledBindingDispose = null;
    this._handleClick = () => {
      if (this._getIsDisabled()) return;
      const newValue = !this._getIsChecked();
      if (this._checkedSignal) {
        if ("set" in this._checkedSignal) {
          this._checkedSignal.set(newValue);
          this._updateAria();
          this.dispatchEventTyped("change", { checked: newValue });
        }
      } else {
        this._setChecked(newValue);
        this.dispatchEventTyped("change", { checked: newValue });
      }
    };
    this._handleKeydown = (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        this._handleClick();
      }
    };
  }
  _isReadableBool(value) {
    return isSignal(value) || value instanceof Derived;
  }
  set checked(value) {
    if (this._checkedBindingDispose) {
      this._checkedBindingDispose();
      this._checkedBindingDispose = null;
    }
    if (this._isReadableBool(value)) {
      this._checkedSignal = value;
      const dispose = this.bindAttribute(":host", "checked", value);
      if (typeof dispose === "function") {
        this._checkedBindingDispose = dispose;
      }
    } else {
      this._checkedSignal = null;
      this._setChecked(value);
    }
  }
  get checked() {
    return this._checkedSignal || this._checked || false;
  }
  _setChecked(value) {
    this._checked = value;
    if (value) {
      this.setAttribute("checked", "");
    } else {
      this.removeAttribute("checked");
    }
    this._updateAria();
  }
  set disabled(value) {
    if (this._disabledBindingDispose) {
      this._disabledBindingDispose();
      this._disabledBindingDispose = null;
    }
    if (this._isReadableBool(value)) {
      this._disabledSignal = value;
      const dispose = this.bindDisabled(":host", value);
      if (typeof dispose === "function") {
        this._disabledBindingDispose = dispose;
      }
    } else {
      this._disabledSignal = null;
      this._setDisabled(value);
    }
  }
  get disabled() {
    return this._disabledSignal || this._disabled || false;
  }
  _setDisabled(value) {
    this._disabled = value;
    if (value) {
      this.setAttribute("disabled", "");
    } else {
      this.removeAttribute("disabled");
    }
    this._updateAria();
  }
  _getIsDisabled() {
    if (this._disabledSignal) return this._disabledSignal.get();
    if (this._disabled !== void 0) return !!this._disabled;
    return this.hasAttribute("disabled");
  }
  _getIsChecked() {
    if (this._checkedSignal) return this._checkedSignal.get();
    if (this.hasAttribute("checked")) return true;
    return !!this._checked;
  }
  render() {
    const label = this.textContent?.trim() || "";
    this.mount(
      STYLES$6,
      `
      <div class="switch"><div class="thumb"></div></div>
      ${label ? `<span class="label">${escapeHtml(label)}</span>` : ""}
    `
    );
    if (!this.hasAttribute("role")) this.setAttribute("role", "switch");
    this._updateAria();
    this.addHandler("click", this._handleClick, { internal: true });
    this.addHandler("keydown", this._handleKeydown, { internal: true });
  }
  _updateAria() {
    const isChecked = this._getIsChecked();
    const isDisabled = this._getIsDisabled();
    this.setAttribute("aria-checked", String(isChecked));
    if (isDisabled) {
      this.setAttribute("tabindex", "-1");
      this.setAttribute("aria-disabled", "true");
    } else {
      this.setAttribute("tabindex", "0");
      this.removeAttribute("aria-disabled");
    }
  }
  static get observedAttributes() {
    return ["checked", "disabled"];
  }
  attributeChangedCallback(name, oldVal, newVal) {
    if (oldVal === newVal) return;
    if (name === "checked" || name === "disabled") {
      this._updateAria();
    }
  }
}
_init$6 = __decoratorStart$6(_a$6);
SazamiSwitch = __decorateElement$6(_init$6, 0, "SazamiSwitch", _SazamiSwitch_decorators, SazamiSwitch);
__runInitializers$6(_init$6, 1, SazamiSwitch);
var __create$5 = Object.create;
var __defProp$5 = Object.defineProperty;
var __getOwnPropDesc$5 = Object.getOwnPropertyDescriptor;
var __knownSymbol$5 = (name, symbol) => (symbol = Symbol[name]) ? symbol : /* @__PURE__ */ Symbol.for("Symbol." + name);
var __typeError$5 = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp$5 = (obj, key, value) => key in obj ? __defProp$5(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __name$5 = (target, value) => __defProp$5(target, "name", { value, configurable: true });
var __decoratorStart$5 = (base) => [, , , __create$5(base?.[__knownSymbol$5("metadata")] ?? null)];
var __decoratorStrings$5 = ["class", "method", "getter", "setter", "accessor", "field", "value", "get", "set"];
var __expectFn$5 = (fn) => fn !== void 0 && typeof fn !== "function" ? __typeError$5("Function expected") : fn;
var __decoratorContext$5 = (kind, name, done, metadata, fns) => ({ kind: __decoratorStrings$5[kind], name, metadata, addInitializer: (fn) => done._ ? __typeError$5("Already initialized") : fns.push(__expectFn$5(fn || null)) });
var __decoratorMetadata$5 = (array, target) => __defNormalProp$5(target, __knownSymbol$5("metadata"), array[3]);
var __runInitializers$5 = (array, flags, self, value) => {
  for (var i = 0, fns = array[flags >> 1], n = fns && fns.length; i < n; i++) fns[i].call(self);
  return value;
};
var __decorateElement$5 = (array, flags, name, decorators, target, extra) => {
  var it, done, ctx, k2 = flags & 7, p2 = false;
  var j2 = 0;
  var extraInitializers = array[j2] || (array[j2] = []);
  var desc = k2 && (target = target.prototype, k2 < 5 && (k2 > 3 || !p2) && __getOwnPropDesc$5(target, name));
  __name$5(target, name);
  for (var i = decorators.length - 1; i >= 0; i--) {
    ctx = __decoratorContext$5(k2, name, done = {}, array[3], extraInitializers);
    it = (0, decorators[i])(target, ctx), done._ = 1;
    __expectFn$5(it) && (target = it);
  }
  return __decoratorMetadata$5(array, target), desc && __defProp$5(target, name, desc), p2 ? k2 ^ 4 ? extra : desc : target;
};
var _SazamiToast_decorators, _init$5, _a$5;
const STYLES$5 = `
:host {
  position: fixed;
  bottom: var(--saz-space-large);
  right: var(--saz-space-large);
  z-index: 9998;
  display: flex;
  align-items: center;
  gap: var(--saz-space-small);
  padding: var(--saz-space-small) var(--saz-space-large);
  background: var(--saz-color-background);
  border-radius: var(--saz-radius-medium);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(100px);
  opacity: 0;
  transition: transform 0.3s ease, opacity 0.3s ease;
  max-width: 320px;
}
:host([visible]) {
  transform: translateY(0);
  opacity: 1;
}
.icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}
:host([variant="success"]) .icon { color: var(--saz-color-success); }
:host([variant="error"]) .icon { color: var(--saz-color-danger); }
:host([variant="danger"]) .icon { color: var(--saz-color-danger); }
:host([variant="warning"]) .icon { color: #f59e0b; }
:host([variant="info"]) .icon { color: var(--saz-color-primary); }

.message {
  flex: 1;
  font-size: var(--saz-text-size-medium);
  color: var(--saz-color-text);
}
.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--saz-color-text-dim);
  border-radius: var(--saz-radius-soft);
  transition: background 0.15s ease;
}
${INTERACTIVE_HOVER}
.close-btn svg {
  width: 18px;
  height: 18px;
}
`;
const toastConfig = {
  properties: {
    message: { type: "string", reflect: false },
    variant: { type: "string", reflect: false },
    duration: { type: "number", reflect: false, default: 3e3 },
    visible: { type: "boolean", reflect: false }
  },
  events: {
    close: { name: "saz-close", detail: {} }
  }
};
_SazamiToast_decorators = [component(toastConfig)];
class SazamiToast extends (_a$5 = SazamiComponent) {
  constructor() {
    super(...arguments);
    this.messageSignal = void 0;
    this._hideTimeout = void 0;
    this._removeTimeout = void 0;
    this._closeHandler = () => this.hide();
    this._handleKeydown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        this.hide();
      }
    };
  }
  disconnectedCallback() {
    if (this._hideTimeout) {
      clearTimeout(this._hideTimeout);
    }
    if (this._removeTimeout) {
      clearTimeout(this._removeTimeout);
    }
    super.disconnectedCallback();
  }
  render() {
    const variant = this.getAttribute("variant") || "default";
    const message = this.getAttribute("message") || this.textContent?.trim() || "";
    const rawDuration = this.getAttribute("duration");
    let duration = 3e3;
    if (rawDuration !== null && rawDuration !== "") {
      const parsed = parseInt(rawDuration, 10);
      if (!Number.isNaN(parsed)) {
        duration = parsed;
      }
    }
    const showClose = !this.hasAttribute("no-close");
    const icon = variant === "success" ? ICON_SVGS.check : variant === "error" || variant === "danger" ? ICON_SVGS.close : variant === "warning" ? "⚠" : "ℹ";
    const urgent = variant === "error" || variant === "danger";
    this.setAttribute("role", urgent ? "alert" : "status");
    this.setAttribute("aria-live", urgent ? "assertive" : "polite");
    this.setAttribute("aria-atomic", "true");
    const messageEl = `<span class="message"></span>`;
    const closeBtnEl = showClose ? `<button class="close-btn" aria-label="Close">${ICON_SVGS.close}</button>` : "";
    this.mount(
      STYLES$5,
      `
      <span class="icon">${icon}</span>
      ${messageEl}
      ${closeBtnEl}
    `
    );
    const messageSpan = this.$(".message");
    if (messageSpan) {
      messageSpan.textContent = message;
    }
    if (this.messageSignal) {
      this.bindText(".message", this.messageSignal);
    }
    if (showClose) {
      const closeBtn = this.$(".close-btn");
      this.removeHandler("click", this._closeHandler);
      if (closeBtn) {
        this.addHandler("click", this._closeHandler, {
          internal: true,
          element: closeBtn
        });
      }
    }
    this.removeHandler("keydown", this._handleKeydown);
    this.addHandler("keydown", this._handleKeydown, { internal: true });
    if (!this.hasAttribute("visible")) {
      this.setAttribute("visible", "");
    }
    if (duration > 0) {
      if (this._hideTimeout) clearTimeout(this._hideTimeout);
      this._hideTimeout = setTimeout(() => this.hide(), duration);
    }
  }
  hide() {
    if (this._hideTimeout) {
      clearTimeout(this._hideTimeout);
      this._hideTimeout = void 0;
    }
    if (this._removeTimeout) {
      clearTimeout(this._removeTimeout);
    }
    this.visible = false;
    this._removeTimeout = setTimeout(() => {
      this._removeTimeout = void 0;
      this.dispatchEventTyped("close", {});
      this.remove();
    }, 300);
  }
  static show(message, variant = "info", duration = 3e3) {
    const toast = document.createElement("saz-toast");
    toast.setAttribute("message", message);
    toast.setAttribute("variant", variant);
    toast.setAttribute("duration", duration.toString());
    document.body.appendChild(toast);
    return toast;
  }
}
_init$5 = __decoratorStart$5(_a$5);
SazamiToast = __decorateElement$5(_init$5, 0, "SazamiToast", _SazamiToast_decorators, SazamiToast);
__runInitializers$5(_init$5, 1, SazamiToast);
var __create$4 = Object.create;
var __defProp$4 = Object.defineProperty;
var __getOwnPropDesc$4 = Object.getOwnPropertyDescriptor;
var __knownSymbol$4 = (name, symbol) => (symbol = Symbol[name]) ? symbol : /* @__PURE__ */ Symbol.for("Symbol." + name);
var __typeError$4 = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp$4 = (obj, key, value) => key in obj ? __defProp$4(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __name$4 = (target, value) => __defProp$4(target, "name", { value, configurable: true });
var __decoratorStart$4 = (base) => [, , , __create$4(base?.[__knownSymbol$4("metadata")] ?? null)];
var __decoratorStrings$4 = ["class", "method", "getter", "setter", "accessor", "field", "value", "get", "set"];
var __expectFn$4 = (fn) => fn !== void 0 && typeof fn !== "function" ? __typeError$4("Function expected") : fn;
var __decoratorContext$4 = (kind, name, done, metadata, fns) => ({ kind: __decoratorStrings$4[kind], name, metadata, addInitializer: (fn) => done._ ? __typeError$4("Already initialized") : fns.push(__expectFn$4(fn || null)) });
var __decoratorMetadata$4 = (array, target) => __defNormalProp$4(target, __knownSymbol$4("metadata"), array[3]);
var __runInitializers$4 = (array, flags, self, value) => {
  for (var i = 0, fns = array[flags >> 1], n = fns && fns.length; i < n; i++) fns[i].call(self);
  return value;
};
var __decorateElement$4 = (array, flags, name, decorators, target, extra) => {
  var it, done, ctx, k2 = flags & 7, p2 = false;
  var j2 = 0;
  var extraInitializers = array[j2] || (array[j2] = []);
  var desc = k2 && (target = target.prototype, k2 < 5 && (k2 > 3 || !p2) && __getOwnPropDesc$4(target, name));
  __name$4(target, name);
  for (var i = decorators.length - 1; i >= 0; i--) {
    ctx = __decoratorContext$4(k2, name, done = {}, array[3], extraInitializers);
    it = (0, decorators[i])(target, ctx), done._ = 1;
    __expectFn$4(it) && (target = it);
  }
  return __decoratorMetadata$4(array, target), desc && __defProp$4(target, name, desc), p2 ? k2 ^ 4 ? extra : desc : target;
};
var _SazamiAvatar_decorators, _init$4, _a$4;
const STYLES$4 = `
:host {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  overflow: hidden;
  background: var(--saz-color-primary);
  color: var(--saz-color-on-primary);
  font-weight: 600;
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  font-size: 14px;
}
:host([size="tiny"])   { width: 24px; height: 24px; font-size: 10px; }
:host([size="small"])  { width: 32px; height: 32px; font-size: 12px; }
:host([size="medium"]) { width: 40px; height: 40px; font-size: 14px; }
:host([size="large"])  { width: 56px; height: 56px; font-size: 20px; }
:host([size="xlarge"]) { width: 80px; height: 80px; font-size: 28px; }
.image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.initials {
  text-transform: uppercase;
  user-select: none;
}
${SHAPE_RULES}
`;
const avatarConfig = {
  properties: {
    alt: { type: "string", reflect: true },
    initials: { type: "string", reflect: true },
    size: { type: "string", reflect: true },
    shape: { type: "string", reflect: true },
    src: { type: "string", reflect: true }
  },
  structuralRoots: {
    image: "img",
    initials: "span"
  }
};
_SazamiAvatar_decorators = [component(avatarConfig)];
class SazamiAvatar extends (_a$4 = SazamiComponent) {
  constructor() {
    super(...arguments);
    this._srcSignal = null;
    this._imgElement = null;
    this._initialsElement = null;
    this._srcDisposer = null;
    this._modeEffectDisposer = null;
    this._altObserver = null;
    this._isImageMode = false;
  }
  getRenderMode() {
    return this._isImageMode ? "image" : "initials";
  }
  _isReadableStr(value) {
    return isSignal(value) || value instanceof Derived;
  }
  _disposeSrcBinding() {
    if (this._srcDisposer) {
      this._srcDisposer();
      this._srcDisposer = null;
    }
    if (this._modeEffectDisposer) {
      this._modeEffectDisposer();
      this._modeEffectDisposer = null;
    }
    if (this._altObserver) {
      this._altObserver.disconnect();
      this._altObserver = null;
    }
  }
  _getCurrentSrc() {
    if (this._srcSignal) return this._srcSignal.get();
    if (this._src) return this._src;
    return this.getAttribute("src") || "";
  }
  _isImageModeNow() {
    return !!this._getCurrentSrc();
  }
  set src(value) {
    this._isImageMode;
    const hasReadable = this._isReadableStr(value);
    if (hasReadable) {
      this._srcSignal = value;
      this._src = void 0;
    } else {
      this._srcSignal = null;
      this._src = value;
    }
    const nowImageMode = this._isImageModeNow();
    if (this._isImageMode !== nowImageMode) {
      this._disposeSrcBinding();
      this.render();
      return;
    }
    if (nowImageMode && this._imgElement) {
      this._disposeSrcBinding();
      this._setupSrcBinding();
      if (!this._srcSignal && this._imgElement) {
        this._imgElement.src = this._src || "";
        this._imgElement.alt = this.getAttribute("alt") || "";
      }
    } else if (!nowImageMode && this._initialsElement) {
      this._disposeSrcBinding();
      this._updateDisplay();
      this._setupSignalWatcher();
    } else if (!this._imgElement && !this._initialsElement) {
      this.render();
    }
  }
  get src() {
    return this._srcSignal || this._src || "";
  }
  _setupSrcBinding() {
    if (!this._imgElement || !this._srcSignal) return;
    const img = this._imgElement;
    const sig = this._srcSignal;
    img.src = sig.get();
    this._srcDisposer = bindProperty(img, "src", sig);
    this.onCleanup(this._srcDisposer);
    img.alt = this.getAttribute("alt") || "";
    this._altObserver = new MutationObserver(() => {
      img.alt = this.getAttribute("alt") || "";
    });
    this._altObserver.observe(this, {
      attributes: true,
      attributeFilter: ["alt"]
    });
    this.onCleanup(() => this._altObserver?.disconnect());
    const checkModeChange = () => {
      const currentSrc = sig.get();
      const shouldBeImageMode = !!currentSrc;
      if (this._isImageMode !== shouldBeImageMode) {
        this._disposeSrcBinding();
        this.render();
      }
    };
    this._modeEffectDisposer = effect(() => {
      sig.get();
      checkModeChange();
    });
    this.onCleanup(this._modeEffectDisposer);
  }
  _updateDisplay() {
    const currentSrc = this._getCurrentSrc();
    const alt = this.getAttribute("alt") || "";
    const textContent = this.textContent?.trim() || "";
    const initialsAttr = this.getAttribute("initials") || "";
    const initials = initialsAttr || this._getInitials(alt || textContent);
    if (this._isImageMode) {
      if (this._imgElement) {
        this._imgElement.src = currentSrc;
        this._imgElement.alt = alt;
        this._imgElement.style.display = "block";
      }
      if (this._initialsElement) {
        this._initialsElement.style.display = "none";
      }
    } else {
      if (this._initialsElement) {
        this._initialsElement.textContent = initials;
        this._initialsElement.style.display = "";
      }
      if (this._imgElement) {
        this._imgElement.style.display = "none";
      }
    }
  }
  render() {
    const currentSrc = this._getCurrentSrc();
    this._isImageMode = !!currentSrc;
    if (this._isImageMode) {
      this.mount(STYLES$4, `<img class="image" alt="" />`);
      this._imgElement = this.$(".image");
      this._initialsElement = null;
      if (this._srcSignal) {
        this._setupSrcBinding();
      } else {
        const currentSrc2 = this._getCurrentSrc();
        if (currentSrc2 && this._imgElement) {
          this._imgElement.src = currentSrc2;
        }
      }
    } else {
      this.mount(STYLES$4, `<span class="initials"></span>`);
      this._imgElement = null;
      this._initialsElement = this.$(".initials");
      this._updateDisplay();
      if (this._srcSignal) {
        this._setupSignalWatcher();
      }
    }
  }
  _setupSignalWatcher() {
    if (!this._srcSignal) return;
    if (this._modeEffectDisposer) {
      this._modeEffectDisposer();
    }
    const sig = this._srcSignal;
    this._modeEffectDisposer = effect(() => {
      const currentSrc = sig.get();
      const shouldBeImageMode = !!currentSrc;
      if (this._isImageMode !== shouldBeImageMode) {
        this._disposeSrcBinding();
        this.render();
      }
    });
    this.onCleanup(this._modeEffectDisposer);
  }
  _getInitials(name) {
    return name.split(" ").map((n) => n[0]).slice(0, 2).join("");
  }
  static get observedAttributes() {
    return ["src", "alt", "size", "shape", "initials"];
  }
  attributeChangedCallback(name, oldValue, newValue) {
    super.attributeChangedCallback(name, oldValue, newValue);
    if (name === "src" && oldValue !== newValue) {
      this._src = newValue || "";
      if (!this._srcSignal) {
        const wasImageMode = this._isImageMode;
        const nowImageMode = !!this._getCurrentSrc();
        if (wasImageMode !== nowImageMode) {
          this.render();
        } else {
          this._updateDisplay();
        }
      }
    }
  }
}
_init$4 = __decoratorStart$4(_a$4);
SazamiAvatar = __decorateElement$4(_init$4, 0, "SazamiAvatar", _SazamiAvatar_decorators, SazamiAvatar);
__runInitializers$4(_init$4, 1, SazamiAvatar);
var __create$3 = Object.create;
var __defProp$3 = Object.defineProperty;
var __getOwnPropDesc$3 = Object.getOwnPropertyDescriptor;
var __knownSymbol$3 = (name, symbol) => (symbol = Symbol[name]) ? symbol : /* @__PURE__ */ Symbol.for("Symbol." + name);
var __typeError$3 = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp$3 = (obj, key, value) => key in obj ? __defProp$3(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __name$3 = (target, value) => __defProp$3(target, "name", { value, configurable: true });
var __decoratorStart$3 = (base) => [, , , __create$3(base?.[__knownSymbol$3("metadata")] ?? null)];
var __decoratorStrings$3 = ["class", "method", "getter", "setter", "accessor", "field", "value", "get", "set"];
var __expectFn$3 = (fn) => fn !== void 0 && typeof fn !== "function" ? __typeError$3("Function expected") : fn;
var __decoratorContext$3 = (kind, name, done, metadata, fns) => ({ kind: __decoratorStrings$3[kind], name, metadata, addInitializer: (fn) => done._ ? __typeError$3("Already initialized") : fns.push(__expectFn$3(fn || null)) });
var __decoratorMetadata$3 = (array, target) => __defNormalProp$3(target, __knownSymbol$3("metadata"), array[3]);
var __runInitializers$3 = (array, flags, self, value) => {
  for (var i = 0, fns = array[flags >> 1], n = fns && fns.length; i < n; i++) fns[i].call(self);
  return value;
};
var __decorateElement$3 = (array, flags, name, decorators, target, extra) => {
  var it, done, ctx, k2 = flags & 7, p2 = false;
  var j2 = 0;
  var extraInitializers = array[j2] || (array[j2] = []);
  var desc = k2 && (target = target.prototype, k2 < 5 && (k2 > 3 || !p2) && __getOwnPropDesc$3(target, name));
  __name$3(target, name);
  for (var i = decorators.length - 1; i >= 0; i--) {
    ctx = __decoratorContext$3(k2, name, done = {}, array[3], extraInitializers);
    it = (0, decorators[i])(target, ctx), done._ = 1;
    __expectFn$3(it) && (target = it);
  }
  return __decoratorMetadata$3(array, target), desc && __defProp$3(target, name, desc), p2 ? k2 ^ 4 ? extra : desc : target;
};
var _SazamiChip_decorators, _init$3, _a$3;
const STYLES$3 = `
:host {
  display: inline-flex;
  align-items: center;
  gap: var(--saz-space-tiny);
  padding: var(--saz-space-tiny) var(--saz-space-small);
  border-radius: var(--saz-radius-round);
  font-size: var(--saz-text-size-small);
  font-weight: 500;
  cursor: pointer;
  user-select: none;
  transition: background 0.15s ease, color 0.15s ease;
}
:host([size="small"]) {
  padding: 2px var(--saz-space-tiny);
  font-size: 10px;
}
:host([size="large"]) {
  padding: var(--saz-space-small) var(--saz-space-medium);
  font-size: var(--saz-text-size-medium);
}
:host([size="xlarge"]) {
  padding: var(--saz-space-medium) var(--saz-space-large);
  font-size: var(--saz-text-size-large);
}
:host([variant="default"]) {
  background: var(--saz-color-surface);
  color: var(--saz-color-text);
}
:host([variant="primary"]) {
  background: var(--saz-color-primary);
  color: var(--saz-color-on-primary);
}
:host([variant="accent"]) {
  background: var(--saz-color-accent);
  color: var(--saz-color-on-accent);
}
:host([variant="success"]) {
  background: var(--saz-color-success);
  color: #fff;
}
:host([variant="warning"]) {
  background: #fef3c7;
  color: #92400e;
}
:host([variant="danger"]) {
  background: var(--saz-color-danger);
  color: #fff;
}
:host([selected]) {
  background: var(--saz-color-primary);
  color: var(--saz-color-on-primary);
}
${INTERACTIVE_HOVER}
${STATE_DISABLED}
.remove-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 50%;
  color: inherit;
  opacity: 0.7;
  transition: opacity 0.15s ease, background 0.15s ease;
}
.remove-btn:hover {
  opacity: 1;
  background: rgba(0, 0, 0, 0.1);
}
.remove-btn svg {
  width: 16px;
  height: 16px;
}
`;
const chipConfig = {
  properties: {
    label: { type: "string", reflect: false },
    variant: { type: "string", reflect: false },
    removable: { type: "boolean", reflect: false },
    selected: { type: "boolean", reflect: true },
    disabled: { type: "boolean", reflect: true },
    size: { type: "string", reflect: false }
  },
  events: {
    change: { name: "saz-change", detail: { selected: "selected" } },
    remove: { name: "saz-remove", detail: {} }
  }
};
_SazamiChip_decorators = [component(chipConfig)];
class SazamiChip extends (_a$3 = SazamiComponent) {
  constructor() {
    super(...arguments);
    this.disabledSignal = void 0;
    this.selectedSignal = void 0;
    this._handleClick = () => {
      if (this.disabled) return;
      this.selected = !this.selected;
      this.setAttribute("aria-pressed", String(this.selected));
      this.dispatchEventTyped("change", { selected: this.selected });
    };
    this._handleKeydown = (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        this._handleClick();
      }
    };
  }
  render() {
    const label = this.getAttribute("label") || this.textContent?.trim() || "";
    const removable = this.hasAttribute("removable");
    this.mount(
      STYLES$3,
      `
      <span class="chip-label">${escapeHtml(label)}</span>${removable ? `<button class="remove-btn" aria-label="Remove">${ICON_SVGS.close}</button>` : ""}
    `
    );
    if (!this.hasAttribute("role")) this.setAttribute("role", "button");
    this.setAttribute("aria-pressed", String(this.selected));
    this._updateTabIndex();
    if (removable) {
      const btn = this.$(".remove-btn");
      this.addHandler(
        "click",
        (e) => {
          e.stopPropagation();
          this.dispatchEventTyped("remove", {});
          this.remove();
        },
        { internal: true, element: btn }
      );
    }
    this.addHandler("click", this._handleClick, { internal: true });
    this.addHandler("keydown", this._handleKeydown, { internal: true });
    if (this.disabledSignal) {
      this.bindDisabled(":host", this.disabledSignal);
    }
    if (this.selectedSignal) {
      this.bindAttribute(":host", "selected", this.selectedSignal);
    }
  }
  _updateTabIndex() {
    if (this.disabled) {
      this.setAttribute("tabindex", "-1");
      this.setAttribute("aria-disabled", "true");
    } else {
      this.setAttribute("tabindex", "0");
      this.removeAttribute("aria-disabled");
    }
  }
}
_init$3 = __decoratorStart$3(_a$3);
SazamiChip = __decorateElement$3(_init$3, 0, "SazamiChip", _SazamiChip_decorators, SazamiChip);
__runInitializers$3(_init$3, 1, SazamiChip);
var __create$2 = Object.create;
var __defProp$2 = Object.defineProperty;
var __getOwnPropDesc$2 = Object.getOwnPropertyDescriptor;
var __knownSymbol$2 = (name, symbol) => (symbol = Symbol[name]) ? symbol : /* @__PURE__ */ Symbol.for("Symbol." + name);
var __typeError$2 = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp$2 = (obj, key, value) => key in obj ? __defProp$2(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __name$2 = (target, value) => __defProp$2(target, "name", { value, configurable: true });
var __decoratorStart$2 = (base) => [, , , __create$2(base?.[__knownSymbol$2("metadata")] ?? null)];
var __decoratorStrings$2 = ["class", "method", "getter", "setter", "accessor", "field", "value", "get", "set"];
var __expectFn$2 = (fn) => fn !== void 0 && typeof fn !== "function" ? __typeError$2("Function expected") : fn;
var __decoratorContext$2 = (kind, name, done, metadata, fns) => ({ kind: __decoratorStrings$2[kind], name, metadata, addInitializer: (fn) => done._ ? __typeError$2("Already initialized") : fns.push(__expectFn$2(fn || null)) });
var __decoratorMetadata$2 = (array, target) => __defNormalProp$2(target, __knownSymbol$2("metadata"), array[3]);
var __runInitializers$2 = (array, flags, self, value) => {
  for (var i = 0, fns = array[flags >> 1], n = fns && fns.length; i < n; i++) fns[i].call(self);
  return value;
};
var __decorateElement$2 = (array, flags, name, decorators, target, extra) => {
  var it, done, ctx, k2 = flags & 7, p2 = false;
  var j2 = 0;
  var extraInitializers = array[j2] || (array[j2] = []);
  var desc = k2 && (target = target.prototype, k2 < 5 && (k2 > 3 || !p2) && __getOwnPropDesc$2(target, name));
  __name$2(target, name);
  for (var i = decorators.length - 1; i >= 0; i--) {
    ctx = __decoratorContext$2(k2, name, done = {}, array[3], extraInitializers);
    it = (0, decorators[i])(target, ctx), done._ = 1;
    __expectFn$2(it) && (target = it);
  }
  return __decoratorMetadata$2(array, target), desc && __defProp$2(target, name, desc), p2 ? k2 ^ 4 ? extra : desc : target;
};
var _SazamiSpinner_decorators, _init$2, _a$2;
const STYLES$2 = `
:host {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--saz-space-small);
}
.spinner {
  animation: spin 1s linear infinite;
  color: var(--saz-color-primary);
}
.spinner svg {
  width: 100%;
  height: 100%;
  fill: none;
  stroke: currentColor;
}
:host(:not([size])) .spinner,
:host([size="medium"]) .spinner { width: 24px; height: 24px; }
:host([size="tiny"]) .spinner { width: 12px; height: 12px; }
:host([size="small"]) .spinner { width: 16px; height: 16px; }
:host([size="large"]) .spinner { width: 32px; height: 32px; }
:host([size="xlarge"]) .spinner { width: 48px; height: 48px; }
:host([variant="accent"]) .spinner { color: var(--saz-color-accent); }
:host([variant="light"]) .spinner { color: #fff; }
.label {
  font-size: var(--saz-text-size-small);
  color: var(--saz-color-text-dim);
}
:host([label=""]) .label { display: none; }
:host(:not([label])) .label { 
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
`;
const spinnerConfig = {
  properties: {
    size: { type: "string", reflect: true },
    variant: { type: "string", reflect: true }
  }
};
_SazamiSpinner_decorators = [component(spinnerConfig)];
class SazamiSpinner extends (_a$2 = SazamiComponent) {
  constructor() {
    super(...arguments);
    this._labelSignal = null;
    this._visibleSignal = null;
    this._labelElement = null;
  }
  _isReadableStr(value) {
    return isSignal(value) || value instanceof Derived;
  }
  _isReadableBool(value) {
    return isSignal(value) || value instanceof Derived;
  }
  set label(value) {
    if (this._isReadableStr(value)) {
      this._labelSignal = value;
    } else {
      this._labelSignal = null;
      this._label = value;
      this._updateLabel(value);
    }
  }
  get label() {
    if (this._labelSignal) return this._labelSignal;
    return this._label || "";
  }
  set visible(value) {
    if (this._isReadableBool(value)) {
      this._visibleSignal = value;
      this.bindVisible(":host", value);
    } else {
      this._visibleSignal = null;
      if (value) {
        this.setAttribute("visible", "");
      } else {
        this.removeAttribute("visible");
      }
    }
  }
  get visible() {
    return this._visibleSignal || this.hasAttribute("visible");
  }
  _updateLabel(value) {
    if (this._labelElement) {
      this._labelElement.textContent = value;
    }
  }
  _setupLabelBinding() {
    if (!this._labelElement) return;
    const dispose = bindText(this._labelElement, this._labelSignal);
    this.onCleanup(dispose);
  }
  render() {
    const labelText = this._labelSignal ? this._labelSignal.get() : this._label ?? "Loading...";
    if (!this.hasAttribute("role")) {
      this.setAttribute("role", "status");
    }
    if (!this.hasAttribute("aria-live")) {
      this.setAttribute("aria-live", "polite");
    }
    this.mount(
      STYLES$2,
      `
      <div class="spinner">${ICON_SVGS["spinner"] || ""}</div>
      <span class="label"></span>
    `
    );
    this._labelElement = this.$(".label");
    if (this._labelElement) {
      this._labelElement.textContent = labelText;
      if (this._labelSignal) {
        this._setupLabelBinding();
      }
    }
  }
}
_init$2 = __decoratorStart$2(_a$2);
SazamiSpinner = __decorateElement$2(_init$2, 0, "SazamiSpinner", _SazamiSpinner_decorators, SazamiSpinner);
__runInitializers$2(_init$2, 1, SazamiSpinner);
var __create$1 = Object.create;
var __defProp$1 = Object.defineProperty;
var __getOwnPropDesc$1 = Object.getOwnPropertyDescriptor;
var __knownSymbol$1 = (name, symbol) => (symbol = Symbol[name]) ? symbol : /* @__PURE__ */ Symbol.for("Symbol." + name);
var __typeError$1 = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp$1 = (obj, key, value) => key in obj ? __defProp$1(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __name$1 = (target, value) => __defProp$1(target, "name", { value, configurable: true });
var __decoratorStart$1 = (base) => [, , , __create$1(base?.[__knownSymbol$1("metadata")] ?? null)];
var __decoratorStrings$1 = ["class", "method", "getter", "setter", "accessor", "field", "value", "get", "set"];
var __expectFn$1 = (fn) => fn !== void 0 && typeof fn !== "function" ? __typeError$1("Function expected") : fn;
var __decoratorContext$1 = (kind, name, done, metadata, fns) => ({ kind: __decoratorStrings$1[kind], name, metadata, addInitializer: (fn) => done._ ? __typeError$1("Already initialized") : fns.push(__expectFn$1(fn || null)) });
var __decoratorMetadata$1 = (array, target) => __defNormalProp$1(target, __knownSymbol$1("metadata"), array[3]);
var __runInitializers$1 = (array, flags, self, value) => {
  for (var i = 0, fns = array[flags >> 1], n = fns && fns.length; i < n; i++) fns[i].call(self);
  return value;
};
var __decorateElement$1 = (array, flags, name, decorators, target, extra) => {
  var it, done, ctx, k2 = flags & 7, p2 = false;
  var j2 = 0;
  var extraInitializers = array[j2] || (array[j2] = []);
  var desc = k2 && (target = target.prototype, k2 < 5 && (k2 > 3 || !p2) && __getOwnPropDesc$1(target, name));
  __name$1(target, name);
  for (var i = decorators.length - 1; i >= 0; i--) {
    ctx = __decoratorContext$1(k2, name, done = {}, array[3], extraInitializers);
    it = (0, decorators[i])(target, ctx), done._ = 1;
    __expectFn$1(it) && (target = it);
  }
  return __decoratorMetadata$1(array, target), desc && __defProp$1(target, name, desc), p2 ? k2 ^ 4 ? extra : desc : target;
};
var _SazamiProgress_decorators, _init$1, _a$1;
const STYLES$1 = `
:host { display: block; width: 100%; }
.track {
  width: 100%;
  background: var(--saz-color-surface);
  border-radius: var(--saz-radius-round);
  overflow: hidden;
  border: 2px solid var(--saz-color-border);
}
:host(:not([size])) .track,
:host([size="medium"]) .track { height: 12px; }
:host([size="tiny"]) .track { height: 6px; }
:host([size="small"]) .track { height: 8px; }
:host([size="large"]) .track { height: 16px; }
:host([size="xlarge"]) .track { height: 20px; }
.bar {
  height: 100%;
  background: var(--saz-color-primary);
  border-radius: var(--saz-radius-round);
  transition: width 0.3s ease;
}
:host([variant="accent"]) .bar { background: var(--saz-color-accent); }
:host([variant="success"]) .bar { background: var(--saz-color-success); }
:host([variant="danger"]) .bar { background: var(--saz-color-danger); }
:host([indeterminate]) .bar {
  width: 30% !important;
  animation: indeterminate 1.5s ease-in-out infinite;
}
@keyframes indeterminate {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(400%); }
}
`;
const progressConfig = {
  properties: {
    max: { type: "number", reflect: true, default: 100 },
    min: { type: "number", reflect: true, default: 0 },
    size: { type: "string", reflect: true },
    variant: { type: "string", reflect: true },
    indeterminate: { type: "boolean", reflect: true }
  }
};
_SazamiProgress_decorators = [component(progressConfig)];
class SazamiProgress extends (_a$1 = SazamiComponent) {
  constructor() {
    super(...arguments);
    this._valueSignal = null;
    this._barElement = null;
    this._rangeMin = 0;
    this._rangeMax = 100;
    this._valueBindingCleanup = null;
  }
  _isReadableNum(value) {
    return isSignal(value) || value instanceof Derived;
  }
  set value(valueOrSignal) {
    if (this._isReadableNum(valueOrSignal)) {
      this._valueSignal = valueOrSignal;
      if (this._barElement) {
        this._setupValueBinding();
      }
    } else {
      this._valueSignal = null;
      if (this._valueBindingCleanup) {
        this._valueBindingCleanup();
        this._valueBindingCleanup = null;
      }
      this._value = valueOrSignal;
      this._updateBarWidth(valueOrSignal);
    }
  }
  get value() {
    return this._valueSignal || this._value || 0;
  }
  _setupValueBinding() {
    if (!this._barElement || !this._valueSignal) return;
    if (this._valueBindingCleanup) {
      this._valueBindingCleanup();
    }
    const cleanups = [];
    const widthDisposer = this.bindWidthPercent(
      ".bar",
      this._valueSignal,
      this._rangeMin,
      this._rangeMax
    );
    cleanups.push(widthDisposer);
    const ariaDisposer = effect(() => {
      const val = this._valueSignal.get();
      if (this.hasAttribute("indeterminate")) {
        this.removeAttribute("aria-valuenow");
        return;
      }
      const range = this._rangeMax - this._rangeMin;
      const clamped = range > 0 ? Math.min(this._rangeMax, Math.max(this._rangeMin, val)) : void 0;
      if (clamped !== void 0) {
        this.setAttribute("aria-valuenow", String(Math.round(clamped)));
      } else {
        this.removeAttribute("aria-valuenow");
      }
    });
    cleanups.push(ariaDisposer);
    this._valueBindingCleanup = () => {
      cleanups.forEach((fn) => fn());
    };
    this.onCleanup(this._valueBindingCleanup);
  }
  _updateBarWidth(value) {
    if (this._barElement) {
      const range = this._rangeMax - this._rangeMin;
      const percent = range > 0 ? Math.min(100, Math.max(0, (value - this._rangeMin) / range * 100)) : 0;
      this._barElement.style.width = `${percent}%`;
    }
  }
  render() {
    const rawValue = this._valueSignal ? this._valueSignal.get() : this._value ?? Number(this.getAttribute("value") || "50");
    const rawMax = Number(this.getAttribute("max") || "100");
    const rawMin = Number(this.getAttribute("min") || "0");
    const value = Number.isFinite(rawValue) ? rawValue : 50;
    const max = Number.isFinite(rawMax) ? rawMax : 100;
    const min = Number.isFinite(rawMin) ? rawMin : 0;
    const indeterminate = this.hasAttribute("indeterminate");
    this._rangeMin = min;
    this._rangeMax = max;
    const range = max - min;
    const percent = range > 0 ? Math.min(100, Math.max(0, (value - min) / range * 100)) : 0;
    if (!this.hasAttribute("role")) {
      this.setAttribute("role", "progressbar");
    }
    this.setAttribute("aria-valuemin", String(min));
    this.setAttribute("aria-valuemax", String(max));
    if (indeterminate) {
      this.removeAttribute("aria-valuenow");
    } else {
      const clamped = range > 0 ? Math.min(max, Math.max(min, value)) : void 0;
      if (clamped !== void 0) {
        this.setAttribute("aria-valuenow", String(Math.round(clamped)));
      } else {
        this.removeAttribute("aria-valuenow");
      }
    }
    this.mountSync(
      STYLES$1,
      `
      <div class="track">
        <div class="bar" style="width: ${indeterminate ? "30%" : percent + "%"}"></div>
      </div>
    `
    );
    this._barElement = this.$(".bar");
    if (this._valueSignal && this._barElement) {
      this._setupValueBinding();
    }
  }
  static get observedAttributes() {
    return ["value", "max", "min", "indeterminate"];
  }
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    this.render();
  }
}
_init$1 = __decoratorStart$1(_a$1);
SazamiProgress = __decorateElement$1(_init$1, 0, "SazamiProgress", _SazamiProgress_decorators, SazamiProgress);
__runInitializers$1(_init$1, 1, SazamiProgress);
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __knownSymbol = (name, symbol) => (symbol = Symbol[name]) ? symbol : /* @__PURE__ */ Symbol.for("Symbol." + name);
var __typeError = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decoratorStart = (base) => [, , , __create(base?.[__knownSymbol("metadata")] ?? null)];
var __decoratorStrings = ["class", "method", "getter", "setter", "accessor", "field", "value", "get", "set"];
var __expectFn = (fn) => fn !== void 0 && typeof fn !== "function" ? __typeError("Function expected") : fn;
var __decoratorContext = (kind, name, done, metadata, fns) => ({ kind: __decoratorStrings[kind], name, metadata, addInitializer: (fn) => done._ ? __typeError("Already initialized") : fns.push(__expectFn(fn || null)) });
var __decoratorMetadata = (array, target) => __defNormalProp(target, __knownSymbol("metadata"), array[3]);
var __runInitializers = (array, flags, self, value) => {
  for (var i = 0, fns = array[flags >> 1], n = fns && fns.length; i < n; i++) fns[i].call(self);
  return value;
};
var __decorateElement = (array, flags, name, decorators, target, extra) => {
  var it, done, ctx, k2 = flags & 7, p2 = false;
  var j2 = 0;
  var extraInitializers = array[j2] || (array[j2] = []);
  var desc = k2 && (target = target.prototype, k2 < 5 && (k2 > 3 || !p2) && __getOwnPropDesc(target, name));
  __name(target, name);
  for (var i = decorators.length - 1; i >= 0; i--) {
    ctx = __decoratorContext(k2, name, done = {}, array[3], extraInitializers);
    it = (0, decorators[i])(target, ctx), done._ = 1;
    __expectFn(it) && (target = it);
  }
  return __decoratorMetadata(array, target), desc && __defProp(target, name, desc), p2 ? k2 ^ 4 ? extra : desc : target;
};
var _SazamiAccordion_decorators, _init, _a;
const STYLES = `
:host { display: block; }
.item {
  border-bottom: 1px solid var(--saz-color-border);
}
.item:first-child { border-top: 1px solid var(--saz-color-border); }
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--saz-space-medium) var(--saz-space-small);
  cursor: pointer;
  background: transparent;
  border: none;
  width: 100%;
  text-align: left;
  font-size: inherit;
  font-family: inherit;
  color: var(--saz-color-text);
  transition: background 0.15s ease;
}
.header:hover {
  background: var(--saz-color-surface);
}
.header:focus-visible {
  outline: 2px solid var(--saz-color-primary);
  outline-offset: -2px;
}
.title {
  font-weight: 500;
  font-size: var(--saz-text-size-medium);
}
.chevron {
  width: 20px;
  height: 20px;
  color: var(--saz-color-text-dim);
  transition: transform 0.2s ease;
  flex-shrink: 0;
}
.chevron svg {
  width: 100%;
  height: 100%;
  fill: none;
  stroke: currentColor;
}
.item[open] .chevron {
  transform: rotate(180deg);
}
.content {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease, padding 0.3s ease;
  padding: 0 var(--saz-space-small);
}
.item[open] .content {
  max-height: 500px;
  padding-bottom: var(--saz-space-medium);
}
.inner-content {
  font-size: var(--saz-text-size-medium);
  color: var(--saz-color-text-dim);
  line-height: 1.5;
}
`;
const accordionConfig = {
  properties: {
    "single-open": { type: "boolean", reflect: false },
    index: { type: "string", reflect: false },
    open: { type: "boolean", reflect: false }
  },
  events: {
    change: { name: "saz-change", detail: { index: "index", open: "open" } }
  }
};
_SazamiAccordion_decorators = [component(accordionConfig)];
class SazamiAccordion extends (_a = SazamiComponent) {
  constructor() {
    super(...arguments);
    this._itemElements = [];
    this._handlersAdded = false;
  }
  render() {
    const items = Array.from(this.querySelectorAll(":scope > *")).map(
      (el, i) => ({
        title: el.getAttribute("heading") || `Section ${i + 1}`,
        element: el,
        open: el.hasAttribute("open")
      })
    );
    if (this._itemElements.length === 0) {
      this._itemElements = items.map((item, i) => {
        const wrapper = document.createElement("div");
        wrapper.className = "item";
        if (item.open) wrapper.setAttribute("open", "");
        const header = document.createElement("button");
        header.className = "header";
        header.setAttribute("aria-expanded", String(item.open));
        header.id = `accordion-header-${i}`;
        const titleSpan = document.createElement("span");
        titleSpan.className = "title";
        titleSpan.textContent = item.title;
        const chevron = document.createElement("div");
        chevron.className = "chevron";
        chevron.innerHTML = ICON_SVGS["chevron-down"] || "";
        header.appendChild(titleSpan);
        header.appendChild(chevron);
        const content = document.createElement("div");
        content.className = "content";
        content.id = `accordion-content-${i}`;
        const innerContent = document.createElement("div");
        innerContent.className = "inner-content";
        while (item.element.firstChild) {
          innerContent.appendChild(item.element.firstChild);
        }
        content.appendChild(innerContent);
        wrapper.appendChild(header);
        wrapper.appendChild(content);
        return wrapper;
      });
    }
    this.mount(STYLES, "");
    const container = document.createElement("div");
    container.className = "accordion-container";
    this._itemElements.forEach((wrapper, i) => {
      if (!container.contains(wrapper)) {
        container.appendChild(wrapper);
      }
      const header = wrapper.querySelector(".header");
      const isOpen = wrapper.hasAttribute("open");
      header.setAttribute("aria-expanded", String(isOpen));
      header.setAttribute("aria-controls", `accordion-content-${i}`);
    });
    this.shadow.appendChild(container);
    if (!this._handlersAdded) {
      this._handlersAdded = true;
      const headers = this.shadow.querySelectorAll(".header");
      headers.forEach((header, i) => {
        const handleClick = () => {
          const item = header.parentElement;
          const isOpen = item?.hasAttribute("open");
          if (this.hasAttribute("single-open")) {
            this._itemElements.forEach((el) => {
              el.removeAttribute("open");
            });
            headers.forEach((h) => {
              h.setAttribute("aria-expanded", "false");
            });
          }
          if (isOpen) {
            item?.removeAttribute("open");
            header.setAttribute("aria-expanded", "false");
          } else {
            item?.setAttribute("open", "");
            header.setAttribute("aria-expanded", "true");
          }
          this.dispatchEventTyped("change", {
            index: i.toString(),
            open: !isOpen
          });
        };
        this.addHandler("click", handleClick, {
          internal: true,
          element: header
        });
      });
    }
  }
}
_init = __decoratorStart(_a);
SazamiAccordion = __decorateElement(_init, 0, "SazamiAccordion", _SazamiAccordion_decorators, SazamiAccordion);
__runInitializers(_init, 1, SazamiAccordion);
const COMPONENT_REGISTRY = {
  "saz-row": SazamiRow,
  "saz-column": SazamiColumn,
  "saz-grid": SazamiGrid,
  "saz-stack": SazamiStack,
  "saz-card": SazamiCard,
  "saz-text": SazamiText,
  "saz-heading": SazamiHeading,
  "saz-label": SazamiLabel,
  "saz-button": SazamiButton,
  "saz-icon-button": SazamiIconButton,
  "saz-input": SazamiInput,
  "saz-checkbox": SazamiCheckbox,
  "saz-toggle": SazamiToggle,
  "saz-image": SazamiImage,
  "saz-coverart": SazamiCoverart,
  "saz-icon": SazamiIcon,
  "saz-badge": SazamiBadge,
  "saz-tag": SazamiTag,
  "saz-divider": SazamiDivider,
  "saz-spacer": SazamiSpacer,
  "saz-section": SazamiSection,
  "saz-details": createGenericClass(),
  "saz-controls": createGenericClass(),
  "saz-modal": SazamiModal,
  "saz-select": SazamiSelect,
  "saz-tabs": SazamiTabs,
  "saz-slider": SazamiSlider,
  "saz-radio": SazamiRadio,
  "saz-switch": SazamiSwitch,
  "saz-toast": SazamiToast,
  "saz-avatar": SazamiAvatar,
  "saz-chip": SazamiChip,
  "saz-spinner": SazamiSpinner,
  "saz-progress": SazamiProgress,
  "saz-accordion": SazamiAccordion
};
function registerComponents() {
  if (typeof customElements === "undefined") return;
  Object.entries(COMPONENT_REGISTRY).forEach(([tag, cls]) => {
    if (!customElements.get(tag)) {
      customElements.define(tag, cls);
    }
  });
}
const SAZAMI_REGISTRY = {
  card: { tag: "saz-card" },
  text: { tag: "saz-text" },
  heading: { tag: "saz-heading" },
  label: { tag: "saz-label" },
  button: { tag: "saz-button" },
  "icon-btn": { tag: "saz-icon-button" },
  input: { tag: "saz-input" },
  checkbox: { tag: "saz-checkbox" },
  toggle: { tag: "saz-toggle" },
  image: { tag: "saz-image" },
  coverart: { tag: "saz-coverart" },
  icon: { tag: "saz-icon" },
  badge: { tag: "saz-badge" },
  tag: { tag: "saz-tag" },
  divider: { tag: "saz-divider" },
  spacer: { tag: "saz-spacer" },
  row: { tag: "saz-row" },
  column: { tag: "saz-column" },
  grid: { tag: "saz-grid" },
  stack: { tag: "saz-stack" },
  details: { tag: "saz-details" },
  controls: { tag: "saz-controls" },
  section: { tag: "saz-section" },
  div: { tag: "div" },
  span: { tag: "span" },
  option: { tag: "option" },
  tab: { tag: "tab" },
  panel: { tag: "panel" },
  modal: { tag: "saz-modal" },
  select: { tag: "saz-select" },
  tabs: { tag: "saz-tabs" },
  slider: { tag: "saz-slider" },
  radio: { tag: "saz-radio" },
  switch: { tag: "saz-switch" },
  toast: { tag: "saz-toast" },
  avatar: { tag: "saz-avatar" },
  chip: { tag: "saz-chip" },
  spinner: { tag: "saz-spinner" },
  progress: { tag: "saz-progress" },
  accordion: { tag: "saz-accordion" }
};
function getTag(name) {
  const entry = SAZAMI_REGISTRY[name];
  if (!entry) {
    unknownComponentError(name);
    return `saz-${name}`;
  }
  return entry.tag;
}
const ICON_COMPONENTS = /* @__PURE__ */ new Set(["saz-icon", "saz-icon-button"]);
const CONTENT_SLOT_COMPONENTS = /* @__PURE__ */ new Set([
  "saz-heading",
  "saz-badge",
  "saz-tag",
  "saz-text",
  "saz-label"
]);
function serializeValue(value) {
  if (typeof value === "string") return value;
  return value.parts.map((p2) => p2.value).join("");
}
function transformAST(node) {
  if (node.type === "inline") {
    const tag = getTag(node.name);
    const props = parseModifiers(node.modifiers);
    const value = typeof node.value === "string" ? node.value : serializeValue(node.value);
    if (ICON_COMPONENTS.has(tag) && node.value && !props.icon) {
      props.icon = typeof node.value === "string" ? node.value : serializeValue(node.value);
    }
    if (CONTENT_SLOT_COMPONENTS.has(tag) && node.value && !props.content) {
      props.content = typeof node.value === "string" ? node.value : serializeValue(node.value);
    }
    return {
      type: tag,
      props,
      children: CONTENT_SLOT_COMPONENTS.has(tag) ? [] : value ? [value] : []
    };
  }
  if (node.type === "element") {
    const children = [];
    for (const child of node.children) {
      const result = transformAST(child);
      if (Array.isArray(result)) {
        children.push(...result);
      } else {
        children.push(result);
      }
    }
    return {
      type: getTag(node.name),
      props: parseModifiers(node.modifiers),
      children
    };
  }
  if (node.type === "list") {
    const items = [];
    for (const item of node.items) {
      const result = transformAST(item);
      if (Array.isArray(result)) {
        items.push(...result);
      } else {
        items.push(result);
      }
    }
    return items;
  }
  throw new Error(`Unknown node type: ${node.type}`);
}
function render(vnode, parent) {
  if (typeof vnode === "string") {
    parent.appendChild(document.createTextNode(vnode));
    return;
  }
  const element = document.createElement(vnode.type);
  Object.entries(vnode.props).forEach(([key, value]) => {
    if (typeof value === "boolean" && value) {
      element.setAttribute(key, "");
    } else if (value !== void 0 && value !== null && value !== false) {
      element.setAttribute(key, String(value));
    }
  });
  vnode.children.forEach((child) => {
    if (Array.isArray(child)) {
      child.forEach((item) => render(item, element));
    } else {
      render(child, element);
    }
  });
  parent.appendChild(element);
}
function applyCurvomorphism(element, centerX, centerY, radiusValue = "12px", groupLeft = centerX, groupRight = centerX, groupTop = centerY, groupBottom = centerY) {
  const rect = element.getBoundingClientRect();
  const elCenterX = rect.left + rect.width / 2;
  const elCenterY = rect.top + rect.height / 2;
  const r = radiusValue;
  const s = "0px";
  const tx = Math.max(1, Math.abs(groupRight - groupLeft) / 2 * 0.02);
  const ty = Math.max(1, Math.abs(groupBottom - groupTop) / 2 * 0.02);
  const leftIn = elCenterX > centerX + tx;
  const rightIn = elCenterX < centerX - tx;
  const topIn = elCenterY > centerY + ty;
  const bottomIn = elCenterY < centerY - ty;
  const xBoth = !leftIn && !rightIn;
  const yBoth = !topIn && !bottomIn;
  element.style.borderTopLeftRadius = (topIn || yBoth) && (leftIn || xBoth) ? r : s;
  element.style.borderTopRightRadius = (topIn || yBoth) && (rightIn || xBoth) ? r : s;
  element.style.borderBottomLeftRadius = (bottomIn || yBoth) && (leftIn || xBoth) ? r : s;
  element.style.borderBottomRightRadius = (bottomIn || yBoth) && (rightIn || xBoth) ? r : s;
}
function findCenter(el) {
  let node = el.parentElement;
  while (node) {
    if (node.dataset.centerX && node.dataset.centerY) {
      return {
        x: parseFloat(node.dataset.centerX),
        y: parseFloat(node.dataset.centerY)
      };
    }
    node = node.parentElement;
  }
  let ancestor = el.parentElement;
  while (ancestor) {
    const rect = ancestor.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      };
    }
    ancestor = ancestor.parentElement;
  }
  return {
    x: typeof window !== "undefined" ? window.innerWidth / 2 : 0,
    y: typeof window !== "undefined" ? window.innerHeight / 2 : 0
  };
}
function enableCurvomorphism(element, options = {}) {
  const radiusType = options.radius || "medium";
  let radiusValue = "12px";
  if (typeof window !== "undefined" && window.getComputedStyle) {
    const v2 = window.getComputedStyle(document.documentElement).getPropertyValue(`--saz-radius-${radiusType}`);
    if (v2 && v2.trim()) radiusValue = v2.trim();
  }
  const apply = () => {
    const cachedCenter = options.centerX === void 0 || options.centerY === void 0 ? findCenter(element) : { x: 0, y: 0 };
    const cx = options.centerX ?? cachedCenter.x;
    const cy = options.centerY ?? cachedCenter.y;
    applyCurvomorphism(
      element,
      cx,
      cy,
      radiusValue,
      options.groupLeft,
      options.groupRight,
      options.groupTop,
      options.groupBottom
    );
  };
  if (typeof window !== "undefined") {
    apply();
    window.addEventListener("resize", apply);
  }
  return () => {
    if (typeof window !== "undefined") {
      window.removeEventListener("resize", apply);
    }
  };
}
let logger = null;
function getLogger(scope) {
  if (!logger) {
    try {
      const satori = require("@nisoku/satori");
      const s = satori.createSatori({ logLevel: "error", enableConsole: true });
      logger = s.createLogger(scope);
    } catch {
      logger = {
        info: (msg, opts) => console.log(`[${scope}] ${msg}`, opts),
        warn: (msg, opts) => console.warn(`[${scope}] ${msg}`, opts),
        error: (msg, opts) => console.error(`[${scope}] ${msg}`, opts)
      };
    }
  }
  return logger;
}
function tokenizerError(message, options) {
  const log = getLogger("sakko");
  log.error(message, {
    state: {
      position: options.position,
      line: options.line,
      column: options.column
    },
    suggest: options.suggestion,
    tags: ["tokenizer", "error"]
  });
}
function parserError(message, options) {
  const log = getLogger("sakko");
  log.error(message, {
    state: { line: options.line, column: options.column },
    suggest: options.suggestion,
    cause: options.cause,
    tags: ["parser", "error"]
  });
}
function handleEscapeSequence(esc) {
  switch (esc) {
    case "n":
      return "\n";
    case "t":
      return "	";
    case "r":
      return "\r";
    case '"':
      return '"';
    case "'":
      return "'";
    case "`":
      return "`";
    case "\\":
      return "\\";
    case "$":
      return "$";
    default:
      return "\\" + esc;
  }
}
function tokenize(input) {
  const tokens = [];
  let i = 0;
  let line = 1;
  let col = 1;
  while (i < input.length) {
    const ch = input[i];
    if (ch === "\n") {
      i++;
      line++;
      col = 1;
      continue;
    }
    if (ch === "\r") {
      i++;
      if (input[i] === "\n") i++;
      line++;
      col = 1;
      continue;
    }
    if (ch === " " || ch === "	") {
      i++;
      col++;
      continue;
    }
    if (ch === "/" && i + 1 < input.length && input[i + 1] === "/") {
      const commentContent = input.slice(i + 2);
      const nextNewline = commentContent.indexOf("\n");
      const nextLT = commentContent.indexOf("<");
      const hasNewlineBeforeLT = nextNewline !== -1 && (nextLT === -1 || nextNewline < nextLT);
      if (hasNewlineBeforeLT || nextLT === -1) {
        while (i < input.length && input[i] !== "\n" && input[i] !== "\r") {
          i++;
        }
        continue;
      }
    }
    const SYMBOLS = {
      "<": "LT",
      ">": "GT",
      "{": "LBRACE",
      "}": "RBRACE",
      "(": "LPAREN",
      ")": "RPAREN",
      "[": "LBRACKET",
      "]": "RBRACKET",
      ":": "COLON",
      ";": "SEMI",
      ",": "COMMA",
      "@": "AT",
      "=": "EQUALS",
      ".": "DOT",
      "+": "PLUS",
      "-": "MINUS",
      "*": "STAR"
    };
    if (SYMBOLS[ch]) {
      tokens.push({ type: SYMBOLS[ch], value: ch, line, col });
      i++;
      col++;
      continue;
    }
    if (ch === '"') {
      const startCol = col;
      i++;
      col++;
      let scanEnd = i;
      while (scanEnd < input.length && input[scanEnd] !== '"') {
        if (input[scanEnd] === "\\" && scanEnd + 1 < input.length) {
          scanEnd += 2;
        } else {
          scanEnd++;
        }
      }
      const literalContent = input.slice(i, scanEnd);
      const hasInterpolation = /\{[\s\S]*?\}/.test(literalContent);
      if (hasInterpolation) {
        const result = tokenizeStringWithInterpolation(
          input,
          i,
          line,
          col,
          startCol
        );
        tokens.push(...result.tokens);
        i = result.endIndex + 1;
        line = result.endLine;
        col = result.endCol + 1;
        continue;
      }
      let str = "";
      while (i < input.length && input[i] !== '"') {
        if (input[i] === "\\" && i + 1 < input.length) {
          i++;
          col++;
          str += handleEscapeSequence(input[i]);
          i++;
          col++;
          continue;
        }
        if (input[i] === "\n") {
          line++;
          col = 1;
        } else {
          col++;
        }
        str += input[i];
        i++;
      }
      if (i >= input.length) {
        tokenizerError("Unterminated string", {
          position: i,
          line,
          column: startCol,
          suggestion: 'Add a closing quote "'
        });
        throw new Error(`Unterminated string at line ${line}, col ${startCol}`);
      }
      i++;
      col++;
      tokens.push({ type: "STRING", value: str, line, col: startCol });
      continue;
    }
    if (/[a-zA-Z0-9_\-]/.test(ch)) {
      const startCol = col;
      let ident = "";
      while (i < input.length && /[a-zA-Z0-9_\-]/.test(input[i])) {
        ident += input[i];
        i++;
        col++;
      }
      tokens.push({ type: "IDENT", value: ident, line, col: startCol });
      continue;
    }
    tokenizerError(`Unexpected character: ${ch}`, {
      position: i,
      line,
      column: col,
      suggestion: `Remove or escape this character`
    });
    throw new Error(`Unexpected character: ${ch} at line ${line}, col ${col}`);
  }
  return tokens;
}
function tokenizeStringWithInterpolation(input, startIndex, line, col, originalStartCol) {
  const tokens = [];
  let i = startIndex;
  let currentLine = line;
  let currentCol = col;
  let textBuffer = "";
  let textStartCol = currentCol;
  while (i < input.length && input[i] !== '"') {
    if (input[i] === "{") {
      if (textBuffer) {
        tokens.push({
          type: "STRING",
          value: textBuffer,
          line: currentLine,
          col: textStartCol
        });
        textBuffer = "";
      }
      tokens.push({
        type: "INTERP_START",
        value: "{",
        line: currentLine,
        col: currentCol
      });
      i++;
      currentCol++;
      let expr = "";
      let braceDepth = 1;
      const exprStartCol = currentCol;
      while (i < input.length && braceDepth > 0) {
        if (input[i] === "{") braceDepth++;
        if (input[i] === "}") braceDepth--;
        if (braceDepth > 0) {
          expr += input[i];
        }
        if (input[i] === "\n") {
          currentLine++;
          currentCol = 1;
        } else {
          currentCol++;
        }
        i++;
      }
      if (braceDepth > 0) {
        tokenizerError("Unterminated interpolation expression", {
          position: i,
          line: currentLine,
          column: exprStartCol,
          suggestion: "Add a closing brace '}'"
        });
        throw new Error(`Unterminated interpolation expression at line ${currentLine}, col ${exprStartCol}`);
      }
      tokens.push({
        type: "EXPR",
        value: expr.trim(),
        line: currentLine,
        col: exprStartCol
      });
      tokens.push({
        type: "INTERP_END",
        value: "}",
        line: currentLine,
        col: currentCol - 1
      });
      textStartCol = currentCol;
      continue;
    }
    if (input[i] === "\\" && i + 1 < input.length) {
      i++;
      currentCol++;
      textBuffer += handleEscapeSequence(input[i]);
      currentCol++;
      i++;
      continue;
    }
    textBuffer += input[i];
    if (input[i] === "\n") {
      currentLine++;
      currentCol = 1;
    } else {
      currentCol++;
    }
    i++;
  }
  if (i >= input.length) {
    tokenizerError("Unterminated string", {
      position: i,
      line: currentLine,
      column: originalStartCol,
      suggestion: 'Add a closing quote "'
    });
    throw new Error(`Unterminated string at line ${currentLine}, col ${originalStartCol}`);
  }
  if (textBuffer.length > 0 || tokens.length === 0) {
    tokens.push({
      type: "STRING",
      value: textBuffer,
      line: currentLine,
      col: textStartCol
    });
  }
  return {
    tokens,
    endIndex: i,
    endLine: currentLine,
    endCol: currentCol
  };
}
function parseStateDeclaration(parser, atToken) {
  const hasBraces = parser.check("LBRACE");
  if (hasBraces) parser.consume();
  const declarations = [];
  while (true) {
    if (!parser.peek()) break;
    if (hasBraces && parser.check("RBRACE")) {
      parser.consume();
      break;
    }
    if (parser.check("IDENT") && parser.peek()?.value === "const") {
      parser.consume();
      const nextToken = parser.peek();
      if (!nextToken || nextToken.type !== "IDENT") {
        throw parser.errorAt("Expected identifier after 'const'", nextToken);
      }
    }
    const varToken = parser.peek();
    const isVarDecl = varToken?.type === "IDENT" && parser.peekAheadIs("EQUALS");
    if (!isVarDecl) {
      if (declarations.length === 0) {
        throw parser.errorAt("Expected variable declaration", varToken);
      }
      break;
    }
    parser.consume();
    const varName = varToken.value;
    parser.expect("EQUALS");
    const valueExpr = parser.parseExpression();
    declarations.push({ name: varName, value: valueExpr });
    if (parser.check("SEMI") || parser.check("COMMA")) {
      parser.consume();
    }
  }
  return {
    type: "state",
    declarations,
    line: atToken.line,
    col: atToken.col
  };
}
function parseEffectDeclaration(parser, atToken) {
  const hasBraces = parser.check("LBRACE");
  if (!hasBraces) {
    throw parser.errorAt("@effect requires a braced block", atToken);
  }
  parser.consume();
  const body = parser.parseBlockBody();
  parser.expect("RBRACE");
  return {
    type: "effect",
    body,
    line: atToken.line,
    col: atToken.col
  };
}
function parseDerivedDeclaration(parser, atToken) {
  const hasBraces = parser.check("LBRACE");
  if (hasBraces) parser.consume();
  const declarations = [];
  while (true) {
    if (!parser.peek()) break;
    if (hasBraces && parser.check("RBRACE")) {
      parser.consume();
      break;
    }
    if (parser.check("IDENT") && parser.peek()?.value === "const") {
      parser.consume();
    }
    const varToken = parser.peek();
    if (!varToken || varToken.type !== "IDENT") {
      break;
    }
    parser.consume();
    const varName = varToken.value;
    if (parser.check("EQUALS")) {
      parser.consume();
      const expr = parser.parseExpression();
      declarations.push({ name: varName, expr });
      if (parser.check("SEMI") || parser.check("COMMA")) {
        parser.consume();
      }
    } else {
      break;
    }
  }
  return {
    type: "derived",
    declarations,
    line: atToken.line,
    col: atToken.col
  };
}
function parseAtcodeDeclaration(parser, atToken) {
  const nameToken = parser.peek();
  if (!nameToken || nameToken.type !== "IDENT") {
    throw parser.errorAt("Expected identifier after @", atToken);
  }
  const name = parser.consume().value;
  if (name === "state") {
    return parseStateDeclaration(parser, atToken);
  }
  if (name === "effect") {
    return parseEffectDeclaration(parser, atToken);
  }
  if (name === "derived") {
    return parseDerivedDeclaration(parser, atToken);
  }
  throw new Error(
    `Unknown atcode '@${name}' at line ${atToken.line}, col ${atToken.col}`
  );
}
function parseEventHandler(parser, eventName, eventToken) {
  if (parser.check("LBRACE")) {
    parser.consume();
    const handler = parser.parseBlockBody();
    parser.expect("RBRACE");
    return handler;
  }
  throw parser.errorAt(
    `Event handlers must use block syntax: @on:${eventName} { ... }`,
    eventToken || parser.peek()
  );
}
const EVENT_NAMES = /* @__PURE__ */ new Set([
  "click",
  "mouseenter",
  "mouseleave",
  "keydown",
  "keyup",
  "input",
  "change",
  "submit",
  "focus",
  "blur",
  "dblclick",
  "mousedown",
  "mouseup",
  "drag",
  "drop",
  "touchstart",
  "touchend"
]);
function parseInlineModifier(parser) {
  const nameToken = parser.expect("IDENT");
  const name = nameToken.value;
  if (name === "on") {
    parser.expect("COLON");
    const eventToken = parser.expect("IDENT");
    const event = eventToken.value;
    const handler = parseEventHandler(parser, event, eventToken);
    return {
      type: "event",
      event,
      handler
    };
  }
  if (EVENT_NAMES.has(name)) {
    const event = name;
    let handler = "";
    if (parser.check("IDENT")) {
      handler = parser.consume().value;
    } else {
      handler = parseEventHandler(parser, event, nameToken);
    }
    return {
      type: "event",
      event,
      handler
    };
  }
  if (name === "class") {
    parser.expect("COLON");
    const classToken = parser.expect("IDENT");
    return {
      type: "atcode",
      name: "class",
      body: classToken.value
    };
  }
  if (name === "bind") {
    parser.expect("EQUALS");
    const signal = parser.check("STRING") ? parser.consume().value : parser.expect("IDENT").value;
    return {
      type: "atcode",
      name: "bind",
      body: signal
    };
  }
  throw parser.errorAt(`Unknown modifier: @${name}`, nameToken);
}
const KNOWN_KEYS = /* @__PURE__ */ new Set([
  "cols",
  "gap",
  "radius",
  "md:cols",
  "lg:cols",
  "placeholder",
  "type",
  "size",
  "variant",
  "layout",
  "src",
  "alt",
  "icon",
  "label",
  "value",
  "center-point",
  "min",
  "max",
  "step",
  "name",
  "heading",
  "slot",
  "active",
  "open",
  "message",
  "title"
]);
class Parser {
  constructor(tokens, source) {
    this.tokens = tokens;
    this.position = 0;
    this.source = source || "";
  }
  errorAt(msg, token) {
    parserError(msg, {
      line: token?.line,
      column: token?.col,
      suggestion: this._getSuggestion(msg)
    });
    if (!token || !this.source) return new Error(msg);
    const lines = this.source.split("\n");
    const lineText = lines[token.line - 1] || "";
    const pointer = " ".repeat(Math.max(0, token.col - 1)) + "^";
    return new Error(
      `${msg} at line ${token.line}, col ${token.col}
  ${lineText}
  ${pointer}`
    );
  }
  _getSuggestion(msg) {
    if (msg.includes("Unexpected end of input"))
      return "Check for missing closing brackets";
    if (msg.includes("Expected")) return "Add the expected token";
    if (msg.includes("Unexpected token")) return "Remove or replace this token";
    return void 0;
  }
  peek() {
    return this.tokens[this.position];
  }
  peekAhead(offset) {
    return this.tokens[this.position + offset];
  }
  peekAheadIs(type) {
    return this.peekAhead(1)?.type === type;
  }
  consume() {
    const token = this.tokens[this.position];
    if (!token) {
      const last = this.tokens[this.tokens.length - 1];
      throw this.errorAt("Unexpected end of input", last);
    }
    this.position++;
    return token;
  }
  check(type) {
    return this.peek()?.type === type;
  }
  expect(type, errorMsg) {
    const token = this.peek();
    if (!token || token.type !== type) {
      const msg = errorMsg || `Expected ${type} but got ${token?.type || "end of input"}`;
      throw this.errorAt(msg, token);
    }
    return this.consume();
  }
  parseRoot() {
    this.expect("LT", "Expected '<'");
    const nameToken = this.peek();
    if (!nameToken || nameToken.type !== "IDENT") {
      throw this.errorAt("Expected identifier after '<'", nameToken);
    }
    const name = this.consume().value;
    const modifiers = this.check("LPAREN") ? this.parseModifiers() : [];
    this.expect("LBRACE", "Expected '{'");
    const declarations = [];
    const children = [];
    while (!this.check("RBRACE")) {
      if (!this.peek()) {
        throw this.errorAt(
          "Unexpected end of input, expected '}'",
          this.tokens[this.tokens.length - 1]
        );
      }
      if (this.check("AT")) {
        const atToken = this.consume();
        declarations.push(parseAtcodeDeclaration(this, atToken));
      } else {
        children.push(this.parseNode());
      }
      if (this.check("SEMI") || this.check("COMMA")) {
        this.consume();
      }
    }
    this.expect("RBRACE", "Expected '}'");
    this.expect("GT", "Expected '>'");
    return { type: "root", name, modifiers, declarations, children };
  }
  _shouldInsertSpace(current, next) {
    if (!current) return false;
    const lastChar = current.slice(-1);
    const nextChar = next.value[0];
    const isWordEnd = /[a-zA-Z0-9_$]/.test(lastChar);
    const isWordStart = /[a-zA-Z0-9_$]/.test(nextChar);
    return isWordEnd && isWordStart;
  }
  parseBlockBody() {
    let body = "";
    let braceDepth = 0;
    while (this.peek()) {
      const token = this.peek();
      if (token.type === "RBRACE" && braceDepth === 0) break;
      if (token.type === "LBRACE") braceDepth++;
      if (token.type === "RBRACE") braceDepth--;
      if (this._shouldInsertSpace(body, token)) {
        body += " ";
      }
      if (token.type === "STRING") {
        body += JSON.stringify(token.value);
      } else {
        body += token.value;
      }
      this.consume();
    }
    return body.trim();
  }
  parseExpression() {
    let expr = "";
    let parenDepth = 0;
    let braceDepth = 0;
    let bracketDepth = 0;
    while (this.peek()) {
      const token = this.peek();
      if (parenDepth === 0 && braceDepth === 0 && bracketDepth === 0) {
        if (token?.type === "SEMI" || token?.type === "RBRACE" || token?.type === "COMMA") {
          break;
        }
        if (token?.type === "IDENT" && this.peekAheadIs("EQUALS")) {
          break;
        }
      }
      if (token?.type === "LPAREN") parenDepth++;
      if (token?.type === "RPAREN") parenDepth--;
      if (token?.type === "LBRACE") braceDepth++;
      if (token?.type === "RBRACE") braceDepth--;
      if (token?.type === "LBRACKET") bracketDepth++;
      if (token?.type === "RBRACKET") bracketDepth--;
      if (token) {
        if (this._shouldInsertSpace(expr, token)) {
          expr += " ";
        }
        if (token.type === "STRING") {
          expr += JSON.stringify(token.value);
        } else {
          expr += token.value;
        }
        this.consume();
      }
    }
    return expr.trim();
  }
  parseNode() {
    const token = this.peek();
    if (!token || token.type !== "IDENT") {
      throw this.errorAt(
        `Expected identifier but got ${token?.type || "end of input"}`,
        token
      );
    }
    const name = this.consume().value;
    const modifiers = [];
    while (this.check("LPAREN") || this.check("AT")) {
      if (this.check("LPAREN")) {
        modifiers.push(...this.parseModifiers());
      }
      if (this.check("AT")) {
        this.consume();
        modifiers.push(parseInlineModifier(this));
      }
    }
    if (this.check("COLON")) {
      this.consume();
      if (this.check("LBRACKET")) {
        const list = this.parseList();
        return { type: "element", name, modifiers, children: [list] };
      }
      const valToken = this.peek();
      if (!valToken) {
        throw this.errorAt(
          `Expected value after ':' but got end of input`,
          this.tokens[this.tokens.length - 1]
        );
      }
      if (valToken.type === "STRING" || valToken.type === "INTERP_START") {
        const value = this.parseInterpolatedValue();
        return { type: "inline", name, modifiers, value };
      }
      if (valToken.type === "IDENT") {
        const value = this.consume().value;
        return { type: "inline", name, modifiers, value };
      }
      throw this.errorAt(
        `Expected value after ':' but got ${valToken.type || "end of input"}`,
        valToken
      );
    }
    if (this.check("LBRACKET")) {
      const list = this.parseList();
      return { type: "element", name, modifiers, children: [list] };
    }
    if (this.check("LBRACE")) {
      this.consume();
      const children = [];
      while (!this.check("RBRACE")) {
        if (!this.peek()) {
          throw this.errorAt(
            "Unexpected end of input, expected '}'",
            this.tokens[this.tokens.length - 1]
          );
        }
        children.push(this.parseNode());
        if (this.check("SEMI")) this.consume();
        if (this.check("COMMA")) this.consume();
      }
      this.consume();
      return { type: "element", name, modifiers, children };
    }
    return { type: "inline", name, modifiers, value: "" };
  }
  parseModifiers() {
    this.consume();
    const modifiers = [];
    while (!this.check("RPAREN")) {
      if (!this.peek()) {
        throw this.errorAt(
          "Unexpected end of input, expected ')'",
          this.tokens[this.tokens.length - 1]
        );
      }
      if (this.check("AT")) {
        this.consume();
        const nameToken = this.expect("IDENT");
        if (nameToken.value === "on") {
          this.expect("COLON");
          const eventToken = this.expect("IDENT");
          const event = eventToken.value;
          let handler;
          if (this.check("LBRACE")) {
            this.consume();
            handler = this.parseBlockBody();
            this.expect("RBRACE");
          } else {
            throw this.errorAt(
              "Event handlers must use block syntax: @on:click { ... }",
              this.peek()
            );
          }
          modifiers.push({
            type: "event",
            event,
            handler
          });
          continue;
        }
        if (nameToken.value === "bind") {
          this.expect("EQUALS");
          const signal = this.check("STRING") ? this.consume().value : this.expect("IDENT").value;
          modifiers.push({
            type: "atcode",
            name: "bind",
            body: signal
          });
          continue;
        }
        throw this.errorAt(
          `Atcode @${nameToken.value} not yet supported in modifiers`,
          nameToken
        );
      }
      const token = this.peek();
      if (!token || token.type !== "IDENT") {
        throw this.errorAt(
          `Expected identifier in modifiers but got ${token?.type || "end of input"}`,
          token
        );
      }
      this.consume();
      const next = this.peek();
      if (KNOWN_KEYS.has(token.value) && next && (next.type === "IDENT" || next.type === "STRING") && !this.check("RPAREN")) {
        modifiers.push({
          type: "pair",
          key: token.value,
          value: this.consume().value
        });
      } else {
        modifiers.push({ type: "flag", value: token.value });
      }
    }
    this.consume();
    return modifiers;
  }
  parseList() {
    this.consume();
    const items = [];
    while (!this.check("RBRACKET")) {
      if (!this.peek()) {
        throw this.errorAt(
          "Unexpected end of input, expected ']'",
          this.tokens[this.tokens.length - 1]
        );
      }
      items.push(this.parseNode());
      if (this.check("COMMA")) {
        this.consume();
      } else if (!this.check("RBRACKET")) {
        throw this.errorAt('Expected "," or "]"', this.peek());
      }
    }
    this.consume();
    return { type: "list", items };
  }
  parseInterpolatedValue() {
    const parts = [];
    while (this.check("STRING") || this.check("INTERP_START")) {
      if (this.check("STRING")) {
        const text = this.consume().value;
        if (text) {
          parts.push({ type: "text", value: text });
        }
      }
      if (this.check("INTERP_START")) {
        this.consume();
        const expr = this.expect("EXPR").value;
        parts.push({ type: "expr", value: expr });
        this.expect("INTERP_END");
      }
    }
    if (parts.length === 0) {
      return "";
    }
    if (parts.length === 1 && parts[0].type === "text") {
      return parts[0].value;
    }
    return { type: "interpolated", parts };
  }
}
function parseSakko(input) {
  const trimmed = input.trim();
  if (trimmed && !trimmed.startsWith("<")) {
    input = `<__sakko_wrapper__ {
${trimmed}
}>`;
  }
  const tokens = tokenize(input);
  if (tokens.length === 0) {
    parserError("Empty input", { suggestion: "Add some content to parse" });
    throw new Error("Empty input");
  }
  const parser = new Parser(tokens, input);
  return parser.parseRoot();
}
let themeInjected = false;
function injectThemeCSS(customTokens) {
  if (typeof document === "undefined") return;
  const existing = document.querySelector("style[data-sazami-theme]");
  const themeCSS = generateThemeCSS(customTokens);
  if (existing) {
    existing.textContent = themeCSS;
  } else {
    const style = document.createElement("style");
    style.setAttribute("data-sazami-theme", "");
    style.textContent = themeCSS;
    document.head.appendChild(style);
  }
  themeInjected = true;
}
function compileSakko(source, target, options) {
  if (typeof customElements !== "undefined") {
    registerComponents();
  }
  if (!themeInjected) {
    injectThemeCSS(options?.tokens);
  }
  const trimmed = source.trim();
  const wrapped = trimmed.startsWith("<") && trimmed.endsWith(">") ? trimmed : `<${trimmed}>`;
  const ast = parseSakko(wrapped);
  const rootVNode = {
    type: getTag(ast.name),
    props: ast.modifiers ? parseModifiers(ast.modifiers) : {},
    children: []
  };
  for (const child of ast.children) {
    const result = transformAST(child);
    if (Array.isArray(result)) {
      rootVNode.children.push(...result);
    } else {
      rootVNode.children.push(result);
    }
  }
  render(rootVNode, target);
  if (typeof window !== "undefined") {
    const prev = target.__sazamiRO;
    if (prev) prev.disconnect();
    const prevDisposers = target.__sazamiCurvoDisposers;
    if (prevDisposers) {
      prevDisposers.forEach((d) => {
        d();
      });
    }
    const disposers = [];
    const ro = new ResizeObserver(() => {
      const elements = Array.from(target.querySelectorAll("[curved]")).filter(
        (el) => el instanceof HTMLElement
      );
      if (elements.length === 0) return;
      requestAnimationFrame(() => {
        const rects = elements.map((el) => el.getBoundingClientRect());
        const left = Math.min(...rects.map((r) => r.left));
        const right = Math.max(...rects.map((r) => r.right));
        const top = Math.min(...rects.map((r) => r.top));
        const bottom = Math.max(...rects.map((r) => r.bottom));
        const centerX = (left + right) / 2;
        const centerY = (top + bottom) / 2;
        disposers.forEach((d) => {
          d();
        });
        disposers.length = 0;
        elements.forEach((el) => {
          const dispose = enableCurvomorphism(el, {
            radius: el.getAttribute("radius") || void 0,
            centerX,
            centerY,
            groupLeft: left,
            groupRight: right,
            groupTop: top,
            groupBottom: bottom
          });
          disposers.push(dispose);
        });
      });
    });
    target.__sazamiRO = ro;
    target.__sazamiCurvoDisposers = disposers;
    ro.observe(target);
  }
}
export {
  COMPONENT_REGISTRY,
  ICON_SVGS,
  MODIFIER_MAP,
  applyCurvomorphism,
  compileSakko,
  defaultTokens,
  enableCurvomorphism,
  escapeCss,
  escapeHtml,
  escapeUrl,
  generateCSSVariables,
  generateThemeCSS,
  getTokenValue,
  injectThemeCSS,
  parseModifiers,
  registerComponents,
  render,
  transformAST,
  unescapeHtml
};
//# sourceMappingURL=index.mjs.map
