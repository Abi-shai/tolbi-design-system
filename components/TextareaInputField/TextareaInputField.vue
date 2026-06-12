<script setup lang="ts">
import { computed, useId } from 'vue'
import { Icon } from '../Icon'

export type TextareaType = 'default' | 'tags'

interface Props {
  modelValue?:  string
  type?:        TextareaType
  label?:       string
  placeholder?: string
  hint?:        string
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
  <div class="ds-textarea" :class="{ 'ds-textarea--disabled': disabled }">

    <!-- Label -->
    <label v-if="label" :for="inputId" class="ds-textarea__label">
      {{ label }}
      <span v-if="required" class="ds-textarea__required" aria-hidden="true">*</span>
    </label>

    <!-- Wrapper -->
    <div
      class="ds-textarea__wrapper"
      :class="{
        'ds-textarea__wrapper--destructive': destructive,
        'ds-textarea__wrapper--disabled':    disabled,
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
                <Icon name="x-close" :size="12" />
              </button>
            </span>
          </div>

          <!-- Tag input -->
          <textarea
            :id="inputId"
            class="ds-textarea__input ds-textarea__input--tags"
            :value="modelValue"
            :placeholder="!tags.length ? placeholder : undefined"
            :disabled="disabled"
            :required="required"
            :aria-invalid="destructive || undefined"
            :aria-describedby="hint ? `${inputId}-hint` : undefined"
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
        :disabled="disabled"
        :required="required"
        :aria-invalid="destructive || undefined"
        :aria-describedby="hint ? `${inputId}-hint` : undefined"
        @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
      />
    </div>

    <!-- Hint -->
    <p
      v-if="hint"
      :id="`${inputId}-hint`"
      class="ds-textarea__hint"
      :class="{ 'ds-textarea__hint--error': destructive }"
    >
      {{ hint }}
    </p>
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
.ds-textarea__label {
  margin: 0;
  display: block;
  font-family: var(--ds-typography-font-family-inter);
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.25rem;
  color: var(--ds-semantic-text-secondary);
  white-space: nowrap;
}

.ds-textarea__required {
  color: var(--ds-semantic-fg-error-primary);
  margin-left: 2px;
}

/* ── Wrapper ──────────────────────────────────────────────────────── */
.ds-textarea__wrapper {
  display: flex;
  flex: 1;
  min-height: 128px;
  width: 100%;
  box-sizing: border-box;
  background: var(--ds-semantic-bg-primary);
  border: 1px solid var(--ds-semantic-border-primary);
  border-radius: var(--ds-radius-md);
  box-shadow: var(--ds-shadow-xs);
  overflow: hidden;
  transition: border-color var(--ds-motion-duration-moderate) var(--ds-motion-easing-default), box-shadow var(--ds-motion-duration-moderate) var(--ds-motion-easing-default);
  /* Default : px-14px py-12px */
  padding: var(--ds-spacing-lg) 14px;
}

/* Focused */
.ds-textarea__wrapper:focus-within {
  border-color: var(--ds-semantic-border-brand);
  box-shadow: var(--ds-focus-ring-brand-shadow-xs);
}

/* Destructive */
.ds-textarea__wrapper--destructive {
  border-color: var(--ds-color-error-300, #fda29b);
}

.ds-textarea__wrapper--destructive:focus-within {
  border-color: var(--ds-color-error-300, #fda29b);
  box-shadow: var(--ds-focus-ring-error-shadow-xs);
}

/* Disabled */
.ds-textarea__wrapper--disabled {
  background: var(--ds-semantic-bg-primary-alt);
  border-color: var(--ds-semantic-border-primary);
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
  font-family: var(--ds-typography-font-family-poppins);
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.5rem;
  color: var(--ds-semantic-text-primary);
  box-sizing: border-box;
}

.ds-textarea__input::placeholder {
  color: var(--ds-semantic-text-placeholder);
}

.ds-textarea__input:disabled {
  color: var(--ds-semantic-text-placeholder);
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
  background: var(--ds-semantic-bg-primary);
  border: 1px solid var(--ds-semantic-border-primary);
  border-radius: var(--ds-radius-sm);
  flex-shrink: 0;
}

.ds-textarea__tag-label {
  font-family: var(--ds-typography-font-family-inter);
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.25rem;
  color: var(--ds-semantic-text-secondary);
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
  color: var(--ds-semantic-text-secondary);
  line-height: 0;
  transition: background var(--ds-motion-duration-quick) var(--ds-motion-easing-default);
}

.ds-textarea__tag-remove:hover {
  background: var(--ds-semantic-bg-primary-hover);
}

/* ── Hint ─────────────────────────────────────────────────────────── */
.ds-textarea__hint {
  margin: 0;
  font-family: var(--ds-typography-font-family-poppins);
  font-size: 0.875rem;
  font-weight: 400;
  line-height: 1.25rem;
  color: var(--ds-semantic-text-tertiary);
}

.ds-textarea__hint--error {
  color: var(--ds-semantic-fg-error-primary);
}
</style>
