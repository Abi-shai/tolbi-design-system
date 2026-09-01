# ADR-0017 — DTCG authoring format, nominally

**Date:** 2026-09-01
**Status:** Accepted
**Benchmarked against:** GitHub Primer, IBM Carbon

## Context

All seventeen token sources were authored in Style Dictionary's own shape — `value`, `description`.
The Design Tokens Community Group draft uses `$value`, `$type`, `$description`, and that is what
DTCG-native tooling reads.

## Decisions

### The migration is nominal, not strict — and that is what the benchmarks ship

All seventeen files now use `$value` / `$type` / `$description`. Style Dictionary 5.4.1 reads it
natively, including references and `outputReferences`.

Strict spec-validity is **not reachable** for this token set, and it is worth being plain about why
rather than claiming compliance:

- The 2025 draft models a `dimension` as `{ value: 16, unit: "px" }`. Ours are CSS strings.
- `cubicBezier` is an array of four numbers. Ours are `cubic-bezier(…)` strings.
- `shadow` is an object. Ours are multi-layer strings built with `color-mix()`.
- `--ds-bg-overlay` and `--ds-border-inset` are `color-mix()` expressions, which **no DTCG colour
  type can express** — there is no alpha modifier in the spec.
- The `font:` shorthand from ADR-0011 has no DTCG type at all.

**Primer does the same thing.** Its `$value` holds reference strings like `{base.text.size.xl}` with
`$type: 'dimension'`, not the spec's object form. Nominal DTCG is what a top benchmark actually
ships, so it is the honest target.

`$type` is set only where it is **truthful** — `color`, `dimension`, `fontFamily`, `fontWeight`,
`duration`, `cubicBezier`. Shadows, focus rings, the control-padding pairs and the font shorthands
carry **no `$type`**, because a wrong type is worse than an absent one.

### What DTCG buys, and what it does not

An earlier assessment claimed this migration "unlocks" multi-platform output and a deprecation path.
That was wrong, and checking it is what produced this section:

- **Multi-platform is not gated by DTCG.** Style Dictionary already emits iOS, Android and JS from
  the previous format. The blocker is that no platform is *configured* — a separate piece of work.
- **Deprecation is not gated either.** DTCG has no deprecation field; it would live in `$extensions`
  under either format.

What it actually buys is **interop with DTCG-native tooling** and spec alignment. Real, and narrower
than advertised.

### Verified by diffing the emitted CSS, not by trusting the build

A format migration that "builds fine" can still have moved values. Every emitted declaration was
compared before and after, comments stripped. **Two changes, both benign:**

- Hex is lowercased (`#FFFFFF` → `#ffffff`). Identical colour.
- `--ds-color-base-transparent` became `rgba(0, 0, 0, 0)`. Identical computed value in CSS, and it
  has **zero consumers**.

Both come from Style Dictionary's colour transform, which only runs now that `$type: color` is
declared — so they are the format doing its job rather than drift.

### Descriptions now ship in the token CSS, and cost nothing downstream

`$description` emits as a `/** … */` comment, which the old `description` key did not. So the
contrast contracts are now visible in the artifact: someone inspecting `--ds-text-error` in DevTools
reads *"NOT valid on bg-error-subtle (4.44)"*.

`tokens/dist/index.css` grows 32 → 43 kB, but the **published bundle is unchanged at 12.81 kB
gzipped** — vite strips the comments. Self-documenting where it is read, free where it is shipped.

### Sixteen consumers read the token JSON, and every one broke

The linter and ten Storybook stories read `.value` and `.description` directly. All were updated —
and three of them had *local* fields named `value` that a blanket rename corrupted, caught by
`vue-tsc` rather than by review.

That is an argument for the format change being worth doing once, early: the coupling was invisible
until the key names moved.

## What changes

- 17 token sources migrated to `$value` / `$type` / `$description`.
- `$type` declared on 6 of 9 categories; composites deliberately carry none.
- Linter and 10 stories updated to read the DTCG keys.
- Emitted values unchanged apart from hex case and one unused token's normalisation.

## Still open

- **No platform beyond CSS is configured.** Style Dictionary can emit iOS, Android and JS today; the
  work is a platform block, not a format change. This matters most for the mobile type scale, which
  ADR-0003 defined as a *native* context and which therefore still cannot be consumed as specified.
- **No deprecation mechanism.** Correct at zero consumers, a cliff at one. `$extensions` is where it
  would go.
