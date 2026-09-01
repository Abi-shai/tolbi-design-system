# ADR-0009 — The semantic layer is a vocabulary, and every token names a contract

**Date:** 2026-08-31
**Status:** Accepted
**Supersedes in part:** ADR-0003 (the semantic colour groups it inherited)
**Benchmarked against:** GitHub Primer, Shopify Polaris, IBM Carbon v11, Atlassian Design System, Material 3

## Context

The primitive layer is sound. The semantic layer was ported wholesale from Untitled UI and never
re-derived, so it inherited that system's shape — including the parts that only made sense in a
two-mode system, and one shipped typo. Measured before this ADR:

- **92 semantic colour tokens, 35 of them unreferenced** (38%).
- `quarterary` — Untitled UI's misspelling — in `text.*` and `fg.*`, while `bg.quaternary` is spelled
  correctly. Same file, both spellings.
- The `text` / `fg` split was **not observed**: `Button` painted its label with `fg-white`,
  `Breadcrumbs` its link text with `fg-secondary`, and `Icon.stories.ts` — the stories for the icon
  component — coloured icons with `text-primary`. 125 `text-*` uses against 81 `fg-*`, chosen
  arbitrarily.
- ~90 raw primitive leaks survived, clustered in six components that each hand-built a private
  tone map (`--badge-bg`, `--tone-fg`, `--bg-default`) from the raw ramps.
- `utility.success.300` / `utility.warning.300` carried a description apologising for being a
  partial port that patched a missing `border-success` / `border-warning`.
- "Selected" was expressed nine different ways, including three raw colour literals
  (`Tabs:193`, `HorizontalNavigation:267`, `ProgressSteps:194`).
- `bg-primary-hover` = `bg-secondary` = `bg-active` = `gray.50`; `bg-disabled` =
  `bg-disabled-subtle` = `gray.100`.

None of that is a theming problem, because since ADR-0003 there is nothing to theme. It is a
**vocabulary** problem.

## Decisions

### The semantic layer is a vocabulary, not a swap seam

Its job is to give a human or an agent a small closed menu of *decisions* to pick from. Swap-ability
is a constraint we keep, not the purpose we optimise for.

This inverts one consequence of ADR-0003. That ADR kept unreferenced tokens on the grounds that "a
ramp is a palette, not a usage list" — which remains correct **for primitives**. It does not extend
to semantic aliases: a semantic token nobody uses is not a palette entry, it is a wrong turn
somebody can take. 35 of them were exactly that.

### Code owns the semantic names; Figma owns the primitives

There is no Figma sync tooling in this repo — no import script, no `figma` reference in `scripts/`,
`tokens/` or `.storybook/`. `npm run tokens` reads hand-written JSON, so the mirror was always a
human transcription discipline, never a pipeline.

Primitive **names and hex values** stay Figma's; renaming them would break handoff for no gain.
Semantic names are the design system's own. Figma is a temporary member of the tooling stack and
will be dropped once the code layer is mature, so the semantic layer is designed for its real
consumers — this repo and the agents reading it.

This closes the gap ADR-0006 recorded, where inheriting Figma's `Component colors/Utility/*`
produced a two-token stub that had to apologise for itself in its own `description`.

### Three groups: `text`, `bg`, `border`. `fg` is deleted

Every grey pair in `text` / `fg` was byte-identical — `primary`, `secondary`, `tertiary`,
`quarterary`, `secondary-hover`, `tertiary-hover`, `white`. A second name for the same decision is
the thing this ADR exists to remove.

Carbon and Polaris do keep `text` and `icon` apart, and they are right to: their values genuinely
diverge. Ours did not. And Lucide icons are `stroke="currentColor"` with `Icon.vue` setting no
colour of its own, so an icon and its adjacent label inherit **one** `color` declaration — a
separate icon token is not even reachable in the common case without extra markup.

A filled shape that is neither text nor page — a status dot, a scrollbar thumb — is a **background**.
`fg-senary` (scrollbar thumb) and `fg-success-secondary` (avatar status dot) move to `bg`.

