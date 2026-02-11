import { createElement } from '../utils/dom';
import type { CIHotspotEditor } from './CIHotspotEditor';

const ICONS = {
  cursor: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
  undo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>',
  redo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.13-9.36L23 10"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
  download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
  upload: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>',
  copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
};

export class EditorToolbar {
  private toolbarEl: HTMLElement;
  private selectBtn!: HTMLButtonElement;
  private addBtn!: HTMLButtonElement;
  private undoBtn!: HTMLButtonElement;
  private redoBtn!: HTMLButtonElement;
  private deleteBtn!: HTMLButtonElement;
  private exportBtn!: HTMLButtonElement;
  private importBtn!: HTMLButtonElement;
  private copyBtn!: HTMLButtonElement;

  constructor(
    private parentEl: HTMLElement,
    private editor: CIHotspotEditor,
  ) {
    this.toolbarEl = createElement('div', 'ci-editor-toolbar');
    this.build();
    // Insert toolbar before the body
    this.parentEl.insertBefore(this.toolbarEl, this.parentEl.firstChild);
  }

  private build(): void {
    // Mode buttons
    const modeGroup = createElement('div', 'ci-editor-toolbar-group');
    this.selectBtn = this.createBtn(ICONS.cursor, 'Select', () => this.editor.setMode('select'));
    this.addBtn = this.createBtn(ICONS.plus, 'Add', () => this.editor.setMode('add'));
    modeGroup.appendChild(this.selectBtn);
    modeGroup.appendChild(this.addBtn);
    this.toolbarEl.appendChild(modeGroup);

    this.toolbarEl.appendChild(this.createSeparator());

    // History buttons
    const historyGroup = createElement('div', 'ci-editor-toolbar-group');
    this.undoBtn = this.createBtn(ICONS.undo, 'Undo', () => this.editor.getUndoManager().undo());
    this.redoBtn = this.createBtn(ICONS.redo, 'Redo', () => this.editor.getUndoManager().redo());
    this.deleteBtn = this.createBtn(ICONS.trash, 'Delete', () => {
      const id = this.editor.getSelection().getSelectedId();
      if (id) this.editor.removeHotspot(id);
    });
    historyGroup.appendChild(this.undoBtn);
    historyGroup.appendChild(this.redoBtn);
    historyGroup.appendChild(this.deleteBtn);
    this.toolbarEl.appendChild(historyGroup);

    this.toolbarEl.appendChild(this.createSeparator());

    // Import/Export buttons
    const ioGroup = createElement('div', 'ci-editor-toolbar-group');
    this.exportBtn = this.createBtn(ICONS.download, 'Export', () => this.showExportJSON());
    this.importBtn = this.createBtn(ICONS.upload, 'Import', () => this.showImportModal());
    this.copyBtn = this.createBtn(ICONS.copy, 'Copy JSON', () => this.copyJSON());
    ioGroup.appendChild(this.exportBtn);
    ioGroup.appendChild(this.importBtn);
    ioGroup.appendChild(this.copyBtn);
    this.toolbarEl.appendChild(ioGroup);

    this.updateState();
  }

  private createBtn(icon: string, label: string, onClick: () => void): HTMLButtonElement {
    const btn = createElement('button', 'ci-editor-btn');
    btn.innerHTML = icon;
    btn.appendChild(document.createTextNode(` ${label}`));
    btn.title = label;
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      onClick();
    });
    return btn;
  }

  private createSeparator(): HTMLElement {
    return createElement('div', 'ci-editor-toolbar-separator');
  }

  updateState(): void {
    const mode = this.editor.getMode();
    this.selectBtn.classList.toggle('ci-editor-btn--active', mode === 'select');
    this.addBtn.classList.toggle('ci-editor-btn--active', mode === 'add');

    const undo = this.editor.getUndoManager();
    this.undoBtn.disabled = !undo.canUndo();
    this.redoBtn.disabled = !undo.canRedo();

    this.deleteBtn.disabled = !this.editor.getSelection().getSelectedId();
  }

  private showExportJSON(): void {
    const json = this.editor.exportJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = createElement('a');
    a.href = url;
    a.download = 'hotspots.json';
    a.click();
    URL.revokeObjectURL(url);
    this.editor.showToast('Exported hotspots.json');
  }

  private async copyJSON(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.editor.exportJSON());
      this.editor.showToast('Copied JSON to clipboard');
    } catch {
      this.editor.showToast('Failed to copy');
    }
  }

  private showImportModal(): void {
    const overlay = createElement('div', 'ci-editor-modal-overlay');
    const modal = createElement('div', 'ci-editor-modal');

    const title = createElement('h3');
    title.textContent = 'Import Hotspots JSON';

    const textarea = createElement('textarea');
    textarea.placeholder = '[\n  { "id": "h1", "x": "50%", "y": "50%", "label": "My Hotspot" }\n]';

    const errorEl = createElement('div', 'ci-editor-modal-error');
    errorEl.style.display = 'none';

    const actions = createElement('div', 'ci-editor-modal-actions');
    const cancelBtn = createElement('button', 'ci-editor-btn');
    cancelBtn.textContent = 'Cancel';
    const importBtn = createElement('button', 'ci-editor-btn ci-editor-btn--primary');
    importBtn.textContent = 'Import';

    actions.appendChild(cancelBtn);
    actions.appendChild(importBtn);

    modal.appendChild(title);
    modal.appendChild(textarea);
    modal.appendChild(errorEl);
    modal.appendChild(actions);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    const close = () => overlay.remove();

    cancelBtn.addEventListener('click', close);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close();
    });

    importBtn.addEventListener('click', () => {
      try {
        this.editor.importJSON(textarea.value);
        close();
        this.editor.showToast('Imported hotspots');
      } catch (err) {
        errorEl.style.display = 'block';
        errorEl.textContent = err instanceof Error ? err.message : 'Invalid JSON';
      }
    });

    textarea.focus();
  }

  destroy(): void {
    this.toolbarEl.remove();
  }
}
