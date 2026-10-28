<script setup lang="ts">
/* token-lint-disable no-literal-dimension-js — the initials scale with the
   avatar's diameter, so this is geometry, not a typographic role (ADR-0010).
   10px and 18px are off the type ramp by construction. */
import { computed } from 'vue'
import { Icon, type IconName } from '../Icon'

export type AvatarSize   = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'
export type AvatarStatus = 'online' | 'company' | 'verified'

interface Props {
  size?:       AvatarSize
  src?:        string
  initials?:   string
  /**
   * A glyph instead of initials — what the avatar stands for when it is not a
   * person (ADR-0091): a parcel takes `land-plot`. `EmptyState`'s shape, on
   * the avatar's own ground. Last of the three contents: a photo, then
   * initials, then this, then the silhouette.
   */
  icon?:       IconName
  alt?:        string
  /** A 4px `bg-default` ring, for an avatar that overlaps a band or an image. */
  ring?:       boolean
  status?:     AvatarStatus
  companySrc?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
})

const sizePx: Record<AvatarSize, number> = {
  'xs':  24,
  'sm':  32,
  'md':  40,
  'lg':  48,
  'xl':  56,
  '2xl': 64,
  '3xl': 112,
}

const textSize: Record<AvatarSize, string> = {
  'xs':  '0.625rem', // 10px
  'sm':  '0.75rem',  // 12px
  'md':  '1rem',     // 16px
  'lg':  '1.125rem', // 18px
  'xl':  '1.25rem',  // 20px
  '2xl': '1.5rem',   // 24px
  '3xl': '2.625rem', // 42px — the ramp's own 0.375 of the diameter
}

/*
  The glyph takes the largest `Icon` rung that is at most half the diameter, so
  a quarter of the box is margin on each side. At `xs` there is no such rung —
  16 is the floor — and the margin gives rather than the glyph (ADR-0039's rule
  at a floor, with the box fixed this time). 48 rides `Icon`'s number hatch: a
  glyph inside a control is an ornament (ADR-0004).
*/
const iconSize: Record<AvatarSize, number> = {
  'xs':  16,
  'sm':  16,
  'md':  20,
  'lg':  24,
  'xl':  24,
  '2xl': 32,
  '3xl': 48,
}

const badgeSize: Record<AvatarSize, number> = {
  'xs':  6,
  'sm':  8,
  'md':  10,
  'lg':  12,
  'xl':  14,
  '2xl': 16,
  '3xl': 28,
}

const companyBadgeSize: Record<AvatarSize, number> = {
  'xs':  8,
  'sm':  10,
  'md':  14,
  'lg':  18,
  'xl':  20,
  '2xl': 24,
  '3xl': 40,
}

const px          = computed(() => sizePx[props.size])
const showImage   = computed(() => !!props.src)
const showInitials = computed(() => !props.src && !!props.initials)
const showIcon    = computed(() => !props.src && !props.initials && !!props.icon)

/* An avatar with nothing to call it is decoration: `role="img"` with no name
   is a defect, and what names a parcel is the heading beside it (ADR-0041). */
const name = computed(() => props.alt ?? props.initials)
</script>

