import type { HotspotItem, Placement, TriggerMode } from '../core/types';
import type { EditorConfig, EditorMode, EditorSnapshot } from './types';
import { createElement, injectStyles } from '../utils/dom';
import { EventEmitter, addListener } from '../utils/events';
import { CIHotspot } from '../core/ci-hotspot';
import { EditorToolbar } from './editor-toolbar';
import { SelectionManager } from './selection-manager';
import { PropertyPanel } from './property-panel';
import { DragManager } from './drag-manager';
import { UndoManager } from './undo-manager';
import editorCss from './editor.css?inline';
import viewerCss from '../styles/index.css?inline';

export class CIHotspotEditor {
  private config: Required<
    Pick<EditorConfig, 'src' | 'defaultTrigger' | 'defaultPlacement' | 'maxHistory'>
  > &
    EditorConfig;
  private rootEl: HTMLElement;
  private editorEl!: HTMLElement;
  private canvasEl!: HTMLElement;
  private sidebarEl!: HTMLElement;
  private statusEl!: HTMLElement;

  private viewer: CIHotspot | null = null;
  private hotspots: HotspotItem[] = [];
  private mode: EditorMode = 'select';
  private nextId = 1;

  private toolbar!: EditorToolbar;
  private selection!: SelectionManager;
  private propertyPanel!: PropertyPanel;
  private dragManager!: DragManager;
  private undoManager!: UndoManager;

  readonly events = new EventEmitter();
  private cleanups: (() => void)[] = [];
  private destroyed = false;

  constructor(element: HTMLElement | string, config: EditorConfig) {
    this.rootEl =
      typeof element === 'string'
        ? document.querySelector<HTMLElement>(element)!
        : element;
    if (!this.rootEl) throw new Error('CIHotspotEditor: element not found');

    this.config = {
      defaultTrigger: 'click' as TriggerMode,
      defaultPlacement: 'top' as Placement,
      maxHistory: 50,
      ...config,
    };

    this.hotspots = config.hotspots ? structuredClone(config.hotspots) : [];
    // Ensure unique IDs and track next ID
    for (const h of this.hotspots) {
      const num = parseInt(h.id.replace(/\D/g, ''), 10);
      if (!isNaN(num) && num >= this.nextId) this.nextId = num + 1;
    }

    injectStyles(viewerCss);
    this.injectEditorStyles();
    this.buildDOM();
    this.initModules();
    this.rebuildViewer();
    this.updateStatus();
  }

  // === DOM ===

  private injectEditorStyles(): void {
    const id = 'ci-editor-styles';
    if (document.getElementById(id)) return;
    const style = document.createElement('style');
    style.id = id;
    style.textContent = editorCss;
    document.head.appendChild(style);
  }

  private buildDOM(): void {
    this.editorEl = createElement('div', 'ci-editor');
    this.canvasEl = createElement('div', 'ci-editor-canvas');
    this.sidebarEl = createElement('div', 'ci-editor-sidebar');
    this.statusEl = createElement('div', 'ci-editor-status');

    const bodyEl = createElement('div', 'ci-editor-body');
    bodyEl.appendChild(this.canvasEl);
    bodyEl.appendChild(this.sidebarEl);

    this.editorEl.appendChild(bodyEl);
    this.editorEl.appendChild(this.statusEl);

    this.rootEl.innerHTML = '';
    this.rootEl.appendChild(this.editorEl);
  }

