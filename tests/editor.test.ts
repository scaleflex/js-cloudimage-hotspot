import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { CIHotspotEditor } from '../src/editor/index';
import type { EditorConfig } from '../src/editor/types';

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

describe('CIHotspotEditor', () => {
  let root: HTMLElement;

  beforeEach(() => {
    root = document.createElement('div');
    root.id = 'editor-root';
    document.body.appendChild(root);
  });

  afterEach(() => {
    root.remove();
  });

  it('creates editor DOM structure', () => {
    const editor = new CIHotspotEditor(root, makeEditorConfig());
    expect(root.querySelector('.ci-editor')).toBeTruthy();
    expect(root.querySelector('.ci-editor-toolbar')).toBeTruthy();
    expect(root.querySelector('.ci-editor-canvas')).toBeTruthy();
    expect(root.querySelector('.ci-editor-sidebar')).toBeTruthy();
    expect(root.querySelector('.ci-editor-status')).toBeTruthy();
    editor.destroy();
  });

  it('renders initial hotspots as markers', () => {
    const editor = new CIHotspotEditor(root, makeEditorConfig());
    const markers = root.querySelectorAll('.ci-hotspot-marker');
    expect(markers).toHaveLength(2);
    editor.destroy();
  });

  it('starts in select mode', () => {
    const editor = new CIHotspotEditor(root, makeEditorConfig());
    expect(editor.getMode()).toBe('select');
    editor.destroy();
  });

  it('can switch to add mode', () => {
    const editor = new CIHotspotEditor(root, makeEditorConfig());
    editor.setMode('add');
    expect(editor.getMode()).toBe('add');
    const canvas = root.querySelector('.ci-editor-canvas');
    expect(canvas?.classList.contains('ci-editor-canvas--add-mode')).toBe(true);
    editor.destroy();
  });

  it('can add a hotspot', () => {
    const editor = new CIHotspotEditor(root, makeEditorConfig());
    const hotspot = editor.addHotspot({ x: '50%', y: '50%', label: 'New Spot' });
    expect(hotspot.id).toMatch(/^hotspot-/);
    expect(editor.getHotspots()).toHaveLength(3);
    editor.destroy();
  });

  it('can remove a hotspot', () => {
    const editor = new CIHotspotEditor(root, makeEditorConfig());
    editor.removeHotspot('h1');
    expect(editor.getHotspots()).toHaveLength(1);
    expect(editor.getHotspot('h1')).toBeUndefined();
    editor.destroy();
  });

  it('can update a hotspot', () => {
    const editor = new CIHotspotEditor(root, makeEditorConfig());
    editor.updateHotspot('h1', { label: 'Updated Label' });
    expect(editor.getHotspot('h1')?.label).toBe('Updated Label');
    editor.destroy();
  });

  it('exports JSON', () => {
    const editor = new CIHotspotEditor(root, makeEditorConfig());
    const json = editor.exportJSON();
    const parsed = JSON.parse(json);
    expect(parsed).toHaveLength(2);
    expect(parsed[0].id).toBe('h1');
    editor.destroy();
  });

  it('imports JSON', () => {
    const editor = new CIHotspotEditor(root, makeEditorConfig());
    const newData = [{ id: 'imported-1', x: '10%', y: '20%', label: 'Imported' }];
    editor.importJSON(JSON.stringify(newData));
    expect(editor.getHotspots()).toHaveLength(1);
    expect(editor.getHotspot('imported-1')?.label).toBe('Imported');
    editor.destroy();
  });

  it('rejects invalid JSON import', () => {
    const editor = new CIHotspotEditor(root, makeEditorConfig());
    expect(() => editor.importJSON('not json')).toThrow();
    expect(() => editor.importJSON('"string"')).toThrow('Expected an array');
    expect(() => editor.importJSON('[{"x":"10%"}]')).toThrow('must have id');
    editor.destroy();
  });

  it('getHotspots returns a deep clone', () => {
    const editor = new CIHotspotEditor(root, makeEditorConfig());
    const hotspots = editor.getHotspots();
    hotspots[0].label = 'Mutated';
    expect(editor.getHotspot('h1')?.label).toBe('Hotspot 1');
    editor.destroy();
  });

  it('calls onChange when hotspots change', () => {
    let changeCount = 0;
    const editor = new CIHotspotEditor(root, makeEditorConfig({
      onChange: () => { changeCount++; },
    }));
    editor.addHotspot({ x: '50%', y: '50%' });
    expect(changeCount).toBeGreaterThan(0);
    editor.destroy();
  });

  describe('Selection', () => {
    it('can select and deselect', () => {
      const editor = new CIHotspotEditor(root, makeEditorConfig());
      editor.getSelection().select('h1');
      expect(editor.getSelection().getSelectedId()).toBe('h1');
      editor.getSelection().deselect();
      expect(editor.getSelection().getSelectedId()).toBeNull();
      editor.destroy();
    });

    it('applies selected class to marker', () => {
      const editor = new CIHotspotEditor(root, makeEditorConfig());
      editor.getSelection().select('h1');
      const marker = root.querySelector('[data-hotspot-id="h1"]');
      expect(marker?.classList.contains('ci-hotspot-marker--editor-selected')).toBe(true);
      editor.destroy();
    });
  });

  describe('Undo/Redo', () => {
    it('starts with no undo available (only initial state)', () => {
      const editor = new CIHotspotEditor(root, makeEditorConfig());
      expect(editor.getUndoManager().canUndo()).toBe(false);
      expect(editor.getUndoManager().canRedo()).toBe(false);
      editor.destroy();
    });

    it('can undo after adding a hotspot', () => {
      const editor = new CIHotspotEditor(root, makeEditorConfig());
      editor.addHotspot({ x: '50%', y: '50%' });
      expect(editor.getHotspots()).toHaveLength(3);
      expect(editor.getUndoManager().canUndo()).toBe(true);

      editor.getUndoManager().undo();
      expect(editor.getHotspots()).toHaveLength(2);
      editor.destroy();
    });

    it('can redo after undoing', () => {
      const editor = new CIHotspotEditor(root, makeEditorConfig());
      editor.addHotspot({ x: '50%', y: '50%' });
      editor.getUndoManager().undo();
      expect(editor.getUndoManager().canRedo()).toBe(true);

      editor.getUndoManager().redo();
      expect(editor.getHotspots()).toHaveLength(3);
      editor.destroy();
    });

    it('clears redo stack after new change', () => {
      const editor = new CIHotspotEditor(root, makeEditorConfig());
      editor.addHotspot({ x: '50%', y: '50%' });
      editor.getUndoManager().undo();
      expect(editor.getUndoManager().canRedo()).toBe(true);

      editor.addHotspot({ x: '20%', y: '20%' });
      expect(editor.getUndoManager().canRedo()).toBe(false);
      editor.destroy();
    });
  });

  it('can be destroyed cleanly', () => {
    const editor = new CIHotspotEditor(root, makeEditorConfig());
    editor.destroy();
    expect(root.innerHTML).toBe('');
  });

  it('works with empty initial hotspots', () => {
    const editor = new CIHotspotEditor(root, makeEditorConfig({ hotspots: [] }));
    expect(editor.getHotspots()).toHaveLength(0);
    editor.addHotspot({ x: '50%', y: '50%' });
    expect(editor.getHotspots()).toHaveLength(1);
    editor.destroy();
  });

  it('setHotspots replaces all hotspots', () => {
    const editor = new CIHotspotEditor(root, makeEditorConfig());
    editor.setHotspots([{ id: 'new-1', x: '10%', y: '20%', label: 'New' }]);
    expect(editor.getHotspots()).toHaveLength(1);
    expect(editor.getHotspot('h1')).toBeUndefined();
    editor.destroy();
  });
});
