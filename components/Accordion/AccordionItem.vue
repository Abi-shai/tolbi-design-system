<script setup lang="ts">
import { computed, inject, ref, useId, watch } from 'vue'
import { Icon } from '../Icon'
import { ACCORDION_KEY, type AccordionHeadingLevel, type AccordionValue } from './context'

/**
 * One section of an `Accordion` — or, alone, a disclosure (13 / 19 ship one):
 * then `v-model:open` holds it.
 *
 * The whole title row is the `<button>` (19 / 19), in a heading. The content
 * opens the space it needs — ADR-0025's `0fr → 1fr`, over `enter` with
 * `easing-out`, and closes faster, over `exit` (ADR-0021); nothing moves under
 * reduced motion. Closed, it is `hidden="until-found"`: the browser's find
 * still reaches its words, and opens the section that holds them (GOV.UK,
 * React Aria). It waits for the close to finish before hiding, or the text
 * would vanish before the space closed over it.
 */
interface Props {
  title: string
  /** In an `Accordion`, what this section stands for. */
  value?: AccordionValue
  disabled?: boolean
  /** Alone, the heading's level. In an `Accordion`, the accordion's. */
  headingLevel?: AccordionHeadingLevel
}

const props = withDefaults(defineProps<Props>(), {
  value: undefined,
  disabled: false,
  headingLevel: 3,
})

/** Alone: whether it is open. */
const standaloneOpen = defineModel<boolean>('open', { default: false })

const accordion = inject(ACCORDION_KEY, null)
const inAccordion = computed(() => Boolean(accordion) && props.value !== undefined)
const isOpen = computed(() => (inAccordion.value ? accordion!.isOpen(props.value!) : standaloneOpen.value))
const level = computed(() => (inAccordion.value ? accordion!.headingLevel.value : props.headingLevel))

const uid = useId()
const buttonId = `ds-accordion-button-${uid}`
const panelId = `ds-accordion-panel-${uid}`

function toggle() {
  if (props.disabled) return
  if (inAccordion.value) accordion!.toggle(props.value!)
  else standaloneOpen.value = !standaloneOpen.value
}

/* The browser's find reached a closed section's words: open it. */
function onBeforeMatch() {
  if (inAccordion.value) accordion!.open(props.value!)
  else standaloneOpen.value = true
}

/* Hidden only once the close has played; shown at once on opening. */
const settledClosed = ref(!isOpen.value)
watch(isOpen, open => { if (open) settledClosed.value = false })
function onTransitionEnd(event: TransitionEvent) {
  if (event.target === event.currentTarget && !isOpen.value) settledClosed.value = true
}
</script>

<template>
  <div class="ds-accordion-item" :class="{ 'ds-accordion-item--open': isOpen }">
    <component :is="`h${level}`" class="ds-accordion-item__heading">
      <button
        :id="buttonId"
        type="button"
        class="ds-accordion-item__trigger"
        :aria-expanded="isOpen"
        :aria-controls="panelId"
        :disabled="disabled"
        @click="toggle"
      >
        <span class="ds-accordion-item__title">{{ title }}</span>
        <Icon name="chevron-down" :size="20" class="ds-accordion-item__chevron" aria-hidden="true" />
      </button>
    </component>
    <div class="ds-accordion-item__panel" @transitionend="onTransitionEnd">
      <div
        :id="panelId"
        class="ds-accordion-item__content"
        role="region"
        :aria-labelledby="buttonId"
        :hidden="settledClosed && !isOpen ? 'until-found' : undefined"
        @beforematch="onBeforeMatch"
      >
        <div class="ds-accordion-item__inner"><slot /></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* A rule between sections, not around them (9 / 19). */
.ds-accordion-item + .ds-accordion-item {
  border-top: var(--ds-border-width-default) solid var(--ds-border-subtle);
}

.ds-accordion-item__heading {
  margin: 0;
  font: inherit;
}

.ds-accordion-item__trigger {
  display: flex;
  align-items: center;
  gap: var(--ds-spacing-lg);
  width: 100%;
  padding: var(--ds-spacing-lg) var(--ds-spacing-xs);
  border: 0;
  border-radius: var(--ds-radius-inner);
  background: none;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition: box-shadow var(--ds-motion-duration-instant) var(--ds-motion-easing-default);
}

.ds-accordion-item__trigger:focus-visible {
  outline: none;
  box-shadow: var(--ds-focus-ring-brand);
}

.ds-accordion-item__title {
  flex: 1;
  min-width: 0;
  font: var(--ds-font-label-lg-strong);
  color: var(--ds-text-strong);
  overflow-wrap: anywhere;
}

/* It turns over: down closed, up open (Radix, MUI, Untitled). */
.ds-accordion-item__chevron {
  flex: none;
  color: var(--ds-text-subtle);
  transition:
    rotate var(--ds-motion-duration-enter) var(--ds-motion-easing-default),
    color var(--ds-motion-duration-quick) var(--ds-motion-easing-default);
}

.ds-accordion-item__trigger:hover:not(:disabled) .ds-accordion-item__chevron {
  color: var(--ds-text-default);
}

.ds-accordion-item--open .ds-accordion-item__chevron {
  rotate: 180deg;
}

.ds-accordion-item__trigger:disabled {
  cursor: not-allowed;
}

.ds-accordion-item__trigger:disabled .ds-accordion-item__title,
.ds-accordion-item__trigger:disabled .ds-accordion-item__chevron {
  color: var(--ds-text-disabled);
}

/* ADR-0025: the space opens rather than the layout being shoved. Closes faster. */
.ds-accordion-item__panel {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows var(--ds-motion-duration-exit) var(--ds-motion-easing-in);
}

.ds-accordion-item--open .ds-accordion-item__panel {
  grid-template-rows: 1fr;
  transition: grid-template-rows var(--ds-motion-duration-enter) var(--ds-motion-easing-out);
}

.ds-accordion-item__content {
  min-height: 0;
  overflow: hidden;
}

/* The content starts on the title's edge (a chevron on the right takes none of it). */
.ds-accordion-item__inner {
  padding: 0 var(--ds-spacing-xs) var(--ds-spacing-xl);
  font: var(--ds-font-body-md);
  color: var(--ds-text-default);
}
</style>
