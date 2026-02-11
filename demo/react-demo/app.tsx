import React, { useRef, useState } from 'react';
import { CIHotspotViewer } from '../../src/react/index';
import type { CIHotspotViewerRef, HotspotItem } from '../../src/react/index';

const hotspots: HotspotItem[] = [
  {
    id: 'sofa',
    x: '35%',
    y: '65%',
    label: 'Modern Sofa',
    data: { title: 'Modern Sofa', price: '$1,299', description: 'Comfortable 3-seat sofa.' },
  },
  {
    id: 'lamp',
    x: '78%',
    y: '20%',
    label: 'Arc Floor Lamp',
    data: { title: 'Arc Floor Lamp', price: '$349' },
  },
  {
    id: 'table',
    x: '55%',
    y: '75%',
    label: 'Coffee Table',
    data: { title: 'Marble Coffee Table', price: '$599' },
  },
];

export default function App() {
  const viewerRef = useRef<CIHotspotViewerRef>(null);
  const [zoom, setZoom] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  return (
    <div className="demo-container">
      <h1>React Demo — CIHotspotViewer</h1>

      <CIHotspotViewer
        ref={viewerRef}
        src="https://scaleflex.cloudimg.io/v7/demo/stephen-walker-unsplash.jpg"
        alt="Living room"
        hotspots={hotspots}
        zoom={zoom}
        theme={theme}
        trigger="hover"
        onOpen={(h) => console.log('Opened:', h.id)}
        onClose={(h) => console.log('Closed:', h.id)}
      />

      <div className="controls">
        <button onClick={() => viewerRef.current?.open('sofa')}>Open Sofa</button>
        <button onClick={() => viewerRef.current?.closeAll()}>Close All</button>
        <button onClick={() => setZoom((z) => !z)}>Toggle Zoom: {zoom ? 'ON' : 'OFF'}</button>
        <button onClick={() => setTheme((t) => t === 'light' ? 'dark' : 'light')}>Theme: {theme}</button>
        <button onClick={() => viewerRef.current?.setZoom(2)}>Zoom 2x</button>
        <button onClick={() => viewerRef.current?.resetZoom()}>Reset Zoom</button>
      </div>
    </div>
  );
}
