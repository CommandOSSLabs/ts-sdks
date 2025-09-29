---
title: Examples
description: Interactive playground and examples for Site Builder SDK.
---

import { Tabs, TabItem, Card, CardGrid } from '@astrojs/starlight/components';

## Interactive Playground

:::tip[Try it live]
Experience Site Builder SDK in action:
[open the playground](http://localhost:3000) - Interactive Next.js playground with real-time examples.
:::

## Running the Examples

### Prerequisites

Make sure you have the following installed:
- **Node.js** 18.0 or higher
- **pnpm** 8.0 or higher (recommended)
- **Git**

### Project Structure

This monorepo contains several applications and packages:

```
ts-sdks/
├── apps/
│   ├── docs/          # Documentation site (Port: 4321)
│   └── playground/    # Interactive playground (Port: 3000)
├── packages/
│   └── site-builder/  # Core SDK package
└── configs/           # Shared configurations
```

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/CommandOSSLabs/ts-sdks
   cd ts-sdks
   ```

2. **Install dependencies**
   <Tabs syncKey="pkg">
   <TabItem label="pnpm">
   
   ```bash
   pnpm install
   ```
   
   </TabItem>
   <TabItem label="npm">
   
   ```bash
   npm install
   ```
   
   </TabItem>
   <TabItem label="yarn">
   
   ```bash
   yarn install
   ```
   
   </TabItem>
   </Tabs>

3. **Start development servers**
   <Tabs syncKey="pkg">
   <TabItem label="pnpm">
   
   ```bash
   # Start all services
   pnpm run dev
   
   # Or start individually
   pnpm --filter playground run dev    # Playground on port 3000
   pnpm --filter docs run dev          # Docs on port 4321
   ```
   
   </TabItem>
   <TabItem label="npm">
   
   ```bash
   # Start all services
   npm run dev
   
   # Or start individually
   npm --workspace=playground run dev  # Playground on port 3000
   npm --workspace=docs run dev        # Docs on port 4321
   ```
   
   </TabItem>
   <TabItem label="yarn">
   
   ```bash
   # Start all services
   yarn dev
   
   # Or start individually
   yarn workspace playground dev       # Playground on port 3000
   yarn workspace docs dev             # Docs on port 4321
   ```
   
   </TabItem>
   </Tabs>