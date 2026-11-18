# ADR-0221 — The GIS bar, drawn again

**Status**: accepted (the owner's product brief « MapTopBar, deuxième version », from his sketches, 18 Nov. 2026).
Amends ADR-0216's start and end; the bar, its glass, its rule (ADR-0220) and its transitions (ADR-0219/0218) are
unchanged.

## Context

ADR-0216's bar ended on the person: ⋯, Partager, a rule and the profile. The owner drew it again around what a GIS
project is used for — the module, the map, the file — and the person moved into the module's menu.

## Decision

### Start: the module's menu, « Retour », the project's name

- **The mark is a menu.** The illustration (48) and a `chevron-down` (16, `text-subtle`) share one hover zone:
  `--on-glass-hover`, `radius-control`, under the pointer and while the menu is open. It opens the package's `Dropdown`
  as it is, at its start, 18rem. Its name is « Menu {module} » (`moduleMenuLabel`), and the drawing inside is decorative.
  Without `#module-menu`, the mark is the named drawing alone, as before.
- **The menu's rows are the product's** (`#module-menu`), in the order the stories show: Aller à l'accueil (`house`),
  Retour aux projets {module} (`folders`); a divider; Apprendre (`book-open`), Paramètres (`settings`), Notifications
  (`bell`); a divider; Se déconnecter (`log-out`, `tone="danger"`). The rule is ADR-0113's: the heavy action is
  `danger`, last, after a divider.
- **« Retour »** is unchanged: `Button sm secondary-gray`, `arrow-left`, `spacing-lg` after the mark.
- **The project's name** (`projectName`) comes next, `spacing-lg` after « Retour »: `label-lg-strong`, `text-strong`,
  one line, cut in an ellipsis. It is the first thing to give, and it is given whole in a tooltip **only when cut**
  (ADR-0109).

### `DropdownCredits`: the credits at the head of a menu

The menu opens on the module's credits (`credits`; absent means no header). It is a new piece for `Dropdown`'s
`#header`, reusable wherever a menu concerns a module's credits.

- **The block**: `bg-neutral-subtle`, `radius-inner`, `spacing-md` in and between. It holds `CreditCoins` at 32, the
  balance in `heading-sm` / `text-strong` (`Intl`, `locale`) over « crédits {module} disponibles » in `body-sm` /
  `text-subtle`, and a `chevron-right` (20, `text-subtlest`).
- **States**: hover and keyboard focus take `bg-neutral`; nothing moves. There is no « Recharger »: the block is the way
  to the credits.
- **It is a control**: an `<a>` with `href` (`creditsHref` in the bar), a `<button>` otherwise. It emits `select`, but
  not on a modified click on a link (ADR-0165); the bar re-emits it as `credits` and closes the menu.
- **In a menu it is a menu item.** A menu may hold menu items and nothing else, and the arrows walk `[role^=menuitem]`.
  `Dropdown` therefore now provides its `role`; the block reads it and takes `role="menuitem"` in a menu. Measured: ↓
  from the block lands on « Aller à l'accueil ».
- **`balance: null`** is a balance on its way (ADR-0054): a `strong` placeholder in the figure's line, never `0`.

### End: three groups

The end is three groups, `spacing-sm` apart inside, with a vertical rule between two groups that are both present
(`border-subtle`, 20px, `spacing-xs` on each side):

1. **The project's action** (`#action`, one `Button sm`, with `actionCount`), unchanged.
2. **The map.**
   - « Rechercher » (`search`, `IconButton sm ghost` `search`) emits `search`: the map's search leaves the tools column
     for the bar. `searchOpen` makes it wear the open state.
   - **The basemap** (`basemaps` + `v-model:basemap`, two or more) is drawn by `MapBasemapPicker`.
3. **The file.**
   - « Télécharger » (`#downloads`, `IconButton sm ghost` `download`) opens a `Dropdown` at its end, 16rem, holding the
     product's rows: what ⋯ held.
   - « Partager » is unchanged.

**Removed**: ⋯ (`#menu`, `menuLabel`), the profile and its rule (`#user-menu`, `userInitials`, `userName`, `userEmail`,
the `user` event). The account's actions are in the module's menu. `MapTopBar` is `wip` and no screen had adopted it,
so they go rather than being deprecated.

### `MapBasemapPicker`: the basemap, chosen by its picture

**The trigger is the active basemap.**

- It is a 28px thumbnail in a 2px white frame (`spacing-xxs`), with `radius-inner`, a `border-subtle` hairline and
  `elevation-control`. It shows the basemap alone, with no project data.
- Open, it takes the brand ring: the border and one pixel outside it, 2px of `border-brand-solid`, plus
  `focus-ring-brand` as a light halo.
- Its name is « Fond de carte : {active} » (ADR-0081: a trigger is named with its value).

**The panel** sits at the trigger's end and lays the basemaps side by side: a 72px thumbnail each (with an inset
hairline drawn over the picture, ADR-0201), and its name under it in `label-md`.

- **The active basemap** is marked the catalogue's way (ADR-0050): `bg-selected`, `text-on-brand-subtle`,
  `label-md-strong`, and its picture ringed in `border-brand-solid` at 2px.
- **Semantics**: a menu of `menuitemradio`s. The arrows walk them, and a choice closes the panel.

**The images are the product's** (`src`, or `#thumbnail`); the package draws the frame, the selection and the panel.
The picker is public because a map without the bar may need it too.

## Measured

At 1 440 × 760 (Storybook, Chromium):

| What | Value |
|---|---|
| Bar | 1440 × 56 |
| Mark menu | 70 × 48 at 16 (drawing 48 + chevron 16) |
| « Retour » | 103.6 × 38, 12 after it |
| Name | 24 high, 12 after « Retour » |
| Switch | centred, 231.7 × 42 |
| Module menu | 290 wide; credits block 276 × 60 |
| End | action 38, rules 1 × 20 (4 on each side of them, plus the gap), search, download and share 36, basemap trigger 28 |
| Basemap panel | two choices of 84 × 110 (thumbnail 72) |
| Download panel | 258 wide (16rem plus its border) |

Plays: the module's menu opens on its credits and closes on them; a basemap is chosen by its picture; « Télécharger »
opens its rows; « Retour » emits.

## Consequences

On the three GIS screens, the product:

- passes `#module-menu` (its rows, its routes and the sign-out), `credits` / `creditsHref`, `projectName`, `search` /
  `searchOpen` (its map search moves out of the tools column), `basemaps` with their thumbnails, and `#downloads`;
- drops `#menu` and `#user-menu`.
