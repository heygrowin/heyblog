---
title: "The Decision: @every-app/open-seo"
description: "A framework-agnostic JavaScript library for synchronizing SEO data with client-side and server-side rendering."
slug: the-decision-every-app-open-seo
publishDate: 2026-08-31T14:41:42Z
category: ai-tools
tags:
  - seo
  - javascript
  - framework-agnostic
heroImage: /images/the-decision-every-app-open-seo.jpg
heroImageAlt: "Title card reading “The Decision: @every-app/open-seo” set in white on a dark green gradient with concentric circle motifs"
author: "The HeyBlog Desk"
draft: false
sourceTopicId: topic_48542
---

## Overview  

`@every-app/open-seo` is a JavaScript library that keeps SEO‑related tags, Open Graph data, JSON‑LD scripts and a sitemap synchronized with client‑side routes while also supporting server‑side rendering (SSR). The package is framework‑agnostic; thin adapters are provided for React, Vue and other front‑end stacks. It can replace manual updates of `<title>`, `<meta>` and `<link rel="canonical">` elements that are often required when using lower‑level tools such as `react-helmet`, `next-seo` or `vue-meta`.

---

## Primary purpose and core features  

**Quick answer**: The library automates generation of SEO metadata, Open Graph/Twitter cards, JSON‑LD structured data and a sitemap, and it updates those assets automatically as the user navigates through the application.

### Core functionality  

| Feature | What it does | Typical use case |
|---------|--------------|------------------|
| **Meta‑tag generation** | Reads a declarative configuration (or a function) and outputs `<title>`, `<meta>` and `<link rel="canonical">` tags for each route. | Dynamic product pages where title and description depend on API data. |
| **Open Graph & Twitter cards** | Populates `og:*` and `twitter:*` tags automatically from the same source as the standard meta tags. | Social‑sharing previews that stay accurate after content updates. |
| **JSON‑LD injection** | Inserts structured‑data scripts (e.g., `Article`, `Product`, `BreadcrumbList`) based on a schema definition you provide. | Rich results in Google Search for articles or e‑commerce items. |
| **Sitemap generation** | Scans the route map at build time (or runtime in a Node server) and writes a `sitemap.xml` file, optionally gzipped. | Improves crawlability for large SPAs with many dynamic routes. |
| **Routing awareness** | Hooks into React Router, Vue Router, Next.js App Router, or any custom router that emits navigation events. | Guarantees that meta tags update instantly when the user navigates client‑side. |
| **SSR support** | Exposes a `renderSeo()` helper that can be called during server rendering to embed the correct tags in the HTML response. | Prevents “blank” meta data when search bots request the first HTML payload. |
| **Extensible plugin system** | Allows you to add custom tag generators (e.g., for locale‑specific tags) without modifying the core library. | Companies with proprietary metadata standards. |

The core engine is plain JavaScript; the adapters (`@every-app/open-seo-react`, `@every-app/open-seo-vue`, etc.) expose idiomatic hooks or components for the major front‑end frameworks.

---

## Compatibility quirks and comparison with common alternatives  

### Known compatibility quirks  

* **Node version** – The package requires Node 12 or newer because it uses modern ECMAScript features such as optional chaining.  
* **SSR frameworks** – The `renderSeo()` helper works out of the box with Express‑style servers. When using Next.js 13+ App Router, the helper must be called inside a `generateMetadata` function; otherwise SSR tags will not be injected.  
* **Dynamic route parameters** – Functions that generate meta data receive `{ params, query, request }`. If a router does not provide these objects (e.g., a custom router that only emits a URL string), a small shim is needed to map the URL to parameters.  
* **Bundler tree‑shaking** – The core package is side‑effect‑free, but some adapters import the full core library even if only a subset of features is used. This can increase bundle size in highly optimized builds.  
* **Environment variables** – The library reads `process.env` at import time. Changing environment variables after the initial import will not affect the already‑instantiated configuration.

### Feature comparison  

| Feature | `@every-app/open-seo` | `react-helmet` | `next-seo` | `vue-meta` |
|---------|----------------------|----------------|------------|------------|
| Automatic route‑aware meta updates | ✅ (hooks into router events) | ❌ (manual updates) | ✅ (via Next.js page components) | ✅ (via Vue Router navigation guards) |
| Open Graph & Twitter card generation | ✅ (single source) | ❌ (requires manual tags) | ✅ (built‑in helpers) | ✅ (via custom meta objects) |
| JSON‑LD injection | ✅ (configurable schema) | ❌ (manual script tags) | ✅ (helper component) | ✅ (via meta objects) |
| Sitemap generation | ✅ (built‑in generator) | ❌ (external tool needed) | ✅ (via `next-sitemap` plugin) | ❌ (external tool needed) |
| SSR support | ✅ (`renderSeo` helper) | ✅ (renders on server but requires manual placement) | ✅ (integrated with Next.js) | ✅ (SSR aware) |
| Bundle size (core, gzipped) | ~2 KB | ~3 KB | ~4 KB | ~3 KB |
| Framework adapters | React, Vue, generic | React only | Next.js only | Vue only |
| Plugin extensibility | ✅ (custom tag generators) | ❌ | ❌ | ❌ |

