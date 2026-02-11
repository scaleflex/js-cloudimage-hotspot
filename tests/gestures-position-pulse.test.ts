import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GestureRecognizer } from '../src/zoom/gestures';
import { computePosition } from '../src/popover/position';

// ---------------------------------------------------------------------------
// Helpers for touch event simulation in jsdom
// ---------------------------------------------------------------------------

function makeTouchObj(
  target: EventTarget,
  x: number,
  y: number,
): Touch {
  return {
    identifier: Math.floor(Math.random() * 100000),
    target,
    clientX: x,
    clientY: y,
    pageX: x,
    pageY: y,
    screenX: x,
    screenY: y,
    radiusX: 1,
    radiusY: 1,
    rotationAngle: 0,
    force: 1,
  } as Touch;
}

function makeTouchList(touches: Touch[]): TouchList {
  const list = Object.create(null) as TouchList;
  touches.forEach((t, i) => {
    (list as Record<number, Touch>)[i] = t;
  });
  Object.defineProperty(list, 'length', { value: touches.length, writable: false });
  (list as { item: (i: number) => Touch | null }).item = (i: number) => touches[i] ?? null;
  return list;
}

function dispatchTouch(
  el: HTMLElement,
  type: string,
  touches: Touch[],
  changedTouches?: Touch[],
): Event {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.defineProperty(event, 'touches', { value: makeTouchList(touches) });
  Object.defineProperty(event, 'changedTouches', {
    value: makeTouchList(changedTouches ?? touches),
  });
  el.dispatchEvent(event);
  return event;
}

// ---------------------------------------------------------------------------
// 1. GestureRecognizer
// ---------------------------------------------------------------------------

describe('GestureRecognizer', () => {
  let el: HTMLElement;

  beforeEach(() => {
    el = document.createElement('div');
    document.body.appendChild(el);
  });

  afterEach(() => {
    el.remove();
  });

  it('pan gesture fires onPan with correct dx/dy', () => {
    const onPan = vi.fn();
    const gr = new GestureRecognizer(el, { onPan }, () => 1);

    const t1 = makeTouchObj(el, 100, 200);
    dispatchTouch(el, 'touchstart', [t1]);

    const t2 = makeTouchObj(el, 130, 210);
    Object.defineProperty(t2, 'identifier', { value: t1.identifier });
    dispatchTouch(el, 'touchmove', [t2]);

    expect(onPan).toHaveBeenCalledTimes(1);
    expect(onPan).toHaveBeenCalledWith(30, 10);

    gr.destroy();
  });

  it('pinch gesture fires onPinch with correct scale and center', () => {
    const onPinch = vi.fn();
    const gr = new GestureRecognizer(el, { onPinch }, () => 1);

    // Two-finger touch start: distance = sqrt((200-100)^2 + (200-200)^2) = 100
    const t1a = makeTouchObj(el, 100, 200);
    const t1b = makeTouchObj(el, 200, 200);
    dispatchTouch(el, 'touchstart', [t1a, t1b]);

    // Two-finger touch move: distance = sqrt((250-50)^2 + (200-200)^2) = 200
    // scale = 1 * (200 / 100) = 2, center = (150, 200)
    const t2a = makeTouchObj(el, 50, 200);
    const t2b = makeTouchObj(el, 250, 200);
    dispatchTouch(el, 'touchmove', [t2a, t2b]);

    expect(onPinch).toHaveBeenCalledTimes(1);
    expect(onPinch).toHaveBeenCalledWith(2, 150, 200);

    gr.destroy();
  });

  it('double-tap fires onDoubleTap with correct coordinates', () => {
    vi.useFakeTimers();
    const onDoubleTap = vi.fn();
    const gr = new GestureRecognizer(el, { onDoubleTap }, () => 1);

    const t1 = makeTouchObj(el, 120, 80);
    // First tap: start -> end
    dispatchTouch(el, 'touchstart', [t1]);
    dispatchTouch(el, 'touchend', [], [t1]);

    // Advance less than 300ms
    vi.advanceTimersByTime(100);

    // Second tap: start -> end
    const t2 = makeTouchObj(el, 120, 80);
    dispatchTouch(el, 'touchstart', [t2]);
    dispatchTouch(el, 'touchend', [], [t2]);

    expect(onDoubleTap).toHaveBeenCalledTimes(1);
    expect(onDoubleTap).toHaveBeenCalledWith(120, 80);

    gr.destroy();
    vi.useRealTimers();
  });

  it('single tap does NOT fire onDoubleTap', () => {
    vi.useFakeTimers();
    const onDoubleTap = vi.fn();
    const gr = new GestureRecognizer(el, { onDoubleTap }, () => 1);

    const t1 = makeTouchObj(el, 100, 100);
    dispatchTouch(el, 'touchstart', [t1]);
    dispatchTouch(el, 'touchend', [], [t1]);

    // Wait well past the 300ms window
    vi.advanceTimersByTime(500);

    expect(onDoubleTap).not.toHaveBeenCalled();

    gr.destroy();
    vi.useRealTimers();
  });

  it('destroy() removes all listeners — no callbacks after destroy', () => {
    const onPan = vi.fn();
    const onDoubleTap = vi.fn();
    const gr = new GestureRecognizer(el, { onPan, onDoubleTap }, () => 1);
    gr.destroy();

    const t1 = makeTouchObj(el, 100, 100);
    dispatchTouch(el, 'touchstart', [t1]);

    const t2 = makeTouchObj(el, 150, 150);
    dispatchTouch(el, 'touchmove', [t2]);

    dispatchTouch(el, 'touchend', [], [t2]);

    expect(onPan).not.toHaveBeenCalled();
    expect(onDoubleTap).not.toHaveBeenCalled();
  });

  it('does not throw when callback is not provided', () => {
    const gr = new GestureRecognizer(el, {}, () => 1);

    const t1 = makeTouchObj(el, 100, 100);
    expect(() => {
      dispatchTouch(el, 'touchstart', [t1]);
      const t2 = makeTouchObj(el, 130, 130);
      dispatchTouch(el, 'touchmove', [t2]);
      dispatchTouch(el, 'touchend', [], [t2]);
    }).not.toThrow();

    gr.destroy();
  });
});

