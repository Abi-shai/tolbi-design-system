# ADR-0093 — The catalogue, reorganised

**Date:** 2026-10-28
**Extends:** ADR-0007 (classification by function), ADR-0012 (a check that always says the same thing
is indistinguishable from a broken one)
**Source:** « pourquoi je ne vois pas ces composants dans notre design system ? » — then « réfléchissons
plus à l'organisation dans le code et sur Storybook ». Audit in `.context/organisation-catalogue.md`,
read off the files: 78 folders, 85 entries.
**Status:** Accepted

## Decisions

### The status axis was saying nothing — 17 `stable` against 68 `wip`

Eighty percent of the catalogue claimed to be in progress, including `Badge`, `Card`, `Icon`, `Logo`,
`FormField`, `Dropdown`, `Toast`, `Table` and `Checkbox` — all of them in production. **Nothing had ever
moved from `wip` to `stable`**: the seventeen were born stable and the rest were born `wip` and stayed.
That is ADR-0012's own argument about the linter, pointed at a tag: a signal that never changes carries
no information.

**The test, written down**: a component is `stable` when an ADR settled its form, its stories show every
state it has, and changing it now would be a breaking change. `wip` is what the catalogue has **not
finished deciding**, and it now has to be justified.

Applied, that is **84 `stable` and 5 `wip`** — `StatusList` (ADR-0092 defers whether the row leads
anywhere; it shipped the same morning), `Report` (ADR-0089 defers the cover and the product's print
view), `OptionTree` (one flow, one consumer, and no ADR came back to it), `Map` (ADR-0087 settled the
chrome against a single GIS frame) and `Carousel` (ADR-0088 settled the format; nothing consumes it
yet).

One criterion of the four could **not** be checked from this repository: whether the product has
actually adopted a component. Any of the 84 that no screen uses belongs back in `wip`, and only the
product can say which.

### A Docs page is a rule, not a coin flip — 45 of 85 → 108 of 108

`autodocs` was a per-story tag, so whether a component had a documentation page depended on the day it
was written: `Badge`, `Card`, `Icon`, `FormField`, `Dropdown`, `Toast` and `Button` had none. It is a
**global** tag now, in `.storybook/preview.ts`; a piece with genuinely nothing to document opts out with
`!autodocs`.

### A tenth category: `Mouvement`

`MarkTransition`, `RevealTransition`, `SurfaceTransition` and `SwapTransition` are exported from
`components/index.ts` and had **no story at all** — and they are the pieces of the catalogue easiest to
get wrong: the unscoped `<style>` (ADR-0021), the grid that has to sit on the transitioning element
(ADR-0025), `mode="out-in"` (ADR-0026), the double `requestAnimationFrame` (ADR-0032). Every one of
those is a silent failure.

They are behaviours, not structures, so they get their own category rather than being filed under
`Structure`. ADR-0007's nine categories become ten, alphabetical as before. Each now has a story that
**plays on a click** — measured: the surface and the mark change content, the swap changes height by
2px, the reveal travels 118 → 216px.

### Tolbi AI stops being eight addresses in five categories

`Actions/TolbiAiLauncher`, `Feedback/TolbiAiThinkingLine`, `Identité/TolbiAiSpark`, `…/TolbiAiVoiceNote`,
`…/TolbiAiWaveform`, `Saisie/TolbiAiComposer`, `Structure/TolbiAiPanel`, `Structure/TolbiAiPanel/Pièces`
— a coherent family of eight, none of which is usable outside the panel but the sign and the launcher,
with no common address. They are now `Superposition/Tolbi AI/…`.

This is **ADR-0007's own sub-component rule applied, not an exception to it**: the panel is the parent,
the rest are its pieces. It needed no tenth category and no new rule — which is the reason to prefer it.
The panel is `…/Tolbi AI/Panel` rather than `…/Tolbi AI`, so « Tolbi AI » stays a pure folder and
Storybook does not have to be both a component and a folder at one path.

### `Données/Carte` becomes `Données/Map`

The only translated component name in the catalogue. The prose is French and the names are not — that
is already the repository's rule; one entry had drifted from it.

## Deliberately not done

**The folders were not renamed.** `components/Dropdown` holds `InputDropdown` and `components/OptionCard`
holds `OptionList`, which the audit listed as drift. It is not: a folder holds a *family*, and renaming
one costs an import churn across the repository for something no one browsing Storybook can see.

**The categories were not rebalanced.** They run 4 (`Étiquettes`) to 19 (`Superposition`). Moving a
component to even them out changes its address, and an address that moves costs more than an imbalance
that shows.

### Amended the same day — the eight pieces have their addresses

`AccordionItem`, `ReportSection`, `ReportSignature`, `MapPanel`, `MapControls`, `MapOverlay`,
`OptionCard` and `StatusRow` were documented **inside their parent's story**, so they were invisible in
the sidebar where `Dropdown/Item` and `Toast/Region` were not. ADR-0007's rule said they should have
their own entries; they do now — `Structure/Accordion/Item`, `Structure/Report/Section` and
`/Signature`, `Données/Map/Panel`, `/Controls`, `/Overlay`, `Saisie/OptionList/Card`,
`Données/StatusList/Row`. **116 entries**, 19 new stories, every one rendered and checked.

A piece's own story is the one place its *own* decision can be shown, and each of the eight had one the
parent's story had no room for: `AccordionItem` alone is a **disclosure** (`v-model:open`), which is what
half the screens actually need; `ReportSection` **numbers itself** from a CSS counter, so inserting one
renumbers the rest; `ReportSignature` turns an empty field into **a line to write on**; `MapPanel`'s
20rem ceiling is **for text** and a row of buttons widens it; `MapControls` carries `aria-pressed` for a
tool that stays on; `MapOverlay` **draws nothing at all** — it is a place, and only its children take the
pointer; `OptionCard` alone is **a row that leads**, with no chosen state; `StatusRow` is a `dt`/`dd`
pair that wants its `<dl>`.

The rule to keep: a piece gets its own entry when it has a decision of its own to show. That is why
`AvatarGroup` and `BadgeGroup` stay where they are — they are components, not pieces.

## Still open

Nothing from this ADR. The audit it came from is in `.context/organisation-catalogue.md`.
