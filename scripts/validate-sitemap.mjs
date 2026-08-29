#!/usr/bin/env node
/**
 * Post-build guard against the ways sitemap.xml has silently broken before:
 * a BOM or stray whitespace before the XML declaration, unescaped `&` in a
 * URL, a non-W3C <lastmod>, or URLs pointing at the wrong host. Run after
 * `astro build` — see the "build" script in package.json.
 */
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const sitemapPath = path.join(root, 'dist', 'sitemap.xml');
const configPath = path.join(root, 'src', 'config.ts');

function fail(message) {
  console.error(`✗ sitemap validation failed: ${message}`);
  process.exit(1);
}

if (!existsSync(sitemapPath)) {
  fail(`${sitemapPath} does not exist — did "astro build" run first?`);
}

const raw = readFileSync(sitemapPath);
const text = raw.toString('utf-8');

if (raw[0] === 0xef && raw[1] === 0xbb && raw[2] === 0xbf) {
  fail('file starts with a UTF-8 BOM — Google refuses to parse this');
}
if (!/^<\?xml version="1\.0" encoding="UTF-8"\?>/.test(text)) {
  fail(
    `file must start immediately with <?xml version="1.0" encoding="UTF-8"?> (no leading blank line), found: ${JSON.stringify(text.slice(0, 40))}`,
  );
}
if (!text.includes('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"')) {
  fail('missing/incorrect sitemap namespace (expected http://www.sitemaps.org/schemas/sitemap/0.9)');
}
if ((text.match(/<urlset[ >]/g) || []).length !== 1) {
  fail('expected exactly one <urlset> root element');
}
if (!/<\/urlset>\s*$/.test(text)) {
  fail('file does not end with </urlset>');
}

const openUrl = (text.match(/<url>/g) || []).length;
const closeUrl = (text.match(/<\/url>/g) || []).length;
if (openUrl === 0) fail('no <url> entries found');
if (openUrl !== closeUrl) fail(`mismatched <url> tags: ${openUrl} open, ${closeUrl} close`);

// SITE.url is the single source of truth for the production origin
// (see src/config.ts); read it rather than hardcoding a second copy here.
const configText = readFileSync(configPath, 'utf-8');
const urlMatch = configText.match(/url:\s*'([^']+)'/);
if (!urlMatch) fail('could not find SITE.url in src/config.ts to compare against');
const expectedOrigin = urlMatch[1];

const locs = [...text.matchAll(/<loc>([^<]*)<\/loc>/g)].map((m) => m[1]);
if (locs.length === 0) fail('no <loc> entries found');

const rawAmpersand = /&(?!amp;|lt;|gt;|quot;|apos;|#\d+;|#x[0-9a-f]+;)/i;
for (const loc of locs) {
  if (!loc.startsWith(expectedOrigin)) {
    fail(`<loc>${loc}</loc> does not use the production origin ${expectedOrigin}`);
  }
  if (rawAmpersand.test(loc)) {
    fail(`<loc>${loc}</loc> contains an unescaped &`);
  }
}

const w3cDate = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2}))?$/;
const lastmods = [...text.matchAll(/<lastmod>([^<]*)<\/lastmod>/g)].map((m) => m[1]);
for (const lastmod of lastmods) {
  if (!w3cDate.test(lastmod) || Number.isNaN(Date.parse(lastmod))) {
    fail(`<lastmod>${lastmod}</lastmod> is not a valid W3C date`);
  }
}

console.log(`✓ sitemap.xml valid — ${locs.length} URLs, all on ${expectedOrigin}`);