<template>
  <div
    class="ds-avatar"
    :class="[
      `ds-avatar--${size}`,
      { 'ds-avatar--image': showImage, 'ds-avatar--initials': showInitials, 'ds-avatar--ring': ring },
    ]"
    :style="{ width: `${px}px`, height: `${px}px` }"
    :role="name ? 'img' : undefined"
    :aria-label="name"
    :aria-hidden="name ? undefined : true"
  >
    <!-- Photo -->
    <img
      v-if="showImage"
      :src="src"
      :alt="alt ?? ''"
      class="ds-avatar__img"
    />

    <!-- Initiales -->
    <span
      v-else-if="showInitials"
      class="ds-avatar__initials"
      :style="{ fontSize: textSize[size] }"
      aria-hidden="true"
    >{{ initials }}</span>

    <!-- Icône -->
    <Icon
      v-else-if="showIcon"
      :name="icon!"
      :size="iconSize[size]"
      class="ds-avatar__icon"
      aria-hidden="true"
    />

    <!-- Placeholder silhouette -->
    <svg v-else class="ds-avatar__placeholder" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>

    <!-- Contrast border overlay (toujours présent) -->
    <div class="ds-avatar__border" aria-hidden="true" />

    <!-- Status : online -->
    <span
      v-if="status === 'online'"
      class="ds-avatar__status ds-avatar__status--online"
      :style="{ width: `${badgeSize[size]}px`, height: `${badgeSize[size]}px` }"
      aria-label="En ligne"
    />

    <!-- Status : company badge -->
    <span
      v-else-if="status === 'company' && companySrc"
      class="ds-avatar__status ds-avatar__status--company"
      :style="{ width: `${companyBadgeSize[size]}px`, height: `${companyBadgeSize[size]}px` }"
    >
      <img :src="companySrc" alt="" class="ds-avatar__status-img" />
    </span>

    <!-- Status : verified -->
    <span
      v-else-if="status === 'verified'"
      class="ds-avatar__status ds-avatar__status--verified"
      :style="{ width: `${companyBadgeSize[size]}px`, height: `${companyBadgeSize[size]}px` }"
      aria-label="Vérifié"
    >
      <svg viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M2.5 6l2.5 2.5 4.5-5" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </span>
  </div>
</template>

<style scoped>
/* ── Shell ────────────────────────────────────────────────────────── */
.ds-avatar {
  position: relative;
  border-radius: var(--ds-radius-pill);
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  overflow: visible;
  background-color: var(--ds-bg-neutral);
}

/* ── Image ────────────────────────────────────────────────────────── */
.ds-avatar__img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: var(--ds-radius-pill);
  pointer-events: none;
}

/* ── Initiales ────────────────────────────────────────────────────── */
.ds-avatar__initials {
  font-family: var(--ds-typography-font-family-poppins);
  font-weight: var(--ds-font-weight-label-lg-strong);
  line-height: 1.5;
  color: var(--ds-text-subtlest);
  user-select: none;
  position: relative;
  z-index: var(--ds-z-raised);
}

/* ── Icône ────────────────────────────────────────────────────────── */
/* The glyph recedes as the silhouette it replaces does. */
.ds-avatar__icon {
  position: relative;
  z-index: var(--ds-z-raised);
  color: var(--ds-text-subtlest);
}

/* ── Placeholder ──────────────────────────────────────────────────── */
.ds-avatar__placeholder {
  width: 55%;
  height: 55%;
  color: var(--ds-text-subtlest);
}

/*
  ── Ring ───────────────────────────────────────────────────────────
  A band of the page's own surface, so the avatar reads as lifted off
  whatever it overlaps. A shadow and not a border: it must take no layout
  space, or the content shrinks by 8px and the declared size stops being the
  size (ADR-0039). The hairline below still runs inside it.
*/
.ds-avatar--ring {
  box-shadow: 0 0 0 var(--ds-spacing-xs) var(--ds-bg-default);
}

/* ── Contrast border ──────────────────────────────────────────────── */
.ds-avatar__border {
  position: absolute;
  inset: 0;
  border-radius: var(--ds-radius-pill);
  border: var(--ds-border-width-default) solid var(--ds-border-inset);
  pointer-events: none;
  z-index: 2;
}

/* ── Status badges ────────────────────────────────────────────────── */
.ds-avatar__status {
  position: absolute;
  bottom: 0;
  right: 0;
  border-radius: var(--ds-radius-pill);
  border: var(--ds-border-width-strong) solid var(--ds-bg-default);
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.ds-avatar__status--online {
  background-color: var(--ds-bg-success-solid);
  transform: translate(15%, 15%);
}

.ds-avatar__status--company {
  transform: translate(15%, 15%);
  background: var(--ds-bg-default);
}

.ds-avatar__status--verified {
  background-color: var(--ds-bg-brand-solid);
  transform: translate(15%, 15%);
}

.ds-avatar__status-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
