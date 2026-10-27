<script setup lang="ts">
import { SurfaceTransition } from '../SurfaceTransition'
import { ref, computed, onMounted, onUnmounted, nextTick, useId, watch } from 'vue'
import { useFormField } from '../FormField/context'
import { Icon } from '../Icon'
import { Scrollbar } from '../Scrollbar'
import { Avatar } from '../Avatar'
import { Button } from '../Button'
import { Flag } from '../Flag'
import { Tag } from '../Tag'
import type { IconName } from '../Icon'
import DropdownSelectItem from './DropdownSelectItem.vue'
import { useAnchoredSurface } from '../../composables/useAnchoredSurface'
import type { DropdownSelectItemType } from './DropdownSelectItem.vue'

/** `flag-leading`: a country's flag before each option and the value (ADR-0085). */
export type InputDropdownType = 'default' | 'icon-leading' | 'avatar-leading' | 'dot-leading' | 'flag-leading' | 'search'

/**
 * `md` is the form field. `sm` is a control riding in a bar — the table's
 * « Lignes par page » (ADR-0080): `control-padding-sm`, `label-lg`, and the
 * field hugs its value instead of taking the line.
 */
export type InputDropdownSize = 'sm' | 'md'

/**
 * `box` is the field. `none` is the list riding inside another control's box —
 * `InputField`'s `options`, « TVA ⌄ » at the end of the number (ADR-0081): the
 * word and its chevron, no border, no padding; the box around it carries the
 * focus ring, the error and the disabled state, and the word underlines while
 * it has the focus, as `PhoneField`'s prefix does.
 */
export type InputDropdownChrome = 'box' | 'none'

export interface InputDropdownOption {
  /**
   * Ce que l'appelant tient déjà — un identifiant de base est un nombre aussi
   * souvent qu'une chaîne. Forcer la chaîne ici ne supprime pas la conversion,
   * elle la déplace chez chaque appelant, aller et retour.
   */
  value: string | number
  label: string
  supportingText?: string
  icon?: IconName
  avatarSrc?: string
  avatarAlt?: string
  dotColor?: string
  /** `type="flag-leading"`: the country's ISO 3166-1 code — `SN`, `CI`. */
  flag?: string
  disabled?: boolean
}

type Value = string | number

interface Props {
  type?: InputDropdownType
  placeholder?: string
  options: InputDropdownOption[]
  modelValue?: Value | null
  /**
   * Several choices (ADR-0085): the chosen ones are tags on one line, the rest
   * a « +N » — the field never grows; the list leads each row with a box and
   * stays open while they are ticked, « Effacer » at its foot. The values are
   * their own model, `v-model:values`, so `modelValue` keeps its one-value type.
   */
  multiple?: boolean
  values?: Value[]
  /** Said for the chosen count, at the list's foot and in the field's name. */
  countLabel?: (count: number) => string
  clearLabel?: string
  /** The tags' close: « Retirer » + the option's label. */
  removeLabel?: string
  leadingIcon?: IconName
  /** Standalone use only. Inside a FormField, the wrapper's `disabled` decides. */
  disabled?: boolean
  size?: InputDropdownSize
  /** The name, outside a FormField — which otherwise gives it its label. */
  ariaLabel?: string
  chrome?: InputDropdownChrome
  /**
   * The box the list hangs from, when it rides in another control's
   * (`chrome="none"`): the gap is measured from that box, not from the word.
   */
  anchor?: HTMLElement | null
}

const props = withDefaults(defineProps<Props>(), {
  type: 'default',
  placeholder: 'Select...',
  disabled: false,
  size: 'md',
  ariaLabel: undefined,
  chrome: 'box',
  anchor: null,
  multiple: false,
  values: () => [],
  countLabel: (n: number) => `${n} ${n > 1 ? 'sélectionnés' : 'sélectionné'}`,
  clearLabel: 'Effacer',
  removeLabel: 'Retirer',
})

const field = useFormField()

// Both triggers are focusable, so both must answer to the wrapper's `for`.
const triggerId   = computed(() => field?.id.value)
const describedBy = computed(() => field?.describedBy.value)
const isInvalid   = computed(() => field?.invalid.value ?? false)
const isDisabled  = computed(() => (field?.disabled.value ?? false) || props.disabled)

