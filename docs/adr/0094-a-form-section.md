# ADR-0094 — A form section

**Date:** 2026-11-02
**Extends:** ADR-0001 (render the component, never redraw it), ADR-0006 (one surface where one was drawn),
ADR-0008 (`FormField` owns the label; `group` owns several controls), ADR-0081 (`InputField` options,
`#label-action`), ADR-0079 (the side panel)
**Source:** the DDR side panel « Créer une déclaration » (etolbi, `rrd.vue`), redrawn with the package on the
page « Left panel » (`3390:1427`) — the old maquette's fields (`3390:13158`), spacing track A of a 19-system
benchmark (`3404:2792`), validated; then the board « ↪ EUDR — FormSection · Benchmark et pistes »
(`3409:1427`), 16 systems + W3C WAI, four recommendations, **validated as drawn**.
**Status:** Accepted

## Context

The panel was right and nothing in the package said why. Its sections — a title, a sentence, then fields on a
tinted ground — were written by hand: `<p class="[font:var(--ds-font-label-lg-strong)]…">` three times in
`rrd.vue`, twice in `folder.vue`, once in `zone-selector.vue`, and our own Figma example of the side panel
draws its « Titre de section » by hand too. Each page also chose its own gaps, so the spacing just validated
would have reached only the page it was drawn on.

Measured against the benchmark, the old gaps were the outliers: **12 between fields** (median 16; one source of
17 tighter) and **16 between sections** (median 32; one of 11 tighter) — and the head sat 12 above the first
field, the same as one field above the next, so the three levels fit in 4px and nothing stepped.

## Decisions

**Three layers, three owners.** The panel's shell is `Dialog placement="side"` (ADR-0079) and stays the
package's. The grammar of a sectioned form — what a section is, the gaps between its parts — enters the package
here. The DDR form itself — which fields, their order, their labels, the EORI and EU rules, the API — stays the
product's: a `DdrCreationPanel` would have one consumer and the backend's rules (ADR-0049, ADR-0069).

**`FormSection` is a heading, not a `<fieldset>`.** The benchmark splits five and five (Carbon, GOV.UK, shadcn,
Chakra, Mantine against Polaris ×2, Primer, UI5, Untitled), and the two that have both — Atlassian, SLDS — use
the heading to **cut a form** and the fieldset to **relate fields**. Ours cut: « Informations du commerçant »
holds a name, a country, an address and a phone, and W3C WAI notes that some screen readers read a legend
before every control — five times here. Related controls already have their group: `FormField group`
(`role="group"`, named by its label). The title is `h3` by default with `headingLevel` 2–6 — `Accordion`'s
own prop — and the sentence is plain text under it, read in order (Polaris: a subheading « isn't announced as
part of the heading »). `#description` takes over when the sentence carries a link.

**One surface, and not a prop.** The section renders `Card variant="sunk"` (ADR-0001: the surface exists, so it
is used, not redrawn), padding `none`, and pads itself. One system of 16 makes the surface a prop (Mantine);
the unboxed track B was drawn and lost — without a ground, where « Activités » ends and the lone field after it
begins is read from space alone. A value is added when a second page asks; a prop with one value is a decision
postponed.

**Track A, one step per level.** **16** between the section's children, **20** between its head and them, **20**
of padding, **4** between title and sentence (they read as one head). No outer margin.

**`FormLayout` owns the 24 between blocks.** Six systems give the gap to a container (Polaris FormLayout,
shadcn FieldGroup, UI5 and S2 Form, Carbon Stack), five to a margin on the section. A form alternates sections
with lone fields — here the reference number and « Informations supplémentaires » — and a margin on the section
would space it from its siblings but not them from each other. So `FormLayout` is a column with one fact,
`gap: spacing-3xl`, and no surface, margin or `<form>`: the form is the product's, which knows where it submits.

**Not now:** actions on the section's title row (4 of 16), collapsing (2), a « required » mark on the section
(2) — none has a consumer.

**Figma.** `FormSection` and `FormLayout` are components on Home with **slots** (`Champs`, `Blocs`), so a panel
is built from instances with no detached frame; the DDR panel (`3400:2876`) is rebuilt that way. Three pieces
were added on the way, all from code values: `InputField` gains « Liste au bout » + « Option » (ADR-0081's
list inside the border), `Button` gains `Variant=Link`, and `TextareaInputField` gets a component (128px as a
**minimum height**, or a swap into `FormField` collapsed it to 44).

## Consequences

The product writes `<FormLayout>`, `<FormField>` and `<FormSection title description>` and no spacing class.
`rrd.vue`'s three sections, `folder.vue`'s two and `zone-selector.vue`'s one can each lose their hand-written
title and their `gap-[var(--ds-spacing-…)]`.

Found on the way, the product's: `rrd.vue`'s activity type is `FormField group` with **no label**, so the radio
group has no accessible name; the stories give it « Type d'activité ».

## Still open

Whether the sentence should be tied to the section (`aria-describedby` on a `role="group"`) once a screen
reader has heard it both ways — three systems do. No screen reader has heard it yet (ADR-0052, ADR-0090).
