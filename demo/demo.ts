import CIHotspot from '../src/index';
import { initConfigurator } from './configurator';

const DEMO_IMAGE = 'https://scaleflex.cloudimg.io/v7/plugins/js-cloudimage-hotspot/yehleen-gaffney-unsplash.jpg?vh=cfb8d7';
const DEMO_IMAGE_2 = 'https://scaleflex.cloudimg.io/v7/plugins/js-cloudimage-hotspot/alexandra-gorn-unsplash.jpg';

// Hero viewer
new CIHotspot('#hero-viewer', {
  src: DEMO_IMAGE,
  alt: 'Sun-drenched bohemian living nook with sage sofa and indoor plants',
  trigger: 'hover',
  zoom: true,
  hotspots: [
    {
      id: 'wall-art',
      x: '18%',
      y: '26%',
      label: 'Canvas Print',
      data: {
        title: 'Typographic Canvas',
        description: 'Hand-lettered print on natural birch plywood, 60 × 80 cm.',
      },
    },
    {
      id: 'sofa',
      x: '28%',
      y: '54%',
      label: 'Loveseat Sofa',
      data: {
        title: 'Loveseat Sofa',
        description: 'Sage green linen blend with bolster armrests and a burnt-orange velvet accent cushion.',
      },
    },
    {
      id: 'side-table',
      x: '48%',
      y: '64%',
      label: 'Tripod Side Table',
      data: {
        title: 'Tripod Side Table',
        description: 'Round white top with solid beechwood legs, styled with a rattan serving tray.',
      },
    },
    {
      id: 'fiddle-leaf',
      x: '62%',
      y: '52%',
      label: 'Fiddle-Leaf Fig',
      data: {
        title: 'Fiddle-Leaf Fig',
        description: 'Mature indoor tree in a woven seagrass basket, approximately 140 cm tall.',
      },
    },
  ],
});

// Trigger mode demos
const triggerHotspots = [
  {
    id: 't1',
    x: '50%',
    y: '82%',
    label: 'Emerald Dresser',
    data: { title: 'Emerald Dresser', description: 'Hand-painted vintage four-drawer chest in deep emerald green with original round knobs.' },
  },
  {
    id: 't2',
    x: '40%',
    y: '24%',
    label: 'Botanical Gallery',
    data: { title: 'Botanical Gallery', description: 'Pair of framed watercolor leaf prints on a white-painted exposed-brick wall.' },
  },
];

new CIHotspot('#trigger-hover', {
  src: DEMO_IMAGE_2,
  alt: 'Emerald dresser against white brick wall with botanical prints',
  trigger: 'hover',
  hotspots: triggerHotspots,
});

new CIHotspot('#trigger-click', {
  src: DEMO_IMAGE_2,
  alt: 'Emerald dresser against white brick wall with botanical prints',
  trigger: 'click',
  hotspots: triggerHotspots,
});

new CIHotspot('#trigger-load', {
  src: DEMO_IMAGE_2,
  alt: 'Emerald dresser against white brick wall with botanical prints',
  trigger: 'load',
  hotspots: triggerHotspots,
});

// Theme demos
new CIHotspot('#theme-light', {
  src: DEMO_IMAGE_2,
  alt: 'Emerald dresser vignette — light theme',
  theme: 'light',
  trigger: 'hover',
  hotspots: [
    {
      id: 'tl1',
      x: '55%',
      y: '46%',
      label: 'Pampas Vase',
      data: { title: 'Pampas Vase', description: 'Terracotta pitcher filled with dried pampas grass plumes in warm golden tones.' },
    },
  ],
});

new CIHotspot('#theme-dark', {
  src: DEMO_IMAGE_2,
  alt: 'Emerald dresser vignette — dark theme',
  theme: 'dark',
  trigger: 'hover',
  hotspots: [
    {
      id: 'td1',
      x: '55%',
      y: '46%',
      label: 'Pampas Vase',
      data: { title: 'Pampas Vase', description: 'Terracotta pitcher filled with dried pampas grass plumes in warm golden tones.' },
    },
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
