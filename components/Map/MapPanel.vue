<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, useId, type FunctionalComponent } from 'vue'
import { Button } from '../Button'
import { CloseButton } from '../CloseButton'
import { IconButton } from '../IconButton'
import { Scrollbar } from '../Scrollbar'
import { Skeleton } from '../Skeleton'
import { SurfaceTransition } from '../SurfaceTransition'
import { readDuration } from '../../composables/cssTime'

export type MapPanelSize = 'sm' | 'lg'

/**
 * A surface on a map (ADR-0087) — the owner's drawing: `bg-default`, a
 * `border-subtle` hairline, `elevation-raised`, `radius-surface-sm`.
 *
 * `sm` (the default) holds an instruction, a measured area, a toolbar, a
 * year, a legend; its width is its content's, capped at 20rem. With a `title`
 * it is named by it, and `collapsible` folds it into a button bearing the title,
 * in its place (Planetary).
 *
 * `lg` is the panel a screen is read from (ADR-0099, ARR): **25rem, declared** —
 * a size, not a ceiling, or it would shift the map on every tab — as tall as
 * the overlay lets it, a head and a foot that stay, a body that scrolls between
 * them. `#header` takes what the head holds (`Tabs`), after the fold.
 *
 * **The fold (track A of `3649:1427`).** A panel with a `#header` folds into a
 * map control at its corner — `Button` icon-only, `secondary-gray`, `sm`, the
 * shape `MapControls` gives every control on a map — and the map is whole
 * again. The fold sits at the head's **start**; folded, the control stands
 * **at the overlay's corner** — 16px from the map's edges, on the grid of the
 * map's other controls (ADR-0117, the owner's frame `3691:9170`), 18px from
 * where the fold was. The focus follows the fold, to the control that
 * replaced the one pressed; the map is not re-framed — the panel floats, it
 * reserves nothing.
 *
 * **The motion is the catalogue's, chosen by what moves** (`SurfaceTransition`,
 * out then in: `enter` + `easing-out` in, `exit` + `easing-in` out — the exit
 * faster, ADR-0021):
 * - `lg` is a **side panel** — it stands on a whole side of the map — so it
 *   moves as `Dialog`'s side panel does (ADR-0079): the fade, with **24px of
 *   travel toward its edge** in place of the scale. The direction says where
 *   the panel lives; nothing crosses the map. On `end` it goes right.
 * - `sm` and the control it becomes **float** in a corner, so they keep the
 *   surface's scale from `--ds-motion-scale-enter`, grown from that corner.
 */
interface Props {
  title?: string
  size?: MapPanelSize
  collapsible?: boolean
  /** The fold's name — said with the title, « Replier Conformité EUDR ». */
  collapseLabel?: string
  /** The unfold's name, on the control the panel became. */
  expandLabel?: string
  /**
   * The content is on its way (ADR-0122): the panel is in its place at its
   * size, its head kept (a title line is a placeholder while there is no
   * `title`), and its body is `#loading` — by default a figure, lines and a
   * block, the shape of a reading panel. The foot stays.
   */
  loading?: boolean
  /**
   * A close button at the end of the title's line, emitting `close` (ADR-0139)
   * — a panel the reader opened and dismisses: a parcel's sheet beside the
   * map. The product removes it.
   */
  closable?: boolean
  /** The close's name — said with the title, « Fermer P-0412 ». */
  closeLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: undefined,
  size: 'sm',
  collapsible: false,
  collapseLabel: 'Replier',
  expandLabel: 'Déplier',
  loading: false,
  closable: false,
  closeLabel: 'Fermer',
})

const emit = defineEmits<{ close: [] }>()

const slots = defineSlots<{
  default?: () => unknown
  /** The head's content, after the fold — `Tabs`. Replaces the title line; `title` still names the panel. */
  header?: () => unknown
  /** The foot, held at the bottom while the body scrolls — the panel's one action. */
  footer?: () => unknown
  /** What the body shows while `loading` — placeholders in the shape of the content. */
  loading?: () => unknown
  /**
   * Folded, beside the control the panel became (ADR-0139) — one action that
   * stays within reach while the panel is away, « Toutes les données ». A
   * `Button sm`, so the two stand on one line at one height.
   */
  folded?: () => unknown
}>()

const collapsed = defineModel<boolean>('collapsed', { default: false })

const host = ref<HTMLElement | null>(null)
const panelId = `ds-map-panel-${useId()}`
const named = (verb: string) => (props.title ? `${verb} ${props.title}` : verb)
/* The fold is the size's, not the head's (ADR-0128): a `lg` panel folds by the
   square at the start of its head into a control at the corner, tabs or no
   tabs; the title + chevron and the titled button are `sm`'s. */
