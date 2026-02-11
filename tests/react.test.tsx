import { describe, it, expect, afterEach } from 'vitest';
import React, { createRef } from 'react';
import { render, cleanup, act } from '@testing-library/react';
import { CIHotspotViewer } from '../src/react/ci-hotspot-viewer';
import type { CIHotspotViewerRef } from '../src/react/types';
import type { HotspotItem } from '../src/core/types';

const hotspots: HotspotItem[] = [
  { id: 'spot-1', x: '40%', y: '60%', label: 'Spot 1', data: { title: 'Item 1' } },
  { id: 'spot-2', x: '75%', y: '25%', label: 'Spot 2', data: { title: 'Item 2' } },
];

afterEach(() => {
  cleanup();
});

describe('CIHotspotViewer', () => {
  it('renders a container div', () => {
    const { container } = render(
      <CIHotspotViewer src="https://example.com/image.jpg" hotspots={hotspots} />,
    );
    expect(container.querySelector('.ci-hotspot-container')).toBeTruthy();
  });

  it('creates markers after mount', () => {
    const { container } = render(
      <CIHotspotViewer src="https://example.com/image.jpg" hotspots={hotspots} />,
    );
    const markers = container.querySelectorAll('.ci-hotspot-marker');
    expect(markers).toHaveLength(2);
  });

  it('creates popovers after mount', () => {
    const { container } = render(
      <CIHotspotViewer src="https://example.com/image.jpg" hotspots={hotspots} />,
    );
    const popovers = container.querySelectorAll('.ci-hotspot-popover');
    expect(popovers).toHaveLength(2);
  });

  it('applies className', () => {
    const { container } = render(
      <CIHotspotViewer
        src="https://example.com/image.jpg"
        hotspots={hotspots}
        className="custom-class"
      />,
    );
    expect(container.firstElementChild?.classList.contains('custom-class')).toBe(true);
  });

  it('applies style', () => {
    const { container } = render(
      <CIHotspotViewer
        src="https://example.com/image.jpg"
        hotspots={hotspots}
        style={{ maxWidth: '800px' }}
      />,
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.maxWidth).toBe('800px');
  });

  it('ref API methods work', () => {
    const ref = createRef<CIHotspotViewerRef>();
    const { container } = render(
      <CIHotspotViewer
        ref={ref}
        src="https://example.com/image.jpg"
        hotspots={hotspots}
        trigger="click"
      />,
    );

    expect(ref.current).toBeTruthy();

    act(() => {
      ref.current!.open('spot-1');
    });

    const popover = container.querySelector('#ci-hotspot-popover-spot-1');
    expect(popover?.classList.contains('ci-hotspot-popover--visible')).toBe(true);

    act(() => {
      ref.current!.close('spot-1');
    });
    expect(popover?.classList.contains('ci-hotspot-popover--visible')).toBe(false);
  });

  it('ref getZoom returns 1 by default', () => {
    const ref = createRef<CIHotspotViewerRef>();
    render(
      <CIHotspotViewer
        ref={ref}
        src="https://example.com/image.jpg"
        hotspots={hotspots}
      />,
    );
    expect(ref.current!.getZoom()).toBe(1);
  });

  it('cleans up on unmount', () => {
    const { container, unmount } = render(
      <CIHotspotViewer src="https://example.com/image.jpg" hotspots={hotspots} />,
    );
    expect(container.querySelector('.ci-hotspot-container')).toBeTruthy();
    unmount();
    // After unmount the component div is gone
    expect(container.querySelector('.ci-hotspot-container')).toBeNull();
  });

  it('supports zoom prop', () => {
    const { container } = render(
      <CIHotspotViewer
        src="https://example.com/image.jpg"
        hotspots={hotspots}
        zoom
      />,
    );
    expect(container.querySelector('.ci-hotspot-zoom-controls')).toBeTruthy();
  });

  it('supports dark theme', () => {
    const { container } = render(
      <CIHotspotViewer
        src="https://example.com/image.jpg"
        hotspots={hotspots}
        theme="dark"
      />,
    );
    expect(container.querySelector('.ci-hotspot-theme-dark')).toBeTruthy();
  });
});
