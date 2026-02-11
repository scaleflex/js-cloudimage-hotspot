import React, { useRef, useState } from 'react';
import { CIHotspotViewer } from '../../src/react/index';
import type { CIHotspotViewerRef, HotspotItem } from '../../src/react/index';

const hotspots: HotspotItem[] = [
  {
    id: 'armchair',
    x: '15%',
    y: '68%',
    label: 'Leather Armchair',
    data: {
      title: 'Leather Armchair',
      description: 'Mid-century lounge chair in warm tan leather with sculpted wooden armrests.',
    },
  },
  {
    id: 'floor-lamp',
    x: '50%',
    y: '38%',
    label: 'Arc Floor Lamp',
    data: {
      title: 'Arc Floor Lamp',
      description: 'Matte black arched stem with a dome shade, casting warm light over the seating area.',
    },
  },
  {
    id: 'coffee-table',
    x: '68%',
    y: '78%',
    label: 'Walnut Coffee Table',
    data: {
      title: 'Walnut Coffee Table',
      description: 'Mid-century modern silhouette with tapered legs, styled with ceramic vases and art books.',
    },
  },
];

export default function App() {
  const viewerRef = useRef<CIHotspotViewerRef>(null);
  const [zoom, setZoom] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  return (
    <div className="demo-container">
      <h1>React Demo — Cloudimage Hotspot Viewer</h1>

      <CIHotspotViewer
        ref={viewerRef}
        src="https://scaleflex.cloudimg.io/v7/plugins/js-cloudimage-hotspot/spacejoy-unsplash.jpg"
        alt="Mid-century living room with green sofa, leather armchair, and gallery wall"
        hotspots={hotspots}
        zoom={zoom}
        theme={theme}
        trigger="hover"
        onOpen={(h) => console.log('Opened:', h.id)}
        onClose={(h) => console.log('Closed:', h.id)}
      />

      <div className="controls">
        <button onClick={() => viewerRef.current?.open('armchair')}>Open Armchair</button>
        <button onClick={() => viewerRef.current?.closeAll()}>Close All</button>
        <button onClick={() => setZoom((z) => !z)}>Toggle Zoom: {zoom ? 'ON' : 'OFF'}</button>
        <button onClick={() => setTheme((t) => t === 'light' ? 'dark' : 'light')}>Theme: {theme}</button>
        <button onClick={() => viewerRef.current?.setZoom(2)}>Zoom 2x</button>
        <button onClick={() => viewerRef.current?.resetZoom()}>Reset Zoom</button>
      </div>
    </div>
  );
}