  private initModules(): void {
    // Undo manager (must be before toolbar, which reads undo state)
    this.undoManager = new UndoManager(this, this.config.maxHistory);
    // Selection
    this.selection = new SelectionManager(this);
    // Toolbar (reads undo + selection state)
    this.toolbar = new EditorToolbar(this.editorEl, this);
    // Property panel
    this.propertyPanel = new PropertyPanel(this.sidebarEl, this);
    // Drag manager
    this.dragManager = new DragManager(this);

    // Click on canvas to add hotspot
    const clickCleanup = addListener(this.canvasEl, 'click', (e) => {
      if (this.mode !== 'add') return;
      const target = e.target as HTMLElement;
      // Don't place if clicking a marker
      if (target.closest('.ci-hotspot-marker')) return;

      const rect = this.canvasEl
        .querySelector('.ci-hotspot-image')
        ?.getBoundingClientRect();
      if (!rect) return;

      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      // Clamp to image bounds
      if (x < 0 || x > 100 || y < 0 || y > 100) return;

      this.addHotspot({
        x: `${Math.round(x * 100) / 100}%`,
        y: `${Math.round(y * 100) / 100}%`,
      });
    });
    this.cleanups.push(clickCleanup);

    // Keyboard shortcuts
    const keyCleanup = addListener(document, 'keydown', (e) => {
      // Don't handle if focus is in an input/textarea/select
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      const mod = e.metaKey || e.ctrlKey;

      if (mod && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        this.undoManager.undo();
      } else if (mod && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        this.undoManager.redo();
      } else if (mod && e.key === 'y') {
        e.preventDefault();
        this.undoManager.redo();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        const id = this.selection.getSelectedId();
        if (id) {
          e.preventDefault();
          this.removeHotspot(id);
        }
      } else if (e.key === 'Escape') {
        if (this.mode === 'add') {
          this.setMode('select');
        } else {
          this.selection.deselect();
        }
      } else if (e.key === 'a' && !mod) {
        this.setMode(this.mode === 'add' ? 'select' : 'add');
      } else if (e.key === 'v' && !mod) {
        this.setMode('select');
      }
    });
    this.cleanups.push(keyCleanup);

    // Save initial state
    this.undoManager.saveInitial();
  }

  // === Viewer ===

  rebuildViewer(): void {
    if (this.viewer) {
      this.viewer.destroy();
      this.viewer = null;
    }

    // Don't pass empty hotspots array if there are no hotspots — init with what we have
    this.viewer = new CIHotspot(this.canvasEl, {
      src: this.config.src,
      alt: this.config.alt || 'Editor image',
      hotspots: this.hotspots,
      trigger: 'click',
      pulse: false,
      lazyLoad: false,
      ...(this.config.cloudimage ? { cloudimage: this.config.cloudimage } : {}),
    });

    // Re-apply selection visuals
    this.selection?.refreshMarkerVisuals();
    // Re-bind drag listeners
    this.dragManager?.bind();
  }

  // === Hotspot CRUD ===

  addHotspot(partial: Partial<HotspotItem> = {}): HotspotItem {
    const id = `hotspot-${this.nextId++}`;
    const hotspot: HotspotItem = {
      ...partial,
      id,
      x: partial.x ?? '50%',
      y: partial.y ?? '50%',
      label: partial.label || `Hotspot ${this.hotspots.length + 1}`,
      trigger: partial.trigger || this.config.defaultTrigger,
      placement: partial.placement || this.config.defaultPlacement,
      data: partial.data || {},
    };

    this.hotspots.push(hotspot);
    this.rebuildViewer();
    this.selection.select(id);
    this.undoManager.save();
    this.notifyChange('hotspot:add');
    this.updateStatus();
    return hotspot;
  }

  removeHotspot(id: string): void {
    const idx = this.hotspots.findIndex((h) => h.id === id);
    if (idx === -1) return;

    this.hotspots.splice(idx, 1);
    if (this.selection.getSelectedId() === id) {
      this.selection.deselect();
    }
    this.rebuildViewer();
    this.undoManager.save();
    this.notifyChange('hotspot:remove');
    this.updateStatus();
  }

  updateHotspot(id: string, updates: Partial<HotspotItem>): void {
    const idx = this.hotspots.findIndex((h) => h.id === id);
    if (idx === -1) return;

    this.hotspots[idx] = { ...this.hotspots[idx], ...updates };
    this.rebuildViewer();
    this.undoManager.save();
    this.notifyChange('hotspot:update');
    this.updateStatus();
  }

  // === State Access ===

  getHotspots(): HotspotItem[] {
    return structuredClone(this.hotspots);
  }

