import { addListener } from '../utils/events';
import type { CIHotspotEditor } from './ci-hotspot-editor';

export class SelectionManager {
  private selectedId: string | null = null;
  private cleanups: (() => void)[] = [];

  constructor(private editor: CIHotspotEditor) {
    this.bindCanvasClicks();
  }

  private bindCanvasClicks(): void {
    const cleanup = addListener(this.editor.getCanvasEl(), 'click', (e) => {
      if (this.editor.getMode() !== 'select') return;

      const target = e.target as HTMLElement;
      const markerEl = target.closest<HTMLElement>('[data-hotspot-id]');

      if (markerEl) {
        e.stopPropagation();
        const id = markerEl.getAttribute('data-hotspot-id');
        if (id) this.select(id);
      } else {
        // Clicked on canvas background — deselect
        const isToolbar = target.closest('.ci-editor-toolbar');
        const isSidebar = target.closest('.ci-editor-sidebar');
        if (!isToolbar && !isSidebar) {
          this.deselect();
        }
      }
    });
    this.cleanups.push(cleanup);
  }

  select(id: string): void {
    if (this.selectedId === id) return;
    this.deselect();
    this.selectedId = id;
    this.applySelectedClass(id, true);
    this.editor.events.emit('hotspot:select', id);
    this.editor.getToolbar().updateState();
    // Property panel updates via editor notifyChange or explicit refresh
  }

  deselect(): void {
    if (!this.selectedId) return;
    const prevId = this.selectedId;
    this.applySelectedClass(prevId, false);
    this.selectedId = null;
    this.editor.events.emit('hotspot:deselect', prevId);
    this.editor.getToolbar().updateState();
  }

  getSelectedId(): string | null {
    return this.selectedId;
  }

  refreshMarkerVisuals(): void {
    if (!this.selectedId) return;
    this.applySelectedClass(this.selectedId, true);
  }

  private applySelectedClass(id: string, add: boolean): void {
    const canvas = this.editor.getCanvasEl();
    const marker = canvas.querySelector<HTMLElement>(`[data-hotspot-id="${id}"]`);
    if (marker) {
      marker.classList.toggle('ci-hotspot-marker--editor-selected', add);
    }
  }

  destroy(): void {
    this.cleanups.forEach((fn) => fn());
    this.cleanups = [];
  }
}
