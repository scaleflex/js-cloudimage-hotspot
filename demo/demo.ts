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

// Configurator
initConfigurator();

// ── Nav: scroll shadow + active section highlighting ──
const nav = document.getElementById('demo-nav');
const navLinks = document.querySelectorAll<HTMLAnchorElement>('.demo-nav-links a');
const sections = document.querySelectorAll<HTMLElement>('main section[id]');

function updateNav(): void {
  // Shadow on scroll
  if (nav) {
    nav.classList.toggle('scrolled', window.scrollY > 10);
  }

  // Active section
  let currentId = '';
  const offset = 120;
  for (const section of sections) {
    if (section.offsetTop - offset <= window.scrollY) {
      currentId = section.id;
    }
  }
  for (const link of navLinks) {
    const href = link.getAttribute('href');
    link.classList.toggle('active', href === `#${currentId}`);
  }
}

window.addEventListener('scroll', updateNav, { passive: true });
updateNav();
