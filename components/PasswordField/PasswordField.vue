<script setup lang="ts">
import { computed, ref } from 'vue'
import { InputField, type InputFieldSize } from '../InputField'
import { Icon } from '../Icon'

export interface PasswordRule {
  label: string
  met: boolean
}

interface Props {
  modelValue?: string
  placeholder?: string
  size?: InputFieldSize
  /** Checklist shown under the field. Pass the evaluated state, not the regexes. */
  rules?: PasswordRule[]
  destructive?: boolean
  disabled?: boolean
  required?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  size: 'md',
  rules: () => [],
  destructive: false,
  disabled: false,
  required: false,
})

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const revealed = ref(false)

const inputType = computed(() => (revealed.value ? 'text' : 'password'))
const toggleLabel = computed(() =>
  revealed.value ? 'Masquer le mot de passe' : 'Afficher le mot de passe',
)
</script>

<template>
  <div class="ds-password-field">
    <InputField
      :model-value="modelValue"
      :type="inputType"
      :placeholder="placeholder"
      :size="size"
      :destructive="destructive"
      :disabled="disabled"
      :required="required"
      @update:model-value="emit('update:modelValue', $event)"
    >
      <template #trailing>
        <!--
          A real button, not an icon with a click handler: it must be reachable
          by keyboard and announce its state.
        -->
        <button
          type="button"
          class="ds-password-field__toggle"
          :aria-label="toggleLabel"
          :aria-pressed="revealed"
          :disabled="disabled"
          @click="revealed = !revealed"
        >
          <Icon :name="revealed ? 'eye-off' : 'eye'" :size="20" />
        </button>
      </template>
    </InputField>

    <ul v-if="rules.length" class="ds-password-field__rules">
      <li
        v-for="rule in rules"
        :key="rule.label"
        class="ds-password-field__rule"
        :class="{ 'ds-password-field__rule--met': rule.met }"
      >
        <Icon :name="rule.met ? 'circle-check' : 'circle'" :size="16" />
        <span>{{ rule.label }}</span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.ds-password-field {
  display: flex;
  flex-direction: column;
  gap: var(--ds-spacing-lg);
  font-family: var(--ds-typography-font-family-poppins);
}

.ds-password-field__toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  background: none;
  cursor: pointer;
  color: var(--ds-text-subtlest);
  border-radius: var(--ds-radius-xs);
}

.ds-password-field__toggle:hover:not(:disabled) { color: var(--ds-text-default); }
.ds-password-field__toggle:disabled { cursor: not-allowed; opacity: 0.5; }
.ds-password-field__toggle:focus-visible {
  outline: none;
  box-shadow: var(--ds-focus-ring-brand);
}

.ds-password-field__rules {
  display: flex;
  flex-direction: column;
  gap: var(--ds-spacing-xs);
  margin: 0;
  padding: 0;
  list-style: none;
}

.ds-password-field__rule {
  display: flex;
  align-items: center;
  gap: var(--ds-spacing-md);
  font: var(--ds-font-body-sm);
  color: var(--ds-text-subtle);
}

/* Colour AND glyph change together, so the state is not colour-only. */
.ds-password-field__rule--met { color: var(--ds-text-success); }
</style>