/* Named by `ariaLabel`, the button would say « Type d'identifiant » and not
   which one is chosen: an `aria-label` replaces the content it names. So the
   name is the label *and* the value — « Type d'identifiant TVA » (ADR-0081). */
const uid     = useId()
const nameId  = `ds-input-dropdown-name-${uid}`
const valueId = `ds-input-dropdown-value-${uid}`
/* Inside a FormField, the `<label for>` named the button and dropped its value
   the same way (« Pays », not « Pays Sénégal ») — so the label is read first,
   then the value (ADR-0082). */
const labelledBy = computed(() => {
  /* Nothing chosen, the placeholder is not a value: the label alone. */
  const value = (props.multiple ? chosen.value.length : selectedOption.value) ? ` ${valueId}` : ''
  if (props.ariaLabel) return `${nameId}${value}`
  const label = field?.labelId?.value
  return label ? `${label}${value}` : undefined
})

const emit = defineEmits<{
  'update:modelValue': [value: Value | null]
  'update:values': [values: Value[]]
}>()

const open = ref(false)
const searchQuery = ref('')
const rootEl = ref<HTMLElement | null>(null)
const searchInputEl = ref<HTMLInputElement | null>(null)
const wrapEl = ref<HTMLElement | null>(null)
const panelEl = ref<HTMLElement | null>(null)

/* The list floats in the top layer, at the field's width (ADR-0078): at the
   bottom of a side panel or a dialog, it opens over the box instead of
   growing its scroll — and above the field when the room below is short. */
const anchorEl = computed(() => props.anchor ?? wrapEl.value)
useAnchoredSurface(anchorEl, panelEl, {
  /* Inside a box, the list ends under its word: the word ends the box. */
  align: () => (props.chrome === 'none' ? 'end' : 'start'),
  matchWidth: props.size === 'md' && props.chrome === 'box',
})

const selectedOption = computed(() =>
  props.multiple || props.modelValue === null || props.modelValue === undefined
    ? null
    : props.options.find(o => o.value === props.modelValue) ?? null,
)

/* ── Several choices (ADR-0085) ─────────────────────────────────────── */
const chosenValues = computed<Value[]>(() => (props.multiple ? props.values : []))
/* In the options' order, whatever order they were ticked in. */
const chosen = computed(() => props.options.filter(o => chosenValues.value.includes(o.value)))
const isChosen = (o: InputDropdownOption) => (props.multiple ? chosenValues.value.includes(o.value) : o.value === props.modelValue)

function toggleValue(o: InputDropdownOption) {
  const next = isChosen(o) ? chosenValues.value.filter(v => v !== o.value) : [...chosenValues.value, o.value]
  emit('update:values', props.options.map(x => x.value).filter(v => next.includes(v)))
}

function removeValue(o: InputDropdownOption) {
  emit('update:values', chosenValues.value.filter(v => v !== o.value))
}

function clearAll() {
  emit('update:values', [])
}

/* Backspace on the field takes the last choice back (MUI, Mantine). */
function onOpenerKeydown(e: KeyboardEvent) {
  if (e.key !== 'Backspace' || !chosen.value.length) return
  e.preventDefault()
  removeValue(chosen.value[chosen.value.length - 1])
}

/*
  The tags that fit on the field's one line, the rest as « +N ». Every tag is
  laid out once in a hidden row to be measured — its width does not depend on
  where it sits — and the visible row shows as many as fit beside the « +N »
  they leave. Re-measured when the field or the choice changes.
*/
const tagsEl = ref<HTMLElement | null>(null)
const measureEl = ref<HTMLElement | null>(null)
const fitting = ref(Infinity)

function measureTags() {
  const box = tagsEl.value, probe = measureEl.value
  if (!box || !probe) return
  const tags = [...probe.querySelectorAll<HTMLElement>('[data-tag]')]
  const more = probe.querySelector<HTMLElement>('[data-more]')
  const gap = parseFloat(getComputedStyle(box).columnGap) || 0
  const room = box.clientWidth
  let used = 0
  let n = 0
  for (const [i, tag] of tags.entries()) {
    const width = tag.offsetWidth + (i ? gap : 0)
    const rest = tags.length - i - 1
    const reserve = rest ? gap + (more?.offsetWidth ?? 0) : 0
    if (used + width + reserve > room) break
    used += width
    n++
  }
  fitting.value = n
}

