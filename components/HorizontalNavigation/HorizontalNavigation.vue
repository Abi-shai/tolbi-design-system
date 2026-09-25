<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Logo } from '../Logo'
import { Breadcrumbs } from '../Breadcrumbs'
import { Avatar } from '../Avatar'
import { CreditsChip } from '../CreditsChip'
import { Button } from '../Button'
import { IconButton } from '../IconButton'
import { Tooltip } from '../Tooltip'
import { ModulesList } from '../ModulesList'
import { ModuleIcon } from '../ModuleIcon'
import { SurfaceTransition } from '../SurfaceTransition'
import type { ModulesListItem } from '../ModulesList'
import type { ModuleName } from '../ModuleIcon'
import type { CreditsChipTone } from '../CreditsChip'
import type { BreadcrumbsItem } from '../Breadcrumbs'

/**
 * A crumb is what `Breadcrumbs` calls a crumb. `active` is gone: the current
 * segment is the **last** one, by position — a per-item flag let a trail have
 * zero or two current segments and meant nothing knew where the end was
 * (ADR-0024, the same call `ButtonGroupItem.active` got).
 */
export type BreadcrumbItem = BreadcrumbsItem

export type NavModule = ModulesListItem

interface Props {
  /**
   * Where you are. Absent is the product's home page — the bar shows the Tolbi
   * lockup; present, it shows that module's.
   *
   * It is the **single** owner of "the user is in a module". The dropdown's
   * current item is derived from it, so `ModulesListItem.active` is ignored
   * inside the bar: a per-item flag let zero or two modules be current and
   * meant nothing knew which one was (ADR-0024, the call `ButtonGroupItem`
   * and `Breadcrumbs` already took).
   *
   * The type is the coverage: `ModuleName` spells the 11 modules the system
   * has artwork for, so a module it cannot draw cannot be asked for (ADR-0041).
   */
  module?:          ModuleName
  /**
   * The module's **accessible** name. There is no visible word in the lockup —
   * the mark stands alone — so this is the only thing that names it to
   * assistive technology, and `ModuleIcon` would otherwise read back the enum
   * value. `Data` ships as `Data OS`.
   *
   * Defaults to `module`, so the common case costs nothing
   * (`Breadcrumbs.homeLabel`, same reasoning).
   */
  moduleLabel?:     string
  breadcrumbs?:     BreadcrumbItem[]
  /** Où mène la maison du fil. Avec, c'est une ancre ; sans, un bouton. */
  homeHref?:        string
  /**
   * Le mot du bouton de retour. Une chaîne appartient au produit, donc elle est
   * surchargeable — mais elle a un défaut ici, là où `Breadcrumbs` en garde un
   * autre : dans la barre la maison n'est **jamais** la page courante (plus de
   * fil à la profondeur 0), donc l'impératif y est toujours juste. Seul
   * `Breadcrumbs`, qui garde son état profondeur 0, doit rester sur un lieu.
   */
  homeLabel?:       string
  credits?:         number
  /** Expiry reminder shown in the credits chip, e.g. `Expirent dans 14 jours`. */
  creditsReminder?: string
  /** How bad the credits situation is — see `CreditsChipTone`. */
  creditsTone?: CreditsChipTone
  userInitials?:    string
  hasNotification?: boolean
  modules?:         NavModule[]
}

const props = withDefaults(defineProps<Props>(), {
  homeLabel:       'Retourner sur l\u2019accueil',
  credits:         0,
  userInitials:    'TD',
  hasNotification: false,
  modules:         () => [],
})

const emit = defineEmits<{
  /**
   * La maison du fil. **Distinct de `learn`** : elle émettait le même
   * évènement que « Apprendre », donc cliquer sur l'accueil ouvrait le centre
   * d'aide.
   */
  home:            [event: MouseEvent]
  /** Un maillon du fil a été activé — émis même sur une ancre, pour qu'un
      routeur puisse `preventDefault()` et naviguer côté client. */
  'breadcrumb-select': [item: BreadcrumbItem, event: MouseEvent]
  learn:           []
  settings:        []
  notifications:   []
  user:            []
  credits:         []
  'module-select': [module: NavModule]
}>()

