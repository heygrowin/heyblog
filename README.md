# HeyBlog

A static, SEO-first publication built with Astro 7. Content arrives as markdown files
written into `src/content/posts/` by a separate Python engine; this repo renders
whatever is there.

**Zero runtime services.** No database, no API, no CMS, no paid dependencies. The site
is fully static at build time and ships no third-party scripts.

- [`CONTENT_SCHEMA.md`](CONTENT_SCHEMA.md) — the contract the content engine targets
- [`DESIGN.md`](DESIGN.md) — colour, type and spacing tokens

---

## Requirements

**Node 22.12 or newer** — Astro 7's minimum. See [`.nvmrc`](.nvmrc).

```bash
node -v    # must print v22.12.0 or higher
```

## Local setup

```bash
npm install
cp .env.example .env    # optional; both flags default to off
npm run dev             # http://localhost:4321
```

### Commands

| Command | What it does |
|---|---|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the built `dist/` locally |
| `npm run check` | TypeScript and Astro diagnostics |
| `npm run sync` | Regenerate content collection types |

> Astro 7 starts `astro dev` as a **background process** when it detects an AI coding
> agent. If `npm run dev` seems to return immediately, the server is already running —
> use `npx astro dev status`, `npx astro dev logs` and `npx astro dev stop`. Set
> `ASTRO_DEV_BACKGROUND=0` to disable this.

---

## Rebranding

Everything brand-related lives in **[`src/config.ts`](src/config.ts)** — site name,
tagline, mission statement, production URL, author, social links, the category list,
posts per page, the email endpoint and the legal entity details. Editing that one file
rebrands the whole site; nothing else hardcodes a brand value.

The category list is the source of truth for the taxonomy: adding an entry gives it an
archive page, a landing-page entry point and a footer link automatically, and extends
the Zod enum that validates every post's `category` field.

---

## Project structure

```
src/
├── config.ts            ← the one file to edit when rebranding
├── schema.ts            ← the Zod content contract
├── content.config.ts    collection wiring
├── content/posts/       ← the engine writes markdown here
├── assets/images/       ← the engine writes hero images here (NOT public/)
├── styles/              tokens, base, typography, layout
├── lib/                 posts, images, urls, reading time, ad splitting, JSON-LD
├── components/
├── layouts/
└── pages/
public/
├── fonts/               3 self-hosted variable woff2
└── images/              og-default.jpg, logo.png
```

---

## Content workflow

The engine writes a markdown file plus its hero image, commits both, and pushes.
Cloudflare Pages builds and deploys. See [`CONTENT_SCHEMA.md`](CONTENT_SCHEMA.md) for the field
rules.

Two things worth knowing here:

- **`draft` defaults to `true`.** A post without an explicit `draft: false` does not
  publish. Drafts are not built at all — no page, no URL, no sitemap or RSS entry.
- **A schema violation fails the build.** That is intentional. A failed build leaves
  the previous deploy live rather than shipping a broken page.

---

## Deploying to Cloudflare Pages

The site is fully static and uses **no Astro adapter**. Cloudflare Pages serves `dist/`
directly.

Cloudflare Pages is the deploy target specifically because its free plan permits
commercial use, and this site runs ads. Free bandwidth is unmetered.

### One-time setup

1. Push this repo to GitHub or GitLab.
2. Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**,
   and pick the repository.
3. Build settings:

   | Setting | Value |
   |---|---|
   | Framework preset | **Astro** |
   | Build command | `npm run build` |
   | Build output directory | `dist` |
   | Root directory | *(leave empty)* |

4. Under **Environment variables**, set the build-time Node version and the flags below.
   Cloudflare defaults to an older Node; Astro 7 needs **22.12+**:

   | Variable | Value |
   |---|---|
   | `NODE_VERSION` | `22.12.0` |
   | `PUBLIC_ADS_ENABLED` | `false` (or leave unset) |

5. **Save and Deploy.**
6. Set `SITE.url` in `src/config.ts` to the real domain and push again — canonical URLs,
   OG tags, RSS and the sitemap all derive from it, so the placeholder points every
   canonical at the wrong origin.

### Environment variables

| Variable | Production | Purpose |
|---|---|---|
| `NODE_VERSION` | `22.12.0` | Required — the build fails on Cloudflare's default Node |
| `PUBLIC_ADS_ENABLED` | `false` / unset | Renders ad markup inside the reserved slots. The slots reserve their height either way, so switching this on shifts nothing. |
| `PUBLIC_SHOW_DRAFTS` | **must stay unset** | Includes `draft: true` posts. Local and preview only. |

Both flags are read as the exact string `"true"`; anything else is off.

### Custom domain

**Workers & Pages → your project → Custom domains**. If the domain is already on
Cloudflare DNS this is a two-click operation. Then update `SITE.url` and redeploy.

### Analytics

Cloudflare Web Analytics is free, cookieless, and sets no identifiers — so it needs no
consent banner of its own.

1. Cloudflare dashboard → **Web Analytics** → **Add a site**.
2. Copy the site token.
3. Paste it into `analytics.cloudflareToken` in `src/config.ts` and redeploy.

While the token is empty nothing is loaded. The beacon is also skipped in development,
so local work is never recorded as real traffic.

