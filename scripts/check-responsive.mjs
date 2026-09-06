#!/usr/bin/env node
/**
 * Responsive regression test.
 *
 * Serves dist/ and asserts, at every width a phone actually reports, that
 *
 *     document.documentElement.scrollWidth <= window.innerWidth
 *
 * and then — because a page can pass that check while a single element is
 * still wider than the viewport and merely clipped by an ancestor — walks the
 * DOM for individual offenders and names them.
 *
 * This exists because the site previously carried `overflow-x: hidden` on
 * <html>. That silenced the symptom, so every overflow bug stayed invisible
 * and unfixed. With the clip removed, this script is what keeps the guarantee
 * honest.
 *
 * Usage:
 *   npm run build
 *   node scripts/check-responsive.mjs                 # assert only
 *   node scripts/check-responsive.mjs --shots         # also write screenshots
 *
 * Playwright is a devDependency and its browsers are already installed on this
 * machine; no other testing stack is introduced.
 */
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';
import { chromium } from 'playwright';

const DIST = resolve('dist');
const SHOT_DIR = resolve('.responsive-shots');
const WANT_SHOTS = process.argv.includes('--shots');

/** Widths real phones report, then the progressive-enhancement breakpoints. */
const WIDTHS = [320, 360, 375, 390, 393, 412, 430, 480, 600, 768, 834, 1024, 1280, 1440, 1920];
/** Screenshots are only worth taking at a representative subset. */
const SHOT_SIZES = [
  [320, 800],
  [390, 844],
  [430, 932],
  [600, 900],
  [834, 1112],
  [1280, 900],
  [1920, 1080],
];

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml',
  '.json': 'application/json',
  '.ico': 'image/x-icon',
};

/** Static server that mirrors Cloudflare Pages' extensionless routing. */
function serve() {
  const server = createServer(async (req, res) => {
    const url = decodeURIComponent((req.url || '/').split('?')[0]);
    const candidates =
      url === '/'
        ? ['index.html']
        : [url.replace(/^\//, ''), `${url.replace(/^\//, '')}.html`, `${url.replace(/^\//, '')}/index.html`];
    for (const rel of candidates) {
      const file = join(DIST, rel);
      if (!file.startsWith(DIST) || !existsSync(file)) continue;
      try {
        const body = await readFile(file);
        res.writeHead(200, { 'content-type': MIME[extname(file)] || 'application/octet-stream' });
        res.end(body);
        return;
      } catch {
        /* fall through to 404 */
      }
    }
    res.writeHead(404, { 'content-type': 'text/plain' });
    res.end('not found');
  });
  return new Promise((ok) => server.listen(0, '127.0.0.1', () => ok(server)));
}

/**
 * Runs in the page. Returns the document's overflow plus every element that is
 * itself wider than the viewport — the ones a root-level clip would have
 * hidden. Elements are reported with enough identity to find them in source.
 */
const AUDIT = () => {
  const vw = window.innerWidth;
  const offenders = [];
  const seen = new Set();
  for (const el of document.querySelectorAll('body *')) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) continue;
    const overflowsRight = Math.round(r.right) > vw + 1;
    const tooWide = Math.round(r.width) > vw + 1;
    if (!overflowsRight && !tooWide) continue;
    // Content inside a container that scrolls horizontally on purpose — a
    // code block, a wide table's wrapper — is not a page-level bug. The
    // container's own box fits the viewport; what it holds is meant to be
    // pannable. Skip the scroller itself and everything inside it.
    const style = getComputedStyle(el);
    const scrolls = /(auto|scroll)/.test(style.overflowX);
    if (scrolls && Math.round(r.width) <= vw + 1) continue;
    let inScroller = false;
    for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
      const ps = getComputedStyle(p);
      if (/(auto|scroll)/.test(ps.overflowX) && Math.round(p.getBoundingClientRect().width) <= vw + 1) {
        inScroller = true;
        break;
      }
    }
    if (inScroller) continue;
    const id = `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ''}${
      el.className && typeof el.className === 'string'
        ? `.${el.className.trim().split(/\s+/).slice(0, 3).join('.')}`
        : ''
    }`;
    if (seen.has(id)) continue;
    seen.add(id);
    offenders.push({
      selector: id,
      width: Math.round(r.width),
      right: Math.round(r.right),
      scrolls,
    });
  }
  return {
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: vw,
    offenders: offenders.slice(0, 12),
  };
};

const PAGES = process.env.RESPONSIVE_PAGES
  ? process.env.RESPONSIVE_PAGES.split(',').map((s) => s.trim()).filter(Boolean)
  : null;

async function main() {
  const server = await serve();
  const { port } = server.address();
  const base = `http://127.0.0.1:${port}`;

  const pages = PAGES ?? JSON.parse(await readFile(resolve('scripts/responsive-pages.json'), 'utf8'));

  const browser = await chromium.launch();
  let failures = 0;
  let checks = 0;

  if (WANT_SHOTS) await mkdir(SHOT_DIR, { recursive: true });

  for (const path of pages) {
    const ctx = await browser.newContext({ deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    for (const width of WIDTHS) {
      await page.setViewportSize({ width, height: 900 });
      const res = await page.goto(`${base}${path}`, { waitUntil: 'load' });
      if (!res || res.status() >= 400) {
        console.error(`  ✗ ${path} @ ${width} → HTTP ${res ? res.status() : 'no response'}`);
        failures += 1;
        continue;
      }
      const out = await page.evaluate(AUDIT);
      checks += 1;
      const overflow = out.scrollWidth - out.innerWidth;
      if (overflow > 1 || out.offenders.length) {
        failures += 1;
        console.error(
          `  ✗ ${path} @ ${width}px — scrollWidth ${out.scrollWidth} vs ${out.innerWidth} (+${overflow})`,
        );
        for (const o of out.offenders) {
          console.error(`      ${o.selector}  w=${o.width} right=${o.right}`);
        }
      }
    }
    if (WANT_SHOTS) {
      for (const [w, h] of SHOT_SIZES) {
        await page.setViewportSize({ width: w, height: h });
        await page.goto(`${base}${path}`, { waitUntil: 'load' });
        const name = `${path.replace(/[^\w-]+/g, '_') || 'index'}@${w}x${h}.png`;
        await page.screenshot({ path: join(SHOT_DIR, name), fullPage: false });
      }
    }
    await ctx.close();
  }

  await browser.close();
  server.close();

  console.log(`\n${checks} checks across ${pages.length} page(s) × ${WIDTHS.length} widths`);
  if (failures) {
    console.error(`✗ ${failures} responsive failure(s)`);
    process.exit(1);
  }
  console.log('✓ no page-level horizontal overflow at any width');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
