# ADR-0030 — A shadow cannot carry the dark

**Date:** 2026-09-16
**Status:** Accepted
**Closes:** ADR-0029's *Still open* items on `Badge` and on elevation
**Depends on:** ADR-0029 (the mode), ADR-0009 (the pairing contract), ADR-0010 (categorical tokens)

## Context

ADR-0029 shipped the mode and left three things open. Two of them turned out to be one question —
*what does a raised surface do when the ground has no luminance left to lose?* — and it has a
measurable answer.

## Decisions

### In dark, elevation stops being what separates

The shadow ramp is `gray-light-900` at 3–18%. On `gray-forest/900` that is very nearly nothing, so
the obvious move is to raise the alpha until it matches what light achieves. The measurement says
not to:

| | contrast on `gray-forest/900` |
|---|---|
| light's `shadow-2xl` (18%) against white | **1.468:1** |
| **100% black** — the strongest shadow the dark ground can physically hold | **1.262:1** |
| `border-subtle` (`gray-forest/700`), which every elevated surface already has | **1.644:1** |

Two things follow. The first is that matching is impossible past about 8%: the ceiling is below what
light reaches. The second is the one that actually settles the design — **the border already
out-performs the strongest shadow that could ever exist here.**

And every elevated surface in the catalogue already has one. `Dropdown`'s menu, `Toast` and
`Card --elevated` each carry `border: 1px solid var(--ds-border-subtle)` next to their
`box-shadow: var(--ds-elevation-*)`. In light that border is `gray-light/200` at 1.18:1 — a hairline,
while the shadow does the work. In dark it is `gray-forest/700` at 1.64:1 and the roles swap. The
system self-corrected before anything was changed.

So the dark shadow is **not** solved to match the light one. Solving for a match wants 53–98% alpha,
and 92% black behind a 12px blur is a halo, not a shadow. The alphas are multiplied by **5** onto
`gray-forest/950` and left there — enough to ground a surface, not pretending to lift it. The 60% cap
never bites: the four layers elevation actually uses top out at 10%.

### Elevation is redefined under the dark selector, not left to inherit

`--ds-elevation-overlay: var(--ds-shadow-lg)` resolves **at computed-value time on the element that
declares it**. Redefining `--ds-shadow-lg` under `[data-theme="dark"]` is therefore enough only when
the attribute sits on `<html>`; on a *subtree*, `:root` has already baked the light shadow into
`--ds-elevation-overlay` and the subtree inherits that computed value.

So `elevation-dark.css` is emitted too — built from the **same** `elevation.json`, which is why there
is no `elevation.dark.json` for someone to update by half.

### `Badge`'s categorical palette takes ADR-0029's rule, and two values move

ADR-0029 left this open on one specific question, and it has a number for an answer.

The tint and hairline follow the rule the status tones already use — a `dark-subtle` ground at
1.15:1 and a `dark-border` hairline at 1.55:1, blended off each hue's own 500, minted for all seven
display hues (14 primitives). Two of `Badge`'s five tokens move:

| token | light | dark | why |
|---|---|---|---|
| `--badge-bg` | `{hue}-50` | `{hue}-dark-subtle` | the rule |
| `--badge-border` | `{hue}-200` | `{hue}-dark-border` | the rule — 1.35:1 on its tint, where light is 1.33:1 |
| `--badge-text` | `{hue}-700` | `{hue}-200` | a 700 on a near-black tint is 700-on-50 inverted. **10.05–11.04:1** |
| `--badge-outline-border` | `{hue}-700` | `{hue}-500` | **the open question** |
| `--badge-dot` | `{hue}-500` | `{hue}-500` | decorative, and the one step that reads on both grounds |

The open question was that in `pill-outline` the border *is* the visual and has to clear 3:1, while
`dark-border` is 1.55:1. Step **500** clears it for all seven hues — **4.13:1** at worst (indigo),
7.91:1 at best (blue-light). The light comment on that block already explains why the outline takes
700 rather than 600; this is the same argument, measured against the other ground.

### The pairings are measured now, instead of described

Every contrast figure in this system lived in a `$description` — prose, which rots like prose. ADR-0029
doubled the number of pairings without adding a single check.

`scripts/contrast.test.mjs` resolves the real token graph and measures. It reads ADR-0009's contract
off the names — `text-on-{suffix}` must meet AA on `bg-{suffix}` — and runs it in **both** modes,
plus the plain text roles on `bg-default`. It asserts a floor on how many pairings it measured,
because a suite that silently measured nothing passes just as loudly as one that measured everything.

## Still open

- **The scrim.** Unchanged from ADR-0029, and the same answer applies: separation in dark comes from
  the border and from a raised surface, not from the overlay. Settle it with the modal.
- **Module artwork.** `ModuleIcon`'s art has colours baked into the SVG (`#D9D9D9`, `#FAC720`,
  `#066938`), and ADR-0005 makes it generated output — never hand-edited. A dark variant needs new
  Figma exports, not a code change.
- **Light mode fails AA where dark passes.** `text-warning` is **3.49:1** on `bg-default` and
  `text-success` is **3.91:1** — both below AA for normal text, both shipping since ADR-0009, both
  fine in dark (7.09:1 and 6.03:1). The contrast suite does not assert them, because asserting them
  would fail the build on a pre-existing light-mode decision this ADR has no mandate to change. It
  should be changed.
