<script setup lang="ts">
import { ref, computed } from 'vue'
import { Icon, type IconName } from '../Icon'
import { ProgressBar } from '../ProgressBar'
import { CloseButton } from '../CloseButton'
import { useFormField } from '../FormField/context'

export interface DropzoneFile {
  id: string
  name: string
  /** Bytes. Formatted for display by the component. */
  size?: number
  /** 0–100. Omit for a file already stored. */
  progress?: number
  error?: string
}

interface Props {
  /** Mirrors the native accept attribute — `.csv,image/*`. */
  accept?: string
  multiple?: boolean
  disabled?: boolean
  /**
   * Secondary copy inside the drop area, under the call to action — formats,
   * size ceiling. Not a field description: that is FormField's `hint`.
   */
  supportingText?: string
  icon?: IconName
  files?: DropzoneFile[]
}

const props = withDefaults(defineProps<Props>(), {
  multiple: false,
  disabled: false,
  icon: 'cloud-upload',
  files: () => [],
})

const field = useFormField()

const inputId     = computed(() => field?.id.value)
const isDisabled  = computed(() => (field?.disabled.value ?? false) || props.disabled)
const describedBy = computed(() => field?.describedBy.value)

const emit = defineEmits<{
  select: [files: File[]]
  remove: [id: string]
}>()

const inputEl = ref<HTMLInputElement | null>(null)
const dragging = ref(false)

function take(list: FileList | null) {
  if (!list || isDisabled.value) return
  emit('select', Array.from(list))
}

function onDrop(event: DragEvent) {
  dragging.value = false
  take(event.dataTransfer?.files ?? null)
}

/*
 * dragenter/over both fire continuously over child nodes; tracking a boolean on
 * enter/leave of the root alone flickers. Guarding on `relatedTarget` leaving
 * the root is what keeps the highlight steady.
 */
function onLeave(event: DragEvent) {
  const root = event.currentTarget as HTMLElement
  if (!root.contains(event.relatedTarget as Node)) dragging.value = false
}

function formatSize(bytes?: number) {
  if (bytes === undefined) return ''
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
}
</script>

<template>
  <div class="ds-dropzone">
    <div
      class="ds-dropzone__area"
      :class="{
        'ds-dropzone__area--dragging': dragging,
        'ds-dropzone__area--disabled': isDisabled,
      }"
      @dragover.prevent="dragging = !isDisabled"
      @dragleave.prevent="onLeave"
      @drop.prevent="onDrop"
    >
      <!--
        A label wrapping a visually hidden input, not a div with a click
        handler: this is what makes the zone focusable and operable by keyboard
        for free.
      -->
      <label class="ds-dropzone__label">
        <input
          ref="inputEl"
          :id="inputId"
          type="file"
          class="ds-dropzone__input"
          :accept="accept"
          :multiple="multiple"
          :disabled="isDisabled"
          :aria-describedby="describedBy"
          :aria-invalid="field?.invalid.value || undefined"
          @change="take(($event.target as HTMLInputElement).files)"
        />

        <span class="ds-dropzone__icon">
          <Icon :name="icon" :size="20" />
        </span>

        <span class="ds-dropzone__text">
          <span class="ds-dropzone__cta">
            Cliquer pour téléverser
            <span class="ds-dropzone__cta-muted">ou glisser-déposer</span>
          </span>
          <span v-if="supportingText" class="ds-dropzone__supporting">{{ supportingText }}</span>
        </span>
      </label>
    </div>

    <ul v-if="files.length" class="ds-dropzone__files">
      <li
        v-for="file in files"
        :key="file.id"
        class="ds-dropzone__file"
        :class="{ 'ds-dropzone__file--error': file.error }"
      >
        <span class="ds-dropzone__file-icon">
          <Icon :name="file.error ? 'circle-alert' : 'file'" :size="20" />
        </span>

        <span class="ds-dropzone__file-body">
          <span class="ds-dropzone__file-name">{{ file.name }}</span>
          <span v-if="file.error" class="ds-dropzone__file-error">{{ file.error }}</span>
          <span v-else-if="file.size !== undefined" class="ds-dropzone__file-meta">
            {{ formatSize(file.size) }}
          </span>
          <ProgressBar
            v-if="file.progress !== undefined && !file.error"
            :value="file.progress"
            label="right"
            class="ds-dropzone__file-progress"
          />
        </span>

        <CloseButton
          size="sm"
          :aria-label="`Retirer ${file.name}`"
          @click="emit('remove', file.id)"
        />
      </li>
    </ul>
  </div>