const shown = computed(() => chosen.value.slice(0, Math.max(0, fitting.value)))
const hiddenCount = computed(() => chosen.value.length - shown.value.length)

let tagObserver: ResizeObserver | null = null
watch(chosen, async () => { await nextTick(); measureTags() })

const filteredOptions = computed(() => {
  if (props.type !== 'search' || !searchQuery.value) return props.options
  const q = searchQuery.value.toLowerCase()
  return props.options.filter(
    o => o.label.toLowerCase().includes(q) || o.supportingText?.toLowerCase().includes(q),
  )
})

const itemType = computed((): DropdownSelectItemType => {
  switch (props.type) {
    case 'icon-leading':   return 'icon'
    case 'avatar-leading': return 'avatar'
    case 'dot-leading':    return 'dot'
    case 'flag-leading':   return 'flag'
    default:               return 'default'
  }
})

async function openPanel() {
  if (open.value || isDisabled.value) return
  open.value = true
  if (props.type === 'search') {
    searchQuery.value = ''
    await nextTick()
    searchInputEl.value?.focus()
  }
}

function close() {
  open.value = false
  searchQuery.value = ''
}

function toggle() {
  if (isDisabled.value) return
  if (open.value) close()
  else openPanel()
}

function selectOption(option: InputDropdownOption) {
  if (option.disabled) return
  /* Several choices: the list stays open while they are ticked (11 / 13). */
  if (props.multiple) return toggleValue(option)
  emit('update:modelValue', option.value)
  close()
}

function onClickOutside(e: MouseEvent) {
  if (rootEl.value && !rootEl.value.contains(e.target as Node)) close()
}

function onKeyDown(e: KeyboardEvent) {
  if (e.key !== 'Escape' || !open.value || e.defaultPrevented) return
  /* An Escape from a dialog that does not hold this field is that dialog's. */
  const dialog = (e.target as Element | null)?.closest?.('.ds-dialog')
  if (dialog && !dialog.contains(rootEl.value)) return
  close()
}

/* An Escape from inside the field is the list's, and stops there — inside a
   dialog it closed the dialog with it (ADR-0078). */
function onRootKeyDown(e: KeyboardEvent) {
  if (e.key !== 'Escape' || !open.value) return
  e.stopPropagation()
  e.preventDefault()
  close()
}

onMounted(() => {
  document.addEventListener('click', onClickOutside, true)
  document.addEventListener('keydown', onKeyDown)
  if (props.multiple && tagsEl.value) {
    tagObserver = new ResizeObserver(() => measureTags())
    tagObserver.observe(tagsEl.value)
    measureTags()
  }
})

onUnmounted(() => {
  document.removeEventListener('click', onClickOutside, true)
  document.removeEventListener('keydown', onKeyDown)
  tagObserver?.disconnect()
})
</script>

