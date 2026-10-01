<script setup lang="ts">
import { computed, ref } from 'vue'
import { Dropdown, DropdownTrigger, DropdownItem } from '../Dropdown'
import { Avatar } from '../Avatar'
import { Icon } from '../Icon'

/**
 * The workspace the user is currently in, and the switch to another one.
 *
 * It composes rather than draws: `Dropdown` for the panel and the dismissal
 * behaviour, `DropdownTrigger` for the control, `Avatar` for the mark, `DropdownItem`
 * for the rows. ADR-0001 — every one of those existed, and the Figma component
 * had re-drawn the box by hand, losing `elevation-control` and landing on
 * `8px 12px 8px 8px`, which is off the control-padding scale entirely.
 *
 * The trigger is `chrome="surface"`: **a raised white pill at rest**, a
 * `border-default` contour and promoted ink under the pointer, and the same
 * contour in `border-brand` while the panel is out. It lives in
 * the navigation column, where the catalogue's bordered box reads as a foreign
 * control dropped into the ground — so the switcher diverges from `Dropdown`
 * deliberately, and the divergence is expressed as a named chrome on
 * `DropdownTrigger` rather than a box rebuilt here.
 *
 * It used to be `quiet` — nothing at rest. The switcher was then the one element
 * of the column with no boundary at all, and a control nobody can see is a
 * control nobody finds. Moving the surface to the resting state costs the
 * escalation its fill axis, which is why the states are ink and contour rather
 * than three tints; the reasoning lives on the chrome, in `DropdownTrigger`.
 *
 * `size="sm"` (8/12), and the mark is `Avatar` `sm` — **32px**, so the control
 * measures 8 + 32 + 8 = **48px**.
 *
 * It used to be 24px, which made the height 40 and let `sm` with a mark and
 * `md` with a 20px line box land on the same number from two directions. That
 * coincidence is gone, deliberately: the mark was drawn up, and a control's
 * height follows what it carries. The scale still names the *padding*, which is
 * all it ever named — `control-padding-*`'s descriptions assume a 20px line box
 * and omit the border, which is why every bordered control in the catalogue is
 * 2px taller than its token says (`Button` measures 42). This one has neither
 * the line box nor the border.
 *
 * There is no size token to reach for, and that is settled rather than missing:
 * ADR-0020 kept icon sizes out of the token set because a size is **a typed
 * component API**, and `AvatarSize` is the same shape. `size="sm"` is the
 * handle; the pixels live in `Avatar`'s own table, under a named suppression.
 *
 * Product vocabulary in the design system on purpose. A workspace switcher is
 * as specific as `ModuleCapsule`, and the argument that carried there carries
 * here: the product has one of these, it is built entirely from catalogue
 * pieces, and leaving it out means it gets rebuilt by hand — which is the
 * failure this component exists to record.
 */
export interface Workspace {
  id:        string
  name:      string
  /** Falls back to the first two letters of `name`. */
  initials?: string
  src?:      string
}

interface Props {
  /** The current workspace's `id`. */
  modelValue?: string
  /**
   * Icon-only rail: the mark in a square box, on the rail's own row.
   *
   * Not a narrower `DropdownTrigger` — its padding comes off the control scale,
   * and the 2px this box leaves around a 32px mark is not on any scale. It is a
   * remainder, not a value, so the box is written as the row and the mark is
   * centred in it.
   *
   * It used to be the bare mark, on a survey of four icon-only rails (Weavy,
   * Midday, Aboard, Shop) that all drop the chrome. The box comes back because
   * the expanded form now has one at rest: a switcher that is a surface when the
   * column is open and nothing when it is closed is two controls, not one.
   */
  collapsed?:  boolean
  workspaces?: Workspace[]
  /** Accessible name for the trigger, which otherwise announces only the name. */
  ariaLabel?:  string
  disabled?:   boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: undefined,
  collapsed:  false,
  workspaces: () => [],
  ariaLabel:  'Changer d’espace de travail',
  disabled:   false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const open = ref(false)

const current = computed(
  () => props.workspaces.find((w) => w.id === props.modelValue) ?? props.workspaces[0]
)

/**
 * First letter of each of the first two *significant* words. Words of two
 * characters or fewer are particles — "Coopérative de Kaolack" is CK, not CD,
 * and slicing the first two characters would have given Co.
 *
 * A heuristic, which is why `initials` exists to override it.
 */
function marks(w: Workspace) {
  if (w.initials) return w.initials
  const words = w.name.split(/[\s—–-]+/).filter((x) => /\p{L}/u.test(x))
  const strong = words.filter((x) => x.length > 2)
  return (strong.length ? strong : words)
    .slice(0, 2)
    .map((x) => x[0])
    .join('')
    .toUpperCase()
}

function select(w: Workspace) {
  emit('update:modelValue', w.id)
  open.value = false
}
</script>

<template>
  <Dropdown
    v-model:open="open"
    class="ds-workspace-selector"
    :class="{ 'ds-workspace-selector--collapsed': collapsed }"
  >
    <template #trigger>
      <!--
        **One element in both forms.** It used to be a `v-if` pair — a bare
        `<button>` collapsed, a `DropdownTrigger` expanded — and two elements
        cannot travel between two places: the restack moved the mark 44px with
        nothing to carry it, so the collapse cut where it should have moved.

