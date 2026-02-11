import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ZoomPan } from '../src/zoom/zoom-pan';
import { createZoomControls } from '../src/zoom/controls';
import { ScrollHint } from '../src/zoom/scroll-hint';

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

describe('ZoomPan wheel gating', () => {
  let container: HTMLElement;
  let viewport: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    Object.defineProperty(container, 'offsetWidth', { value: 800, configurable: true });
    Object.defineProperty(container, 'offsetHeight', { value: 600, configurable: true });
    container.getBoundingClientRect = () =>
      ({ left: 0, top: 0, right: 800, bottom: 600, width: 800, height: 600, x: 0, y: 0, toJSON() {} }) as DOMRect;
    viewport = document.createElement('div');
    container.appendChild(viewport);
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it('regular wheel event (no ctrlKey) does NOT zoom and does NOT preventDefault', () => {
    const zoomPan = new ZoomPan(viewport, container, { zoomMin: 1, zoomMax: 4 });
    const event = new WheelEvent('wheel', {
      deltaY: -100,
      ctrlKey: false,
      bubbles: true,
      cancelable: true,
    });
    container.dispatchEvent(event);
    expect(zoomPan.getZoom()).toBe(1);
    expect(event.defaultPrevented).toBe(false);
    zoomPan.destroy();
  });

  it('wheel with ctrlKey zooms and calls preventDefault', () => {
    const zoomPan = new ZoomPan(viewport, container, { zoomMin: 1, zoomMax: 4 });
    const event = new WheelEvent('wheel', {
      deltaY: -100,
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
    });
    container.dispatchEvent(event);
    expect(zoomPan.getZoom()).toBeGreaterThan(1);
    expect(event.defaultPrevented).toBe(true);
    zoomPan.destroy();
  });

  it('proportional delta: larger deltaY = larger zoom change', () => {
    const zp1 = new ZoomPan(viewport, container, { zoomMin: 1, zoomMax: 4 });
    const zp2 = new ZoomPan(viewport, container, { zoomMin: 1, zoomMax: 4 });

    const smallEvent = new WheelEvent('wheel', {
      deltaY: -50,
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
    });
    container.dispatchEvent(smallEvent);
    const smallZoom = zp1.getZoom();

    zp1.destroy();

    // Need a fresh container for zp2 since both listen to the same container
    const container2 = document.createElement('div');
    Object.defineProperty(container2, 'offsetWidth', { value: 800, configurable: true });
    Object.defineProperty(container2, 'offsetHeight', { value: 600, configurable: true });
    container2.getBoundingClientRect = () =>
      ({ left: 0, top: 0, right: 800, bottom: 600, width: 800, height: 600, x: 0, y: 0, toJSON() {} }) as DOMRect;
    const viewport2 = document.createElement('div');
    container2.appendChild(viewport2);
    document.body.appendChild(container2);

    const zp3 = new ZoomPan(viewport2, container2, { zoomMin: 1, zoomMax: 4 });
    const bigEvent = new WheelEvent('wheel', {
      deltaY: -200,
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
    });
    container2.dispatchEvent(bigEvent);
    const bigZoom = zp3.getZoom();

    expect(bigZoom).toBeGreaterThan(smallZoom);

    zp2.destroy();
    zp3.destroy();
    container2.remove();
  });

  it('onScrollWithoutZoom callback fires on non-ctrl wheel events', () => {
    const cb = vi.fn();
    const zoomPan = new ZoomPan(viewport, container, {
      zoomMin: 1,
      zoomMax: 4,
      onScrollWithoutZoom: cb,
    });

    container.dispatchEvent(
      new WheelEvent('wheel', { deltaY: -100, ctrlKey: false, bubbles: true }),
    );
    expect(cb).toHaveBeenCalledTimes(1);
    zoomPan.destroy();
  });

  it('disabled state: no zoom even with ctrlKey', () => {
    const zoomPan = new ZoomPan(viewport, container, { zoomMin: 1, zoomMax: 4 });
    zoomPan.disable();
    container.dispatchEvent(
      new WheelEvent('wheel', {
        deltaY: -100,
        ctrlKey: true,
        bubbles: true,
        cancelable: true,
      }),
    );
    expect(zoomPan.getZoom()).toBe(1);
    zoomPan.destroy();
  });
});

describe('ScrollHint', () => {
  let parent: HTMLElement;

  beforeEach(() => {
    parent = document.createElement('div');
    document.body.appendChild(parent);
  });

  afterEach(() => {
    parent.remove();
  });

  it('creates the hint element in parent', () => {
    const hint = new ScrollHint(parent);
    const el = parent.querySelector('.ci-hotspot-scroll-hint');
    expect(el).toBeTruthy();
    expect(el?.getAttribute('aria-hidden')).toBe('true');
    hint.destroy();
  });

  it('show adds visible class', () => {
    const hint = new ScrollHint(parent);
    hint.show();
    const el = parent.querySelector('.ci-hotspot-scroll-hint');
    expect(el?.classList.contains('ci-hotspot-scroll-hint--visible')).toBe(true);
    hint.destroy();
  });

  it('auto-hides after timeout', async () => {
    vi.useFakeTimers();
    const hint = new ScrollHint(parent);
    hint.show();
    const el = parent.querySelector('.ci-hotspot-scroll-hint')!;
    expect(el.classList.contains('ci-hotspot-scroll-hint--visible')).toBe(true);
    vi.advanceTimersByTime(1500);
    expect(el.classList.contains('ci-hotspot-scroll-hint--visible')).toBe(false);
    hint.destroy();
    vi.useRealTimers();
  });

  it('destroy removes element from DOM', () => {
    const hint = new ScrollHint(parent);
    expect(parent.querySelector('.ci-hotspot-scroll-hint')).toBeTruthy();
    hint.destroy();
    expect(parent.querySelector('.ci-hotspot-scroll-hint')).toBeNull();
  });
});
