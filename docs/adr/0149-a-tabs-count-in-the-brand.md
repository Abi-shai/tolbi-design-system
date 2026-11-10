# ADR-0149 — A tab's count in the brand

**Status:** accepted — 10 Nov. 2026 (the owner's decision, through etolbi)

## Context

The owner decided that the badge of a tab that counts objects — « Parcelles 240 », « Points 40 », « Témoins 200 » —
takes the brand's colour, while a badge that signals a problem (alerts, quality, an auditor's requests) keeps its
tone. `Tabs` drew every badge `neutral`, and `BadgeTone` had no brand: ADR-0009 keeps brand interactive-only.

## Decision

- **`Badge` gains `tone="brand"`** — the brand tint and its exact ink, as every tone is drawn: `bg-brand-subtle`,
  `border-on-brand-subtle`, `text-on-brand-subtle`, dot `bg-brand-solid`, outline `border-brand`. It does not break
  ADR-0009, on ADR-0014's ground: **a brand badge is the count of what a control leads to**, so it sits inside a
  control — a tab — and never on a statement. Its documentation says so.
- **`TabsItem.badgeTone`** (`BadgeTone`, default `neutral`) chooses a tab's badge tone, item by item — the count is
  `brand`, a problem keeps `error` / `warning`.

## Measured

`text-on-brand-subtle` on `bg-brand-subtle`: **8.83:1** in light (`#044B28` on `#E6F0EB`), **6.70:1** in dark
(`#8CBAA3` on `#142E22`) — asserted by `contrast.test.mjs`'s pairing loop, which reads every `text-on-*` against its
ground in both modes. The outline's `border-brand` is 3.29 / 5.06:1 on `bg-default` (ADR-0044). Rendered in
`Navigation/Tabs` « Ton du badge »: « Parcelles 240 » in the brand, « Alertes 3 » in error, both modes.
