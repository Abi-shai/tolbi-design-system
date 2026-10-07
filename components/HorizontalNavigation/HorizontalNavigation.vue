<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
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
import { Dropdown } from '../Dropdown'
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

/**
 * The glyph on the way out, which says **what kind** of way out it is: a place
 * (`house` — the home page) or a return (`arrow-left` — the page the user left
 * to come here). Two meanings, so two glyphs, and a glyph that says neither is
 * unwritable — the type is the coverage (ADR-0041).
 */
export type HorizontalNavigationHomeIcon = 'house' | 'arrow-left'

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
  /**
   * Whether the bar shows an identity at all. `false` is a space that is
   * neither a module nor the home page — Paramètres, where the app's column
   * gives way to the settings' own: there is nothing for the slot to say, so
   * the slot closes and **the way out opens the bar**.
   *
   * Named after the thing it removes, like `Breadcrumbs.home` and
   * `SideNavigation.toggle` (ADR-0034). A boolean rather than a third value
   * beside `module`: `module` already decides *which* mark, and a second prop
   * that could also say "module" would be ADR-0024's two owners again.
   *
   * Without an identity the bar is never at home, so the way out is always
   * there — it is the only thing left that says where the user can go.
   */
  lockup?:          boolean
  breadcrumbs?:     BreadcrumbItem[]
  /**
   * Où mène le bouton de retour — l'accueil, ou la page quittée dans
   * Paramètres. Avec, c'est une ancre ; sans, un bouton.
   */
  homeHref?:        string
  /**
   * Le mot du bouton de retour. Une chaîne appartient au produit, donc elle est
   * surchargeable — mais elle a un défaut ici, là où `Breadcrumbs` en garde un
   * autre : dans la barre la maison n'est **jamais** la page courante (plus de
   * fil à la profondeur 0), donc l'impératif y est toujours juste. Seul
   * `Breadcrumbs`, qui garde son état profondeur 0, doit rester sur un lieu.
   */
  homeLabel?:       string
  /**
   * Le glyphe du bouton de retour — `house` quand il mène à l'accueil,
   * `arrow-left` quand il ramène à la page quittée (Paramètres). Le mot et le
   * glyphe suivent le même raisonnement : c'est le produit qui sait où mène la
   * sortie, donc les deux sont à lui. Défaut `house`, ce qu'ADR-0042 a posé.
   *
   * Deux valeurs et pas tout `IconName` : la sortie a deux sens, un lieu ou un
   * retour, et un glyphe qui ne dit ni l'un ni l'autre ne doit pas s'écrire.
   */
  homeIcon?:        HorizontalNavigationHomeIcon
  /**
   * The module's balance. **The chip belongs to the module** (ADR-0054): each
   * module has its own credits, spent nowhere else, so the chip shows only in a
   * module — never at home (no `module`), never in Paramètres (`lockup: false`),
   * whatever is passed. `module` stays the single owner of "the user is in a
   * module" (ADR-0024), and the chip reads it rather than asking the product to
   * repeat it.
   *
   * - **absent** — this module has no credits: no chip;
   * - **`null`** — it has a balance that has not arrived: the chip comes in with
   *   the module's mark and a placeholder holds the number, which rolls in when
   *   it lands. Never `0` for want of data;
   * - **a number** — the balance. `0` is a balance, not an absence.
   */
  credits?:         number | null
  /** Expiry reminder shown in the credits chip, e.g. `Expirent dans 14 jours`. */
  creditsReminder?: string
  /** How bad the credits situation is — see `CreditsChipTone`. */
  creditsTone?: CreditsChipTone
  userInitials?:    string
  /**
   * The account menu's header — who is signed in. Read only when the product
   * fills `#user-menu`: without a menu there is no header to put them in.
   */
  userName?:        string
  userEmail?:       string
  hasNotification?: boolean
  modules?:         NavModule[]
}

