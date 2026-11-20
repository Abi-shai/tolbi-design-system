<script setup lang="ts">
import { computed } from 'vue'
import type { IconSize } from '../Icon'

/**
 * A file's format, as a glyph before its name (ADR-0235) — the cards of
 * Obvious. **Not drawn here**: the boxes are Material Design Icons' (mdi,
 * Apache 2.0) — `file-pdf-box`, `file-word-box`, `file-excel-box`,
 * `code-json`, `file-document` — kept as the set ships them, chosen over
 * three benchmarks (monochrome glyphs, coloured illustrations, constructions).
 *
 * **The formats' known colours are kept** — « patterns not to abandon »: a
 * filled box, the letter in white, PDF `error-600`, Word `display-blue-700`, a
 * spreadsheet `success-600`; JSON's braces `display-orange-500`. They are
 * **categorical** (« PDF is red »), so they alias primitives straight
 * (ADR-0010), and do not follow the theme: a PDF is red in both modes. The
 * letters are white in both modes too — a white ground sits under mdi's cut-out
 * letters, which would otherwise show the page through them.
 *
 * **Geospatial files** take the same box with the **format written in it**, as
 * mdi writes « PDF »: `GEO` (outlines) and `PTS` (points) in `brand-500`, `KML`
 * in `display-blue-light-700`. Monochrome glyphs (polygon, pin, globe), tinted
 * emoji and fills without a box were tried and declined. There is no
 * blue-green primitive (`display-teal`); outlines took the brand's green.
 *
 * `file` is any other document: mdi's sheet, in `text-subtle`.
 *
 * **An issuer's document takes its mark** in place of its format — a Verra
 * project description carries the VCS logo. That is the slot's job where the
 * glyph sits (`FileTile #glyph`), at the glyph's size; this component draws
 * formats only.
 *
 * Its size is on `Icon`'s ladder (16 / 20 / 24 / 32). Decorative: the file's
 * name says what it is.
 */
export type FileGlyphFormat = 'pdf' | 'doc' | 'csv' | 'json' | 'geo' | 'points' | 'kml' | 'file'

interface Props {
  format: FileGlyphFormat
  size?: IconSize
}

const props = withDefaults(defineProps<Props>(), { size: 20 })

/* mdi's paths, as the set ships them (viewBox 0 0 24 24). */
const PATHS: Partial<Record<FileGlyphFormat, string>> = {
  pdf: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2m-9.5 8.5c0 .8-.7 1.5-1.5 1.5H7v2H5.5V9H8c.8 0 1.5.7 1.5 1.5zm5 2c0 .8-.7 1.5-1.5 1.5h-2.5V9H13c.8 0 1.5.7 1.5 1.5zm4-3H17v1h1.5V13H17v2h-1.5V9h3zm-6.5 0h1v3h-1zm-5 0h1v1H7z',
  doc: 'M15.5 17H14l-2-7.5l-2 7.5H8.5L6.1 7h1.7l1.54 7.5L11.3 7h1.4l1.97 7.5L16.2 7h1.7M19 3H5c-1.11 0-2 .89-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2',
  csv: 'M16.2 17h-2L12 13.2L9.8 17h-2l3.2-5l-3.2-5h2l2.2 3.8L14.2 7h2L13 12m6-9H5c-1.11 0-2 .89-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2',
  json: 'M5 3h2v2H5v5a2 2 0 0 1-2 2a2 2 0 0 1 2 2v5h2v2H5c-1.07-.27-2-.9-2-2v-4a2 2 0 0 0-2-2H0v-2h1a2 2 0 0 0 2-2V5a2 2 0 0 1 2-2m14 0a2 2 0 0 1 2 2v4a2 2 0 0 0 2 2h1v2h-1a2 2 0 0 0-2 2v4a2 2 0 0 1-2 2h-2v-2h2v-5a2 2 0 0 1 2-2a2 2 0 0 1-2-2V5h-2V3zm-7 12a1 1 0 0 1 1 1a1 1 0 0 1-1 1a1 1 0 0 1-1-1a1 1 0 0 1 1-1m-4 0a1 1 0 0 1 1 1a1 1 0 0 1-1 1a1 1 0 0 1-1-1a1 1 0 0 1 1-1m8 0a1 1 0 0 1 1 1a1 1 0 0 1-1 1a1 1 0 0 1-1-1a1 1 0 0 1 1-1',
  file: 'M13 9h5.5L13 3.5zM6 2h8l6 6v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4c0-1.11.89-2 2-2m9 16v-2H6v2zm3-4v-2H6v2z',
}

