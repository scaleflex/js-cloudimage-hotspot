import { describe, it, expect } from 'vitest';
import type {
  CIHotspotConfig,
  CIHotspotInstance,
  HotspotItem,
  Placement,
  TriggerMode,
  Theme,
} from '../src/index';
import CIHotspot from '../src/index';

describe('Type definitions', () => {
  it('CIHotspot is a class with constructor', () => {
    expect(typeof CIHotspot).toBe('function');
  });

  it('CIHotspot has static autoInit', () => {
    expect(typeof CIHotspot.autoInit).toBe('function');
  });

  it('accepts valid config shape', () => {
    const config: CIHotspotConfig = {
      src: 'https://example.com/image.jpg',
      hotspots: [
        {
          id: 'test',
          x: '50%',
          y: '50%',
          label: 'Test hotspot',
        },
      ],
    };
    expect(config.src).toBe('https://example.com/image.jpg');
    expect(config.hotspots).toHaveLength(1);
  });

  it('accepts hotspot with pixel coordinates', () => {
    const hotspot: HotspotItem = {
      id: 'px-test',
      x: 650,
      y: 400,
      label: 'Pixel hotspot',
      data: { title: 'Test', price: '$99' },
    };
    expect(hotspot.x).toBe(650);
    expect(hotspot.y).toBe(400);
  });

  it('accepts full config with all optional fields', () => {
    const config: CIHotspotConfig = {
      src: '/image.jpg',
      alt: 'Test image',
      hotspots: [],
      trigger: 'click',
      zoom: true,
      zoomMax: 4,
      zoomMin: 1,
      theme: 'dark',
      pulse: true,
      zoomControls: true,
      placement: 'top',
      lazyLoad: true,
      cloudimage: {
        token: 'demo',
        apiVersion: 'v7',
        domain: 'cloudimg.io',
        limitFactor: 100,
        params: 'q=80',
      },
      onOpen: () => {},
      onClose: () => {},
      onZoom: () => {},
      onClick: () => {},
      renderPopover: () => '<div>test</div>',
    };
    expect(config.trigger).toBe('click');
    expect(config.cloudimage?.token).toBe('demo');
  });

  it('type-checks placement values', () => {
    const placements: Placement[] = ['top', 'bottom', 'left', 'right', 'auto'];
    expect(placements).toHaveLength(5);
  });

  it('type-checks trigger values', () => {
    const triggers: TriggerMode[] = ['hover', 'click', 'load'];
    expect(triggers).toHaveLength(3);
  });

  it('type-checks theme values', () => {
    const themes: Theme[] = ['light', 'dark'];
    expect(themes).toHaveLength(2);
  });
});
