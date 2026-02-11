import { describe, it, expect, beforeEach } from 'vitest';
import {
  isBrowser,
  getElement,
  createElement,
  addClass,
  removeClass,
  injectStyles,
} from '../src/utils/dom';

describe('isBrowser', () => {
  it('returns true in jsdom environment', () => {
    expect(isBrowser()).toBe(true);
  });
});

describe('getElement', () => {
  it('returns element when given HTMLElement', () => {
    const el = document.createElement('div');
    expect(getElement(el)).toBe(el);
  });

  it('finds element by selector', () => {
    const el = document.createElement('div');
    el.id = 'test-get-element';
    document.body.appendChild(el);
    expect(getElement('#test-get-element')).toBe(el);
    el.remove();
  });

  it('throws for non-existent selector', () => {
    expect(() => getElement('#nonexistent-xyz')).toThrow('not found');
  });
});

describe('createElement', () => {
  it('creates element with tag', () => {
    const el = createElement('div');
    expect(el.tagName).toBe('DIV');
  });

  it('applies className', () => {
    const el = createElement('span', 'test-class');
    expect(el.className).toBe('test-class');
  });

  it('applies attributes', () => {
    const el = createElement('button', undefined, {
      'aria-label': 'Test',
      'data-id': '123',
    });
    expect(el.getAttribute('aria-label')).toBe('Test');
    expect(el.getAttribute('data-id')).toBe('123');
  });
});

describe('addClass / removeClass', () => {
  it('adds and removes classes', () => {
    const el = document.createElement('div');
    addClass(el, 'a', 'b');
    expect(el.classList.contains('a')).toBe(true);
    expect(el.classList.contains('b')).toBe(true);

    removeClass(el, 'a');
    expect(el.classList.contains('a')).toBe(false);
    expect(el.classList.contains('b')).toBe(true);
  });
});

describe('injectStyles', () => {
  beforeEach(() => {
    document.getElementById('ci-hotspot-styles')?.remove();
  });

  it('injects style element into head', () => {
    injectStyles('.test { color: red; }');
    const style = document.getElementById('ci-hotspot-styles');
    expect(style).toBeTruthy();
    expect(style?.textContent).toContain('.test');
  });

  it('is idempotent — does not inject twice', () => {
    injectStyles('.test { color: red; }');
    injectStyles('.test { color: blue; }');
    const styles = document.querySelectorAll('#ci-hotspot-styles');
    expect(styles).toHaveLength(1);
    expect(styles[0].textContent).toContain('red');
  });
});
