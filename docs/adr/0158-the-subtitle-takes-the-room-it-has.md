# ADR-0158 — `PageHeader`'s sentence takes the room it has

**Status**: accepted (etolbi, 11 Nov. 2026). Amends ADR-0051's subtitle ceiling.

## Context

ADR-0051 capped the sentence under the page's title at `45rem`, the frame's 720px, as a ceiling rather than a size.
On the ARR tabs a sentence of about 110 characters wrapped onto two lines beside empty space up to the actions. The
header grew for nothing: « Mesurez ce qui aurait poussé sans votre projet. Seul ce que votre projet ajoute devient
des crédits carbone. »

The product measured the demos on a 1 600px screen:

| Behaviour | Systems |
|---|---|
| No maximum width; the line wraps only when it does not fit | Nuxt UI PageHeader, AWS Cloudscape Header, GitHub Primer PageHeader, Ant Design Pro PageContainer |
| A relative cap: 75 % of the width, at least 565px | Elastic EUI |
| An ellipsis, and only on a metadata line (« auteur • type • date »), never on a sentence | Salesforce |
| A fixed cap like ours | none |

## Decision

- **No ceiling.** `.ds-page-header__subtitle` loses `max-width: 45rem`. The sentence takes the width `#actions` leave
  it and wraps only where it no longer fits.
- **Never cut**: no ellipsis, no `line-clamp`. A sentence cut loses its sense, and a screen reader cannot know what was
  hidden. A word longer than the column breaks (`overflow-wrap: break-word`, as the title already does) rather than
  running out of the header.
- **Nothing else moves**: `body-md`, `text-subtle`, `spacing-xs` between title and sentence, and the actions dropping
  under the text once it would go below `20rem`.

## Measured

`Structure/PageHeader` « Phrase longue » (the ARR sentence, one `Button md`):

| Viewport | Lines | Header height | Actions |
|---|---|---|---|
| 1 600 px | 1 | 56px | beside the text |
| 1 280 px | 1 | 56px | beside the text |
| 900 px | 2 | | beside the text |
| 640 px | 3 | | beside the text |
| 375 px | 3 | | under the text |

No overflow at any width.
