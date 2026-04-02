module.exports = {
  siteTitle: 'Sazami',
  srcDir: 'docs',
  outputDir: 'site',

  search: true,
  autoTitleFromH1: true,
  copyCode: true,

  theme: {
    name: 'sky',
    defaultMode: 'system',
    enableModeToggle: true,
  },

  navigation: [
    { title: 'Home', path: '/', icon: 'home' },
    {
      title: 'Guide',
      icon: 'book',
      collapsible: true,
      children: [
        { title: 'Primitives', path: '/primitives/' },
        { title: 'Component Base', path: '/component-base/' },
        { title: 'Config & Theming', path: '/config-theming/' },
        { title: 'Curvomorphism', path: '/curvomorphism/' },
      ],
    },
    { title: 'API Reference', path: '/api-reference/', icon: 'code' },
  ],

  footer: 'Sazami. Apache License v2.0.',
};
