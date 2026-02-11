import { createElement } from '../utils/dom';
import { createFocusTrap } from '../a11y/focus';
import type { CIHotspotEditor } from './ci-hotspot-editor';

const ICONS = {
  cursor: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.586 12.586 19 19"/><path d="M3.688 3.037a.497.497 0 0 0-.651.651l6.5 15.999a.501.501 0 0 0 .947-.062l1.569-6.083a2 2 0 0 1 1.448-1.479l6.124-1.579a.5.5 0 0 0 .063-.947z"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>',
  undo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11"/></svg>',
  redo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 14 5-5-5-5"/><path d="M20 9H9.5A5.5 5.5 0 0 0 4 14.5A5.5 5.5 0 0 0 9.5 20H13"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 11v6"/><path d="M14 11v6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
  download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V3"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/></svg>',
  upload: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12"/><path d="m17 8-5-5-5 5"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/></svg>',
  copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>',
  image: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>',
};

export class EditorToolbar {
  private toolbarEl: HTMLElement;
  private urlBarEl: HTMLElement;
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
    this.urlBarEl = createElement('div', 'ci-editor-url-bar');
    this.build();
    // Insert toolbar and URL bar before the body
    const firstChild = this.parentEl.firstChild;
    this.parentEl.insertBefore(this.toolbarEl, firstChild);
    this.parentEl.insertBefore(this.urlBarEl, firstChild);
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

    // Image URL bar (separate row)
    const urlIcon = createElement('span', 'ci-editor-btn-icon');
    urlIcon.innerHTML = ICONS.image;
    const urlInput = createElement('input', 'ci-editor-toolbar-url') as HTMLInputElement;
    urlInput.type = 'url';
    urlInput.placeholder = 'Image URL...';
    urlInput.value = this.editor.getSrc();
    const loadBtn = this.createBtn('', 'Load', () => this.loadImageUrl(urlInput));
    urlInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.loadImageUrl(urlInput);
      }
    });
    this.urlBarEl.appendChild(urlIcon);
    this.urlBarEl.appendChild(urlInput);
    this.urlBarEl.appendChild(loadBtn);

    this.updateState();
  }

  private createBtn(icon: string, label: string, onClick: () => void): HTMLButtonElement {
    const btn = createElement('button', 'ci-editor-btn');
    btn.innerHTML = icon;
    btn.appendChild(document.createTextNode(` ${label}`));
    btn.title = label;
    btn.setAttribute('aria-label', label);
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
    this.selectBtn.setAttribute('aria-pressed', String(mode === 'select'));
    this.addBtn.setAttribute('aria-pressed', String(mode === 'add'));

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
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');

    const titleId = 'ci-editor-import-title';
    modal.setAttribute('aria-labelledby', titleId);

    const title = createElement('h3');
    title.id = titleId;
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

    const trap = createFocusTrap(modal, this.importBtn);
    const close = () => {
      trap.destroy();
      overlay.remove();
    };

    cancelBtn.addEventListener('click', close);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close();
    });
    overlay.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close();
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
    trap.activate();
  }

  private loadImageUrl(input: HTMLInputElement): void {
    const src = input.value.trim();
    if (!src) return;
    this.editor.setSrc(src);
    this.editor.showToast('Image updated');
  }

  destroy(): void {
    this.toolbarEl.remove();
    this.urlBarEl.remove();
  }
}
