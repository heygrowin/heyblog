/**
 * The single source of truth for branding, taxonomy and site-wide settings.
 *
 * Rebranding the entire site means editing this file and nothing else. Every
 * page, feed, schema block and meta tag reads from here.
 */

/* -------------------------------------------------------------------------- */
/* Categories                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * The complete category taxonomy. `id` is the URL segment and the value the
 * content engine writes into a post's `category` frontmatter field — the Zod
 * schema builds its enum from this list, so an unknown category fails the build.
 *
 * Adding a category: add it here and it gains an archive page, a landing-page
 * entry point and a footer link automatically.
 *
 * Removing a category: remove it here AND migrate any post still using it, or
 * the next build fails loudly (which is the intended behaviour).
 */
export const CATEGORIES = [
  {
    id: 'ai-tools',
    name: 'AI Tools',
    blurb: 'What actually ships, what it costs, and whether it survives contact with real work.',
  },
  {
    id: 'creator-economy',
    name: 'Creator Economy',
    blurb: 'Platform payouts, algorithm shifts, and where audiences are moving next.',
  },
  {
    id: 'consumer-tech',
    name: 'Consumer Tech',
    blurb: 'The hardware and software people are actually buying, tested against the marketing.',
  },
  {
    id: 'money-and-work',
    name: 'Money & Work',
    blurb: 'How the work itself is changing — pay, roles, and the skills that hold value.',
  },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]['id'];
export type Category = (typeof CATEGORIES)[number];

/** Tuple form required by `z.enum()`. Derived — never edit directly. */
export const CATEGORY_IDS = CATEGORIES.map((c) => c.id) as [CategoryId, ...CategoryId[]];

export function getCategory(id: string): Category | undefined {
  return CATEGORIES.find((c) => c.id === id);
}

/* -------------------------------------------------------------------------- */
/* Site                                                                        */
/* -------------------------------------------------------------------------- */

/**
 * The four selectable accents. Every one ships a light-mode and a dark-mode
 * variant, and all eight were contrast-checked against their own background —
 * the lowest ratio in the set is 5.01:1. Adding one here means adding a
 * matching ramp in src/styles/tokens.css AND re-running the contrast check;
 * do not ship an accent that has not been measured.
 */
export const ACCENTS = [
  { id: 'emerald', label: 'Emerald' },
  { id: 'rose', label: 'Rose' },
  { id: 'indigo', label: 'Indigo' },
  { id: 'amber', label: 'Amber' },
] as const;

export type AccentId = (typeof ACCENTS)[number]['id'];
export const ACCENT_IDS = ACCENTS.map((a) => a.id) as [AccentId, ...AccentId[]];

export const SITE = {
  /** Publication name. Appears in the masthead, <title>, OG tags and JSON-LD. */
  name: 'HeyBlog',

  /** One line, used on the landing page and as the site-wide meta description fallback. */
  tagline: 'What changed this week, and what it means for you.',

  /**
   * The longer positioning statement for the landing page hero — who this is
   * for and what they get. Keep it concrete.
   */
  mission:
    'Independent coverage of the tools, platforms and money shifts reshaping creative and knowledge work. We read the releases, pricing pages and policy updates so you can decide what deserves your attention.',

  /** Who this helps. Rendered on the landing page and /about. */
  audience: 'creators, freelancers and small teams',

  /**
   * Production origin, no trailing slash. Used for canonical URLs, OG tags,
   * the sitemap and RSS. Update this to your real Cloudflare Pages domain
   * (or custom domain) before launch.
   */
  url: 'https://blog.heygrow.in',

  /** BCP-47 language tag for <html lang> and og:locale. */
  locale: 'en',
  ogLocale: 'en_US',

  author: {
    /** Default byline. The schema uses this when a post omits `author`. */
    name: 'The HeyBlog Desk',
    email: 'hello@heyblog.example',
    /** Shown on /about and used as the JSON-LD Person/Organization description. */
    bio: 'A small independent desk covering tools, platforms and the economics of creative work. Articles are drafted with AI assistance and reviewed by a person before publishing.',
  },

  /** Leave a value empty to hide that link everywhere. */
  social: {
    x: '',
    youtube: '',
    linkedin: '',
    github: '',
  },

  /** Posts per page on /blog and on each category archive. */
  postsPerPage: 12,

  /** Related-posts block at the foot of every post. */
  relatedPostsCount: 3,

  /** Words per minute used to estimate reading time. */
  wordsPerMinute: 200,

  email: {
    /**
     * Full URL the signup form POSTs to. While this is empty the form renders
     * in a visibly inert state — complete UI, disabled controls, honest notice.
     * Set it to your provider's form endpoint to activate the form site-wide.
     *
     * Examples:
     *   Buttondown  https://buttondown.email/api/emails/embed-subscribe/YOUR_USER
     *   ConvertKit  https://app.convertkit.com/forms/YOUR_FORM_ID/subscriptions
     *   Mailchimp   https://YOUR_DC.list-manage.com/subscribe/post?u=...&id=...
     */
    endpoint: '',
    /** The `name` attribute the provider expects for the email field. */
    fieldName: 'email',
    heading: 'Get the signal, not the noise',
    blurb:
      'One email a week: what actually changed, what it costs, and what to do about it. No hot takes, no affiliate churn. Unsubscribe in one click.',
    cta: 'Subscribe',
    /** Small print under the form. */
    reassurance: 'Free. One email a week. We never sell or share your address.',
  },

  analytics: {
    /**
     * Cloudflare Web Analytics. Free, cookieless, and it sets no identifiers,
     * so it needs no consent banner of its own. Only the ads do — and Google's
     * own certified CMP handles those (see COOKIE CONSENT in the README).
     *
     * Get the token: Cloudflare dashboard -> Web Analytics -> add this site.
     * Paste the token here. While it is empty, nothing is loaded at all.
     */
    cloudflareToken: 'dcaba0f03e02488d8a4511d269628324',
  },

  /**
   * Theme defaults. Both axes are independent and both persist in
   * localStorage; these are only what a first-time visitor gets.
   *   mode:   'system' follows prefers-color-scheme
   *   accent: must be one of ACCENTS below
   */
  theme: {
    defaultMode: 'system' as 'light' | 'dark' | 'system',
    defaultAccent: 'emerald' as AccentId,
  },

  /** Fallback OG image, served from /public. Used by pages without their own image. */
  defaultOgImage: '/images/og-default.jpg',

  /** Shown in the footer copyright line. */
  foundingYear: 2026,

  /**
   * Legal entity behind the site. Referenced by the legal pages and by the
   * Organization JSON-LD. Fill these in before launch.
   */
  legal: {
    entityName: '[YOUR LEGAL ENTITY NAME]',
    address: '[YOUR BUSINESS ADDRESS]',
    jurisdiction: '[YOUR STATE / COUNTRY]',
    contactEmail: 'hello@heyblog.example',
    privacyEmail: 'privacy@heyblog.example',
  },
} as const;

/* -------------------------------------------------------------------------- */
/* Navigation                                                                  */
/* -------------------------------------------------------------------------- */

export const MAIN_NAV = [
  { label: 'Articles', href: '/blog' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
] as const;

export const FOOTER_NAV = [
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
  { label: 'Privacy Policy', href: '/privacy-policy' },
  { label: 'Terms', href: '/terms' },
  { label: 'Disclaimer', href: '/disclaimer' },
  { label: 'RSS', href: '/rss.xml' },
] as const;
