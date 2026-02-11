import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import CIHotspot from '../src/index';

describe('Edge cases', () => {
  let root: HTMLElement;

  beforeEach(() => {
    root = document.createElement('div');
    document.body.appendChild(root);
  });

  afterEach(() => {
    root.remove();
  });

  it('empty hotspots array', () => {
    const instance = new CIHotspot(root, {
      src: 'https://example.com/image.jpg',
      hotspots: [],
    });
    expect(root.querySelectorAll('.ci-hotspot-marker')).toHaveLength(0);
    expect(root.querySelector('.ci-hotspot-container')).toBeTruthy();
    instance.destroy();
  });

  it('boundary coordinates — 0% and 100%', () => {
    const instance = new CIHotspot(root, {
      src: 'https://example.com/image.jpg',
      hotspots: [
        { id: 'corner-tl', x: '0%', y: '0%', label: 'Top Left' },
        { id: 'corner-br', x: '100%', y: '100%', label: 'Bottom Right' },
      ],
    });
    const tl = root.querySelector('[data-hotspot-id="corner-tl"]') as HTMLElement;
    const br = root.querySelector('[data-hotspot-id="corner-br"]') as HTMLElement;
    expect(tl.style.left).toBe('0%');
    expect(tl.style.top).toBe('0%');
    expect(br.style.left).toBe('100%');
    expect(br.style.top).toBe('100%');
    instance.destroy();
  });

  it('rapid open/close does not throw', () => {
    const instance = new CIHotspot(root, {
      src: 'https://example.com/image.jpg',
      trigger: 'click',
      hotspots: [
        { id: 'rapid', x: '50%', y: '50%', label: 'Rapid' },
      ],
    });

    expect(() => {
      for (let i = 0; i < 50; i++) {
        instance.open('rapid');
        instance.close('rapid');
      }
    }).not.toThrow();

    instance.destroy();
  });

  it('multiple instances on the same page', () => {
    const root2 = document.createElement('div');
    document.body.appendChild(root2);

    const instance1 = new CIHotspot(root, {
      src: 'https://example.com/image1.jpg',
      hotspots: [{ id: 'a', x: '50%', y: '50%', label: 'A' }],
    });
    const instance2 = new CIHotspot(root2, {
      src: 'https://example.com/image2.jpg',
      hotspots: [{ id: 'b', x: '50%', y: '50%', label: 'B' }],
    });

    expect(root.querySelector('.ci-hotspot-container')).toBeTruthy();
    expect(root2.querySelector('.ci-hotspot-container')).toBeTruthy();
    expect(root.querySelectorAll('.ci-hotspot-marker')).toHaveLength(1);
    expect(root2.querySelectorAll('.ci-hotspot-marker')).toHaveLength(1);

    instance1.destroy();
    instance2.destroy();
    root2.remove();
  });

  it('destroy during open popover does not throw', () => {
    const instance = new CIHotspot(root, {
      src: 'https://example.com/image.jpg',
      trigger: 'click',
      hotspots: [
        { id: 'mid', x: '50%', y: '50%', label: 'Mid' },
      ],
    });

    instance.open('mid');
    expect(() => instance.destroy()).not.toThrow();
    expect(root.innerHTML).toBe('');
  });

  it('removeHotspot for non-existent id does not throw', () => {
    const instance = new CIHotspot(root, {
      src: 'https://example.com/image.jpg',
      hotspots: [{ id: 'x', x: '50%', y: '50%', label: 'X' }],
    });

    expect(() => instance.removeHotspot('nonexistent')).not.toThrow();
    instance.destroy();
  });

  it('open/close non-existent id does not throw', () => {
    const instance = new CIHotspot(root, {
      src: 'https://example.com/image.jpg',
      hotspots: [],
    });

    expect(() => instance.open('nonexistent')).not.toThrow();
    expect(() => instance.close('nonexistent')).not.toThrow();
    instance.destroy();
  });

  it('setZoom without zoom enabled does not throw', () => {
    const instance = new CIHotspot(root, {
      src: 'https://example.com/image.jpg',
      zoom: false,
      hotspots: [],
    });

    expect(() => instance.setZoom(2)).not.toThrow();
    expect(instance.getZoom()).toBe(1);
    instance.destroy();
  });

  it('hotspot with all optional fields', () => {
    const instance = new CIHotspot(root, {
      src: 'https://example.com/image.jpg',
      hotspots: [{
        id: 'full',
        x: '50%',
        y: '50%',
        label: 'Full',
        data: { title: 'Title', price: '$10', description: 'Desc', image: 'img.jpg', url: '/link', ctaText: 'Go' },
        content: '<p>Custom</p>',
        className: 'my-class',
        trigger: 'click',
        keepOpen: true,
        placement: 'bottom',
        hidden: false,
      }],
    });

    const marker = root.querySelector('[data-hotspot-id="full"]') as HTMLElement;
    expect(marker).toBeTruthy();
    expect(marker.classList.contains('my-class')).toBe(true);
    instance.destroy();
  });

  it('updateHotspot changes marker label', () => {
    const instance = new CIHotspot(root, {
      src: 'https://example.com/image.jpg',
      hotspots: [{ id: 'upd', x: '50%', y: '50%', label: 'Original' }],
    });

    instance.updateHotspot('upd', { label: 'Updated' });
    const marker = root.querySelector('[data-hotspot-id="upd"]') as HTMLElement;
    expect(marker.getAttribute('aria-label')).toBe('Updated');
    instance.destroy();
  });
});
