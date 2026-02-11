import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import CIHotspot from '../src/index';

describe('Integration: full lifecycle', () => {
  let root: HTMLElement;

  beforeEach(() => {
    root = document.createElement('div');
    document.body.appendChild(root);
  });

  afterEach(() => {
    root.remove();
  });

  it('init → markers → click → popover → close → destroy', () => {
    const onOpen = vi.fn();
    const onClose = vi.fn();

    const instance = new CIHotspot(root, {
      src: 'https://example.com/image.jpg',
      alt: 'Test image',
      trigger: 'click',
      hotspots: [
        { id: 's1', x: '30%', y: '40%', label: 'Spot 1', data: { title: 'Item 1', price: '$99' } },
        { id: 's2', x: '70%', y: '60%', label: 'Spot 2', data: { title: 'Item 2', price: '$199' } },
      ],
      onOpen,
      onClose,
    });

    // Verify DOM structure
    expect(root.querySelector('.ci-hotspot-container')).toBeTruthy();
    expect(root.querySelector('.ci-hotspot-viewport')).toBeTruthy();
    expect(root.querySelector('.ci-hotspot-image')).toBeTruthy();
    expect(root.querySelectorAll('.ci-hotspot-marker')).toHaveLength(2);
    expect(root.querySelectorAll('.ci-hotspot-popover')).toHaveLength(2);

    // Open programmatically
    instance.open('s1');
    expect(onOpen).toHaveBeenCalledTimes(1);
    expect(onOpen).toHaveBeenCalledWith(expect.objectContaining({ id: 's1' }));
    expect(root.querySelector('#ci-hotspot-popover-s1')?.classList.contains('ci-hotspot-popover--visible')).toBe(true);

    // Close
    instance.close('s1');
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(root.querySelector('#ci-hotspot-popover-s1')?.classList.contains('ci-hotspot-popover--visible')).toBe(false);

    // Destroy
    instance.destroy();
    expect(root.innerHTML).toBe('');
  });

  it('init → zoom → pan → reset', () => {
    const onZoom = vi.fn();
    const instance = new CIHotspot(root, {
      src: 'https://example.com/image.jpg',
      zoom: true,
      zoomMax: 4,
      hotspots: [
        { id: 'z1', x: '50%', y: '50%', label: 'Spot' },
      ],
      onZoom,
    });

    // Zoom in
    instance.setZoom(2);
    expect(instance.getZoom()).toBe(2);
    expect(onZoom).toHaveBeenCalledWith(2);

    // Reset
    instance.resetZoom();
    expect(instance.getZoom()).toBe(1);

    instance.destroy();
  });

  it('init → addHotspot → removeHotspot', () => {
    const instance = new CIHotspot(root, {
      src: 'https://example.com/image.jpg',
      hotspots: [
        { id: 'orig', x: '50%', y: '50%', label: 'Original' },
      ],
    });

    expect(root.querySelectorAll('.ci-hotspot-marker')).toHaveLength(1);

    instance.addHotspot({ id: 'new', x: '20%', y: '20%', label: 'New' });
    expect(root.querySelectorAll('.ci-hotspot-marker')).toHaveLength(2);

    instance.removeHotspot('orig');
    expect(root.querySelectorAll('.ci-hotspot-marker')).toHaveLength(1);
    expect(root.querySelector('[data-hotspot-id="new"]')).toBeTruthy();

    instance.destroy();
  });

  it('init → keyboard Enter → Escape', () => {
    const instance = new CIHotspot(root, {
      src: 'https://example.com/image.jpg',
      trigger: 'click',
      hotspots: [
        { id: 'k1', x: '50%', y: '50%', label: 'Keyboard Spot', data: { title: 'Test' } },
      ],
    });

    const marker = root.querySelector('[data-hotspot-id="k1"]') as HTMLElement;
    const popover = root.querySelector('#ci-hotspot-popover-k1');

    // Enter opens
    marker.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(popover?.classList.contains('ci-hotspot-popover--visible')).toBe(true);

    // Escape closes
    marker.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(popover?.classList.contains('ci-hotspot-popover--visible')).toBe(false);

    instance.destroy();
  });

  it('update() rebuilds with new config', () => {
    const instance = new CIHotspot(root, {
      src: 'https://example.com/image.jpg',
      theme: 'light',
      hotspots: [
        { id: 'u1', x: '50%', y: '50%', label: 'Spot' },
      ],
    });

    expect(root.querySelector('.ci-hotspot-theme-dark')).toBeNull();

    instance.update({ theme: 'dark' });
    expect(root.querySelector('.ci-hotspot-theme-dark')).toBeTruthy();

    instance.destroy();
  });
});
