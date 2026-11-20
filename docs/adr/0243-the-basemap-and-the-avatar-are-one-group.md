# ADR-0243 — The basemap and the avatar are one group

**Status**: accepted (the owner, on 0.185, 20 Nov. 2026). Amends ADR-0242's rules at the bar's end.

## Context

In 0.185 the bar's end put a rule before the basemap and another between the basemap and the avatar. The owner: the
basemap and the profile must not be separated; the two of them are a group. Only what comes to their left — the page's
action, « Télécharger » — is set apart from them by a rule.

The product tried it with injected CSS, on the ARR zone (with an action) and the Dynamic baseline (without one): the
rule between the thumbnail and the avatar removed, the one before the thumbnail kept.

## Decision

The bar's end is **two groups**:

1. **The page's group**: `#action`, « Télécharger », « Partager ».
2. **The map's and the person's group** (`.ds-map-top-bar__mine`): the basemap, then the avatar.

- **One rule, between the two groups**, and only when the first group is there.
- **No rule inside either group.**
- **`spacing-sm` (6px) between the basemap and the avatar** — the end's own gap. `spacing-xs` was considered; checked by
  eye between the 36px thumbnail and the 40px avatar, 6 reads as a pair without crowding.

## Measured

At 1 440, the four bars of « L’action du projet » plus « Sur la carte »:

| Bar | End |
|---|---|
| Action and « Télécharger » | action, download, rule, [basemap · avatar] |
| Action only | action, rule, [basemap · avatar] |
| No action (the Dynamic baseline case) | [basemap · avatar], no rule |

The thumbnail and the avatar are 6px apart.

Plays: every `MapTopBar` story passes.

## Consequences

In etolbi there is nothing to change: on the ARR zone, « Lancer une baseline sur cette zone » │ thumbnail and avatar; on
the Dynamic baseline, the thumbnail and the avatar alone, with no rule.
