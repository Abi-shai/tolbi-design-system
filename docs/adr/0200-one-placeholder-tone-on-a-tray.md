# ADR-0200 — One placeholder tone on a tray

**Status**: accepted (the owner, 16 Nov. 2026). This amends ADR-0195 and ADR-0198.

## Context

On the home page, while loading, the article cards' placeholders were darker than « Derniers projets »'s, on the same
`Tray`.

The cause dates from 0.158 (ADR-0195). The card then had a grey ground, so its `Skeleton`s took `surface="tinted"`:
- the picture in `emphasis="strong"` (ink at 14 %);
- the words at 10 %.

Since 0.159 (ADR-0198) the card has no ground and sits on the tray's white surface, as `ProjectList`'s rows do. Their
placeholders use the default tone.

## Decision

- **`ArticleCard`'s placeholders take the default tone**: no `surface="tinted"`, no `emphasis="strong"`. That is
  exactly what `ProjectList`'s use.
- **Every placeholder on a tray has that tone.** The tray hands nothing down for it, unlike its hover (ADR-0199):
  `Skeleton`'s default tone is the one solved against `bg-default`, and that is the tray's surface. What the tray
  asks of its content is to leave the tone alone.
- A context variable would have carried a value equal to the default, which is ADR-0039's two-names-for-one-thing
  in another form.

## Measured (`Données/ArticleList` and `Données/ProjectList`, loading)

| What | Value |
|---|---|
| Articles' placeholders, base / sheen | `#f2f4f7` / `#f9fafb` (were ink veils at 14 % and 10 %) |
| Projects' placeholders, base / sheen | `#f2f4f7` / `#f9fafb` |
| Loading card | 288 × 257, unchanged |
