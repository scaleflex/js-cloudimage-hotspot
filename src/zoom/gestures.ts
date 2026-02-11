export interface GestureCallbacks {
  onPinch?: (scale: number, centerX: number, centerY: number) => void;
  onPan?: (dx: number, dy: number) => void;
  onDoubleTap?: (x: number, y: number) => void;
}

/** Recognizes touch gestures: pinch, pan, double-tap */
export class GestureRecognizer {
  private el: HTMLElement;
  private callbacks: GestureCallbacks;
  private lastTouchEnd = 0;
  private initialPinchDistance = 0;
  private initialPinchScale = 1;
  private lastTouchX = 0;
  private lastTouchY = 0;
  private isPinching = false;
  private cleanups: (() => void)[] = [];

  constructor(el: HTMLElement, callbacks: GestureCallbacks, getZoom: () => number) {
    this.el = el;
    this.callbacks = callbacks;
    this.initialPinchScale = getZoom();

    const onTouchStart = (e: TouchEvent) => this.handleTouchStart(e, getZoom);
    const onTouchMove = (e: TouchEvent) => this.handleTouchMove(e);
    const onTouchEnd = (e: TouchEvent) => this.handleTouchEnd(e);

    el.addEventListener('touchstart', onTouchStart, { passive: false });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd, { passive: true });

    this.cleanups.push(
      () => el.removeEventListener('touchstart', onTouchStart),
      () => el.removeEventListener('touchmove', onTouchMove),
      () => el.removeEventListener('touchend', onTouchEnd),
    );
  }

  private handleTouchStart(e: TouchEvent, getZoom: () => number): void {
    if (e.touches.length === 2) {
      e.preventDefault();
      this.isPinching = true;
      this.initialPinchDistance = this.getTouchDistance(e.touches);
      this.initialPinchScale = getZoom();
    } else if (e.touches.length === 1) {
      this.lastTouchX = e.touches[0].clientX;
      this.lastTouchY = e.touches[0].clientY;
    }
  }

  private handleTouchMove(e: TouchEvent): void {
    if (e.touches.length === 2 && this.isPinching) {
      e.preventDefault();
      const currentDistance = this.getTouchDistance(e.touches);
      const scale = this.initialPinchScale * (currentDistance / this.initialPinchDistance);
      const centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      this.callbacks.onPinch?.(scale, centerX, centerY);
    } else if (e.touches.length === 1 && !this.isPinching) {
      const dx = e.touches[0].clientX - this.lastTouchX;
      const dy = e.touches[0].clientY - this.lastTouchY;
      this.lastTouchX = e.touches[0].clientX;
      this.lastTouchY = e.touches[0].clientY;
      this.callbacks.onPan?.(dx, dy);
    }
  }

  private handleTouchEnd(e: TouchEvent): void {
    if (this.isPinching && e.touches.length < 2) {
      this.isPinching = false;
    }

    // Double-tap detection
    if (e.changedTouches.length === 1 && e.touches.length === 0) {
      const now = Date.now();
      if (now - this.lastTouchEnd < 300) {
        const touch = e.changedTouches[0];
        this.callbacks.onDoubleTap?.(touch.clientX, touch.clientY);
      }
      this.lastTouchEnd = now;
    }
  }

  private getTouchDistance(touches: TouchList): number {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  destroy(): void {
    this.cleanups.forEach((fn) => fn());
    this.cleanups = [];
  }
}
