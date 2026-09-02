<script setup lang="ts">
import { computed } from 'vue'
import { Button } from '../Button'

interface Props {
  currentPage: number
  totalPages: number
  prevLabel?: string
  nextLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  prevLabel: 'Précédent',
  nextLabel: 'Suivant',
})

const emit = defineEmits<{
  'page-change': [page: number]
}>()

const visiblePages = computed((): (number | '...')[] => {
  const total = props.totalPages
  const current = props.currentPage

  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const near = new Set(
    [1, current - 1, current, current + 1, total].filter(p => p >= 1 && p <= total),
  )
  const sorted = [...near].sort((a, b) => a - b)
  const result: (number | '...')[] = []
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) result.push('...')
    result.push(sorted[i])
  }
  return result
})

function goToPage(page: number) {
  if (page === props.currentPage || page < 1 || page > props.totalPages) return
  emit('page-change', page)
}
</script>

<template>
  <div class="ds-pagination">
    <div class="ds-pagination__side ds-pagination__side--prev">
      <Button
        variant="secondary-gray"
        size="sm"
        :label="prevLabel"
        icon-leading="arrow-left"
        :disabled="currentPage <= 1"
        @click="goToPage(currentPage - 1)"
      />
    </div>

    <div class="ds-pagination__numbers">
      <button
        v-for="(page, i) in visiblePages"
        :key="i"
        class="ds-pagination__num"
        :class="{
          'ds-pagination__num--active': page === currentPage,
          'ds-pagination__num--ellipsis': page === '...',
        }"
        :disabled="page === '...'"
        @click="typeof page === 'number' && goToPage(page)"
      >
        {{ page }}
      </button>
    </div>

    <div class="ds-pagination__side ds-pagination__side--next">
      <Button
        variant="secondary-gray"
        size="sm"
        :label="nextLabel"
        icon-trailing="arrow-right"
        :disabled="currentPage >= totalPages"
        @click="goToPage(currentPage + 1)"
      />
    </div>
  </div>
</template>

<style scoped>
/* ── Container ─────────────────────────────────────────────────────── */
.ds-pagination {
  display: flex;
  align-items: center;
  gap: var(--ds-spacing-lg);
  padding: 12px var(--ds-spacing-3xl) 16px;
  border-top: var(--ds-border-width-default) solid var(--ds-border-subtle);
}

/* ── Side slots (Previous / Next) ──────────────────────────────────── */
.ds-pagination__side {
  display: flex;
  align-items: center;
  flex: 1 0 0;
  min-width: 0;
  height: 36px;
}

.ds-pagination__side--next {
  justify-content: flex-end;
}

/* ── Page numbers ──────────────────────────────────────────────────── */
.ds-pagination__numbers {
  display: flex;
  align-items: center;
  gap: var(--ds-spacing-xxs);
  flex-shrink: 0;
}

/* ── Individual page button ────────────────────────────────────────── */
.ds-pagination__num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: var(--ds-radius-pill);
  background-color: transparent;
  font: var(--ds-font-label-lg);
  color: var(--ds-text-subtle);
  cursor: pointer;
  transition:
    background-color var(--ds-motion-duration-quick) var(--ds-motion-easing-default),
    color var(--ds-motion-duration-quick) var(--ds-motion-easing-default);
  font-variant-numeric: tabular-nums;
}

.ds-pagination__num:hover:not(:disabled):not(.ds-pagination__num--active) {
  background-color: var(--ds-bg-hover);
}

.ds-pagination__num--active {
  background-color: var(--ds-bg-selected);
  color: var(--ds-text-strong);
  font-weight: var(--ds-font-weight-label-lg-strong);
}

.ds-pagination__num--ellipsis {
  cursor: default;
  color: var(--ds-text-subtle);
}

.ds-pagination__num--ellipsis:disabled {
  cursor: default;
}
</style>
