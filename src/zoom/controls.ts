import { createElement } from '../utils/dom';
import type { ZoomPan } from './zoom-pan';

export interface ZoomControlsOptions {
  zoomMin: number;
  zoomMax: number;
  zoomStep?: number;
  position?: string;
}

/** Create zoom controls UI (+/−/reset) */
export function createZoomControls(
  container: HTMLElement,
  zoomPan: ZoomPan,
  options: ZoomControlsOptions,
): { element: HTMLElement; update: () => void; destroy: () => void } {
  const step = options.zoomStep || 0.5;
  const controls = createElement('div', 'ci-hotspot-zoom-controls');
  controls.dataset.position = options.position || 'bottom-right';

  const btnIn = createElement('button', 'ci-hotspot-zoom-in', {
    'aria-label': 'Zoom in',
    'type': 'button',
  });
  btnIn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/><line x1="11" x2="11" y1="8" y2="14"/><line x1="8" x2="14" y1="11" y2="11"/></svg>';

  const btnOut = createElement('button', 'ci-hotspot-zoom-out', {
    'aria-label': 'Zoom out',
    'type': 'button',
  });
  btnOut.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/><line x1="8" x2="14" y1="11" y2="11"/></svg>';

  const btnReset = createElement('button', 'ci-hotspot-zoom-reset', {
    'aria-label': 'Reset zoom',
    'type': 'button',
  });
  btnReset.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>';

  controls.appendChild(btnIn);
  controls.appendChild(btnOut);
  controls.appendChild(btnReset);

  btnIn.addEventListener('click', (e) => {
    e.stopPropagation();
    zoomPan.setZoom(zoomPan.getZoom() + step);
    updateState();
  });

  btnOut.addEventListener('click', (e) => {
    e.stopPropagation();
    zoomPan.setZoom(zoomPan.getZoom() - step);
    updateState();
  });

  btnReset.addEventListener('click', (e) => {
    e.stopPropagation();
    zoomPan.resetZoom();
    updateState();
  });

  function updateState(): void {
    const zoom = zoomPan.getZoom();
    btnIn.disabled = zoom >= options.zoomMax;
    btnOut.disabled = zoom <= options.zoomMin;
    btnReset.disabled = Math.abs(zoom - 1) < 0.001;
  }

  container.appendChild(controls);
  updateState();

  return {
    element: controls,
    update: updateState,
    destroy: () => controls.remove(),
  };
}
