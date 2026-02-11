import { addClass, removeClass } from '../utils/dom';
import { GestureRecognizer } from './gestures';

export interface ZoomPanOptions {
  zoomMin: number;
  zoomMax: number;
  onZoom?: (level: number) => void;
}

export class ZoomPan {
  private viewport: HTMLElement;
  private container: HTMLElement;
  private options: ZoomPanOptions;
  private zoom = 1;
  private panX = 0;
  private panY = 0;
  private enabled = true;
  private isDragging = false;
  private dragStartX = 0;
  private dragStartY = 0;
  private lastPanX = 0;
  private lastPanY = 0;
  private gestures: GestureRecognizer | null = null;
  private cleanups: (() => void)[] = [];

  constructor(viewport: HTMLElement, container: HTMLElement, options: ZoomPanOptions) {
    this.viewport = viewport;
    this.container = container;
    this.options = options;

    this.bindEvents();
  }

  private bindEvents(): void {
    // Mouse wheel zoom
    const onWheel = (e: WheelEvent) => {
      if (!this.enabled) return;
      e.preventDefault();
      const rect = this.container.getBoundingClientRect();
      const originX = e.clientX - rect.left;
      const originY = e.clientY - rect.top;
      const delta = e.deltaY > 0 ? -0.2 : 0.2;
      this.setZoom(this.zoom + delta, originX, originY);
    };
    this.container.addEventListener('wheel', onWheel, { passive: false });
    this.cleanups.push(() => this.container.removeEventListener('wheel', onWheel));

    // Double-click toggle
    const onDblClick = (e: MouseEvent) => {
      if (!this.enabled) return;
      const rect = this.container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (this.zoom > 1) {
        this.resetZoom();
      } else {
        this.setZoom(2, x, y);
      }
    };
    this.container.addEventListener('dblclick', onDblClick);
    this.cleanups.push(() => this.container.removeEventListener('dblclick', onDblClick));

    // Mouse drag for panning
    const onMouseDown = (e: MouseEvent) => {
      if (!this.enabled || this.zoom <= 1) return;
      // Only pan with left mouse button
      if (e.button !== 0) return;
      this.isDragging = true;
      this.dragStartX = e.clientX;
      this.dragStartY = e.clientY;
      this.lastPanX = this.panX;
      this.lastPanY = this.panY;
      addClass(this.viewport, 'ci-hotspot-viewport--dragging');
      this.container.style.cursor = 'grabbing';
      e.preventDefault();
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!this.isDragging) return;
      const dx = (e.clientX - this.dragStartX) / this.zoom;
      const dy = (e.clientY - this.dragStartY) / this.zoom;
      this.panX = this.lastPanX + dx;
      this.panY = this.lastPanY + dy;
      this.clampPan();
      this.applyTransform();
    };

    const onMouseUp = () => {
      if (!this.isDragging) return;
      this.isDragging = false;
      removeClass(this.viewport, 'ci-hotspot-viewport--dragging');
      this.container.style.cursor = this.zoom > 1 ? 'grab' : '';
    };

    this.container.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    this.cleanups.push(
      () => this.container.removeEventListener('mousedown', onMouseDown),
      () => document.removeEventListener('mousemove', onMouseMove),
      () => document.removeEventListener('mouseup', onMouseUp),
    );

    // Touch gestures
    this.gestures = new GestureRecognizer(
      this.container,
      {
        onPinch: (scale, cx, cy) => {
          const rect = this.container.getBoundingClientRect();
          this.setZoom(scale, cx - rect.left, cy - rect.top);
        },
        onPan: (dx, dy) => {
          if (this.zoom <= 1) return;
          this.panX += dx / this.zoom;
          this.panY += dy / this.zoom;
          this.clampPan();
          this.applyTransform();
        },
        onDoubleTap: (cx, cy) => {
          const rect = this.container.getBoundingClientRect();
          if (this.zoom > 1) {
            this.resetZoom();
          } else {
            this.setZoom(2, cx - rect.left, cy - rect.top);
          }
        },
      },
      () => this.zoom,
    );
  }

  setZoom(level: number, originX?: number, originY?: number): void {
    const oldZoom = this.zoom;
    this.zoom = Math.max(this.options.zoomMin, Math.min(this.options.zoomMax, level));

    if (originX !== undefined && originY !== undefined && oldZoom !== this.zoom) {
      // Adjust pan to zoom toward the origin point
      const containerWidth = this.container.offsetWidth;
      const containerHeight = this.container.offsetHeight;
      const scaleChange = this.zoom / oldZoom;
      const ox = originX / containerWidth;
      const oy = originY / containerHeight;
      this.panX = this.panX - (containerWidth * ox * (scaleChange - 1)) / this.zoom;
      this.panY = this.panY - (containerHeight * oy * (scaleChange - 1)) / this.zoom;
    }

    this.clampPan();
    this.applyTransform();
    this.updateCursor();
    this.options.onZoom?.(this.zoom);
  }

  getZoom(): number {
    return this.zoom;
  }

  resetZoom(): void {
    this.zoom = 1;
    this.panX = 0;
    this.panY = 0;
    this.applyTransform();
    this.updateCursor();
    this.options.onZoom?.(1);
  }

  pan(dx: number, dy: number): void {
    if (this.zoom <= 1) return;
    this.panX += dx / this.zoom;
    this.panY += dy / this.zoom;
    this.clampPan();
    this.applyTransform();
  }

  enable(): void {
    this.enabled = true;
  }

  disable(): void {
    this.enabled = false;
  }

  private clampPan(): void {
    const containerWidth = this.container.offsetWidth;
    const containerHeight = this.container.offsetHeight;

    // Maximum pan in each direction so image edge stays at container edge
    const maxPanX = (containerWidth * (this.zoom - 1)) / this.zoom;
    const maxPanY = (containerHeight * (this.zoom - 1)) / this.zoom;

    this.panX = Math.max(-maxPanX / 2, Math.min(maxPanX / 2, this.panX));
    this.panY = Math.max(-maxPanY / 2, Math.min(maxPanY / 2, this.panY));

    if (this.zoom <= 1) {
      this.panX = 0;
      this.panY = 0;
    }
  }

  private applyTransform(): void {
    this.viewport.style.transform = `scale(${this.zoom}) translate(${this.panX}px, ${this.panY}px)`;
    this.viewport.style.setProperty('--zoom', String(this.zoom));
  }

  private updateCursor(): void {
    if (!this.isDragging) {
      this.container.style.cursor = this.zoom > 1 ? 'grab' : '';
    }
  }

  destroy(): void {
    this.cleanups.forEach((fn) => fn());
    this.cleanups = [];
    this.gestures?.destroy();
    this.gestures = null;
    this.viewport.style.transform = '';
    this.viewport.style.removeProperty('--zoom');
    this.container.style.cursor = '';
  }
}