        It also wrote the contour ladder twice. One element means one ladder,
        and the collapsed form now inherits every state from the chrome instead
        of restating four of them.

        The chevron comes out of `DropdownTrigger`'s own prop and into the slot,
        because it has to *collapse* rather than disappear — and the box owns
        the chrome while the slot owns the content (ADR-0036).
      -->
      <DropdownTrigger
        size="sm"
        chrome="surface"
        :open="open"
        :disabled="disabled"
        :aria-label="current ? `${ariaLabel} — ${current.name}` : ariaLabel"
        class="ds-workspace-selector__trigger"
        @click="open = !open"
      >
        <Avatar
          v-if="current"
          size="sm"
          :src="current.src"
          :initials="marks(current)"
          :alt="current.name"
        />
        <!-- ADR-0025's `1fr -> 0fr`, the same track `SideNavItem`'s label runs:
             `width: auto` is not animatable, and a `v-if` has nothing to animate
             at all. The name and the chevron share one track because they leave
             together — what the rail keeps is the mark alone. -->
        <span class="ds-workspace-selector__track">
          <span class="ds-workspace-selector__row">
            <span class="ds-workspace-selector__name">{{ current?.name }}</span>
            <Icon
              :name="open ? 'chevron-up' : 'chevron-down'"
              :size="20"
              class="ds-workspace-selector__chevron"
              aria-hidden="true"
            />
          </span>
        </span>
      </DropdownTrigger>
    </template>

    <!--
      The menu's own row, for the choices as for the footer's actions — one
      kind of row per panel, so one edge for every label (ADR-0050). Each is a
      **choice** (`selected` given: `menuitemradio`), and the current one is
      marked the way every list in the catalogue marks it: its ground, that
      ground's ink, the strong weight. Nothing in the list used to say where the
      user was.

      The avatar is the trigger's mark, a size down (`xs`, the catalogue's row
      avatar): the list names each workspace the way the trigger names the
      current one.
    -->
    <DropdownItem
      v-for="w in workspaces"
      :key="w.id"
      :label="w.name"
      :avatar-src="w.src"
      :avatar-initials="marks(w)"
      :selected="w.id === current?.id"
      @click="select(w)"
    />

    <!--
      Actions on the workspaces themselves — « Créer une organisation » — in
      the panel's footer, under a rule and outside the scroll: they concern the
      list, not one of its rows. The product fills it with `DropdownItem`s and
      closes the panel through `close`, as `select` does for a row; the switcher
      cannot know where an action leads.
    -->
    <template v-if="$slots.actions" #footer>
      <slot name="actions" :close="() => (open = false)" />
    </template>
  </Dropdown>
</template>

<style scoped>
.ds-workspace-selector,
.ds-workspace-selector__trigger {
  width: 100%;
}

/* Declared rather than left to the padding, so the collapse has two lengths to
   travel between. `SideNavigation` supplies both rows; standalone the fallback
   is the same number the padding would have produced. */
.ds-workspace-selector__trigger {
  height: var(--side-nav-header-row, 48px);
}

/* ── Collapsed ────────────────────────────────────────────────────── */
/* `width: 100%` in **both** forms, which the rule above already gives. It used
   to drop to `auto` here, for the bare button that no longer exists — and that
   one word broke the chain the stretched header feeds: the wrapper shrank to
   its content (33px) and the trigger took 100% of *that*, so the rail's 36px
   row never reached the box. Measured 33×36 before it was removed. */

/*
  Collapsed, the trigger is **squared onto the rail's row** rather than replaced.

  **36px, and the 2px around the 32px mark is never written down.** The box is
  `--side-nav-rail-row` and the mark is `Avatar sm`; centring one in the other
  leaves the padding as a remainder, which is how ADR-0034 derived the rail from
  the row rather than asserting it. Figma drew this box at 40 (mark + spacing-xs
  each side) — 4px wider than every row in the column, and the selector would
  have been the one thing in the rail wider than the rail is built on.

  Two classes, so the rule outweighs `DropdownTrigger`'s own padding: both
  carry a scope attribute, and at equal specificity the winner would be decided
  by which file the bundler emitted last.
*/
.ds-workspace-selector--collapsed .ds-workspace-selector__trigger {
  /*
    The box is **declared**, not inherited from a parent that may not be there.
    It was briefly left to `width: 100%` on the theory that the collapsed
    header's `stretch` would supply the 36 — which it does, and only there: the
    track keeps `flex: 1 1 auto` even with its column at `0fr`, so outside a
    `SideNavigation` the mark grew to whatever container it was dropped in
    (measured 143px in its own story). A component that only renders correctly
    inside one parent is ADR-0039's shape of defect, and the story is where it
    showed.

    It costs nothing now: the wobble this width used to cause came from
    `align-items: center` amplifying two disagreeing widths, and the header
    stretches instead.
  */
  width: var(--side-nav-rail-row, 36px);
  height: var(--side-nav-rail-row, 36px);
  padding: 0;
  gap: 0;
  justify-content: center;
}

