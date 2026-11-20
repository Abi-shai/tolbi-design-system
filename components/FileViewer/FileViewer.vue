<script setup lang="ts">
import { ref, watch } from 'vue'
import { PageThumbs } from '../PageThumbs'
import { Skeleton } from '../Skeleton'
import { SwapTransition } from '../SwapTransition'

/**
 * The viewer beside a list of files (ADR-0235) — it shows one document at a
 * time and **carries the handoff** from one to the next, so the product no
 * longer wraps it by hand.
 *
 * - **A handoff, not a move.** The files are a grid with no order, so a
 *   sideways slide would say « next / previous », which is false. The new
 *   document arrives — a fade and 8px up over `enter` on `easing-out` — and
 *   the old one only fades, over `exit` on `easing-in`: `SwapTransition rise`,
 *   keyed by `documentKey`. Choosing the shown file again replays nothing.
 * - **The tile answers first, the viewer follows.** `FileTile`'s active state
 *   arrives at `instant`; the handoff starts with the leaver.
 * - **One handoff per gesture.** A heavy document (a 60-page Word file, about a
 *   second to render) arrives with its frame at once; `loading` resolves its
 *   content inside the frame with the plain `SwapTransition`, a state and not a
 *   second rise.
 * - **What changes size does not animate.** A paginated document (`pages`) has
 *   its column of `PageThumbs`; the column fades (`quick`) and the sheet takes
 *   its width back with no layout transition. A column on its way in waits for
 *   the document it belongs to — it appears with the arriver, never under the
 *   leaver, which would narrow it mid-fade.
 * - Reduced motion: `motion.css`'s global override is enough.
 *
 * The document is the product's (the default slot), and so is each page's
 * thumbnail (`#page`). The viewer takes the height it is given.
 */
interface Props {
  /** What is shown — a file's id. A new key is a handoff; the same key replays nothing. */
  documentKey: string | number
  /** The document's page count, when it is paginated: the column of pages shows. */
  pages?: number
  /** The page on screen, from 1 — `v-model:page`. */
  page?: number
  /** The document's frame is here, its content still resolving: `#loading` in its place. */
  loading?: boolean
  /** The pages' ratio — A4 by default. */
  pageRatio?: string
  /** The column of pages' name, for a reader. */
  pagesLabel?: string
  /** The word before a page's number, for a reader. */
  pageLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  pages: undefined,
  page: 1,
  loading: false,
  pageRatio: '210 / 297',
  pagesLabel: 'Pages',
  pageLabel: 'Page',
})

const emit = defineEmits<{
  'update:page': [page: number]
}>()

defineSlots<{
  /** The document shown. */
  default?: () => unknown
  /** A page in miniature, for the column — decorative. */
  page?: (props: { page: number }) => unknown
  /** In the document's frame while `loading` — a `Skeleton` by default. */
  loading?: () => unknown
}>()

/* Between a new key and its arrival, the column of pages waits: it belongs to
   the arriving document, not to the one fading out. */
const handing = ref(false)
watch(() => props.documentKey, () => { handing.value = true })
function arrived() { handing.value = false }
</script>

<template>
  <div class="ds-file-viewer">
    <SwapTransition>
      <PageThumbs
        v-if="pages && !handing"
        class="ds-file-viewer__pages"
        :count="pages"
        :model-value="page"
        :ratio="pageRatio"
        :label="pagesLabel"
        :page-label="pageLabel"
        @update:model-value="emit('update:page', $event)"
      >
        <template #page="{ page: n }"><slot name="page" :page="n" /></template>
      </PageThumbs>
    </SwapTransition>
    <div class="ds-file-viewer__stage">
      <SwapTransition rise @before-enter="arrived">
        <div :key="documentKey" class="ds-file-viewer__document">
          <SwapTransition>
            <div v-if="loading" key="loading" class="ds-file-viewer__content">
              <slot name="loading"><Skeleton :lines="6" /></slot>
            </div>
            <div v-else key="ready" class="ds-file-viewer__content"><slot /></div>
          </SwapTransition>
        </div>
      </SwapTransition>
    </div>
  </div>
</template>

<style scoped>
.ds-file-viewer {
  display: flex;
  flex: 1 1 auto;
  min-width: 0;
  min-height: 0;
  height: 100%;
}

.ds-file-viewer__stage {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
}

.ds-file-viewer__document,
.ds-file-viewer__content {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
}
</style>
