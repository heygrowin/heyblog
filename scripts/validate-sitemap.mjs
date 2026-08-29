#!/usr/bin/env node
/**
 * Post-build guard against the ways sitemap.xml has silently broken before:
 * a BOM or stray whitespace before the XML declaration, unescaped `&` in a
 * URL, a non-W3C <lastmod>, URLs pointing at the wrong host, or a root/child
 * mismatch (e.g. a <sitemapindex> root wrapping <url> entries, or vice versa)
 * — well-formed XML that xmllint passes and Google still rejects, because it
 * isn't a valid *sitemap*. Checks below encode the sitemaps.org 0.9 XSD
 * (https://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd) rather than just
 * well-formedness. Run after `astro build` — see the "build" script in
 * package.json.
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

// --- Root/child format check -----------------------------------------------
// The sitemaps.org namespace is shared by two DIFFERENT root elements:
// <urlset> (a page sitemap, children are <url>) and <sitemapindex> (an index
// of other sitemap files, children are <sitemap>). Both are well-formed XML
// under the same namespace, so xmllint alone can't tell them apart — a
// <sitemapindex> wrapping <url> entries, or a <urlset> wrapping <sitemap>
// entries, passes well-formedness and gets rejected by Google. This site only
// ever emits a single flat page list, so the root must be exactly <urlset>
// and the other family must not appear anywhere.
const rootMatch = text.match(/^<\?xml[^>]*\?>\s*<([a-zA-Z]+)[\s>]/);
if (!rootMatch) fail('could not find a root element after the XML declaration');
const rootTag = rootMatch[1];
if (rootTag !== 'urlset') {
  fail(`root element is <${rootTag}>, expected <urlset> — this site only publishes a flat page list, never a sitemap index`);
}
if (/<\/?sitemapindex[\s>]/.test(text)) {
  fail('found a <sitemapindex> element inside a <urlset> document — root/child format is mixed');
}
if (/<\/?sitemap[\s>]/.test(text)) {
  fail('found a <sitemap> (index entry) element inside a <urlset> document — that child belongs under <sitemapindex>, not here');
}

if ((text.match(/<urlset[ >]/g) || []).length !== 1) {
  fail('expected exactly one <urlset> root element');
}
if (!/<\/urlset>\s*$/.test(text)) {
  fail('file does not end with </urlset>');
}

const urlBlocks = [...text.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((m) => m[1]);
const openUrl = (text.match(/<url>/g) || []).length;
const closeUrl = (text.match(/<\/url>/g) || []).length;
if (openUrl === 0) fail('no <url> entries found');
if (openUrl !== closeUrl || openUrl !== urlBlocks.length) {
  fail(`mismatched <url> tags: ${openUrl} open, ${closeUrl} close`);
}

// SITE.url is the single source of truth for the production origin
// (see src/config.ts); read it rather than hardcoding a second copy here.
const configText = readFileSync(configPath, 'utf-8');
const urlMatch = configText.match(/url:\s*'([^']+)'/);
if (!urlMatch) fail('could not find SITE.url in src/config.ts to compare against');
const expectedOrigin = urlMatch[1];

// --- Per-<url> structural + value validation (mirrors the XSD's tUrl type) -
const KNOWN_CHILDREN = new Set(['loc', 'lastmod', 'changefreq', 'priority']);
const CHANGEFREQ_VALUES = new Set([
  'always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never',
]);
const rawAmpersand = /&(?!amp;|lt;|gt;|quot;|apos;|#\d+;|#x[0-9a-f]+;)/i;
const w3cDate = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2}))?$/;

let totalLocs = 0;

for (const block of urlBlocks) {
  const children = [...block.matchAll(/<([a-zA-Z]+)>/g)].map((m) => m[1]);
  for (const child of children) {
    if (!KNOWN_CHILDREN.has(child)) {
      fail(`<url> contains unrecognized child <${child}> — not part of the sitemaps.org 0.9 schema`);
    }
  }

  const locs = [...block.matchAll(/<loc>([^<]*)<\/loc>/g)].map((m) => m[1]);
  if (locs.length !== 1) {
    fail(`<url> block must contain exactly one <loc>, found ${locs.length}: ${JSON.stringify(block.slice(0, 120))}`);
  }
  const loc = locs[0];
  totalLocs += 1;

  if (!loc.startsWith(expectedOrigin)) {
    fail(`<loc>${loc}</loc> does not use the production origin ${expectedOrigin}`);
  }
  if (rawAmpersand.test(loc)) {
    fail(`<loc>${loc}</loc> contains an unescaped &`);
  }
  if (loc.length < 12 || loc.length > 2048) {
    fail(`<loc>${loc}</loc> is ${loc.length} chars — the XSD requires 12-2048`);
  }

  const lastmods = [...block.matchAll(/<lastmod>([^<]*)<\/lastmod>/g)].map((m) => m[1]);
  if (lastmods.length > 1) fail(`<url>${loc}</url> has more than one <lastmod>`);
  for (const lastmod of lastmods) {
    if (!w3cDate.test(lastmod) || Number.isNaN(Date.parse(lastmod))) {
      fail(`<lastmod>${lastmod}</lastmod> on ${loc} is not a valid W3C date`);
    }
  }

  const changefreqs = [...block.matchAll(/<changefreq>([^<]*)<\/changefreq>/g)].map((m) => m[1]);
  if (changefreqs.length > 1) fail(`<url>${loc}</url> has more than one <changefreq>`);
  for (const cf of changefreqs) {
    if (!CHANGEFREQ_VALUES.has(cf)) {
      fail(`<changefreq>${cf}</changefreq> on ${loc} is not one of always|hourly|daily|weekly|monthly|yearly|never`);
    }
  }

  const priorities = [...block.matchAll(/<priority>([^<]*)<\/priority>/g)].map((m) => m[1]);
  if (priorities.length > 1) fail(`<url>${loc}</url> has more than one <priority>`);
  for (const p of priorities) {
    const n = Number(p);
    if (!/^\d(\.\d+)?$/.test(p) || Number.isNaN(n) || n < 0.0 || n > 1.0) {
      fail(`<priority>${p}</priority> on ${loc} must be a decimal between 0.0 and 1.0`);
    }
  }
}

if (totalLocs === 0) fail('no <loc> entries found');

console.log(`✓ sitemap.xml valid — ${totalLocs} URLs, all on ${expectedOrigin}, root/child structure matches urlset 0.9`);
