import { SITE } from '../config';

/**
 * Canonical path rules, matching `trailingSlash: 'never'` in astro.config.ts
 * and how Cloudflare Pages serves `.html` files. Root is the sole exception —
 * "/" cannot lose its slash.
 */
export function normalizePath(path: string): string {
  const withLeading = path.startsWith('/') ? path : `/${path}`;
  if (withLeading === '/') return '/';
  return withLeading.replace(/\/+$/, '');
}

/** Absolute URL on the production origin. Used for canonicals, OG and JSON-LD. */
export function absoluteUrl(path: string): string {
  return new URL(normalizePath(path), SITE.url).href;
}

export const postPath = (slug: string) => `/blog/${slug}`;
export const categoryPath = (id: string) => `/category/${id}`;

/** Page 1 of any paginated route drops the /1 suffix. */
export function paginatedPath(base: string, pageNumber: number): string {
  return pageNumber <= 1 ? normalizePath(base) : `${normalizePath(base)}/${pageNumber}`;
}
