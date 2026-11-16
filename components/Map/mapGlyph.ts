/**
 * The glyphs a map draws its points with (ADR-0190; lightened by ADR-0191) — the ARR cockpit's, taken
 * into the package: two families told apart **by shape first**, a project's
 * point a disc with a parcel (`land-plot`), a control point a rounded square
 * with a sight (`crosshair`). The ground is the datum's colour, at full; a
 * white edge and a light ink contour (1, at 70 %) stand it off any imagery;
 * the pictogram is in ink at 70 % on Lucide's own weight, and turns white
 * only where white measures better (WCAG) — on the sequential ramp, only its
 * darkest step.
 *
 * The package draws no map (ADR-0006), so this is what an engine needs and no
 * more: the drawing as SVG markup (`mapGlyphSvg`), a stable name per drawing
 * (`mapGlyphName`), and `loadMapGlyphs`, which rasterises them and hands them
 * to anything with Mapbox's or MapLibre's `hasImage` / `addImage`. A symbol
 * layer cannot recolour a picture that is not a distance field, so one image
 * per family × colour × size is the shape of it.
 *
 * Like `MapPin` (ADR-0169), the inks do not follow the theme: the imagery
 * under them has no dark mode.
 */

export type MapGlyphFamily = 'project' | 'control'

export interface MapGlyphOptions {
  family: MapGlyphFamily
  /** The datum's colour: any CSS colour, a `var(--ds-chart-sequential-3)` included. */
  color: string
  /**
   * The CSS px it is shown at. It decides the drawing too: under 32px the
   * control's sight is the **small** one — a smaller ring, four short thick
   * ticks outside it — because Lucide's reads as a plain ring at 24.
   */
  size: number
  /** Chosen: the contour thickens and a shadow lifts it; the image gains a margin for it. */
  selected?: boolean
}

/** The project's and the control's pictograms, Lucide's paths on its 24 grid. */
const LAND_PLOT =
  '<path d="m12 8 6-3-6-3v10"/><path d="m8 11.99-5.5 3.14a1 1 0 0 0 0 1.74l8.5 4.86a2 2 0 0 0 2 0l8.5-4.86a1 1 0 0 0 0-1.74L16 12"/><path d="m6.49 12.85 11.02 6.3"/><path d="M17.51 12.85 6.5 19.15"/>'
const CROSSHAIR = '<circle cx="12" cy="12" r="10"/><path d="M22 12h-4M6 12H2M12 6V2M12 22v-4"/>'
/** The sight for small sizes: the ring at half, the ticks outside it, short and thick. */
const CROSSHAIR_SMALL = '<circle cx="12" cy="12" r="5.5"/><path d="M12 1.5v3M12 19.5v3M1.5 12h3M19.5 12h3"/>'

/** Under this many CSS px, the control takes the small sight. */
export const MAP_GLYPH_SMALL_BELOW = 32
/** A chosen glyph's image, in units of the 32 drawing: 8 of margin all round for the shadow, the drawing centred. */
const SELECTED_BOX = 48

type Rgb = [number, number, number]

/**
 * A colour as the browser resolves it — a token, `color-mix()`, a keyword —
 * read off a probe in the document, so the image gets the cascade's value.
 */
function resolve(color: string, root: Element): Rgb | null {
  if (typeof document === 'undefined') return null
  const probe = document.createElement('span')
  probe.style.color = color
  probe.style.display = 'none'
  root.appendChild(probe)
  const seen = getComputedStyle(probe).color
  probe.remove()
  const rgb = /rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/.exec(seen)
  if (rgb) return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])]
  const srgb = /color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)/.exec(seen)
  if (srgb) return [Number(srgb[1]) * 255, Number(srgb[2]) * 255, Number(srgb[3]) * 255]
  return null
}

const hex = ([r, g, b]: Rgb) => `#${[r, g, b].map((c) => Math.round(c).toString(16).padStart(2, '0')).join('')}`

function luminance([r, g, b]: Rgb) {
  const lin = (c: number) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}

const contrast = (a: Rgb, b: Rgb) => {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p)
  return (x + 0.05) / (y + 0.05)
}

/** The map's two inks, primitives (ADR-0169): the imagery is the same in dark. */
function inks(root: Element) {
  const read = (name: string) => getComputedStyle(root).getPropertyValue(name).trim()
  return {
    ink: resolve(read('--ds-color-gray-light-900') || 'black', root) ?? [16, 24, 40],
    white: resolve(read('--ds-color-base-white') || 'white', root) ?? [255, 255, 255],
  }
}

/**
 * The ink's weight (ADR-0191): many glyphs at full ink saturated the map, so
 * the contour and an ink pictogram are drawn at 70 % — the ground keeps its
 * full colour, which is the datum and must match the legend. Measured, the
 * lightest pictogram on the ramp is 3.46:1 (on `success-600`), past the 3:1 a
 * graphic needs. A chosen glyph's contour stays at full ink: it is the choice.
 */
const INK_ALPHA = 0.7
const mix = (a: Rgb, b: Rgb, t: number): Rgb => [0, 1, 2].map((k) => a[k] * t + b[k] * (1 - t)) as Rgb

