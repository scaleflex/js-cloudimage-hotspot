import { isBrowser, createElement } from '../utils/dom';

let liveRegion: HTMLElement | null = null;
let liveRegionRefCount = 0;

/** Announce a message to screen readers via a live region */
export function announceToScreenReader(message: string): void {
  if (!isBrowser()) return;

  if (!liveRegion) {
    liveRegion = createElement('div', undefined, {
      'aria-live': 'polite',
      'aria-atomic': 'true',
      'role': 'status',
    });
    liveRegion.style.cssText =
      'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0';
    document.body.appendChild(liveRegion);
  }

  // Clear then set to trigger announcement
  liveRegion.textContent = '';
  requestAnimationFrame(() => {
    if (liveRegion) liveRegion.textContent = message;
  });
}

/** Register an instance that uses the live region */
export function acquireLiveRegion(): void {
  liveRegionRefCount++;
}

/** Release an instance; removes the live region when the last one is released */
export function releaseLiveRegion(): void {
  liveRegionRefCount = Math.max(0, liveRegionRefCount - 1);
  if (liveRegionRefCount === 0 && liveRegion) {
    liveRegion.remove();
    liveRegion = null;
  }
}
