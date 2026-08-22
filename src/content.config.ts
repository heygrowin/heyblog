import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { postSchema } from './schema';

/**
 * The glob loader derives each entry's `id` from the `slug` frontmatter field,
 * which is what makes /blog/[slug] resolve straight from the contract.
 *
 * Consequence worth knowing: two files sharing a slug collapse into a single
 * entry with no warning from Astro. assertUniqueSlugs() in src/lib/posts.ts
 * scans the raw files to turn that silent data loss into a build error.
 */
const posts = defineCollection({
  loader: glob({ base: './src/content/posts', pattern: '**/*.md' }),
  schema: postSchema,
});

export const collections = { posts };
