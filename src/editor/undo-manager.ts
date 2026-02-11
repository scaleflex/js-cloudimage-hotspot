import type { EditorSnapshot } from './types';
import type { CIHotspotEditor } from './ci-hotspot-editor';

export class UndoManager {
  private undoStack: EditorSnapshot[] = [];
  private redoStack: EditorSnapshot[] = [];
  private maxHistory: number;

  constructor(
    private editor: CIHotspotEditor,
    maxHistory: number,
  ) {
    this.maxHistory = maxHistory;
  }

  saveInitial(): void {
    this.undoStack = [this.editor.createSnapshot()];
    this.redoStack = [];
    this.notifyChange();
  }

  save(): void {
    this.undoStack.push(this.editor.createSnapshot());
    if (this.undoStack.length > this.maxHistory) {
      this.undoStack.shift();
    }
    this.redoStack = [];
    this.notifyChange();
  }

  undo(): void {
    if (this.undoStack.length <= 1) return;
    const current = this.undoStack.pop()!;
    this.redoStack.push(current);
    const prev = this.undoStack[this.undoStack.length - 1];
    this.editor.restoreSnapshot(prev);
    this.notifyChange();
  }

  redo(): void {
    if (this.redoStack.length === 0) return;
    const next = this.redoStack.pop()!;
    this.undoStack.push(next);
    this.editor.restoreSnapshot(next);
    this.notifyChange();
  }

  canUndo(): boolean {
    return this.undoStack.length > 1;
  }

  canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  private notifyChange(): void {
    this.editor.events.emit('history:change');
    this.editor.getToolbar().updateState();
  }
}
