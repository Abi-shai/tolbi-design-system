<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { readDuration } from '../../composables/cssTime'

/**
 * The place chosen on a map (ADR-0169) — Google Weather Lab's point forecast:
 * every click on the map sets a pin where it landed, and the sheet at the end
 * (`MapPanel lg closable`) gives that place's data, an object or a bare spot.
 *
 * A drop in the brand's ink, a white dot at its centre, a white edge so it
 * stands off any imagery (satellite as much as the TOLBI basemap) and a short
 * shadow. The ink does not follow the theme: the map under it does not change
 * in dark, so neither does what sits on it.
 *
 * **Its tip is the point**: the box is 24 × 32, the tip at the middle of its
 * bottom edge. The product places it as it places `MapTooltip` or
 * `MapHoverCard` — absolutely on the map, anchored at the bottom centre
 * (`translate(-50%, -100%)`, or an engine marker's `anchor: 'bottom'`).
 *
 * It **drops** when it is set — a few px, `enter` / `easing-out`. Set
 * somewhere else (`at` changes), it goes and drops again at the new place: no
 * glide, a glide would draw a path between two places nobody chose. Removed
 * (`v-if`), it fades over `exit` where it stood. Nothing moves under reduced
 * motion. It is decorative (`aria-hidden`: the sheet says the place, name and
 * coordinates) and takes no pointer: a click through it is a click on the map.
 */
interface Props {
  /**
   * What identifies the place — « lng,lat », a parcel's id. When it changes,
   * the pin drops again where it now stands; left out, a move is a cut.
   */
  at?: string | number
}

defineProps<Props>()

const root = ref<HTMLElement | null>(null)

/*
  A component cannot animate its own removal (ADR-0052, ADR-0168): the `v-if`
  takes it out in one frame — and in the product the element it sits in goes
  with it. So on unmount the pin leaves a copy where it was seen, in the nearest
  positioned ancestor still there a microtask later (the map), and the copy
  fades over `exit`.
*/
onBeforeUnmount(() => {
  const el = root.value
  if (!el || !el.isConnected) return
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
  const duration = readDuration(el, '--ds-motion-duration-exit')
  if (!duration) return
  const easing = getComputedStyle(el).getPropertyValue('--ds-motion-easing-in').trim() || 'ease-in'
  const seen = el.getBoundingClientRect()
  const ancestors: HTMLElement[] = []
  for (let up = el.parentElement; up; up = up.parentElement) ancestors.push(up)
  const ghost = el.cloneNode(true) as HTMLElement
  queueMicrotask(() => {
    const host = ancestors.find(a => a.isConnected && (a === document.body || getComputedStyle(a).position !== 'static'))
    if (!host) return
    const box = host.getBoundingClientRect()
    Object.assign(ghost.style, {
      position: 'absolute',
      left: `${seen.left - box.left - host.clientLeft + host.scrollLeft}px`,
      top: `${seen.top - box.top - host.clientTop + host.scrollTop}px`,
      zIndex: getComputedStyle(el).zIndex === 'auto' ? '2' : getComputedStyle(el).zIndex,
      margin: '0',
    })
    // The copy is the pin as it was seen: it does not drop again on the way out.
    ghost.querySelector<SVGElement>('svg')?.style.setProperty('animation', 'none')
    host.appendChild(ghost)
    const run = ghost.animate([{ opacity: 1 }, { opacity: 0 }], { duration, easing, fill: 'forwards' })
    run.finished.then(() => ghost.remove(), () => ghost.remove())
  })
})
</script>

<template>
  <span ref="root" class="ds-map-pin" aria-hidden="true">
    <!-- Keyed by the place: set somewhere else, the drawing is a new one and drops again. -->
    <svg :key="at" class="ds-map-pin__drop" viewBox="0 0 24 32" width="24" height="32" focusable="false">
      <path
        class="ds-map-pin__body"
        d="M12 30.5C9 26 2.5 18.75 2.5 11.5a9.5 9.5 0 0 1 19 0c0 7.25-6.5 14.5-9.5 19Z"
      />
      <circle class="ds-map-pin__dot" cx="12" cy="11.5" r="3.5" />
    </svg>
  </span>
</template>

<style scoped>
.ds-map-pin {
  display: block;
  width: 24px;
  height: 32px;
  pointer-events: none;
  /* The map's inks, not the theme's: imagery is the same in dark (ADR-0010's
     categorical clause — the pin is « this green », whatever the mode). */
  /* token-lint-disable-next-line no-raw-primitive — on the map's imagery, which has no dark mode (ADR-0169) */
  --map-pin-ink: var(--ds-color-brand-500);
  /* token-lint-disable-next-line no-raw-primitive — on the map's imagery, which has no dark mode (ADR-0169) */
  --map-pin-edge: var(--ds-color-base-white);
  /* token-lint-disable-next-line no-raw-primitive — on the map's imagery, which has no dark mode (ADR-0169) */
  --map-pin-shade: var(--ds-color-gray-light-900);
}

.ds-map-pin__drop {
  display: block;
  overflow: visible;
  /* A short shadow: `elevation-raised`'s two layers as the drop's own outline
     follows them (a `box-shadow` would draw a rectangle). */
  filter:
    drop-shadow(0 2px 2px color-mix(in srgb, var(--map-pin-shade) 16%, transparent))
    drop-shadow(0 1px 1px color-mix(in srgb, var(--map-pin-shade) 10%, transparent));
  animation: ds-map-pin-drop var(--ds-motion-duration-enter) var(--ds-motion-easing-out) both;
}

.ds-map-pin__body {
  fill: var(--map-pin-ink);
  stroke: var(--map-pin-edge);
  stroke-width: 2;
  stroke-linejoin: round;
}

.ds-map-pin__dot {
  fill: var(--map-pin-edge);
}

@keyframes ds-map-pin-drop {
  from { opacity: 0; transform: translateY(calc(-1 * var(--ds-spacing-md))); }
  to   { opacity: 1; transform: none; }
}

@media (prefers-reduced-motion: reduce) {
  .ds-map-pin__drop {
    animation: none;
  }
}
</style>
