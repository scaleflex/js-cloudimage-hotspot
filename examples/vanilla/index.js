import CIHotspot from 'js-cloudimage-hotspot';

var viewer = new CIHotspot('#viewer', {
  src: 'https://scaleflex.cloudimg.io/v7/plugins/js-cloudimage-hotspot/spacejoy-unsplash.jpg',
  theme: 'light',
  hotspots: [
    {
      id: 'lamp',
      x: '69%',
      y: '32%',
      label: 'Designer Lamp',
      trigger: 'hover',
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
      x: '50%',
      y: '60%',
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
      x: '20%',
      y: '45%',
      label: 'Indoor Plant',
      trigger: 'hover',
      placement: 'left',
      data: {
        title: 'Indoor Plant',
        price: '$35',
        description: 'Low-maintenance greenery for any room.',
      },
    },
  ],
});