const props = withDefaults(defineProps<Props>(), {
  lockup:          true,
  homeLabel:       'Retourner sur l\u2019accueil',
  homeIcon:        'house',
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
  /**
   * L'avatar a été cliqué — **sans** `#user-menu`. Avec un menu, le clic
   * l'ouvre et n'émet rien : un clic, un sens. Un produit qui écoutait `user`
   * pour mener à Paramètres et fournissait le menu aurait fait les deux à la fois.
   */
  user:            []
  credits:         []
  'module-select': [module: NavModule]
}>()

const activeTooltip = ref<string | null>(null)
function showTooltip(name: string) {
  // An open panel covers the tooltips' row: the account menu is 240px wide and
  // hangs over the four controls before the avatar.
  if (modulesOpen.value || userMenuOpen.value) return
  activeTooltip.value = name
}
function hideTooltip() { activeTooltip.value = null }

// ── Account menu ───────────────────────────────────────────────────
const userMenuOpen = ref(false)

/* The avatar's name, in both forms: the person when the product says who it is. */
const userLabel = computed(() => `Profil ${props.userName ?? props.userInitials}`)

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
 *
 * And it is the Tolbi lockup standing alone, so a bar with no identity is never
 * home: without it, the way out is the first thing in the bar and the only one
 * that says where the user can go.
 */
const atHome = computed(() => props.lockup && !props.module && !props.breadcrumbs?.length)

/**
 * The identity slot is **opening** — the bar had no identity a moment ago and
 * has one now (Paramètres → the app).
 *
 * The incoming mark then waits one `enter` before it rolls in, because the slot
 * it lands in is not free yet: the way out is still standing there, fading. The
 * slot opens in the gap between the two beats, unseen, and the mark arrives with
 * everything else in the second. Every other arrival rolls at once — module to
 * module, or past the Tolbi lockup leaving the same window.
 *
 * Set before the render that mounts the mark (a `pre` watcher), cleared once it
 * has settled.
 */
const opening = ref(false)
watch(() => props.lockup, (now, before) => { opening.value = now && !before })

/**
 * The chip is the module's (ADR-0054): it needs a module, an identity slot that
 * is open, and a balance — or one on its way (`null`). Read off `module` and
 * `lockup`, never declared beside them.
 */
const creditsShown = computed(() => props.lockup && !!props.module && props.credits !== undefined)

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
  <header class="ds-hnav" :class="{ 'ds-hnav--opening': opening }">

    <!-- ── Gauche : l'identité, puis la sortie et le fil ─────────────────── -->
    <!--
      Two statements, said by the gaps: *where you are and how to leave* (the
      mark, `spacing-lg`, the way out) and *how you got to this page* (the trail,
      `spacing-4xl` further). 12px binds, 32px separates (ADR-0042).

      The DOM groups by **motion** instead. The mark has its own window; the way
      out and the trail arrive and leave together, so they are one element — and
      that element is what lets them be replaced in place when the identity slot
      opens or closes, without the outgoing pair and the incoming pair ever
      standing side by side.
    -->
    <div class="ds-hnav__left">

      <!--
        ── The identity slot ─────────────────────────────────────────────
        A track that can **close**. `lockup: false` (Paramètres) has nothing for
        the slot to say, so the window goes to nothing and takes its 12px with
        it: the way out then opens the bar.

        The clip is load-bearing. A `0fr` track still counts its item's margins
        and padding, so the 12px cannot live on the grid item — it lives on the
        window, inside the clip.
      -->
      <div
        class="ds-hnav__identity-track"
        :class="{ 'ds-hnav__identity-track--closed': !lockup }"
      >
        <div class="ds-hnav__identity-clip">
          <!--
            One slot, two forms: the Tolbi lockup at home, the module's mark
            inside a module. `module` is the only thing that decides which.

            The two share one grid cell (ADR-0027's `grid-area: 1 / 1`) so the
            slot is never empty mid-swap — and here that is structural rather
            than prudent: they roll past each other, so both have to be in the
            slot at once. `mode="out-in"` would make it two movements.
          -->
          <div class="ds-hnav__identity">
            <Transition name="ds-hnav-identity" @after-enter="opening = false">
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
              <div v-if="lockup && module" :key="module" class="ds-hnav__lockup">
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
              <div v-else-if="lockup" key="tolbi" class="ds-hnav__lockup">
                <Logo variant="default" :size="24" alt="Tolbi" />
              </div>
            </Transition>
          </div>
        </div>
      </div>

      <!--
        ── What arrives once you have left home ──────────────────────────
        The way out and the trail, in **one cell**: when the identity slot opens
        or closes they are about to move, so they are replaced rather than
        shoved — the outgoing pair fades where it stands while the incoming pair
        waits, invisible, in the same cell, and arrives where it will stay. That
        is what the key is: `lockup`, the one change that moves them.

        One cell for both, not one each: a cell is as wide as the wider of its
        two occupants, so a cell around the button alone would push the trail
        the moment a longer label came in.
      -->
      <div class="ds-hnav__away-cell">
        <Transition name="ds-hnav-away">
          <div v-if="!atHome" :key="lockup ? 'identity' : 'no-identity'" class="ds-hnav__away">
            <!--
              The way out. A real `Button` rather than a crumb (ADR-0001): it
              left the trail, so it stopped being a node in a path and became an
              action beside the identity — and it is drawn as one.

              `secondary-gray`, not the `ghost` chrome the crumb had: a ghost is
              *nothing at rest* and only answers a pointer that has already found
              it, which is the wrong contract for the single way out of a module.
              A declared box also bounds the block, so the 12px gap reads as
              binding two objects rather than as loose space beside the mark.

              `href` makes it an `<a>`, the rule ADR-0014 set and `Breadcrumbs`
              already followed.

              `sm` is the **smallest size the catalogue has**, and it is taken as
              it comes: `label-lg-strong` and `control-padding-sm`, no local
              override. A component that is 90% the real one is the defect
              ADR-0001 exists to stop, and a font declared here would be exactly
              that.

              Its glyph and its word are the product's: `house` when it leads
              home, `arrow-left` when it returns to the page the user left.
            -->
            <Button
              class="ds-hnav__home"
              data-hnav-home
              variant="secondary-gray"
              size="sm"
              :iconLeading="homeIcon"
              :label="homeLabel"
              :href="homeHref"
              @click="emit('home', $event)"
            />

            <!--
              The catalogue's Breadcrumbs, not a second drawing of it (ADR-0001)
              — **without its house**, and not at depth 0.

              The house moved beside the identity, so the trail is now exactly
              what its name says: the path from this module to this page. It no
              longer starts at the top of the product, because the mark on its
              left is where it starts.

              Its visibility is the **trail being empty**, not `module` being
              absent — a page outside any module still has a path worth showing,
              and the two props stay independent.

              No wrapper here, unlike `<Logo>` above: `Breadcrumbs`' root is a
              single unconditional `<nav>`, which is the case that transitions
              correctly.
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
        </Transition>
      </div>
    </div>

    <!-- ── Droite : crédits + actions (l'avatar compris) ──────────────── -->
    <div class="ds-hnav__right">

      <!--
        ── The credits ─────────────────────────────────────────────────
        The module's balance, so it **moves with the module's mark** (ADR-0054):
        it arrives with the incoming mark and leaves with the outgoing one — the
        same roll, the same window height, the same duration, curve and delay —
        and between two modules it stays, its number rolling instead.

        The track is the chip's **place**, and it travels: `0fr → 1fr` (ADR-0025)
        on the roll's duration and curve, so whatever stands beside the chip
        slides rather than jumps. The 16px to the controls lives inside the clip,
        on the window, so it opens and closes with the place (ADR-0049's
        identity track).
      -->
      <div class="ds-hnav__credits-track" :class="{ 'ds-hnav__credits-track--closed': !creditsShown }">
        <div class="ds-hnav__credits-clip">
          <div class="ds-hnav__credits-window">
            <!-- The identity's own transition, not a copy of it: one roll. -->
            <Transition name="ds-hnav-identity">
              <div v-if="creditsShown" class="ds-hnav__credits">
                <CreditsChip
                  :credits="credits ?? null"
                  :reminder="creditsReminder"
                  :tone="creditsTone"
                  @click="emit('credits')"
                />
              </div>
            </Transition>
          </div>
        </div>
      </div>

      <!--
        Actions — **one** block, the avatar included. It stood 16px apart, a
        third block of one element; Figma closes the actions with it
        (1982:57462), on the 8px the four controls before it already keep.
      -->
      <div class="ds-hnav__actions">

        <!--
          The page's assistant — `TolbiAiNavButton` (ADR-0062). The first of the
          controls: it is about this page, where the others are about the app,
          and it stands above where its panel opens. The bar decides the place,
          the product decides whether the page has one.
        -->
        <slot name="assistant" />

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

        <!--
          Avatar utilisateur — the last of the controls, not a block of its own.

          **The slot's presence decides what it is** (ADR-0028's `reminder`).
          Filled, the avatar is the account menu's trigger — `Dropdown`'s own
          avatar trigger and panel, not a second drawing of either (ADR-0001):
          the header with who is signed in, the product's rows under it, and
          Escape and the click outside, which `Dropdown` already owns. The panel
          hangs from the avatar's right edge, 8px below, like the modules'.

          The rows are the product's — « Paramètres du compte », « Se
          déconnecter » — and so is where they lead. It closes the menu through
          `close`, the shape `WorkspaceSelector`'s `#actions` already has.

          Empty, it stays the plain button it was, and emits `user`.
        -->
        <Dropdown
          v-if="$slots['user-menu']"
          v-model:open="userMenuOpen"
          trigger="avatar"
          class="ds-hnav__user-menu"
          :button-label="userLabel"
          :avatar-initials="userInitials"
          :user-name="userName"
          :user-email="userEmail"
        >
          <slot name="user-menu" :close="() => (userMenuOpen = false)" />
        </Dropdown>
        <button v-else class="ds-hnav__user" :aria-label="userLabel" @click="emit('user')">
          <Avatar size="md" :initials="userInitials" />
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped>
/* ── Shell ────────────────────────────────────────────────────────── */
.ds-hnav {
  /*
    The identity's window, and the chip's: the chip rolls through a window of
    the mark's height, so the two travel the same 48px on the same curve and
    read as one movement. Declared here so both can read it — what the value
    is, and why, is told at `.ds-hnav__identity`.
  */
  --hnav-mark: 48px;

  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  box-sizing: border-box;
  /*
    No ground and no rule, deliberately: the bar takes whatever surface sits
    behind it. The Figma frame carries no fill for the same reason — that is a
    decision, not an omission. What sits behind it is the page's `bg-neutral`,
    and the trail is drawn for that ground: its current crumb rises off it to
    `bg-default` (Breadcrumbs, ADR-0047).

    **And no padding**, for the same reason one level up: the bar sits in
    whatever margins the page gives it. The bar, the band under it and the
    page's content share one left edge and one right edge, so the margins are
    the column's — the product's shell holds all three — and not one of its
    rows'. With its own 16px, the bar's edges sat 16px inside everyone else's.
    Figma draws it that way (1982:57462): the bar is 0 all round, in a column of
    12 / 12 / 0 / 8 with a 12px gap (ADR-0047).
  */
  overflow: visible;
}

/* ── Gauche ───────────────────────────────────────────────────────── */
/*
  No gap of its own. The two gaps that make the left side read as two
  statements belong to what they separate: the identity carries its 12px to the
  way out (and takes it away when it closes), and the way out carries its 32px
  to the trail.
*/
.ds-hnav__left {
  display: flex;
  align-items: center;
}

/*
  ── The identity track ────────────────────────────────────────────────
  `1fr` with an identity, `0fr` without (`lockup: false`). The fraction is not
  animated: both directions are a **step**, taken one `enter` late — closing,
  once the leaving mark has rolled out of the window; opening, before the
  incoming one rolls in. Either way the step lands between the two beats, when
  the way out and the trail are faded out on one side and not yet faded in on
  the other, so nothing visible is pushed. A travelling width would make the
  outgoing pair slide while it fades — movement that explains nothing
  (ADR-0023).
*/
.ds-hnav__identity-track {
  display: grid;
  grid-template-columns: 1fr;
  transition: grid-template-columns 0s linear var(--ds-motion-duration-enter);
}

.ds-hnav__identity-track--closed {
  grid-template-columns: 0fr;
}

/* What lets a `0fr` track close: no minimum, and no paint past its edge. */
.ds-hnav__identity-clip {
  min-width: 0;
  overflow: hidden;
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

    (Declared on `.ds-hnav` since ADR-0054: the credits chip rolls through a
    window of the same height.)

    What it costs is the bar's height. 48 is the one thing here taller than the
    40px avatar, so the bar is **48px** — a 72px row once its column's 12 above
    and 12 below are counted, where ADR-0028's was 64 — on every page, including
    pages with no module, because the slot's floor is 48 in both forms. That is
    deliberate: a bar that changed height on navigation would be the real
    defect. It is also the side navigation's header row (`--side-nav-header-row`),
    so a shell that starts both columns at the same height puts the two on one
    line (ADR-0047).
  */

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

  /* The 12px to the way out — the identity's, so it closes with the slot. */
  margin-inline-end: var(--ds-spacing-lg);
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
  **An arrival waits for the place it lands in to be free.** Coming back from a
  bar with no identity, the window is closed and the way out is standing where
  the mark is about to land — so the mark arrives in the second beat, with the
  way out and the trail, once the window has opened under them unseen. Rolling
  at once would have meant pushing the fading way out aside, or rising through
  it.

  Every other arrival has its place free: module to module, or past the Tolbi
  lockup leaving the same window — the roll is designed for that crossing.
*/
.ds-hnav--opening .ds-hnav-identity-enter-active {
  transition-delay: var(--ds-motion-duration-enter);
}

/*
  The identity still swaps, instantly, and the transform is reset with the
  transition — otherwise the incoming form would be parked one slot-height below
  and snap. Cutting the travel hides nothing (ADR-0033), unlike ADR-0032's
  marquee where stopping the loop would have hidden content.

  The track's late step and the arrival's wait go too: a delay with no movement
  behind it is only lateness.
*/
@media (prefers-reduced-motion: reduce) {
  .ds-hnav__identity-track,
  .ds-hnav-identity-enter-active,
  .ds-hnav-identity-leave-active {
    transition: none;
  }

  .ds-hnav--opening .ds-hnav-identity-enter-active,
  .ds-hnav--opening .ds-hnav__credits-track {
    transition-delay: 0s;
  }

  .ds-hnav-identity-enter-from,
  .ds-hnav-identity-leave-to {
    transform: none;
  }

  /* Gone from the first frame: Vue swaps its classes a frame late, and the
     leaving mark would stand in the window with the arriving one. */
  .ds-hnav-identity-leave-active {
    visibility: hidden;
  }

  .ds-hnav__credits-track {
    transition: none;
  }
}

/*
  ── What arrives once you have left home ──────────────────────────────

  Two elements, one entrance: the **way back** and the **trail**. Neither exists
  on the home page, so they share a condition and they share a beat — and now an
  element, `.ds-hnav__away`, so that they can also be **replaced** together.

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

  **Replaced when the identity slot opens or closes** (Paramètres ⇄ the app).
  The pair is about to move by the slot's width, so the outgoing one fades where
  it stands and the incoming one waits its `enter`, invisible, in the same cell —
  the slot's step falls between the two, and the new pair arrives where it will
  stay. Two beats, nothing slides: the same sentence as arriving in a module.
*/
.ds-hnav__away-cell {
  display: grid;
}

/* Both occupants in one cell (ADR-0027), so the leaving pair holds its place
   and the arriving pair never stands beside it. */
.ds-hnav__away {
  grid-area: 1 / 1;
  display: flex;
  align-items: center;
  /* 32px to the trail, at every depth — Figma's `left` frame carries the same
     gap in all four views. */
  gap: var(--ds-spacing-4xl);
}

.ds-hnav-away-enter-active {
  transition: opacity var(--ds-motion-duration-enter) var(--ds-motion-easing-in-out)
              var(--ds-motion-duration-enter);
}

.ds-hnav-away-leave-active {
  transition: opacity var(--ds-motion-duration-enter) var(--ds-motion-easing-in-out);
  /* Fading is leaving: the outgoing way out must not take a second click. */
  pointer-events: none;
}

.ds-hnav-away-enter-from,
.ds-hnav-away-leave-to {
  opacity: 0;
}

/*
  The enter class here used to read `ds-hnav-trail-enter-active` — a name left
  over from before the transition was renamed — so under reduced motion the way
  out and the trail still waited one `enter` and faded in.
*/
@media (prefers-reduced-motion: reduce) {
  .ds-hnav-away-enter-active,
  .ds-hnav-away-leave-active {
    transition: none;
  }
}

/* ── Droite ───────────────────────────────────────────────────────── */
/* Two blocks — the credits, and the controls — `spacing-xl` apart. The gap is
   the chip's, inside its track, so it closes with the chip's place. */
.ds-hnav__right {
  display: flex;
  align-items: center;
  overflow: visible;
}

/*
  ── The credits' place ──────────────────────────────────────────────
  `1fr` with a chip, `0fr` without, **travelling** on the roll's duration and
  curve: the place opens as the chip rises into it and closes as it leaves, so
  nothing beside it jumps (ADR-0054). Where the identity's track steps (ADR-0049
  — the pair beside it is faded out at that moment), this one cannot: the
  controls next to it are always on screen.

  With the controls pinned to the bar's right edge, the place opens leftward
  into free space and nothing visible moves; where the bar is crowded and the
  controls are pushed, they slide.

  From Paramètres, the place waits one `enter` with the mark (`--opening`).
*/
.ds-hnav__credits-track {
  display: grid;
  grid-template-columns: 1fr;
  /*
    The column at the track's **end**. Mid-transition a fractional `fr` takes
    that fraction of the free space, so the column is narrower than the track
    that holds it (measured 52.8 of 93.6px) — and at the start, the chip slid
    41px sideways while it rose. At the end, the column's right edge is the
    track's, which does not move.
  */
  justify-content: end;
  transition: grid-template-columns var(--ds-motion-duration-enter) var(--ds-motion-easing-in-out);
}

.ds-hnav__credits-track--closed {
  grid-template-columns: 0fr;
}

.ds-hnav--opening .ds-hnav__credits-track {
  transition-delay: var(--ds-motion-duration-enter);
}

/*
  What lets the track close — no minimum — **without clipping the chip
  sideways**: a place narrower than the chip, mid-opening, lets it overflow
  toward the free space (`flex-end`) instead of cutting it, so the chip rises at
  the spot where it will stay.
*/
.ds-hnav__credits-clip {
  min-width: 0;
  display: flex;
  justify-content: flex-end;
}

/*
  The window the chip rolls through: the mark's height, clipped on that axis
  only (`clip`, which unlike `hidden` leaves the other axis visible).
*/
.ds-hnav__credits-window {
  flex-shrink: 0;
  display: grid;
  height: var(--hnav-mark);
  overflow-x: visible;
  overflow-y: clip;
  margin-inline-end: var(--ds-spacing-xl);
}

/* Stretched to the window, so its roll is the window's 48px — the mark's. */
.ds-hnav__credits {
  grid-area: 1 / 1;
  align-self: stretch;
  display: flex;
  align-items: center;
}

/* ── Actions ──────────────────────────────────────────────────────── */
/* `spacing-md` from the CTA to the avatar: one rhythm for every control. */
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
