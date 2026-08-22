import { getCollection, type CollectionEntry } from 'astro:content';
import { SITE, type CategoryId } from '../config';

export type Post = CollectionEntry<'posts'>;

/**
 * Raw markdown, read only to police slug uniqueness. The content loader turns a
 * post's `slug` into its entry id, and two entries sharing an id collapse into
 * one with no warning from Astro — a post would simply vanish from the site.
 * Zod cannot catch this because it validates one file at a time.
 */
const rawPostFiles = import.meta.glob('/src/content/posts/**/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

function assertUniqueSlugs(): void {
  const seen = new Map<string, string>();
  const collisions: string[] = [];

  for (const [file, text] of Object.entries(rawPostFiles)) {
    const frontmatter = text.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1];
    if (!frontmatter) continue;

    const slug = frontmatter.match(/^slug:\s*["']?([^"'\r\n]+)["']?\s*$/m)?.[1]?.trim();
    if (!slug) continue; // a missing slug is the schema's job to report, with a better message

    const firstSeenIn = seen.get(slug);
    if (firstSeenIn) {
      collisions.push(`  "${slug}"\n      ${firstSeenIn}\n      ${file}`);
    } else {
      seen.set(slug, file);
    }
  }

  if (collisions.length > 0) {
    throw new Error(
      `Duplicate post slugs.\n\n${collisions.join('\n\n')}\n\n` +
        `A slug becomes the content entry's id, so duplicates silently collapse\n` +
        `into a single post and the rest disappear from the site without warning.\n` +
        `Give every post a unique slug.`,
    );
  }
}

/** True when drafts are being included. Must never be set on the production deploy. */
export const showDrafts = import.meta.env.PUBLIC_SHOW_DRAFTS === 'true';

let cachedVisible: Post[] | null = null;
let warnedAboutDrafts = false;

const byNewestFirst = (a: Post, b: Post) =>
  b.data.publishDate.valueOf() - a.data.publishDate.valueOf();

/**
 * Every post that should have a page on this build, newest first.
 * Includes drafts only when PUBLIC_SHOW_DRAFTS=true.
 */
export async function getVisiblePosts(): Promise<Post[]> {
  if (cachedVisible) return cachedVisible;

  assertUniqueSlugs();
  const all = await getCollection('posts');

  if (showDrafts && !warnedAboutDrafts) {
    warnedAboutDrafts = true;
    const draftCount = all.filter((p) => p.data.draft).length;
    console.warn(
      `\n  ⚠  PUBLIC_SHOW_DRAFTS=true — including ${draftCount} draft post(s).\n` +
        `     Drafts are marked noindex and stay out of RSS and the sitemap,\n` +
        `     but this must not be set on a production deploy.\n`,
    );
  }

  cachedVisible = all.filter((p) => showDrafts || !p.data.draft).sort(byNewestFirst);
  return cachedVisible;
}

/**
 * Published posts only, drafts excluded no matter what the flag says.
 * Used for RSS and the sitemap so a draft can never be advertised to a crawler.
 */
export async function getIndexablePosts(): Promise<Post[]> {
  assertUniqueSlugs();
  const all = await getCollection('posts');
  return all.filter((p) => !p.data.draft).sort(byNewestFirst);
}

export async function getPostsByCategory(category: CategoryId): Promise<Post[]> {
  return (await getVisiblePosts()).filter((p) => p.data.category === category);
}

export async function countPostsByCategory(): Promise<Record<string, number>> {
  const counts: Record<string, number> = {};
  for (const post of await getVisiblePosts()) {
    counts[post.data.category] = (counts[post.data.category] ?? 0) + 1;
  }
  return counts;
}

/**
 * Same category first, as specified. Topped up with the next most recent posts
 * from elsewhere so a young category never renders a stubby block.
 */
export function getRelatedPosts(
  current: Post,
  allNewestFirst: Post[],
  count: number = SITE.relatedPostsCount,
): Post[] {
  const others = allNewestFirst.filter((p) => p.id !== current.id);
  const sameCategory = others.filter((p) => p.data.category === current.data.category);
  const elsewhere = others.filter((p) => p.data.category !== current.data.category);
  return [...sameCategory, ...elsewhere].slice(0, count);
}

/** The date a reader should see: the update if there is one, else publication. */
export const displayDate = (post: Post): Date => post.data.updatedDate ?? post.data.publishDate;
