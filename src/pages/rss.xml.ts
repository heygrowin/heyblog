import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';

import { SITE, getCategory } from '../config';
import { getIndexablePosts } from '../lib/posts';
import { postPath } from '../lib/urls';

/* Drafts are excluded unconditionally here — never via the preview flag — so an
   unpublished post can never reach a subscriber's reader. */
export const GET: APIRoute = async (context) => {
  const posts = await getIndexablePosts();

  return rss({
    title: SITE.name,
    description: SITE.tagline,
    site: context.site ?? SITE.url,
    trailingSlash: false,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      link: postPath(post.data.slug),
      pubDate: post.data.publishDate,
      author: post.data.author,
      categories: [getCategory(post.data.category)?.name ?? post.data.category, ...post.data.tags],
    })),
    customData: `<language>${SITE.locale}</language>`,
  });
};