const iconFold = computed(() => props.size === 'lg' || !!slots.header)
/* A reading panel's body scrolls in the package's `Scrollbar` — an overlay
   thumb and the edge fades — not the browser's bar (ADR-0146). A small panel
   does not scroll: its body is rendered as it is. */
const AsIs: FunctionalComponent = (_, { slots: s }) => s.default?.()
/* A `lg` head without `#header` carries the title after the fold. */
const slotHead = computed(() => !!slots.header || (props.size === 'lg' && (!!props.title || props.collapsible || props.loading)))
/* A panel the reader opened and closes — a parcel's sheet — is about one thing,
   and its name stays on the close's line; `#header` (its tabs, its search)
   comes under it (ADR-0142). Without a close, `#header` is the head, as before:
   the screen's reading panel is named by the screen. */
const titled = computed(() => props.closable && !!props.title && !!slots.header)

/*
  The control the panel becomes stands **at the overlay's corner** (ADR-0117,
  the owner's frame « Panneau replié », `3691:9170`): 16px from the map's
  edges, on the grid of the map's other controls. It used to take the fold's
  own place, measured on press (ADR-0103) — 18px further in, a button floating
  off the grid with nothing left to justify the offset once the panel is gone.
  On a place that holds its children at the end (`MapOverlay` `end`), it grows
  from the right corner.
*/
const atEnd = ref(false)
let pressed = false
async function fold(next: boolean) {
  if (next) atEnd.value = !!host.value?.closest('.ds-map-overlay--end, .ds-map-overlay--top-end, .ds-map-overlay--bottom-end')
  pressed = true
  collapsed.value = next
  await nextTick()
}
const unfoldAt = computed(() => ({ transformOrigin: atEnd.value ? 'top right' : 'top left' }))
/* Only when the fold was pressed here: a product folding the panel through
   `v-model:collapsed` does not take the reader's focus (ADR-0062). */
function focusArrived() {
  if (!pressed) return
  pressed = false
  host.value?.querySelector<HTMLElement>(collapsed.value ? '[data-map-panel-open]' : '[data-map-panel-fold]')?.focus()
}

/*
  Its leave (ADR-0168). A component cannot animate its own removal — the
  parent's `v-if` takes it out of the document in one frame (ADR-0052's
  finding, `ToastRegion`). So the panel leaves a **ghost**: a copy of what is
  shown, put in its place in the overlay, inert and hidden from readers, that
  plays the surface's exit (`exit` + `easing-in`; a `lg` panel 24px toward its
  edge, a small one back to 96 %) and is then removed. It holds the panel's
  room for that time, so what centres on the free space (`MapOverlay` top and
  bottom) moves when the panel is gone, not before. Nothing under reduced motion.
*/
onBeforeUnmount(() => {
  const shown = host.value?.firstElementChild as HTMLElement | null | undefined
  const place = host.value?.parentElement
  if (!shown || !place || !place.isConnected) return
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
  const duration = readDuration(shown, '--ds-motion-duration-exit')
  if (!duration) return
  const easing = getComputedStyle(shown).getPropertyValue('--ds-motion-easing-in').trim() || 'ease-in'
  const ghost = shown.cloneNode(true) as HTMLElement
  ghost.removeAttribute('id')
  ghost.setAttribute('aria-hidden', 'true')
  ghost.setAttribute('inert', '')
  ghost.style.pointerEvents = 'none'
  /* Put in once the panel is out — a microtask, before the next paint. Put in
     now, beside the panel, it falls inside the slot's fragment and Vue sweeps
     it out with the panel. It takes the panel's place among the other
     elements. */
  const index = [...place.children].indexOf(host.value!)
  const side = getComputedStyle(shown).getPropertyValue('--map-panel-side').trim() === '1' ? 1 : -1
  const travel = getComputedStyle(shown).getPropertyValue('--ds-spacing-3xl').trim()
  const lg = shown.classList.contains('ds-map-panel--lg')
  const scale = getComputedStyle(shown).getPropertyValue('--ds-motion-scale-enter').trim() || '0.96'
  queueMicrotask(() => {
    if (!place.isConnected) return
    place.insertBefore(ghost, place.children[index] ?? null)
    /* The travel is the one SurfaceTransition's `lg` rule uses, read off the cascade. */
    const to = lg ? (travel ? `translateX(calc(${side} * ${travel}))` : 'none') : `scale(${scale})`
    const run = ghost.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: to }], { duration, easing, fill: 'forwards' })
    run.finished.then(() => ghost.remove(), () => ghost.remove())
  })
})
</script>

