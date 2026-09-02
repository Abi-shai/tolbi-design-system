# ADR-0015 — Clearing the carried items

**Date:** 2026-09-01
**Status:** Accepted
**Closes:** every open item from ADR-0009 through ADR-0014 except the mobile type scale

## Context

Six ADRs left a tail of small open items. Worked through together they turn out to be four different
kinds of thing, and only one was the defect it was filed as.

## Decisions

### Motion has no primitive tier, and that was always right

Filed as "motion's layer violation": `motion.duration.enter` and `.considered` are intent names
living in `primitives.json`, which no other foundation does.

The violation is the **filename**, not the design. ADR-0002 named these by intent deliberately, and
there is no numeric ramp beneath them because there should not be: six durations aliased 1:1 by six
intent names would add no decision — the `fg` failure mode ADR-0009 deleted. A duration *is* the
decision. The same holds for the four easings.

`tokens/src/motion/primitives.json` becomes `semantic.json`. No token name changes, nothing breaks.
Motion is the one foundation that is semantic-only, and now it says so.

### The scrim does not blur, so the blur ramp goes

ADR-0010 asked whether `bg-overlay` gaining real alpha made the four `blur-*` tokens live again.

It does not. They have **zero product consumers** — the only reference is their own Storybook story —
and no semantic tier, so they are not a palette anyone picks from; they are a stub for a feature that
never landed. `bg-overlay` at 60% already separates a dialog from the page at 4.94:1 (ADR-0010), and
`backdrop-filter` is expensive enough to want a reason rather than a default.

Deleted, along with the story and `BlurCard.vue`. If a modal ever wants blur it returns as **one**
token with a measured reason, the way `bg-overlay` itself did.

### The avatar hairline is one concept, and it does have an honest token

Filed as "two hairline rings remain `rgba(0, 0, 0, 0.08)`; there is no honest token, because the
darkest colour is gray-950, not black."

Measured, that reasoning does not hold: **8% gray-950 and 8% pure black differ by 2/255** on white —
imperceptible on a sub-pixel border. So `--ds-border-inset` is added under ADR-0009's clause 4:

```
--ds-border-inset: color-mix(in srgb, var(--ds-color-gray-light-950) 8%, transparent);
```

described as the hairline that keeps a filled circular shape legible against any background.

### `Badge`'s palette and "the component tier" were already closed

Two items were stale text rather than outstanding work. `Badge`'s categorical hues were resolved by
ADR-0010's implementation (35 display-palette references, zero hex — recorded in ADR-0014), and "the
component tier, one member so far" was answered by ADR-0010 itself: 33 tokens, an admission rule and
a public/private split.

An ADR's *Still open* section is a claim about the present, and it decays. Worth re-reading before
trusting.

### The nine spacing literals are reviewed and deliberate

ADR-0013 said a third scale for nine values was not worth naming, which was a judgement without a
record. Each is now accounted for, and one had an honest token after all — `Slider`'s `-8px` thumb
offset became `calc(-1 * var(--ds-spacing-md))`.

| Value | Sites | Why it stays |
|---|---|---|
| `3px` | `Badge`, `Tag`, `TextareaInputField` | Chip micro-padding, between `space.0-5` (2px) and `space.1` (4px). Three uses, no concept |
| `10px` | `BadgeGroup`, `Button` gap | The control half-step. Exists as `space.2-5`, but the t-shirt ramp has no slot between `md` and `lg` and inventing one would be the naming problem the literature warns about |
| `9px 10px` | `DropdownItem` | Menu-row padding — near `control-padding-sm` (8px 12px), not equal. Snapping it would move a row for tidiness |
| `-1px` | `FileDropzone` | A border-overlap trick, not spacing |
| `36px` | `Slider` | Off-ramp layout value (the ramp has 32 and 40) |
| `0.25em` | `ChartTooltip`, `MetricValue` | Deliberately em-relative: it tracks the font size |

## What changes

- `tokens/src/motion/primitives.json` → `semantic.json`; build comment records why.
- `blur-*` deleted: source, story, `BlurCard.vue`, and the build entry.
- `--ds-border-inset` added (**66 semantic colour tokens**); `Avatar` and `CreditsChip` migrated; the
  linter's colour-literal allowlist drops from four entries to two.
- `Slider`'s thumb offset tokenised.

## Still open

- ~~**`CreditsChip` hand-rolls a mini avatar**~~ — **withdrawn** by ADR-0016. The image is a currency glyph, not a person; ADR-0001 does not reach it. The claim rested on misleading class names, now renamed.

- ~~**`HorizontalNavigation`'s drop shadow**~~ — closed by ADR-0016: it was drift, not an exception. Now `elevation-overlay`.

