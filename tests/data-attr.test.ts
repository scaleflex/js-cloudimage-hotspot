import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { parseDataAttributes } from '../src/core/config';
import CIHotspot from '../src/index';

describe('parseDataAttributes', () => {
  it('parses src and alt', () => {
    const el = document.createElement('div');
    el.setAttribute('data-ci-hotspot-src', 'https://example.com/img.jpg');
    el.setAttribute('data-ci-hotspot-alt', 'Test image');

    const config = parseDataAttributes(el);
    expect(config.src).toBe('https://example.com/img.jpg');
    expect(config.alt).toBe('Test image');
  });

  it('parses boolean values', () => {
    const el = document.createElement('div');
    el.setAttribute('data-ci-hotspot-src', '/img.jpg');
    el.setAttribute('data-ci-hotspot-zoom', 'true');
    el.setAttribute('data-ci-hotspot-pulse', 'false');
    el.setAttribute('data-ci-hotspot-lazy-load', 'true');

    const config = parseDataAttributes(el);
    expect(config.zoom).toBe(true);
    expect(config.pulse).toBe(false);
    expect(config.lazyLoad).toBe(true);
  });

  it('parses number values', () => {
    const el = document.createElement('div');
    el.setAttribute('data-ci-hotspot-src', '/img.jpg');
    el.setAttribute('data-ci-hotspot-zoom-max', '6');
    el.setAttribute('data-ci-hotspot-zoom-min', '0.5');

    const config = parseDataAttributes(el);
    expect(config.zoomMax).toBe(6);
    expect(config.zoomMin).toBe(0.5);
  });

  it('parses JSON items', () => {
    const el = document.createElement('div');
    el.setAttribute('data-ci-hotspot-src', '/img.jpg');
    el.setAttribute('data-ci-hotspot-items', JSON.stringify([
      { id: 's1', x: '40%', y: '60%', label: 'Spot 1' },
      { id: 's2', x: '75%', y: '25%', label: 'Spot 2' },
    ]));

    const config = parseDataAttributes(el);
    expect(config.hotspots).toHaveLength(2);
    expect(config.hotspots![0].id).toBe('s1');
  });

  it('parses trigger and theme', () => {
    const el = document.createElement('div');
    el.setAttribute('data-ci-hotspot-src', '/img.jpg');
    el.setAttribute('data-ci-hotspot-trigger', 'click');
    el.setAttribute('data-ci-hotspot-theme', 'dark');

    const config = parseDataAttributes(el);
    expect(config.trigger).toBe('click');
    expect(config.theme).toBe('dark');
  });

  it('assembles cloudimage config from ci-* attributes', () => {
    const el = document.createElement('div');
    el.setAttribute('data-ci-hotspot-src', '/img.jpg');
    el.setAttribute('data-ci-hotspot-ci-token', 'demo');
    el.setAttribute('data-ci-hotspot-ci-api-version', 'v7');
    el.setAttribute('data-ci-hotspot-ci-domain', 'cloudimg.io');
    el.setAttribute('data-ci-hotspot-ci-limit-factor', '100');
    el.setAttribute('data-ci-hotspot-ci-params', 'q=80');

    const config = parseDataAttributes(el);
    expect(config.cloudimage).toBeDefined();
    expect(config.cloudimage!.token).toBe('demo');
    expect(config.cloudimage!.apiVersion).toBe('v7');
    expect(config.cloudimage!.limitFactor).toBe(100);
    expect(config.cloudimage!.params).toBe('q=80');
  });

  it('ignores missing attributes', () => {
    const el = document.createElement('div');
    el.setAttribute('data-ci-hotspot-src', '/img.jpg');

    const config = parseDataAttributes(el);
    expect(config.src).toBe('/img.jpg');
    expect(config.zoom).toBeUndefined();
    expect(config.cloudimage).toBeUndefined();
  });
});

describe('CIHotspot.autoInit', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it('initializes all data-ci-hotspot-src elements', () => {
    const el1 = document.createElement('div');
    el1.setAttribute('data-ci-hotspot-src', '/img1.jpg');
    el1.setAttribute('data-ci-hotspot-items', JSON.stringify([
      { id: 'a', x: '50%', y: '50%', label: 'A' },
    ]));

    const el2 = document.createElement('div');
    el2.setAttribute('data-ci-hotspot-src', '/img2.jpg');
    el2.setAttribute('data-ci-hotspot-items', JSON.stringify([
      { id: 'b', x: '30%', y: '30%', label: 'B' },
    ]));

    container.appendChild(el1);
    container.appendChild(el2);

    const instances = CIHotspot.autoInit(container);
    expect(instances).toHaveLength(2);

    expect(el1.querySelector('.ci-hotspot-container')).toBeTruthy();
    expect(el2.querySelector('.ci-hotspot-container')).toBeTruthy();

    instances.forEach((inst) => inst.destroy());
  });

  it('returns empty array when no matching elements', () => {
    const instances = CIHotspot.autoInit(container);
    expect(instances).toHaveLength(0);
  });
});