const activeTooltip = ref<string | null>(null)
function showTooltip(name: string) {
  if (modulesOpen.value) return
  activeTooltip.value = name
}
function hideTooltip() { activeTooltip.value = null }

// ── Modules dropdown ───────────────────────────────────────────────
const modulesOpen    = ref(false)
const modulesWrapRef = ref<HTMLElement | null>(null)

function toggleModules() {
  modulesOpen.value = !modulesOpen.value
  if (modulesOpen.value) hideTooltip()
}

/**
 * Home is the absence of both — no module, and no path. The way back and the
 * trail are the two things that have nothing to say there, so they share one
 * condition and one entrance.
 */
const atHome = computed(() => !props.module && !props.breadcrumbs?.length)

/**
 * The dropdown's current item, derived — never declared. `module` is the one
 * place the bar says where you are, and the switcher reads it back (ADR-0024).
 */
const modulesWithCurrent = computed<NavModule[]>(() =>
  props.modules.map(mod => ({ ...mod, active: mod.name === props.module })),
)

function selectModule(mod: NavModule) {
  if (mod.disabled) return
  emit('module-select', mod)
  modulesOpen.value = false
}

function onDocClick(e: MouseEvent) {
  if (modulesWrapRef.value && !modulesWrapRef.value.contains(e.target as Node)) {
    modulesOpen.value = false
  }
}

onMounted(() => document.addEventListener('mousedown', onDocClick))
onUnmounted(() => document.removeEventListener('mousedown', onDocClick))
</script>

