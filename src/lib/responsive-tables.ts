/**
 * Makes every Markdown table responsive, at the rendering layer.
 *
 * This runs once over a post's rendered HTML at BUILD time, so it applies
 * uniformly to posts published months ago, posts sitting in review, and
 * everything TrendScout writes in future. No Markdown file carries any
 * presentation markup, and no client-side JavaScript is shipped.
 *
 * Why a string transform rather than a rehype plugin: Astro 7's default
 * Markdown processor does not accept `markdown.rehypePlugins` without
 * installing @astrojs/markdown-remark and switching the whole pipeline back to
 * unified — which would re-render all 89 existing posts through a different
 * processor for the sake of one wrapper element. The generated table markup is
 * machine-produced, newline-delimited and impossible to nest (Markdown has no
 * nested-table syntax), so operating on it directly is both safe and cheap.
 * The parsing below is deliberately structural — rows, then cells — rather
 * than one large regex.
 *
 * Three presentations, chosen from the table's own shape AND content, then
 * applied by CONTAINER QUERIES so the table responds to the width actually
 * available to it — not to a hardcoded phone breakpoint. The same table adapts
 * correctly in the full-width article column, inside a narrow grid cell, or on
 * a 1920px desktop, because the query asks the wrapper how wide it is.
 *
 *   simple      2 columns of short values ("Feature | Value"). Stays a real
 *               table at every width, down to 320px. Cells just wrap. Turning
 *               this into cards would be worse, not better.
 *   comparison  3+ columns, or 2 columns carrying prose. Stacks into labelled
 *               cards while the container is too narrow to give each column a
 *               readable share, and becomes an ordinary table again as soon as
 *               there is room. The un-stack threshold scales with how much room
 *               the table actually needs (see UNSTACK_AT).
 *   scroll      Genuinely wide/data-heavy tables (> SCROLL_MIN_COLUMNS). Never
 *               stacked — a dozen label/value pairs per row destroys a spec
 *               sheet. Gets its own horizontal scroll container with a sticky
 *               first column; the PAGE never scrolls.
 *
 * Accessibility notes:
 *   - Labels are real <span aria-hidden="true"> elements, not
 *     `td::before { content: attr(data-label) }`. Several screen readers do
 *     announce generated content, which would read every header twice — once
 *     from the <th> association and once from the pseudo-element.
 *   - Stacking requires changing `display` on the table, and a table whose
 *     display is not `table` loses its rows and cells from the accessibility
 *     tree in every major engine. Explicit ARIA roles are emitted to put them
 *     back; on desktop those roles are identical to the implicit ones.
 *   - scope="col"/"row" are added so the header association the mobile view
 *     presents visually is actually declared.
 */

/** Above this many columns, stacking produces too many pairs per card. */
const SCROLL_MIN_COLUMNS = 7;

/**
 * Roughly how much width a column needs to stay readable, in rem. Prose-heavy
 * columns need materially more than a column of "✓" or "$29" does, which is why
 * the mode decision reads the cells rather than only counting them.
 */
const COL_REM_SHORT = 7;
const COL_REM_PROSE = 12;

/** A cell longer than this reads as prose rather than a value. */
const PROSE_CELL_CHARS = 45;

/**
 * Container widths (rem) at which a stacked table returns to being a table.
 * Bucketed rather than continuous because CSS container queries need literal
 * thresholds; three buckets covers everything from a 2-column list to a
 * 6-column comparison without the CSS triplicating itself.
 */
const UNSTACK_BUCKETS = [
  { key: 'sm', rem: 30 },
  { key: 'md', rem: 42 },
  { key: 'lg', rem: 54 },
] as const;

const TABLE_RE = /<table\b[^>]*>[\s\S]*?<\/table>/gi;
const ROW_RE = /<tr\b[^>]*>[\s\S]*?<\/tr>/gi;
const CELL_RE = /<(th|td)\b([^>]*)>([\s\S]*?)<\/\1>/gi;

