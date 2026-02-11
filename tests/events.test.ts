import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EventEmitter, addListener, debounce, throttle } from '../src/utils/events';

describe('EventEmitter', () => {
  let emitter: EventEmitter;

  beforeEach(() => {
    emitter = new EventEmitter();
  });

  it('registers and fires event handlers', () => {
    const handler = vi.fn();
    emitter.on('test', handler);
    emitter.emit('test', 'arg1', 'arg2');
    expect(handler).toHaveBeenCalledWith('arg1', 'arg2');
  });

  it('supports multiple handlers for same event', () => {
    const handler1 = vi.fn();
    const handler2 = vi.fn();
    emitter.on('test', handler1);
    emitter.on('test', handler2);
    emitter.emit('test');
    expect(handler1).toHaveBeenCalled();
    expect(handler2).toHaveBeenCalled();
  });

  it('removes specific handler with off()', () => {
    const handler = vi.fn();
    emitter.on('test', handler);
    emitter.off('test', handler);
    emitter.emit('test');
    expect(handler).not.toHaveBeenCalled();
  });

  it('once() fires handler only once', () => {
    const handler = vi.fn();
    emitter.once('test', handler);
    emitter.emit('test');
    emitter.emit('test');
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('removeAll() clears all handlers', () => {
    const handler = vi.fn();
    emitter.on('test', handler);
    emitter.on('other', handler);
    emitter.removeAll();
    emitter.emit('test');
    emitter.emit('other');
    expect(handler).not.toHaveBeenCalled();
  });

  it('emitting unregistered event does nothing', () => {
    expect(() => emitter.emit('nonexistent')).not.toThrow();
  });
});

describe('addListener', () => {
  it('returns cleanup function that removes listener', () => {
    const el = document.createElement('div');
    const handler = vi.fn();
    const cleanup = addListener(el, 'click', handler);

    el.click();
    expect(handler).toHaveBeenCalledTimes(1);

    cleanup();
    el.click();
    expect(handler).toHaveBeenCalledTimes(1);
  });
});

describe('debounce', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('delays execution', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced();
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('resets timer on subsequent calls', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced();
    vi.advanceTimersByTime(50);
    debounced();
    vi.advanceTimersByTime(50);
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(50);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('cancel() prevents execution', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced();
    debounced.cancel();
    vi.advanceTimersByTime(200);
    expect(fn).not.toHaveBeenCalled();
  });
});

describe('throttle', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('executes immediately on first call', () => {
    const fn = vi.fn();
    const throttled = throttle(fn, 100);

    throttled();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('throttles subsequent calls', () => {
    const fn = vi.fn();
    const throttled = throttle(fn, 100);

    throttled();
    throttled();
    throttled();
    expect(fn).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('cancel() prevents pending execution', () => {
    const fn = vi.fn();
    const throttled = throttle(fn, 100);

    throttled();
    throttled();
    throttled.cancel();
    vi.advanceTimersByTime(200);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
