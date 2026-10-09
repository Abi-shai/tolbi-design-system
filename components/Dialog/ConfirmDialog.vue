<script setup lang="ts">
import { Button } from '../Button'
import Dialog from './Dialog.vue'

/**
 * Asking before something that cannot be taken back (ADR-0075): a `Dialog`
 * with a title, one sentence, the action and the way out. An `alertdialog` —
 * it interrupts and waits for an answer. With `tone="danger"` the focus
 * starts on the way out, so a stray Enter cancels rather than destroys
 * (WAI-ARIA's alert dialog); otherwise on the action.
 *
 * Only the confirmation emits `confirm`. Cancelling — the button, the close,
 * Escape, the scrim — emits `cancel` and hands the focus back where it was.
 */
interface Props {
  title: string
  /** The sentence that says what will happen. */
  message: string
  confirmLabel?: string
  cancelLabel?: string
  /** `danger` for what cannot be undone. */
  tone?: 'danger' | 'brand'
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

function confirm() {
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
    :description="message"
    role="alertdialog"
    :restore-focus="restoreFocus"
    :close-label="closeLabel"
    :within="within"
    @cancel="emit('cancel')"
    @closed="emit('closed')"
  >
    <template #actions>
      <Button
        :label="cancelLabel"
        variant="secondary-gray"
        :data-autofocus="props.tone === 'danger' ? '' : undefined"
        @click="cancel"
      />
      <Button
        :label="confirmLabel"
        :variant="props.tone === 'danger' ? 'danger' : 'primary'"
        :data-autofocus="props.tone === 'danger' ? undefined : ''"
        @click="confirm"
      />
    </template>
  </Dialog>
</template>
