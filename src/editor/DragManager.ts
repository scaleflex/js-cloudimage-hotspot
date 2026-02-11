import { addListener } from '../utils/events';
import type { CIHotspotEditor } from './CIHotspotEditor';

export class DragManager {
  private cleanups: (() => void)[] = [];
  private dragging = false;
  private dragId: string | null = null;
  private startX = 0;
  private startY = 0;
  private markerEl: HTMLElement | null = null;
  private origLeft = '';
  private origTop = '';

  constructor(private editor: CIHotspotEditor) {
    this.bind();
  }

  bind(): void {
    this.unbind();

    const canvas = this.editor.getCanvasEl();

    const onPointerDown = (e: PointerEvent) => {
      if (this.editor.getMode() !== 'select') return;
      const target = e.target as HTMLElement;
      const marker = target.closest<HTMLElement>('[data-hotspot-id]');
      if (!marker) return;

      const id = marker.getAttribute('data-hotspot-id');
      if (!id) return;

      e.preventDefault();
      this.dragging = false;
      this.dragId = id;
      this.startX = e.clientX;
      this.startY = e.clientY;
      this.markerEl = marker;
      this.origLeft = marker.style.left;
      this.origTop = marker.style.top;

      marker.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!this.dragId || !this.markerEl) return;

      const dx = e.clientX - this.startX;
      const dy = e.clientY - this.startY;

      // Start dragging after 3px threshold
      if (!this.dragging && Math.abs(dx) + Math.abs(dy) < 3) return;
      this.dragging = true;

      const imgEl = canvas.querySelector<HTMLImageElement>('.ci-hotspot-image');
      if (!imgEl) return;

      const rect = imgEl.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      // Clamp to 0-100
      const cx = Math.max(0, Math.min(100, x));
      const cy = Math.max(0, Math.min(100, y));

      this.markerEl.style.left = `${cx}%`;
      this.markerEl.style.top = `${cy}%`;
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!this.dragId) return;

      if (this.dragging && this.markerEl) {
        const imgEl = canvas.querySelector<HTMLImageElement>('.ci-hotspot-image');
        if (imgEl) {
          const rect = imgEl.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * 100;
          const y = ((e.clientY - rect.top) / rect.height) * 100;
          const cx = Math.max(0, Math.min(100, Math.round(x * 100) / 100));
          const cy = Math.max(0, Math.min(100, Math.round(y * 100) / 100));

          this.editor.updateHotspot(this.dragId, {
            x: `${cx}%`,
            y: `${cy}%`,
          });
        }
      }

      this.dragId = null;
      this.dragging = false;
      this.markerEl = null;
    };

    const downCleanup = addListener(canvas, 'pointerdown', onPointerDown);
    const moveCleanup = addListener(canvas, 'pointermove', onPointerMove);
    const upCleanup = addListener(canvas, 'pointerup', onPointerUp);

    this.cleanups.push(downCleanup, moveCleanup, upCleanup);
  }

  private unbind(): void {
    this.cleanups.forEach((fn) => fn());
    this.cleanups = [];
  }

  destroy(): void {
    this.unbind();
  }
}
