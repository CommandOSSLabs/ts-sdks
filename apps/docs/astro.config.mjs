// @ts-check

import starlight from '@astrojs/starlight'
import { defineConfig } from 'astro/config'
import starlightLlmsTxt from 'starlight-llms-txt'

// https://astro.build/config
export default defineConfig({
  site: 'http://localhost:4321',
  integrations: [
    starlight({
      title: 'Site Builder SDKs',
      plugins: [starlightLlmsTxt()],
      logo: {
        src: '/src/assets/commandoss_logo.jpg'
      },
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/CommandOSSLabs/ts-sdks'
        }
      ],
      sidebar: [
        {
          label: 'Quick Start',
          autogenerate: { directory: 'quick-start' }
        },
        {
          label: 'Guides',
          autogenerate: { directory: 'guides' }
        },
        {
          label: 'Examples',
          autogenerate: { directory: 'examples' }
        },
        {
          label: 'API Reference',
          items: [
            { label: 'API Reference', slug: 'reference' },
            {
              label: 'WalrusSiteBuilderSdk',
              slug: 'reference/walrus-site-builder-sdk',
              badge: { text: 'Class', variant: 'tip' }
            },
            {
              label: 'WSResources',
              slug: 'reference/ws-resources',
              badge: { text: 'Interface', variant: 'note' }
            },
            {
              label: 'SiteData',
              slug: 'reference/site-data',
              badge: { text: 'Interface', variant: 'note' }
            },
            {
              label: 'ContentType',
              slug: 'reference/content-type',
              badge: { text: 'Enum', variant: 'caution' }
            },
            {
              label: 'IAsset',
              slug: 'reference/i-asset',
              badge: { text: 'Interface', variant: 'note' }
            },
            {
              label: 'Metadata',
              slug: 'reference/metadata',
              badge: { text: 'Interface', variant: 'note' }
            }
          ]
        },
        {
          label: 'Migration Guides',
          items: [{ label: 'Versioning', slug: 'migration-guides' }]
        }
      ],
      customCss: ['./src/styles.css']
    })
  ]
})
