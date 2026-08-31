# ADR-0006 — Primitives drawn from the product inventory

**Date:** 2026-08-27
**Status:** Accepted
**Source:** Figma `04 — Product UI`, node 30:2 (`07 · Composants réels`)

## Context

The product inventory reproduces every component from the dev branch as it renders today. It is a
record of drift, not a specification — so it is read as a statement of *needs*, never of API. Where
this design system already has an answer, ours wins and the product migrates (see the audit page
for the four points requalified on those grounds).

The reliable signal in that file is this: **22 of the 41 components in its "pure standard" bucket
call no component at all.** They are written in raw HTML and utility classes. A spinner existing in
three copies, or an empty state written twice, proves a missing primitive regardless of how it is
currently written. Those are the smallest units, and this ADR covers building them.

## Decisions

### Card comes first, and owns the radius

`Card` was pulled forward from the missing-atoms list because `StatTile`, `Callout`, `EmptyState`
and `Toast` all want a surface. Building `StatTile` standalone and rewiring it later would have
manufactured exactly the drift ADR-0001 exists to prevent.

**The radius is not a prop.** Divergent radii — "six tiles, four radii" in the audit — are the
defect the component removes, so no caller can reintroduce them.

### Charts: the chrome, not the engine

`ChartFrame`, `ChartTooltip` and `ChartLegend` supply the title, legend, axes, grid, loading and
empty states. The design system ships **no renderer and no charting dependency**; the plot arrives
through `ChartFrame`'s default slot and the product keeps its own library.

`ChartTooltip` is presentation only — no positioning, no pointer tracking, no data. The engine
decides where it goes. Every colour comes from a token, which is the one thing the pattern it
replaces got wrong: its palette was entirely hard-coded.

### `MetricValue` supports one surface, and that is the fix

The pattern this component replaces put a brand-500 value on a `#1f242f` panel — about 1.1:1,
invisible. The cause was not the colour chosen but the absence of a guaranteed
foreground/background pair.

The first version answered that with an `onBrand` prop that swapped in the on-brand text tokens.
**That prop was removed.** An opt-in is a trap you have to remember to escape: the default was still
the illegible pairing, and the component still shipped a way to get it wrong. Measured in the
browser at the time, `onBrand` gave 12.89:1 and its absence 1.38:1 — the 1.38 was reachable, which
was the problem.

`MetricValue` is now supported on the default surface only. The bad pairing is impossible by
construction rather than something a caller opts out of. A metric that genuinely needs to sit on a
brand surface should reopen this decision rather than reintroduce the prop.

The `--ds-semantic-text-*-on-brand` tokens stay — they come from Figma, and an unreferenced token is
a palette entry, not dead code (ADR-0003).

### Meaning never rests on hue alone

`Callout` and `Toast` derive their icon from their tone, so a warning still reads as a warning in
greyscale. `MetricValue` changes the arrow as well as the colour. `PasswordField` changes the glyph
as well as the colour on a satisfied rule.

### ScrollShadows became a Scrollbar capability, not a component

The 16th primitive on the list is not a component. `Scrollbar` already owns the scroll container and
tracks position; a second component owning a scroller would have nested one inside the other. Edge
fades are therefore `Scrollbar`'s `shadows` prop.

### Two retrofits ADR-0001 required in the other direction

`Button` hand-rolled a spinner and `Table` hand-rolled a skeleton before either primitive existed.
Both now consume the real component:

- `Button` passes `size="1em"` so the spinner still tracks the button's font size across all five
  sizes, as its own implementation did.
- `Table`'s per-row widths were CSS `nth-child` rules whose precedence mattered — later selectors
  won, so 5n beat 4n beat 3n beat 2n. That precedence is reproduced in `skeletonWidth()`, because
  varying widths are what stop a skeleton reading as a striped block.

Neither retrofit changes appearance. `Scrollbar.vue`, `Spinner.vue` and `Skeleton.vue` are now the
only places those patterns are defined.

