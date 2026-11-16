<script setup lang="ts">
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
 * The home page's « À lire » row (ADR-0195) — `ProjectList`'s counterpart:
 * the package lays the cards, the product fills them. The cards keep their
 * **18rem** and line up from the start, `spacing-lg` apart — the row no longer
 * fills the width (ADR-0196: shared columns grew the pictures without limit on
 * a wide screen); short of room they wrap, never narrower than 18rem. **Under
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
}

withDefaults(defineProps<Props>(), {
  items: () => [],
  loading: false,
  loadingCount: 3,
  newTab: true,
  newTabLabel: undefined,
})
</script>

<template>
  <div v-if="loading || items.length" class="ds-article-list" :aria-busy="loading || undefined">
    <ul class="ds-article-list__grid">
      <template v-if="loading">
        <li v-for="n in loadingCount" :key="`skeleton-${n}`"><ArticleCard loading /></li>
      </template>
      <li v-for="item in items" v-else :key="item.id">
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
