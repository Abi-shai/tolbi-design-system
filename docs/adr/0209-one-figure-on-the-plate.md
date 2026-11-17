# ADR-0209 — One figure on the plate

**Status**: accepted (the owner, 17 Nov. 2026 — track B). This amends ADR-0208's three rows.

## Context

0.163 put the « Actions rapides » block on the home page, and each row's 3rem plate held a different illustration:

| Row | Illustration | Box | How it sat in the plate |
|---|---|---|---|
| Credits | `CreditCoins` at 32 | 36.6 × 32, ink about 25 × 15 | breathing room |
| Members | two silhouettes, `AvatarGroup xs` | 42 × 24 | edge to edge |
| Training | two logos, `ModuleIconStack` 24 | 42 × 24 | edge to edge |

The owner found the two duos cramped and « un peu off ». He compared two tracks on the real row:

- **A** keeps the same idea, smaller. It needed an `xxs` avatar (18) and the stack at 18, in a 2rem box. It was drawn
  and measured, then declined.
- **B** puts **one figure** on each plate. It was retained.

## Decision

### Each plate holds one figure, about 2rem, centred

The coins at 32 are the reference.

- **Inviter des membres** takes a single silhouette, `Avatar size="sm"` (32).
- **Se former** takes the « learn » glyph, `Icon name="book-open"`, at 24.
- **Gérer les crédits** keeps `CreditCoins :size="32"`.

### The plate's ink is grey

`ActionListItem`'s plate sets `color: text-subtlest`, so a bare `Icon` placed in `#media` is greyed without the product
setting a colour. This is the same ink as the avatar's silhouette, so the two greyed figures match.

### What A left behind

- **No `xxs` avatar.** A size with no consumer is the `blur-*` ramp again (ADR-0019), so it was taken back out.
- **`ModuleIconStack` keeps one fix found while drawing A.** Its ring now scales with the logo, as the overlap and the
  corner already did: a twelfth of the size, so 2px at 24 and 1.5px at 18. A fixed 2px would eat a ninth of a small
  logo.

## Measured

In the plate, at 21.5rem, the offsets are measured from the plate's corner:

| Row | Figure box | Offset |
|---|---|---|
| Members | 32 × 32 | 8, 8 |
| Credits | 36.56 × 32 | 5.72, 8 |
| Training | 24 × 24 | 12, 12 |

The book's ink is `rgb(102, 112, 133)`, which is `text-subtlest`.

## Consequences

The product passes `<Avatar size="sm" />` and `<Icon name="book-open" />` in `#media` for those two rows.
`ModuleIconStack` stays exported, with no consumer on this block.
