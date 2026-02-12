import CIHotspot from 'js-cloudimage-hotspot';

var viewer = new CIHotspot('#viewer', {
  src: 'https://scaleflex.cloudimg.io/v7/plugins/js-cloudimage-hotspot/spacejoy-unsplash.jpg',
  theme: 'light',
  hotspots: [
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
  ],
});