<template>
  <header class="ds-hnav">

    <!-- ── Gauche : logo + breadcrumbs ────────────────────────────────── -->
    <div class="ds-hnav__left">
      <!--
        ── The identity block ────────────────────────────────────────────
        Where you are, and the way out of it — one unit, `spacing-lg` apart.
        The trail is a **separate** block `spacing-4xl` away, and it shows the
        path *inside* the module rather than from the top: the module is the
        mark on its left, not a crumb.
      -->
      <div class="ds-hnav__identity-block">

        <!--
          One slot, two forms: the Tolbi lockup at home, the module's mark
          inside a module. `module` is the only thing that decides which.

          The two share one grid cell (ADR-0027's `grid-area: 1 / 1`) so the
          slot is never empty mid-swap — and here that is structural rather
          than prudent: they roll past each other, so both have to be in the
          slot at once. `mode="out-in"` would make it two movements.
        -->
        <div class="ds-hnav__identity">
          <Transition name="ds-hnav-identity">
            <!--
              The module's mark, and nothing else. The trail beside it no
              longer names the module either — the mark is the name.

              Which moves the accessible name **onto the mark** — ADR-0041's
              rule with the opposite input. There, visible text beside the
              artwork made `aria-label` noise; here nothing in the slot names
              the module, so the artwork has to. `moduleLabel` undefined falls
              through to `ModuleIcon`'s own default, which is the module's name.

              `illustration`, the primitive: the two forms alternate in one
              slot, so they have to be the same kind of object, and the Tolbi
              mark is untiled artwork. The bar has no ground of its own to hand
              it either (ADR-0028).
            -->
            <div v-if="module" :key="module" class="ds-hnav__lockup">
              <ModuleIcon
                :module="module"
                variant="illustration"
                size="var(--hnav-mark)"
                :aria-label="moduleLabel"
              />
            </div>

            <!--
              The coloured lockup, inside a plain wrapper — and the wrapper is
              load-bearing.

              `<Logo>` as the direct child of the `<Transition>` fades **in** and
              is **cut** on the way out. Bisected: `Logo`'s own root is a
              `v-if`/`v-else` pair, and only the `v-if` branch carries the leave
              hooks — `variant="nav"` (the `v-if`) leaves correctly, `default`
              (the `v-else`) never gets a `-leave-*` class at all. The failure is
              asymmetric in *both* senses, which is what hides it: one variant of
              one component, in one direction of the swap.

              So the `<Transition>` gets plain elements on both branches —
              `RevealTransition` renders its own element for the same class of
              reason (ADR-0032).

              `24`, two rungs **below** the module mark beside it — see
              `--hnav-mark` for why the two differ, and ADR-0043 for the
              measurement behind it.
            -->
            <div v-else key="tolbi" class="ds-hnav__lockup">
              <Logo variant="default" :size="24" alt="Tolbi" />
            </div>
          </Transition>
        </div>

        <!--
          The way back. A real `Button` rather than a crumb (ADR-0001): it left
          the trail, so it stopped being a node in a path and became an action
          beside the identity — and it is drawn as one.

          `secondary-gray`, not the `ghost` chrome the crumb had: a ghost is
          *nothing at rest* and only answers a pointer that has already found
          it, which is the wrong contract for the single way out of a module.
          A declared box also bounds the block, so the 12px gap reads as binding
          two objects rather than as loose space beside the mark.

          `href` makes it an `<a>`, the rule ADR-0014 set and `Breadcrumbs`
          already followed.

          `sm` is the **smallest size the catalogue has**, and it is taken as it
          comes: `label-lg-strong` and `control-padding-sm`, no local override.
          A component that is 90% the real one is the defect ADR-0001 exists to
          stop, and a font declared here would be exactly that.
        -->
        <Transition name="ds-hnav-away">
          <Button
            v-if="!atHome"
            class="ds-hnav__home"
            data-hnav-home
            variant="secondary-gray"
            size="sm"
            iconLeading="house"
            :label="homeLabel"
            :href="homeHref"
            @click="emit('home', $event)"
          />
        </Transition>
      </div>

      <!--
        The catalogue's Breadcrumbs, not a second drawing of it (ADR-0001) —
        **without its house**, and not at depth 0.

        The house moved into the identity block, so the trail is now exactly
        what its name says: the path from this module to this page. It no longer
        starts at the top of the product, because the mark on its left is where
        it starts.

        Its visibility is the **trail being empty**, not `module` being absent —
        a page outside any module still has a path worth showing, and the two
        props stay independent.

        No wrapper here, unlike `<Logo>` above: `Breadcrumbs`' root is a single
        unconditional `<nav>`, which is the case that transitions correctly.
      -->
      <Transition name="ds-hnav-away">
        <Breadcrumbs
          v-if="breadcrumbs?.length"
          class="ds-hnav__trail"
          :items="breadcrumbs"
          :home="false"
          @select="(item, event) => emit('breadcrumb-select', item, event)"
        />
      </Transition>
    </div>

    <!-- ── Droite : crédits + actions + avatar ────────────────────────── -->
    <div class="ds-hnav__right">

      <!-- Crédits -->
      <CreditsChip
        :credits="credits"
        :reminder="creditsReminder"
        :tone="creditsTone"
        @click="emit('credits')"
      />

      <!-- Actions -->
      <div class="ds-hnav__actions">

        <!-- The real Button, not a re-implementation (ADR-0001). `lg-compact`
             is the 36px control the bar needs; `lg` at 44px does not fit. -->
        <Button
          label="Apprendre"
          variant="secondary-gray"
          size="lg-compact"
          @click="emit('learn')"
        />

        <!-- Paramètres -->
        <div
          class="ds-hnav__tip-wrap"
          @mouseenter="showTooltip('settings')"
          @mouseleave="hideTooltip"
        >
          <IconButton icon="settings" ariaLabel="Paramètres" @click="emit('settings')" />
          <Tooltip
            v-if="activeTooltip === 'settings'"
            class="ds-hnav__tip"
            title="Paramètres"
            arrow="top-center"
          />
        </div>

        <!-- Notifications -->
        <div
          class="ds-hnav__tip-wrap"
          @mouseenter="showTooltip('notifications')"
          @mouseleave="hideTooltip"
        >
          <IconButton icon="bell" ariaLabel="Notifications" @click="emit('notifications')" />
          <span v-if="hasNotification" class="ds-hnav__notif-dot" aria-hidden="true" />
          <Tooltip
            v-if="activeTooltip === 'notifications'"
            class="ds-hnav__tip"
            title="Notifications"
            arrow="top-center"
          />
        </div>

        <!-- Modules -->
        <div
          ref="modulesWrapRef"
          class="ds-hnav__tip-wrap"
          @mouseenter="showTooltip('apps')"
          @mouseleave="hideTooltip"
        >
          <IconButton
            icon="layout-grid"
            ariaLabel="Modules"
            :active="modulesOpen"
            :aria-expanded="modulesOpen"
            aria-haspopup="true"
            @click="toggleModules"
          />

          <Tooltip
            v-if="activeTooltip === 'apps' && !modulesOpen"
            class="ds-hnav__tip"
            title="Modules"
            arrow="top-center"
          />

          <!-- Dropdown modules — a floating surface, so it takes the house entrance (ADR-0021) -->
          <SurfaceTransition>
            <ModulesList
              v-if="modulesOpen && modules.length"
              class="ds-hnav__modules-dropdown"
              :modules="modulesWithCurrent"
              @select="selectModule"
            />
          </SurfaceTransition>
        </div>
      </div>

      <!-- Avatar utilisateur -->
      <button class="ds-hnav__user" @click="emit('user')" :aria-label="`Profil ${userInitials}`">
        <Avatar size="md" :initials="userInitials" />
      </button>
    </div>
  </header>
</template>

<style scoped>
/* ── Shell ────────────────────────────────────────────────────────── */
.ds-hnav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  box-sizing: border-box;
  /*
    No ground and no rule, deliberately: the bar takes whatever surface sits
    behind it. The Figma frame carries no fill for the same reason — that is a
    decision, not an omission.
  */
  padding: var(--ds-spacing-lg) var(--ds-spacing-xl);
  overflow: visible;
}

