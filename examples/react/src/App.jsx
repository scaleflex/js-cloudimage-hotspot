import React, { useRef } from 'react';
import { CIHotspotViewer } from 'js-cloudimage-hotspot/react';

const hotspots = [
  {
    id: 'lamp',
    x: 22,
    y: 30,
    label: 'Designer Lamp',
    trigger: 'click',
    placement: 'right',
    data: {
      title: 'Designer Lamp',
      price: '$149',
      description: 'A modern floor lamp with adjustable brightness.',
      url: '#',
      ctaText: 'View Details',
    },
  },
  {
    id: 'sofa',
    x: 55,
    y: 60,
    label: 'Comfort Sofa',
    trigger: 'hover',
    placement: 'top',
    data: {
      title: 'Comfort Sofa',
      price: '$899',
      description: 'Handcrafted three-seater sofa in premium fabric.',
    },
  },
  {
    id: 'plant',
    x: 80,
    y: 45,
    label: 'Indoor Plant',
    trigger: 'click',
    placement: 'left',
    data: {
      title: 'Indoor Plant',
      price: '$35',
      description: 'Low-maintenance greenery for any room.',
    },
  },
];

export default function App() {
  const viewerRef = useRef(null);

  return (
    <div>
      <h1>Hotspot Viewer</h1>

      <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
        <button onClick={() => viewerRef.current?.setZoom((viewerRef.current?.getZoom() ?? 1) + 0.5)}>
          Zoom In
        </button>
        <button onClick={() => viewerRef.current?.setZoom((viewerRef.current?.getZoom() ?? 1) - 0.5)}>
          Zoom Out
        </button>
        <button onClick={() => viewerRef.current?.resetZoom()}>Reset</button>
      </div>

      <CIHotspotViewer
        ref={viewerRef}
        src="https://scaleflex.cloudimg.io/v7/demo/room.jpg"
        theme="light"
        zoom
        hotspots={hotspots}
      />
    </div>
  );
}
