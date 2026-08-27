# ADR-0005 — Module artwork: one component, two levels

**Date:** 2026-08-25
**Status:** Accepted
**Source of truth:** Figma `00 — Core Brand Visual Identity` (`pJ20XxoowumVNZ6iwB9DKz`) —
`Module illustration` (node 9945:197) and `Modules logos` (node 9892:11717)

## Context

`ModuleIcon` shipped 15 hand-assembled SVG fragments and reconstructed two of the modules at
runtime with CSS masks, percentage-inset overlays and a separate "trace vector" layer. The results
were approximations, not the artwork:

- `Forest` rendered `Yield`'s asset — the two are genuinely different drawings.
- `Yield` and `Forest` were composed from `*-mask.svg` + `*-overlay.svg` pairs positioned with
  `inset: 16.6%`, i.e. eyeballed.
- `Eudr` had no asset and rendered an empty box.

Figma publishes the same 11 modules twice, and the second set is strictly the first plus a tile.

## Decisions

### One component, `variant` selects the level

```vue
<ModuleIcon module="Carbone" />                          <!-- logo (default) -->
<ModuleIcon module="Carbone" variant="illustration" />   <!-- the primitive -->
```

- **`illustration`** — the drawing alone. The **primitive**.
- **`logo`** — the same drawing on its rounded tile. The **semantic**, and the default.

This mirrors the token architecture exactly: primitives exist to compose semantics, and product
surfaces consume the semantic — unless the surface already frames the module. `ModulesList` is that
case and the reference example: its item button carries its own radius, its own hover background
and `bg-brand-primary` when active, so the logo would put a tile inside a tile and clash with the
active state. It consumes `variant="illustration"` with `:aria-label="null"`, since the visible
label already names the module. Verified against the exports rather than assumed — the logo SVG is
byte-for-byte the illustration's paths with one extra tile path
(`fill="#E6F0EB" fill-opacity="0.3"`) beneath them and a clip. Nothing is redrawn or repositioned.

### The artwork is extracted, not transcribed

`npm run module-art` generates `components/ModuleIcon/art/{variant}/*.vue` from the raw Figma
exports in `scripts/module-art-raw/`.

A Figma SVG export of a node **inside a frame** carries the surrounding canvas with it: a
`#8F8F8F` placeholder rect and two backdrop paths at coordinates like `M-390 -345`. Rendered
as-is, every module sits on a grey slab. Rather than pattern-match that junk, the generator
extracts only the `<g id="Module=NAME">` subtree — so anything outside the artwork is dropped by
construction and the vectors themselves are never touched.

It also namespaces every internal id. Figma numbers mask and clip ids per frame, so all 22 exports
reuse `mask0_1083_118533` / `clip0_1083_118533`; inlining two of them in one document would
cross-wire the masks. `Yield` and `Forest` now use their real SVG masks instead of CSS ones.

### Raw exports are committed

`scripts/module-art-raw/` holds the unmodified exports, with a README mapping every file to its
Figma node id. The Figma MCP asset URLs are short-lived — without these the artwork cannot be
regenerated without a fresh Figma session, and this is brand artwork that is expensive to
re-obtain.

### Artwork is inlined, not loaded as an asset

The generated files are Vue SFCs with the SVG inline, the same pattern as `Icon` after ADR-0004.
The previous `import x from './assets/x.svg'` + `<img :src>` approach makes the published package
depend on emitted asset files resolving correctly in the consumer's bundler. Inlining removes that
failure mode.

## `Eudr` is not a valid `ModuleName`

There is no `Eudr` artwork to render, so the type does not offer it. This is not an omission — it
is the unresolved Figma issue already logged in the foundations handoff, now confirmed against the
exports:

- The `Modules logos` frame has an `Eudr` variant whose export is **958 bytes and contains zero
  vector layers** — the placeholder rect and nothing else. It is committed as
  `scripts/module-art-raw/logo/eudr.svg` as evidence.
- The `Module illustration` frame has no `Eudr` variant at all.
- In **both** frames, the EUDR wordmark artwork sits on the variant named **`Trace`**.

So `module="Trace"` renders the EUDR wordmark. The labels look swapped, and resolving it is a
design decision: either rename `Trace` to `Eudr`, or draw both. Until then, code reflects what the
file actually contains rather than guessing at intent.

`ModuleName` is generated from what has artwork, so fixing it in Figma and re-running
`npm run module-art` is the whole migration.
