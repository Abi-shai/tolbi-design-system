<script setup lang="ts">
import { computed, inject } from 'vue'
import { DROPDOWN_SIZE_KEY } from './context'
import { Avatar } from '../Avatar'
import { Checkbox } from '../Checkbox'
import { Icon } from '../Icon'
import type { IconName } from '../Icon'

interface Props {
  label:      string
  icon?:      IconName
  /**
   * An avatar in the leading column, in place of `icon` — for a row that names
   * something with a mark of its own (a workspace, a person). `avatarInitials`
   * is what `Avatar` shows when there is no picture. Its **presence** decides
   * the leading element, as `reminder` decides `CreditsChip`'s form (ADR-0028):
   * no `type` prop to keep in step with the content.
   */
  avatarSrc?:      string
  avatarInitials?: string
  shortcut?:  string
  /**
   * What the row carries beside its name — a time, a count — in a shortcut's
   * place and ink. A row has one or the other (ADR-0069).
   */
  meta?:      string
  /**
   * Unavailable. **Still reachable** — in the tab order, read as unavailable
   * (`aria-disabled`, ADR-0119, the APG menu rule) — and it does nothing when
   * pressed. Nothing is written to say why: the greyed row is the statement.
   */
  disabled?:  boolean
  /**
   * The row is one of a set of choices. **Absent, it is an action**
   * (`menuitem`); present, it is a choice (`menuitemradio` + `aria-checked`),
   * and `true` is the current one — marked the way every list in the catalogue
   * marks its current item (ADR-0050).
   *
   * No `false` default, on purpose: absent and `false` are different rows, and
   * Vue would otherwise cast an absent boolean to `false`.
   */
  selected?:  boolean
  /**
   * The row is one of several things that can each be on — the columns a table
   * shows (ADR-0080). **Absent, it is not a checkbox row**; present, it is a
   * `menuitemcheckbox` with its box in the leading column, `true` ticked. A
   * click toggles it and the menu stays open: `Dropdown` never closes on a row,
   * so ticking three columns is three clicks, not three openings.
   */
  checked?:   boolean
  /**
   * `menuitem` in a menu. `button` in a `Dropdown role="dialog"`, where a row
   * may carry actions of its own — which a menu item cannot, its children
   * being presentational (ADR-0072): a real `<button>`, and the current one
   * `aria-current` rather than checked. The same row to the eye.
   */
  as?:        'menuitem' | 'button'
  /**
   * `danger` — an action that destroys (delete, remove). **Red in the menu**,
   * glyph and word, and the error tint under the pointer or the focus (ADR-0113).
   * It goes **last, alone in its group** after a `DropdownDivider`, and the
   * product still confirms it (`ConfirmDialog`).
   */
  tone?:      'neutral' | 'danger'
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  selected: undefined,
  checked:  undefined,
  as:       'menuitem',
  tone:     'neutral',
})

const emit = defineEmits<{
  click: []
}>()

/* The panel's size (ADR-0101); a row outside a `Dropdown` is `md`. */
const size = inject(DROPDOWN_SIZE_KEY, () => 'md' as const)

const isChoice  = computed(() => props.selected !== undefined)
const isCheck   = computed(() => props.checked !== undefined)
const isButton  = computed(() => props.as === 'button')

/* A `div` row is made a menu item by hand; a `button` row is one already. */
const rootAttrs = computed(() =>
  isButton.value
    ? {
        type: 'button',
        'aria-current': props.selected ? 'true' : undefined,
        'aria-pressed': isCheck.value ? props.checked : undefined,
        disabled: props.disabled || undefined,
      }
    : {
        role: isCheck.value ? 'menuitemcheckbox' : isChoice.value ? 'menuitemradio' : 'menuitem',
        'aria-checked': isCheck.value ? props.checked : isChoice.value ? props.selected : undefined,
        'aria-disabled': props.disabled || undefined,
        tabindex: 0,
      },
)

