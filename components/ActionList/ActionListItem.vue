<script setup lang="ts">
import { useId } from 'vue'
import { Badge, type BadgeTone } from '../Badge'
import { Icon } from '../Icon'

/**
 * One quick action (ADR-0208): a whole row that is a real control — an `<a>`
 * with `href`, a `<button>` without — never a `<div>` that emits (ADR-0014).
 *
 * From the start: a **plate** (3rem, `radius-surface`, the tray's grey,
 * ADR-0207) holding a free illustration (`#media`) — **only when `#media` is
 * filled** (ADR-0210): without it the row starts at its words, which then have
 * the title's whole room; the **title**, a verb in
 * the infinitive, one line, an optional `Badge` beside it on the same line;
 * **one line** under it; a **chevron** at the end, which keeps its place —
 * the words give, never the chevron, and the title gives before the badge.
 *
 * **One figure, and it breathes** (ADR-0209): the plate holds a single
 * illustration, centred, about **2rem** at most — what `CreditCoins` at 32
 * does — so every row keeps the same margin. One person is an `Avatar size="sm"`
 * (its silhouette), a glyph an `Icon` at 24, which takes the plate's ink,
 * `text-subtlest`: greyed, as the silhouette is. Two people or two logos edge
 * to edge read as cramped beside the coins; a smaller duo was drawn and
 * declined for one figure.
 *
 * Hover and keyboard focus are a tray's (ADR-0199/0207): the row takes
 * `--on-tray-hover`, the plate steps to `bg-neutral`, the ring is the row's;
 * nothing moves. The plate hands its ground down as `--on-plate-ground`, so a
 * stack drawn on it (`AvatarGroup`, `ModuleIconStack`) rings itself in the
 * plate's colour at rest and under the pointer.
 *
 * **The title is the control's name**; the badge and the line are read after
 * it, as its description. The illustration is decorative — hidden, whatever
 * the product puts there.
 */
interface Props {
  /** The action, a verb in the infinitive — « Inviter des membres ». The control's name. */
  title: string
  /** One line under it — « 1 membre ». Cut when it runs out of room. */
  description?: string
  /** Where it goes. Given, the row is an `<a>`; otherwise a `<button>`. */
  href?: string
  /** A word beside the title — « Recommandé ». */
  badge?: string
  /** The badge's tone; `brand` is legitimate here, the row is a control (ADR-0149). */
  badgeTone?: BadgeTone
}

const props = withDefaults(defineProps<Props>(), {
  description: undefined,
  href: undefined,
  badge: undefined,
  badgeTone: 'neutral',
})

defineSlots<{
  /** The plate's illustration — one figure, decorative, about 2rem at most, centred (ADR-0209). Absent: no plate (ADR-0210). */
  media?: () => unknown
}>()

const emit = defineEmits<{
  /** A plain click — with the click, so a router can take a link over. Never with ⌘/Ctrl/Shift/Alt on a link. */
  select: [event: MouseEvent]
}>()

const id = useId()
const titleId = `ds-action-list-title-${id}`
const badgeId = `ds-action-list-badge-${id}`
const descriptionId = `ds-action-list-description-${id}`

function onClick(event: MouseEvent) {
  /* A modified click on a link is the browser's: a tab, a window (ADR-0165). */
  if (props.href && (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0)) return
  emit('select', event)
}
</script>

<template>
  <li class="ds-action-list-item">
    <component
      :is="href ? 'a' : 'button'"
      class="ds-action-list-item__row"
      :href="href"
      :type="href ? undefined : 'button'"
      :aria-labelledby="titleId"
      :aria-describedby="[badge && badgeId, description && descriptionId].filter(Boolean).join(' ') || undefined"
      @click="onClick"
    >
      <span v-if="$slots.media" class="ds-action-list-item__plate" aria-hidden="true"><slot name="media" /></span>
      <span class="ds-action-list-item__text">
        <span class="ds-action-list-item__head">
          <span :id="titleId" class="ds-action-list-item__title">{{ title }}</span>
          <Badge v-if="badge" :id="badgeId" :label="badge" :tone="badgeTone" size="sm" class="ds-action-list-item__badge" />
        </span>
        <span v-if="description" :id="descriptionId" class="ds-action-list-item__description">{{ description }}</span>
      </span>
      <Icon name="chevron-right" :size="20" class="ds-action-list-item__chevron" aria-hidden="true" />
    </component>
  </li>
</template>

<style scoped>
.ds-action-list-item {
  display: block;
  min-width: 0;
}

.ds-action-list-item__row {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: var(--ds-spacing-md);
  width: 100%;
  min-width: 0;
  padding: var(--ds-spacing-md);
  border: 0;
  border-radius: var(--ds-radius-surface);
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: start;
  text-decoration: none;
  cursor: pointer;
  transition:
    background-color var(--ds-motion-duration-quick) var(--ds-motion-easing-default),
    box-shadow var(--ds-motion-duration-instant) var(--ds-motion-easing-default);
}

/* The tray's hover (ADR-0199), on keyboard focus as on the pointer. */
.ds-action-list-item__row:is(:hover, :focus-visible) {
  background: var(--on-tray-hover, var(--ds-bg-neutral-subtle-hover));
}

.ds-action-list-item__row:focus-visible {
  outline: none;
  box-shadow: var(--ds-focus-ring-brand-shadow-xs);
}

/* The plate: the tray's grey at rest, `bg-neutral` with the row (ADR-0207) —
   and that ground handed down to what is drawn on it. */
.ds-action-list-item__plate {
  --on-plate-ground: var(--ds-bg-neutral-subtle);
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  border-radius: var(--ds-radius-surface);
  background: var(--on-plate-ground);
  /* A glyph on the plate is greyed, as an avatar's silhouette is (ADR-0209). */
  color: var(--ds-text-subtlest);
  transition: background-color var(--ds-motion-duration-quick) var(--ds-motion-easing-default);
}

.ds-action-list-item__row:is(:hover, :focus-visible) .ds-action-list-item__plate {
  --on-plate-ground: var(--ds-bg-neutral);
}

@media (prefers-reduced-motion: reduce) {
  .ds-action-list-item__row,
  .ds-action-list-item__plate {
    transition: none;
  }
}

.ds-action-list-item__text {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
}

/*
  One line, and the badge whole or not at all. The title asks for 3rem only
  (its basis) and grows up to its own width (`max-width: max-content`), so the
  badge sits right after it and the title is cut first. When even 3rem and the
  badge do not fit, the badge wraps to a second line the head does not show —
  never cut, never over the chevron, and still read (it describes the control).
*/
.ds-action-list-item__head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  column-gap: var(--ds-spacing-md);
  height: 1lh;
  min-width: 0;
  overflow: hidden;
  font: var(--ds-font-label-lg-strong);
}

.ds-action-list-item__title {
  flex: 1 1 3rem;
  min-width: 0;
  max-width: max-content;
  overflow: hidden;
  font: var(--ds-font-label-lg-strong);
  color: var(--ds-text-strong);
  white-space: nowrap;
  text-overflow: ellipsis;
}

.ds-action-list-item__badge {
  flex: none;
}

.ds-action-list-item__description {
  min-width: 0;
  overflow: hidden;
  font: var(--ds-font-body-sm);
  color: var(--ds-text-subtle);
  white-space: nowrap;
  text-overflow: ellipsis;
}

.ds-action-list-item__chevron {
  flex: none;
  color: var(--ds-text-subtlest);
}
</style>
