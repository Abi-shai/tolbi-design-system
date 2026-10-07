# Raw Tolbi AI artwork export

The unmodified SVG export of Tolbi AI's sign from Figma Sprint 18 (file key `Dpy2nP7IFnnmaPh9bBSOaq`),
page « Tolbi AI — retenu, vers le paquet ». **Committed on purpose** — the Figma MCP asset URLs are
short-lived, so without it the artwork cannot be regenerated without a fresh Figma session.

Do not hand-edit it. It is the input to `npm run tolbi-ai-art`, which writes
`components/TolbiAiSpark/art.ts`.

| File | Figma component | Variant | Node |
|---|---|---|---|
| `spark.svg` | `TolbiAI/Étincelle` (`2341:12352`) | `Taille=48, État=Repos, Petite étincelle=Avec` | `2341:12050` |

## Why one file covers 96 variants

The set is `Taille` (16 · 20 · 24 · 32 · 48 · 64 · 96 · 128) × `État` (Repos, Éteinte, Gauche, Haut,
Droite, Bas) × `Petite étincelle` (Avec, Sans). Measured with the Plugin API on 2026-10-07, every
variant's layers, normalised to the 48 grid, sit within **9.5e-7px** of this one's, and the states
differ only in each leaf's layer opacity (1 or 0.2). So the drawing is one drawing, and the
component draws every size from this export's `viewBox`.

It still carries the canvas an export of a node inside a section brings with it: a `#F5F5F5` rect and
the section's two backdrop paths. That is expected — the generator reads only the variant's own
`<g>`.

## Re-pulling from Figma

```
download_assets { fileKey: "Dpy2nP7IFnnmaPh9bBSOaq", nodeId: "2341:12050", defaultFormat: "svg" }
```

Save the `export` URL (not `svgAssets` — the export is the composed node, with the layer names the
generator reads) to `spark.svg`, then run `npm run tolbi-ai-art`. The script fails if the leaves or
the spark no longer carry the hexes of `brand/500` and `accent/400`: the component binds those two
primitives, so a different hex in the file is drift to fix in Figma.
