# ADR-0207 — On a tray, the plates in the softest grey

**Status**: accepted (the owner, 17 Nov. 2026 — track P2). This amends ADR-0206, and ADR-0166 for `ProjectList`'s
picture.

## Context

« Accès rapide » (`ModulesList layout="page"`) and « Derniers projets » (`ProjectList`) share the tray and its hover
since 0.162.1. Each module logo sat on a plate (`__plate`) and each project on a picture tile (`__picture`), both in
`bg-neutral` (#f2f4f7). On the white surface that drew a row of strongly marked grey squares.

The owner compared three variants on the real page, at rest and under the pointer, and retained **P2**.

## Decision

### At rest

The plate and the picture tile are **`bg-neutral-subtle`** (#f9fafb, gray-light/50): the tray's own grey, the softest
the package has above white. The eye goes to the logos and the drawings, no longer to the squares.

### Under the pointer and on focus

- The tile or the row takes its hover ground (`--on-tray-hover`, `bg-neutral-subtle-hover`, #f2f4f7), as before.
- **The plate or picture steps to `bg-neutral`** (#f2f4f7), so the whole area lights in one tone. Both change over
  `quick`, and at once under reduced motion.
- **P1 was declined.** There the plate stayed #f9fafb under the pointer and read as a light square in the middle of
  the hovered area.

### Unchanged

- **The current module keeps its brand plate.** The step to `bg-neutral` excludes it, so its plate stays
  `bg-brand-subtle` on focus and `-hover` under the pointer.
- **Article cards are not concerned**: their frame only shows without a picture.
- **In dark**, the same roles take their dark values.

## Measured

| What | Value |
|---|---|
| `ProjectList` pictures at rest | `rgb(249, 250, 251)` |
| The focused row's picture | `rgb(242, 244, 247)`; the others unchanged |
| Module plate, rest → hover | `rgb(249, 250, 251)` → `rgb(242, 244, 247)`, the tile `rgb(242, 244, 247)` |
| Current module | `rgb(230, 240, 235)` at rest and on focus; `rgb(178, 209, 193)` under the pointer |
| Dark, plate at rest | `rgb(38, 49, 43)` |