The tinted `fg` values were not synonyms and did carry a real decision: `text-brand-primary` was
`brand.900` (readable as body copy on white) where `fg-brand-primary` was `brand.600` (fine as a
graphic). That decision survives, but as an explicit contrast pairing rather than as a group name —
see *Exact pairing*, below.

### Prominence is emphasis, never an ordinal

`primary / secondary / tertiary / quarterary / quinary / senary` is replaced by
`strong / default / subtle / subtlest`.

Three reasons. Ordinals are context-relative — a "tertiary" button standing alone is the primary
action on its screen — where emphasis describes contrast against the surface, which does not move.
Six ordinals is past the point where anyone can picture `quinary` without a lookup table we do not
have. And it retires `quarterary` permanently rather than standardising on one spelling of a typo.

The grey ramp maps to four steps, all of which clear AA on white and on `gray.50`:

| Token | Primitive | on white | on `gray.50` |
|---|---|---|---|
| `text-strong` | `gray.900` | 17.75 | 16.98 |
| `text-default` | `gray.700` | 10.46 | 10.01 |
| `text-subtle` | `gray.600` | 7.69 | 7.36 |
| `text-subtlest` | `gray.500` | 4.97 | 4.76 |

`gray.400` gets **no foreground name**. It measures 2.58:1, below even the 3:1 non-text threshold.
`HelpIcon`'s resting glyph currently sits there and is a real failure; the rename surfaces it
instead of preserving it.

Token names and component props are deliberately **different vocabularies**. `Button` keeps
`variant="primary|secondary|tertiary"`. A component's public API describes intent; a token describes
an appearance contract. They are not required to rhyme.

### `-solid` is a fill contract

Every `-solid` token is a fill on which the `text-*` tokens are illegible; every non-`solid`
background is a ground on which they are guaranteed. That distinction was already implicit in the
names and is now a rule that can be linted.

`bg-primary-solid` (`gray.950`) was misnamed — it is a dark *ground* that carries text, not a fill.
It becomes **`bg-inverse`**, matching Carbon and Polaris.

We do **not** adopt Polaris's `bg-surface` / `bg-fill` split. A white card ground and a white
secondary-button fill are the same decision — introduce a grey page tomorrow and both stay white —
so splitting them would reintroduce exactly the duplication that killed `fg`.

### Exact pairing: every on-colour names its partner, not a tone family

A single universal on-colour (Primer's `fgColor-onEmphasis`, Carbon's `text-on-color`) is impossible
here. Measured against white text:

| Fill | White text | Verdict |
|---|---|---|
| `brand.600` | 7.70 | AA |
| `error.600` | 4.83 | AA |
| `warning.600` | 3.49 | **fails AA** |
| `success.600` | 3.91 | **fails AA** |
| `accent.400` | **1.58** | **fails everything** |
| `gray.950` | 18.86 | AA |

`accent.400` is irreducible — it *is* the secondary brand colour, and darkening it stops being the
brand. It therefore gets **no semantic token at all**, per *Tones* below: it had zero usages, and a
fill nobody uses whose on-colour inverts the rule is a trap, not a contract. When a yellow fill is
genuinely needed it returns as a pair, `bg-accent-solid` + `text-on-accent-solid`, in one change.

`bg-warning-solid` and `bg-success-solid` are **repointed to step 700** (white: 5.43 and 5.69), an
alias change that leaves the primitive ramps untouched. `accent.400` is handled under *Tones* below.

The old `-on-brand` ramp named a **tone family**, not a background, and the family spanned four
different grounds. It was tuned for `bg-brand-section` (`brand.800`, all four steps pass); on
`bg-brand-solid` (`brand.600`) `quarterary-on-brand` collapsed to **2.34:1**, and nothing in the name
warned you. `bg-brand-primary` is also "brand" — `brand.50`, near-white — so white-on-brand was
nominally legal there and effectively invisible.