<template>
  <div
    class="ds-input-dropdown"
    :class="[`ds-input-dropdown--${size}`, `ds-input-dropdown--chrome-${chrome}`]"
    ref="rootEl"
    @keydown="onRootKeyDown"
  >
    <!-- Field group. Label and message live on FormField — see ADR-0008. -->
    <div class="ds-input-dropdown__field-group">
      <div ref="wrapEl" class="ds-input-dropdown__input-wrap">
        <!-- ── Search type ──────────────────────────────────────────── -->
        <div
          v-if="type === 'search'"
          class="ds-input-dropdown__trigger"
          :class="{
            'ds-input-dropdown__trigger--open':     open,
            'ds-input-dropdown__trigger--disabled': isDisabled,
          }"
          :aria-disabled="isDisabled || undefined"
          :id="triggerId"
          :aria-describedby="describedBy"
          :aria-invalid="isInvalid || undefined"
          :aria-label="ariaLabel"
          role="combobox"
          :aria-expanded="open"
          aria-haspopup="listbox"
          @click="openPanel"
        >
          <div class="ds-input-dropdown__content">
            <Icon name="search" :size="20" class="ds-input-dropdown__search-icon" aria-hidden="true" />
            <input
              v-if="open"
              ref="searchInputEl"
              class="ds-input-dropdown__search-input"
              v-model="searchQuery"
              :placeholder="selectedOption?.label || placeholder"
              aria-label="Search"
              @click.stop
            />
            <template v-else>
              <span
                class="ds-input-dropdown__value"
                :class="{ 'ds-input-dropdown__value--placeholder': !selectedOption }"
              >{{ selectedOption?.label || placeholder }}</span>
              <span v-if="selectedOption?.supportingText" class="ds-input-dropdown__supporting">
                {{ selectedOption.supportingText }}
              </span>
            </template>
          </div>
        </div>

        <!--
          ── Several choices (ADR-0085) ─────────────────────────────────
          The box is not one button: the tags' closes are buttons too, and a
          button cannot hold another. So the box holds the tags and an opener
          that ends it; a click anywhere else on the box opens the list too.
        -->
        <div
          v-else-if="multiple"
          class="ds-input-dropdown__trigger ds-input-dropdown__trigger--multiple"
          :class="{
            'ds-input-dropdown__trigger--open':     open,
            'ds-input-dropdown__trigger--disabled': isDisabled,
          }"
          @click="toggle"
        >
          <div ref="tagsEl" class="ds-input-dropdown__tags">
            <Tag
              v-for="o in shown"
              :key="o.value"
              size="sm"
              :label="o.label"
              action="close"
              :close-label="`${removeLabel} ${o.label}`"
              @close="removeValue(o)"
            />
            <span v-if="hiddenCount" class="ds-input-dropdown__more">+{{ hiddenCount }}</span>
            <span
              v-if="!chosen.length"
              class="ds-input-dropdown__value ds-input-dropdown__value--placeholder"
            >{{ placeholder }}</span>
          </div>
          <!-- Every chosen tag, laid out once to be measured — never seen. -->
          <div ref="measureEl" class="ds-input-dropdown__measure" aria-hidden="true">
            <Tag v-for="o in chosen" :key="o.value" data-tag size="sm" :label="o.label" action="close" />
            <span data-more class="ds-input-dropdown__more">+{{ chosen.length }}</span>
          </div>
          <button
            type="button"
            class="ds-input-dropdown__opener"
            :id="triggerId"
            :disabled="isDisabled"
            :aria-describedby="describedBy"
            :aria-invalid="isInvalid || undefined"
            :aria-labelledby="labelledBy"
            :aria-expanded="open"
            aria-haspopup="listbox"
            @click.stop="toggle"
            @keydown="onOpenerKeydown"
          >
            <span v-if="ariaLabel" :id="nameId" class="ds-input-dropdown__name">{{ ariaLabel }}</span>
            <span :id="valueId" class="ds-input-dropdown__name">{{ countLabel(chosen.length) }}</span>
            <Icon
              :name="open ? 'chevron-up' : 'chevron-down'"
              :size="20"
              class="ds-input-dropdown__chevron"
              aria-hidden="true"
            />
          </button>
        </div>

        <!-- ── All other types ─────────────────────────────────────── -->
        <button
          v-else
          type="button"
          class="ds-input-dropdown__trigger"
          :class="{
            'ds-input-dropdown__trigger--open':     open,
            'ds-input-dropdown__trigger--disabled': isDisabled,
          }"
          :disabled="isDisabled"
          :id="triggerId"
          :aria-describedby="describedBy"
          :aria-invalid="isInvalid || undefined"
          :aria-labelledby="labelledBy"
          :aria-expanded="open"
          aria-haspopup="listbox"
          @click="toggle"
        >
          <span v-if="ariaLabel" :id="nameId" class="ds-input-dropdown__name">{{ ariaLabel }}</span>
          <div class="ds-input-dropdown__content">
            <Icon
              v-if="type === 'icon-leading' && (selectedOption?.icon || leadingIcon)"
              :name="selectedOption?.icon || leadingIcon!"
              :size="20"
              class="ds-input-dropdown__leading-icon"
              aria-hidden="true"
            />
            <Avatar
              v-else-if="type === 'avatar-leading'"
              :src="selectedOption?.avatarSrc"
              :alt="selectedOption?.avatarAlt"
              size="xs"
              class="ds-input-dropdown__leading-avatar"
            />
            <Flag
              v-else-if="type === 'flag-leading' && selectedOption?.flag"
              :code="selectedOption.flag"
              :size="20"
            />
            <span
              v-else-if="type === 'dot-leading'"
              class="ds-input-dropdown__leading-dot"
              :style="selectedOption?.dotColor ? { backgroundColor: selectedOption.dotColor } : undefined"
              aria-hidden="true"
            />

            <span
              :id="valueId"
              class="ds-input-dropdown__value"
              :class="{ 'ds-input-dropdown__value--placeholder': !selectedOption }"
            >{{ selectedOption?.label || placeholder }}</span>
            <span v-if="selectedOption?.supportingText" class="ds-input-dropdown__supporting">
              {{ selectedOption.supportingText }}
            </span>
          </div>

          <Icon
            :name="open ? 'chevron-up' : 'chevron-down'"
            :size="size === 'sm' || chrome === 'none' ? 16 : 20"
            class="ds-input-dropdown__chevron"
            aria-hidden="true"
          />
        </button>

        <!-- ── Dropdown panel ──────────────────────────────────────── -->
        <SurfaceTransition>
          <div
            v-if="open"
            ref="panelEl"
            popover="manual"
            class="ds-input-dropdown__panel"
            role="listbox"
            :aria-multiselectable="multiple || undefined"
          >
            <Scrollbar max-height="320px">
              <div class="ds-input-dropdown__panel-items">
                <DropdownSelectItem
                  v-for="option in filteredOptions"
                  :key="option.value"
                  :type="itemType"
                  :label="option.label"
                  :supporting-text="option.supportingText"
                  :icon="option.icon || leadingIcon"
                  :avatar-src="option.avatarSrc"
                  :avatar-alt="option.avatarAlt"
                  :dot-color="option.dotColor"
                  :flag="option.flag"
                  :selected="isChosen(option)"
                  :checkbox="multiple"
                  :disabled="option.disabled"
                  @click="selectOption(option)"
                />
              </div>
            </Scrollbar>
            <!-- How many, and the way back to none — outside the scroll. -->
            <div v-if="multiple" class="ds-input-dropdown__foot">
              <span class="ds-input-dropdown__count">{{ countLabel(chosen.length) }}</span>
              <Button v-if="chosen.length" variant="link" size="sm" :label="clearLabel" @click="clearAll" />
            </div>
          </div>
        </SurfaceTransition>
      </div>
    </div>

    <!-- Hint text -->
  </div>