<template>
  <!-- A box of no box: it only keeps hold of whichever form is shown. It
       enters on its first frame too (`appear`, ADR-0168): a parcel's sheet
       mounted with `v-if` arrives from its edge, as a fold's return does. -->
  <div ref="host" class="ds-map-panel-host">
    <SurfaceTransition mode="out-in" appear @enter="focusArrived">
      <!-- With a head of its own: a map control at the panel's corner. -->
      <!-- The transition is the wrapper's: `Button` declares its own `transition`,
           which outweighs the surface's and would make it arrive in one frame. -->
      <div v-if="collapsible && collapsed && iconFold" key="open-icon" class="ds-map-panel__unfold" :style="unfoldAt">
      <Button
        data-map-panel-open
        variant="secondary-gray"
        size="sm"
        icon-only
        icon-leading="panel-left"
        :label="named(expandLabel)"
        aria-expanded="false"
        :aria-controls="panelId"
        @click="fold(false)"
      />
      <slot name="folded" />
      </div>
      <!-- A small panel: a button bearing its title, in its place. -->
      <div v-else-if="collapsible && collapsed" key="open-title" class="ds-map-panel__unfold">
      <Button
        data-map-panel-open
        variant="secondary-gray"
        size="sm"
        :label="title ?? ''"
        icon-trailing="chevron-up"
        aria-expanded="false"
        :aria-controls="panelId"
        @click="fold(false)"
      />
      <slot name="folded" />
      </div>
      <section
        v-else
        :id="panelId"
        key="panel"
        class="ds-map-panel"
        :class="`ds-map-panel--${size}`"
        :aria-label="props.title"
        :aria-busy="loading || undefined"
      >
        <div
          v-if="slotHead"
          class="ds-map-panel__head ds-map-panel__head--slot"
          :class="{ 'ds-map-panel__head--folds': collapsible, 'ds-map-panel__head--closes': closable, 'ds-map-panel__head--titled': titled }"
        >
          <IconButton
            v-if="collapsible"
            data-map-panel-fold
            icon="panel-left"
            size="sm"
            variant="subtle"
            :ariaLabel="named(collapseLabel)"
            aria-expanded="true"
            :aria-controls="panelId"
            @click="fold(true)"
          />
          <span v-if="titled" class="ds-map-panel__title ds-map-panel__head-title">{{ title }}</span>
          <div class="ds-map-panel__header">
            <slot name="header">
              <span v-if="title" class="ds-map-panel__title">{{ title }}</span>
              <Skeleton v-else-if="loading" width="40%" aria-hidden="true" />
            </slot>
          </div>
          <CloseButton v-if="closable" class="ds-map-panel__close" size="sm" :ariaLabel="named(closeLabel)" @click="emit('close')" />
        </div>
        <div v-else-if="title" class="ds-map-panel__head">
          <span class="ds-map-panel__title">{{ title }}</span>
          <IconButton
            v-if="collapsible"
            data-map-panel-fold
            icon="chevron-down"
            size="xs"
            variant="subtle"
            :ariaLabel="named(collapseLabel)"
            aria-expanded="true"
            :aria-controls="panelId"
            @click="fold(true)"
          />
          <CloseButton v-if="closable" class="ds-map-panel__close" size="xs" :ariaLabel="named(closeLabel)" @click="emit('close')" />
        </div>
        <div v-else-if="loading" class="ds-map-panel__head" aria-hidden="true">
          <Skeleton width="40%" />
        </div>
        <component :is="size === 'lg' ? Scrollbar : AsIs" :shadows="size === 'lg' || undefined" class="ds-map-panel__scroll">
        <div class="ds-map-panel__body">
          <slot v-if="!loading" />
          <slot v-else name="loading">
            <div class="ds-map-panel__pending" aria-hidden="true">
              <Skeleton width="45%" height="2rem" />
              <Skeleton :lines="3" />
              <Skeleton variant="rect" height="7.5rem" />
              <Skeleton :lines="2" />
            </div>
          </slot>
        </div>
        </component>
        <div v-if="slots.footer" class="ds-map-panel__foot"><slot name="footer" /></div>
      </section>
    </SurfaceTransition>
  </div>
</template>

<style scoped>
.ds-map-panel-host {
  display: contents;
}

