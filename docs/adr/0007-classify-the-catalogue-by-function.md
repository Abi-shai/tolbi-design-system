# ADR-0007 — Classify the catalogue by function, not by atomic level

**Date:** 2026-08-28
**Status:** Accepted
**Supersedes:** the four-tier nav introduced alongside ADR-0003

## Context

The nav had four tiers — `Foundations`, `Primitives`, `Subcomponents`, `Components` — and the load
was badly distributed: 12 / 10 / 4 / **38**. The tier that needed subdividing was the only one that
was not, and `Subcomponents` had stayed at 4 entries because the rule had only ever been applied
once.

A second symptom: component status lived in two places that had already diverged. Storybook carried
`tags: ['wip']` on 8 components; the hand-maintained table in `Introduction.mdx` declared 42. Nothing
linked them and nothing flagged the drift.

## Benchmark

Four systems, taxonomies read off their published documentation rather than from memory:

| System | How components are organised |
|---|---|
| **Nuxt UI** (the library the product uses) | Six functional buckets — Element, Form, Data, Navigation, Overlay, Layout — plus domain packs |
| **Atlassian** | Ten functional categories, plus `Primitives`, Libraries, Tooling and `Deprecated` as separate tiers |
| **Primer** (GitHub) | Components alphabetical and flat; categories only for Patterns; status on its own page |
| Literature | The recurring split is Actions · Inputs · Feedback · Navigation · Status |

Two findings decided this:

**None of them navigates by atomic level.** Atlassian keeps exactly one `Primitives` tier and groups
everything else functionally. The documented criticisms of atomic design target precisely its use as
a *navigation* taxonomy: the molecule/organism boundary is arbitrary, and components get shoehorned.

**None of them has a `Subcomponents` tier.** A part of a parent is documented on the parent's page.

## Decision

Two tiers — `Foundations` and the nine categories — and nothing else.

`Actions` · `Données` · `Étiquettes` · `Feedback & chargement` · `Identité & média` ·
`Navigation` · `Saisie` · `Structure` · `Superposition`

As they appear in the sidebar — 4, 7, 4, 6, 5, 6, 11, 3, 6 — for 48 components plus the 4 pieces
nested under their parent. Nothing under 3, nothing over 11.

### Why functional and not the atomic tiers

The question a category answers is **"where is the thing that does X?"** — the question of whoever is
browsing. "How composed is it?" is a maintainer's question, and a tier is an expensive way to answer
it. Mapping our own inventory made the cost concrete: keeping `Primitives` left three categories at
one entry and split four families in two — `Badge` from `BadgeGroup` and `Tag`, `Avatar` from
`AvatarGroup`, `Card` from `ResizableSplit`, `Spinner`/`Skeleton` from `ProgressBar`.

### Categories are alphabetical

Any "by importance" ordering is a judgment that gets re-argued on every addition, and predictability
is the whole point. Atlassian orders its own categories the same way.

### `primitive` is a tag, not an address

The rule survives verbatim — one element, no composition of DS components, no internal state — and
is now enforceable rather than aspirational. Applied strictly it marks **8** components, where the
old tier held 10: `Badge` composes `Icon`, and `Scrollbar` carries seven refs of internal state. The
tier had been holding both by habit. That is the tag doing work the tier could not.

### Status lives on story tags, and only there

Every component story carries exactly one of `stable` (10) or `wip` (42). The table in
`Introduction.mdx` no longer enumerates components; it explains the tags and their counts. One source
of truth, next to the code, filterable in the sidebar — and unable to drift from itself.

## Consequences

- Parts of a parent are titled under it: `Actions/ButtonGroup/Item`,
  `Superposition/Dropdown/Item`, `Superposition/Dropdown/Divider`,
  `Saisie/InputDropdown/SelectItem`. Their stories moved address, not content.
- `DropdownSelectItem` sits under `InputDropdown`, not `Dropdown`, because `InputDropdown.vue` is the
  only component that renders it — checked, not assumed.
- Removing that ambiguity surfaced a redundant story: `Dropdown` carried a
  `DropdownSelectItem — types` demo covering exactly what the dedicated story already covers, at the
  wrong address. Deleted, along with its now-unused import.

## Cases that will move with use

`HelpIcon` (overlay, or help?), `ModulesList` (navigation, or data?) and `ProgressSteps` (navigation,
or feedback?) are all defensible in two categories. They are placed, not settled. Moving one is a
one-line title change — which is the point of not encoding the taxonomy in the directory structure.