/* ── Gauche ───────────────────────────────────────────────────────── */
.ds-hnav__left {
  display: flex;
  align-items: center;
  /* 32px between the lockup and the trail, at every depth — Figma's `left`
     frame carries the same gap in all four views. */
  gap: var(--ds-spacing-4xl);
}

/*
  ── The identity block ────────────────────────────────────────────────
  Where you are, and the way out of it. `spacing-lg` (12px) between the two —
  closer than the `spacing-4xl` (32px) that separates the block from the trail,
  because they are one statement and the trail is another.
*/
.ds-hnav__identity-block {
  display: flex;
  align-items: center;
  gap: var(--ds-spacing-lg);
}

/* ── L'identité : la marque, ou le module ─────────────────────────── */
/*
  One slot, two forms. Both sit in the same grid cell, so the slot is never
  empty during the swap and the trail beside it moves once, not twice.
*/
.ds-hnav__identity {
  /*
    The mark's box — and the slot's floor, read twice from one value so the two
    can never disagree (ADR-0041's `--project-card-mark`, ADR-0034's
    `--side-nav-rail-row`). A variant switch, not a token (ADR-0010).

    The module mark's box — and the slot's floor, which is why it is read twice.

    **48, two rungs above the 24 the Tolbi lockup takes.** Not an inconsistency:
    ADR-0043 measured that the ladder equalises the *box* and not the *ink* —
    the eleven drawings sit inside their 48-grid with their own margins, and
    those margins are not constant (ink 8.53 → 41.8 of 48), where the Tolbi mark
    fills its box edge to edge. At equal rungs the module reads smaller than the
    brand.

    48 is also the artwork's **native** grid: it is the only rung that is not a
    downscale at all, so it is where the drawings are sharpest.

    What it costs is the bar's height. 48 is the one thing here taller than the
    40px avatar, so the bar is **72px** rather than ADR-0028's 64 — on every
    page, including pages with no module, because the slot's floor is 48 in both
    forms. That is deliberate: a bar that changed height on navigation would be
    the real defect.
  */
  --hnav-mark: 48px;

  /*
    The floor is load-bearing: the Tolbi lockup is 24 tall and the module mark
    48, so without it the bar's left column would follow whichever identity is
    mounted and the bar would change height on navigation. One value, read
    twice, so the two can never disagree.

    It is also the **window** the identity rolls through — see the swap below.
    `overflow: hidden` clips the travel to exactly this box, which is why the
    floor and the distance travelled are the same number by construction.
  */
  position: relative;
  display: grid;
  min-height: var(--hnav-mark);
  overflow: hidden;
}

