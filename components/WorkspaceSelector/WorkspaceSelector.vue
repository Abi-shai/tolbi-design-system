<script setup lang="ts">
import { computed, ref } from 'vue'
import { Dropdown, DropdownTrigger, DropdownItem } from '../Dropdown'
import { Avatar } from '../Avatar'

/**
 * The workspace the user is currently in, and the switch to another one.
 *
 * It composes rather than draws: `Dropdown` for the panel and the dismissal
 * behaviour, `DropdownTrigger` for the control, `Avatar` for the mark, `DropdownItem`
 * for the rows. ADR-0001 — every one of those existed, and the Figma component
 * had re-drawn the box by hand, losing `elevation-control` and landing on
 * `8px 12px 8px 8px`, which is off the control-padding scale entirely.
 *
 * The trigger is `chrome="quiet"`: **nothing at rest**, a tint under the
 * pointer, and a lifted surface while the panel is out. It lives in the
 * navigation column, where the catalogue's bordered box reads as a foreign
 * control dropped into the ground — so the switcher diverges from `Dropdown`
 * deliberately, and the divergence is expressed as a named chrome on
 * `DropdownTrigger` rather than a box rebuilt here.
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
   * Icon-only rail: the mark alone, with no box.
   *
   * Not a narrower `DropdownTrigger` — every icon-only rail in the survey
   * (Weavy, Midday, Aboard, Shop) drops the chrome entirely and leaves the
   * workspace mark bare. Keeping the box would also have meant squaring the
   * rail's 36px row around the mark, whose padding lands off the control
   * scale — and at 32px there is only 2px a side left to put it in.
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
      <!-- Collapsed: the mark alone, still a real control. -->
      <button
        v-if="collapsed"
        type="button"
        class="ds-workspace-selector__mark"
        :aria-expanded="open"
        :aria-label="current ? `${ariaLabel} — ${current.name}` : ariaLabel"
        :disabled="disabled || undefined"
        aria-haspopup="true"
        @click="open = !open"
      >
        <Avatar
          v-if="current"
          size="sm"
          :src="current.src"
          :initials="marks(current)"
          :alt="current.name"
        />
      </button>

      <DropdownTrigger
        v-else
        size="sm"
        chrome="quiet"
        :open="open"
        :disabled="disabled"
        :aria-label="ariaLabel"
        chevron
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
        <span class="ds-workspace-selector__name">{{ current?.name }}</span>
      </DropdownTrigger>
    </template>

    <DropdownItem
      v-for="w in workspaces"
      :key="w.id"
      :label="w.name"
      @click="select(w)"
    />
  </Dropdown>
</template>

<style scoped>
.ds-workspace-selector,
.ds-workspace-selector__trigger {
  width: 100%;
}

/* ── Collapsed ────────────────────────────────────────────────────── */
.ds-workspace-selector--collapsed {
  width: auto;
}

/*
  The mark is the avatar and nothing else — 32px, no padding, as drawn. An
  earlier version padded it to the rail's 36px row, which pushed the collapsed
  header taller than the design.

  The click target keeps the 36px anyway, through an overlay rather than
  through padding: absolutely positioned, so it costs no layout. The mark is
  the one thing in the rail narrower than the row, and the overlay is what
  stops it being the one thing harder to hit.
*/
.ds-workspace-selector__mark {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: none;
  border-radius: var(--ds-radius-pill);
  background: transparent;
  cursor: pointer;
  outline: none;
  transition: box-shadow var(--ds-motion-duration-instant) var(--ds-motion-easing-default);
}

.ds-workspace-selector__mark::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: var(--side-nav-rail-row, 36px);
  height: var(--side-nav-rail-row, 36px);
  transform: translate(-50%, -50%);
}

.ds-workspace-selector__mark:focus-visible {
  box-shadow: var(--ds-focus-ring-gray);
}

.ds-workspace-selector__mark:disabled {
  cursor: not-allowed;
}

/* The panel cannot match a 36px trigger — it keeps `Dropdown`'s own width and
   opens beside the rail rather than under the mark. */
.ds-workspace-selector--collapsed :deep(.ds-dropdown__panel) {
  left: 100%;
  right: auto;
  top: 0;
  width: 240px;
  margin-left: var(--ds-spacing-md);
}

/* `Dropdown`'s panel is a fixed 240px pinned to `right: 0`, which is right for a
   trigger floating in a toolbar and wrong here: in a 228px column it hangs 12px
   off the left edge. The panel matches the trigger instead. */
.ds-workspace-selector :deep(.ds-dropdown__panel) {
  right: auto;
  left: 0;
  width: 100%;
}

/* The name takes the room the mark and the chevron leave, and truncates —
   a workspace name is user-typed and has no length the design can rely on. */
.ds-workspace-selector__name {
  flex: 1 1 auto;
  min-width: 1px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font: var(--ds-font-label-lg);
}
</style>
