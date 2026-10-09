<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Button } from '../Button'
import { FormField } from '../FormField'
import { Icon, type IconName } from '../Icon'
import { InputField } from '../InputField'
import Dialog from './Dialog.vue'

/**
 * Asking before an action that demands it (ADR-0075, ADR-0076): a `Dialog`
 * in the product's format, signed by its tone — the glyph of the action on
 * the tone's tint before the title — with one sentence, the way out and the
 * action, the action naming itself (« Supprimer le projet », not « OK »).
 * An `alertdialog`: it interrupts and waits for an answer.
 *
 * Three levels, by what the action takes with it:
 * 1. **Confirm** — the sentence alone.
 * 2. **Show what goes** — `consequences`, one line each with its glyph.
 * 3. **Type it** — `requireText`: the action stays off until the text is
 *    typed, for what is heavy and has no way back (a project).
 *
 * With `tone="danger"` the action is `Button danger` and the focus starts on
 * the way out, so a stray Enter cancels rather than destroys (WAI-ARIA's alert
 * dialog) — or on the field, at level 3, where Enter only acts once the text
 * is typed. With `tone="neutral"` — a confirmation that is not a deletion,
 * spending credits — the action is `primary` and has the focus.
 *
 * Only the action emits `confirm`. Cancelling — the button, the close, Escape,
 * the scrim — emits `cancel` and hands the focus back where it was.
 */
export interface ConfirmDialogConsequence {
  /** What it is, by its glyph: `map` for parcels, `chart-column` for analyses. */
  icon: IconName
  /** One line, with its number: « 24 parcelles et leurs contours ». */
  label: string
}

interface Props {
  title: string
  /** The sentence that says what will happen. */
  message: string
  /** The action, naming itself and what it acts on: « Supprimer le projet ». */
  confirmLabel?: string
  cancelLabel?: string
  /**
   * `danger` for what cannot be undone; `neutral` for a confirmation that is
   * not a deletion. `brand`, its 0.58 name, still means `neutral`.
   */
  tone?: 'danger' | 'neutral' | 'brand'
  /** The sign's glyph — what the action does. By default the tone's: `triangle-alert`, `info`. */
  icon?: IconName
  /** Level 2: what the action takes with it. */
  consequences?: ConfirmDialogConsequence[]
  /** Level 3: the text to type before the action wakes — a project's name. */
  requireText?: string
  /** The field's label at level 3; `{text}` becomes `requireText`. */
  requireTextLabel?: string
  /** Hand the focus back to what opened it — off when the confirmation removes that element. */
  restoreFocus?: boolean
  /** The close's name, in the head. */
  closeLabel?: string
  /** The region the question belongs to — `Dialog`'s `within`. */
  within?: HTMLElement | null
}

const props = withDefaults(defineProps<Props>(), {
  confirmLabel: 'Confirmer',
  cancelLabel: 'Annuler',
  tone: 'danger',
  icon: undefined,
  consequences: () => [],
  requireText: undefined,
  requireTextLabel: 'Pour confirmer, tapez « {text} »',
  restoreFocus: true,
  closeLabel: 'Fermer',
  within: null,
})

const open = defineModel<boolean>('open', { default: false })

const emit = defineEmits<{
  confirm: []
  cancel: []
  /** Gone: the exit is over and the focus handed back. */
  closed: []
}>()

const danger = computed(() => props.tone === 'danger')
const sign = computed<IconName>(() => props.icon ?? (danger.value ? 'triangle-alert' : 'info'))

/* Level 3: typed, trimmed, exactly — a near miss is not a yes. Each opening
   starts from an empty field. */
const typed = ref('')
const ready = computed(() => !props.requireText || typed.value.trim() === props.requireText.trim())
const fieldLabel = computed(() => props.requireTextLabel.replace('{text}', props.requireText ?? ''))

watch(open, (now) => now && (typed.value = ''))

function confirm() {
  if (!ready.value) return
  emit('confirm')
  open.value = false
}

function cancel() {
  emit('cancel')
  open.value = false
}
</script>

<template>
  <Dialog
    v-model:open="open"
    :title="title"
    :icon="sign"
    :tone="danger ? 'danger' : 'neutral'"
    role="alertdialog"
    :restore-focus="restoreFocus"
    :close-label="closeLabel"
    :within="within"
    @cancel="emit('cancel')"
    @closed="emit('closed')"
  >
    <p class="ds-confirm-dialog__message">{{ message }}</p>
    <ul v-if="consequences.length" class="ds-confirm-dialog__consequences">
      <li v-for="item in consequences" :key="item.label" class="ds-confirm-dialog__consequence">
        <Icon :name="item.icon" :size="16" class="ds-confirm-dialog__consequence-icon" aria-hidden="true" />
        <span>{{ item.label }}</span>
      </li>
    </ul>

    <template v-if="requireText" #form>
      <FormField :label="fieldLabel">
        <InputField
          v-model="typed"
          :placeholder="requireText"
          autocomplete="off"
          spellcheck="false"
          data-autofocus
          @keydown.enter.prevent="confirm"
        />
      </FormField>
    </template>

    <template #actions>
      <Button
        :label="cancelLabel"
        variant="secondary-gray"
        :data-autofocus="danger && !requireText ? '' : undefined"
        @click="cancel"
      />
      <Button
        :label="confirmLabel"
        :variant="danger ? 'danger' : 'primary'"
        :disabled="!ready"
        :data-autofocus="danger ? undefined : ''"
        @click="confirm"
      />
    </template>
  </Dialog>
</template>

<style scoped>
.ds-confirm-dialog__message {
  margin: 0;
}

/*
  Level 2 — what goes, on the neutral ground, a glyph per line in the receding
  ink and the words in the text's own: the list is information, not the alarm,
  which the sign already gave (ADR-0076).
*/
.ds-confirm-dialog__consequences {
  display: flex;
  flex-direction: column;
  gap: var(--ds-spacing-md);
  margin: var(--ds-spacing-xl) 0 0;
  padding: var(--ds-spacing-lg) var(--ds-spacing-xl);
  list-style: none;
  border-radius: var(--ds-radius-inner);
  background: var(--ds-bg-neutral-subtle);
  font: var(--ds-font-body-md);
  color: var(--ds-text-default);
}

.ds-confirm-dialog__consequence {
  display: flex;
  align-items: center;
  gap: var(--ds-spacing-md);
}

.ds-confirm-dialog__consequence-icon {
  flex: none;
  color: var(--ds-text-subtle);
}
</style>