.ds-hnav__lockup {
  /* ADR-0027's trick: one cell, two occupants, no stacking and no jump. */
  grid-area: 1 / 1;
  align-self: stretch;
  display: flex;
  align-items: center;
}

/*
  ── The swap ──────────────────────────────────────────────────────────

  The identity **rolls**. The outgoing one travels up and out of the slot, the
  incoming one arrives from below and settles — a departure board, not a
  dissolve. The slot is the window: `overflow: hidden` is what makes "out of
  view" mean anything, and it is why the travel is `100%` of the *slot* rather
  than of the mark (the Tolbi lockup is 24 tall in a 48 slot, so its own height
  would leave half of it showing).

  Always the same direction, both ways. Up-and-out / in-from-below is an
  **odometer**: a value changing in place. Reversing it for "going back" would
  make it a *place* changing, which is a claim about hierarchy the bar does not
  have — a module is not below the home page.

  `enter` (200ms) and `easing-in-out`, **the same on both halves**. The easing is
  not a preference: its description names exactly this — *"spatial: a thing that
  travels, rather than a state that changes"*. And the two halves share one
  duration because they are mechanically one movement, the way ADR-0037's column
  and the indicator inside it had to share one: two durations on one gesture
  tear. That is also why ADR-0021's "the exit is faster than the entrance" does
  not apply — it governs a floating surface getting out of your way, not a strip
  whose halves are coupled.

  No fade. Movement has to explain something (ADR-0023) and this movement says
  *it left, the next one arrived*; cross-fading at the same time would say
  *it dissolved*, which is a second and contradictory story. It is also what
  distinguishes this from the catalogue's four transitions — `SwapTransition`
  cross-fades in place because a skeleton and its content occupy one position;
  an identity is a sequence, and a sequence has a direction.

  Private to this component, not a fifth entry in the catalogue: one consumer is
  not a pattern (`useMarquee`, ADR-0032). Scoped CSS works here, unlike in the
  four transition components — Vue puts the classes on the slotted element, and
  these two elements are declared in *this* file, so they carry this file's
  scope id (ADR-0021's caveat, inverted).
*/
.ds-hnav-identity-enter-active,
.ds-hnav-identity-leave-active {
  transition: transform var(--ds-motion-duration-enter) var(--ds-motion-easing-in-out);
}

/* Arrives from below. */
.ds-hnav-identity-enter-from {
  transform: translateY(100%);
}

/* Leaves through the top. */
.ds-hnav-identity-leave-to {
  transform: translateY(-100%);
}

/*
  The identity still swaps, instantly, and the transform is reset with the
  transition — otherwise the incoming form would be parked one slot-height below
  and snap. Cutting the travel hides nothing (ADR-0033), unlike ADR-0032's
  marquee where stopping the loop would have hidden content.
*/
@media (prefers-reduced-motion: reduce) {
  .ds-hnav-identity-enter-active,
  .ds-hnav-identity-leave-active {
    transition: none;
  }

  .ds-hnav-identity-enter-from,
  .ds-hnav-identity-leave-to {
    transform: none;
  }
}

