/**
 * Measures where each module illustration's **ink** sits in its 48 box
 * (ADR-0216) and writes `scripts/module-art-raw/centre.json`, which
 * `generate-module-art.mjs` reads to centre the drawing: the box was centred,
 * the drawing was not — Inset left 6px empty above and none below.
 *
 * The ink is measured off the rendered pixels, not the paths' geometry: a
 * stroke's width is ink too, and `getBBox()` leaves it out. Each drawing is
 * rasterised at 20× in headless Chromium, its alpha scanned, the bounding box
 * of every pixel above 1/32 opacity taken; the offset is how far that box's
 * centre is from the box's (24, 24), in the drawing's own units.
 *
 * Run it after `npm run module-art` whenever an export changes, then run the
 * generator again: `npm run module-art:centre`. With `--check` it measures the
 * drawings as generated (their centring included) and writes nothing: every
 * offset should then be within ±0.5px.
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { chromium } from '@playwright/test'

const ART = 'components/ModuleIcon/art/illustration'
const OUT = 'scripts/module-art-raw/centre.json'
const SCALE = 20
const CHECK = process.argv.includes('--check')

const drawings = readdirSync(ART)
  .filter(f => f.endsWith('.vue'))
  .map(f => {
    const svg = readFileSync(join(ART, f), 'utf8').match(/<svg[\s\S]*<\/svg>/)[0]
      // Measure the drawing as exported, whatever centring a previous run applied — unless checking it.
      .replace(/viewBox="[^"]*"/, m => (CHECK ? m : 'viewBox="0 0 48 48"'))
      .replace('<svg ', `<svg width="${48 * SCALE}" height="${48 * SCALE}" `)
    return { slug: f.replace(/\.vue$/, ''), svg }
  })

const browser = await chromium.launch()
const page = await browser.newPage()
const centre = await page.evaluate(async ({ drawings, SCALE }) => {
  const out = {}
  for (const { slug, svg } of drawings) {
    const img = new Image()
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
    await img.decode()
    const size = 48 * SCALE
    const canvas = Object.assign(document.createElement('canvas'), { width: size, height: size })
    const ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0)
    const { data } = ctx.getImageData(0, 0, size, size)
    let minX = size, minY = size, maxX = -1, maxY = -1
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (data[(y * size + x) * 4 + 3] > 8) {
          if (x < minX) minX = x
          if (x > maxX) maxX = x
          if (y < minY) minY = y
          if (y > maxY) maxY = y
        }
      }
    }
    const round = v => Math.round(v * 100) / 100
    out[slug] = {
      ink: [round(minX / SCALE), round(minY / SCALE), round((maxX + 1) / SCALE), round((maxY + 1) / SCALE)],
      offset: [round((minX + maxX + 1) / 2 / SCALE - 24), round((minY + maxY + 1) / 2 / SCALE - 24)],
    }
  }
  return out
}, { drawings, SCALE })
await browser.close()

for (const [slug, { ink, offset }] of Object.entries(centre)) console.log(slug.padEnd(14), 'ink', ink.join(' '), ' offset', offset.join(' '))
if (CHECK) {
  const off = Object.entries(centre).filter(([, c]) => c.offset.some(v => Math.abs(v) > 0.5))
  if (off.length) throw new Error(`not centred: ${off.map(([s]) => s).join(', ')}`)
  console.log('every drawing centred within ±0.5px')
} else {
  writeFileSync(OUT, `${JSON.stringify(centre, null, 2)}\n`)
}
