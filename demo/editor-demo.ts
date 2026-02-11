import { CIHotspotEditor } from '../src/editor/index';

const DEMO_IMAGE = 'https://scaleflex.cloudimg.io/v7/plugins/js-cloudimage-hotspot/spacejoy-unsplash.jpg';

const jsonOutput = document.getElementById('json-output')!;

const editor = new CIHotspotEditor('#editor-root', {
  src: DEMO_IMAGE,
  alt: 'Mid-century living room with green sofa, leather armchair, and gallery wall',
  hotspots: [
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
  ],
  onChange: (hotspots) => {
    jsonOutput.textContent = JSON.stringify(hotspots, null, 2);
  },
});

// Initial render of JSON
jsonOutput.textContent = editor.exportJSON();
