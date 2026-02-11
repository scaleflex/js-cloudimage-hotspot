import CIHotspot from '../src/index';
import { initConfigurator } from './configurator';

const DEMO_IMAGE = 'https://scaleflex.cloudimg.io/v7/demo/stephen-walker-unsplash.jpg';
const DEMO_IMAGE_2 = 'https://scaleflex.cloudimg.io/v7/demo/redcharlie.jpg';

// Hero viewer
new CIHotspot('#hero-viewer', {
  src: DEMO_IMAGE,
  alt: 'Modern living room',
  trigger: 'hover',
  zoom: true,
  hotspots: [
    {
      id: 'sofa',
      x: '35%',
      y: '65%',
      label: 'Modern Sofa',
      data: { title: 'Modern Sofa', price: '$1,299', description: 'Comfortable 3-seat sofa in natural linen.' },
    },
    {
      id: 'lamp',
      x: '78%',
      y: '20%',
      label: 'Arc Floor Lamp',
      data: { title: 'Arc Floor Lamp', price: '$349', description: 'Brushed brass finish.' },
    },
    {
      id: 'table',
      x: '55%',
      y: '75%',
      label: 'Coffee Table',
      data: { title: 'Marble Coffee Table', price: '$599' },
    },
    {
      id: 'art',
      x: '22%',
      y: '30%',
      label: 'Wall Art',
      data: { title: 'Abstract Canvas', price: '$189' },
    },
  ],
});

// Trigger mode demos
const triggerHotspots = [
  { id: 't1', x: '40%', y: '50%', label: 'Item', data: { title: 'Product', price: '$99' } },
  { id: 't2', x: '70%', y: '35%', label: 'Detail', data: { title: 'Detail', price: '$49' } },
];

new CIHotspot('#trigger-hover', {
  src: DEMO_IMAGE_2,
  alt: 'Hover trigger demo',
  trigger: 'hover',
  hotspots: triggerHotspots,
});

new CIHotspot('#trigger-click', {
  src: DEMO_IMAGE_2,
  alt: 'Click trigger demo',
  trigger: 'click',
  hotspots: triggerHotspots,
});

new CIHotspot('#trigger-load', {
  src: DEMO_IMAGE_2,
  alt: 'Load trigger demo',
  trigger: 'load',
  hotspots: triggerHotspots,
});

// Zoom viewer
new CIHotspot('#zoom-viewer', {
  src: DEMO_IMAGE,
  alt: 'Zoom and pan demo',
  zoom: true,
  zoomMax: 4,
  trigger: 'hover',
  hotspots: [
    { id: 'z1', x: '30%', y: '45%', label: 'Zoom Spot 1', data: { title: 'Detail 1', description: 'Zoom in to see more detail' } },
    { id: 'z2', x: '65%', y: '60%', label: 'Zoom Spot 2', data: { title: 'Detail 2' } },
  ],
});

// Theme demos
new CIHotspot('#theme-light', {
  src: DEMO_IMAGE_2,
  alt: 'Light theme demo',
  theme: 'light',
  trigger: 'hover',
  hotspots: [
    { id: 'tl1', x: '50%', y: '50%', label: 'Light Theme Spot', data: { title: 'Light Theme', description: 'Default styling' } },
  ],
});

new CIHotspot('#theme-dark', {
  src: DEMO_IMAGE_2,
  alt: 'Dark theme demo',
  theme: 'dark',
  trigger: 'hover',
  hotspots: [
    { id: 'td1', x: '50%', y: '50%', label: 'Dark Theme Spot', data: { title: 'Dark Theme', description: 'Dark styling' } },
  ],
});

// Auto-init for HTML section
CIHotspot.autoInit(document.getElementById('html-init-viewer')?.parentElement || undefined);

// Accessibility demo
new CIHotspot('#a11y-viewer', {
  src: DEMO_IMAGE,
  alt: 'Accessibility demo',
  trigger: 'click',
  zoom: true,
  hotspots: [
    { id: 'a1', x: '25%', y: '40%', label: 'Keyboard accessible spot 1', data: { title: 'Spot 1', description: 'Tab here, press Enter' } },
    { id: 'a2', x: '55%', y: '55%', label: 'Keyboard accessible spot 2', data: { title: 'Spot 2', description: 'Focus triggers popover' } },
    { id: 'a3', x: '80%', y: '30%', label: 'Keyboard accessible spot 3', data: { title: 'Spot 3', description: 'Escape closes' } },
  ],
});

// Configurator
initConfigurator();
