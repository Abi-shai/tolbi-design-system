<script setup lang="ts">
import { computed } from 'vue'
import { Avatar, type AvatarSize } from '../Avatar'

export interface AvatarGroupItem {
  src?: string
  initials?: string
  alt?: string
}

interface Props {
  items?: AvatarGroupItem[]
  size?: AvatarSize
  /** Beyond this, the rest collapse into a `+n` counter. */
  max?: number
  /** Shown in place of the stack when `items` is empty. */
  emptyLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  items: () => [],
  size: 'sm',
  max: 4,
})

defineEmits<{ emptyClick: [] }>()

const shown = computed(() => props.items.slice(0, props.max))
const overflow = computed(() => Math.max(0, props.items.length - props.max))
</script>

<template>
  <!-- Two states in one component, as the pattern it replaces had. -->
  <button
    v-if="!items.length && emptyLabel"
    type="button"
    class="ds-avatar-group__empty"
    @click="$emit('emptyClick')"
  >
    <span class="ds-avatar-group__empty-slot" aria-hidden="true">+</span>
    {{ emptyLabel }}
  </button>

  <div v-else class="ds-avatar-group" :class="`ds-avatar-group--${size}`">
    <span
      v-for="(item, i) in shown"
      :key="i"
      class="ds-avatar-group__item"
    >
      <Avatar
        :size="size"
        :src="item.src"
        :initials="item.initials"
        :alt="item.alt"
      />
    </span>

    <span v-if="overflow" class="ds-avatar-group__item ds-avatar-group__more">
      +{{ overflow }}
    </span>
  </div>
</template>

<style scoped>
.ds-avatar-group {
  --stack-overlap: -8px;
  --stack-ring: 2px;

  display: inline-flex;
  align-items: center;
  /* isolation so the ring of one avatar cannot paint over the next. */
  isolation: isolate;
}

.ds-avatar-group--xs, .ds-avatar-group--sm { --stack-overlap: -6px; }
.ds-avatar-group--lg, .ds-avatar-group--xl, .ds-avatar-group--2xl { --stack-overlap: -12px; }

.ds-avatar-group__item {
  display: inline-flex;
  border-radius: var(--ds-radius-pill);
  /* The ring separates neighbours; it is a ring on the surface, not a border. */
  box-shadow: 0 0 0 var(--stack-ring) var(--ds-bg-default);
}

.ds-avatar-group__item + .ds-avatar-group__item { margin-left: var(--stack-overlap); }

/* Earlier avatars sit on top, so the stack reads left-to-right. */
.ds-avatar-group__item:nth-child(1) { z-index: 5; }
.ds-avatar-group__item:nth-child(2) { z-index: 4; }
.ds-avatar-group__item:nth-child(3) { z-index: 3; }
.ds-avatar-group__item:nth-child(4) { z-index: 2; }
.ds-avatar-group__item:nth-child(n+5) { z-index: 1; }

.ds-avatar-group__more {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
  padding: 0 var(--ds-spacing-xs);
  background-color: var(--ds-bg-neutral-subtle);
  color: var(--ds-text-subtle);
  font: var(--ds-font-label-md);
  font-variant-numeric: tabular-nums;
}

.ds-avatar-group--xs .ds-avatar-group__more { min-width: 24px; height: 24px; }
.ds-avatar-group--md .ds-avatar-group__more { min-width: 40px; height: 40px; }
.ds-avatar-group--lg .ds-avatar-group__more { min-width: 48px; height: 48px; }

/* ── Empty state ──────────────────────────────────────────────────── */
.ds-avatar-group__empty {
  display: inline-flex;
  align-items: center;
  gap: var(--ds-spacing-md);
  padding: 0;
  border: 0;
  background: none;
  cursor: pointer;
  font: var(--ds-font-label-lg);
  color: var(--ds-text-subtle);
  border-radius: var(--ds-radius-inner);
}

.ds-avatar-group__empty:hover { color: var(--ds-text-default); }
.ds-avatar-group__empty:focus-visible { outline: none; box-shadow: var(--ds-focus-ring-brand); }

.ds-avatar-group__empty-slot {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--ds-radius-pill);
  border: 1px dashed var(--ds-border-default);
  color: var(--ds-text-subtlest);
}
</style>
