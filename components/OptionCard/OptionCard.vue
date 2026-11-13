<script setup lang="ts">
import { computed, inject, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'
import { Avatar } from '../Avatar'
import { Badge, type BadgeTone } from '../Badge'
import { Checkbox } from '../Checkbox'
import { Flag } from '../Flag'
import { Icon, type IconName } from '../Icon'
import { IconButton } from '../IconButton'
import { Spinner } from '../Spinner'
import { Tooltip } from '../Tooltip'
import { OPTION_LIST_KEY, type OptionValue } from './context'

/**
 * One option, as a card or a row (ADR-0086): a media at the start — an icon on
 * its tile, an avatar, a flag, or the `#media` slot — then the title and its
 * sentence, a meta just before the end, and **the control at the end**, where
 * a chevron can only be: one rule for the three controls.
 *
 * In an `OptionList` it is a choice: a real radio (one choice) or checkbox
 * (several), hidden, the card being its label — so the keyboard is the
 * browser's own: one Tab stop for the radios and the arrows that move *and*
 * choose, one stop per box. Chosen, it says so three ways — the `border-brand`
 * contour at 2px (over 3:1 in both modes, ADR-0044), the `bg-selected` tint
 * (ADR-0050) and the control checked — never the colour alone (ADR-0006).
 * Hover is the contour only: a hover ground would be the icon tile's own
 * primitive, and the tile would disappear (ADR-0033).
 *
 * Alone, with `href` or a click, it is **a row that leads**: the same drawing
 * with a chevron, a link or a button, and no chosen state — no system mixes a
 * chevron with a selection.
 *
 * With `actionLabel` it is **a row that holds one action** (ADR-0126) — a file
 * to download, not a place to go: the row is no longer a control (no link, no
 * button, no hover contour), the chevron gives way to **the action's glyph**
 * at the end, on the top line — a row's action shape, `IconButton` `xs`
 * `subtle` (ADR-0112): round, no border, no word (ADR-0127). The word is
 * `actionLabel`: the button's name and its tooltip, the button described by
 * the row. The focus goes to that button. One action per row; it emits
 * `action`, and `actionLoading` holds it busy while the file is made. Never in
 * an `OptionList`: a row is a choice or carries an action, not both.
 */
interface Props {
  /** The title. */
  label: string
  description?: string
  /** A figure or a word just before the control — « 128 parcelles ». */
  meta?: string
  /**
   * A status on the title's line, at the end before the control (ADR-0139) —
   * « Suivie », « En alerte ». A `Badge sm`: the word says it, the tone colours
   * it. With `meta`, after it.
   */
  badge?: string
  badgeTone?: BadgeTone
  /**
   * `row` — one 40px line (ADR-0143): the icon on a 28px tile, the title cut
   * on its line, the badge right after it, the meta at the end, then the
   * control or the chevron. No sentence. An alert in a panel, a next step.
   */
  density?: 'default' | 'row'
  /** In an `OptionList`, what this option stands for. */
  value?: OptionValue
  icon?: IconName
  avatarSrc?: string
  avatarInitials?: string
  /** An ISO 3166-1 code — the media is the country's flag (ADR-0085). */
  flag?: string
  disabled?: boolean
  /**
   * What the row stands for is **masked** — an exclusion reason whose parcels
   * are hidden on the map (ADR-0151). The media, title, sentence and meta take
   * the disabled look; the card's ground, edge and geometry do not move, and
   * **the action stays live** — it is what brings the row back. The action's
   * glyph and name are the product's to turn (`eye` → `eye-off`, « Masquer… »
   * → « Afficher… »). Not `hidden`, which is the HTML attribute that removes it.
   */
  muted?: boolean
  /**
   * Shown as hovered, without being hovered or chosen (ADR-0168): the object
   * the pointer is over elsewhere — on a map. In an `OptionList`, the list's
   * `highlighted` decides it by `value`.
   */
  highlighted?: boolean
  /** A row that leads somewhere: a link. Without it and outside a list, a button. */
  href?: string
  /** The row's one action, its name and its tooltip — « Télécharger ». Emits `action`. */
  actionLabel?: string
  /** The action's glyph, alone at the row's end. */
  actionIcon?: IconName
  /** The action is under way — the file being made. */
  actionLoading?: boolean
  /**
   * How many lines the title may take before it is cut with « … » (ADR-0135).
   * Unset, it wraps freely. Cut, it is given whole in a tooltip on hover; a
   * reader always hears it whole.
   */
  labelLines?: number
  /**
   * How many lines the sentence may take — `1` keeps every row of a list one
   * height (ADR-0135). Unset, it wraps freely.
   */
  descriptionLines?: number
  /** @deprecated 0.108's switch: the action is always its glyph alone now (ADR-0127). Ignored. */
  actionIconOnly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  description: undefined,
  meta: undefined,
  badge: undefined,
  badgeTone: 'neutral',
  density: 'default',
  value: undefined,
  icon: undefined,
  avatarSrc: undefined,
  avatarInitials: undefined,
  flag: undefined,
  disabled: false,
  muted: false,
  href: undefined,
  actionLabel: undefined,
  actionIcon: undefined,
  actionLoading: false,
  actionIconOnly: false,
  labelLines: undefined,
  descriptionLines: undefined,
})

