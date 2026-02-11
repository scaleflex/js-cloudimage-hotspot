const STYLE_ID = 'ci-hotspot-styles';

/** Check if code is running in browser environment */
export function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

/** Resolve element from selector string or HTMLElement */
export function getElement(el: HTMLElement | string): HTMLElement {
  if (typeof el === 'string') {
    const found = document.querySelector<HTMLElement>(el);
    if (!found) throw new Error(`CIHotspot: element "${el}" not found`);
    return found;
  }
  return el;
}

/** Create an HTML element with optional class and attributes */
export function createElement<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  attrs?: Record<string, string>,
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (attrs) {
    for (const [key, value] of Object.entries(attrs)) {
      el.setAttribute(key, value);
    }
  }
  return el;
}

/** Add CSS class to element */
export function addClass(el: HTMLElement, ...classNames: string[]): void {
  el.classList.add(...classNames);
}

/** Remove CSS class from element */
export function removeClass(el: HTMLElement, ...classNames: string[]): void {
  el.classList.remove(...classNames);
}

/** Idempotent CSS style injection — only injects once per page */
export function injectStyles(css: string): void {
  if (!isBrowser()) return;
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = css;
  document.head.appendChild(style);
}
