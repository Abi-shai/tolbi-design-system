<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { Tray } from '../Tray'
import ArticleCard from './ArticleCard.vue'

/** One article (ADR-0195): what `ArticleCard` shows, and an id to key it by. */
export interface ArticleListItem {
  id: string | number
  title: string
  href?: string
  image?: string
  imageAlt?: string
  /** « Article · 24 févr. 2026 » — written by the product. */
  meta?: string
}

/**
 * The home page's « À lire » row (ADR-0195) — `ProjectList`'s counterpart,
 * **on the same `Tray`** (ADR-0198, track R3): the tray groups the block, so the
 * cards carry no ground of their own. The package lays the cards, the product
 * fills them. The cards keep their
 * **18rem** and line up from the start, `spacing-lg` apart — the row no longer
 * fills the width (ADR-0196: shared columns grew the pictures without limit on
 * a wide screen). **One row** (ADR-0201): it shows the cards that fit whole —
 * three at 1 440px, four wider — and does not render the others (the
 * product's « Voir tout » leads to them); a fourth card alone on a second line
 * doubled the section for one article. `wrap` lets them wrap instead, never
 * narrower than 18rem. Loading follows the same rule. **Under
 * 40rem of its own width, one column at full width** (a container query, as
 * `Dialog`'s: the package has no breakpoints, ADR-0020). The
 * section's title and its « Voir tout » are the product's. Nothing to show and
 * nothing loading: nothing rendered.
 */
interface Props {
  items?: ArticleListItem[]
  loading?: boolean
  /** How many placeholder cards while loading — the row's three. */
  loadingCount?: number
  newTab?: boolean
  newTabLabel?: string
  /** Lets the cards wrap onto more rows rather than showing the ones that fit (ADR-0201). */
  wrap?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  items: () => [],
  loading: false,
  loadingCount: 3,
  newTab: true,
  newTabLabel: undefined,
  wrap: false,
})

/*
  How many 18rem cards fit on the row (ADR-0201): the room the grid has, its
  gap as rendered, the card's 18rem at the page's own rem. Under 40rem of the
  list's width it is one column of them all, as the container query lays it.
  Measured once mounted — before the first paint — and again on every resize.
*/
const root = ref<HTMLElement | null>(null)
const fit = ref(Infinity)
function measure() {
  const el = root.value
  const grid = el?.querySelector<HTMLElement>('.ds-article-list__grid')
  if (!el || !grid) return
  const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16
  if (el.clientWidth < 40 * rem) {
    fit.value = Infinity
    return
  }
  const gap = parseFloat(getComputedStyle(grid).columnGap) || 0
  fit.value = Math.max(1, Math.floor((grid.clientWidth + gap) / (18 * rem + gap)))
}
let observer: ResizeObserver | undefined
watch(root, (el, _, onCleanup) => {
  if (!el || typeof ResizeObserver === 'undefined') return
  measure()
  observer = new ResizeObserver(measure)
  observer.observe(el)
  onCleanup(() => observer?.disconnect())
}, { flush: 'post' })
onBeforeUnmount(() => observer?.disconnect())

const shown = computed(() => (props.wrap ? props.items : props.items.slice(0, fit.value)))
const placeholders = computed(() => (props.wrap ? props.loadingCount : Math.min(props.loadingCount, fit.value)))
</script>

<template>
  <div v-if="loading || items.length" ref="root" class="ds-article-list" :aria-busy="loading || undefined">
    <Tray>
    <ul class="ds-article-list__grid">
      <template v-if="loading">
        <li v-for="n in placeholders" :key="`skeleton-${n}`"><ArticleCard loading /></li>
      </template>
      <li v-for="item in shown" v-else :key="item.id">
        <ArticleCard
          :title="item.title"
          :href="item.href"
          :image="item.image"
          :image-alt="item.imageAlt"
          :meta="item.meta"
          :new-tab="newTab"
          v-bind="newTabLabel ? { newTabLabel } : {}"
        />
      </li>
    </ul>
    </Tray>
  </div>
</template>

<style scoped>
.ds-article-list {
  container-type: inline-size;
  width: 100%;
}

.ds-article-list__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, 18rem);
  justify-content: start;
  gap: var(--ds-spacing-lg);
  margin: 0;
  padding: 0;
  list-style: none;
}

.ds-article-list__grid > li {
  display: flex;
  min-width: 0;
}

@container (width < 40rem) {
  .ds-article-list__grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .ds-article-list__grid > li > :deep(.ds-article-card) {
    width: 100%;
  }
}
</style>
