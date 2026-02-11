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

// Custom green styling demo
new CIHotspot('#theme-custom', {
  src: DEMO_IMAGE_2,
  alt: 'Emerald dresser vignette — custom green styling',
  trigger: 'hover',
  hotspots: [
    {
      id: 'tc1',
      x: '55%',
      y: '46%',
      label: 'Pampas Vase',
      data: { title: 'Pampas Vase', description: 'Terracotta pitcher filled with dried pampas grass plumes in warm golden tones.' },
    },
  ],
});

// Multi-Image Navigation (Scenes) demo
const scenesViewer = new CIHotspot('#scenes-viewer', {
  scenes: [
    {
      id: 'main-hall',
      src: 'https://scaleflex.cloudimg.io/v7/plugins/js-cloudimage-hotspot/andrea-davis-0.jpg?vh=571923',
      alt: 'Elegant main hall with chandelier and sweeping staircase',
      hotspots: [
        {
          id: 'mh-stairs',
          x: '75%',
          y: '40%',
          label: 'Go to Stairs',
          navigateTo: 'stairs',
        },
        {
          id: 'mh-kitchen',
          x: '15%',
          y: '55%',
          label: 'Go to Kitchen',
          navigateTo: 'kitchen',
        },
        {
          id: 'mh-chandelier',
          x: '50%',
          y: '15%',
          label: 'Crystal Chandelier',
          data: {
            title: 'Crystal Chandelier',
            description: 'Hand-cut lead crystal fixture with warm LED candelabra bulbs, suspended from a medallion ceiling rose.',
          },
        },
      ],
    },
    {
      id: 'stairs',
      src: 'https://scaleflex.cloudimg.io/v7/plugins/js-cloudimage-hotspot/andrea-davis-3.jpg?vh=66891d',
      alt: 'Grand staircase with wooden banister and natural light',
      hotspots: [
        {
          id: 'st-back',
          x: '15%',
          y: '90%',
          label: 'Back to Main Hall',
          navigateTo: 'main-hall',
        },
        {
          id: 'st-bedroom',
          x: '70%',
          y: '20%',
          label: 'Go to Bedroom',
          navigateTo: 'bedroom',
        },
        {
          id: 'st-banister',
          x: '40%',
          y: '60%',
          label: 'Oak Banister',
          data: {
            title: 'Oak Banister',
            description: 'Hand-turned solid oak banister with traditional carved newel posts and a satin lacquer finish.',
          },
        },
      ],
    },
    {
      id: 'kitchen',
      src: 'https://scaleflex.cloudimg.io/v7/plugins/js-cloudimage-hotspot/andrea-davis-2.jpg?vh=039d87',
      alt: 'Open-plan kitchen with modern appliances and marble countertops',
      hotspots: [
        {
          id: 'kt-back',
          x: '15%',
          y: '90%',
          label: 'Back to Main Hall',
          navigateTo: 'main-hall',
        },
        {
          id: 'kt-rest',
          x: '85%',
          y: '45%',
          label: 'Go to Rest Zone',
          navigateTo: 'rest-zone',
        },
        {
          id: 'kt-island',
          x: '50%',
          y: '70%',
          label: 'Kitchen Island',
          data: {
            title: 'Marble Kitchen Island',
            description: 'Carrara marble countertop with waterfall edge on a walnut base, fitted with brass pendant lights.',
          },
        },
      ],
    },
    {
      id: 'bedroom',
      src: 'https://scaleflex.cloudimg.io/v7/plugins/js-cloudimage-hotspot/andrea-davis-4.jpg?vh=319871',
      alt: 'Master bedroom with king-size bed and panoramic windows',
      hotspots: [
        {
          id: 'br-back',
          x: '15%',
          y: '90%',
          label: 'Back to Stairs',
          navigateTo: 'stairs',
        },
        {
          id: 'br-bed',
          x: '55%',
          y: '60%',
          label: 'King-Size Bed',
          data: {
            title: 'Upholstered King Bed',
            description: 'Linen-wrapped platform frame with memory foam mattress and Egyptian cotton bedding.',
          },
        },
      ],
    },
    {
      id: 'rest-zone',
      src: 'https://scaleflex.cloudimg.io/v7/plugins/js-cloudimage-hotspot/andrea-davis-1.jpg?vh=8c0c49',
      alt: 'Cozy rest zone with reading nook and warm lighting',
      hotspots: [
        {
          id: 'rz-back',
          x: '15%',
          y: '90%',
          label: 'Back to Kitchen',
          navigateTo: 'kitchen',
        },
        {
          id: 'rz-main',
          x: '85%',
          y: '30%',
          label: 'Go to Main Hall',
          navigateTo: 'main-hall',
        },
        {
          id: 'rz-chair',
          x: '50%',
          y: '55%',
          label: 'Reading Chair',
          data: {
            title: 'Wingback Reading Chair',
            description: 'Boucle-upholstered wingback with solid ash legs and matching ottoman.',
          },
        },
      ],
    },
  ],
  initialScene: 'main-hall',
  sceneTransition: 'fade',
  sceneAspectRatio: '16/9',
  trigger: 'hover',
});

// Wire up scene navigation buttons
document.querySelectorAll<HTMLButtonElement>('[data-scene]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const sceneId = btn.dataset.scene;
    if (sceneId) scenesViewer.goToScene(sceneId);
  });
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
