<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { Icon } from '../Icon'
import { Scrollbar } from '../Scrollbar'
import { Avatar } from '../Avatar'
import type { IconName } from '../Icon'
import DropdownSelectItem from './DropdownSelectItem.vue'
import type { DropdownSelectItemType } from './DropdownSelectItem.vue'

export type InputDropdownType = 'default' | 'icon-leading' | 'avatar-leading' | 'dot-leading' | 'search'

export interface InputDropdownOption {
  value: string
  label: string
  supportingText?: string
  icon?: IconName
  avatarSrc?: string
  avatarAlt?: string
  dotColor?: string
  disabled?: boolean
}

interface Props {
  type?: InputDropdownType
  label?: string
  placeholder?: string
  hintText?: string
  options: InputDropdownOption[]
  modelValue?: string | null
  leadingIcon?: IconName
}

const props = withDefaults(defineProps<Props>(), {
  type: 'default',
  placeholder: 'Select...',
})

const emit = defineEmits<{
  'update:modelValue': [value: string | null]
}>()

const open = ref(false)
const searchQuery = ref('')
const rootEl = ref<HTMLElement | null>(null)
const searchInputEl = ref<HTMLInputElement | null>(null)

const selectedOption = computed(() =>
  props.modelValue
    ? props.options.find(o => o.value === props.modelValue) ?? null
    : null,
)

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
    default:               return 'default'
  }
})

async function openPanel() {
  if (open.value) return
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
  if (open.value) close()
  else openPanel()
}

function selectOption(option: InputDropdownOption) {
  if (option.disabled) return
  emit('update:modelValue', option.value)
  close()
}

function onClickOutside(e: MouseEvent) {
  if (rootEl.value && !rootEl.value.contains(e.target as Node)) close()
}

function onKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape' && open.value) close()
}

onMounted(() => {
  document.addEventListener('click', onClickOutside, true)
  document.addEventListener('keydown', onKeyDown)
})

onUnmounted(() => {
  document.removeEventListener('click', onClickOutside, true)
  document.removeEventListener('keydown', onKeyDown)
})
</script>

<template>
  <div class="ds-input-dropdown" ref="rootEl">
    <!-- Label + field group -->
    <div class="ds-input-dropdown__field-group">
      <span v-if="label" class="ds-input-dropdown__label">{{ label }}</span>

      <div class="ds-input-dropdown__input-wrap">
        <!-- ── Search type ──────────────────────────────────────────── -->
        <div
          v-if="type === 'search'"
          class="ds-input-dropdown__trigger"
          :class="{ 'ds-input-dropdown__trigger--open': open }"
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

        <!-- ── All other types ─────────────────────────────────────── -->
        <button
          v-else
          type="button"
          class="ds-input-dropdown__trigger"
          :class="{ 'ds-input-dropdown__trigger--open': open }"
          :aria-expanded="open"
          aria-haspopup="listbox"
          @click="toggle"
        >
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
            <span
              v-else-if="type === 'dot-leading'"
              class="ds-input-dropdown__leading-dot"
              :style="selectedOption?.dotColor ? { backgroundColor: selectedOption.dotColor } : undefined"
              aria-hidden="true"
            />

            <span
              class="ds-input-dropdown__value"
              :class="{ 'ds-input-dropdown__value--placeholder': !selectedOption }"
            >{{ selectedOption?.label || placeholder }}</span>
            <span v-if="selectedOption?.supportingText" class="ds-input-dropdown__supporting">
              {{ selectedOption.supportingText }}
            </span>
          </div>

          <Icon
            :name="open ? 'chevron-up' : 'chevron-down'"
            :size="20"
            class="ds-input-dropdown__chevron"
            aria-hidden="true"
          />
        </button>

        <!-- ── Dropdown panel ──────────────────────────────────────── -->
        <div v-if="open" class="ds-input-dropdown__panel" role="listbox">
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
                :selected="option.value === modelValue"
                :disabled="option.disabled"
                @click="selectOption(option)"
              />
            </div>
          </Scrollbar>
        </div>
      </div>
    </div>

    <!-- Hint text -->
    <p v-if="hintText && !open" class="ds-input-dropdown__hint">{{ hintText }}</p>
  </div>
</template>

