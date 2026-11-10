# ADR-0144 — A reading floor of 14, a body of 16

**Status:** accepted — 10 Nov. 2026 (etolbi, accessibility feedback)

## Context

Users found the product's text too small on desktop. Contrast was already AA and the scale is in `rem`, so the
browser's preference is followed; the lever left was the size. The desktop scale read `body-sm` / `label-md` at
**12px** — buttons' small sizes, badges, tabs, table headers, captions, tooltips — and `body-md` / `label-lg` at
**14px**. References the product named: GOV.UK (19 / 16), USWDS (16–17, floor 14), Material « body large » 16.

The request: in the tokens, not component by component — a **floor of 14**, a **body of 16**, `+2` on the steps above
so the hierarchy holds, headings `lg`/`xl` and metrics unchanged, `label-xs` removed; line heights and control heights
reviewed with it. The product's Tailwind sizes and Nuxt UI already point at our roles.

## Decision

### The scale (desktop, `semantic.web.json`)

| role (and its `-emphasis` / `-strong`) | was | is |
|---|---|---|
| `body-sm`, `label-md` | 12/16 | **14/20** — the floor |
| `body-md`, `label-lg` | 14/20 | **16/24** — the body |
| `body-lg` | 16/24 | **18/28** |
| `label-xl` | 16/24 | **18/24** |
| `heading-sm` | 14/20 | **16/24** |
| `heading-md` | 16/24 | **18/24** |
| `code-md` | 13/20 | **14/20** — the floor applies to code too |
| `heading-lg`, `heading-xl`, `metric-lg`, `metric-xl` | — | unchanged |
| `label-xs` | 11/16 | **deleted** (deprecated by ADR-0132, no consumer) |

`label-xl` was not in the request and moves for the same reason `body-lg` does: at 16 it would equal `label-lg`, two
names for one size. One primitive is added, `typography.font-size.18`.

**Line heights stay on the 4px grid and every content area fits its box**: Poppins' content area is 1.4 em, so 14/20
(19.6) and 16/24 (22.4) hold their glyphs; 18/24 (25.2) overflows by 0.6px a side, which only `label-xl` and
`heading-md` — single-line roles — carry.

### A control holds its height; the padding gives

The line boxes grew by 4px (20 → 24, 16 → 20). Left to the cascade, **449 of 642 stories changed height** — `Button md`
42 → 46, `sm` 38 → 42, every field, trigger, segment and list row with them — and with them every layout the product
has tuned on those numbers: the filter bar at 38 (ADR-0108), the md field at 46 (ADR-0101), the 36px navigation row
(ADR-0034), the 40px menu row (ADR-0113), the 32px timeline targets (ADR-0115). So **a control's height is its role,
not its text** — the padding gives:

- `control-padding-xs` 4/10 → **2/10**, `-sm` 8/12 → **6/12**, `-md` 10/14 → **8/14** (`lg`, `lg-compact`, `xl`, `2xl`
  carry `label-xl`, whose line box did not move). That one change holds `Button`, `InputField`, `InputDropdown`,
  `DropdownTrigger`, `SideNavItem`.
- By hand where the inset is the component's own: `DropdownItem` 9 → 7 (md) and 8 → 6 (sm), `DropdownSelectItem`
  10 → 8 with a 44px floor (a label alone has a 24 line, a supporting `body-lg` 28), `Breadcrumbs` 4 → 2,
  `ButtonGroupItem` 6 → 4 (md) and 4 → 2 (sm), `Tag` 3 → 1 and 4 → 2, `Badge lg` 4 → 3, the collapsed `SideNavItem`
  8 → 6 vertically, `MapTimeline`'s periods 6 → 4 vertically (still 32px targets).
- A box whose height came from a 24px avatar now equals its text sibling: an avatar `DropdownItem` 44 → 40, an avatar
  `DropdownTrigger` sm 42 → 38 — **one height per size**, which the old values were not.
- `InputDropdown multiple` declares its field's height (46 / 38): its tags (24) are now lower than the placeholder's
  28px line, and a field that shrank as the first choice arrived would move the form.

### What takes the floor rather than the body

A role a step down **so the type stays where it was** — where a component sets text beside something that did not grow,
or in a width that did not:

- **`Badge md`** and the **`CreditsChip` reminder** take `label-md` (14), not `label-lg` (16): a status is read at the
  floor. `Badge md` keeps 20px; `sm` grows 18 → 20, so the two now differ by their inset.
