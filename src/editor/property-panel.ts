import type { HotspotItem } from '../core/types';
import { createElement } from '../utils/dom';
import type { CIHotspotEditor } from './ci-hotspot-editor';

export class PropertyPanel {
  private panelEl: HTMLElement;

  constructor(
    private parentEl: HTMLElement,
    private editor: CIHotspotEditor,
  ) {
    this.panelEl = createElement('div', 'ci-editor-panel');
    this.parentEl.appendChild(this.panelEl);

    // Listen for selection changes
    this.editor.events.on('hotspot:select', () => this.refresh());
    this.editor.events.on('hotspot:deselect', () => this.refresh());

    this.refresh();
  }

  refresh(): void {
    const selectedId = this.editor.getSelection().getSelectedId();

    if (!selectedId) {
      this.renderHotspotList();
      return;
    }

    const hotspot = this.editor.getHotspot(selectedId);
    if (!hotspot) {
      this.renderHotspotList();
      return;
    }

    this.renderForm(hotspot);
  }

  private renderHotspotList(): void {
    this.panelEl.innerHTML = '';

    const title = createElement('div', 'ci-editor-panel-title');
    title.textContent = 'Hotspots';
    this.panelEl.appendChild(title);

    const hotspots = this.editor.getHotspotsRef();

    if (hotspots.length === 0) {
      const empty = createElement('div', 'ci-editor-panel-empty');
      empty.textContent = 'No hotspots yet. Use the Add tool to place hotspots on the image.';
      this.panelEl.appendChild(empty);
      return;
    }

    const list = createElement('ul', 'ci-editor-hotspot-list');
    for (const h of hotspots) {
      const item = createElement('li', 'ci-editor-hotspot-item');
      item.setAttribute('data-list-id', h.id);

      const label = createElement('span', 'ci-editor-hotspot-item-label');
      label.textContent = h.label || h.id;

      const coords = createElement('span', 'ci-editor-hotspot-item-coords');
      coords.textContent = `${this.fmtCoord(h.x)}, ${this.fmtCoord(h.y)}`;

      item.appendChild(label);
      item.appendChild(coords);

      item.addEventListener('click', () => {
        this.editor.getSelection().select(h.id);
      });

      list.appendChild(item);
    }
    this.panelEl.appendChild(list);
  }