</template>

<style scoped>
/* ── Root ──────────────────────────────────────────────────────────── */
.ds-input-dropdown {
  display: flex;
  flex-direction: column;
  gap: var(--ds-spacing-md);
  width: 100%;
}

/* ── Field group: label + input ────────────────────────────────────── */
.ds-input-dropdown__field-group {
  display: flex;
  flex-direction: column;
  gap: var(--ds-spacing-sm);
}

/* ── Label ─────────────────────────────────────────────────────────── */
/* ── Input wrap (the panel's anchor) ───────────────────────────────── */
.ds-input-dropdown__input-wrap {
  position: relative;
  width: 100%;
}

/* ── Trigger field ─────────────────────────────────────────────────── */
.ds-input-dropdown__trigger {
  display: flex;
  align-items: center;
  gap: var(--ds-spacing-md);
  width: 100%;
  padding: var(--ds-control-padding-md);
  box-sizing: border-box;
  background-color: var(--ds-bg-default);
  border: var(--ds-border-width-default) solid var(--ds-border-default);
  border-radius: var(--ds-radius-control);
  box-shadow: var(--ds-elevation-control);
  cursor: pointer;
  text-align: left;
  font: inherit;
  color: inherit;
  transition: border-color var(--ds-motion-duration-moderate) var(--ds-motion-easing-default), box-shadow var(--ds-motion-duration-instant) var(--ds-motion-easing-default);
}

.ds-input-dropdown__trigger--open,
.ds-input-dropdown__trigger:focus-visible {
  outline: none;
  border-color: var(--ds-border-brand);
  box-shadow: var(--ds-focus-ring-brand-shadow-xs);
}

/* Mêmes valeurs que le champ désactivé d'InputField : c'est le même état. */
.ds-input-dropdown__trigger--disabled {
  box-shadow: none;
  cursor: not-allowed;
  color: var(--ds-text-disabled);
}

