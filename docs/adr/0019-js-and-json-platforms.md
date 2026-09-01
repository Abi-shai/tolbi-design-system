# ADR-0019 — JS and JSON platforms, and why not native

**Date:** 2026-09-01
**Status:** Accepted
**Follows:** ADR-0017, which noted no platform beyond CSS was configured

## Context

Style Dictionary emitted only CSS. The maturity gap was real, but the framing around it was not: I
had said a `platforms` block would "make the mobile type scale consumable as ADR-0003 specifies."

**That is necessary but not sufficient.** ADR-0003 defines the mobile scale as a *native* context —
`sp` on Android, Dynamic Type on iOS. There is no native app, and **zero components use
`[data-typography="mobile"]`**. An Android XML export would be consumed by nobody, which is the
`blur-*` ramp all over again: a stub for a feature that never landed, going stale unobserved.

## Decisions

### JS and JSON ship; native does not, yet

Two platforms, both with consumers today:

- **`./tokens/js`** — `index.js` + `index.d.ts`, ~30 kB.
- **`./tokens/json`** — a flat resolved map, for DTCG-adjacent tooling.

Native ships **the day a native app exists**, on the same rule that brought `bg-overlay` back and
built the chart palette: a consumer, not a hypothetical. The mobile type scale stays open, and its
blocker is correctly named — not a missing export, a missing consumer.

### The values are resolved, and that is the whole point

The JS export holds `#6172f3`, not `var(--ds-chart-categorical-1)`.

That is deliberate. It exists for **what a CSS custom property cannot serve**: a canvas-rendered
chart cannot read a custom property, and neither can a computation. Anything rendering to the DOM
should keep using the CSS — it preserves the cascade, and a resolved value is stale the moment the
token moves.

### Which makes it a second source of truth, so the linter forbids it inside the library

An eleventh rule, `no-token-js-import`: a component importing the resolved JS export is bypassing
the cascade. The export is for **consumers of the package**, not for the package itself.

It ships with a firing test, a silent test, and a mutation proving the tests bite — the practice
ADR-0018 established. Seventeen tests now.

### The series palette carries its own rule

The reason the JS platform earns its place is charting, and a consumer wants an ordered list rather
than seven constants:

```js
import { chartCategorical, chartCategoricalCeiling } from '@abi-shai/tolbi-design-system/tokens/js'
```

`chartCategoricalCeiling` is `5`. ADR-0016 measured that ceiling and stated it in prose; here it is a
value a consumer can assert against. A rule that only lives in a document is a rule that gets
discovered late.

## What changes

- `platforms` block emitting `index.js`, `index.d.ts` and `tokens.json`.
- Package exports: `./tokens/js` and `./tokens/json`, alongside the existing CSS entries.
- `chartCategorical` and `chartCategoricalCeiling` appended to the JS build.
- Eleventh lint rule, `no-token-js-import`, plus its tests.

## Still open

- **Native platforms**, deferred above with an explicit trigger.
- **The mobile type scale**, whose blocker is a consumer rather than a format.
- **One colour mode** — the last structural item, and the only one where the semantic layer's central
  claim is untested.
