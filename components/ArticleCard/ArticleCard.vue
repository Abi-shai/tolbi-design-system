<script setup lang="ts">
import { computed, ref, useId, watch } from 'vue'
import { BrandPattern } from '../BrandPattern'
import { Icon } from '../Icon'
import { Skeleton } from '../Skeleton'

/**
 * One of Tolbi's articles, on the home page (ADR-0195) — the « À lire »
 * section, track B / G2: a card in `ModulesList`'s grammar, on a marked grey.
 *
 * From the top: the article's picture, 16:9 and covering, set inside the card
 * with its inset; the title, `label-md-strong`, **two lines at most**; one line
 * of facts written by the product (« Article · 24 févr. 2026 »).
 *
 * **It has no ground and no edge** (ADR-0198, track R3): the card is its
 * picture and its words, on the white surface of `ArticleList`'s `Tray` — the
 * tray groups, the card no longer has to. Under the pointer and on keyboard
 * focus it **takes a ground**, as a `ProjectList` row does — the tray's hover,
 * `bg-neutral-subtle-hover` (ADR-0199) — and the picture's frame steps to
 * `bg-neutral-strong` so it does not melt into it; nothing moves. Its inset is
 * a row's, `spacing-md`, so the ground spreads around a card as around a row. The card is **18rem wide** (288px, its picture 162px high):
 * 16 made the pictures' text unreadable, 20 stood too large beside
 * `ModulesList`'s tiles. A list may widen it to its column (one column, narrow).
 *
 * It is a **link**: the article on tolbi.ai, in a new tab by default — said to
 * a reader (`aria-describedby`), the link's name staying the title alone
 * (`aria-label`: the facts and the hint would otherwise join it). The
 * picture is decorative by default: the title is beside it. A missing or
 * broken picture leaves its 16:9 frame with a `file-text` in it, so the card
 * never changes size; `loading` previews the same geometry.
 *
 * **A brand cover** (ADR-0213, amended by ADR-0214): with `cover`, the frame is
 * not a picture but the same cover for every article — the tray's softest grey
 * (`bg-neutral-subtle`), the brand pattern barely guessed over it (`text-strong`
 * at 1.2 %, enlarged ×1.4 and offset within its bounds by `seed`, stable for one
 * article, different from its neighbour), and the article's **title on it**,
 * `heading-sm` in `text-strong` at the bottom left, three lines at most. Nothing
 * else on it. The deep green drew the eye to what is the least important block
 * of the page; the grey leaves it to the words. The title then leaves the words
 * under the frame — they hold the date alone — and stays the link's name; the
 * cover is `aria-hidden`. Under the pointer and the focus the card takes the
 * tray's grey and the cover **turns white** (ADR-0215): the inverse of the card,
 * so the two never melt into one grey. The pattern keeps its 1.2 %; nothing
 * moves.
 */
interface Props {
  title?: string
  href?: string
  /** The picture's address. Absent or broken: the frame and a `file-text`. */
  image?: string
  /** Empty by default: the title is beside it. */
  imageAlt?: string
  /** One line written by the product — « Article · 24 févr. 2026 ». */
  meta?: string
  /** Opens in a new tab (the article is on tolbi.ai). */
  newTab?: boolean
  /** What a reader hears after the title when it opens a new tab. */
  newTabLabel?: string
  loading?: boolean
  /** The brand cover with the title on it, in place of a picture (ADR-0213). */
  cover?: boolean
  /** What keeps the cover's framing stable for an article — its id. */
  seed?: string | number
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  href: undefined,
  image: undefined,
  imageAlt: '',
  meta: undefined,
  newTab: true,
  newTabLabel: 'S’ouvre dans un nouvel onglet',
  loading: false,
  cover: false,
  seed: undefined,
})

/* A frame that renders an <img> owns its failure (ADR-0040): the same frame, a glyph in it. */
const broken = ref(false)
watch(() => props.image, () => { broken.value = false })

const hintId = `ds-article-card-${useId()}`