So on-colours name their **exact partner**, Material-3 style. `bg-brand-section` and
`bg-brand-section-subtle` are deleted (both unused); a hero ground gets designed when marketing
needs one, with its own on-ramp.

Pairing extends **one tier further than the solids**, and this is the finding that dissolved most of
the duplication. `text-{tone}` at step 600 is safe on white (4.83) and **not** safe on the matching
tint (4.44 error, 3.34 warning, 3.70 success). `Badge` had independently picked step **700** — 6.05,
5.20, 5.40 — so `Badge` was correct and the *semantic layer* was missing a token. Each status tone
therefore gets three paired levels:

| Ground | Text token | Step |
|---|---|---|
| white page | `text-{tone}` | 600 |
| `bg-{tone}-subtle` | `text-on-{tone}-subtle` | 700 |
| `bg-{tone}-solid` | `text-on-{tone}-solid` | white |

`Toast` and `Callout` were checked and are **not** affected: their `--tone-fg` paints only the icon
and Toast's 3px rule, and all three clear the 3:1 non-text threshold. Their titles and bodies already
use `text-*` greys.

Borders split the same way: `border-{tone}` (`300`) conveys state — `InputField`'s error ring —
while `border-on-{tone}-subtle` (`200`) is the decorative hairline on a tint that `Badge`,
`BadgeGroup` and `Tag` all chose independently.

**The six duplicated tone maps were never evidence of a missing component tier.** They were evidence
of a missing on-token for tinted grounds. Once it exists, `Badge`, `BadgeGroup` and `Tag` become
straight semantic lookups.

### States are a closed set of three, always last

`-hover`, `-selected`, `-disabled`. Nothing else.

No `-pressed`: `:active` is styled in exactly one place catalogue-wide (`Scrollbar`), and press
feedback is cheaper and reads better as the hover value plus a transform. No `-focus`: that is
`--ds-focus-ring-*`, already a separate and well-behaved system.

`bg-active` is **deleted**. It was `gray.50` used for a dropdown item's *selected* state, which is
the opposite of what CSS `:active` means.

**Selection is brand-tinted.** `bg-selected` is `brand.50`. Grey already means "the pointer is here";
if selection is also grey then a hovered-unselected row and an unhovered-selected row are
indistinguishable — a live bug in `DropdownSelectItem` and `ButtonGroupItem`. Four components already
voted brand-tint (`Table`, `Breadcrumbs`, `Pagination`, `ModulesList`).

Selection turns out to be **two concepts**. "Chosen from a list" is `bg-selected`. "The active segment
of a control" — `ButtonGroupItem`, `Tabs` — is a raised neutral surface that must *not* be branded,
and it is the system's first genuine **component token**.

### The grammar, and `semantic` leaves the name

```
--ds-{group}-{tone?}-{emphasis?}-{state?}
     text|bg|border   brand|error|warning|success|neutral|accent   strong|default|subtle|subtlest|solid   hover|selected|disabled
```

Neutral tone is omitted. Optional segments keep that order. States are always last. On-colours are
`--ds-text-on-{exact bg suffix}`.

`--ds-semantic-bg-brand-solid` becomes `--ds-bg-brand-solid`. None of the five benchmarked systems
puts the tier in the token name; Atlassian's prefix is literally `--ds-`, the same as ours, and their
default text colour is `--ds-text`. The tier is already legible from the namespace word — `color`,
`space` and `typography` are primitive namespaces, `text`, `bg` and `border` are semantic groups, and
they do not collide.

`-default` stays **explicit** rather than following Atlassian's bare `--ds-text`. Our consumers grep
and autocomplete, and a bare `--ds-text` is a prefix of every other token in its group.

### Tones: `error`, `warning`, `success`, `neutral` — and `brand` is interactive only

The `accent` semantic family is **deleted** — eight tokens, zero usages. The only accent in the repo
is `--ds-color-accent-400` used raw in three chart stories as a data-series colour. Accent is a
palette entry, not a UI role; the primitive ramp stays.

