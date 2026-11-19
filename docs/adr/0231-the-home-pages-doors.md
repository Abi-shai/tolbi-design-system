# ADR-0231 — The home page's doors

**Status**: accepted (the product's brief, 19 Nov. 2026; built in the product as `home/door-credits.vue`, tracks A + T2
for the layout and H1 + Y1 for the figure).

## Context

On the home page, the producers' door (the yellow block) gives its place to a **credits door**. The product built it
from the package's pieces — `BrandPattern`, `CreditCoins`, `Tray :surface="false"`, `Scrollbar`, `ModuleIcon`, `Button`,
`Badge` — but kept five things local:

- **The frame.** The door copied its frame from the producers' door: `BrandPattern` forced onto `color-accent-100` in
  style, the brand's ink, `--brand-pattern-ink-alpha: 0.012`.
- **The figure and its unit.** Hand-set in `metric-xl`.
- **The coins' empty margin.** Cut away with negative margins.
- **A white cell per module on the tray.** A grid redrawn locally.
- **A list fade.** The product wanted it more marked at the end.

What the credits are (read in the base): each module has **its own** balance, and there is no common pool. The total
is only their sum. So the door says the total « pour tous les modules », then each module's balance.

## Decision

### `Door`, two zones

`Door` (Structure) is the frame both doors share.

**Two zones**:

- **`#lead`**, the statement: an illustration, a figure or a title, and the action. It keeps its own width, 24rem at
  most, and stands `spacing-md` further in than the tray.
- **`#aside`**, the surface beside it (a `Tray`). It takes the rest.

**The ground** is `BrandPattern surface="accent"` at the sheet's scale (`lg`), with `radius-surface` and `spacing-xl`
inside.

**Side by side** when the door has **48rem of its own width**, `spacing-4xl` (32) apart.

- **A container query, not a breakpoint.** The package has none (ADR-0020). The product's 64rem viewport, minus the
  page's navigation, is about this width.
- **The aside does not grow the row** (`contain: size`). It takes the statement's height, and what it holds scrolls
  inside it.

**Narrower**, the two zones are stacked and the aside is capped at 22rem.

### `BrandPattern surface="accent"` and `bg-accent`

The door's yellow is `accent-100`. `bg-accent-subtle` is `accent-50`, the credits chip's tint (ADR-0028), and too pale
for a door. So **`bg-accent`** is minted, a step deeper than the subtle tint, as `bg-neutral` is to
`bg-neutral-subtle`:

| Mode | Value |
|---|---|
| Light | `accent/100` |
| Dark | `accent/dark-border` (accent/400 blended to 1.55:1, ADR-0029) |

It is a **ground** read with `text-default` / `text-strong`, which is why it has no `text-on-` partner (`bg-neutral` has
none either).

**`surface="accent"`** pairs that ground with:

- **its content** in `text-default`;
- **its ink** (a new `--brand-pattern-ink`): the brand's (`text-brand`), at **1.2 %** — ADR-0214's value for a ground
  that is read on rather than looked at.

### The figure: `MetricValue size="xl"` and `metric-2xl`

The brief's figure (« 874 314 crédits ») is `MetricValue` at a new size, `xl`:

- **The figure** in **`metric-2xl`** (48 / 56, semibold, −1 %; mobile 40 / 48).
- **The unit** on its baseline, `spacing-sm` away, in `label-xl` / `text-default`.
- **The caption** under them (a new `caption` prop, « pour tous les modules »), `spacing-xxs` below, in `body-md` /
  `text-subtle`. At other sizes the caption is `body-sm`.
- **No label above.**

`metric-2xl` is minted because the product wanted the figure larger and nothing went past `metric-xl` (40). It tried
700 at 40, which was too heavy (and there is no Bold, ADR-0003), and 600 at 48, which was right.

`MetricValue` also gains **`loading`**: a placeholder in the figure's place, with the unit and caption kept.

### `CreditCoins trim`

The coins' export carries a wide empty margin, measured on its alpha: 27.4 % above, 26.8 % below, 21.9 % on the left,
9.9 % on the right. `CreditCost`'s composition is drawn with it, but at 128 it set the pile 35px away from the words.

**`trim`** clips to the drawing's own box. **The scale does not change**: `size` is still the whole image's height, so
`trim :size="128"` is exactly the product's coins without the air: 100 × 59.

### `TrayGrid` and `TrayCell`: a white cell per thing, on a tray

The brief asked for this as an option of `Tray` or `ModulesList`. It is two pieces under `Tray`:

**`TrayGrid`** goes in a `Tray :surface="false"`.

- **Columns** of at least **14rem** (`minColumn`), `spacing-sm` apart.
- **Scrolling** in `Scrollbar`, masked, with the long fade (below).
- **The bar** runs in a gutter of its own, never over the figures.
- **Height**: it takes a height it is given (the door's aside), or is capped by `maxHeight`.

**`TrayCell`** is one thing:

- the mark (`#media`, decorative);
- the name in `label-lg-strong`, cut first;
- an optional `Badge sm dot` (« Bas »);
- a **value at its end** in `label-lg-strong` with tabular figures;
- `bg-default`, `radius-surface`, `spacing-md` / `spacing-lg` padding.

Neither knows about modules: the door passes them.

`Tray` itself is now a flex column, so what it holds can take the height it is given. Its head and surface stack as
before.

### `Scrollbar fade="long"`

The decision the brief left open: **a longer fade at the end, not a blur**.

- **What it is**: `fade="long"` fades the trailing edge over **64px**, `Dialog`'s side panel's foot fade (ADR-0079),
  masked or painted. The leading edge keeps its 24px.
- **Why not a blur**: a progressive blur is a backdrop filter over moving content — costly — and blur is the map's
  glass (ADR-0172), not a page's.

## Measured

Storybook, Chromium, 1 280:

| What | Value |
|---|---|
| Door | 1 248 wide, its ground `rgb(254, 247, 195)` (`accent-100`) |
| Statement | 259 wide |
| Aside | 925 wide; three columns of 298 × 48 cells; the list 187 high, the statement's height less the tray's head |
| Coins | 100 × 59 (`trim`, size 128) |
| Unit | 18px, `label-xl` |

Narrow (30rem):

- the zones are stacked;
- the aside is 352 high (22rem);
- the list scrolls, its end fading over 64px.

## Consequences

**The product**:

- replaces `door-credits.vue`'s frame with `Door`;
- replaces its figure with `MetricValue size="xl"` (`caption`, `loading`);
- replaces its coins with `CreditCoins trim :size="128"`;
- replaces its grid with `TrayGrid` + `TrayCell`;
- moves `door-producers.vue` onto `Door` too.

**Outside the package (server)**: a « low » threshold per module. Today only the total has one; the product marks « Bas »
under 20 % of what a module received.