const emit = defineEmits<{ click: [event: MouseEvent]; action: [] }>()

const list = inject(OPTION_LIST_KEY, null)
const uid = useId()
const titleId = `ds-option-card-title-${uid}`
const descriptionId = `ds-option-card-description-${uid}`
const badgeId = `ds-option-card-badge-${uid}`
/* What the row is described by: its sentence, then its status. */
const describedBy = computed(() =>
  [props.description ? descriptionId : null, props.badge ? badgeId : null].filter(Boolean).join(' ') || undefined)

/* A row that holds an action; else a choice inside a list; else a row that leads. */
const holds = computed(() => Boolean(props.actionLabel))
const choosing = computed(() => !holds.value && Boolean(list) && props.value !== undefined)
const checked = computed(() => choosing.value && list!.isChecked(props.value!))
const isDisabled = computed(() => props.disabled || (list?.disabled.value ?? false))
const kind = computed(() => (list?.multiple.value ? 'checkbox' : 'radio'))

const tag = computed(() => (holds.value ? 'div' : choosing.value ? 'label' : props.href ? 'a' : 'button'))
const rootAttrs = computed(() => {
  if (choosing.value || holds.value) return {}
  /* Named by its title, described by its sentence — not the whole row read as one name. */
  const named = { 'aria-labelledby': titleId, 'aria-describedby': describedBy.value }
  if (props.href) return { ...named, href: isDisabled.value ? undefined : props.href, 'aria-disabled': isDisabled.value || undefined }
  return { ...named, type: 'button', disabled: isDisabled.value }
})

function onChange() {
  if (!isDisabled.value && choosing.value) list!.toggle(props.value!)
}

const isHighlighted = computed(() =>
  props.highlighted || (list !== null && props.value !== undefined && list.highlighted.value === props.value),
)

/* The way back to the map: a row hovered says which, and its leaving says none. */
function onEnter() {
  if (list && props.value !== undefined) list.hover(props.value)
}
function onLeave() {
  if (list && props.value !== undefined) list.hover(null)
}

function onClick(event: MouseEvent) {
  if (!choosing.value && !holds.value && !isDisabled.value) emit('click', event)
}

/*
  A capped line count cuts the text with « … » (ADR-0135); the whole text stays
  in the DOM — the visual clamp is all that is cut, so the name and the
  description a reader hears are whole. On hover, a tooltip gives it back —
  **only when it is cut**, or a whole sentence would be said twice (ADR-0109).
*/
const row = computed(() => props.density === 'row')
/* A row's title holds one line. */
const titleLines = computed(() => props.labelLines ?? (row.value ? 1 : undefined))
const titleEl = ref<HTMLElement | null>(null)
const descriptionEl = ref<HTMLElement | null>(null)
const titleCut = ref(false)
const descriptionCut = ref(false)
const isCut = (el: HTMLElement | null) =>
  !!el && (el.scrollHeight > el.clientHeight + 1 || el.scrollWidth > el.clientWidth + 1)
