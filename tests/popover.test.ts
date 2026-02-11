import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Popover } from '../src/popover/popover';
import { renderBuiltInTemplate, renderPopoverContent } from '../src/popover/template';
import type { HotspotItem } from '../src/core/types';

function makeHotspot(overrides?: Partial<HotspotItem>): HotspotItem {
  return {
    id: 'test-1',
    x: '50%',
    y: '50%',
    label: 'Test Hotspot',
    ...overrides,
  };
}

describe('renderBuiltInTemplate', () => {
  it('renders title only when provided', () => {
    const html = renderBuiltInTemplate({ title: 'Test Title' });
    expect(html).toContain('ci-hotspot-popover-title');
    expect(html).toContain('Test Title');
    expect(html).not.toContain('ci-hotspot-popover-price');
  });

  it('renders all fields when provided', () => {
    const html = renderBuiltInTemplate({
      title: 'Sofa',
      price: '$899',
      description: 'Comfortable sofa',
      image: 'https://example.com/sofa.jpg',
      url: 'https://example.com/sofa',
      ctaText: 'Buy now',
    });
    expect(html).toContain('Sofa');
    expect(html).toContain('$899');
    expect(html).toContain('Comfortable sofa');
    expect(html).toContain('sofa.jpg');
    expect(html).toContain('Buy now');
    expect(html).toContain('https://example.com/sofa');
  });

  it('uses default CTA text', () => {
    const html = renderBuiltInTemplate({ url: 'https://example.com' });
    expect(html).toContain('View details');
  });

  it('omits image when not provided', () => {
    const html = renderBuiltInTemplate({ title: 'Test' });
    expect(html).not.toContain('ci-hotspot-popover-image');
  });

  it('omits CTA when no url', () => {
    const html = renderBuiltInTemplate({ title: 'Test' });
    expect(html).not.toContain('ci-hotspot-popover-cta');
  });

  it('returns empty for empty data', () => {
    const html = renderBuiltInTemplate({});
    expect(html).toBe('');
  });
});

describe('renderPopoverContent', () => {
  it('uses renderFn when provided', () => {
    const hotspot = makeHotspot();
    const renderFn = () => '<div>Custom</div>';
    const result = renderPopoverContent(hotspot, renderFn);
    expect(result).toBe('<div>Custom</div>');
  });

  it('uses content string when no renderFn', () => {
    const hotspot = makeHotspot({ content: '<p>Hello</p>' });
    const result = renderPopoverContent(hotspot);
    expect(result).toContain('<p>Hello</p>');
  });

  it('sanitizes content string', () => {
    const hotspot = makeHotspot({ content: '<p>safe</p><script>alert(1)</script>' });
    const result = renderPopoverContent(hotspot);
    expect(result).not.toContain('script');
    expect(result).toContain('safe');
  });

  it('uses built-in template from data', () => {
    const hotspot = makeHotspot({ data: { title: 'Product', price: '$10' } });
    const result = renderPopoverContent(hotspot);
    expect(result).toContain('Product');
    expect(result).toContain('$10');
  });

  it('returns empty for no content', () => {
    const hotspot = makeHotspot();
    const result = renderPopoverContent(hotspot);
    expect(result).toBe('');
  });
});

