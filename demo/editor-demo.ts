import { CIHotspotEditor } from '../src/editor/index';

const DEMO_IMAGE = 'https://scaleflex.cloudimg.io/v7/demo/stephen-walker-unsplash.jpg';

const jsonOutput = document.getElementById('json-output')!;

const editor = new CIHotspotEditor('#editor-root', {
  src: DEMO_IMAGE,
  alt: 'Modern living room',
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
  ],
  onChange: (hotspots) => {
    jsonOutput.textContent = JSON.stringify(hotspots, null, 2);
  },
});

// Initial render of JSON
jsonOutput.textContent = editor.exportJSON();