function drawing(o: MapGlyphOptions, fill: Rgb, ink: Rgb, white: Rgb) {
  // Ink by default — as it is seen, at its alpha over the ground; white only where it measures better.
  const whiteWins = contrast(white, fill) > contrast(mix(ink, fill, INK_ALPHA), fill)
  const pict = whiteWins ? hex(white) : hex(ink)
  const pictAlpha = whiteWins ? 1 : INK_ALPHA
  const edge = o.selected ? 3 : 1
  const edgeAlpha = o.selected ? 1 : INK_ALPHA
  const [f, i, w] = [hex(fill), hex(ink), hex(white)]
  // A 2 white edge outside the ground, the ink contour outside that.
  const out = 1 + edge / 2
  if (o.family === 'project')
    return (
      `<circle cx="16" cy="16" r="13" fill="${f}" stroke="${w}" stroke-width="2"/>` +
      `<circle cx="16" cy="16" r="${13 + out}" fill="none" stroke="${i}" stroke-opacity="${edgeAlpha}" stroke-width="${edge}"/>` +
      `<g transform="translate(8.8 8.8) scale(.6)" fill="none" stroke="${pict}" stroke-opacity="${pictAlpha}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${LAND_PLOT}</g>`
    )
  const small = o.size < MAP_GLYPH_SMALL_BELOW
  const sight = small
    ? `<g transform="translate(8.8 8.8) scale(.6)" fill="none" stroke="${pict}" stroke-opacity="${pictAlpha}" stroke-width="2.6" stroke-linecap="round">${CROSSHAIR_SMALL}</g>`
    : `<g transform="translate(9.5 9.5) scale(.54)" fill="none" stroke="${pict}" stroke-opacity="${pictAlpha}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${CROSSHAIR}</g>`
  return (
    `<rect x="5" y="5" width="22" height="22" rx="6" fill="${f}" stroke="${w}" stroke-width="2"/>` +
    `<rect x="${5 - out}" y="${5 - out}" width="${22 + 2 * out}" height="${22 + 2 * out}" rx="${6 + out}" fill="none" stroke="${i}" stroke-opacity="${edgeAlpha}" stroke-width="${edge}"/>` +
    sight
  )
}

/** The CSS px of a glyph's image: its size, or the larger box of a chosen one. */
export const mapGlyphBox = (o: Pick<MapGlyphOptions, 'size' | 'selected'>) =>
  o.selected ? (o.size * SELECTED_BOX) / 32 : o.size

/**
 * The glyph as SVG markup, `size` CSS px wide (a chosen one: its larger box,
 * the drawing still centred on the point). `root` is where the colours are
 * resolved — the map's element, if a subtree sets its own tokens.
 */
export function mapGlyphSvg(o: MapGlyphOptions, root: Element = document.documentElement): string {
  return svgAt(o, root, mapGlyphBox(o))
}

/** The markup at `box` px — the CSS size, or the bitmap's when rasterised. */
function svgAt(o: MapGlyphOptions, root: Element, box: number): string {
  const { ink, white } = inks(root)
  const fill = resolve(o.color, root) ?? [136, 136, 136]
  const body = drawing(o, fill, ink, white)
  if (!o.selected)
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${box}" height="${box}" viewBox="0 0 32 32">${body}</svg>`
  const m = (SELECTED_BOX - 32) / 2
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${box}" height="${box}" viewBox="${-m} ${-m} ${SELECTED_BOX} ${SELECTED_BOX}">` +
    `<defs><filter id="lift" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="0" dy="3" stdDeviation="2.6" flood-color="${hex(ink)}" flood-opacity=".38"/></filter></defs>` +
    `<g filter="url(#lift)">${body}</g></svg>`
  )
}

/**
 * The image's name in the engine: family, chosen, size, and the colour as
 * resolved — so « Comparer »'s ramp and the stock ramp never share a picture.
 */
export function mapGlyphName(o: MapGlyphOptions, root: Element = document.documentElement): string {
  const rgb = resolve(o.color, root)
  const colour = rgb ? hex(rgb).slice(1) : o.color.replace(/[^a-z0-9]/gi, '')
  return `ds-glyph-${o.family}-${o.selected ? 'sel-' : ''}${o.size}-${colour}`
}

/** What `loadMapGlyphs` needs of an engine: Mapbox's and MapLibre's map both have it. */
export interface MapImageHost {
  hasImage(name: string): boolean
  addImage(name: string, image: HTMLImageElement, options?: { pixelRatio?: number }): void
}

/**
 * Rasterises the glyphs and adds the ones the map does not have yet, each
 * under `mapGlyphName`. Idempotent: a basemap change drops a style's images,
 * so call it again after one. Drawn at `pixelRatio` (2 by default, or the
 * screen's if higher) so a symbol at `icon-size: 1` is the glyph at `size`.
 */
export async function loadMapGlyphs(
  map: MapImageHost,
  glyphs: MapGlyphOptions[],
  options: { pixelRatio?: number; root?: Element } = {},
): Promise<void> {
  const root = options.root ?? document.documentElement
  const ratio = options.pixelRatio ?? Math.max(2, Math.ceil(window.devicePixelRatio || 1))
  await Promise.all(
    glyphs.map((o) => {
      const name = mapGlyphName(o, root)
      if (map.hasImage(name)) return undefined
      const px = Math.round(mapGlyphBox(o) * ratio)
      return new Promise<void>((done) => {
        const image = new Image(px, px)
        image.onload = () => {
          if (!map.hasImage(name)) map.addImage(name, image, { pixelRatio: ratio })
          done()
        }
        image.onerror = () => done()
        image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgAt(o, root, px))}`
      })
    }),
  )
}
