<script setup lang="ts">
import { computed } from 'vue'
import { InputField, type InputFieldSize } from '../InputField'
import { dialCodes } from './dialCodes'

export interface DialCode {
  /** ISO country code, used as the option value — `SN`, `CI`, `FR`. */
  value: string
  /** Displayed prefix — `+221`. */
  dial: string
  label: string
}

interface Props {
  /** The national number, without the prefix. */
  modelValue?: string
  /** Selected country, by ISO code. */
  country?: string
  /**
   * Defaults to the full reference set the design system ships (245 entries).
   * Pass a subset — `dialCodesFor(['SN', 'CI', 'ML'])` — when a form should only
   * offer some: which countries a product serves is not the design system's call.
   */
  countries?: readonly DialCode[]
  /**
   * ISO codes surfaced in a first group, for when the full list is too long to
   * scan. The rest follow in a second group.
   */
  priority?: readonly string[]
  placeholder?: string
  size?: InputFieldSize
  destructive?: boolean
  disabled?: boolean
  required?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  countries: () => dialCodes,
  size: 'md',
  destructive: false,
  disabled: false,
  required: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'update:country': [value: string]
}>()

const selected = computed(
  () => props.countries.find(c => c.value === props.country) ?? props.countries[0],
)

/*
 * With the full 245-entry set, a flat list is a long scroll. `priority` splits
 * it into two <optgroup>s; without it the list stays flat, so nothing changes
 * for a caller passing their own short list.
 */
const grouped = computed(() => {
  const keys = props.priority
  if (!keys?.length) return null
  const top = keys
    .map(iso => props.countries.find(c => c.value === iso))
    .filter((c): c is DialCode => Boolean(c))
  const topSet = new Set(top.map(c => c.value))
  return { top, rest: props.countries.filter(c => !topSet.has(c.value)) }
})
</script>

<template>
  <div class="ds-phone-field">
    <InputField
      :model-value="modelValue"
      type="tel"
      :placeholder="placeholder"
      :size="size"
      :destructive="destructive"
      :disabled="disabled"
      :required="required"
      @update:model-value="emit('update:modelValue', $event)"
    >
      <!--
        The prefix is a native select welded into the leading slot rather than an
        InputDropdown: it has to sit inside the same bordered box as the number,
        and a popover cannot. It stays a real form control, so keyboard and
        mobile pickers work as they should.
      -->
      <template #leading-text>
        <span class="ds-phone-field__dial">
          <select
            class="ds-phone-field__select"
            :value="selected?.value"
            :disabled="disabled"
            aria-label="Indicatif pays"
            @change="emit('update:country', ($event.target as HTMLSelectElement).value)"
          >
            <template v-if="grouped">
              <optgroup label="Fréquents">
                <option v-for="c in grouped.top" :key="c.value" :value="c.value">
                  {{ c.dial }} · {{ c.label }}
                </option>
              </optgroup>
              <optgroup label="Tous les pays">
                <option v-for="c in grouped.rest" :key="c.value" :value="c.value">
                  {{ c.dial }} · {{ c.label }}
                </option>
              </optgroup>
            </template>

            <template v-else>
              <option v-for="c in countries" :key="c.value" :value="c.value">
                {{ c.dial }} · {{ c.label }}
              </option>
            </template>
          </select>
          <span class="ds-phone-field__dial-text" aria-hidden="true">{{ selected?.dial }}</span>
        </span>
      </template>
    </InputField>
  </div>
</template>

<style scoped>
.ds-phone-field { font-family: var(--ds-typography-font-family-poppins); }

.ds-phone-field__dial {
  position: relative;
  display: inline-flex;
  align-items: center;
}

/* The native select covers the visible prefix and stays operable. */
.ds-phone-field__select {
  position: absolute;
  inset: 0;
  width: 100%;
  opacity: 0;
  cursor: pointer;
  font: inherit;
}

.ds-phone-field__select:disabled { cursor: not-allowed; }

.ds-phone-field__dial-text {
  font-size: var(--ds-font-size-body-md);
  line-height: var(--ds-line-height-body-md);
  color: var(--ds-text-subtle);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.ds-phone-field__dial:focus-within .ds-phone-field__dial-text {
  color: var(--ds-text-strong);
  text-decoration: underline;
  text-underline-offset: 3px;
}
</style>