/** Visible text of an HTML fragment, for use as a label. */
function textOf(html: string): string {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/** Adds an attribute to a tag's existing attribute string if absent. */
function withAttr(attrs: string, name: string, value: string): string {
  return new RegExp(`\\b${name}\\s*=`, 'i').test(attrs)
    ? attrs
    : `${attrs} ${name}="${escapeAttr(value)}"`;
}

function addClass(attrs: string, className: string): string {
  const existing = attrs.match(/\bclass\s*=\s*"([^"]*)"/i);
  if (!existing) return `${attrs} class="${className}"`;
  return attrs.replace(existing[0], `class="${existing[1]} ${className}"`);
}

interface Section {
  /** The raw `<thead>…</thead>` / `<tbody>…</tbody>` block. */
  html: string;
  isHead: boolean;
}

function sectionsOf(table: string): Section[] {
  const out: Section[] = [];
  const re = /<(thead|tbody|tfoot)\b[^>]*>[\s\S]*?<\/\1>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(table)) !== null) {
    out.push({ html: m[0], isHead: m[1].toLowerCase() === 'thead' });
  }
  return out;
}

/**
 * Rewrites one `<table>…</table>` block into its responsive form.
 * Returns the original untouched if the table has no recognisable header.
 */
function transformTable(table: string): string {
  const sections = sectionsOf(table);
  const head = sections.find((s) => s.isHead);
  if (!head) return table; // No header row: nothing to label rows with.

  const headerRow = head.html.match(ROW_RE)?.[0] ?? '';
  const labels: string[] = [];
  let hm: RegExpExecArray | null;
  const headCellRe = new RegExp(CELL_RE.source, 'gi');
  while ((hm = headCellRe.exec(headerRow)) !== null) labels.push(textOf(hm[3]));
  if (!labels.length) return table;

  // Column count is the widest row, so a table with a ragged body still picks
  // the mode that suits its real width.
  let columns = labels.length;
  for (const section of sections) {
    if (section.isHead) continue;
    for (const row of section.html.match(ROW_RE) ?? []) {
      const n = (row.match(new RegExp(CELL_RE.source, 'gi')) ?? []).length;
      if (n > columns) columns = n;
    }
  }
  // Measure PER COLUMN. Counting columns alone is not enough: a four-column
  // table of "✓"s and a four-column table with a "Public benchmark" header and
  // sentence-long cells need very different amounts of room, and treating them
  // the same is what let a 4-column table un-stack into a 600px viewport and
  // then render 778px wide.
  const colChars: number[] = labels.map((l) => l.length);
  let longestCell = 0;
  let bodyCells = 0;
  let totalChars = 0;
  for (const section of sections) {
    if (section.isHead) continue;
    for (const row of section.html.match(ROW_RE) ?? []) {
      const cellRe = new RegExp(CELL_RE.source, 'gi');
      let cm: RegExpExecArray | null;
      let i = -1;
      while ((cm = cellRe.exec(row)) !== null) {
        i += 1;
        const len = textOf(cm[3]).length;
        // Cap a single column's contribution: a very long cell wraps over
        // several lines rather than demanding its full length in width.
        colChars[i] = Math.max(colChars[i] ?? 0, Math.min(len, 40));
        longestCell = Math.max(longestCell, len);
        totalChars += len;
        bodyCells += 1;
      }
    }
  }
  const avgCell = bodyCells ? totalChars / bodyCells : 0;
  const prose = avgCell > PROSE_CELL_CHARS / 2 || longestCell > PROSE_CELL_CHARS * 2;

  // Three modes. `simple` is the important addition: a short two-column table
  // is more readable as a table at every width than it is as a stack of cards,
  // so it is never transformed at all.
  let mode: 'simple' | 'comparison' | 'scroll';
  if (columns >= SCROLL_MIN_COLUMNS) mode = 'scroll';
  else if (columns <= 2 && !prose) mode = 'simple';
  else mode = 'comparison';

  // Width the table needs before it is worth un-stacking, summed from the real
  // per-column demand and bucketed to the literal thresholds container queries
  // can express. Anything needing more than the widest bucket simply stays
  // stacked for longer and, if it still cannot fit once un-stacked, the wrapper
  // scrolls — the page never does.
  const neededRem = colChars.reduce(
    (sum, chars) => sum + Math.min(Math.max(chars * 0.62, COL_REM_SHORT), COL_REM_PROSE),
    0,
  );
  const bucket =
    UNSTACK_BUCKETS.find((b) => neededRem <= b.rem) ?? UNSTACK_BUCKETS[UNSTACK_BUCKETS.length - 1];

  let out = table;

  // --- header cells: scope, and columnheader role for the stacked view -----
  const newHead = head.html.replace(CELL_RE, (_all, tag: string, attrs: string, inner: string) => {
    let a = withAttr(attrs, 'scope', 'col');
    if (mode === 'comparison') a = withAttr(a, 'role', 'columnheader');
    return `<${tag}${a}>${inner}</${tag}>`;
  });
  out = out.replace(head.html, newHead);

  // --- body cells ----------------------------------------------------------
  for (const section of sections) {
    if (section.isHead) continue;
    const newSection = section.html.replace(ROW_RE, (row) => {
      let index = -1;
      return row.replace(CELL_RE, (_all, tag: string, attrs: string, inner: string) => {
        index += 1;
        let a = attrs;
        if (tag.toLowerCase() === 'th') {
          a = withAttr(a, 'scope', 'row');
          if (mode === 'comparison') a = withAttr(a, 'role', 'rowheader');
        } else if (mode === 'comparison') {
          a = withAttr(a, 'role', 'cell');
        }
        // The first cell is the card's title on mobile, so it needs no label.
        if (mode !== 'comparison' || index === 0 || !labels[index]) {
          return `<${tag}${a}>${inner}</${tag}>`;
        }
        a = addClass(a, 'has-label');
        const label = `<span class="cell-label" aria-hidden="true">${escapeHtml(
          labels[index],
        )}</span>`;
        return `<${tag}${a}>${label}<span class="cell-value">${inner}</span></${tag}>`;
      });
    });
    out = out.replace(section.html, newSection);
  }

  // --- roles on the structural elements ------------------------------------
  if (mode === 'comparison') {
    out = out
      .replace(/<table\b([^>]*)>/i, (_a, attrs: string) => `<table${withAttr(attrs, 'role', 'table')}>`)
      .replace(
        /<(thead|tbody|tfoot)\b([^>]*)>/gi,
        (_a, tag: string, attrs: string) => `<${tag}${withAttr(attrs, 'role', 'rowgroup')}>`,
      )
      .replace(/<tr\b([^>]*)>/gi, (_a, attrs: string) => `<tr${withAttr(attrs, 'role', 'row')}>`);
  }

  out = out.replace(
    /<table\b([^>]*)>/i,
    (_a, attrs: string) =>
      `<table${withAttr(addClass(attrs, `table--${mode}`), 'data-unstack', bucket.key)}>`,
  );

  // --- wrapper -------------------------------------------------------------
  // The wrapper is the container query CONTAINER, which is what makes this
  // adapt to the space actually available rather than to the viewport.
  // Only a scrolling region is focusable and announced: a keyboard user has to
  // be able to reach and pan it. Giving the other modes a tabindex would add an
  // empty tab stop for no benefit.
  const wrapperAttrs =
    mode === 'scroll'
      ? ` class="table-wrap table-wrap--scroll" role="region" tabindex="0" aria-label="${escapeAttr(
          `Table: ${labels.filter(Boolean).slice(0, 3).join(', ')}`,
        )}"`
      : ` class="table-wrap table-wrap--${mode}"`;

  return `<figure${wrapperAttrs} data-columns="${columns}" data-unstack="${bucket.key}">${out}</figure>`;
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * Applies the responsive-table treatment to a post's rendered HTML.
 * Safe to call on HTML containing no tables — it returns it unchanged.
 */
export function makeTablesResponsive(html: string): string {
  if (!html || html.indexOf('<table') === -1) return html;
  return html.replace(TABLE_RE, (table) => transformTable(table));
}