/* Enter and Space are a native button's own: only the `div` row is taught them. */
function onKeydown(event: KeyboardEvent) {
  if (isButton.value || props.disabled) return
  if (event.key === 'Enter') emit('click')
  else if (event.key === ' ') {
    event.preventDefault()
    emit('click')
  }
}

const hasAvatar = computed(() => !!(props.avatarSrc || props.avatarInitials))
</script>

<template>
  <component
    :is="isButton ? 'button' : 'div'"
    class="ds-dropdown-item"
    :class="{
      'ds-dropdown-item--disabled': disabled,
      'ds-dropdown-item--selected': selected,
      'ds-dropdown-item--sm': size() === 'sm',
      'ds-dropdown-item--danger': tone === 'danger',
    }"
    v-bind="rootAttrs"
    @click="!disabled && emit('click')"
    @keydown="onKeydown"
  >
    <div class="ds-dropdown-item__content">
      <div class="ds-dropdown-item__icon-text">
        <!-- Decorative either way: the label beside it is the row's name, so
             the avatar's initials must not be read before it (ADR-0041). -->
        <span v-if="isCheck || hasAvatar || icon" class="ds-dropdown-item__leading" aria-hidden="true">
          <!-- The box is `Checkbox`'s own, drawn without its input: the row is the control. -->
          <Checkbox v-if="isCheck" visual-only :model-value="checked" :disabled="disabled" />
          <Avatar
            v-else-if="hasAvatar"
            size="xs"
            :src="avatarSrc"
            :initials="avatarInitials"
            alt=""
          />
          <Icon
            v-else-if="icon"
            :name="icon"
            :size="16"
            class="ds-dropdown-item__icon"
          />
        </span>
        <span class="ds-dropdown-item__label">{{ label }}</span>
      </div>
      <span v-if="shortcut || meta" class="ds-dropdown-item__shortcut">{{ shortcut || meta }}</span>
      <!-- A picture of what the row stands for, after its words — a legend's
           ramp (ADR-0137). Decorative: the label is the row's name. -->
      <span v-if="$slots.trailing" class="ds-dropdown-item__trailing" aria-hidden="true"><slot name="trailing" /></span>
    </div>
  </component>
</template>

<style scoped>
.ds-dropdown-item__trailing {
  display: inline-flex;
  flex: none;
  align-items: center;
}

.ds-dropdown-item {
  display: flex;
  align-items: center;
  padding: 1px var(--ds-spacing-sm);
  cursor: pointer;
  flex-shrink: 0;
  width: 100%;
  box-sizing: border-box;
  /* The `button` row starts from nothing, as the `div` one does. */
  margin: 0;
  border: none;
  background: none;
  font: inherit;
  color: inherit;
  text-align: left;
}

.ds-dropdown-item__content {
  display: flex;
  align-items: center;
  gap: var(--ds-spacing-lg);
  flex: 1;
  min-width: 0;
  /* 40px a row with its 1px gaps: `label-lg`'s 24px line and 7px above and
     below — the type grew to 16/24 and the row held (ADR-0144). */
  padding: 7px 10px;
  border-radius: var(--ds-radius-inner);
  transition: background-color var(--ds-motion-duration-quick) var(--ds-motion-easing-default);
}

.ds-dropdown-item:hover:not(.ds-dropdown-item--disabled) .ds-dropdown-item__content {
  background-color: var(--ds-bg-hover);
}

.ds-dropdown-item:focus-visible {
  outline: none;
}

.ds-dropdown-item:focus-visible .ds-dropdown-item__content {
  background-color: var(--ds-bg-hover);
}

/*
  The current choice, marked the one way every list in the catalogue marks it
  (ADR-0050): its own ground, that ground's ink, the role's strong weight. No
  check — the weight is the cue that does not travel by colour, which the tint
  alone could not be: in dark it measures 1.145:1 against the panel, where
  hover measures 1.233:1.
*/
.ds-dropdown-item--selected .ds-dropdown-item__content {
  background-color: var(--ds-bg-selected);
}