/*
  The chrome's two transitions are restated here because CSS has no way to add
  to a `transition` list, and the three that matter are the consumer's: the box
  resizes because the *column* collapsed, which `DropdownTrigger` knows nothing
  about. `enter` + `easing-in-out` are the column's own values — one gesture
  takes one duration or it tears (ADR-0037).
*/
.ds-workspace-selector__trigger {
  transition:
    background-color var(--ds-motion-duration-quick) var(--ds-motion-easing-default),
    box-shadow       var(--ds-motion-duration-instant) var(--ds-motion-easing-default),
    width            var(--ds-motion-duration-enter) var(--ds-motion-easing-in-out),
    height           var(--ds-motion-duration-enter) var(--ds-motion-easing-in-out),
    padding          var(--ds-motion-duration-enter) var(--ds-motion-easing-in-out),
    gap              var(--ds-motion-duration-enter) var(--ds-motion-easing-in-out);
}

/* ADR-0025's grid, and ADR-0037's asymmetry: arriving, the fade waits a `quick`
   so the text lands after the box has finished widening; leaving, it goes at
   `exit` with no delay and is gone before the box closes on it. */
.ds-workspace-selector__track {
  flex: 1 1 auto;
  display: grid;
  grid-template-columns: 1fr;
  min-width: 1px;
  overflow: hidden;
  opacity: 1;
  transition:
    grid-template-columns var(--ds-motion-duration-enter) var(--ds-motion-easing-in-out),
    opacity var(--ds-motion-duration-moderate) var(--ds-motion-easing-out)
      var(--ds-motion-duration-quick);
}

.ds-workspace-selector--collapsed .ds-workspace-selector__track {
  /*
    It has to stop *growing*, not just stop showing. A collapsed column at `0fr`
    empties the track's content, but `flex: 1 1 auto` still let the element
    absorb whatever the box had spare — measured, 4px of a 36px mark, which
    pushed the avatar flush against the left edge and left the ring 0 on one
    side and 4 on the other. `justify-content: center` had nothing to centre,
    because the line was already full.

    `flex-grow: 0` rather than `flex: none`: `none` resolves the base size from
    the content, and a `1fr` column mid-transition still reports max-content —
    the track would snap to the whole name's width on the first frame.
  */
  flex-grow: 0;
  min-width: 0;
  grid-template-columns: 0fr;
  opacity: 0;
  transition:
    grid-template-columns var(--ds-motion-duration-enter) var(--ds-motion-easing-in-out),
    opacity var(--ds-motion-duration-exit) var(--ds-motion-easing-in);
}

.ds-workspace-selector__row {
  display: flex;
  align-items: center;
  gap: var(--ds-spacing-md);
  min-width: 0;
}

.ds-workspace-selector__chevron {
  flex: none;
  color: currentColor;
}

@media (prefers-reduced-motion: reduce) {
  .ds-workspace-selector__trigger,
  .ds-workspace-selector__track {
    transition: none;
  }
}

/*
  `Dropdown`'s panel is pinned to `right: 0`, which is right for a trigger
  floating in a toolbar and wrong in a column, where it hangs off the left edge.
  So it opens under the mark instead, aligned to its leading edge — 8px below,
  scaling from `top left`, all of it `Dropdown`'s own.

  Its width is `Dropdown`'s too — 240px, **never narrower than the trigger**.
  It used to *be* the trigger's width: right for the 228px box it was drawn in,
  wrong once the toggle came to share the row, where at 184px the footer's
  « Créer une organisation » was cut. One width for every panel in the
  catalogue, and a floor for the trigger that is wider than it (ADR-0050).

  Which makes the two forms **one rule**. Collapsed, 100% of a 36px mark is 36px,
  so the 240 opens and overhangs the rail — as an overlay may, and as the
  expanded panel now covers the toggle beside its trigger. The collapsed
  override, and the declaration order it depended on, are gone.

  (It once opened *beside* the rail — `left: 100%`, `top: 0` — a second placement
  and a second gesture, and so a second component to anyone using it.)
*/
.ds-workspace-selector :deep(.ds-dropdown__panel) {
  right: auto;
  left: 0;
  min-width: 100%;

  /*
    The rows' leading column is the avatars' — `Avatar xs`, 24px — so the
    footer's `+` centres in it and every label in the panel starts on one edge.
    Read by `DropdownItem`; a variant switch, not a token (ADR-0010).
  */
  --dropdown-item-leading: 24px;
}

/* The name takes the room the chevron leaves, and truncates — a workspace name
   is user-typed and has no length the design can rely on. */
.ds-workspace-selector__name {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font: var(--ds-font-label-xl);
}
</style>
