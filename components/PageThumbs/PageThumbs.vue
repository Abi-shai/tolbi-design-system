<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import { Scrollbar } from '../Scrollbar'

/**
 * A document's pages, as a column of thumbnails (ADR-0234) — one per page,
 * beside the sheet; the page on screen marked, a press goes to it. `Report`
 * (ADR-0089) prints a document and has no page navigation on screen; this is
 * that navigation, apart from it, because the product's document is not yet a
 * `Report` and a column of pages serves any paged document.
 *
 * - **A page** is a thumbnail and its number in one frame: `spacing-sm` in
 *   (`spacing-xs` under the number), `radius-surface`. The thumbnail is the
 *   product's (`#page`, the page drawn at 88px wide — the document itself,
 *   scaled), in the basemap thumbnail's frame (ADR-0221): a `border-subtle`
 *   hairline, `radius-inner`, `bg-default`, `elevation-control`, at the page's
 *   ratio (`ratio`, A4 by default). The number under it, `label-md` /
 *   `text-subtle`, tabular.
 * - **The page on screen** takes the active file's treatment (`FileTile`): the
 *   brand's pale tint wraps the thumbnail and its number, the thumbnail is
 *   ringed in the brand, the number `label-md-strong` / `text-on-brand-subtle`.
 *   It is `aria-current="page"`, and the column keeps it in view as the reader
 *   scrolls the sheet.
 * - **Hover** takes the tray's hover (`--on-tray-hover`, else
 *   `bg-neutral-subtle-hover`) and the hairline steps to `border-default`.
 *
 * The column scrolls in the package's `Scrollbar` and takes the height it is
 * given. A `<nav>` named by `label`; each page a button named « Page n ».
 */
interface Props {
  /** How many pages the document has. */
  count: number
  /** The page on screen, from 1 — `v-model`. */
  modelValue?: number
  /** The pages' ratio, width / height — A4 by default. */
  ratio?: string
  /** The column's name, for a reader. */
  label?: string
  /** The word before a page's number, for a reader — « Page 3 ». */
  pageLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: 1,
  ratio: '210 / 297',
  label: 'Pages',
  pageLabel: 'Page',
})

const emit = defineEmits<{
  'update:modelValue': [page: number]
}>()

defineSlots<{
  /** A page in miniature — the document drawn at the thumbnail's width. Decorative. */
  page?: (props: { page: number }) => unknown
}>()

/* The page on screen stays in view as the reader scrolls the sheet. */
const list = ref<HTMLElement | null>(null)
watch(
  () => props.modelValue,
  async (page) => {
    await nextTick()
    list.value?.children[page - 1]?.scrollIntoView({ block: 'nearest' })
  },
)
</script>

<template>
  <nav class="ds-page-thumbs" :aria-label="label">
    <Scrollbar shadows class="ds-page-thumbs__scroll">
      <ol ref="list" class="ds-page-thumbs__list">
        <li v-for="page in count" :key="page">
          <button
            type="button"
            class="ds-page-thumbs__item"
            :class="{ 'ds-page-thumbs__item--active': page === modelValue }"
            :aria-label="`${pageLabel} ${page}`"
            :aria-current="page === modelValue ? 'page' : undefined"
            @click="emit('update:modelValue', page)"
          >
            <span class="ds-page-thumbs__page" :style="{ aspectRatio: ratio }" aria-hidden="true">
              <slot name="page" :page="page" />
            </span>
            <span class="ds-page-thumbs__number" aria-hidden="true">{{ page }}</span>
          </button>
        </li>
      </ol>
    </Scrollbar>
  </nav>
</template>

<style scoped>
.ds-page-thumbs {
  display: flex;
  flex-direction: column;
  flex: none;
  min-height: 0;
}

.ds-page-thumbs__scroll {
  flex: 1 1 auto;
}

.ds-page-thumbs__list {
  display: flex;
  flex-direction: column;
  gap: var(--ds-spacing-sm);
  margin: 0;
  padding: var(--ds-spacing-lg) var(--ds-spacing-sm);
  list-style: none;
}

/* A page: its thumbnail and its number in one frame, as a file's tile. */
.ds-page-thumbs__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--ds-spacing-xs);
  padding: var(--ds-spacing-sm) var(--ds-spacing-sm) var(--ds-spacing-xs);
  border: 0;
  border-radius: var(--ds-radius-surface);
  background: transparent;
  color: inherit;
  font: inherit;
  cursor: pointer;
  transition:
    background-color var(--ds-motion-duration-quick) var(--ds-motion-easing-default),
    box-shadow var(--ds-motion-duration-instant) var(--ds-motion-easing-default);
}

.ds-page-thumbs__item:hover {
  background: var(--on-tray-hover, var(--ds-bg-neutral-subtle-hover));
}

.ds-page-thumbs__item:focus-visible {
  outline: none;
  box-shadow: var(--ds-focus-ring-brand-shadow-xs);
}

/* The basemap thumbnail's frame (ADR-0221), 88px wide at the page's ratio. */
.ds-page-thumbs__page {
  position: relative;
  display: block;
  box-sizing: border-box;
  width: 5.5rem;
  overflow: hidden;
  border: var(--ds-border-width-default) solid var(--ds-border-subtle);
  border-radius: var(--ds-radius-inner);
  background: var(--ds-bg-default);
  box-shadow: var(--ds-elevation-control);
  transition:
    border-color var(--ds-motion-duration-instant) var(--ds-motion-easing-default),
    box-shadow var(--ds-motion-duration-instant) var(--ds-motion-easing-default);
}

.ds-page-thumbs__item:hover .ds-page-thumbs__page {
  border-color: var(--ds-border-default);
}

.ds-page-thumbs__number {
  min-width: 1.5rem;
  font: var(--ds-font-label-md);
  font-variant-numeric: tabular-nums;
  color: var(--ds-text-subtle);
  text-align: center;
}

/* The page on screen (as `FileTile`'s active file): the brand's pale tint
   wraps the thumbnail and its number, the thumbnail in the brand's ring. */
.ds-page-thumbs__item--active,
.ds-page-thumbs__item--active:hover {
  background: var(--ds-bg-brand-subtle);
}

.ds-page-thumbs__item--active .ds-page-thumbs__page,
.ds-page-thumbs__item--active:hover .ds-page-thumbs__page {
  border-color: var(--ds-border-brand-solid);
  box-shadow:
    0 0 0 var(--ds-border-width-default) var(--ds-border-brand-solid),
    var(--ds-focus-ring-brand),
    var(--ds-elevation-control);
}

.ds-page-thumbs__item--active .ds-page-thumbs__number {
  font: var(--ds-font-label-md-strong);
  font-variant-numeric: tabular-nums;
  color: var(--ds-text-on-brand-subtle);
}

@media (prefers-reduced-motion: reduce) {
  .ds-page-thumbs__item,
  .ds-page-thumbs__page {
    transition: none;
  }
}
</style>
