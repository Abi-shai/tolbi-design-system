# ADR-0210 — A row without a plate

**Status**: accepted (the owner, 17 Nov. 2026). This amends ADR-0208 and ADR-0209 for the home page.

## Context

On the home page, the 3rem plate took the title's room. In the 21.5rem column, « Apprendre » with its « Recommandé »
badge was cut to « Apprend… ».

The owner compared four versions on the real page:

1. the current row;
2. without the plate;
3. without the chevron;
4. without both.

He retained **no plate, chevron kept**. The title holds, and the chevron still says that the row leads somewhere.

## Decision

### The plate follows the slot

The plate is rendered **only when `#media` is filled** (`v-if="$slots.media"`). Without it, the row starts at its
words.

These do not change: the row's padding, the gap between text and chevron (`spacing-md`), the chevron (20px,
`text-subtlest`, never giving way), the badge on the title's line, the tray's hover on the whole row, the focus ring,
and the title as the control's name.

A row with `#media` stays as ADR-0209 left it.

## Measured

At 21.5rem, without `#media`:

| What | Value |
|---|---|
| Rows | 60px high (64 with a plate) |
| Words | start 8px inside the white surface (the row's padding) |
| « Apprendre » | 87.3px, whole |
| « Recommandé » | 118.6px, after it on the same line |
| Chevron | at the row's end, as before |
| With a plate | the same title had 78.7px, ending flush on its badge |

## Consequences

The product removes the three `#media` from « Actions rapides ». `CreditCoins` and `ModuleIconStack` stay in the package
for other surfaces.