  getHotspot(id: string): HotspotItem | undefined {
    return this.hotspots.find((h) => h.id === id);
  }

  getHotspotsRef(): HotspotItem[] {
    return this.hotspots;
  }

  setHotspots(hotspots: HotspotItem[]): void {
    this.hotspots = structuredClone(hotspots);
    this.selection.deselect();
    this.rebuildViewer();
    this.updateStatus();
  }

  getMode(): EditorMode {
    return this.mode;
  }

  setMode(mode: EditorMode): void {
    this.mode = mode;
    this.canvasEl.classList.toggle('ci-editor-canvas--add-mode', mode === 'add');
    this.events.emit('mode:change', mode);
    this.toolbar.updateState();
    this.updateStatus();
  }

  getCanvasEl(): HTMLElement {
    return this.canvasEl;
  }

  getViewer(): CIHotspot | null {
    return this.viewer;
  }

  getSrc(): string {
    return this.config.src;
  }

  setSrc(src: string): void {
    this.config.src = src;
    this.rebuildViewer();
  }

  getSelection(): SelectionManager {
    return this.selection;
  }

  getToolbar(): EditorToolbar {
    return this.toolbar;
  }

  getUndoManager(): UndoManager {
    return this.undoManager;
  }

  // === Snapshot (for undo/redo) ===

  createSnapshot(): EditorSnapshot {
    return {
      hotspots: structuredClone(this.hotspots),
      selectedId: this.selection.getSelectedId(),
    };
  }

  restoreSnapshot(snapshot: EditorSnapshot): void {
    this.hotspots = structuredClone(snapshot.hotspots);
    this.rebuildViewer();
    if (snapshot.selectedId && this.hotspots.find((h) => h.id === snapshot.selectedId)) {
      this.selection.select(snapshot.selectedId);
    } else {
      this.selection.deselect();
    }
    this.notifyChange('change');
    this.updateStatus();
  }

  // === Export ===

  exportJSON(): string {
    return JSON.stringify(this.hotspots, null, 2);
  }

  importJSON(json: string): void {
    const parsed = JSON.parse(json);
    if (!Array.isArray(parsed)) throw new Error('Expected an array of hotspots');
    for (const h of parsed) {
      if (!h.id || h.x == null || h.y == null) {
        throw new Error('Each hotspot must have id, x, and y');
      }
    }
    this.hotspots = parsed;
    // Update nextId
    for (const h of this.hotspots) {
      const num = parseInt(h.id.replace(/\D/g, ''), 10);
      if (!isNaN(num) && num >= this.nextId) this.nextId = num + 1;
    }
    this.selection.deselect();
    this.rebuildViewer();
    this.undoManager.save();
    this.notifyChange('change');
    this.updateStatus();
  }

  // === Notifications ===

  private notifyChange(event: string): void {
    this.events.emit(event);
    this.events.emit('change');
    this.config.onChange?.(this.getHotspots());
    this.propertyPanel?.refresh();
  }

  private updateStatus(): void {
    const count = this.hotspots.length;
    const selected = this.selection?.getSelectedId();
    const modeLabel = this.mode === 'add' ? 'Add mode' : 'Select mode';
    const parts = [`${count} hotspot${count !== 1 ? 's' : ''}`, modeLabel];
    if (selected) parts.push(`Selected: ${selected}`);
    this.statusEl.textContent = parts.join('  |  ');
  }

  // === Toast ===

  showToast(message: string, duration = 2000): void {
    let toast = document.querySelector('.ci-editor-toast') as HTMLElement;
    if (!toast) {
      toast = createElement('div', 'ci-editor-toast');
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('ci-editor-toast--visible');
    setTimeout(() => toast.classList.remove('ci-editor-toast--visible'), duration);
  }

  // === Lifecycle ===

  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    this.cleanups.forEach((fn) => fn());
    this.cleanups = [];
    this.dragManager.destroy();
    this.toolbar.destroy();
    this.viewer?.destroy();
    this.events.removeAll();
    this.rootEl.innerHTML = '';
  }
}
