import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ZoomPan } from '../src/zoom/ZoomPan';
import { createZoomControls } from '../src/zoom/controls';

describe('ZoomPan', () => {
  let container: HTMLElement;
  let viewport: HTMLElement;
  let zoomPan: ZoomPan;

  beforeEach(() => {
    container = document.createElement('div');
    Object.defineProperty(container, 'offsetWidth', { value: 800, configurable: true });
    Object.defineProperty(container, 'offsetHeight', { value: 600, configurable: true });
    viewport = document.createElement('div');
    container.appendChild(viewport);
    document.body.appendChild(container);
    zoomPan = new ZoomPan(viewport, container, { zoomMin: 1, zoomMax: 4 });
  });

  afterEach(() => {
    zoomPan.destroy();
    container.remove();
  });

  it('starts at zoom level 1', () => {
    expect(zoomPan.getZoom()).toBe(1);
  });

  it('setZoom applies zoom level', () => {
    zoomPan.setZoom(2);
    expect(zoomPan.getZoom()).toBe(2);
    expect(viewport.style.transform).toContain('scale(2)');
  });

  it('clamps zoom to max', () => {
    zoomPan.setZoom(5);
    expect(zoomPan.getZoom()).toBe(4);
  });

  it('clamps zoom to min', () => {
    zoomPan.setZoom(0.5);
    expect(zoomPan.getZoom()).toBe(1);
  });

  it('resetZoom returns to 1', () => {
    zoomPan.setZoom(3);
    zoomPan.resetZoom();
    expect(zoomPan.getZoom()).toBe(1);
    expect(viewport.style.transform).toContain('scale(1)');
  });

  it('sets --zoom CSS variable', () => {
    zoomPan.setZoom(2);
    expect(viewport.style.getPropertyValue('--zoom')).toBe('2');
  });

  it('pan does nothing at zoom=1', () => {
    const transformBefore = viewport.style.transform;
    zoomPan.pan(100, 100);
    // At zoom 1, pan is a no-op — transform doesn't change
    expect(viewport.style.transform).toBe(transformBefore);
  });

  it('pan works when zoomed', () => {
    zoomPan.setZoom(2);
    zoomPan.pan(50, 30);
    expect(viewport.style.transform).toContain('translate(');
    // The exact values depend on clamping, but transform should include non-zero pan
  });

  it('destroy cleans up', () => {
    zoomPan.setZoom(2);
    zoomPan.destroy();
    expect(viewport.style.transform).toBe('');
    expect(viewport.style.getPropertyValue('--zoom')).toBe('');
  });
});

describe('createZoomControls', () => {
  let container: HTMLElement;
  let viewport: HTMLElement;
  let zoomPan: ZoomPan;

  beforeEach(() => {
    container = document.createElement('div');
    Object.defineProperty(container, 'offsetWidth', { value: 800, configurable: true });
    Object.defineProperty(container, 'offsetHeight', { value: 600, configurable: true });
    viewport = document.createElement('div');
    container.appendChild(viewport);
    document.body.appendChild(container);
    zoomPan = new ZoomPan(viewport, container, { zoomMin: 1, zoomMax: 4 });
  });

  afterEach(() => {
    zoomPan.destroy();
    container.remove();
  });

  it('creates zoom controls with three buttons', () => {
    const controls = createZoomControls(container, zoomPan, { zoomMin: 1, zoomMax: 4 });
    const buttons = controls.element.querySelectorAll('button');
    expect(buttons).toHaveLength(3);
    controls.destroy();
  });

  it('buttons have aria-labels', () => {
    const controls = createZoomControls(container, zoomPan, { zoomMin: 1, zoomMax: 4 });
    const zoomIn = controls.element.querySelector('.ci-hotspot-zoom-in');
    const zoomOut = controls.element.querySelector('.ci-hotspot-zoom-out');
    const reset = controls.element.querySelector('.ci-hotspot-zoom-reset');
    expect(zoomIn?.getAttribute('aria-label')).toBe('Zoom in');
    expect(zoomOut?.getAttribute('aria-label')).toBe('Zoom out');
    expect(reset?.getAttribute('aria-label')).toBe('Reset zoom');
    controls.destroy();
  });

  it('zoom out is disabled at min zoom', () => {
    const controls = createZoomControls(container, zoomPan, { zoomMin: 1, zoomMax: 4 });
    const zoomOut = controls.element.querySelector('.ci-hotspot-zoom-out') as HTMLButtonElement;
    expect(zoomOut.disabled).toBe(true);
    controls.destroy();
  });

  it('reset is disabled at zoom=1', () => {
    const controls = createZoomControls(container, zoomPan, { zoomMin: 1, zoomMax: 4 });
    const reset = controls.element.querySelector('.ci-hotspot-zoom-reset') as HTMLButtonElement;
    expect(reset.disabled).toBe(true);
    controls.destroy();
  });

  it('destroy removes controls from DOM', () => {
    const controls = createZoomControls(container, zoomPan, { zoomMin: 1, zoomMax: 4 });
    expect(container.querySelector('.ci-hotspot-zoom-controls')).toBeTruthy();
    controls.destroy();
    expect(container.querySelector('.ci-hotspot-zoom-controls')).toBeNull();
  });
});
