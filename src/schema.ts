import { z } from 'astro/zod';
import { CATEGORY_IDS, SITE } from './config';

/**
 * The content contract.
 *
 * A Python engine writes these files, so validation is deliberately strict:
 * every rule here is a build failure, never a silently degraded page. See
 * CONTENT_SCHEMA.md for the engine-facing documentation of this schema.
 */

/** Lowercase words joined by single hyphens. No leading/trailing/double hyphens. */
export const KEBAB_CASE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const faqItemSchema = z
  .object({
    question: z.string().min(1, 'FAQ question may not be empty').max(200),
    answer: z.string().min(1, 'FAQ answer may not be empty').max(1200),
  })
  .strict();

export const postSchema = z
  .object({
    /** Under 70 chars so Google does not truncate the title in results. */
    title: z.string().min(1).max(70, 'title must be 70 characters or fewer'),

    /** Under 160 chars so the meta description survives intact in the SERP. */
    description: z.string().min(1).max(160, 'description must be 160 characters or fewer'),

    /**
     * The URL segment: /blog/<slug>. Also becomes the content entry's id, so it
     * must be unique across the collection — enforced by assertUniqueSlugs()
     * in src/lib/posts.ts, because Zod cannot see across files.
     */
    slug: z
      .string()
      .min(1)
      .max(80)
      .regex(KEBAB_CASE, 'slug must be kebab-case, e.g. "how-ai-pricing-changed"'),

    /** ISO 8601 date, e.g. 2026-03-14. */
    publishDate: z.coerce.date(),

    /** Optional. Must not predate publishDate — see the refinement below. */
    updatedDate: z.coerce.date().optional(),

    /** Must be one of the ids in CATEGORIES in src/config.ts. */
    category: z.enum(CATEGORY_IDS),

    /** Kebab-case, up to 8. May be empty, but the key is required. */
    tags: z.array(z.string().min(1).max(32).regex(KEBAB_CASE, 'tags must be kebab-case')).max(8),

    /**
     * Public-facing path of the hero image, always "/images/<filename>".
     * The file itself lives in src/assets/images/<filename> so Astro can
     * optimise it — see src/lib/images.ts and CONTENT_SCHEMA.md.
     */
    heroImage: z.string().startsWith('/images/', 'heroImage must start with "/images/"'),

    /** Never allowed to be empty: every hero image must be described. */
    heroImageAlt: z
      .string()
      .min(1, 'heroImageAlt is required — an empty alt is never acceptable')
      .max(160),

    author: z.string().min(1).default(SITE.author.name),

    /** Defaults to true: nothing publishes unless a post explicitly opts in. */
    draft: z.boolean().default(true),

    /** Optional link back to the row in the engine's own database. */
    sourceTopicId: z.string().min(1).optional(),

    /** Optional. When present, renders an FAQ block and emits FAQPage JSON-LD. */
    faq: z.array(faqItemSchema).min(1).max(10).optional(),
  })
  /* Any key the engine invents that is not listed above fails the build, so a
     typo like `heroImagealt` can never ship as a silently missing alt tag. */
  .strict()
  .refine((d) => !d.updatedDate || d.updatedDate >= d.publishDate, {
    message: 'updatedDate must be on or after publishDate',
    path: ['updatedDate'],
  });

export type PostFrontmatter = z.infer<typeof postSchema>;
