import { defineConfig } from 'astro/config';
import { SITE } from './src/config';

// https://astro.build/config
export default defineConfig({
  site: SITE.url,

  /**
   * Trailing-slash policy. Canonical URLs carry no trailing slash.
   *
   *   trailingSlash: 'never'  — dev rejects /blog/some-post/, matching production
   *   build.format: 'file'    — emits dist/blog/some-post.html
   *
   * Cloudflare Pages serves `foo.html` at the extensionless `/foo` and issues a
   * 308 from both `/foo.html` and `/foo/`, so a page is never reachable at two
   * indexable URLs. Canonical tags come from the same rule in src/lib/urls.ts.
   */
  trailingSlash: 'never',
  build: { format: 'file' },

  /** No adapter: fully static output. Cloudflare Pages serves dist/ directly. */
  output: 'static',

  /** Astro 7 default. Stated explicitly because it affects whitespace in prose. */
  compressHTML: 'jsx',

  devToolbar: { enabled: false },
});
