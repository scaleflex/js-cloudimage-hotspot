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
        price: '$89',
        description: 'Hand-lettered print on natural birch plywood, 60 × 80 cm.',
        url: '#',
        ctaText: 'View Details',
      },
    },
    {
      id: 'sofa',
      x: '24%',
      y: '68%',
      label: 'Loveseat Sofa',
      data: {
        title: 'Loveseat Sofa',
        price: '$1,249',
        description: 'Sage green linen blend with bolster armrests and a burnt-orange velvet accent cushion.',
        url: '#',
        ctaText: 'Shop Now',
      },
    },
    {
      id: 'side-table',
      x: '45%',
      y: '72%',
      label: 'Tripod Side Table',
      data: {
        title: 'Tripod Side Table',
        price: '$179',
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
      x: '58%',
      y: '66%',
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
      x: '58%',
      y: '66%',
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
      x: '58%',
      y: '66%',
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
          x: '40%',
          y: '40%',
          label: 'Go to Stairs',
          navigateTo: 'stairs',
        },
        {
          id: 'mh-kitchen',
          x: '75%',
          y: '82%',
          label: 'Go to Kitchen',
          navigateTo: 'kitchen',
        },
        {
          id: 'kt-rest',
          x: '10%',
          y: '85%',
          label: 'Go to Rest Zone',
          navigateTo: 'rest-zone',
          arrowDirection: 180
        },
        {
          id: 'st-bedroom',
          x: '60%',
          y: '15%',
          label: 'Go to Bedroom',
          navigateTo: 'bedroom',
          arrowDirection: -90
        },
        {
          id: 'mh-chandelier',
          x: '55%',
          y: '43%',
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
          x: '10%',
          y: '90%',
          label: 'Go to Main Hall',
          navigateTo: 'main-hall',
          arrowDirection: 180
        },
        {
          id: 'st-bedroom',
          x: '50%',
          y: '10%',
          label: 'Go to Bedroom',
          navigateTo: 'bedroom',
        },
        {
          id: 'st-banister',
          x: '25%',
          y: '25%',
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
          label: 'Go to Main Hall',
          navigateTo: 'main-hall',
          arrowDirection: 180
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
          x: '40%',
          y: '56%',
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
          x: '10%',
          y: '90%',
          label: 'Go to Stairs',
          navigateTo: 'stairs',
          arrowDirection: 180
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
          label: 'Go to Kitchen',
          navigateTo: 'kitchen',
          arrowDirection: 180
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
          content: '<div style="display:flex;gap:12px;align-items:center"><img src="https://scaleflex.cloudimg.io/v7/plugins/js-cloudimage-hotspot/andrea-davis-1-chair.jpg?w=120" alt="Wingback Reading Chair" style="width:100px;height:100px;object-fit:cover;border-radius:8px;flex-shrink:0"><div><strong style="font-size:15px">Wingback Reading Chair</strong><p style="margin:4px 0 0;font-size:13px;opacity:0.7">Boucle-upholstered wingback with solid ash legs and matching ottoman.</p></div></div>',
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

// Wire up scene transition selector
const sceneTransitionSelect = document.getElementById('cfg-scene-transition') as HTMLSelectElement | null;
sceneTransitionSelect?.addEventListener('change', () => {
  scenesViewer.update({ sceneTransition: sceneTransitionSelect.value as 'fade' | 'slide' | 'none' });
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

// Smooth scroll only for nav link clicks (manual offset to respect sticky nav)
for (const link of navLinks) {
  link.addEventListener('click', (e) => {
    const href = link.getAttribute('href');
    if (!href?.startsWith('#')) return;
    const target = document.getElementById(href.slice(1));
    if (!target) return;
    e.preventDefault();
    const navHeight = nav ? nav.offsetHeight : 0;
    const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 12;
    window.scrollTo({ top, behavior: 'smooth' });
  });
}

window.addEventListener('scroll', updateNav, { passive: true });
updateNav();

// ── Mobile burger menu ──
const burger = document.getElementById('nav-burger');
if (nav && burger) {
  burger.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    burger.setAttribute('aria-expanded', String(open));
  });

  // Close menu when a nav link is clicked
  for (const link of navLinks) {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
    });
  }
}