describe('Popover class', () => {
  let container: HTMLElement;

  beforeEach(() => {
    vi.useFakeTimers();
    container = document.createElement('div');
    container.style.width = '800px';
    container.style.height = '600px';
    container.style.position = 'relative';
    document.body.appendChild(container);
  });

  afterEach(() => {
    vi.useRealTimers();
    container.remove();
  });

  it('creates popover element with correct structure', () => {
    const hotspot = makeHotspot({ data: { title: 'Test' } });
    const popover = new Popover(hotspot, {
      placement: 'top',
      triggerMode: 'hover',
    });
    expect(popover.element.classList.contains('ci-hotspot-popover')).toBe(true);
    expect(popover.element.getAttribute('role')).toBe('tooltip');
    expect(popover.element.getAttribute('aria-hidden')).toBe('true');
    expect(popover.element.querySelector('.ci-hotspot-popover-arrow')).toBeTruthy();
    expect(popover.element.querySelector('.ci-hotspot-popover-content')).toBeTruthy();
    popover.destroy();
  });

  it('sets correct id', () => {
    const hotspot = makeHotspot({ id: 'sofa-1' });
    const popover = new Popover(hotspot, { placement: 'top', triggerMode: 'click' });
    expect(popover.element.id).toBe('ci-hotspot-popover-sofa-1');
    popover.destroy();
  });

  it('show() and hide() toggle visibility', () => {
    const hotspot = makeHotspot({ data: { title: 'Test' } });
    const popover = new Popover(hotspot, { placement: 'top', triggerMode: 'click' });
    const marker = document.createElement('button');
    container.appendChild(marker);
    popover.mount(container, marker);

    expect(popover.isVisible()).toBe(false);
    popover.show();
    expect(popover.isVisible()).toBe(true);
    expect(popover.element.classList.contains('ci-hotspot-popover--visible')).toBe(true);
    expect(popover.element.getAttribute('aria-hidden')).toBe('false');

    popover.hide();
    expect(popover.isVisible()).toBe(false);
    expect(popover.element.classList.contains('ci-hotspot-popover--visible')).toBe(false);
    expect(popover.element.getAttribute('aria-hidden')).toBe('true');

    popover.destroy();
  });

  it('scheduleHide delays hide', () => {
    const hotspot = makeHotspot({ data: { title: 'Test' } });
    const popover = new Popover(hotspot, { placement: 'top', triggerMode: 'hover' });
    const marker = document.createElement('button');
    container.appendChild(marker);
    popover.mount(container, marker);

    popover.show();
    popover.scheduleHide(200);
    expect(popover.isVisible()).toBe(true);

    vi.advanceTimersByTime(100);
    expect(popover.isVisible()).toBe(true);

    vi.advanceTimersByTime(100);
    expect(popover.isVisible()).toBe(false);

    popover.destroy();
  });

  it('clearHideTimer prevents scheduled hide', () => {
    const hotspot = makeHotspot({ data: { title: 'Test' } });
    const popover = new Popover(hotspot, { placement: 'top', triggerMode: 'hover' });
    const marker = document.createElement('button');
    container.appendChild(marker);
    popover.mount(container, marker);

    popover.show();
    popover.scheduleHide(200);
    popover.clearHideTimer();

    vi.advanceTimersByTime(300);
    expect(popover.isVisible()).toBe(true);

    popover.destroy();
  });

  it('calls onOpen and onClose callbacks', () => {
    const onOpen = vi.fn();
    const onClose = vi.fn();
    const hotspot = makeHotspot({ data: { title: 'Test' } });
    const popover = new Popover(hotspot, {
      placement: 'top',
      triggerMode: 'click',
      onOpen,
      onClose,
    });
    const marker = document.createElement('button');
    container.appendChild(marker);
    popover.mount(container, marker);

    popover.show();
    expect(onOpen).toHaveBeenCalledWith(hotspot);

    popover.hide();
    expect(onClose).toHaveBeenCalledWith(hotspot);

    popover.destroy();
  });

  it('destroy removes element from DOM', () => {
    const hotspot = makeHotspot({ data: { title: 'Test' } });
    const popover = new Popover(hotspot, { placement: 'top', triggerMode: 'click' });
    const marker = document.createElement('button');
    container.appendChild(marker);
    popover.mount(container, marker);

    expect(container.contains(popover.element)).toBe(true);
    popover.destroy();
    expect(container.contains(popover.element)).toBe(false);
  });

  it('mount sets aria-describedby on marker for hover mode', () => {
    const hotspot = makeHotspot({ id: 'my-spot' });
    const popover = new Popover(hotspot, { placement: 'top', triggerMode: 'hover' });
    const marker = document.createElement('button');
    container.appendChild(marker);
    popover.mount(container, marker);

    expect(marker.getAttribute('aria-describedby')).toBe('ci-hotspot-popover-my-spot');
    popover.destroy();
  });

  it('mount sets aria-controls and aria-haspopup on marker for click mode', () => {
    const hotspot = makeHotspot({ id: 'my-spot' });
    const popover = new Popover(hotspot, { placement: 'top', triggerMode: 'click' });
    const marker = document.createElement('button');
    container.appendChild(marker);
    popover.mount(container, marker);

    expect(marker.getAttribute('aria-controls')).toBe('ci-hotspot-popover-my-spot');
    expect(marker.getAttribute('aria-haspopup')).toBe('dialog');
    expect(marker.getAttribute('aria-describedby')).toBeNull();
    popover.destroy();
  });

  it('click-mode popover has role="dialog" with aria-label', () => {
    const hotspot = makeHotspot({ id: 'my-spot', label: 'Product info' });
    const popover = new Popover(hotspot, { placement: 'top', triggerMode: 'click' });
    expect(popover.element.getAttribute('role')).toBe('dialog');
    expect(popover.element.getAttribute('aria-label')).toBe('Product info');
    popover.destroy();
  });
});