function measure() {
  titleCut.value = titleLines.value != null && isCut(titleEl.value)
  descriptionCut.value = props.descriptionLines != null && isCut(descriptionEl.value)
}
let ro: ResizeObserver | null = null
function observe() {
  ro?.disconnect()
  if (titleLines.value == null && props.descriptionLines == null) return
  ro ??= new ResizeObserver(measure)
  if (titleEl.value) ro.observe(titleEl.value)
  if (descriptionEl.value) ro.observe(descriptionEl.value)
  measure()
}
onMounted(() => {
  observe()
  document.fonts?.ready.then(measure)
})
watch(() => [props.label, props.description, titleLines.value, props.descriptionLines], () => requestAnimationFrame(observe))
onBeforeUnmount(() => ro?.disconnect())

/* The button is named by its word and described by the row: five « Télécharger »
   in a list each say which file. */
const actionDescribedBy = computed(() => [titleId, describedBy.value].filter(Boolean).join(' '))
</script>

<template>
  <component
    :is="tag"
    v-bind="rootAttrs"
    class="ds-option-card"
    :class="{
      'ds-option-card--checked': checked,
      'ds-option-card--disabled': isDisabled,
      'ds-option-card--muted': muted && !isDisabled,
      'ds-option-card--leads': !choosing && !holds,
      'ds-option-card--link': !choosing && !holds && !row && !isDisabled && !muted,
      'ds-option-card--holds': holds,
      'ds-option-card--row': row,
      'ds-option-card--highlighted': isHighlighted && !isDisabled,
    }"
    @click="onClick"
    @mouseenter="onEnter"
    @mouseleave="onLeave"
  >
    <!-- The real control, hidden: the card is its label, the keyboard the browser's. -->
    <input
      v-if="choosing"
      class="ds-option-card__input"
      :type="kind"
      :name="list!.name"
      :value="String(value)"
      :checked="checked"
      :disabled="isDisabled"
      :aria-labelledby="titleId"
      :aria-describedby="describedBy"
      @change="onChange"
    />

    <span v-if="$slots.media || icon || avatarSrc || avatarInitials || flag" class="ds-option-card__media" aria-hidden="true">
      <slot name="media">
        <span v-if="icon" class="ds-option-card__tile"><Icon :name="icon" :size="row ? 16 : 20" /></span>
        <Avatar v-else-if="avatarSrc || avatarInitials" :src="avatarSrc" :initials="avatarInitials" size="sm" />
        <Flag v-else-if="flag" :code="flag" :size="24" />
      </slot>
    </span>

    <span class="ds-option-card__text">
      <Tooltip :title="label" :disabled="!titleCut" placement="top-start" class="ds-option-card__tip">
        <span
          :id="titleId"
          ref="titleEl"
          class="ds-option-card__title"
          :class="{ 'ds-option-card__clamp': titleLines != null, 'ds-option-card__clamp--one': titleLines === 1 }"
          :style="titleLines != null ? { '--option-card-lines': titleLines } : undefined"
        >{{ label }}</span>
      </Tooltip>
      <!-- A row's badge follows its title on the line, before the meta's end. -->
      <span v-if="badge && row" :id="badgeId" class="ds-option-card__row-badge"><Badge :label="badge" :tone="badgeTone" size="sm" /></span>
      <Tooltip v-if="description && !row" :title="description" :disabled="!descriptionCut" placement="top-start" class="ds-option-card__tip">
        <span
          :id="descriptionId"
          ref="descriptionEl"
          class="ds-option-card__description"
          :class="{ 'ds-option-card__clamp': descriptionLines != null, 'ds-option-card__clamp--one': descriptionLines === 1 }"
          :style="descriptionLines != null ? { '--option-card-lines': descriptionLines } : undefined"
        >{{ description }}</span>
      </Tooltip>
    </span>

    <span v-if="meta" class="ds-option-card__meta"><span class="ds-option-card__meta-text">{{ meta }}</span></span>
    <span v-if="badge && !row" :id="badgeId" class="ds-option-card__meta ds-option-card__badge"><Badge :label="badge" :tone="badgeTone" size="sm" /></span>

    <span v-if="holds" class="ds-option-card__action">
      <Tooltip :title="actionLabel!" placement="top">
        <!-- Busy, it keeps its focus and its place: a spinner in the glyph's
             box, the press ignored (ADR-0059 — disabling would drop the focus). -->
        <IconButton
          size="xs"
          variant="subtle"
          :icon="actionIcon ?? 'download'"
          :ariaLabel="actionLabel!"
          :disabled="isDisabled"
          :aria-describedby="actionDescribedBy"
          :aria-busy="actionLoading || undefined"
          @click="actionLoading || emit('action')"
        >
          <template #default="{ size }">
            <Spinner v-if="actionLoading" :size="size" :thickness="2" />
            <Icon v-else :name="actionIcon ?? 'download'" :size="size" />
          </template>
        </IconButton>
      </Tooltip>
    </span>
    <span v-else class="ds-option-card__control" aria-hidden="true">
      <Checkbox v-if="choosing" visual-only size="sm" :type="kind" :model-value="checked" :disabled="isDisabled" />
      <Icon v-else name="chevron-right" :size="row ? 16 : 20" class="ds-option-card__chevron" />
    </span>
  </component>