The token word is **`neutral`**, not `info`. `info` is a meaning, `neutral` is an appearance contract,
and components keep their own vocabulary — `Callout tone="info"` resolves to `--ds-bg-neutral-subtle`.
This ends the split where `Callout`/`Toast` said `info` and `Badge`/`Tag` said `gray`.

No blue is added for `info`. A seventh primitive family for one tone that resolves to grey is the
completeness trap this ADR rejects, and ADR-0006 already guarantees tone picks the icon, so meaning
never rests on hue.

**`brand` comes off the status tones.** `brand.50` against `success.50` is **ΔE 5.3** — at the fill
level a brand badge and a success badge are the same colour, separated only by a border (ΔE 21) and
an icon. Semantically "a brand-toned alert" has no answer to "what happened", which every other tone
does. Brand is reserved for interactive affordance: button fills, links, focus, and `bg-selected`.
`Badge`, `Callout` and `Toast` lose `tone="brand"`.

The `utility` pseudo-group disappears. `utility.success.300` and `utility.warning.300` become plain
`border-success` and `border-warning`, which is what they always were.

### Radius and elevation get a semantic layer; spacing does not get renamed

Elevation already follows a strict rule with **100% adherence** across the catalogue — controls `xs`
(`Button`, `InputField`, `ButtonGroup`, `TextareaInputField`), surfaces `sm` (`Card`, `Table`,
`Tabs`, `Toggle`), floating `lg` (`Dropdown`, `Toast`, `ChartTooltip`). The rule simply was not named.

**Radius does not, and an earlier draft of this ADR said it did.** That claim came from a
thirteen-component sample. Across the full catalogue radius uses **eight steps for six roles**:
`xl`/`md`/`full`/`sm` follow the rule cleanly, but `lg` (5 sites), `xs` (4), `2xl` (1) and `4xl` (1)
do not map to any agreed role. Only the four clean roles are promoted; the rest stay on the
primitive ramp rather than being given invented names, because naming them without deciding what
they mean would be the "six tiles, four radii" defect wearing a token. See *Still open*.

Both are promoted: `--ds-elevation-{control,surface,raised,overlay}` and
`--ds-radius-{control,surface,pill,inner}`. (`elevation-raised` is `shadow-md`, the draggable puck
that rides above its own track — the slider thumb, which had been a hand-rolled literal.) This
generalises ADR-0006's fix — that ADR solved "six tiles,
four radii" by making `Card` own its radius, which fixes one component; a semantic radius makes it a
system property.

Spacing is **not** renamed. `spacing.md → space.2 → 8px` is a magnitude rename rather than a semantic
layer, and intent-based spacing (`stack`/`inline`/`inset`) becomes a naming negotiation on every new
pattern while CSS `gap` is direction-agnostic. Its real defects are adoption — **144 raw `rem`/`px`
paddings, gaps and margins against 123 tokenised ones** — and bloat: 17 steps for 9 used, 12 width
tokens for 1 usage, 3 container tokens for 0. Trim, then enforce.

Motion carries a layer violation: `motion.duration.enter` and `.considered` are intent names living
in `primitives.json`. Either give them a numeric ramp underneath or state that motion has no
primitive tier — not both. Deferred, but recorded.

### The admission rule

A semantic token is admitted under exactly one of four clauses, named in its `description`:

1. **Contract** — it declares a legible pairing. Every `text-*`; `border-{tone}` and `border-focus`
   at 3:1.
2. **Ground** — it is a surface some contract points at. Every `bg-*`. A ground is admitted **only**
   if at least one `text-on-*` names it; an unpaired ground is a trap, which is how
   `bg-brand-section` was caught.
3. **State** — a `-hover` / `-selected` / `-disabled` variant of a token already admitted by 1 or 2.
4. **Decorative** — deliberately non-load-bearing: `border-subtle` (1.18:1), `border-subtlest`, and
   the three `border-on-{tone}-subtle` (1.30–1.42:1).