/*
  The cover's framing (ADR-0213): the pattern enlarged ×1.4 around its centre,
  so 20 % of it overflows each side, then offset by at most 14 % on each axis —
  never a corner left empty, and no rotation for the same reason. The seed (the
  article's id, else its title) picks the offset, so one article keeps its
  framing and two neighbours rarely share one.
*/
function hash(value: string | number) {
  let h = 2166136261
  for (const c of String(value)) h = Math.imul(h ^ c.charCodeAt(0), 16777619)
  return h >>> 0
}
const crop = computed(() => {
  const h = hash(props.seed ?? props.title)
  const offset = (bits: number) => (((bits % 15) / 14) * 2 - 1) * 14
  return `translate(${offset(h).toFixed(1)}%, ${offset(h >>> 8).toFixed(1)}%) scale(1.4)`
})
</script>

<template>
  <div v-if="loading" class="ds-article-card ds-article-card--loading" aria-hidden="true">
    <span class="ds-article-card__frame">
      <Skeleton variant="rect" width="100%" height="100%" />
    </span>
    <span v-if="cover" class="ds-article-card__text ds-article-card__text--meta-only">
      <Skeleton variant="text" width="40%" />
    </span>
    <span v-else class="ds-article-card__text">
      <Skeleton variant="text" width="92%" />
      <Skeleton variant="text" width="64%" />
      <Skeleton variant="text" width="40%" class="ds-article-card__meta-skeleton" />
    </span>
  </div>
  <a
    v-else
    class="ds-article-card"
    :href="href"
    :target="newTab ? '_blank' : undefined"
    :rel="newTab ? 'noopener' : undefined"
    :aria-label="title"
    :aria-describedby="newTab ? hintId : undefined"
  >
    <span class="ds-article-card__frame">
      <span v-if="cover" class="ds-article-card__cover" aria-hidden="true">
        <BrandPattern surface="brand" scale="lg" class="ds-article-card__pattern" :style="{ '--article-card-crop': crop }" />
        <span class="ds-article-card__cover-title">{{ title }}</span>
      </span>
      <img
        v-else-if="image && !broken"
        class="ds-article-card__image"
        :src="image"
        :alt="imageAlt"
        loading="lazy"
        @error="broken = true"
      />
      <Icon v-else name="file-text" :size="24" class="ds-article-card__placeholder" aria-hidden="true" />
    </span>
    <span class="ds-article-card__text" :class="{ 'ds-article-card__text--meta-only': cover }">
      <!-- With a cover the title is on it; the link keeps it as its name (aria-label). -->
      <span v-if="!cover" class="ds-article-card__title">{{ title }}</span>
      <span v-if="meta" class="ds-article-card__meta">{{ meta }}</span>
    </span>
    <span v-if="newTab" :id="hintId" class="ds-article-card__hint">{{ newTabLabel }}</span>
  </a>
</template>

<style scoped>
/* No ground, no edge (ADR-0198); 8 inside, a `ProjectList` row's (ADR-0199); 12 between the picture and the words (ADR-0197); 18rem wide. */
.ds-article-card {
  position: relative;
  box-sizing: border-box;
  width: 18rem;
  max-width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--ds-spacing-lg);
  min-width: 0;
  padding: var(--ds-spacing-md);
  border-radius: var(--ds-radius-surface);
  background: transparent;
  color: inherit;
  text-decoration: none;
}

a.ds-article-card {
  cursor: pointer;
  transition:
    background-color var(--ds-motion-duration-quick) var(--ds-motion-easing-default),
    box-shadow var(--ds-motion-duration-instant) var(--ds-motion-easing-default);
}

/* A ground under the pointer, the tray's hover, as a `ProjectList` row takes (ADR-0199). */
a.ds-article-card:hover,
a.ds-article-card:focus-visible {
  background: var(--on-tray-hover, var(--ds-bg-neutral-subtle-hover));
}

/* The empty frame steps past the card's new ground, or it would melt into it. */
a.ds-article-card:is(:hover, :focus-visible) .ds-article-card__frame {
  background: var(--on-tray-hover-strong, var(--ds-bg-neutral-strong));
}

a.ds-article-card:focus-visible {
  outline: none;
  box-shadow: var(--ds-focus-ring-brand-shadow-xs);
}

