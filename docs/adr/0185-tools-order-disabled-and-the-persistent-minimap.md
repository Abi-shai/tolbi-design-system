# ADR-0185 — The tools' order, a tool that is off, and a mini-map that persists

**Status**: accepted (the owner, 16 Nov. 2026). This amends ADR-0171.

## Decision

### 1. One order in every module

The package sorts the tools it knows, whatever order the product passes them in:
- **Rechercher** (`search`);
- **Filtres** (`filters`);
- **Informations** (`info`);
- then the mini-map, then zoom and « Recentrer ».

A missing tool leaves no gap: the next one moves up. A tool the package does not know (`layers`, …) comes after the
known ones, in the product's order, and before the mini-map.

### 2. A tool that is off reads as off

A `disabled` tool:
- shows `cursor: not-allowed`;
- has no ground on hover and no pressed veil (`:not(:disabled)` already guards both);
- draws its glyph in the whole `text-disabled` on map glass (ADR-0174).

Its tooltip still shows: the anchor takes the pointer the disabled button drops (ADR-0082). `MapTool.disabledHint`
is said after the name while the tool is off: « Informations — sélectionnez un élément ».

**Contrast of the off glyph** (`gray-500`):
- 4.97:1 on white;
- **2.95:1** on pilot glass over the darkest imagery, computed unblurred (`#1f3a1c`, brightened ×1.12). That is just
  under 3:1. The app's blurred pixels read about 0.1 higher, as subtle did (ADR-0172). WCAG exempts a disabled
  control.

### 3. The mini-map is a toggle that persists

> **Amended by ADR-0186**: the last action wins — a card or a sheet turns the mini-map off, it no longer comes back by itself; it sits at the column's top.

**State.** `v-model:minimap-open`, **`true` by default**: a screen with a mini-map arrives with it open. The product
may keep the state for the session.

**The button**
- It turns the mini-map on and off (`aria-pressed`); it is no longer a card among the tools' cards.
- Nothing else turns it off: **no press outside, no Escape**.

**When something else takes the right**
- A tool's card (Rechercher, Filtres) or a sheet (`MapPanel`) hides the mini-map while it is there.
- When they leave, the mini-map **comes back by itself**, and its button stays on throughout.
- The sheet is read off the overlay by the column's mutation observer, which now watches the subtree: `MapPanel`
  arrives inside a host with no box of its own.

**Placement.** The mini-map card sits where the tool cards do: to the column's left, its top on its button's.

`v-model:tool` no longer takes `minimap`.

## Measured (`Données/Map/Navigator`, tools passed as `layers, info, filters, search`)

| What | Result |
|---|---|
| Rendered order | `search, filters, info, layers, minimap` |
| On arrival | mini-map open, its button `aria-pressed="true"` |
| A press on the map, then Escape | the mini-map stays |
| « Rechercher » opened | the mini-map is hidden, its button still on |
| « Rechercher » closed | the mini-map is back |
| Its button pressed, then pressed again | off (`aria-pressed="false"`), then on |
| A sheet open | the mini-map is hidden |
| The sheet closed | the mini-map is back |
| « Informations » with no sheet | disabled, `not-allowed`, `#667085`, no ground under the pointer; tooltip « Informations — sélectionnez un élément » |
