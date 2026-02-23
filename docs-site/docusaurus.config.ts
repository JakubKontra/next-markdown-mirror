import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'next-markdown-mirror',
  tagline: 'Self-hosted Markdown for AI agents',
  favicon: 'img/favicon.ico',

  url: 'https://jakubkontra.github.io',
  baseUrl: '/next-markdown-mirror/',

  organizationName: 'JakubKontra',
  projectName: 'next-markdown-mirror',

  onBrokenLinks: 'throw',

  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl:
            'https://github.com/jakubkontra/next-markdown-mirror/tree/main/docs-site/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/og-image.png',
    announcementBar: {
      id: 'ai_invisible',
      content:
        'Your site is <strong>invisible</strong> to AI agents. <a href="/next-markdown-mirror/docs/getting-started">Fix it in 3 minutes &rarr;</a>',
      backgroundColor: '#dc2626',
      textColor: '#ffffff',
      isCloseable: true,
    },
    navbar: {
      title: 'next-markdown-mirror',
      logo: {
        alt: 'next-markdown-mirror Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'Docs',
        },
        {
          href: 'https://www.npmjs.com/package/next-markdown-mirror',
          label: 'npm',
          position: 'right',
        },
        {
          href: 'https://github.com/jakubkontra/next-markdown-mirror',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Getting Started',
              to: '/docs/getting-started',
            },
            {
              label: 'How It Works',
              to: '/docs/how-it-works',
            },
            {
              label: 'Configuration',
              to: '/docs/configuration',
            },
            {
              label: 'API Reference',
              to: '/docs/api-reference',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'npm',
              href: 'https://www.npmjs.com/package/next-markdown-mirror',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/jakubkontra/next-markdown-mirror',
            },
            {
              label: 'llmstxt.org',
              href: 'https://llmstxt.org/',
            },
          ],
        },
      ],
      copyright: `Copyright ${new Date().getFullYear()} Jakub Kontra. MIT License.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'typescript', 'yaml', 'markdown'],
    },
    colorMode: {
      defaultMode: 'light',
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
