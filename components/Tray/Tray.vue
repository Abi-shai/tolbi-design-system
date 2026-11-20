<script setup lang="ts">
import { useId } from 'vue'
import { Badge, type BadgeTone } from '../Badge'
import { Scrollbar } from '../Scrollbar'

/**
 * A tray (ADR-0198): the grey ground that **groups a block** — one white
 * surface laid on it, what the block holds laid on that. It was
 * `ProjectList`'s frame (ADR-0166); the owner reads it as a pattern for
 * telling one block from another, kept for some blocks, and the home page's
 * two lists now share it rather than draw it twice (ADR-0001).
 *
 * `bg-neutral` (ADR-0234 — it was `bg-neutral-subtle`, which a white page
 * barely told apart from itself) with `spacing-md` around, `radius-surface-lg` (a surface
 * that holds a surface, one step past it), a `border-subtlest` hairline
 * (ADR-0211); inside, `bg-default`, `spacing-md`
 * around, `radius-surface`. It carries no title and no state: the block's
 * heading is the page's, its wait and its absence the content's.
 *
 * **One hover for the pattern** (ADR-0199): `bg-hover` is the tray's own grey,
 * so on its white surface a hovered row barely showed. The surface hands down
 * `--on-tray-hover` and `--on-tray-hover-strong` (`bg-neutral-strong`, for a
 * grey inside what is hovered) — private context variables, as the map's
 * `--on-glass-*`: whatever is clickable on a tray reads them, on hover and on
 * keyboard focus alike. The hover is **one step past the ground**
 * (`bg-neutral-hover`, ADR-0234): at the ground's own grey a hovered row read
 * as a hole through the surface.
 *
 * **A container may set the tray's ground** through `--tray-ground`, read
 * here before `bg-neutral`: a door keeps the lighter grey it was drawn with
 * (ADR-0234), the modules' panel takes one step past the page (ADR-0244).
 * The surface resets it, so a tray inside a tray does not inherit it.
 *
 * **Open at the bottom** (`bleed="bottom"`, ADR-0234): a block that runs to the
 * page's lower edge — top corners only, no hairline and no padding at the
 * bottom, and the white surface open there too; the tray takes the height it is
 * given and its surface the rest, so what it holds scrolls under the edge.
 *
 * **A foot** (`#footer`, ADR-0234): `Dialog`'s side foot on the white surface —
 * an inset hairline, the action under it at full width. The content above it
 * scrolls in the package's `Scrollbar` and fades out over 64px while there is
 * more below, toward the surface's ground (`--surface-ground`, never a literal
 * `bg-default`).
 *
 * **It carries its block's title** (ADR-0205, track T1): with `title`, the
 * grey ground holds a line **above the white surface** — the title (`heading-sm`,
 * `text-strong`, an `h2` by default) at the start, `#action` (« Voir tout ») at
 * the end — and the tray becomes a `<section>` named by it, a region. The grey
 * holds the title, the white the content: the block reads as one group. The
 * line is `spacing-xs` above, `spacing-md` at the sides and below, so the title
 * stands on the surface's inner edge. Without `title`, the tray is unchanged.
 *
 * **One placeholder tone** (ADR-0200): a `Skeleton` on the tray takes its
 * default tone, the one solved against `bg-default` — the tray's surface. So
 * the tray hands nothing down for it: what it asks of its content is to leave
 * the tone alone (no `surface="tinted"`, no `emphasis="strong"`).
 */
interface Props {
  /** The block's title, in the grey above the surface; it names the region. */
  title?: string
  /** The title's level — `h2` on a page's home, `h3` under a section. */
  headingLevel?: 2 | 3 | 4
  /**
   * `false`: the tray is its ground and frame alone, and what it holds draws its
   * own white surface — a surface that scrolls, as `ModulesList`'s drawer does
   * (ADR-0212). One frame for both, so they cannot drift apart again.
   */
  surface?: boolean
  /** A badge after the title — a count (« 19 »), a state (« Prêt »). Needs `title`. */
  badge?: string
  badgeTone?: BadgeTone
  /** `bottom`: the tray runs to the page's lower edge, open there (ADR-0234). */
  bleed?: 'bottom'
}

withDefaults(defineProps<Props>(), {
  title: undefined,
  headingLevel: 2,
  surface: true,
  badge: undefined,
  badgeTone: 'neutral',
  bleed: undefined,
})

defineSlots<{
  /** What the block holds, laid on the white surface. */
  default?: () => unknown
  /** At the end of the title's line — « Voir tout », a `Button variant="link" size="sm"`. */
  action?: () => unknown
  /** The block's action, under an inset hairline at the surface's foot — one `Button`, full width. */
  footer?: () => unknown
}>()

const titleId = `ds-tray-title-${useId()}`
</script>

