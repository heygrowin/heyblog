import { SITE, CATEGORIES, getCategory } from '../config';
import { absoluteUrl, categoryPath, postPath } from './urls';
import type { Post } from './posts';

type Json = Record<string, unknown>;

const iso = (d: Date) => d.toISOString();

const sameAs = Object.values(SITE.social).filter((url) => url.length > 0);

/** The publication itself. Referenced by @id from Article and WebSite. */
export function organizationSchema(): Json {
  return {
    '@type': 'Organization',
    '@id': `${SITE.url}/#organization`,
    name: SITE.name,
    url: absoluteUrl('/'),
    description: SITE.mission,
    logo: {
      '@type': 'ImageObject',
      url: absoluteUrl('/images/logo.png'),
      width: 512,
      height: 512,
    },
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };
}

export function webSiteSchema(): Json {
  return {
    '@type': 'WebSite',
    '@id': `${SITE.url}/#website`,
    name: SITE.name,
    url: absoluteUrl('/'),
    description: SITE.tagline,
    inLanguage: SITE.locale,
    publisher: { '@id': `${SITE.url}/#organization` },
  };
}

/** Organization + WebSite as one @graph, for the landing page. */
export function landingPageSchema(): Json {
  return {
    '@context': 'https://schema.org',
    '@graph': [organizationSchema(), webSiteSchema()],
  };
}

export function articleSchema(post: Post, ogImageUrl: string): Json {
  const url = absoluteUrl(postPath(post.data.slug));
  const category = getCategory(post.data.category);

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${url}#article`,
    headline: post.data.title,
    description: post.data.description,
    url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    datePublished: iso(post.data.publishDate),
    dateModified: iso(post.data.updatedDate ?? post.data.publishDate),
    author: { '@type': 'Person', name: post.data.author },
    publisher: organizationSchema(),
    image: [ogImageUrl],
    inLanguage: SITE.locale,
    isAccessibleForFree: true,
    ...(category ? { articleSection: category.name } : {}),
    ...(post.data.tags.length > 0 ? { keywords: post.data.tags.join(', ') } : {}),
  };
}

export function breadcrumbSchema(items: Array<{ name: string; path: string }>): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function postBreadcrumbSchema(post: Post): Json {
  const category = getCategory(post.data.category);
  return breadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Articles', path: '/blog' },
    ...(category ? [{ name: category.name, path: categoryPath(category.id) }] : []),
    { name: post.data.title, path: postPath(post.data.slug) },
  ]);
}

/** Only emitted when a post actually carries faq frontmatter. */
export function faqSchema(faq: ReadonlyArray<{ question: string; answer: string }>): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
}

export function collectionPageSchema(name: string, description: string, path: string): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    description,
    url: absoluteUrl(path),
    isPartOf: { '@id': `${SITE.url}/#website` },
  };
}

export const allCategoryNames = CATEGORIES.map((c) => c.name);