/* Hovering it keeps its ground's family — `bg-hover` would take the tint away
   and leave the brand ink on grey. */
.ds-dropdown-item--selected:hover:not(.ds-dropdown-item--disabled) .ds-dropdown-item__content,
.ds-dropdown-item--selected:focus-visible .ds-dropdown-item__content {
  background-color: var(--ds-bg-selected-hover);
}

.ds-dropdown-item--disabled {
  cursor: not-allowed;
  opacity: 0.5;
}


.ds-dropdown-item__icon-text {
  display: flex;
  align-items: center;
  gap: var(--ds-spacing-md);
  flex: 1;
  min-width: 0;
}

/*
  The leading column. It hugs what it holds — a 16px glyph, a 24px avatar —
  unless the panel gives it a width, which is how a panel that mixes the two
  keeps one edge for its labels: the switcher centres its footer's `+` in the
  avatars' column. A variant switch the panel sets, not a token (ADR-0010).
*/
.ds-dropdown-item__leading {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  min-width: var(--dropdown-item-leading, auto);
}

.ds-dropdown-item__icon {
  flex-shrink: 0;
  color: var(--ds-text-default);
}

.ds-dropdown-item__label {  font: var(--ds-font-label-lg);
  color: var(--ds-text-default);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  min-width: 0;
}

.ds-dropdown-item--selected .ds-dropdown-item__label {
  font: var(--ds-font-label-lg-strong);
  color: var(--ds-text-on-brand-subtle);
}

/*
  ── Danger (ADR-0113) ─────────────────────────────────────────────────
  Red at rest, glyph and word — the menu's norm (7 of 8 systems benchmarked):
  inside an opened menu, the word is the action, and the colour says what kind.
  Where a row's trash icon waits for the approach (ADR-0112), a menu has
  already been asked for. `text-error` on the panel (4.83:1 light, 5.97 dark);
  under the pointer or the focus the row takes the error tint and its exact ink,
  `bg-error-subtle` + `text-on-error-subtle` (6.05:1).
*/
.ds-dropdown-item--danger .ds-dropdown-item__label,
.ds-dropdown-item--danger .ds-dropdown-item__icon {
  color: var(--ds-text-error);
}

.ds-dropdown-item--danger:is(:hover, :focus-visible):not(.ds-dropdown-item--disabled) .ds-dropdown-item__content {
  background-color: var(--ds-bg-error-subtle);
}

.ds-dropdown-item--danger:is(:hover, :focus-visible):not(.ds-dropdown-item--disabled) :is(.ds-dropdown-item__label, .ds-dropdown-item__icon) {
  color: var(--ds-text-on-error-subtle);
}

.ds-dropdown-item--selected .ds-dropdown-item__icon {
  color: var(--ds-text-on-brand-subtle);
}

.ds-dropdown-item__shortcut {  font: var(--ds-font-body-sm);
  color: var(--ds-text-subtlest);
  white-space: nowrap;
  flex-shrink: 0;
}

/* sm (ADR-0101): 34px a row — `label-md`'s 20px line and 6px above and below,
   plus the row's 1px gap — the size of the small control that opens it
   (ADR-0144: the line grew from 16, the inset gave). */
.ds-dropdown-item--sm .ds-dropdown-item__content {
  padding: var(--ds-spacing-sm) 10px;
}

.ds-dropdown-item--sm .ds-dropdown-item__label {
  font: var(--ds-font-label-md);
}

.ds-dropdown-item--sm.ds-dropdown-item--selected .ds-dropdown-item__label {
  font: var(--ds-font-label-md-strong);
}

.ds-dropdown-item--sm .ds-dropdown-item__shortcut {
  font: var(--ds-font-body-sm);
}
</style>
