import { inject, type ComputedRef, type InjectionKey } from 'vue'

/**
 * What a FormField hands down to the control it wraps.
 *
 * Every value is a ComputedRef so the control stays reactive to the wrapper.
 * A control reads this through `useFormField()`, which returns `null` when the
 * control is used on its own — outside any FormField — so nothing here is a
 * dependency, only an override.
 */
export interface FormFieldContext {
  /** Id the control must put on its focusable element, so the wrapper's `for` resolves. */
  id:          ComputedRef<string>
  /** Id of the wrapper's message element, or undefined when there is no message. */
  describedBy: ComputedRef<string | undefined>
  /** The wrapper carries an error message. */
  invalid:     ComputedRef<boolean>
  required:    ComputedRef<boolean>
  disabled:    ComputedRef<boolean>
}

export const FORM_FIELD_KEY: InjectionKey<FormFieldContext> = Symbol('ds-form-field')

/** Returns the enclosing FormField's context, or null when there is none. */
export function useFormField(): FormFieldContext | null {
  return inject(FORM_FIELD_KEY, null)
}
