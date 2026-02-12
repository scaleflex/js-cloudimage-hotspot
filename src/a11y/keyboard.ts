import type { ZoomPan } from '../zoom/zoom-pan';
import { addListener } from '../utils/events';

export interface KeyboardHandlerOptions {
  container: HTMLElement;
  getZoomPan: () => ZoomPan | null;
  onEscape?: () => void;
  onFullscreenToggle?: () => void;
}

const PAN_STEP = 50;
const ZOOM_STEP = 0.5;

/** Handles keyboard navigation within the hotspot container */
export class KeyboardHandler {
  private cleanups: (() => void)[] = [];

  constructor(options: KeyboardHandlerOptions) {
    const { container, getZoomPan, onEscape, onFullscreenToggle } = options;

    const cleanup = addListener(container, 'keydown', (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;

      // Don't handle keys typed into form elements inside popovers
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        return;
      }

      const zoomPan = getZoomPan();

      switch (e.key) {
        case 'Escape':
          onEscape?.();
          break;

        case 'ArrowUp':
          if (zoomPan && zoomPan.getZoom() > 1) {
            e.preventDefault();
            zoomPan.pan(0, PAN_STEP);
          }
          break;
        case 'ArrowDown':
          if (zoomPan && zoomPan.getZoom() > 1) {
            e.preventDefault();
            zoomPan.pan(0, -PAN_STEP);
          }
          break;
        case 'ArrowLeft':
          if (zoomPan && zoomPan.getZoom() > 1) {
            e.preventDefault();
            zoomPan.pan(PAN_STEP, 0);
          }
          break;
        case 'ArrowRight':
          if (zoomPan && zoomPan.getZoom() > 1) {
            e.preventDefault();
            zoomPan.pan(-PAN_STEP, 0);
          }
          break;

        case '+':
        case '=':
          if (zoomPan) {
            e.preventDefault();
            zoomPan.setZoom(zoomPan.getZoom() + ZOOM_STEP);
          }
          break;
        case '-':
          if (zoomPan) {
            e.preventDefault();
            zoomPan.setZoom(zoomPan.getZoom() - ZOOM_STEP);
          }
          break;
        case '0':
          if (zoomPan) {
            e.preventDefault();
            zoomPan.resetZoom();
          }
          break;

        case 'f':
          if (onFullscreenToggle) {
            e.preventDefault();
            onFullscreenToggle();
          }
          break;
      }
    });

    this.cleanups.push(cleanup);
  }

  destroy(): void {
    this.cleanups.forEach((fn) => fn());
    this.cleanups = [];
  }
}
