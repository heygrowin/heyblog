/**
 * Splits rendered post HTML into chunks so ad slots can sit at real section
 * boundaries rather than being bolted above and below the article.
 *
 * Cuts are only ever made between top-level blocks, never inside one, so the
 * HTML in each chunk stays balanced.
 */

/** Byte offsets of every top-level <h2> in the document. */
function h2Offsets(html: string): number[] {
  const offsets: number[] = [];
  const pattern = /<h2[\s>]/gi;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(html)) !== null) offsets.push(match.index);
  return offsets;
}

/** Fallback for posts with too few headings: cut after the closing </p> nearest each fraction. */
function paragraphOffsets(html: string, fractions: number[]): number[] {
  const ends: number[] = [];
  const pattern = /<\/p>/gi;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(html)) !== null) ends.push(match.index + match[0].length);

  if (ends.length < 3) return [];

  return fractions
    .map((f) => ends[Math.min(ends.length - 2, Math.max(1, Math.round(ends.length * f)))])
    .filter((offset): offset is number => offset !== undefined);
}

/**
 * Returns 1–3 HTML chunks. The caller renders an ad slot between consecutive
 * chunks, giving "after the first section" and "mid-article" placements.
 */
export function splitForAds(html: string): string[] {
  const headings = h2Offsets(html);
  let cuts: number[];

  if (headings.length >= 3) {
    // After the first section, then again around the middle of the article.
    const afterFirstSection = headings[1]!;
    const middle = headings[Math.max(2, Math.floor(headings.length / 2))]!;
    cuts = [afterFirstSection, middle];
  } else if (headings.length === 2) {
    cuts = [headings[1]!];
  } else {
    cuts = paragraphOffsets(html, [0.4, 0.72]);
  }

  const ordered = [...new Set(cuts)].filter((c) => c > 0 && c < html.length).sort((a, b) => a - b);

  // Discard cuts that would leave a chunk too small to be worth breaking for.
  const minChunk = 400;
  const kept: number[] = [];
  let previous = 0;
  for (const cut of ordered) {
    if (cut - previous >= minChunk && html.length - cut >= minChunk) {
      kept.push(cut);
      previous = cut;
    }
  }

  if (kept.length === 0) return [html];

  const chunks: string[] = [];
  let start = 0;
  for (const cut of kept) {
    chunks.push(html.slice(start, cut));
    start = cut;
  }
  chunks.push(html.slice(start));

  return chunks;
}
