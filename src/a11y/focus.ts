import { addListener } from '../utils/events';

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Get all focusable elements within a container */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
}

/** Create a focus trap within a popover element */
export function createFocusTrap(
  popover: HTMLElement,
  returnFocusTo: HTMLElement,
): { activate: () => void; deactivate: () => void; destroy: () => void } {
  let active = false;
  let cleanup: (() => void) | null = null;

  function activate(): void {
    if (active) return;
    active = true;

    const focusable = getFocusableElements(popover);
    if (focusable.length === 0) return;

    // Focus first element
    focusable[0].focus();

    cleanup = addListener(popover, 'keydown', (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const currentFocusable = getFocusableElements(popover);
      if (currentFocusable.length === 0) return;

      const first = currentFocusable[0];
      const last = currentFocusable[currentFocusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });
  }

  function deactivate(): void {
    if (!active) return;
    active = false;
    cleanup?.();
    cleanup = null;
    returnFocusTo.focus();
  }

  function destroy(): void {
    deactivate();
  }

  return { activate, deactivate, destroy };
}

/** Move focus to a specific marker */
export function moveFocusToMarker(marker: HTMLElement): void {
  marker.focus();
}
