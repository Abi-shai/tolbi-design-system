# ADR-0238 — A legend is a key, not data

**Status**: accepted (the product's feedback of 20 Nov. 2026 on `MapLegend`). Amends ADR-0138 (the key unfolded in
columns) and ADR-0193 (the names wrapping in columns).

## Context

The owner's rule: a legend says what each symbol and each colour stands for; it does not give the data. etolbi no longer
passes `value` to the Dynamic baseline's symbols — the figures are in the panel and in the « Analyser » view.

Without a figure, `ChartLegend`'s four columns (mark above, name below) have no reason left to exist, and the names cut
onto two lines for nothing (« Point du / projet »). The product tried the symbols in a line with injected CSS: mark then
name, as `ChartLegend` reads in a panel, wrapping when room runs out, `spacing-md` / `spacing-2xl` apart, the mark at
20px. The legend's width does not change.

## Decision

**The fold's layout is derived from the data, never chosen.**

- **No entry has a `value`**: the unfolded key is a line (`ChartLegend` horizontal). Each entry is its mark (20) and
  then its name. Entries wrap when room runs out, `spacing-md` between lines and `spacing-2xl` between entries.
- **An entry carries a `value`**: the columns stay (mark, figure, name), for a product that does need a figure on the
  map.

The names stay at 14px in **`label-md`**, the type of every block laid on the map (the years timeline, the tool cards),
and the legend aligns with them. It is passed through `--reading-secondary-font`, the variable `ChartLegend` already
reads for its labels.

The other answer — dropping the columns, since a legend does not count — was set aside. The columns cost nothing while
nobody passes a figure, and the decision stays with the data.

## Measured

On « Symboles, sans nombres », at 900px:

| What | Value |
|---|---|
| Legend | 560 wide (unchanged), 97 high open |
| Entries | one line, 130 / 147 / 72 / 106 × 20 |
| Gap | 8 / 20 |
| Glyph | 20 |
| Names | `500 14px / 20px` Poppins |

No name is cut.

Plays: every `MapLegend` and `ChartLegend` story passes, the unfolded figures included.

## Consequences

In etolbi there is nothing to change: the SIG's legends (Carbone, ARR, zones) follow the package.