### One accessibility fix in an existing component

`InputField`'s `trailing` slot was wrapped in `aria-hidden="true"`. That is right for a decorative
icon and wrong for anything interactive — it would have hidden `PasswordField`'s reveal toggle from
assistive tech. The wrapper no longer sets it; a caller passing decorative content sets it on their
own content. The error and help icons are separate branches and stay hidden. No consumer relied on
the old behaviour.

## What was built

**Primitives** (single element, no composition, no internal state): `Card`, `Spinner`, `Skeleton`,
`DetailRow`.

**Components**: `MetricValue`, `Callout`, `EmptyState`, `Toast`, `StatTile`, `AvatarGroup`,
`PasswordField`, `PhoneField`, `FileDropzone`, `ResizableSplit`, `ChartTooltip`, `ChartLegend`,
`ChartFrame`.

Plus `Scrollbar.shadows`. Seventeen components, 52 exports in total.

## Notes worth keeping

- `PhoneField` welds a native `<select>` into `InputField`'s leading slot rather than composing
  `InputDropdown`: the prefix has to sit *inside* the same bordered box as the number, which a
  popover cannot do — and a native control keeps the keyboard and the mobile picker for free.
- `FileDropzone`'s drop area is a `<label>` wrapping a visually hidden input, not a `div` with a
  click handler. That is what makes it focusable and keyboard-operable at no cost. The input is
  clipped, never `display: none`, or it would stop being focusable.
- `ResizableSplit`'s handle is a `role="separator"` with ARIA values and responds to arrows, Home
  and End. A separator that only obeys a pointer is unusable by keyboard.
- `Spinner` slows its animation under `prefers-reduced-motion` rather than stopping it — a frozen
  spinner reads as a hung interface. `Skeleton`, where a still placeholder is perfectly legible,
  stops.
- `DetailRow` renders `dt`/`dd` but supplies no `<dl>`: three shells shared that line and each owned
  its own container. Wrap a group yourself.

## Token discipline, audited not assumed

The seventeen components were checked by script rather than by eye, and three things were wrong on
the first pass:

**Focus rings were reinvented in five components.** `AvatarGroup`, `ChartLegend`, `FileDropzone`,
`PasswordField` and `ResizableSplit` each wrote `outline: 2px solid …` when the design system already
ships `--ds-focus-ring-*` and the established convention is
`outline: none; box-shadow: var(--ds-focus-ring-brand)`. All five now follow it. `HelpIcon` carried
the same pre-existing drift and was aligned too — twenty components now share one focus treatment,
and no component defines its own.

**Two raw primitives leaked into components.** `Callout` and `Toast` reached for
`--ds-color-success-300` / `--ds-color-warning-300`, which CLAUDE.md forbids. The cause is a genuine
gap: Figma's `Colors/Border` set has `border-error` but **no `border-success` or `border-warning`** —
verified against the live file, so our token file was faithful. Figma's answer for status colour at
component level is the `Component colors/Utility/*` family, which we had never ported. Two of its
steps are now ported under their Figma names (`--ds-semantic-utility-success-300`,
`--ds-semantic-utility-warning-300`). **The rest of that family remains unported** — a known gap,
not an oversight.

**One literal duplicated a token.** `Toast`'s `max-width: 24rem` is exactly `--ds-width-xs`.

What deliberately stayed literal: `ChartTooltip`'s 10rem/16rem measure. The widths ramp starts at
320px and reaching for `--ds-space-*` would mean consuming a raw primitive, so there is no honest
token — the two values are declared once as named custom properties at the top of the component
rather than buried as magic numbers, and a caller can override them.

Final state: no literal colour, no raw primitive, no hand-rolled focus, and no length repeated
across three or more components.

## Still open

`PhoneField` ships a small default country list as a convenience. Whether the design system should
carry dial codes at all, or take them entirely from the product, is unresolved.