</template>

<style scoped>
/*
  The contour is a ring inside the border, so going from 1px to 2px moves
  nothing; the focus ring is added to it, not put in its place.
*/
.ds-option-card {
  --option-card-contour: 0 0 transparent;
  --option-card-focus: 0 0 transparent;

  position: relative;
  display: flex;
  align-items: flex-start;
  gap: var(--ds-spacing-lg);
  box-sizing: border-box;
  width: 100%;
  margin: 0;
  padding: var(--ds-spacing-xl);
  /* Raised on map glass (ADR-0173): an ink edge and a short shadow. */
  border: var(--ds-border-width-default) solid var(--on-glass-raised-edge, var(--ds-border-subtle));
  border-radius: var(--ds-radius-surface-sm);
  /* At 70 % inside map glass (ADR-0172): opaque white blocks read as a patchwork. */
  background: var(--on-glass-raised, var(--ds-bg-default));
  box-shadow: var(--option-card-contour), var(--option-card-focus), var(--on-glass-raised-shadow, 0 0 transparent);
  color: inherit;
  font: inherit;
  text-align: left;
  text-decoration: none;
  cursor: pointer;
  transition:
    border-color var(--ds-motion-duration-quick) var(--ds-motion-easing-default),
    background-color var(--ds-motion-duration-quick) var(--ds-motion-easing-default),
    box-shadow var(--ds-motion-duration-instant) var(--ds-motion-easing-default);
}

/* Hover is the contour alone: a ground would swallow the icon's tile (a card
   that leads does the opposite on purpose, ADR-0159). A row
   that holds an action is not a control: only its button answers. */
.ds-option-card:is(:hover, .ds-option-card--highlighted):not(.ds-option-card--disabled):not(.ds-option-card--checked):not(.ds-option-card--holds):not(.ds-option-card--link) {
  border-color: var(--ds-border-default);
}

.ds-option-card--checked {
  --option-card-contour: inset 0 0 0 var(--ds-border-width-default) var(--ds-border-brand);

  border-color: var(--ds-border-brand);
  background: var(--ds-bg-selected);
}

/* The ring is the card's, whichever holds the focus — its input or itself. */
.ds-option-card:has(.ds-option-card__input:focus-visible),
.ds-option-card--leads:focus-visible {
  --option-card-focus: var(--on-glass-focus, var(--ds-focus-ring-brand));

  outline: none;
}

.ds-option-card--holds {
  cursor: default;
}

.ds-option-card--disabled {
  border-color: var(--ds-border-disabled);
  background: var(--ds-bg-disabled);
  cursor: not-allowed;
}

/* Visually hidden, still the control. */
.ds-option-card__input {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
  opacity: 0;
}

.ds-option-card__media {
  display: inline-flex;
  flex: none;
}

