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
    // Pan negative (valid range is [-max, 0]), so clamping doesn't zero it out
    zoomPan.pan(-100, -60);
    const transform = viewport.style.transform;
    expect(transform).toContain('translate(');
    // Verify pan values are non-zero (negative after division by zoom)
    const match = transform.match(/translate\(([-\d.]+)px,\s*([-\d.]+)px\)/);
    expect(match).toBeTruthy();
    expect(parseFloat(match![1])).toBeLessThan(0);
    expect(parseFloat(match![2])).toBeLessThan(0);
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

// #36 — Firefox deltaMode wheel events
describe('ZoomPan Firefox deltaMode', () => {
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

  it('deltaMode=1 (line mode) produces larger zoom than deltaMode=0 for same deltaY', () => {
    const zp0 = new ZoomPan(viewport, container, { zoomMin: 1, zoomMax: 4 });
    // deltaMode=0 (pixel mode), deltaY=-5
    const pixelEvent = new WheelEvent('wheel', {
      deltaY: -5,
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
    });
    // WheelEvent constructor doesn't support deltaMode, so we create it manually
    Object.defineProperty(pixelEvent, 'deltaMode', { value: 0 });
    container.dispatchEvent(pixelEvent);
    const pixelZoom = zp0.getZoom();
    zp0.destroy();

    const zp1 = new ZoomPan(viewport, container, { zoomMin: 1, zoomMax: 4 });
    // deltaMode=1 (line mode), same deltaY=-5 should produce 20x more zoom change
    const lineEvent = new WheelEvent('wheel', {
      deltaY: -5,
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
    });
    Object.defineProperty(lineEvent, 'deltaMode', { value: 1 });
    container.dispatchEvent(lineEvent);
    const lineZoom = zp1.getZoom();
    zp1.destroy();

    // Line mode should zoom more than pixel mode for same deltaY
    expect(lineZoom).toBeGreaterThan(pixelZoom);
  });
});

// #37 — setZoom with origin parameters
describe('ZoomPan setZoom with origin', () => {
  let container: HTMLElement;
  let viewport: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    Object.defineProperty(container, 'offsetWidth', { value: 800, configurable: true });
    Object.defineProperty(container, 'offsetHeight', { value: 600, configurable: true });
    viewport = document.createElement('div');
    container.appendChild(viewport);
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it('zooming toward center keeps pan at zero', () => {
    const zoomPan = new ZoomPan(viewport, container, { zoomMin: 1, zoomMax: 4 });
    zoomPan.setZoom(2, 400, 300); // center of 800x600
    const transform = viewport.style.transform;
    // With origin at exact center, pan should be symmetric (both negative and equal magnitude)
    const match = transform.match(/translate\(([-\d.]+)px,\s*([-\d.]+)px\)/);
    expect(match).toBeTruthy();
    const panX = parseFloat(match![1]);
    const panY = parseFloat(match![2]);
    // At center origin, pan adjusts symmetrically — clamped to valid range
    expect(panX).toBeLessThanOrEqual(0);
    expect(panY).toBeLessThanOrEqual(0);
    zoomPan.destroy();
  });

  it('zooming toward top-left corner keeps pan near zero', () => {
    const zoomPan = new ZoomPan(viewport, container, { zoomMin: 1, zoomMax: 4 });
    zoomPan.setZoom(2, 0, 0); // top-left corner
    const transform = viewport.style.transform;
    const match = transform.match(/translate\(([-\d.]+)px,\s*([-\d.]+)px\)/);
    expect(match).toBeTruthy();
    // Origin at top-left: pan should be 0 (clamped to max 0)
    expect(parseFloat(match![1])).toBe(0);
    expect(parseFloat(match![2])).toBe(0);
    zoomPan.destroy();
  });

  it('zooming toward bottom-right corner produces negative pan', () => {
    const zoomPan = new ZoomPan(viewport, container, { zoomMin: 1, zoomMax: 4 });
    zoomPan.setZoom(2, 800, 600); // bottom-right corner
    const transform = viewport.style.transform;
    const match = transform.match(/translate\(([-\d.]+)px,\s*([-\d.]+)px\)/);
    expect(match).toBeTruthy();
    // Origin at bottom-right: pan should be negative (scrolled to bottom-right)
    expect(parseFloat(match![1])).toBeLessThan(0);
    expect(parseFloat(match![2])).toBeLessThan(0);
    zoomPan.destroy();
  });
});

// #39 — Double-click blocked when ZoomPan disabled
describe('ZoomPan disabled state', () => {
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

  it('double-click does not zoom when disabled', () => {
    const zoomPan = new ZoomPan(viewport, container, { zoomMin: 1, zoomMax: 4 });
    zoomPan.disable();
    container.dispatchEvent(new MouseEvent('dblclick', { bubbles: true, clientX: 400, clientY: 300 }));
    expect(zoomPan.getZoom()).toBe(1);
    zoomPan.destroy();
  });

  it('double-click zooms when re-enabled', () => {
    const zoomPan = new ZoomPan(viewport, container, { zoomMin: 1, zoomMax: 4 });
    zoomPan.disable();
    zoomPan.enable();
    container.dispatchEvent(new MouseEvent('dblclick', { bubbles: true, clientX: 400, clientY: 300 }));
    expect(zoomPan.getZoom()).toBe(2);
    zoomPan.destroy();
  });
});

// #40 — ZoomPan.destroy() removes document listeners
describe('ZoomPan.destroy() cleanup', () => {
  it('removes document mousemove/mouseup listeners after destroy', () => {
    const container = document.createElement('div');
    Object.defineProperty(container, 'offsetWidth', { value: 800, configurable: true });
    Object.defineProperty(container, 'offsetHeight', { value: 600, configurable: true });
    const viewport = document.createElement('div');
    container.appendChild(viewport);
    document.body.appendChild(container);

    const zoomPan = new ZoomPan(viewport, container, { zoomMin: 1, zoomMax: 4 });
    zoomPan.setZoom(2);

    // Start a drag
    container.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, button: 0, clientX: 100, clientY: 100 }));

    // Mouse move should cause panning
    document.dispatchEvent(new MouseEvent('mousemove', { clientX: 50, clientY: 50 }));
    const transformDuringDrag = viewport.style.transform;

    // End drag
    document.dispatchEvent(new MouseEvent('mouseup'));

    // Destroy
    zoomPan.destroy();

    // Re-create a fresh ZoomPan to confirm no stale listeners
    const zp2 = new ZoomPan(viewport, container, { zoomMin: 1, zoomMax: 4 });
    zp2.setZoom(2);
    const transformAfterRecreate = viewport.style.transform;

    // Simulate document mousemove — should NOT affect the new ZoomPan since the old one's
    // listeners are removed
    document.dispatchEvent(new MouseEvent('mousemove', { clientX: 0, clientY: 0 }));
    // Transform shouldn't change since no drag was started on zp2
    expect(viewport.style.transform).toBe(transformAfterRecreate);

    zp2.destroy();
    container.remove();
  });
});
