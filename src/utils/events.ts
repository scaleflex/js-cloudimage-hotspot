type EventHandler = (...args: unknown[]) => void;

/** Minimal typed event emitter */
export class EventEmitter {
  private listeners = new Map<string, Set<EventHandler>>();

  on(event: string, handler: EventHandler): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);
  }

  off(event: string, handler: EventHandler): void {
    this.listeners.get(event)?.delete(handler);
  }

  once(event: string, handler: EventHandler): void {
    const wrapper: EventHandler = (...args) => {
      this.off(event, wrapper);
      handler(...args);
    };
    this.on(event, wrapper);
  }

  emit(event: string, ...args: unknown[]): void {
    this.listeners.get(event)?.forEach((handler) => handler(...args));
  }

  removeAll(): void {
    this.listeners.clear();
  }
}

/**
 * Add a DOM event listener and return a cleanup function.
 */
export function addListener<K extends keyof HTMLElementEventMap>(
  el: EventTarget,
  event: K,
  handler: (e: HTMLElementEventMap[K]) => void,
  options?: boolean | AddEventListenerOptions,
): () => void {
  el.addEventListener(event, handler as EventListener, options);
  return () => el.removeEventListener(event, handler as EventListener, options);
}

/** Debounce a function */
export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  ms: number,
): T & { cancel(): void } {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const debounced = ((...args: unknown[]) => {
    if (timer !== undefined) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = undefined;
      fn(...args);
    }, ms);
  }) as T & { cancel(): void };
  debounced.cancel = () => {
    if (timer !== undefined) {
      clearTimeout(timer);
      timer = undefined;
    }
  };
  return debounced;
}

/** Throttle a function */
export function throttle<T extends (...args: unknown[]) => void>(
  fn: T,
  ms: number,
): T & { cancel(): void } {
  let lastCall = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const throttled = ((...args: unknown[]) => {
    const now = Date.now();
    const remaining = ms - (now - lastCall);
    if (remaining <= 0) {
      if (timer !== undefined) {
        clearTimeout(timer);
        timer = undefined;
      }
      lastCall = now;
      fn(...args);
    } else if (timer === undefined) {
      timer = setTimeout(() => {
        lastCall = Date.now();
        timer = undefined;
        fn(...args);
      }, remaining);
    }
  }) as T & { cancel(): void };
  throttled.cancel = () => {
    if (timer !== undefined) {
      clearTimeout(timer);
      timer = undefined;
    }
  };
  return throttled;
}