.ds-map-panel {
  display: flex;
  flex-direction: column;
  gap: var(--ds-spacing-md);
  box-sizing: border-box;
  /* A ceiling for text, not for a row of buttons: what cannot wrap widens it. */
  max-width: 20rem;
  min-width: min-content;
  padding: var(--ds-spacing-lg);
  border-radius: var(--ds-radius-surface-lg);
  /* Reading glass (ADR-0172): almost opaque — the text is long. What it holds
     follows (`--on-glass-*`): blocks at 70 % / 55 %, what is pressed in a pill. */
  border: var(--ds-border-width-default) solid var(--ds-border-map-edge);
  background: var(--ds-bg-map-read);
  -webkit-backdrop-filter: var(--ds-backdrop-map-read);
  backdrop-filter: var(--ds-backdrop-map-read);
  /* token-lint-disable-next-line no-shadowing-var — on map glass the role's value changes, not its name (ADR-0172) */
  --ds-text-subtlest: var(--ds-text-subtle);
  --on-glass-control-radius: var(--ds-radius-pill);
  --on-glass-card-radius: var(--ds-radius-surface-lg);
  --on-glass-row-radius: var(--ds-radius-surface);
  --on-glass-raised: var(--ds-bg-map-raised);
  --on-glass-sunk: var(--ds-bg-map-sunk);
  box-shadow: var(--ds-elevation-raised);
  /* ADR-0021: the consuming surface sets its own origin — it goes to its
     corner, where the control it becomes stands. */
  transform-origin: top left;
}

/* A side panel leaves toward its edge and comes back from it (ADR-0079's
   motion, ADR-0103): 24px of travel in place of the scale. The edge is the
   place's — `MapOverlay` turns it for `end`. Applied to `SurfaceTransition`'s
   own classes, so the durations and curves stay the catalogue's. */
.ds-map-panel--lg.ds-surface-enter-from,
.ds-map-panel--lg.ds-surface-leave-to {
  transform: translateX(calc(var(--map-panel-side, -1) * var(--ds-spacing-3xl)));
}

.ds-map-panel__body {
  display: flex;
  flex-direction: column;
  gap: var(--ds-spacing-md);
  min-width: 0;
}

/* The head is one title line: the fold's 32px box gives back its 8px above,
   beside and below, so the line stays the title's while the target keeps
   its size. */
.ds-map-panel__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--ds-spacing-md);
  font: var(--ds-font-label-md-strong);
}

