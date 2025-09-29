---
title: Welcome to Site Builder SDK
description: Get started building decentralized websites with Site Builder SDK.
template: splash
hero:
  tagline: Build and deploy decentralized websites on Walrus + Sui
  image:
    file: ../../assets/houston.webp
  actions:
    - text: Get Started
      link: /quick-start/installing/
      icon: right-arrow
    - text: API Reference
      link: /reference/
      icon: external
      variant: minimal
head:
  - tag: title
    content: Site Builder SDK Documentation
  - tag: style
    content: >-
      .hero-html {
        --size: min(10rem, calc(5rem + 6vw));
        --blur: calc(var(--size) / 5);
        --x-shift: calc(var(--size) / 5);
        --y-shift: calc(var(--size) / 10);
        font-size: var(--size);
        line-height: var(--size);
        justify-content: center;
        filter:
          drop-shadow(0 calc(-1 * var(--x-shift)) var(--blur) var(--sl-color-blue))
          drop-shadow(calc(-1 * var(--x-shift)) var(--y-shift) var(--blur) var(--sl-color-cyan))
          drop-shadow(var(--x-shift) var(--y-shift) var(--blur) var(--sl-color-blue-low));
        z-index: -1;
      }
      [data-has-hero] header {
        border-color: transparent;
        background-color: transparent;
        backdrop-filter: blur(1rem);
      }
      .hero h1 { text-wrap: balance }
      [role="tabpanel"] {
        margin-top: 0 !important;
      }
      iframe {
        border: 0px solid var(--sl-color-gray-5);
        border-top: 0;
        outline-offset: -2px;
        width: 100%;
        height: 24rem !important;
      }
      .demo {
        padding: 1rem;
        max-width: 50rem;
        margin: 0 auto 8rem;
        margin-top: 100px;
        background-color: var(--sl-color-black);
        filter:
          drop-shadow(0 0 0.25rem var(--sl-color-blue-low))
          drop-shadow(-0.5rem 0.5rem 1rem var(--sl-color-accent))
          drop-shadow(0.5rem -0.5rem 1rem var(--sl-color-blue-low));
      }
      @media (min-width: 30rem) {
        .demo {
          padding: 2.5rem;
        }
      }
---

## Installation

<Tabs syncKey="pkg">
<TabItem label="npm">

```sh
npm install @cmdoss/site-builder
```

</TabItem>
<TabItem label="pnpm">

```sh
pnpm add @cmdoss/site-builder
```


</TabItem>
<TabItem label="yarn">

```sh
yarn add @cmdoss/site-builder
```

</TabItem>
</Tabs>

:::tip[See it in action]
Try Site Builder SDK in your browser:
[open the playground](http://localhost:3000).
:::


import { Card, CardGrid, Tabs, TabItem } from '@astrojs/starlight/components';

<div class="demo">

## LLM documentation

We have `LLM` so you can 

    <Tabs>
    	<TabItem label="llms.txt">
    		<iframe src="/llms.txt" title="llms.txt file for this site"></iframe>
    	</TabItem>
    	<TabItem label="llms-full.txt">
    		<iframe
    			src="/llms-full.txt"
    			title="llms-full.txt file for this site"
    		></iframe>
    	</TabItem>
    	<TabItem label="llms-small.txt">
    		<iframe
    			src="/llms-small.txt"
    			title="llms-small.txt file for this site"
    		></iframe>
    	</TabItem>
    </Tabs>

</div>

## Next steps

<CardGrid stagger>
	<Card title="Get Started" icon="rocket">
		Follow our [installation guide](/quick-start/installing/) to set up Site Builder SDK in your project.
	</Card>
	<Card title="Explore Examples" icon="code">
		Check out [real-world examples](/examples/) to see Site Builder SDK in action.
	</Card>
	<Card title="API Reference" icon="open-book">
		Dive into the complete [API documentation](/reference/) for detailed usage.
	</Card>
	<Card title="Configuration" icon="setting">
		Learn about [configuration options](/guides/configuration/) and authentication setup.
	</Card>
</CardGrid>
