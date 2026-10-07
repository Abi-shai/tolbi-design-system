<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Button } from '../Button'
import { Tooltip } from '../Tooltip'
import { TolbiAiSpark } from '../TolbiAiSpark'

/**
 * Tolbi AI's entry in the bar, above where its panel opens: the sign and the
 * name, a `Button` like the bar's « Apprendre » — the sign in its leading place
 * — and the current item's mark while the panel is open (ADR-0062). ⌘J (Ctrl+J
 * elsewhere) does the same as a click, from anywhere on the page.
 *
 * It goes in `HorizontalNavigation`'s `#assistant` slot; `v-model:open` is the
 * panel's own `v-model:open`.
 */
interface Props {
  label?: string
  /** Shown on hover, as the bar's other tooltips are, with the shortcut. */
  tooltip?: string
  /** The panel's `id`, so the button says what it opens. */
  controls?: string
  /** Listen for ⌘J / Ctrl+J while the button is on the page. */
  shortcut?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  label: 'Tolbi AI',
  tooltip: 'Interroger Tolbi AI sur ce projet',
  controls: undefined,
  shortcut: true,
})

const open = defineModel<boolean>('open', { default: false })

const root = ref<HTMLElement>()
const button = () => root.value?.querySelector('button')

/* ── The shortcut ─────────────────────────────────────────────────────── */
const apple = ref(false)
const keyName = computed(() => (apple.value ? '⌘J' : 'Ctrl+J'))
const ariaKeys = computed(() => (apple.value ? 'Meta+J' : 'Control+J'))

function onKey(event: KeyboardEvent) {
  const modifier = apple.value ? event.metaKey : event.ctrlKey
  if (!modifier || event.shiftKey || event.altKey || event.key.toLowerCase() !== 'j') return
  event.preventDefault()
  open.value = !open.value
}

onMounted(() => {
  apple.value = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)
  if (props.shortcut) window.addEventListener('keydown', onKey)
})

onBeforeUnmount(() => window.removeEventListener('keydown', onKey))

/*
  Closing from inside the panel — its own close button, Escape in a field —
  leaves the focus on something about to be hidden. It comes back here, to the
  control that opens it again.
*/
watch(open, (now, was) => {
  if (now || !was) return
  const panel = props.controls ? document.getElementById(props.controls) : null
  const active = document.activeElement
  if (!active || active === document.body || panel?.contains(active)) button()?.focus()
})

/* ── The tooltip, as the bar's others ─────────────────────────────────── */
const tip = ref(false)
</script>

<template>
  <span
    ref="root"
    class="ds-tolbi-ai-nav-button"
    @mouseenter="tip = true"
    @mouseleave="tip = false"
  >
    <Button
      variant="secondary-gray"
      size="sm"
      :label="label"
      :selected="open"
      :aria-expanded="open"
      :aria-controls="controls"
      :aria-keyshortcuts="shortcut ? ariaKeys : undefined"
      @click="open = !open"
    >
      <template #leading>
        <TolbiAiSpark :size="20" :aria-label="null" />
      </template>
    </Button>
    <Tooltip
      v-if="tip && !open"
      class="ds-tolbi-ai-nav-button__tip"
      :title="shortcut ? `${tooltip} · ${keyName}` : tooltip"
      arrow="top-center"
      role="presentation"
    />
  </span>
</template>

<style scoped>
.ds-tolbi-ai-nav-button {
  position: relative;
  display: inline-flex;
}

/* Under the button, as every tooltip in the bar (`HorizontalNavigation`). */
.ds-tolbi-ai-nav-button__tip {
  position: absolute;
  top: calc(100% + var(--ds-spacing-sm));
  left: 50%;
  transform: translateX(-50%);
  z-index: var(--ds-z-popover);
  white-space: nowrap;
  pointer-events: none;
}
</style>