- **`Tabs`**: `md` takes `heading-sm` (16, a button's size — `heading-md` went to 18), `sm` takes `label-md-strong`
  (14): at 16, a `MapPanel lg`'s head (328px) cut « Données · Parcelles 128 · Rapport », which it held whole at 14.
- **`MetricValue`'s unit** takes `body-sm` (14) beside a 32px figure and `body-md` (16) beside 40: the figures did not
  grow, and at 16 « 28 940 tCO2e » ran 2px out of a 2 × 2 tile in a reading panel.
- **`TolbiAiPanel`'s title** takes `label-md-strong` (14): « Nouvelle conversation » needs 182px at 16 and has 158
  (ADR-0069 held it whole at 14). « ALPHA » grew with the floor and took 2px back, so the badge follows the chevron at
  14px instead of 16.
- **`--reading-secondary-font`** (ADR-0132) goes back to `body-sm` in `MapPanel lg` and `Dialog`: it raised captions
  from 12 to 14 in a reading panel, and 14 is now the floor everywhere — at `body-md` a caption would sit at the
  body's 16.

### What grows with its text

A width drawn for 14px text is moved by the same ratio, **16/14**:

- **`ProjectCard`**: `max-width` 17.5em → **20em** (280 → 320 at 16px). ADR-0040 wrote it in `em` so the shell would
  follow the type — but the `em` is the inherited one, which did not move. At 17.5em the dMRV card's two figures
  spilled 33px past its edge. The stories' grids go 280 → 320.
- **`ModuleCapsule`**: the identity ceiling 260 → 296, the delta 300 → 344, the progress column 300 → 344 (still fixed —
  a ruler, ADR-0031).
- **`MapLegend` and `MapTimeline`**: `--ds-width-sm` (480) → **`--ds-width-md` (560)**, still one token for both
  (ADR-0116). At 480, five years and « Comparer » no longer fit (four did, the fifth scrolled under the fade); at 560
  they do, and the bars still clear a 400px panel on a 1424px map by 16px.

Text blocks — paragraphs, descriptions, captions, tooltips, rows of a list that wrap — simply grow: that is the
request. `Badge`, `Tag`, `BadgeGroup` are marks and grow with their text where the floor moved them.

## Measured

Every DS block root in every story (642) before and after, and every element whose content overflows
its box horizontally, before and after; noise between two identical runs (a spinner, a marquee) excluded.

- **Controls unchanged**: `Button` (all sizes), `InputField`, `InputDropdown`, `DropdownTrigger` (text), `ButtonGroup`
  (rail 42 / 38, segments 32 / 28), `Tabs` (44 / 36 / 28), `SideNavItem` 36, `DropdownItem` 40 / 34,
  `DropdownSelectItem` 46 / 38, `Breadcrumbs` 28, `Tag` 24 / 24 / 30, `Badge md` 20, `lg` 24, `MapTimeline` 48 with
  32px targets, `HorizontalNavigation` 48, `CreditsChip` 38 / 40.
- **301 stories change height**, all in text: a `FormField` +4 (its label), `OptionCard` +4 to +26, `ProjectCard` +16
  to +18, `MapPanel lg`'s reading panel 707 → 751, `Toast` 46 → 50 (74 when it wraps), `Tooltip` +4 a line,
  `StatusRow` +4, `Accordion` +4 an item.
- **New overflows**: none that cut content except where the component already truncates on purpose (a long
  `DropdownItem`, a table cell e-mail) and a `ModuleCapsule` wider than the story's 1248px canvas — it lives in a
  marquee.
- `npm run lint`, `npm test` (47), `vue-tsc`, `npm run build`, and every story's `play` function (642, 0 failures).

## Consequences

- The product's Tailwind and Nuxt UI sizes follow the roles: nothing to do there but the version.
- A product layout that hard-codes a 280px card column should go to 320, or the card is squeezed back to 17.5em.
- Mobile (`[data-typography="mobile"]`, opt-in) is **unchanged** and now sits **below** desktop at the floor
  (`body-sm` 13 against 14). Not in scope — the request said desktop — but the floor is an accessibility rule, not a
  desktop one.

## Still open

- The mobile scale against the floor.
- `Badge sm` and `md` are one type size now (14); they differ by 2px of inset. One size may be enough.
