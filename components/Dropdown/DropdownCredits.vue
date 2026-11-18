<script setup lang="ts">
import { computed, inject } from 'vue'
import { CreditCoins } from '../CreditCoins'
import { Icon } from '../Icon'
import { Skeleton } from '../Skeleton'
import { DROPDOWN_ROLE_KEY } from './context'

/**
 * The credits at the head of a menu (ADR-0221) — the balance as a block that
 * leads to it, for `Dropdown`'s `#header`. The module's menu in `MapTopBar`
 * opens on it; any menu that concerns a module's credits may.
 *
 * A block on `bg-neutral-subtle`, `radius-inner`, `spacing-md` in and between:
 * the coins (`CreditCoins` at 32), the **balance** in `heading-sm` /
 * `text-strong` over « crédits {module} disponibles » in `body-sm` /
 * `text-subtle`, and a `chevron-right` (20, `text-subtlest`) — it goes
 * somewhere. Hover and keyboard focus step the ground to `bg-neutral`; nothing
 * moves. No « Recharger »: the block is the way to the credits.
 *
 * A real control — an `<a>` with `href`, a `<button>` without — that emits
 * `select` (none on a modified click on a link, ADR-0165). **In a menu it is a
 * menu item**, so the arrows reach it like any row; its name is its words.
 *
 * `balance: null` is a balance **on its way** (ADR-0054): a placeholder the
 * figure's height, never `0` for want of data.
 */
interface Props {
  /** The balance. `null`: on its way — a placeholder, not `0`. */
  balance: number | null
  /** The module the credits belong to — « crédits Inset disponibles ». */
  module?: string
  /** The line under the balance, in place of « crédits {module} disponibles ». */
  label?: string
  /** Where it leads. Given, the block is an `<a>`; otherwise a `<button>`. */
  href?: string
  /** How the balance is written — `fr-FR` « 1 250 », `en-US` « 1,250 ». */
  locale?: string
}

const props = withDefaults(defineProps<Props>(), {
  module: undefined,
  label: undefined,
  href: undefined,
  locale: 'fr-FR',
})

const emit = defineEmits<{
  /** A plain click — with the click, so a router can take a link over. Never with ⌘/Ctrl/Shift/Alt on a link. */
  select: [event: MouseEvent]
}>()

const role = inject(DROPDOWN_ROLE_KEY, () => 'dialog' as const)

const figure = computed(() => (props.balance === null ? '' : new Intl.NumberFormat(props.locale).format(props.balance)))
const caption = computed(() => props.label ?? (props.module ? `crédits ${props.module} disponibles` : 'crédits disponibles'))

function onClick(event: MouseEvent) {
  /* A modified click on a link is the browser's: a tab, a window (ADR-0165). */
  if (props.href && (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0)) return
  emit('select', event)
}
</script>

<template>
  <component
    :is="href ? 'a' : 'button'"
    class="ds-dropdown-credits"
    :href="href"
    :type="href ? undefined : 'button'"
    :role="role() === 'menu' ? 'menuitem' : undefined"
    :aria-busy="balance === null || undefined"
    @click="onClick"
  >
    <CreditCoins :size="32" />
    <span class="ds-dropdown-credits__text">
      <span class="ds-dropdown-credits__balance">
        <Skeleton v-if="balance === null" emphasis="strong" width="3.5em" class="ds-dropdown-credits__pending" />
        <template v-else>{{ figure }}</template>
      </span>
      <span class="ds-dropdown-credits__caption">{{ caption }}</span>
    </span>
    <Icon name="chevron-right" :size="20" class="ds-dropdown-credits__chevron" aria-hidden="true" />
  </component>
</template>

<style scoped>
.ds-dropdown-credits {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: var(--ds-spacing-md);
  width: 100%;
  min-width: 0;
  padding: var(--ds-spacing-md);
  border: 0;
  border-radius: var(--ds-radius-inner);
  background: var(--ds-bg-neutral-subtle);
  color: inherit;
  font: inherit;
  text-align: start;
  text-decoration: none;
  cursor: pointer;
  transition:
    background-color var(--ds-motion-duration-quick) var(--ds-motion-easing-default),
    box-shadow var(--ds-motion-duration-instant) var(--ds-motion-easing-default);
}

.ds-dropdown-credits:is(:hover, :focus-visible) {
  background: var(--ds-bg-neutral);
}

.ds-dropdown-credits:focus-visible {
  outline: none;
  box-shadow: var(--ds-focus-ring-brand-shadow-xs);
}

.ds-dropdown-credits__text {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-width: 0;
}

.ds-dropdown-credits__balance {
  font: var(--ds-font-heading-sm);
  font-variant-numeric: tabular-nums;
  color: var(--ds-text-strong);
}

/* The figure's line box, so the block does not grow when the balance lands. */
.ds-dropdown-credits__pending {
  display: inline-block;
  vertical-align: middle;
}

.ds-dropdown-credits__caption {
  overflow: hidden;
  font: var(--ds-font-body-sm);
  color: var(--ds-text-subtle);
  white-space: nowrap;
  text-overflow: ellipsis;
}

.ds-dropdown-credits__chevron {
  flex: none;
  color: var(--ds-text-subtlest);
}
</style>
