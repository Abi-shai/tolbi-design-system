<script setup lang="ts">
import { ref, useId, watch } from 'vue'
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
 * The ground is `bg-neutral-subtle` — `Card sunk`'s — with no edge
 * (ADR-0196: `bg-neutral` weighed too much on the page). Under the pointer and
 * on keyboard focus it **darkens a step**, to `bg-neutral-subtle-hover`;
 * nothing moves. The card is **18rem wide** (288px, its picture 162px high):
 * 16 made the pictures' text unreadable, 20 stood too large beside
 * `ModulesList`'s tiles. A list may widen it to its column (one column, narrow).
 *
 * It is a **link**: the article on tolbi.ai, in a new tab by default — said to
 * a reader (`aria-describedby`), the link's name staying the title alone
 * (`aria-label`: the facts and the hint would otherwise join it). The
 * picture is decorative by default: the title is beside it. A missing or
 * broken picture leaves its 16:9 frame with a `file-text` in it, so the card
 * never changes size; `loading` previews the same geometry.
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
})

/* A frame that renders an <img> owns its failure (ADR-0040): the same frame, a glyph in it. */
const broken = ref(false)
watch(() => props.image, () => { broken.value = false })

const hintId = `ds-article-card-${useId()}`
</script>

<template>
  <div v-if="loading" class="ds-article-card ds-article-card--loading" aria-hidden="true">
    <span class="ds-article-card__frame">
      <Skeleton variant="rect" surface="tinted" emphasis="strong" width="100%" height="100%" />
    </span>
    <span class="ds-article-card__text">
      <Skeleton variant="text" surface="tinted" width="92%" />
      <Skeleton variant="text" surface="tinted" width="64%" />
      <Skeleton variant="text" surface="tinted" width="40%" class="ds-article-card__meta-skeleton" />
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
      <img
        v-if="image && !broken"
        class="ds-article-card__image"
        :src="image"
        :alt="imageAlt"
        loading="lazy"
        @error="broken = true"
      />
      <Icon v-else name="file-text" :size="24" class="ds-article-card__placeholder" aria-hidden="true" />
    </span>
    <span class="ds-article-card__text">
      <span class="ds-article-card__title">{{ title }}</span>
      <span v-if="meta" class="ds-article-card__meta">{{ meta }}</span>
    </span>
    <span v-if="newTab" :id="hintId" class="ds-article-card__hint">{{ newTabLabel }}</span>
  </a>
</template>

<style scoped>
/* `bg-neutral-subtle`, no edge, `radius-surface`, 6 inside, 8 between the picture and the words; 18rem wide. */
.ds-article-card {
  position: relative;
  box-sizing: border-box;
  width: 18rem;
  max-width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--ds-spacing-md);
  min-width: 0;
  padding: var(--ds-spacing-sm);
  border-radius: var(--ds-radius-surface);
  background: var(--ds-bg-neutral-subtle);
  color: inherit;
  text-decoration: none;
}

a.ds-article-card {
  cursor: pointer;
  transition:
    background-color var(--ds-motion-duration-quick) var(--ds-motion-easing-default),
    box-shadow var(--ds-motion-duration-instant) var(--ds-motion-easing-default);
}

/* A step darker: the sunk surface's own hover (ADR-0196). */
a.ds-article-card:hover,
a.ds-article-card:focus-visible {
  background: var(--ds-bg-neutral-subtle-hover);
}

/* `bg-neutral-subtle-hover` and `bg-neutral` are one grey: an empty frame would
   melt into the darkened card, so it steps too, a veil of ink over its own grey. */
a.ds-article-card:is(:hover, :focus-visible) .ds-article-card__frame {
  background: color-mix(in srgb, var(--ds-text-strong) 7%, var(--ds-bg-neutral));
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
  background: var(--ds-bg-neutral);
  color: var(--ds-text-subtle);
  transition: background-color var(--ds-motion-duration-quick) var(--ds-motion-easing-default);
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

/* The words 4 in from the card's inset, two of them: the title over its facts. */
.ds-article-card__text {
  display: flex;
  flex-direction: column;
  gap: var(--ds-spacing-xxs);
  min-width: 0;
  padding: 0 var(--ds-spacing-xs) var(--ds-spacing-xs);
}

/* The placeholder holds the real card's height: two title lines and the facts' line, 20 each. */
.ds-article-card--loading .ds-article-card__text {
  gap: var(--ds-spacing-sm);
  box-sizing: content-box;
  min-height: calc(3lh + var(--ds-spacing-xxs));
  font: var(--ds-font-label-md-strong);
}

.ds-article-card__meta-skeleton {
  margin-top: var(--ds-spacing-xxs);
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