*Bundle sizes are approximate and depend on the bundler configuration; they are provided for relative comparison only.*

---

## Installation and setup  

### General steps  

1. Install the core package and the adapter for your framework.  
2. Create an `open-seo.config.js` file at the project root.  
3. Wrap your router (or register the plugin) with the provider component or composable.  

All commands assume the use of npm; replace with `yarn` if that is your package manager.

### React example  

```bash
npm i @every-app/open-seo @every-app/open-seo-react
```

**Configuration file (`open-seo.config.js`)**

```js
module.exports = {
  baseUrl: process.env.BASE_URL || 'https://example.com',
  defaultMeta: {
    title: 'My Site',
    description: 'A brief description of my site.',
    ogImage: '/default-og-image.png',
    twitterCard: 'summary_large_image',
  },
  routes: [
    {
      path: '/',
      meta: { title: 'Home', description: 'Welcome to the homepage.' },
    },
    {
      path: '/products/:id',
      meta: ({ params }) => ({
        title: `Product ${params.id}`,
        description: `Details for product ${params.id}.`,
        ogImage: `/images/products/${params.id}.jpg`,
      }),
      jsonLd: ({ params }) => ({
        '@type': 'Product',
        name: `Product ${params.id}`,
        image: `${process.env.BASE_URL}/images/products/${params.id}.jpg`,
        description: `Details for product ${params.id}.`,
      }),
    },
  ],
  sitemap: {
    path: '/sitemap.xml',
    exclude: ['/admin/**'],
  },
};
```

**Provider wrapper (`src/App.tsx`)**

```tsx
import { BrowserRouter as Router } from 'react-router-dom';
import { OpenSeoProvider } from '@every-app/open-seo-react';
import routes from './routes';

function App() {
  return (
    <OpenSeoProvider configPath="./open-seo.config.js">
      <Router>{routes}</Router>
    </OpenSeoProvider>
  );
}

export default App;
```

**Dynamic updates in a component (`src/pages/ProductPage.tsx`)**

```tsx
import { useParams } from 'react-router-dom';
import { useSeo } from '@every-app/open-seo-react';
import { useEffect } from 'react';

export default function ProductPage() {
  const { id } = useParams();
  const { setMeta } = useSeo();

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((r) => r.json())
      .then((product) => {
        setMeta({
          title: product.name,
          description: product.shortDescription,
          ogImage: product.imageUrl,
        });
      });
  }, [id]);

  return <div>{/* product UI */}</div>;
}
```

### Vue 3 example  

```bash
npm i @every-app/open-seo @every-app/open-seo-vue
```

**Plugin registration (`main.ts`)**

```ts
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { createOpenSeo } from '@every-app/open-seo-vue';

const app = createApp(App);
app.use(router);
app.use(createOpenSeo({ configPath: './open-seo.config.js' }));
app.mount('#app');
```

**Composable usage (`src/views/ProductView.vue`)**

```vue
<script setup lang="ts">
import { useRoute } from 'vue-router';
import { useSeo } from '@every-app/open-seo-vue';
import { onMounted } from 'vue';

const route = useRoute();
const { setMeta } = useSeo();

onMounted(async () => {
  const product = await fetch(`/api/products/${route.params.id}`).then(r => r.json());
  setMeta({
    title: product.name,
    description: product.shortDescription,
    ogImage: product.imageUrl,
  });
});
</script>

<template>
  <div><!-- product markup --></div>
</template>
```

### Generic Node/Express (SSR) integration  

```bash
npm i @every-app/open-seo
```

```js
// server.js
const express = require('express');
const { renderSeo } = require('@every-app/open-seo');
const app = express();

app.get('*', async (req, res) => {
  const { html, seoTags } = await renderSeo({
    url: req.originalUrl,
    configPath: './open-seo.config.js',
    // Optional: provide a dataFetcher to supply route‑specific data
    dataFetcher: async (url) => {
      // Example: fetch product data based on URL
    },
  });

  res.send(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        ${seoTags}
        <script src="/bundle.js" defer