---

## Trailing slashes

Canonical URLs have **no trailing slash**: `/blog/some-post`, not `/blog/some-post/`.

`astro.config.ts` sets `trailingSlash: 'never'` and `build.format: 'file'`, so the build
emits `dist/blog/some-post.html`. Cloudflare Pages serves that at the extensionless
`/blog/some-post` and 308-redirects both `/blog/some-post.html` and `/blog/some-post/`
to it. Canonical tags, the sitemap and RSS all generate from the same rule in
`src/lib/urls.ts`, so a page is never reachable at two indexable URLs.

> This relies on Cloudflare Pages' documented asset-serving behaviour, which I could
> not exercise locally. Confirm it on the first deploy by requesting a post URL with a
> trailing slash and checking for the 308.

---

## Headers

[`public/_headers`](public/_headers) is read by Cloudflare Pages at deploy time:

- `/_astro/*` and `/fonts/*` — `max-age=31536000, immutable` (content-hashed or permanent)
- `/images/*` — one week
- `/rss.xml`, `/sitemap.xml`, `/robots.txt` — one hour
- everywhere — `X-Content-Type-Options: nosniff`,
  `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: SAMEORIGIN`,
  and a `Permissions-Policy` that switches off geolocation, mic, camera and Topics

---

## Theme

Two independent axes, both persisted in `localStorage` and both applied by one inline
script in `<head>` before first paint:

- **Mode** — light / dark / system (`data-mode` on `<html>`; absent means follow the system)
- **Accent** — emerald (default), rose, indigo, amber (`data-accent`)

Adding an accent means adding a ramp in `src/styles/tokens.css`, an entry in `ACCENTS`
in `src/config.ts`, **and re-running the contrast check**. Every shipped pair clears
WCAG AA; the lowest ratio in the current set is 5.01:1. Do not ship an unmeasured pair.

---

## Motion

CSS only — no animation library, and no measurable JS cost.

- Scroll reveals use native `animation-timeline: view()`.
- **Every hidden initial state lives inside `@supports (animation-timeline: view())`.**
  A browser without support never sees the hidden state or the animation, and renders
  the content visible and static. This is verified in both directions, including a test
  that forces the `@supports` condition false.
- Page transitions use the CSS `@view-transition { navigation: auto }` rule rather than
  Astro's `ClientRouter`, which keeps the JS cost at exactly zero. Chromium animates it
  today; elsewhere navigation is simply unanimated.
- `prefers-reduced-motion: reduce` disables all reveals, hover transitions and view
  transitions.

If you add a reveal to a new component, add the `reveal` class — never a bare
`opacity: 0` outside the `@supports` guard.

---

## Cookie consent

**No consent banner is shipped, and you should not build one.**

Google's certified Consent Management Platform is free inside AdSense and is enabled
from the AdSense dashboard at application time (**Privacy & messaging → GDPR / CCPA
messages**). It injects itself, handles the EEA/UK flow, and is what Google requires for
serving personalised ads there. A second hand-rolled banner would double-prompt and risk
a policy violation.

`src/layouts/BaseLayout.astro` contains an empty `#consent-mount` container marking where
a self-hosted CMP would go if one is ever needed instead.

Cloudflare Web Analytics is cookieless and is not covered by consent requirements.

## Ads

`<AdSlot />` renders three positions — after the first section, mid-article, and the
sidebar/end. **No ad script is integrated.** The slots reserve their exact final height
whether or not ads are enabled, so wiring a real network in later causes zero
cumulative layout shift. See the ad section of [`DESIGN.md`](DESIGN.md) for the
measurements.

To integrate a network later: add the loader script in `BaseLayout.astro`, target
`[data-ad-target]` inside `AdSlot.astro`, and set `PUBLIC_ADS_ENABLED=true`. Check that
the unit sizes you configure fit the reserved boxes.

## Analytics

None. `Analytics.astro` renders nothing, and the site loads **zero third-party
scripts** — which is also why it needs no cookie consent banner.

To add a provider, set `analytics.provider` in `src/config.ts` and add the matching
branch in `src/components/Analytics.astro`. Choose something cookieless, or the consent
banner question comes back and the privacy policy needs revising.

---

## Before you launch

- [ ] Set `SITE.url` to the real domain in `src/config.ts`
- [ ] Fill in `SITE.legal` — entity name, address, jurisdiction, contact emails. These
      appear on the legal pages and in the Organization JSON-LD.
- [ ] **Have the legal pages reviewed.** `/privacy-policy`, `/terms` and `/disclaimer`
      are drafted as realistic templates, not vetted legal advice. They contain
      `[BRACKETED]` placeholders that must be completed — including the specific
      disclosures Google AdSense and affiliate programmes require.
- [ ] Delete the two sample posts in `src/content/posts/` and their images in
      `src/assets/images/`
- [ ] Replace `public/images/og-default.jpg`, `public/images/logo.png` and
      `public/favicon.svg` with real brand assets
- [ ] Set `SITE.email.endpoint` to activate the signup form — until then it renders
      complete but visibly inert rather than silently dropping addresses
- [ ] Confirm `PUBLIC_SHOW_DRAFTS` is unset in production
- [ ] Submit `/sitemap.xml` to Google Search Console
