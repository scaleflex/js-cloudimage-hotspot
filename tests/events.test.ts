import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EventEmitter, addListener } from '../src/utils/events';

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

