# Content schema

The contract between the content engine and this site.

The engine writes markdown files into `src/content/posts/`, commits, and pushes.
The site renders whatever is there. There is no CMS, no database and no API — the
markdown files in git **are** the CMS.

Validation is strict by design. Every rule below is enforced at build time by
[`src/schema.ts`](src/schema.ts), and a violation **fails the build loudly** rather
than shipping a broken page. A failed build means the previous deploy stays live,
which is the safe outcome.

---

## Where files go

```
src/content/posts/<any-filename>.md     the post
src/assets/images/<filename>            its hero image
```

The markdown filename does not matter and is never shown to a reader — the `slug`
field determines the URL. Naming the file after the slug is still recommended, purely
so a human can find it.

> **Hero images go in `src/assets/images/`, not `public/images/`.**
> The `heroImage` field still *reads* as `/images/<filename>`, because that is the
> public-facing path, but the file must physically live in `src/assets/` so Astro can
> convert it to AVIF/WebP at multiple widths during the build. A file in
> `public/images/` is served byte-for-byte with no optimisation, which would break the
> performance budget. Pointing `heroImage` at a file that is not in
> `src/assets/images/` fails the build with a message listing the images that do exist.

---

## Frontmatter fields

| Field | Type | Required | Rule |
|---|---|---|---|
| `title` | string | yes | 1–70 characters |
| `description` | string | yes | 1–160 characters |
| `slug` | string | yes | kebab-case, ≤80 chars, **unique across all posts** |
| `publishDate` | date | yes | ISO 8601 (`YYYY-MM-DD`) |
| `updatedDate` | date | no | ISO 8601, must be **≥ `publishDate`** |
| `category` | enum | yes | one of the ids in [`src/config.ts`](src/config.ts) |
| `tags` | string[] | yes | 0–8 entries, each kebab-case, ≤32 chars |
| `heroImage` | string | yes | must start with `/images/` |
| `heroImageAlt` | string | yes | **1–160 chars — may never be empty** |
| `author` | string | no | defaults to `SITE.author.name` |
| `draft` | boolean | no | **defaults to `true`** |
| `sourceTopicId` | string | no | free-form; links back to the engine's own DB |
| `faq` | object[] | no | 1–10 items of `{ question, answer }` |

### Category values

Valid ids come from `CATEGORIES` in `src/config.ts`. At time of writing:

`ai-tools` · `creator-economy` · `consumer-tech` · `money-and-work`

The engine should read this list from config rather than hardcoding it, because an
unrecognised category is a build failure. Adding a category is a one-line edit there.

### The `faq` block

When present, `faq` does two things: renders a visible FAQ section at the foot of the
article, and emits `FAQPage` JSON-LD. Both come from the same source, which is what
Google requires — never emit schema for content a reader cannot see.

```yaml
faq:
  - question: Is this thing ready for production use?
    answer: >-
      A complete sentence or several. Answers are plain text, not markdown,
      and are capped at 1200 characters.
```

`question` ≤200 chars, `answer` ≤1200 chars, 1–10 items.

---

## Complete example

```markdown
---
title: "AI video tools in 2026: what actually ships, and what it costs"
description: "Generation quality stopped being the bottleneck. Pipeline fit, rights clarity and per-second pricing now decide which tool survives real work."
slug: ai-video-tools-2026
publishDate: 2026-08-12
updatedDate: 2026-08-19
category: ai-tools
tags:
  - ai-video
  - pricing
  - creative-workflow
heroImage: /images/ai-video-tools-2026.jpg
heroImageAlt: "Abstract editorial illustration of concentric arcs over a warm cream field"
author: The HeyBlog Desk
draft: false
sourceTopicId: topic_2026_08_ai_video
faq:
  - question: Is AI video good enough for client work yet?
    answer: For B-roll and concept boards, yes. For consistent characters across shots, budget for manual correction.
---

Opening paragraph. No H1 in the body — the title field becomes the page's
only `<h1>`, and a second one would break the heading structure.

## First section

Body copy. Use `##` for sections and `###` for subsections.

### A subsection

More copy.
```

---

## Body rules

- **Never write an `# H1`.** The `title` field is the page's only `<h1>`.
- Start sections at `##`. Use `###` beneath them. Do not skip levels.
- `##` and `###` headings are collected automatically into the table of contents, and
  each gets an `id` for deep linking. Nothing needs to be declared.
- Standard markdown works: lists, `>` blockquotes, tables, fenced code, links, bold,
  italic.
- Aim for **at least three `##` headings.** Ad slots are injected at heading
  boundaries — after the first section and again mid-article. With fewer than two
  headings the layout falls back to paragraph boundaries, which is less tidy.
- Markdown is processed by Sätteri (Astro 7's native pipeline).

---

## Publishing lifecycle

`draft` defaults to `true`, so **omitting the field means the post does not publish.**
This is deliberate: a malformed or half-written file cannot go live by accident.

A post with `draft: true`:

- gets no page, and no URL — it is not merely hidden, it is not built at all
- is absent from `/blog`, category archives, related posts, RSS and the sitemap

To publish, set `draft: false`. To preview drafts locally, run with
`PUBLIC_SHOW_DRAFTS=true` — they then build with a `noindex` tag and a visible DRAFT
badge, and still stay out of RSS and the sitemap. **That variable must never be set on
the production deploy.**

---

## Failure modes

All of these were verified against a real build.

**Field violates a rule**

```
[InvalidContentEntryDataError] posts → bad-post data does not match collection schema.

  title: title must be 70 characters or fewer
  heroImageAlt: heroImageAlt is required — an empty alt is never acceptable
  ****: Unrecognized key: "heroImagealt"
```

**Unknown field.** The schema is `.strict()`. A key that is not in the table above is
an error, not something to ignore — this is what turns a typo like `heroImagealt` into
a build failure instead of a silently missing alt attribute.

**Duplicate slug**

```
Duplicate post slugs.

  "creator-payout-shift-2026"
      /src/content/posts/_dupe.md
      /src/content/posts/creator-payout-shift-2026.md
```

Worth understanding why this check exists: the slug becomes the content entry's id,
and Astro silently collapses two entries sharing an id into one. Without this guard a
duplicate slug would make a post *disappear* with no error at all. The engine should
treat slug uniqueness as a database constraint on its side.

**Hero image missing**

```
Missing hero image.

  Post:      missing-image-post
  Requested: /images/does-not-exist.jpg
  Expected:  src/assets/images/does-not-exist.jpg

Images currently available:
  /images/ai-video-tools-2026.jpg
  /images/creator-payout-shift-2026.jpg
```

---

## Notes for the engine

1. **Write the image before the markdown**, or at least commit both together. A post
   referencing an image that is not in the same commit fails the build.
2. **Quote titles and descriptions containing `:`** — otherwise YAML reads the colon
   as a key separator. Quoting every string field is the safe default.
3. **Dates must be ISO 8601.** `2026-08-12` unquoted is correct. Avoid locale formats.
4. **Validate before committing.** Running `npm run build` in CI catches everything
   above before it reaches the deploy.
5. **Recommended hero dimensions: 1600×900** (16:9), JPEG or PNG. The build derives
   every size it needs from that, including the 1200×630 social card. Smaller than
   1200px wide will look soft on retina displays.
6. **`sourceTopicId` is never rendered.** It exists purely so a published URL can be
   traced back to the row that produced it.

---

## Changing the schema

`src/schema.ts` is the single source of truth. `CONTENT_SCHEMA.md` is documentation
of it and must be updated alongside. If the two disagree, the schema wins — it is what
actually runs.