/*
  ── What arrives once you have left home ──────────────────────────────

  Two elements, one entrance: the **way back** and the **trail**. Neither exists
  on the home page, so they share a condition and they share a beat.

  The **second** movement, and it waits for the first. The identity's roll ends
  with the slot narrowing from the Tolbi lockup's width to the mark's, which
  moves the trail — so a trail fading in *during* the roll would arrive at one
  position and be shunted to another. Delayed by one `enter`, it fades in where
  it is going to stay.

  That offset is ADR-0032's, and so is the delay itself: *a delay is a duration
  in another slot*, which is why that ADR declined to mint a delay token and why
  this one reads `--ds-motion-duration-enter` twice.

  Asymmetric on purpose. Nothing waits to leave — on the way out the trail fades
  immediately, and the roll runs underneath it.

  A fade, not a roll: the trail is not in the window, and it has no "left /
  arrived" story to tell. It is there, or the page has no path.
*/
.ds-hnav-away-enter-active {
  transition: opacity var(--ds-motion-duration-enter) var(--ds-motion-easing-in-out)
              var(--ds-motion-duration-enter);
}

.ds-hnav-away-leave-active {
  transition: opacity var(--ds-motion-duration-enter) var(--ds-motion-easing-in-out);
}

.ds-hnav-away-enter-from,
.ds-hnav-away-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .ds-hnav-trail-enter-active,
  .ds-hnav-away-leave-active {
    transition: none;
  }
}

/* ── Droite ───────────────────────────────────────────────────────── */
.ds-hnav__right {
  display: flex;
  align-items: center;
  gap: var(--ds-spacing-xl);
  overflow: visible;
}

/* ── Actions ──────────────────────────────────────────────────────── */
.ds-hnav__actions {
  display: flex;
  align-items: center;
  gap: var(--ds-spacing-md);
  overflow: visible;
}

/* ── Wrapper tooltip / dropdown ───────────────────────────────────── */
.ds-hnav__tip-wrap {
  position: relative;
  display: inline-flex;
  overflow: visible;
}

.ds-hnav__tip {
  position: absolute;
  top: calc(100% + var(--ds-spacing-sm));
  left: 50%;
  transform: translateX(-50%);
  z-index: var(--ds-z-popover);
  white-space: nowrap;
}

/* ── Notifications ────────────────────────────────────────────────── */
/*
  The dot sits on the tooltip wrapper rather than inside the button: the
  wrapper shrink-wraps IconButton, so it is the same 36px box, and IconButton
  takes a glyph rather than a slot (its Figma counterpart is an instance swap).
*/
.ds-hnav__notif-dot {
  /*
    Positional geometry, not rhythm: these place a 6px dot over the bell's
    glyph inside a 36px target. There is no token for either — ADR-0020 keeps
    glyph sizes out of the scales deliberately.
  */
  position: absolute;
  top: 18px;
  left: 22px;
  width: 6px;
  height: 6px;
  border-radius: var(--ds-radius-pill);
  background: var(--ds-bg-error-solid);
  /* The ring punches the dot out of whatever the bar is painted with. */
  border: var(--ds-border-width-strong) solid var(--ds-bg-default);
}

/* ── Avatar utilisateur ───────────────────────────────────────────── */
.ds-hnav__user {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  border-radius: var(--ds-radius-pill);
  flex-shrink: 0;
}

/* ── Dropdown modules : positionnement uniquement ─────────────────── */
.ds-hnav__modules-dropdown {
  position: absolute;
  top: calc(100% + var(--ds-spacing-md));
  right: 0;
  /*
    A popover, not an overlay. ADR-0020 puts z-overlay (200) above a scrim; this
    panel is a dropdown anchored to its button, which is what z-popover (100) is
    for — and what the other three floating panels in the catalogue use.
  */
  z-index: var(--ds-z-popover);
  /* The elevation is ModulesList's own now — the bar places the panel, it does
     not dress it. */
  /* The anchor is the button above-right of the panel (ADR-0021: the surface grows from it). */
  transform-origin: top right;
}
</style>