/* The icon on its 40px tile — the recessed ground the hover must not cover. */
.ds-option-card__tile {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--ds-spacing-5xl);
  height: var(--ds-spacing-5xl);
  border-radius: var(--ds-radius-control);
  background: var(--on-glass-tile, var(--ds-bg-neutral-subtle));
  color: var(--ds-text-default);
}

.ds-option-card__text {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: var(--ds-spacing-xxs);
  min-width: 0;
}

.ds-option-card__title {
  font: var(--option-card-title-font, var(--ds-font-label-lg-strong));
  color: var(--ds-text-strong);
  overflow-wrap: anywhere;
}

.ds-option-card__description {
  /* The floor, 14 — `body-sm`, or the reading panel's (ADR-0132, ADR-0144). */
  font: var(--reading-secondary-font, var(--ds-font-body-sm));
  color: var(--ds-text-subtle);
  overflow-wrap: anywhere;
}

/* The tooltip's anchor is a box of the column, as wide as the text. */
.ds-option-card__tip {
  display: flex;
  min-width: 0;
}

.ds-option-card__tip > * {
  min-width: 0;
}

/* A capped line count (ADR-0135): cut with « … » at the last line allowed. */
.ds-option-card__clamp {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: var(--option-card-lines);
  line-clamp: var(--option-card-lines);
  overflow: hidden;
}

/* One line is cut at the edge, not at the last whole word: a clamp breaks the
   line before the word that would not fit and leaves the rest of it empty. */