/* The geospatial formats: the box, the format written in it. */
const LABELS: Partial<Record<FileGlyphFormat, string>> = { geo: 'GEO', points: 'PTS', kml: 'KML' }

/* The boxes whose letter is cut out of the fill: a white ground under them. */
const CUT_OUT = new Set<FileGlyphFormat>(['pdf', 'doc', 'csv'])

const label = computed(() => LABELS[props.format])
</script>

<template>
  <svg
    class="ds-file-glyph"
    :class="`ds-file-glyph--${format}`"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <template v-if="label">
      <rect class="ds-file-glyph__ink" x="3" y="3" width="18" height="18" rx="2" />
      <text class="ds-file-glyph__label" x="12" y="12.2" font-size="6.4" font-weight="600" text-anchor="middle" dominant-baseline="central">{{ label }}</text>
    </template>
    <template v-else>
      <rect v-if="CUT_OUT.has(format)" class="ds-file-glyph__letter" x="4" y="4" width="16" height="16" />
      <path class="ds-file-glyph__ink" :d="PATHS[format]" />
    </template>
  </svg>
</template>

<style scoped>
.ds-file-glyph {
  display: block;
  flex: none;
}

.ds-file-glyph__ink {
  fill: var(--file-glyph-ink);
}

/* White in both modes: the letter of a format, not a surface. */
.ds-file-glyph__letter,
.ds-file-glyph__label {
  /* token-lint-disable-next-line no-raw-primitive — the format's letter, white in both modes like its box (ADR-0235) */
  fill: var(--ds-color-base-white);
}

.ds-file-glyph__label {
  font-family: var(--ds-typography-font-family-poppins);
  letter-spacing: -0.02em;
}

/* The formats' known colours — categorical, not roles (ADR-0010). */
.ds-file-glyph--pdf {
  /* token-lint-disable-next-line no-raw-primitive — PDF is red, a format's known colour (ADR-0235) */
  --file-glyph-ink: var(--ds-color-error-600);
}

.ds-file-glyph--doc {
  /* token-lint-disable-next-line no-raw-primitive — Word is blue, a format's known colour (ADR-0235) */
  --file-glyph-ink: var(--ds-color-display-blue-700);
}

.ds-file-glyph--csv {
  /* token-lint-disable-next-line no-raw-primitive — a spreadsheet is green, a format's known colour (ADR-0235) */
  --file-glyph-ink: var(--ds-color-success-600);
}

.ds-file-glyph--json {
  /* token-lint-disable-next-line no-raw-primitive — JSON's braces in orange, categorical (ADR-0235) */
  --file-glyph-ink: var(--ds-color-display-orange-500);
}

.ds-file-glyph--geo,
.ds-file-glyph--points {
  /* token-lint-disable-next-line no-raw-primitive — outlines and points in the brand's green, categorical; no teal exists (ADR-0235) */
  --file-glyph-ink: var(--ds-color-brand-500);
}

.ds-file-glyph--kml {
  /* token-lint-disable-next-line no-raw-primitive — KML in sky blue, categorical (ADR-0235) */
  --file-glyph-ink: var(--ds-color-display-blue-light-700);
}

.ds-file-glyph--file {
  --file-glyph-ink: var(--ds-text-subtle);
}
</style>
