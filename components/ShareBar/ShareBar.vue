<script setup lang="ts">
import { computed } from 'vue'
import { Badge } from '../Badge'

/**
 * One share of a whole. `share` is a percentage.
 *
 * `rest`: the remainder — what the whole holds besides the named shares
 * (« Sans lui »). It takes the neutral, never a series colour, and comes last.
 */
export interface ShareBarItem {
  label: string
  share: number
  rest?: boolean
  /**
   * The segment's own colour (ADR-0139) — a status that keeps its colour
   * wherever it ranks (« Éligibles » is always the same green). Any CSS
   * colour; pass tokens. Absent, the palette's colour for its rank.
   */
  color?: string
}

/**
 * A whole and its parts on one line (ADR-0097): a bar whose segments are as
 * wide as their shares, and the legend that names them. Not a `ProgressBar` —
 * nothing is progressing; it says how something is divided.
 *
 * It was `ProjectCard`'s spread (ADR-0038), drawn inside the card; the ARR
 * panel needed the same thing, so it left the card and the card renders it
 * (ADR-0001).
 */
interface Props {
  items: ShareBarItem[]
  /** Legend entries shown before the rest collapses into `+N`. */
  shown?: number
  /** The share after each label (« Floraison 42 % ») — off when the figure is said elsewhere, larger. */
  showShare?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  shown: 5,
  showShare: true,
})

/**
 * **Biggest first, always.** The order is the component's, not the caller's:
 * the palette is ordered by measured ΔE (ADR-0016), so the first series are the
 * most distinguishable — and a spread whose dominant share is not the first
 * colour wastes that. It also means the `+N` tail is always the small change.
 * A `rest` share comes last whatever its size: it is not one of the parts.
 */
const ordered = computed(() => [
  ...props.items.filter(i => !i.rest).sort((a, b) => b.share - a.share),
  ...props.items.filter(i => i.rest),
])
const visible = computed(() => ordered.value.slice(0, props.shown))
const hidden  = computed(() => Math.max(0, ordered.value.length - props.shown))

/**
 * Past the palette's comfortable ceiling the tail shares one neutral (ADR-0016)
 * — reaching further down a ramp solved for five gives two series nobody can
 * tell apart.
 *
 * The legend binds first, though: **a colour the legend does not name is not a
 * colour, it is noise.** Whatever collapses into `+N` collapses into the same
 * neutral in the bar, so the two readings always agree on how many things have
 * names. The ceiling still caps — a legend wide enough for six entries still
 * only gets five hues.
 */
const CEILING = 5
const named = computed(() => Math.min(props.shown, CEILING))
function colour(i: number) {
  const item = ordered.value[i]
  if (item?.rest || i >= named.value) return 'var(--share-bar-rest)'
  return item?.color ?? `var(--ds-chart-categorical-${i + 1})`
}
</script>

<template>
  <div class="ds-share-bar">
    <!-- Widths are the data, so they must not be equal. The legend says it in words. -->
    <div class="ds-share-bar__track" aria-hidden="true">
      <span
        v-for="(c, i) in ordered"
        :key="c.label"
        class="ds-share-bar__segment"
        :style="{ flexGrow: c.share, background: colour(i) }"
      />
    </div>
    <div class="ds-share-bar__legend">
      <!-- The track is **clipped**, not counted down: entries are laid out in
           full and the row cuts wherever it runs out. -->
      <ul class="ds-share-bar__legend-track">
        <li v-for="(c, i) in visible" :key="c.label">
          <span class="ds-share-bar__dot" :style="{ background: colour(i) }" aria-hidden="true" />
          <span>{{ showShare ? `${c.label} ${c.share} %` : c.label }}</span>
        </li>
      </ul>
      <!-- Outside the clip, so the count can never be the thing cut. -->
      <Badge
        v-if="hidden"
        class="ds-share-bar__legend-rest"
        :label="`+${hidden}`"
        tone="neutral"
        variant="pill-outline"
        size="sm"
      />
    </div>
  </div>
</template>

<style scoped>
/*
  `--share-bar-ground` is the ground the legend's fade runs into — a sunk
  section's, by default; a caller on another ground sets it (a variant switch,
  ADR-0010). `--share-bar-rest` is the neutral of the tail and the remainder.
*/
.ds-share-bar {
  --share-bar-ground: var(--ds-bg-neutral-subtle);
  --share-bar-rest: var(--ds-bg-neutral-strong);

  display: flex;
  flex-direction: column;
  gap: var(--ds-spacing-sm);
  min-width: 0;
}

/* `spacing-xxs` (2px) between segments: a gap is layout rhythm even when it is one pixel wide. */
.ds-share-bar__track {
  display: flex;
  gap: var(--ds-spacing-xxs);
  height: 6px;
}

/* `flex-grow` carries the share, so a series is as wide as it is big. */
.ds-share-bar__segment {
  flex: 1 1 0;
  flex-basis: 0;
  border-radius: var(--ds-radius-pill);
  background-color: var(--share-bar-rest);
  /*
    A share that changes — another year chosen — **travels** to its new width:
    the movement says by how much (ADR-0023: movement must explain). `enter` and
    `in-out`, a thing that travels; its colour follows if its rank changes.
    Reduced motion: the tokens' global rule makes it a cut.
  */
  transition:
    flex-grow var(--ds-motion-duration-enter) var(--ds-motion-easing-in-out),
    background-color var(--ds-motion-duration-enter) var(--ds-motion-easing-in-out);
}

/*
  The legend never wraps: the overflow becomes `+N` instead, because a card that
  grows a line when a seventh share appears stops matching its neighbours. Three
  parts: the **track** clips, a **fade** over its right edge makes the cut
  deliberate, the **count** sits outside the clip.
*/
.ds-share-bar__legend {
  display: flex;
  align-items: center;
  gap: var(--ds-spacing-xs);
}

.ds-share-bar__legend-track {
  position: relative;
  display: flex;
  align-items: center;
  /* Takes the room it is given and asks for none: laid out in full, its
     min-content was the whole legend, and in a reading panel at 14px that
     widened a 25rem panel to 470 (0.112.0). The cut is the point of the clip. */
  flex: 1 1 0;
  width: 0;
  min-width: 1px;
  /* In a reading panel the legend wraps instead (ADR-0133): there is no grid of
     cards to keep level, and at 14px the third share was cut. */
  flex-wrap: var(--reading-legend-wrap, nowrap);
  gap: var(--ds-spacing-xs) var(--ds-spacing-md);
  margin: 0;
  padding: 0;
  overflow: hidden;
  list-style: none;
}

.ds-share-bar__legend-track::after {
  content: '';
  position: absolute;
  inset-block: 0;
  right: 0;
  display: var(--reading-legend-fade, block);
  width: 32px;
  pointer-events: none;
  background: linear-gradient(to right, transparent, var(--share-bar-ground));
}

.ds-share-bar__legend-track li {
  display: inline-flex;
  align-items: center;
  gap: var(--ds-spacing-xs);
  flex: none;
  white-space: nowrap;
  /* 12px, 14 in a reading panel (ADR-0132). */
  font: var(--reading-secondary-font, var(--ds-font-body-sm));
  color: var(--ds-text-subtle);
}

.ds-share-bar__legend-rest { flex: none; }

.ds-share-bar__dot {
  width: 8px;
  height: 8px;
  flex: none;
  border-radius: var(--ds-radius-pill);
}
</style>
