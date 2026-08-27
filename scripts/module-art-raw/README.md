# Raw module artwork exports

Unmodified SVG exports from Figma `00 — Core Brand Visual Identity`
(file key `pJ20XxoowumVNZ6iwB9DKz`). **Committed on purpose** — the Figma MCP asset URLs are
short-lived, so without these the artwork cannot be regenerated without a fresh Figma session.

Do not hand-edit these. They are the input to `npm run module-art`, which strips the surrounding
Figma canvas and writes `components/ModuleIcon/art/`.

They still contain the canvas artefacts an export of a node-inside-a-frame carries: a `#8F8F8F`
placeholder rect and two negative-coordinate backdrop paths. That is expected — the generator
drops them by extracting only the `<g id="Module=…">` subtree.

## `illustration/` — frame `Module illustration`, node `9945:197`

| File | Figma variant | Node |
|---|---|---|
| `carbone.svg` | `Module=Carbone` | 9945:186 |
| `source.svg` | `Module=Source` | 9945:187 |
| `call.svg` | `Module=Call` | 9945:188 |
| `scan.svg` | `Module=Scan` | 9945:189 |
| `data.svg` | `Module=Data` | 9945:190 |
| `id.svg` | `Module=ID` | 9945:191 |
| `redd-plus.svg` | `Module=Redd+` | 9945:192 |
| `forest.svg` | `Module=Forest` | 9945:193 |
| `survey.svg` | `Module=Survey` | 9945:194 |
| `yield.svg` | `Module=Yield` | 9945:195 |
| `trace.svg` | `Module=Trace` | 9945:196 |

The frame has no `Eudr` variant at all.

## `logo/` — frame `Modules logos`, node `9892:11717`

| File | Figma variant | Node |
|---|---|---|
| `carbone.svg` | `Module=Carbone` | 9892:11718 |
| `source.svg` | `Module=Source` | 9892:11727 |
| `call.svg` | `Module=Call` | 9892:11735 |
| `scan.svg` | `Module=Scan` | 9892:11745 |
| `data.svg` | `Module=Data` | 9892:11755 |
| `id.svg` | `Module=ID` | 9892:11765 |
| `redd-plus.svg` | `Module=Redd+` | 9892:11780 |
| `forest.svg` | `Module=Forest` | 9892:11814 |
| `survey.svg` | `Module=Survey` | 9892:11789 |
| `yield.svg` | `Module=Yield` | 9892:11799 |
| `trace.svg` | `Module=Trace` | 9892:11828 |
| `eudr.svg` | `Module=Eudr` | 9892:11798 — **empty**, kept as evidence |

`eudr.svg` contains no artwork: just the placeholder rect and the canvas backdrop. The generator
reports it as skipped, and `Eudr` is therefore not a valid `ModuleName`. See the "Problème ouvert"
section of `ModuleIcon.mdx`.

## Re-pulling from Figma

Per node, via the Figma MCP:

```
download_assets { fileKey: "pJ20XxoowumVNZ6iwB9DKz", nodeId: "<node>", defaultFormat: "svg" }
```

Save the `export` URL (not `svgAssets` — the export is the composed node) to the matching filename
above, then run `npm run module-art`.
