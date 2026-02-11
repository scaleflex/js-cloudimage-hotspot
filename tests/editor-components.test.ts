import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { CIHotspotEditor } from '../src/editor/index';
import type { EditorConfig } from '../src/editor/types';

// Polyfill PointerEvent for jsdom (which only has MouseEvent)
if (typeof globalThis.PointerEvent === 'undefined') {
  (globalThis as any).PointerEvent = class PointerEvent extends MouseEvent {
    readonly pointerId: number;
    readonly width: number;
    readonly height: number;
    readonly pressure: number;
    readonly tiltX: number;
    readonly tiltY: number;
    readonly pointerType: string;
    readonly isPrimary: boolean;

    constructor(type: string, params: PointerEventInit & { pointerId?: number } = {}) {
      super(type, params);
      this.pointerId = params.pointerId ?? 0;
      this.width = params.width ?? 1;
      this.height = params.height ?? 1;
      this.pressure = params.pressure ?? 0;
      this.tiltX = params.tiltX ?? 0;
      this.tiltY = params.tiltY ?? 0;
      this.pointerType = params.pointerType ?? '';
      this.isPrimary = params.isPrimary ?? false;
    }
  };
}

function makeEditorConfig(overrides?: Partial<EditorConfig>): EditorConfig {
  return {
    src: 'https://example.com/image.jpg',
    hotspots: [
      { id: 'h1', x: '30%', y: '40%', label: 'Hotspot 1', data: { title: 'Item 1' } },
      { id: 'h2', x: '70%', y: '60%', label: 'Hotspot 2', data: { title: 'Item 2' } },
    ],
    ...overrides,
  };
}

describe('PropertyPanel', () => {
  let root: HTMLElement;

  beforeEach(() => {
    root = document.createElement('div');
    root.id = 'editor-root';
    document.body.appendChild(root);
  });

  afterEach(() => {
    root.remove();
  });

  it('shows hotspot list when no selection', () => {
    const editor = new CIHotspotEditor(root, makeEditorConfig());

    const panel = root.querySelector('.ci-editor-sidebar > .ci-editor-panel');
    expect(panel).toBeTruthy();

    const list = panel!.querySelector('.ci-editor-hotspot-list');
    expect(list).toBeTruthy();

    const items = list!.querySelectorAll('.ci-editor-hotspot-item');
    expect(items).toHaveLength(2);

    const labels = Array.from(items).map(
      (item) => item.querySelector('.ci-editor-hotspot-item-label')?.textContent,
    );
    expect(labels).toContain('Hotspot 1');
    expect(labels).toContain('Hotspot 2');

    editor.destroy();
  });

  it('shows empty state when no hotspots', () => {
    const editor = new CIHotspotEditor(root, makeEditorConfig({ hotspots: [] }));

    const panel = root.querySelector('.ci-editor-sidebar > .ci-editor-panel');
    expect(panel).toBeTruthy();

    const empty = panel!.querySelector('.ci-editor-panel-empty');
    expect(empty).toBeTruthy();
    expect(empty!.textContent).toBeTruthy();

    // Should NOT show a hotspot list
    const list = panel!.querySelector('.ci-editor-hotspot-list');
    expect(list).toBeNull();

    editor.destroy();
  });

  it('shows form when hotspot is selected', () => {
    const editor = new CIHotspotEditor(root, makeEditorConfig());
    editor.getSelection().select('h1');

    const panel = root.querySelector('.ci-editor-sidebar > .ci-editor-panel');
    expect(panel).toBeTruthy();

    // Should no longer show the list
    const list = panel!.querySelector('.ci-editor-hotspot-list');
    expect(list).toBeNull();

    // Should show form fields
    const fields = panel!.querySelectorAll('.ci-editor-field');
    expect(fields.length).toBeGreaterThan(0);

    // Check for expected field labels: Label, X, Y, Trigger, Placement, etc.
    const labelTexts = Array.from(panel!.querySelectorAll('label')).map(
      (l) => l.textContent,
    );
    expect(labelTexts).toContain('Label');
    expect(labelTexts).toContain('X');
    expect(labelTexts).toContain('Y');

    editor.destroy();
  });

  it('form has label/id pairing', () => {
    const editor = new CIHotspotEditor(root, makeEditorConfig());
    editor.getSelection().select('h1');

    const panel = root.querySelector('.ci-editor-sidebar > .ci-editor-panel');
    expect(panel).toBeTruthy();

    const labels = panel!.querySelectorAll('label[for]');
    expect(labels.length).toBeGreaterThan(0);

    for (const label of Array.from(labels)) {
      const forAttr = label.getAttribute('for');
      expect(forAttr).toBeTruthy();

      // The target should be an input, select, or textarea with matching id
      const target = panel!.querySelector(
        `input[id="${forAttr}"], select[id="${forAttr}"], textarea[id="${forAttr}"]`,
      );
      expect(target).toBeTruthy();
    }

    editor.destroy();
  });

  it('clicking list item selects hotspot', () => {
    const editor = new CIHotspotEditor(root, makeEditorConfig());

    // No selection initially
    expect(editor.getSelection().getSelectedId()).toBeNull();

    const items = root.querySelectorAll('.ci-editor-hotspot-item');
    expect(items.length).toBeGreaterThan(0);

    // Click the first list item
    const firstItem = items[0] as HTMLElement;
    firstItem.click();

    // Check that the hotspot is now selected
    const selectedId = editor.getSelection().getSelectedId();
    expect(selectedId).toBeTruthy();

    // The selected id should match the data-list-id on the clicked item
    const listId = firstItem.getAttribute('data-list-id');
    expect(selectedId).toBe(listId);

    editor.destroy();
  });

  it('form reverts to list on deselect', () => {
    const editor = new CIHotspotEditor(root, makeEditorConfig());

    // Select a hotspot to show the form
    editor.getSelection().select('h1');

    const panel = root.querySelector('.ci-editor-sidebar > .ci-editor-panel');
    expect(panel).toBeTruthy();

    // Should be showing the form, not the list
    expect(panel!.querySelector('.ci-editor-hotspot-list')).toBeNull();
    expect(panel!.querySelectorAll('.ci-editor-field').length).toBeGreaterThan(0);

    // Deselect
    editor.getSelection().deselect();

    // Should now be showing the list again
    const list = panel!.querySelector('.ci-editor-hotspot-list');
    expect(list).toBeTruthy();

    // Should no longer show form fields
    const fields = panel!.querySelectorAll('.ci-editor-field');
    expect(fields).toHaveLength(0);

    editor.destroy();
  });
});

