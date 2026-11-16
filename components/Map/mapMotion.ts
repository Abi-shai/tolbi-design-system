import { easing } from '../../tokens/dist/index.js'
import { readDuration } from '../../composables/cssTime'
import { mapGlyphSvg, type MapGlyphOptions } from './mapGlyph'

/**
 * How points move on a map (ADR-0190): a cluster bursting and gathering, and
 * a parcel's glyph handing over to its shape. The engine's own symbols cannot
 * travel, so what moves is drawn over the map — **ghosts** — while the real
 * symbols are hidden for the flight (the product hides them; it knows which).
 * Everything here is the package's motion — `process` (300ms) on
 * `easing-out`, read off the cascade — and **nothing moves under reduced
 * motion**: every call resolves at once.
 */

export interface MapPoint {
  x: number
  y: number
}

const reduced = () => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
const timing = (el: Element) => ({
  duration: readDuration(el, '--ds-motion-duration-process'),
  easing: getComputedStyle(el).getPropertyValue('--ds-motion-easing-out').trim() || 'ease-out',
})

/** One point in flight: its glyph, from where to where in the map's pixels, and whether it arrives or leaves. */
export interface MapGlyphFlight {
  glyph: MapGlyphOptions
  from: MapPoint
  to: MapPoint
  /** `in`: it arrives (a cluster bursting) — it grows from 0.6. `out`: it leaves into a cluster — it shrinks to 0.6 and fades. */
  fade: 'in' | 'out'
}

const layers = new WeakMap<HTMLElement, HTMLElement>()
function layerOf(container: HTMLElement) {
  let layer = layers.get(container)
  if (layer?.isConnected) return layer
  layer = document.createElement('div')
  layer.setAttribute('aria-hidden', 'true')
  // Over the map, under the clusters' markers and every overlay; it takes no pointer.
  Object.assign(layer.style, { position: 'absolute', inset: '0', zIndex: '1', overflow: 'hidden', pointerEvents: 'none' })
  container.appendChild(layer)
  layers.set(container, layer)
  return layer
}

/**
 * Flies glyphs over the map, in `container` (the engine's element — Mapbox's
 * `map.getContainer()`), and resolves when they have landed and gone. **Only
 * what is on screen flies**: a flight with neither end in the container is
 * dropped — a cluster gathering a region's points would otherwise send dozens
 * of ghosts converging from off screen and blur the picture.
 */
export async function flyGlyphs(container: HTMLElement, flights: MapGlyphFlight[]): Promise<void> {
  if (reduced() || !flights.length) return
  const { duration, easing: curve } = timing(container)
  if (!duration) return
  const w = container.clientWidth
  const h = container.clientHeight
  const inside = (p: MapPoint, pad: number) => p.x >= -pad && p.x <= w + pad && p.y >= -pad && p.y <= h + pad
  const shown = flights.filter((f) => inside(f.from, f.glyph.size) || inside(f.to, f.glyph.size))
  if (!shown.length) return
  const layer = layerOf(container)
  await Promise.all(
    shown.map((f) => {
      const el = document.createElement('div')
      Object.assign(el.style, { position: 'absolute', top: '0', left: '0', willChange: 'transform, opacity', lineHeight: '0' })
      el.innerHTML = mapGlyphSvg(f.glyph, container)
      layer.appendChild(el)
      const at = (p: MapPoint, scale: number) => `translate(${p.x}px, ${p.y}px) translate(-50%, -50%) scale(${scale})`
      const arriving = f.fade === 'in'
      const run = el.animate(
        [
          { transform: at(f.from, arriving ? 0.6 : 1), opacity: arriving ? 0.3 : 1 },
          { transform: at(f.to, arriving ? 1 : 0.6), opacity: arriving ? 1 : 0.2 },
        ],
        { duration, easing: curve, fill: 'forwards' },
      )
      return run.finished.then(() => el.remove(), () => el.remove())
    }),
  )
}

/**
 * A `MapCluster` arriving from elsewhere — its parent that burst, or the
 * points it gathers: its content travels in from `from` (the offset in px from
 * where it now stands), grows from 0.6 and fades in. `el` is the cluster's
 * element or anything holding it (a Mapbox marker's).
 */
export function clusterArrive(el: HTMLElement, from: MapPoint = { x: 0, y: 0 }): Promise<void> {
  const inner = el.querySelector<HTMLElement>('.ds-map-cluster__inner')
  if (!inner || reduced()) return Promise.resolve()
  const { duration, easing: curve } = timing(el)
  return inner
    .animate(
      [
        { transform: `translate(${from.x}px, ${from.y}px) scale(0.6)`, opacity: 0.3 },
        { transform: 'translate(0, 0) scale(1)', opacity: 1 },
      ],
      { duration, easing: curve },
    )
    .finished.then(() => undefined, () => undefined)
}

/**
 * A `MapCluster` leaving: it fades on the spot while shrinking (a burst), or
 * travels by `toward` into the cluster that takes it (a gathering). It stops
 * taking the pointer at once. Resolves when it is gone — remove the marker
 * then.
 */
