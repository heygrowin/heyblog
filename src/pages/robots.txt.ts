import type { APIRoute } from 'astro';

import { absoluteUrl } from '../lib/urls';

export const GET: APIRoute = () => {
  const body = `User-agent: *
Allow: /

# Nothing here is generated on demand, so there is nothing to rate limit.
Sitemap: ${absoluteUrl('/sitemap.xml')}
`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