describe('DragManager', () => {
  let root: HTMLElement;
  let originalRAF: typeof requestAnimationFrame;

  beforeEach(() => {
    root = document.createElement('div');
    root.id = 'editor-root';
    document.body.appendChild(root);

    // Stub requestAnimationFrame to execute callbacks synchronously
    originalRAF = globalThis.requestAnimationFrame;
    vi.stubGlobal('requestAnimationFrame', (cb: Function) => {
      cb();
      return 0;
    });
  });

  afterEach(() => {
    root.remove();
    vi.stubGlobal('requestAnimationFrame', originalRAF);
  });

  it('pointerdown on marker starts tracking (no move yet)', () => {
    const editor = new CIHotspotEditor(root, makeEditorConfig());

    const marker = root.querySelector('[data-hotspot-id="h1"]') as HTMLElement;
    expect(marker).toBeTruthy();

    // Mock setPointerCapture / releasePointerCapture (not available in jsdom)
    marker.setPointerCapture = vi.fn();
    marker.releasePointerCapture = vi.fn();

    // Record original position
    const originalHotspot = editor.getHotspot('h1');
    const originalX = originalHotspot!.x;
    const originalY = originalHotspot!.y;

    // Dispatch pointerdown on the marker
    const pointerDownEvent = new PointerEvent('pointerdown', {
      clientX: 100,
      clientY: 100,
      pointerId: 1,
      bubbles: true,
    });
    marker.dispatchEvent(pointerDownEvent);

    // Hotspot position should not have changed (no move, no update)
    const hotspot = editor.getHotspot('h1');
    expect(hotspot!.x).toBe(originalX);
    expect(hotspot!.y).toBe(originalY);

    // setPointerCapture should have been called
    expect(marker.setPointerCapture).toHaveBeenCalledWith(1);

    editor.destroy();
  });

  it('small move below threshold does not trigger drag', () => {
    const editor = new CIHotspotEditor(root, makeEditorConfig());

    const marker = root.querySelector('[data-hotspot-id="h1"]') as HTMLElement;
    expect(marker).toBeTruthy();

    marker.setPointerCapture = vi.fn();
    marker.releasePointerCapture = vi.fn();

    // Record original position
    const originalHotspot = editor.getHotspot('h1');
    const originalX = originalHotspot!.x;
    const originalY = originalHotspot!.y;

    const canvas = root.querySelector('.ci-editor-canvas') as HTMLElement;
    expect(canvas).toBeTruthy();

    // Dispatch pointerdown
    const pointerDownEvent = new PointerEvent('pointerdown', {
      clientX: 100,
      clientY: 100,
      pointerId: 1,
      bubbles: true,
    });
    marker.dispatchEvent(pointerDownEvent);

    // Move less than 3px total (abs(dx) + abs(dy) < 3)
    const pointerMoveEvent = new PointerEvent('pointermove', {
      clientX: 101,
      clientY: 101,
      pointerId: 1,
      bubbles: true,
    });
    canvas.dispatchEvent(pointerMoveEvent);

    // Release
    const pointerUpEvent = new PointerEvent('pointerup', {
      clientX: 101,
      clientY: 101,
      pointerId: 1,
      bubbles: true,
    });
    canvas.dispatchEvent(pointerUpEvent);

    // Position should be unchanged because the move was below threshold
    const hotspot = editor.getHotspot('h1');
    expect(hotspot!.x).toBe(originalX);
    expect(hotspot!.y).toBe(originalY);

    editor.destroy();
  });

  it('destroy cleans up without errors', () => {
    const editor = new CIHotspotEditor(root, makeEditorConfig());

    const marker = root.querySelector('[data-hotspot-id="h1"]') as HTMLElement;
    expect(marker).toBeTruthy();

    marker.setPointerCapture = vi.fn();
    marker.releasePointerCapture = vi.fn();

    // Destroy the editor
    editor.destroy();

    // Verify root is cleaned up
    expect(root.innerHTML).toBe('');

    // Dispatching pointer events on the now-detached canvas should not throw
    expect(() => {
      const event = new PointerEvent('pointerdown', {
        clientX: 100,
        clientY: 100,
        pointerId: 1,
        bubbles: true,
      });
      marker.dispatchEvent(event);
    }).not.toThrow();
  });
});