// ---------------------------------------------------------------------------
// 2. computePosition
// ---------------------------------------------------------------------------

describe('computePosition', () => {
  let containerEl: HTMLElement;
  let markerEl: HTMLElement;
  let popoverEl: HTMLElement;

  function setupRects(opts: {
    containerLeft?: number;
    containerTop?: number;
    containerWidth?: number;
    containerHeight?: number;
    markerLeft?: number;
    markerTop?: number;
    markerWidth?: number;
    markerHeight?: number;
    popoverWidth?: number;
    popoverHeight?: number;
  }): void {
    const cw = opts.containerWidth ?? 800;
    const ch = opts.containerHeight ?? 600;
    const cl = opts.containerLeft ?? 0;
    const ct = opts.containerTop ?? 0;

    const ml = opts.markerLeft ?? 400;
    const mt = opts.markerTop ?? 300;
    const mw = opts.markerWidth ?? 20;
    const mh = opts.markerHeight ?? 20;

    const pw = opts.popoverWidth ?? 200;
    const ph = opts.popoverHeight ?? 100;

    containerEl.getBoundingClientRect = () =>
      ({
        left: cl, top: ct, right: cl + cw, bottom: ct + ch,
        width: cw, height: ch, x: cl, y: ct, toJSON() {},
      }) as DOMRect;
    Object.defineProperty(containerEl, 'offsetWidth', { value: cw, configurable: true });
    Object.defineProperty(containerEl, 'offsetHeight', { value: ch, configurable: true });

    markerEl.getBoundingClientRect = () =>
      ({
        left: ml, top: mt, right: ml + mw, bottom: mt + mh,
        width: mw, height: mh, x: ml, y: mt, toJSON() {},
      }) as DOMRect;

    Object.defineProperty(popoverEl, 'offsetWidth', { value: pw, configurable: true });
    Object.defineProperty(popoverEl, 'offsetHeight', { value: ph, configurable: true });
  }

  beforeEach(() => {
    containerEl = document.createElement('div');
    markerEl = document.createElement('div');
    popoverEl = document.createElement('div');
    containerEl.appendChild(markerEl);
    containerEl.appendChild(popoverEl);
    document.body.appendChild(containerEl);
  });

  afterEach(() => {
    containerEl.remove();
  });

  it('top placement positions popover above marker', () => {
    // Marker at center of 800x600 container
    setupRects({
      containerWidth: 800, containerHeight: 600,
      markerLeft: 390, markerTop: 300, markerWidth: 20, markerHeight: 20,
      popoverWidth: 200, popoverHeight: 100,
    });

    const result = computePosition(markerEl, popoverEl, containerEl, { placement: 'top' });

    expect(result.placement).toBe('top');
    // y should be above marker top (300 - 8 gap - 100 height = 192)
    expect(result.y).toBe(192);
  });

  it('bottom placement positions popover below marker', () => {
    setupRects({
      containerWidth: 800, containerHeight: 600,
      markerLeft: 390, markerTop: 300, markerWidth: 20, markerHeight: 20,
      popoverWidth: 200, popoverHeight: 100,
    });

    const result = computePosition(markerEl, popoverEl, containerEl, { placement: 'bottom' });

    expect(result.placement).toBe('bottom');
    // y should be below marker bottom (320 + 8 gap = 328)
    expect(result.y).toBe(328);
  });

  it('left placement positions popover to the left of marker', () => {
    setupRects({
      containerWidth: 800, containerHeight: 600,
      markerLeft: 400, markerTop: 290, markerWidth: 20, markerHeight: 20,
      popoverWidth: 200, popoverHeight: 100,
    });

    const result = computePosition(markerEl, popoverEl, containerEl, { placement: 'left' });

    expect(result.placement).toBe('left');
    // x should be to the left of marker: 400 - 8 gap - 200 width = 192
    expect(result.x).toBe(192);
  });

  it('right placement positions popover to the right of marker', () => {
    setupRects({
      containerWidth: 800, containerHeight: 600,
      markerLeft: 400, markerTop: 290, markerWidth: 20, markerHeight: 20,
      popoverWidth: 200, popoverHeight: 100,
    });

    const result = computePosition(markerEl, popoverEl, containerEl, { placement: 'right' });

    expect(result.placement).toBe('right');
    // x should be to the right of marker: 420 + 8 gap = 428
    expect(result.x).toBe(428);
  });

  it('auto placement picks side with most space', () => {
    // Marker near top-left corner => most space is bottom and right
    // space.bottom will be largest
    setupRects({
      containerWidth: 800, containerHeight: 600,
      markerLeft: 50, markerTop: 30, markerWidth: 20, markerHeight: 20,
      popoverWidth: 100, popoverHeight: 60,
    });

    const result = computePosition(markerEl, popoverEl, containerEl, { placement: 'auto' });

    // space.top = 30 - 8 = 22, space.bottom = 600 - 50 - 8 = 542,
    // space.left = 50 - 8 = 42, space.right = 800 - 70 - 8 = 722
    // max is space.right = 722 => but getAutoPlacement checks bottom first (top, bottom, right, left)
    // Actually: max = 722 (right). The function checks:
    //   if max === top (22 !== 722) => no
    //   if max === bottom (542 !== 722) => no
    //   if max === right (722 === 722) => yes => 'right'
    expect(result.placement).toBe('right');
  });

  it('flips placement when not enough space', () => {
    // Marker near top — not enough space above for popover, should flip to bottom
    setupRects({
      containerWidth: 800, containerHeight: 600,
      markerLeft: 390, markerTop: 30, markerWidth: 20, markerHeight: 20,
      popoverWidth: 200, popoverHeight: 100,
    });

    const result = computePosition(markerEl, popoverEl, containerEl, { placement: 'top' });

    // space.top = 30 - 8 = 22, which is < popoverHeight (100)
    // space.bottom = 600 - 50 - 8 = 542, which is > space.top
    // So it flips to 'bottom'
    expect(result.placement).toBe('bottom');
  });

  it('shift keeps popover within container bounds', () => {
    // Marker near the right edge — popover would overflow right
    setupRects({
      containerWidth: 800, containerHeight: 600,
      markerLeft: 750, markerTop: 300, markerWidth: 20, markerHeight: 20,
      popoverWidth: 200, popoverHeight: 100,
    });

    const result = computePosition(markerEl, popoverEl, containerEl, { placement: 'top' });

    // Without shift: x = (760 - 0) + 10 - 100 = 660
    // 660 + 200 = 860 > 800 - 4 (padding) = 796 => shifted to x = 596
    const padding = 4;
    expect(result.x + 200).toBeLessThanOrEqual(800 - padding);
    expect(result.x).toBeGreaterThanOrEqual(padding);
  });

  it('computes arrow offset when shifted', () => {
    // Marker near the right edge so popover must be shifted left
    setupRects({
      containerWidth: 800, containerHeight: 600,
      markerLeft: 750, markerTop: 300, markerWidth: 20, markerHeight: 20,
      popoverWidth: 200, popoverHeight: 100,
    });

    const result = computePosition(markerEl, popoverEl, containerEl, { placement: 'top' });

    // For top/bottom placement: arrowOffset = original_x - shifted_x
    // markerCenterX = 750 + 10 = 760, original_x = 760 - 100 = 660
    // shifted_x = 800 - 4 - 200 = 596
    // arrowOffset = 660 - 596 = 64
    expect(result.arrowOffset).toBe(64);
  });
});