.ds-option-card__clamp--one {
  display: block;
  /* Takes the width it is given and asks for none: an unbroken line otherwise
     reports its whole length as the card's minimum and widens the list
     (ADR-0133's defect, in a row). */
  flex: 1 1 auto;
  width: 0;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* The meta and the control sit on the title's line: each is a box one title
   line tall (`1lh` in the title's own font), its content centred in it. */
.ds-option-card__meta,
.ds-option-card__control {
  display: inline-flex;
  flex: none;
  align-items: center;
  height: 1lh;
  font: var(--option-card-title-font, var(--ds-font-label-lg-strong));
}

/* The action on the title's line, at the end: its top on the content's top. */
.ds-option-card__action {
  display: inline-flex;
  flex: none;
  align-self: flex-start;
}

.ds-option-card__meta-text {
  font: var(--ds-font-body-sm);
  font-variant-numeric: tabular-nums;
  color: var(--ds-text-subtle);
}

.ds-option-card__chevron {
  color: var(--ds-text-subtle);
}

/* Masked (ADR-0151): the disabled look on what the row says, never on the
   card or on its action — the owner's « le pâle du grisé ». The media is
   decorative, so it may fade; the words take the disabled ink. */
.ds-option-card--muted .ds-option-card__media {
  opacity: 0.4;
}

.ds-option-card--muted .ds-option-card__title,
.ds-option-card--muted .ds-option-card__description,
.ds-option-card--muted .ds-option-card__meta-text {
  color: var(--ds-text-disabled);
}

.ds-option-card--disabled .ds-option-card__title,
.ds-option-card--disabled .ds-option-card__description,
.ds-option-card--disabled .ds-option-card__meta-text,
.ds-option-card--disabled .ds-option-card__chevron {
  color: var(--ds-text-disabled);
}

/*
  ── A card that leads (ADR-0159) ───────────────────────────────────────
  The owner's « Design Week 19-05-25 » card (3:5143): the brand says « this is
  a way in », where on a choosing card it says « this one is chosen » — so it
  is the leading card's alone, never a choice's, never a 40px row's. The tile
  grows to 48 on the brand's tint, the title to `label-xl-strong` in the
  brand's ink, the chevron centres on the card. The tile's glyph takes the
  tint's exact partner (`text-on-brand-subtle`, ADR-0009): one step past the
  drawing's brand/600 in light, the same value in dark.
*/
.ds-option-card--link {
  transition:
    border-color     var(--ds-motion-duration-moderate) var(--ds-motion-easing-default),
    background-color var(--ds-motion-duration-moderate) var(--ds-motion-easing-default),
    box-shadow       var(--ds-motion-duration-instant)  var(--ds-motion-easing-default);
}

.ds-option-card--link .ds-option-card__tile {
  width: var(--ds-spacing-6xl);
  height: var(--ds-spacing-6xl);
  background: var(--ds-bg-brand-subtle);
  color: var(--ds-text-on-brand-subtle);
}

.ds-option-card--link .ds-option-card__title {
  font: var(--ds-font-label-xl-strong);
  color: var(--ds-text-brand);
  transition: color var(--ds-motion-duration-moderate) var(--ds-motion-easing-default);
}

/* The meta keeps the title's line box; the chevron leaves it for the card's middle. */
.ds-option-card--link .ds-option-card__meta {
  font: var(--ds-font-label-xl-strong);
}

.ds-option-card--link .ds-option-card__control {
  align-self: center;
  height: auto;
}

.ds-option-card--link .ds-option-card__chevron {
  transition:
    color     var(--ds-motion-duration-moderate) var(--ds-motion-easing-default),
    transform var(--ds-motion-duration-moderate) var(--ds-motion-easing-default);
}

/*
  Hover and the keyboard's focus: the whole card becomes the tile — its ground
  the tint, its border melted into it, so the tile dissolves and the glyph
  stands alone. On the tint the title takes the tint's partner, which is also
  the brand's hover ink (brand/700 in light, unchanged in dark).
*/
.ds-option-card--link:is(:hover, :focus-visible, .ds-option-card--highlighted) {
  border-color: var(--ds-bg-brand-subtle);
  background-color: var(--ds-bg-brand-subtle);
}

.ds-option-card--link:is(:hover, :focus-visible, .ds-option-card--highlighted) .ds-option-card__title {
  color: var(--ds-text-on-brand-subtle);
}

.ds-option-card--link:is(:hover, :focus-visible, .ds-option-card--highlighted) .ds-option-card__chevron {
  color: var(--ds-text-on-brand-subtle);
  transform: translateX(2px);
}

.ds-option-card--link:active {
  border-color: var(--ds-bg-brand-subtle-hover);
  background-color: var(--ds-bg-brand-subtle-hover);
}

/* Less motion: the colours still turn, the chevron stays where it is. */
@media (prefers-reduced-motion: reduce) {
  .ds-option-card--link:is(:hover, :focus-visible, .ds-option-card--highlighted) .ds-option-card__chevron {
    transform: none;
  }
}

/* ── Row (ADR-0143): one 40px line ──────────────────────────────────── */
/* 28 tile + 5 above and below + the 1px border = 40. */
.ds-option-card--row {
  align-items: center;
  gap: var(--ds-spacing-md);
  min-height: 40px; /* token-lint-disable spacing-on-ramp — a row's height, the tile's 28 + its inset; not rhythm */
  padding: 0 var(--ds-spacing-lg) 0 var(--ds-spacing-sm);
  /* Inside map glass, 12 (ADR-0172). */
  border-radius: var(--on-glass-row-radius, var(--ds-radius-control));
}

.ds-option-card--row .ds-option-card__tile {
  width: 28px;
  height: 28px;
  border-radius: var(--ds-radius-inner);
  background: var(--on-glass-tile, var(--ds-bg-neutral));
}

/* The title and its badge on one line; the title gives, the badge does not. */
.ds-option-card--row .ds-option-card__text {
  flex-direction: row;
  align-items: center;
  gap: var(--ds-spacing-md);
}

.ds-option-card--row .ds-option-card__title {
  font: var(--ds-font-label-md-strong);
}

/* At its own width, cut only when the line runs out — so the badge stays
   against it rather than at the line's far end. */
.ds-option-card--row .ds-option-card__tip {
  flex: 0 1 auto;
}

.ds-option-card--row .ds-option-card__clamp--one {
  flex: 0 1 auto;
  width: auto;
}

.ds-option-card__row-badge {
  display: inline-flex;
  flex: none;
}

.ds-option-card--row .ds-option-card__meta,
.ds-option-card--row .ds-option-card__control {
  height: auto;
}
</style>
