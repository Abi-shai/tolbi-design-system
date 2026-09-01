<script setup lang="ts">
import { computed, useId } from 'vue'
import { Icon } from '../Icon'
import { useFormField } from '../FormField/context'

export type TextareaType = 'default' | 'tags'

interface Props {
  modelValue?:  string
  type?:        TextareaType
  placeholder?: string
  tags?:        string[]
  destructive?: boolean
  disabled?:    boolean
  required?:    boolean
  id?:          string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue:  '',
  type:        'default',
  tags:        () => [],
  destructive: false,
  disabled:    false,
  required:    false,
})

const field = useFormField()

const isInvalid   = computed(() => field?.invalid.value ?? props.destructive)
const isRequired  = computed(() => field?.required.value ?? props.required)
const isDisabled  = computed(() => (field?.disabled.value ?? false) || props.disabled)
const describedBy = computed(() => field?.describedBy.value)

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'add-tag':          [tag: string]
  'remove-tag':       [index: number]
}>()

const uid     = useId()
const inputId = computed(() => props.id ?? `textarea-${uid}`)

function onKeydown(e: KeyboardEvent) {
  if (props.type !== 'tags') return
  if ((e.key === 'Enter' || e.key === ',') && props.modelValue.trim()) {
    e.preventDefault()
    emit('add-tag', props.modelValue.trim())
    emit('update:modelValue', '')
  }
  if (e.key === 'Backspace' && !props.modelValue && props.tags.length) {
    emit('remove-tag', props.tags.length - 1)
  }
}
</script>

<template>
  <div class="ds-textarea" :class="{ 'ds-textarea--disabled': isDisabled }">

    <!-- Wrapper -->
    <div
      class="ds-textarea__wrapper"
      :class="{
        'ds-textarea__wrapper--destructive': isInvalid,
        'ds-textarea__wrapper--disabled':    isDisabled,
        'ds-textarea__wrapper--tags':        type === 'tags',
      }"
    >
      <!-- Tags mode : chips + input inline -->
      <template v-if="type === 'tags'">
        <div class="ds-textarea__tags-content">
          <!-- Existing tags -->
          <div v-if="tags.length" class="ds-textarea__tags-row">
            <span
              v-for="(tag, i) in tags"
              :key="i"
              class="ds-textarea__tag"
            >
              <span class="ds-textarea__tag-label">{{ tag }}</span>
              <button
                type="button"
                class="ds-textarea__tag-remove"
                :aria-label="`Retirer ${tag}`"
                @click="emit('remove-tag', i)"
              >
                <Icon name="x" :size="12" />
              </button>
            </span>
          </div>

          <!-- Tag input -->
          <textarea
            :id="inputId"
            class="ds-textarea__input ds-textarea__input--tags"
            :value="modelValue"
            :placeholder="!tags.length ? placeholder : undefined"
            :disabled="isDisabled"
            :required="isRequired"
            :aria-invalid="isInvalid || undefined"
            :aria-describedby="describedBy"
            rows="1"
            @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
            @keydown="onKeydown"
          />
        </div>
      </template>

      <!-- Default mode : textarea simple -->
      <textarea
        v-else
        :id="inputId"
        class="ds-textarea__input"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="isDisabled"
        :required="isRequired"
        :aria-invalid="isInvalid || undefined"
        :aria-describedby="describedBy"
        @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
      />
    </div>

  </div>
</template>

<style scoped>
/* ── Shell ────────────────────────────────────────────────────────── */
.ds-textarea {
  display: flex;
  flex-direction: column;
  gap: var(--ds-spacing-sm);
  width: 100%;
}

/* ── Label ────────────────────────────────────────────────────────── */
/* ── Wrapper ──────────────────────────────────────────────────────── */
.ds-textarea__wrapper {
  display: flex;
  flex: 1;
  min-height: 128px;
  width: 100%;
  box-sizing: border-box;
  background: var(--ds-bg-default);
  border: 1px solid var(--ds-border-default);
  border-radius: var(--ds-radius-control);
  box-shadow: var(--ds-elevation-control);
  overflow: hidden;
  transition: border-color var(--ds-motion-duration-moderate) var(--ds-motion-easing-default), box-shadow var(--ds-motion-duration-moderate) var(--ds-motion-easing-default);
  /* Default : px-14px py-12px */
  padding: var(--ds-spacing-lg) 14px;
}

/* Focused */
.ds-textarea__wrapper:focus-within {
  border-color: var(--ds-border-brand);
  box-shadow: var(--ds-focus-ring-brand-shadow-xs);
}

/* Destructive */
.ds-textarea__wrapper--destructive {
  border-color: var(--ds-border-error);
}

.ds-textarea__wrapper--destructive:focus-within {
  border-color: var(--ds-border-error);
  box-shadow: var(--ds-focus-ring-error-shadow-xs);
}

/* Disabled */
.ds-textarea__wrapper--disabled {
  background: var(--ds-bg-default);
  border-color: var(--ds-border-default);
  box-shadow: none;
  cursor: not-allowed;
}

/* Tags : padding uniforme 12px */
.ds-textarea__wrapper--tags {
  padding: var(--ds-spacing-lg);
  flex-direction: column;
}

/* ── Textarea native ──────────────────────────────────────────────── */
.ds-textarea__input {
  flex: 1;
  width: 100%;
  min-width: 0;
  min-height: 0;
  padding: 0;
  margin: 0;
  border: none;
  outline: none;
  resize: none;
  appearance: none;
  background: transparent;
  font: var(--ds-font-body-lg);
  color: var(--ds-text-strong);
  box-sizing: border-box;
}

.ds-textarea__input::placeholder {
  color: var(--ds-text-placeholder);
}

.ds-textarea__input:disabled {
  color: var(--ds-text-disabled);
  cursor: not-allowed;
}

/* Tags input : s'adapte au contenu */
.ds-textarea__input--tags {
  flex: 1 0 80px;
  min-width: 80px;
  height: auto;
  overflow: hidden;
}

/* ── Tags content ─────────────────────────────────────────────────── */
.ds-textarea__tags-content {
  display: flex;
  flex-direction: column;
  gap: var(--ds-spacing-md);
  width: 100%;
}

.ds-textarea__tags-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ds-spacing-md);
  align-items: center;
}

/* ── Tag chip ─────────────────────────────────────────────────────── */
.ds-textarea__tag {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: var(--ds-spacing-xxs) var(--ds-spacing-xs) var(--ds-spacing-xxs) 9px;
  background: var(--ds-bg-default);
  border: 1px solid var(--ds-border-default);
  border-radius: var(--ds-radius-inner);
  flex-shrink: 0;
}

.ds-textarea__tag-label {  font: var(--ds-font-label-lg);
  color: var(--ds-text-default);
  white-space: nowrap;
}

.ds-textarea__tag-remove {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--ds-spacing-xxs);
  border: none;
  background: transparent;
  border-radius: 3px;
  cursor: pointer;
  color: var(--ds-text-default);
  line-height: 0;
  transition: background var(--ds-motion-duration-quick) var(--ds-motion-easing-default);
}

.ds-textarea__tag-remove:hover {
  background: var(--ds-bg-hover);
}

/* ── Hint ─────────────────────────────────────────────────────────── */
</style>
