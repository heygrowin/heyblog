#!/usr/bin/env node
/**
 * Post-build guard for the AdSense wiring — checks what actually ended up in
 * dist/ against what the environment said should be there, so a
 * misconfigured build fails loudly instead of silently shipping either a
 * missing ad script or (worse) one that shouldn't be there. Mirrors
 * validate-sitemap.mjs's style; run after `astro build`.
 *
 * Usage: node scripts/verify-adsense.mjs
 * Reads the SAME env vars the build itself read (PUBLIC_ADS_ENABLED,
 * PUBLIC_ADSENSE_PUBLISHER_ID, PUBLIC_ADSENSE_MODE) — run it in the same
 * shell/CI step as the build, not a separate one with a different env.
 */
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const distDir = path.join(root, 'dist');

function fail(message) {
  console.error(`✗ AdSense verification failed: ${message}`);
  process.exit(1);
}

if (!existsSync(distDir)) {
  fail(`${distDir} does not exist — did "astro build" run first?`);
}

const adsEnabled = process.env.PUBLIC_ADS_ENABLED === 'true';
const publisherId = (process.env.PUBLIC_ADSENSE_PUBLISHER_ID ?? '').trim();
const scriptShouldRender = adsEnabled && publisherId.length > 0;

// Pick one representative built page to check for the script tag — the home
// page always exists and Head.astro renders identically on every page.
const indexPath = path.join(distDir, 'index.html');
if (!existsSync(indexPath)) fail(`${indexPath} not found`);
const indexHtml = readFileSync(indexPath, 'utf-8');

const scriptPattern = /pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js\?client=ca-pub-([0-9]+)/;
const scriptMatch = indexHtml.match(scriptPattern);

if (scriptShouldRender) {
  if (!scriptMatch) {
    fail('PUBLIC_ADS_ENABLED=true and a publisher ID were set, but no AdSense script ' +
        'tag was found in the built index.html');
  }
  if (scriptMatch[1] !== publisherId) {
    fail(`built script tag uses publisher ID "${scriptMatch[1]}", expected "${publisherId}"`);
  }
  console.log(`✓ AdSense script present with the configured publisher ID (ca-pub-${publisherId})`);
} else {
  if (scriptMatch) {
    fail('AdSense is NOT supposed to be enabled (PUBLIC_ADS_ENABLED/publisher ID unset or false), ' +
        `but an AdSense script tag was found anyway (ca-pub-${scriptMatch[1]})`);
  }
  console.log('✓ AdSense disabled — no script tag in the built output, as expected');
}

// A hardcoded/placeholder-looking publisher ID would show up here even if
// the env var were somehow committed — belt and braces against exactly the
// "invented publisher ID" failure mode the spec warns about.
const FORBIDDEN_PLACEHOLDER_IDS = ['0000000000000000', '1234567890123456', 'XXXXXXXXXXXXXXXX'];
if (scriptMatch && FORBIDDEN_PLACEHOLDER_IDS.includes(scriptMatch[1])) {
  fail(`the built publisher ID "${scriptMatch[1]}" looks like a placeholder, not a real one`);
}
const envFiles = ['.env', '.env.example', '.env.production'];
for (const f of envFiles) {
  const p = path.join(root, f);
  if (!existsSync(p)) continue;
  const text = readFileSync(p, 'utf-8');
  // Match only up to end-of-line so an empty assignment ("KEY=") never
  // false-positives against a comment further down the file — \s* alone
  // crosses newlines and did exactly that on the first run of this script.
  const m = text.match(/^PUBLIC_ADSENSE_PUBLISHER_ID[ \t]*=[ \t]*([^\r\n]*)/m);
  const value = (m?.[1] ?? '').trim();
  if (value && f === '.env.example') {
    fail(`${f} must never contain a real publisher ID — found "${value}"`);
  }
}

// ads.txt: only meaningful content when a publisher ID is configured.
const adsTxtPath = path.join(distDir, 'ads.txt');
if (existsSync(adsTxtPath)) {
  const adsTxt = readFileSync(adsTxtPath, 'utf-8').trim();
  if (publisherId) {
    const expected = `google.com, pub-${publisherId}, DIRECT, f08c47fec0942fa0`;
    if (adsTxt !== expected) {
      fail(`dist/ads.txt is "${adsTxt}", expected "${expected}"`);
    }
    console.log('✓ ads.txt generated with the configured publisher ID');
  } else if (/^google\.com,\s*pub-/i.test(adsTxt)) {
    fail(`dist/ads.txt contains a publisher line ("${adsTxt}") but no publisher ID is configured — ` +
        'this would be a fake ID');
  } else {
    console.log('✓ ads.txt present but correctly contains no publisher line (not configured)');
  }
} else if (publisherId) {
  fail('a publisher ID is configured but dist/ads.txt was not generated');
}

console.log(`✓ AdSense verification passed (mode: ${process.env.PUBLIC_ADSENSE_MODE || 'auto'})`);