.ds-input-dropdown__trigger--disabled .ds-input-dropdown__value,
.ds-input-dropdown__trigger--disabled .ds-input-dropdown__chevron {
  color: var(--ds-text-disabled);
}

/* The name read before the value; never seen — the field's context shows it. */
.ds-input-dropdown__name {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
}

/* ── Content row ───────────────────────────────────────────────────── */
.ds-input-dropdown__content {
  display: flex;
  align-items: center;
  gap: var(--ds-spacing-md);
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

/* ── Value text ────────────────────────────────────────────────────── */
.ds-input-dropdown__value {  font: var(--ds-font-body-lg-emphasis);
  color: var(--ds-text-strong);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-shrink: 0;
}

.ds-input-dropdown__value--placeholder {
  font-family: var(--ds-typography-font-family-poppins);
  font-weight: var(--ds-font-weight-body-lg);
  color: var(--ds-text-placeholder);
}

/* ── Supporting text ───────────────────────────────────────────────── */
.ds-input-dropdown__supporting {  font: var(--ds-font-body-lg-emphasis);
  color: var(--ds-text-subtle);
  white-space: nowrap;
  flex-shrink: 0;
}

/* ── Chevron ───────────────────────────────────────────────────────── */
.ds-input-dropdown__chevron {
  color: var(--ds-text-default);
  flex-shrink: 0;
}

/* ── Leading icon ──────────────────────────────────────────────────── */
.ds-input-dropdown__leading-icon {
  color: var(--ds-text-default);
  flex-shrink: 0;
}

/* ── Leading avatar ────────────────────────────────────────────────── */
.ds-input-dropdown__leading-avatar {
  flex-shrink: 0;
}

/* ── Leading dot ───────────────────────────────────────────────────── */
.ds-input-dropdown__leading-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: var(--ds-radius-pill);
  background-color: var(--ds-text-success);
  flex-shrink: 0;
}

/* ── Search icon ───────────────────────────────────────────────────── */
.ds-input-dropdown__search-icon {
  color: var(--ds-text-default);
  flex-shrink: 0;
}

/* ── Search input ──────────────────────────────────────────────────── */
.ds-input-dropdown__search-input {
  flex: 1;
  min-width: 0;
  background: transparent;
  border: none;
  outline: none;
  font: var(--ds-font-body-lg-emphasis);
  color: var(--ds-text-strong);
  padding: 0;
}

.ds-input-dropdown__search-input::placeholder {
  font-family: var(--ds-typography-font-family-poppins);
  font-weight: var(--ds-font-weight-body-lg);
  color: var(--ds-text-placeholder);
}

/* ── Dropdown panel ────────────────────────────────────────────────── */
/* In the top layer, placed and sized on the field (ADR-0078); the gap is the
   margin, and the rest undoes what the browser gives a popover. */
.ds-input-dropdown__panel {
  position: fixed;
  inset: auto;
  box-sizing: border-box;
  margin: var(--ds-spacing-md) 0;
  padding: 0;
  color: inherit;
  z-index: var(--ds-z-popover);
  /* A column, so the list's scroll shrinks to the room it has (ADR-0078). */
  display: flex;
  flex-direction: column;
  max-height: var(--anchor-room, none);
  background-color: var(--ds-bg-default);
  border: var(--ds-border-width-default) solid var(--ds-border-subtle);
  border-radius: var(--ds-radius-control);
  box-shadow: var(--ds-elevation-overlay);
  overflow: hidden;
}

/* ── Panel items list ──────────────────────────────────────────────── */
/* Scroll is delegated to <Scrollbar> (ADR-0001) — its thumb overlays the list
 * instead of reserving a gutter, so the options keep the panel's full width. */
.ds-input-dropdown__panel-items {
  display: flex;
  flex-direction: column;
  padding: var(--ds-spacing-xs) 0;
}

/* ── Size sm: a control in a bar (ADR-0080) ────────────────────────── */
/* It hugs its value, and its list is at least as wide as the field — a field
   that says « 10 » is narrower than the « 100 » in its list. */
.ds-input-dropdown--sm {
  display: inline-flex;
  width: auto;
}

.ds-input-dropdown--sm .ds-input-dropdown__input-wrap {
  width: auto;
}

