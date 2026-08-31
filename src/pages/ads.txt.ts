import type { APIRoute } from 'astro';

import { SITE } from '../config';

/**
 * Generated ONLY when a real publisher ID is configured — see
 * PUBLIC_ADSENSE_PUBLISHER_ID in .env.example / SITE.adsense in
 * src/config.ts. No fake or placeholder ID is ever emitted: with nothing
 * configured this route returns 404, which is the truthful state (there is
 * genuinely no ads.txt content to serve), not an empty or invented file.
 *
 * Format is Google's own documented ads.txt line for AdSense:
 *   google.com, pub-<PUBLISHER_ID>, DIRECT, f08c47fec0942fa0
 * https://support.google.com/adsense/answer/7532444
 */
export const GET: APIRoute = () => {
  const publisherId = SITE.adsense.publisherId;
  if (!publisherId) {
    return new Response('ads.txt not generated — no AdSense publisher ID is configured.\n', {
      status: 404,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  const body = `google.com, pub-${publisherId}, DIRECT, f08c47fec0942fa0\n`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