</template>

<style scoped>
.ds-dropzone {
  display: flex;
  flex-direction: column;
  gap: var(--ds-spacing-lg);
  font-family: var(--ds-typography-font-family-poppins);
}

.ds-dropzone__area {
  border: var(--ds-border-width-default) solid var(--ds-border-subtle);
  border-radius: var(--ds-radius-surface);
  background-color: var(--ds-bg-default);
  transition:
    border-color var(--ds-motion-duration-moderate) var(--ds-motion-easing-default),
    background-color var(--ds-motion-duration-moderate) var(--ds-motion-easing-default);
}

.ds-dropzone__area--dragging {
  border-color: var(--ds-border-brand-solid);
  background-color: var(--ds-bg-brand-subtle);
}

.ds-dropzone__area--disabled {
  background-color: var(--ds-bg-disabled);
  border-color: var(--ds-border-disabled);
}

.ds-dropzone__label {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--ds-spacing-lg);
  padding: var(--ds-spacing-3xl) var(--ds-spacing-xl);
  cursor: pointer;
  text-align: center;
}

.ds-dropzone__area--disabled .ds-dropzone__label { cursor: not-allowed; }

/* Visually hidden, still focusable — never display:none. */
.ds-dropzone__input {
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

/* On the bordered area rather than the inner label, so the ring frames the box. */
.ds-dropzone__area:focus-within {
  outline: none;
  border-color: var(--ds-border-brand-solid);
  box-shadow: var(--ds-focus-ring-brand);
}

.ds-dropzone__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--ds-radius-pill);
  background-color: var(--ds-bg-neutral-subtle);
  color: var(--ds-text-subtlest);
}

.ds-dropzone__text { display: flex; flex-direction: column; gap: var(--ds-spacing-xxs); }

.ds-dropzone__cta {
  font: var(--ds-font-label-lg);
  color: var(--ds-text-brand);
}

.ds-dropzone__cta-muted {
  font-weight: var(--ds-font-weight-body-md);
  color: var(--ds-text-subtle);
}

.ds-dropzone__supporting {
  font: var(--ds-font-body-sm);
  color: var(--ds-text-subtle);
}

/* ── File list ────────────────────────────────────────────────────── */
.ds-dropzone__files {
  display: flex;
  flex-direction: column;
  gap: var(--ds-spacing-md);
  margin: 0;
  padding: 0;
  list-style: none;
}

.ds-dropzone__file {
  display: flex;
  align-items: flex-start;
  gap: var(--ds-spacing-lg);
  padding: var(--ds-spacing-lg);
  border: var(--ds-border-width-default) solid var(--ds-border-subtle);
  border-radius: var(--ds-radius-surface-sm);
  background-color: var(--ds-bg-default);
}

.ds-dropzone__file--error { border-color: var(--ds-border-error); }

.ds-dropzone__file-icon { display: flex; flex-shrink: 0; color: var(--ds-text-subtlest); }
.ds-dropzone__file--error .ds-dropzone__file-icon { color: var(--ds-text-error); }

.ds-dropzone__file-body {
  display: flex;
  flex-direction: column;
  gap: var(--ds-spacing-xxs);
  flex: 1 1 auto;
  min-width: 0;
}

.ds-dropzone__file-name {
  font: var(--ds-font-body-md-emphasis);
  color: var(--ds-text-strong);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ds-dropzone__file-meta,
.ds-dropzone__file-error {
  font: var(--ds-font-body-sm);
}

.ds-dropzone__file-meta  { color: var(--ds-text-subtle); }
.ds-dropzone__file-error { color: var(--ds-text-error); }

.ds-dropzone__file-progress { margin-top: var(--ds-spacing-xs); }
</style>