<style scoped>
/* ── Root ──────────────────────────────────────────────────────────── */
.ds-input-dropdown {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

/* ── Field group: label + input ────────────────────────────────────── */
.ds-input-dropdown__field-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

/* ── Label ─────────────────────────────────────────────────────────── */
.ds-input-dropdown__label {
  font-family: var(--ds-typography-font-family-poppins);
  font-weight: 500;
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: var(--ds-semantic-text-secondary);
}

/* ── Input wrap (relative anchor for the panel) ────────────────────── */
.ds-input-dropdown__input-wrap {
  position: relative;
  width: 100%;
}

/* ── Trigger field ─────────────────────────────────────────────────── */
.ds-input-dropdown__trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 10px 14px;
  box-sizing: border-box;
  background-color: var(--ds-semantic-bg-primary);
  border: 1px solid var(--ds-semantic-border-primary);
  border-radius: var(--ds-radius-md);
  box-shadow: var(--ds-shadow-xs);
  cursor: pointer;
  text-align: left;
  font: inherit;
  color: inherit;
  transition: border-color var(--ds-motion-duration-moderate) var(--ds-motion-easing-default), box-shadow var(--ds-motion-duration-moderate) var(--ds-motion-easing-default);
}

.ds-input-dropdown__trigger--open,
.ds-input-dropdown__trigger:focus-visible {
  outline: none;
  border-color: var(--ds-semantic-border-brand);
  box-shadow: var(--ds-focus-ring-brand-shadow-xs);
}

/* ── Content row ───────────────────────────────────────────────────── */
.ds-input-dropdown__content {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

/* ── Value text ────────────────────────────────────────────────────── */
.ds-input-dropdown__value {
  font-family: var(--ds-typography-font-family-poppins);
  font-weight: 500;
  font-size: 1rem;
  line-height: 1.5rem;
  color: var(--ds-semantic-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-shrink: 0;
}

.ds-input-dropdown__value--placeholder {
  font-family: var(--ds-typography-font-family-poppins);
  font-weight: 400;
  color: var(--ds-semantic-text-placeholder);
}

/* ── Supporting text ───────────────────────────────────────────────── */
.ds-input-dropdown__supporting {
  font-family: var(--ds-typography-font-family-poppins);
  font-weight: 400;
  font-size: 1rem;
  line-height: 1.5rem;
  color: var(--ds-semantic-text-tertiary);
  white-space: nowrap;
  flex-shrink: 0;
}

/* ── Chevron ───────────────────────────────────────────────────────── */
.ds-input-dropdown__chevron {
  color: var(--ds-semantic-fg-secondary);
  flex-shrink: 0;
}

/* ── Leading icon ──────────────────────────────────────────────────── */
.ds-input-dropdown__leading-icon {
  color: var(--ds-semantic-fg-secondary);
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
  border-radius: var(--ds-radius-full);
  background-color: var(--ds-semantic-fg-success-primary);
  flex-shrink: 0;
}

/* ── Search icon ───────────────────────────────────────────────────── */
.ds-input-dropdown__search-icon {
  color: var(--ds-semantic-fg-secondary);
  flex-shrink: 0;
}

/* ── Search input ──────────────────────────────────────────────────── */
.ds-input-dropdown__search-input {
  flex: 1;
  min-width: 0;
  background: transparent;
  border: none;
  outline: none;
  font-family: var(--ds-typography-font-family-poppins);
  font-weight: 500;
  font-size: 1rem;
  line-height: 1.5rem;
  color: var(--ds-semantic-text-primary);
  padding: 0;
}

.ds-input-dropdown__search-input::placeholder {
  font-family: var(--ds-typography-font-family-poppins);
  font-weight: 400;
  color: var(--ds-semantic-text-placeholder);
}

/* ── Dropdown panel ────────────────────────────────────────────────── */
.ds-input-dropdown__panel {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  z-index: 100;
  background-color: var(--ds-semantic-bg-primary);
  border: 1px solid var(--ds-semantic-border-secondary);
  border-radius: var(--ds-radius-md);
  box-shadow: var(--ds-shadow-lg);
  overflow: hidden;
}

/* ── Panel items list ──────────────────────────────────────────────── */
/* Scroll is delegated to <Scrollbar> (ADR-0001) — its thumb overlays the list
 * instead of reserving a gutter, so the options keep the panel's full width. */
.ds-input-dropdown__panel-items {
  display: flex;
  flex-direction: column;
  padding: 4px 0;
}

/* ── Hint text ─────────────────────────────────────────────────────── */
.ds-input-dropdown__hint {
  font-family: var(--ds-typography-font-family-poppins);
  font-weight: 400;
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: var(--ds-semantic-text-tertiary);
  margin: 0;
}
</style>
