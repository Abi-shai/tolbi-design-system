# ADR-0095 — A list you can type into

**Date:** 2026-11-02
**Extends:** ADR-0085 (`Flag`, `flag-leading`), ADR-0078 (the list in the top layer), ADR-0081 (a list in a
field's box), ADR-0069 (a search field at the top of a list)
**Source:** etolbi, feedback of 2 Nov. 2026 on 0.82 — item 1 (« Créer une déclaration »: no search, no typing,
95 of 195 countries an empty box; « tant que la recherche et le jeu complet manquent, les 4 autres sélecteurs
de pays de l'app restent sur Nuxt UI ») and item 4 (`StatTile` in a row of seven).
**Status:** Accepted

## Decisions

**Search goes with any type.** `type` was one axis holding two questions — what leads an option (a flag, an
icon, an avatar) and whether the list can be filtered — so `flag-leading` and `search` excluded each other, and a
country list could have its flags or its search, not both. `searchable` is a prop of its own now; `type="search"`
stays as the older spelling. The field sits **at the top of the list**, ruled off from what it filters, outside
the scroll — `Dropdown`'s `#header` shape (ADR-0069) — so the trigger keeps its flag and stays a `<button>` (a
button cannot hold an input). Matching ignores accents and case (« cote » finds « Côte d'Ivoire »), and what
starts with the query comes first (« c » is Cambodge before Nouvelle-Calédonie). Nothing found says so
(`noResultsLabel`, a `role="status"`).

**The list had no keyboard.** Each option was a tab stop — 195 presses of Tab through a country list — and no
key moved through it. It now follows APG's select-only and editable combobox: the focus stays on the field (its
button, or the search field), the options are not tab stops, and `aria-activedescendant` names the **active**
option, drawn as hovered. ↓ / ↑ open it on the chosen option; ↑ ↓, Page ↑ ↓ and, outside a search field, Début /
Fin move; Entrée chooses (and, in a multiple list, ticks and stays open, as Espace does); Échap closes and hands
the focus back to the field — the search field it was in is gone. **A letter goes somewhere**: on a closed
field it opens the list (into the search field when there is one); in a list without search it goes to the next
option starting with it, the same letter again cycles, and letters typed within 500ms spell a prefix
(« co » → Colombie, « cot » → Côte d'Ivoire). A click in the list keeps the focus on the field. The listbox
moved off the panel onto the options' own container: a search field and a foot cannot be children of a listbox.

**The whole of ISO 3166-1.** ADR-0085 shipped 100 flags to stay light (54 KB). The product needs every country,
and an empty box is worse than a heavier file: **249** — the assigned ISO 3166-1 alpha-2 codes, all that
country-flag-icons draws except the eight that are not ISO codes (AC, EU, IC, TA, XA, XC, XK, XO). The registry
goes **54 → 164 KB, 16 → 45 KB gzipped**; it is still one module, so a product that never renders a flag does
not load it. The product can drop the icon set it loaded for Nuxt UI's flags.

**A tile's label takes two lines.** Seven tiles in a row are ~152px: one line cut « Polygones non éli… ». The
label clamps at **two** lines, and the figure moves to the foot of the tile's body (`margin-top: auto`): the row
stretches every tile to one height, so a tile whose label wraps keeps its figure on the line of its neighbours'
— measured, seven tiles, labels of one and two lines, the seven figures at the same `top`. A row of one-line
labels is unchanged.

## Not decided here

The collapsed two-level `SideNavigation` (item 2: the rail showing the panel's pages when there is a panel)
reverses ADR-0046's « collapsed closes the panel and nothing else ». It is a behaviour, so it is drawn and
validated first (« montrer le mécanisme avant de pousser »).

## Still open

No screen reader has heard the active option announced (the gap of ADR-0052 and ADR-0090).