Clause 4 is the weak one and is admitted with its eyes open. Those five tokens fail every contrast
threshold and convey nothing — but `Badge`, `BadgeGroup` and `Tag` each chose that hairline
independently, so the design intent is real, and pushing them to the component tier would put one
value in three components again. The clause **must be stated in the `description`**, so the file
records that they are deliberately decorative rather than borders someone got wrong.

## What changes

**92 semantic colour tokens → 64** (65 once ADR-0010 reinstates `bg-overlay`). Deletions (the whole `fg` group, the `accent` family, the
`-on-brand` ramp, `utility`, `bg-active`, the brand sections, `bg-disabled-subtle`) outweigh
additions (the `on-` family, `border-on-{tone}-subtle`, `bg-selected`).

Only **two** are unreferenced, and both are required by clause 2 rather than left over:
`text-on-warning-solid` and `text-on-success-solid` complete the pairs for grounds that *are* used
(`Badge`'s tone dots). Compare 35 dead out of 92 before.

This is a **single atomic breaking change**, delivered by codemod, cutting a major version. Nothing
consumes the published package yet, so there is no deprecation window and no dual-spelling period.

Delivered as three one-shot passes in `scripts/`: `codemod-adr-0009.mjs` (site-specific decisions,
then 499 mechanical renames), `-literals.mjs` (19 colour/shadow literals with exact token
equivalents, 10 stale `var(--ds-x, #hex)` fallbacks stripped), and `-elevation-radius.mjs` (99 call
sites onto the new radius and elevation roles).

Known fallout to be handled in the same change:

- Colour literals removed. The count in the Context section above — three — was itself too low; the
  rename pass surfaced more once the noise cleared. `Tooltip` was **entirely un-tokenised** (nine
  literals: it is the inverse surface, `#0c111d` / `#ffffff` / `#d0d5dd`), `HorizontalNavigation`
  carried four more alpha overlays, `CloseButton` two, and `Slider` / `ProgressBar` hand-rolled
  shadows that were **byte-identical to `shadow-md` and `shadow-lg`**. ADR-0006's "no literal colour"
  audit covered its own seventeen components; it never held catalogue-wide.
- `Slider`'s focus state was a hand-rolled `0 0 0 3px rgba(5,96,51,0.2)`, now `--ds-focus-ring-brand`
  per ADR-0006's one-focus-treatment rule.
- `CreditsChip` carried a `font-weight: 700`, which ADR-0003 dropped from the system.
- Two visual changes ship: `DropdownSelectItem` and `ButtonGroupItem` selection.
- `HelpIcon` moves off `gray.400` (2.58:1).
- `Badge`, `BadgeGroup` and `Tag` drop their private tone maps for semantic lookups, and lose
  `tone="brand"` along with `Callout` and `Toast`.

## Still open

- ~~**Radius has no agreed role for four of its steps.**~~ Closed by ADR-0013. `lg` (`ProgressSteps`, `Tabs`,
  `VerificationCodeInputField`, `FileDropzone`, `ChartTooltip`), `xs` (`Checkbox`, `PasswordField`,
  `Tag`, `ChartLegend`), `2xl` (`ModulesList`) and `4xl` (`HorizontalNavigation`) still consume the
  primitive ramp. Deciding what those roles are is the remaining half of ADR-0006's "six tiles,
  four radii".
- ~~**`Badge`'s categorical palette.**~~ — closed by ADR-0010's implementation (35 display-palette
  references, zero hex) and recorded in ADR-0014.

- **Two hairline rings** (`Avatar`, `CreditsChip`) remain `rgba(0, 0, 0, 0.08)`. There is no honest
  token: they are 8% pure black, and the darkest thing in the system is `gray.950`, not black.
- ~~**Enforcement.**~~ Closed by ADR-0012: `npm run lint` carries these rules, and spacing —
  the standing proof that an unenforced layer gets ignored — went from 47% to 87% adoption.
- **The component tier.** One member so far: segmented-control selection. Its naming and file
  location are decided in the component-layer pass that follows this one.
- **Motion's layer violation**, recorded above.
- ~~**The typography follow-up from ADR-0003**~~ — closed by ADR-0011: 0 literal type values remain.

