<script setup lang="ts">
import { computed } from 'vue'
import { Avatar } from '../Avatar'
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
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  selected: undefined,
})

const emit = defineEmits<{
  click: []
}>()

const isChoice  = computed(() => props.selected !== undefined)
const hasAvatar = computed(() => !!(props.avatarSrc || props.avatarInitials))
</script>

<template>
  <div
    class="ds-dropdown-item"
    :class="{
      'ds-dropdown-item--disabled': disabled,
      'ds-dropdown-item--selected': selected,
    }"
    :role="isChoice ? 'menuitemradio' : 'menuitem'"
    :aria-checked="isChoice ? selected : undefined"
    :tabindex="disabled ? -1 : 0"
    @click="!disabled && emit('click')"
    @keydown.enter="!disabled && emit('click')"
    @keydown.space.prevent="!disabled && emit('click')"
  >
    <div class="ds-dropdown-item__content">
      <div class="ds-dropdown-item__icon-text">
        <!-- Decorative either way: the label beside it is the row's name, so
             the avatar's initials must not be read before it (ADR-0041). -->
        <span v-if="hasAvatar || icon" class="ds-dropdown-item__leading" aria-hidden="true">
          <Avatar
            v-if="hasAvatar"
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
    </div>
  </div>
</template>

<style scoped>
.ds-dropdown-item {
  display: flex;
  align-items: center;
  padding: 1px var(--ds-spacing-sm);
  cursor: pointer;
  flex-shrink: 0;
  width: 100%;
  box-sizing: border-box;
}

.ds-dropdown-item__content {
  display: flex;
  align-items: center;
  gap: var(--ds-spacing-lg);
  flex: 1;
  min-width: 0;
  padding: 9px 10px;
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

.ds-dropdown-item--selected .ds-dropdown-item__icon {
  color: var(--ds-text-on-brand-subtle);
}

.ds-dropdown-item__shortcut {  font: var(--ds-font-body-sm);
  color: var(--ds-text-subtlest);
  white-space: nowrap;
  flex-shrink: 0;
}
</style>
