import type { APIRoute } from 'astro';

import { SITE, CATEGORIES } from '../config';
import { getIndexablePosts } from '../lib/posts';
import { absoluteUrl, categoryPath, paginatedPath, postPath } from '../lib/urls';

interface SitemapEntry {
  path: string;
  lastmod?: Date;
  changefreq: 'daily' | 'weekly' | 'monthly' | 'yearly';
  priority: string;
}

const escapeXml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

/*
 * Hand-rolled rather than using @astrojs/sitemap, for two reasons: that
 * integration emits /sitemap-index.xml plus /sitemap-0.xml instead of the single
 * /sitemap.xml this site advertises, and this way draft exclusion is explicit
 * rather than a side effect of which routes happened to be built.
 */
export const GET: APIRoute = async () => {
  const posts = await getIndexablePosts();

  const entries: SitemapEntry[] = [
    { path: '/', changefreq: 'daily', priority: '1.0' },
    { path: '/blog', changefreq: 'daily', priority: '0.9' },
    { path: '/about', changefreq: 'monthly', priority: '0.5' },
    { path: '/contact', changefreq: 'yearly', priority: '0.3' },
    { path: '/privacy-policy', changefreq: 'yearly', priority: '0.2' },
    { path: '/terms', changefreq: 'yearly', priority: '0.2' },
    { path: '/disclaimer', changefreq: 'yearly', priority: '0.2' },
  ];

  // Archive pagination beyond page 1.
  const blogPages = Math.ceil(posts.length / SITE.postsPerPage);
  for (let page = 2; page <= blogPages; page += 1) {
    entries.push({ path: paginatedPath('/blog', page), changefreq: 'weekly', priority: '0.4' });
  }

  for (const category of CATEGORIES) {
    const inCategory = posts.filter((post) => post.data.category === category.id);
    const base = categoryPath(category.id);

    entries.push({
      path: base,
      changefreq: 'weekly',
      priority: '0.7',
      lastmod: inCategory[0]?.data.updatedDate ?? inCategory[0]?.data.publishDate,
    });

    const pageCount = Math.ceil(inCategory.length / SITE.postsPerPage);
    for (let page = 2; page <= pageCount; page += 1) {
      entries.push({ path: paginatedPath(base, page), changefreq: 'weekly', priority: '0.3' });
    }
  }

  for (const post of posts) {
    entries.push({
      path: postPath(post.data.slug),
      lastmod: post.data.updatedDate ?? post.data.publishDate,
      changefreq: 'monthly',
      priority: '0.8',
    });
  }

  const urls = entries
    .map((entry) => {
      const lastmod = entry.lastmod
        ? `\n    <lastmod>${entry.lastmod.toISOString().slice(0, 10)}</lastmod>`
        : '';
      return `  <url>
    <loc>${escapeXml(absoluteUrl(entry.path))}</loc>${lastmod}
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
