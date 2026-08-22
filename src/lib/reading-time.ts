import { SITE } from '../config';

/**
 * Reading time in whole minutes, from the raw markdown body.
 * Markup, code fences and image URLs are stripped so they do not inflate the count.
 */
export function readingTimeMinutes(body: string, wpm: number = SITE.wordsPerMinute): number {
  const text = body
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^[#>\-*+]\s+/gm, ' ')
    .replace(/[*_~]/g, ' ');

  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / wpm));
}

export const readingTimeLabel = (minutes: number) => `${minutes} min read`;