.ds-map-panel__title {
  min-width: 0;
  overflow: hidden;
  color: var(--ds-text-strong);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ds-map-panel__head:not(.ds-map-panel__head--slot) :deep(.ds-icon-button),
.ds-map-panel__head:not(.ds-map-panel__head--slot) > .ds-map-panel__close {
  margin-block: calc(-1 * var(--ds-spacing-md));
  margin-inline-end: calc(-1 * var(--ds-spacing-md));
}

/* A title, then — pushed to the end — the fold and the close, touching. */
.ds-map-panel__head:not(.ds-map-panel__head--slot) > .ds-map-panel__title {
  margin-inline-end: auto;
}

/* ── lg: the panel a screen is read from ──────────────────────────────── */
/*
  Declared, so the map beside it does not move as the content changes; as
  tall as the overlay allows (MapOverlay caps at its box less 32px), the body
  scrolling between a head and a foot that stay. The rhythm is a panel's —
  12 above and below the head and the foot, 16 at the sides — and the body's
  blocks are 16 apart.
*/
.ds-map-panel--lg {
  /* A reading panel (ADR-0132): the text that explains a figure is read here,
     beside figures of 32–40px, at 14px — which since ADR-0144 is the floor,
     `body-sm`, everywhere: the raise this context existed for is the scale's
     own now, and `body-md` (16) would set a caption at the body's size. Read by
     ShareBar, StatTile, OptionCard and ChartLegend; a ProjectCard resets it. */
  --reading-secondary-font: var(--ds-font-body-sm);
  --reading-secondary-font-emphasis: var(--ds-font-body-sm-emphasis);
  --reading-legend-wrap: wrap;
  --reading-legend-fade: none;
  width: 25rem;
  max-width: 100%;
  /* Declared means held: `sm`'s « what cannot wrap widens it » does not apply
     here — the content adapts to the panel, never the panel to the content. */
  min-width: 0;
  /* In a place that has a height — a whole side of the map (ADR-0103) — it
     takes it, and its foot sits at the bottom; in a corner, it hugs. */
  flex: 1 1 auto;
  min-height: 0;
  max-height: 100%;
  gap: 0;
  padding: 0;
  /* What is read takes the large curve (ADR-0172). */
  border-radius: var(--ds-radius-surface-xl);
}

.ds-map-panel--lg .ds-map-panel__head {
  flex: none;
  padding: var(--ds-spacing-lg) var(--ds-spacing-xl);
}

.ds-map-panel__pending {
  display: flex;
  flex-direction: column;
  gap: var(--ds-spacing-xl);
}

/* The scroller takes what the head and the foot leave (ADR-0146): `Scrollbar`'s
   viewport scrolls on y only — never across, a sideways overflow would put a
   bar under a panel that looks whole — and its thumb shows only while the body
   moves. */
.ds-map-panel--lg .ds-map-panel__scroll {
  flex: 1 1 auto;
  min-height: 0;
}

.ds-map-panel--lg .ds-map-panel__body {
  gap: var(--ds-spacing-xl);
  padding: 0 var(--ds-spacing-xl) var(--ds-spacing-xl);
}

/*
  A head of its own is a grid (ADR-0130): the fold and the header's **first**
  child share the first line, the fold centred on it — on the tabs, whatever
  follows — and every child after that takes the head's whole width, under the
  fold too: a search that stays while the list scrolls. The header box itself
  is `display: contents`, so its children are the grid's.
*/
.ds-map-panel__head--slot {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  align-items: center;
  gap: var(--ds-spacing-lg) var(--ds-spacing-md);
}

.ds-map-panel__head--folds {
  grid-template-columns: auto minmax(0, 1fr);
}

/* The close ends the first line (ADR-0139); what follows still takes the
   head's whole width, under it too. */
.ds-map-panel__head--closes {
  grid-template-columns: minmax(0, 1fr) auto;
}

.ds-map-panel__head--folds.ds-map-panel__head--closes {
  grid-template-columns: auto minmax(0, 1fr) auto;
}

/* Titled (ADR-0142): the title takes the first line beside the fold and the
   close, and every child of `#header` goes under, at the head's whole width. */
.ds-map-panel__head-title {
  grid-row: 1;
  display: block;
}

.ds-map-panel__head--titled .ds-map-panel__header > :deep(*),
.ds-map-panel__head--titled.ds-map-panel__head--folds .ds-map-panel__header > :deep(:first-child) {
  grid-column: 1 / -1;
}

.ds-map-panel__head--slot > .ds-map-panel__close {
  grid-row: 1;
  grid-column: -2;
}

.ds-map-panel__header {
  display: contents;
}

.ds-map-panel__head--folds .ds-map-panel__header > :deep(:first-child) {
  grid-column: 2;
}

.ds-map-panel__header > :deep(:not(:first-child)) {
  grid-column: 1 / -1;
}

/* The title in a `lg` head without tabs: one line, cut, after the fold. */
.ds-map-panel__header > .ds-map-panel__title {
  display: block;
}

.ds-map-panel__foot {
  flex: none;
  display: flex;
  flex-direction: column;
  /* The action keeps its own width, as the GIS screen draws it (ADR-0103). */
  align-items: flex-start;
  gap: var(--ds-spacing-md);
}

/* The rule is **inset** — it stops at the content's edges, 16px from the
   panel's, as `Dialog`'s side panel draws it (ADR-0079): a rule that runs to
   the border reads as a seam in the surface; inset, it separates the foot from
   the body and nothing else. A drawn line, so the 1px is added above. */
.ds-map-panel--lg .ds-map-panel__foot {
  position: relative;
  padding:
    calc(var(--ds-spacing-lg) + var(--ds-border-width-default)) var(--ds-spacing-xl)
    var(--ds-spacing-lg);
}

.ds-map-panel--lg .ds-map-panel__foot::before {
  content: '';
  position: absolute;
  top: 0;
  right: var(--ds-spacing-xl);
  left: var(--ds-spacing-xl);
  height: var(--ds-border-width-default);
  background: var(--ds-border-subtle);
}

.ds-map-panel__unfold {
  display: flex;
  align-items: center;
  gap: var(--ds-spacing-md);
  transform-origin: top left;
}

/* Less transparency asked for: the same surface, opaque, nothing blurred (ADR-0172). */
@media (prefers-reduced-transparency: reduce) {
  .ds-map-panel {
    border-color: var(--ds-border-subtle);
    background: var(--ds-bg-default);
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
    --on-glass-raised: var(--ds-bg-default);
    --on-glass-sunk: var(--ds-bg-neutral-subtle);
  }
}
</style>