<template>
  <component
    :is="title ? 'section' : 'div'"
    class="ds-tray"
    :class="{ 'ds-tray--bleed-bottom': bleed === 'bottom' }"
    :aria-labelledby="title ? titleId : undefined"
  >
    <div v-if="title" class="ds-tray__head">
      <div class="ds-tray__name">
        <component :is="`h${headingLevel}`" :id="titleId" class="ds-tray__title">{{ title }}</component>
        <Badge v-if="badge" :label="badge" :tone="badgeTone" size="sm" class="ds-tray__badge" />
      </div>
      <div v-if="$slots.action" class="ds-tray__action"><slot name="action" /></div>
    </div>
    <div v-if="surface" class="ds-tray__surface" :class="{ 'ds-tray__surface--footed': $slots.footer }">
      <template v-if="$slots.footer">
        <Scrollbar shadows fade="long" class="ds-tray__body">
          <div class="ds-tray__content"><slot /></div>
        </Scrollbar>
        <div class="ds-tray__foot"><slot name="footer" /></div>
      </template>
      <slot v-else />
    </div>
    <slot v-else />
  </component>
</template>

<style scoped>
.ds-tray {
  box-sizing: border-box;
  /* A column, so what it holds can take the height it is given (a door's
     aside, ADR-0231) — the head, then the rest. */
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: var(--ds-spacing-md);
  /* A hairline round the tray (ADR-0211): its grey is lost on a white page; the
     faintest border makes the edge guessed, not a frame. */
  border: var(--ds-border-width-default) solid var(--ds-border-subtlest);
  border-radius: var(--ds-radius-surface-lg);
  /* `bg-neutral` (ADR-0234); a door keeps the lighter grey it was drawn on. */
  --surface-ground: var(--tray-ground, var(--ds-bg-neutral));
  background: var(--surface-ground);
}

/* Open at the bottom (ADR-0234): it runs to the page's edge — top corners only,
   no hairline and no padding there; its surface takes what the head leaves. */
.ds-tray--bleed-bottom {
  height: 100%;
  min-height: 0;
  padding-bottom: 0;
  border-bottom: 0;
  border-radius: var(--ds-radius-surface-lg) var(--ds-radius-surface-lg) 0 0;
}

/* The title's line, in the grey (ADR-0205): 4 above, 8 at the sides and below,
   so the title stands on the white surface's inner edge. */
.ds-tray__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--ds-spacing-md);
  padding: var(--ds-spacing-xs) var(--ds-spacing-md) var(--ds-spacing-md);
}

.ds-tray__name {
  display: flex;
  align-items: center;
  gap: var(--ds-spacing-sm);
  min-width: 0;
}

.ds-tray__badge {
  flex: none;
}

.ds-tray__title {
  min-width: 0;
  margin: 0;
  overflow: hidden;
  font: var(--ds-font-heading-sm);
  color: var(--ds-text-strong);
  white-space: nowrap;
  text-overflow: ellipsis;
}

.ds-tray__action {
  flex: none;
  display: flex;
  align-items: center;
}

.ds-tray__surface {
  box-sizing: border-box;
  padding: var(--ds-spacing-md);
  border-radius: var(--ds-radius-surface);
  --surface-ground: var(--ds-bg-default);
  background: var(--surface-ground);
  /* One step past the tray's ground (ADR-0234): at its own grey a hovered row
     read as a hole through the white. */
  --on-tray-hover: var(--ds-bg-neutral-hover);
  --on-tray-hover-strong: var(--ds-bg-neutral-strong);
  /* A tray inside this one does not inherit the container's ground. */
  --tray-ground: initial;
}

.ds-tray--bleed-bottom > .ds-tray__surface {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-height: 0;
  padding-bottom: 0;
  border-radius: var(--ds-radius-surface) var(--ds-radius-surface) 0 0;
}

/* With a foot the surface is a column: the content scrolls, the foot stays.
   The scroller runs to the surface's edges so its bar and fades do; the
   content keeps the padding. */
.ds-tray__surface--footed {
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding: 0;
}

.ds-tray__body {
  flex: 1 1 auto;
}

.ds-tray__content {
  box-sizing: border-box;
  padding: var(--ds-spacing-md);
}

/* `Dialog`'s side foot (ADR-0079): the hairline inset to the content's edges,
   a drawn line so its pixel is added above; the action under it, full width. */
.ds-tray__foot {
  position: relative;
  flex: none;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: var(--ds-spacing-sm);
  padding:
    calc(var(--ds-spacing-lg) + var(--ds-border-width-default)) var(--ds-spacing-md)
    var(--ds-spacing-lg);
}

.ds-tray__foot::before {
  content: '';
  position: absolute;
  top: 0;
  right: var(--ds-spacing-md);
  left: var(--ds-spacing-md);
  height: var(--ds-border-width-default);
  background: var(--ds-border-subtle);
}
</style>
