import { createElement, addClass, removeClass } from '../utils/dom';
import { addListener } from '../utils/events';

export interface FullscreenControlOptions {
  onChange?: (isFullscreen: boolean) => void;
}

export interface FullscreenControl {
  element: HTMLElement;
  isFullscreen: () => boolean;
  toggle: () => void;
  enter: () => void;
  exit: () => void;
  destroy: () => void;
}

// Lucide Maximize2 SVG
const MAXIMIZE_SVG =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" x2="14" y1="3" y2="10"/><line x1="3" x2="10" y1="21" y2="14"/></svg>';

// Lucide Minimize2 SVG
const MINIMIZE_SVG =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="14" x2="21" y1="10" y2="3"/><line x1="3" x2="10" y1="21" y2="14"/></svg>';

function isFullscreenEnabled(): boolean {
  return !!(
    document.fullscreenEnabled ||
    (document as any).webkitFullscreenEnabled
  );
}

function getFullscreenElement(): Element | null {
  return (
    document.fullscreenElement ||
    (document as any).webkitFullscreenElement ||
    null
  );
}

function requestFullscreen(el: HTMLElement): Promise<void> {
  if (el.requestFullscreen) return el.requestFullscreen();
  if ((el as any).webkitRequestFullscreen) {
    (el as any).webkitRequestFullscreen();
    return Promise.resolve();
  }
  return Promise.reject(new Error('Fullscreen API not supported'));
}

function exitFullscreen(): Promise<void> {
  if (document.exitFullscreen) return document.exitFullscreen();
  if ((document as any).webkitExitFullscreen) {
    (document as any).webkitExitFullscreen();
    return Promise.resolve();
  }
  return Promise.reject(new Error('Fullscreen API not supported'));
}

/** Create a fullscreen toggle button for the container */
export function createFullscreenControl(
  container: HTMLElement,
  options: FullscreenControlOptions = {},
): FullscreenControl | null {
  if (!isFullscreenEnabled()) return null;

  const btn = createElement('button', 'ci-hotspot-fullscreen-btn', {
    'aria-label': 'Enter fullscreen',
    'aria-pressed': 'false',
    'type': 'button',
  });
  btn.innerHTML = MAXIMIZE_SVG;

  const cleanups: (() => void)[] = [];

  function isActive(): boolean {
    return getFullscreenElement() === container;
  }

  function syncState(): void {
    const fs = isActive();
    btn.innerHTML = fs ? MINIMIZE_SVG : MAXIMIZE_SVG;
    btn.setAttribute('aria-label', fs ? 'Exit fullscreen' : 'Enter fullscreen');
    btn.setAttribute('aria-pressed', String(fs));
    if (fs) {
      addClass(container, 'ci-hotspot-container--fullscreen');
    } else {
      removeClass(container, 'ci-hotspot-container--fullscreen');
    }
    options.onChange?.(fs);
  }

  function toggle(): void {
    if (isActive()) {
      exitFullscreen().catch(() => {});
    } else {
      requestFullscreen(container).catch(() => {});
    }
  }

  function enter(): void {
    if (!isActive()) {
      requestFullscreen(container).catch(() => {});
    }
  }

  function exit(): void {
    if (isActive()) {
      exitFullscreen().catch(() => {});
    }
  }

  // Listen to fullscreenchange (handles both standard and webkit)
  const changeCleanup = addListener(document, 'fullscreenchange', syncState);
  cleanups.push(changeCleanup);

  document.addEventListener('webkitfullscreenchange', syncState);
  cleanups.push(() => document.removeEventListener('webkitfullscreenchange', syncState));

  // Button click
  const clickCleanup = addListener(btn, 'click', (e) => {
    e.stopPropagation();
    toggle();
  });
  cleanups.push(clickCleanup);

  container.appendChild(btn);

  function destroy(): void {
    // Exit fullscreen if active before cleanup
    if (isActive()) {
      exitFullscreen().catch(() => {});
    }
    removeClass(container, 'ci-hotspot-container--fullscreen');
    cleanups.forEach((fn) => fn());
    cleanups.length = 0;
    btn.remove();
  }

  return {
    element: btn,
    isFullscreen: isActive,
    toggle,
    enter,
    exit,
    destroy,
  };
}