@media (prefers-reduced-motion: reduce) {
  a.ds-article-card,
  .ds-article-card__frame {
    transition: none;
  }
}

/* The picture's 16:9 frame, inside the card's inset; it holds while the picture loads or fails. */
.ds-article-card__frame {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border-radius: var(--ds-radius-control);
  background: var(--ds-bg-neutral-subtle);
  color: var(--ds-text-subtle);
  transition: background-color var(--ds-motion-duration-quick) var(--ds-motion-easing-default);
}

/* A hairline over the picture (ADR-0201): a logo on white would otherwise melt
   into the tray's white surface. Inset, drawn over the image, so the 16:9 box
   does not move; it stays on hover and on an empty frame. */
.ds-article-card__frame::after {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  box-shadow: inset 0 0 0 var(--ds-border-width-default) var(--ds-border-subtle);
  content: '';
  pointer-events: none;
}

.ds-article-card__image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.ds-article-card--loading .ds-article-card__frame {
  background: none;
}

/* The words 6 in from the card's inset and 12 above its foot (ADR-0197, S1: the
   facts were ~10px from the edge), the title 4 above its facts. */
.ds-article-card__text {
  display: flex;
  flex-direction: column;
  gap: var(--ds-spacing-xs);
  min-width: 0;
  padding: 0 var(--ds-spacing-sm) var(--ds-spacing-lg);
}

/* The placeholder holds the real card's height: two title lines and the facts' line, 20 each. */
.ds-article-card--loading .ds-article-card__text {
  gap: var(--ds-spacing-sm);
  box-sizing: content-box;
  min-height: calc(3lh + var(--ds-spacing-xs));
  font: var(--ds-font-label-md-strong);
}

.ds-article-card__meta-skeleton {
  margin-top: var(--ds-spacing-xxs);
}

/* The words under a cover: the date alone, its own line box. */
.ds-article-card--loading .ds-article-card__text--meta-only {
  min-height: 1lh;
  font: var(--ds-font-body-sm);
}

/*
  The brand cover (ADR-0213, quieted by ADR-0214): the tray's softest grey and
  the pattern in ink at 1.2 % — semantic roles, so it follows the theme. The
  title in `text-strong` stays above 15:1 where two stamps overlap.
*/
.ds-article-card__cover {
  position: absolute;
  inset: 0;
}

.ds-article-card__frame .ds-article-card__pattern {
  --brand-pattern-ink-alpha: 0.012;
  position: absolute;
  inset: 0;
  background-color: var(--ds-bg-neutral-subtle);
  color: var(--ds-text-strong);
  transition: background-color var(--ds-motion-duration-quick) var(--ds-motion-easing-default);
}

/* Under the pointer the card takes the tray's grey and the cover turns white —
   the inverse, so card and cover stay two things (ADR-0215; the same grey for
   both read as one grey block). The pattern keeps its ink and its 1.2 %. */
a.ds-article-card:is(:hover, :focus-visible) .ds-article-card__frame .ds-article-card__pattern {
  background-color: var(--ds-bg-default);
}

.ds-article-card__pattern :deep(.ds-brand-pattern__art) {
  transform: var(--article-card-crop);
  transform-origin: center;
}

@media (prefers-reduced-motion: reduce) {
  .ds-article-card__frame .ds-article-card__pattern {
    transition: none;
  }
}

.ds-article-card__cover-title {
  position: absolute;
  inset-inline: var(--ds-spacing-xl);
  bottom: var(--ds-spacing-xl);
  display: -webkit-box;
  overflow: hidden;
  font: var(--ds-font-heading-sm);
  color: var(--ds-text-strong);
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  line-clamp: 3;
}

/* Two lines at most; the whole title is the link's name. */
.ds-article-card__title {
  display: -webkit-box;
  overflow: hidden;
  font: var(--ds-font-label-md-strong);
  color: var(--ds-text-strong);
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
}

.ds-article-card__meta {
  overflow: hidden;
  font: var(--ds-font-body-sm);
  color: var(--ds-text-subtle);
  white-space: nowrap;
  text-overflow: ellipsis;
}

/* Heard, never seen. */
.ds-article-card__hint {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}
</style>
