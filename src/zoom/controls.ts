import { createElement } from '../utils/dom';
import type { ZoomPan } from './ZoomPan';

export interface ZoomControlsOptions {
  zoomMin: number;
  zoomMax: number;
  zoomStep?: number;
}

/** Create zoom controls UI (+/−/reset) */
export function createZoomControls(
  container: HTMLElement,
  zoomPan: ZoomPan,
  options: ZoomControlsOptions,
): { element: HTMLElement; update: () => void; destroy: () => void } {
  const step = options.zoomStep || 0.5;
  const controls = createElement('div', 'ci-hotspot-zoom-controls');

  const btnIn = createElement('button', 'ci-hotspot-zoom-in', {
    'aria-label': 'Zoom in',
    'type': 'button',
  });
  btnIn.textContent = '+';

  const btnOut = createElement('button', 'ci-hotspot-zoom-out', {
    'aria-label': 'Zoom out',
    'type': 'button',
  });
  btnOut.textContent = '−';

  const btnReset = createElement('button', 'ci-hotspot-zoom-reset', {
    'aria-label': 'Reset zoom',
    'type': 'button',
  });
  btnReset.textContent = '⟲';

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
    btnReset.disabled = zoom === 1;
  }

  container.appendChild(controls);
  updateState();

  return {
    element: controls,
    update: updateState,
    destroy: () => controls.remove(),
  };
}