.ds-input-dropdown--sm .ds-input-dropdown__trigger {
  width: auto;
  gap: var(--ds-spacing-sm);
  padding: var(--ds-control-padding-sm);
}

.ds-input-dropdown--sm .ds-input-dropdown__value {
  font: var(--ds-font-label-lg);
}

.ds-input-dropdown--sm .ds-input-dropdown__panel {
  min-width: var(--anchor-width);
}

/* ── Chrome none: a list inside another control's box (ADR-0081) ───── */
/* The box is the host's — its border, its ring (`:focus-within`), its error
   and its disabled state. What is left is the word and its chevron. */
.ds-input-dropdown--chrome-none {
  display: inline-flex;
  flex: none;
  width: auto;
}

.ds-input-dropdown--chrome-none .ds-input-dropdown__input-wrap {
  width: auto;
}

.ds-input-dropdown--chrome-none .ds-input-dropdown__trigger {
  width: auto;
  gap: var(--ds-spacing-xs);
  padding: 0;
  background: none;
  border: 0;
  border-radius: 0;
  box-shadow: none;
}

.ds-input-dropdown--chrome-none .ds-input-dropdown__trigger--open,
.ds-input-dropdown--chrome-none .ds-input-dropdown__trigger:focus-visible {
  box-shadow: none;
}

.ds-input-dropdown--chrome-none .ds-input-dropdown__value {
  font: var(--ds-font-body-lg);
  color: var(--ds-text-default);
  text-underline-offset: 3px;
}

/* The ring is the box's; the word says which part of the box has it. */
.ds-input-dropdown--chrome-none .ds-input-dropdown__trigger:focus-visible .ds-input-dropdown__value {
  color: var(--ds-text-strong);
  text-decoration: underline;
}

.ds-input-dropdown--chrome-none .ds-input-dropdown__chevron {
  color: var(--ds-text-subtle);
}

.ds-input-dropdown--chrome-none .ds-input-dropdown__trigger--disabled .ds-input-dropdown__value,
.ds-input-dropdown--chrome-none .ds-input-dropdown__trigger--disabled .ds-input-dropdown__chevron {
  color: var(--ds-text-disabled);
}

/* A list of short words (« TVA », « EORI ») still reads as a list. */
.ds-input-dropdown--chrome-none .ds-input-dropdown__panel {
  min-width: max(var(--anchor-width), 10rem);
}

/* ── Several choices (ADR-0085) ─────────────────────────────────────── */
/* One line, always: the field never grows (ADR-0038's « nothing wraps »);
   what does not fit is « +N ». The box takes its ring from what it holds. */
.ds-input-dropdown__trigger--multiple {
  position: relative;
  cursor: pointer;
}

.ds-input-dropdown__trigger--multiple:focus-within {
  border-color: var(--ds-border-brand);
  box-shadow: var(--ds-focus-ring-brand-shadow-xs);
}

.ds-input-dropdown__tags {
  display: flex;
  flex: 1;
  align-items: center;
  gap: var(--ds-spacing-xs);
  min-width: 0;
  overflow: hidden;
}

.ds-input-dropdown__more {
  flex: none;
  font: var(--ds-font-label-md);
  color: var(--ds-text-subtle);
  font-variant-numeric: tabular-nums;
}

/* Laid out for its widths, out of the flow and out of sight. */
.ds-input-dropdown__measure {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  gap: var(--ds-spacing-xs);
  visibility: hidden;
  pointer-events: none;
  white-space: nowrap;
}

.ds-input-dropdown__opener {
  display: flex;
  flex: none;
  align-items: center;
  padding: 0;
  border: 0;
  background: none;
  color: inherit;
  cursor: pointer;
  outline: none;
}

.ds-input-dropdown__opener:disabled {
  cursor: not-allowed;
}

.ds-input-dropdown__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--ds-spacing-md);
  padding: var(--ds-spacing-md) var(--ds-spacing-lg);
  border-top: var(--ds-border-width-default) solid var(--ds-border-subtle);
}

.ds-input-dropdown__count {
  font: var(--ds-font-body-sm);
  color: var(--ds-text-subtle);
}

/* ── Hint text ─────────────────────────────────────────────────────── */
</style>