  private renderForm(hotspot: HotspotItem): void {
    this.panelEl.innerHTML = '';
    this.fieldCounter = 0;

    const title = createElement('div', 'ci-editor-panel-title');
    title.textContent = `Edit: ${hotspot.label || hotspot.id}`;
    this.panelEl.appendChild(title);

    // Label
    this.panelEl.appendChild(
      this.createTextField('Label', hotspot.label || '', (val) => {
        this.editor.updateHotspot(hotspot.id, { label: val });
      }),
    );

    // Coordinates
    const coordRow = createElement('div', 'ci-editor-field-row');
    coordRow.appendChild(
      this.createTextField('X', String(hotspot.x), (val) => {
        this.editor.updateHotspot(hotspot.id, { x: val });
      }),
    );
    coordRow.appendChild(
      this.createTextField('Y', String(hotspot.y), (val) => {
        this.editor.updateHotspot(hotspot.id, { y: val });
      }),
    );
    this.panelEl.appendChild(coordRow);

    // Trigger
    this.panelEl.appendChild(
      this.createSelect('Trigger', hotspot.trigger || 'click', ['hover', 'click', 'load'], (val) => {
        this.editor.updateHotspot(hotspot.id, { trigger: val as HotspotItem['trigger'] });
      }),
    );

    // Placement
    this.panelEl.appendChild(
      this.createSelect(
        'Placement',
        hotspot.placement || 'top',
        ['top', 'bottom', 'left', 'right', 'auto'],
        (val) => {
          this.editor.updateHotspot(hotspot.id, { placement: val as HotspotItem['placement'] });
        },
      ),
    );

    // Data fields
    const data = hotspot.data || {};

    this.panelEl.appendChild(
      this.createTextField('Title', data.title || '', (val) => {
        this.editor.updateHotspot(hotspot.id, {
          data: { ...hotspot.data, title: val },
        });
      }),
    );

    this.panelEl.appendChild(
      this.createTextField('Price', data.price || '', (val) => {
        this.editor.updateHotspot(hotspot.id, {
          data: { ...hotspot.data, price: val },
        });
      }),
    );

    this.panelEl.appendChild(
      this.createTextArea('Description', data.description || '', (val) => {
        this.editor.updateHotspot(hotspot.id, {
          data: { ...hotspot.data, description: val },
        });
      }),
    );

    this.panelEl.appendChild(
      this.createTextField('Image URL', data.image || '', (val) => {
        this.editor.updateHotspot(hotspot.id, {
          data: { ...hotspot.data, image: val },
        });
      }),
    );

    this.panelEl.appendChild(
      this.createTextField('Link URL', data.url || '', (val) => {
        this.editor.updateHotspot(hotspot.id, {
          data: { ...hotspot.data, url: val },
        });
      }),
    );

    this.panelEl.appendChild(
      this.createTextField('CTA Text', data.ctaText || '', (val) => {
        this.editor.updateHotspot(hotspot.id, {
          data: { ...hotspot.data, ctaText: val },
        });
      }),
    );

    // Actions
    const actions = createElement('div', 'ci-editor-panel-actions');
    const deleteBtn = createElement('button', 'ci-editor-btn ci-editor-btn--danger');
    deleteBtn.textContent = 'Delete Hotspot';
    deleteBtn.addEventListener('click', () => this.editor.removeHotspot(hotspot.id));

    const backBtn = createElement('button', 'ci-editor-btn');
    backBtn.textContent = 'Back to List';
    backBtn.addEventListener('click', () => this.editor.getSelection().deselect());

    actions.appendChild(backBtn);
    actions.appendChild(deleteBtn);
    this.panelEl.appendChild(actions);
  }

  // === Field Builders ===

  private fieldCounter = 0;

  private nextFieldId(label: string): string {
    return `ci-editor-field-${label.toLowerCase().replace(/\s+/g, '-')}-${++this.fieldCounter}`;
  }

  private createTextField(
    label: string,
    value: string,
    onChange: (val: string) => void,
  ): HTMLElement {
    const id = this.nextFieldId(label);
    const field = createElement('div', 'ci-editor-field');
    const labelEl = createElement('label', '', { for: id });
    labelEl.textContent = label;
    const input = createElement('input', '', { id });
    input.type = 'text';
    input.value = value;
    input.addEventListener('change', () => onChange(input.value));
    field.appendChild(labelEl);
    field.appendChild(input);
    return field;
  }

  private createTextArea(
    label: string,
    value: string,
    onChange: (val: string) => void,
  ): HTMLElement {
    const id = this.nextFieldId(label);
    const field = createElement('div', 'ci-editor-field');
    const labelEl = createElement('label', '', { for: id });
    labelEl.textContent = label;
    const textarea = createElement('textarea', '', { id });
    textarea.value = value;
    textarea.addEventListener('change', () => onChange(textarea.value));
    field.appendChild(labelEl);
    field.appendChild(textarea);
    return field;
  }

  private createSelect(
    label: string,
    value: string,
    options: string[],
    onChange: (val: string) => void,
  ): HTMLElement {
    const id = this.nextFieldId(label);
    const field = createElement('div', 'ci-editor-field');
    const labelEl = createElement('label', '', { for: id });
    labelEl.textContent = label;
    const select = createElement('select', '', { id });
    for (const opt of options) {
      const option = createElement('option');
      option.value = opt;
      option.textContent = opt;
      if (opt === value) option.selected = true;
      select.appendChild(option);
    }
    select.addEventListener('change', () => onChange(select.value));
    field.appendChild(labelEl);
    field.appendChild(select);
    return field;
  }

  private fmtCoord(v: string | number): string {
    if (typeof v === 'string') return v;
    return `${Math.round(v * 100) / 100}%`;
  }
}
