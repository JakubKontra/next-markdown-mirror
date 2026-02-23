import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docsSidebar: [
    'getting-started',
    'how-it-works',
    'configuration',
    'api-reference',
    'llms-txt',
    'comparison',
    {
      type: 'category',
      label: 'Advanced',
      items: [
        'advanced/custom-rules',
        'advanced/content-filtering',
        'advanced/standalone-usage',
      ],
    },
  ],
};

export default sidebars;