export function clusterLeave(el: HTMLElement, toward: MapPoint = { x: 0, y: 0 }): Promise<void> {
  el.style.pointerEvents = 'none'
  const inner = el.querySelector<HTMLElement>('.ds-map-cluster__inner')
  if (!inner || reduced()) return Promise.resolve()
  const { duration, easing: curve } = timing(el)
  return inner
    .animate(
      [
        { transform: 'translate(0, 0) scale(1)', opacity: 1 },
        { transform: `translate(${toward.x}px, ${toward.y}px) scale(0.6)`, opacity: 0 },
      ],
      { duration, easing: curve, fill: 'forwards' },
    )
    .finished.then(() => undefined, () => undefined)
}

/* ── Glyph ↔ shape ──────────────────────────────────────────────────── */

/**
 * The camera's zoom to the quarter: when to look again at which parcels read.
 * An engine's `['zoom']` mixed with data (`step` or `interpolate` over a
 * `get`) is evaluated **at the tile's whole zoom**, not the camera's — so the
 * hand-over is driven from here, in steps of a quarter, never by an expression.
 */
export const quarterZoom = (zoom: number) => Math.floor(zoom * 4) / 4

/**
 * The zoom at which a shape reads by itself: its short side reaches `px` on
 * screen (40, the glyph's own size, so nothing jumps). Never before
 * `minZoom` — the end of the clusters, so a burst lands on a glyph. Web
 * Mercator, tiles of `tileSize` (Mapbox and MapLibre: 512).
 */
export function legibleZoom(ring: [number, number][] | number[][], options: { px?: number; minZoom?: number; tileSize?: number } = {}): number {
  const { px = 40, minZoom = 0, tileSize = 512 } = options
  const lons = ring.map((p) => p[0])
  const lats = ring.map((p) => p[1])
  const lat = ((Math.min(...lats) + Math.max(...lats)) / 2) * (Math.PI / 180)
  const side = Math.min(
    (Math.max(...lons) - Math.min(...lons)) * 111_320 * Math.cos(lat),
    (Math.max(...lats) - Math.min(...lats)) * 110_574,
  )
  // Metres per pixel at zoom z: 40 075 016.686 × cos(lat) / (tileSize × 2^z).
  const zoom = Math.log2((40_075_016.686 * Math.cos(lat) * px) / (tileSize * Math.max(side, 1)))
  return Math.max(minZoom, zoom)
}

/** What a hand-over weighs at an instant: how much of the shape and of the glyph shows, and the glyph's scale. */
export interface MapRelayWeights {
  shape: number
  glyph: number
  /** The glyph closes in as it leaves and opens as it arrives: 0.6 → 1. */
  scale: number
}

export interface MapRelaySwap extends MapRelayWeights {
  ids: string[]
  /** Towards the shape (zooming in) or towards the glyph. */
  toShape: boolean
}

/**
 * A point with a shape is **its glyph or its shape, never both**. When it
 * crosses its `legibleZoom`, the two hand over: what leaves fades over the
 * first 60 % and closes to 0.6, what arrives comes over the last 60 %, on
 * `process` + `easing-out` — a relay, not a cross-fade where both sit on each
 * other. Several run at once during a zoom; the newest wins for a point that
 * crosses back.
 *
 * The engine cannot transition a value tied to data, so the relay is pushed
 * frame by frame: `onFrame` runs on every frame while one runs, and
 * `active()` gives the swaps (newest last) to build the engine's
 * expressions from. Under reduced motion nothing runs: the swap is a cut.
 */
export function createMapRelay(options: { el?: Element; onFrame: () => void }) {
  const el = options.el ?? document.documentElement
  const swaps: { ids: string[]; toShape: boolean; start: number }[] = []
  let frame = 0
  const duration = () => readDuration(el, '--ds-motion-duration-process')
  const leaving = (t: number) => 1 - Math.min(1, t / 0.6)
  const arriving = (t: number) => Math.max(0, (t - 0.4) / 0.6)
  function weigh(swap: (typeof swaps)[number], now: number): MapRelaySwap {
    const t = easing.out(Math.min(1, (now - swap.start) / (duration() || 1)))
    const [shape, glyph] = swap.toShape ? [arriving(t), leaving(t)] : [leaving(t), arriving(t)]
    return { ids: swap.ids, toShape: swap.toShape, shape, glyph, scale: 0.6 + 0.4 * glyph }
  }
  function step() {
    const done = performance.now() - duration()
    for (let i = swaps.length - 1; i >= 0; i--) if (swaps[i].start <= done) swaps.splice(i, 1)
    frame = swaps.length ? requestAnimationFrame(step) : 0
    options.onFrame()
  }
  return {
    /** These points crossed their threshold, towards the shape or the glyph. */
    push(ids: string[], toShape: boolean) {
      if (!ids.length) return
      if (reduced() || !duration()) {
        options.onFrame()
        return
      }
      swaps.push({ ids, toShape, start: performance.now() })
      if (!frame) frame = requestAnimationFrame(step)
      options.onFrame()
    },
    /** The swaps running now, oldest first, each with its weights at this instant. */
    active(): MapRelaySwap[] {
      const now = performance.now()
      return swaps.map((s) => weigh(s, now))
    },
    /** Stops every swap — the map is going away. */
    stop() {
      cancelAnimationFrame(frame)
      frame = 0
      swaps.length = 0
    },
  }
}

export type MapRelay = ReturnType<typeof createMapRelay>

