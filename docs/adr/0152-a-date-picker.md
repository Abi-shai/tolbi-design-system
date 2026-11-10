# ADR-0152 — A date picker

**Status:** accepted — 10 Nov. 2026 (etolbi; the owner's frame, Figma `4116:3094`, benchmark `4114:3075`)

## Context

The package had no date picker. The product carried three outside it — two `v-calendar`s and a hand-made year grid —
and needed « Année de plantation » (ARR) now. A benchmark of 19 sources (MUI X, Ant, Mantine, Windows CalendarView,
PrimeVue, Ark UI, React Aria, Carbon, GOV.UK …); the owner retained one component in four modes, and ruled out
drop-downs in the caption and wheels.

## Decision

**`DatePicker`** — `granularity` (`day` | `year`) × `range`.

- **The field is typed, by segments** (React Aria's model): `AAAA`, or `JJ/MM/AAAA` in the order and with the
  separator the locale writes (`Intl.DateTimeFormat.formatToParts`). Each segment is a `spinbutton`: digits type in
  and move on once the segment is full or no digit could follow (a month past 1, a day past 3); ↑ ↓ step it (from
  today when empty, months and days wrapping); ← → cross segments; Backspace takes a digit back. A range is two
  values, `start → end`. **The box is `InputField`'s** (ADR-0001) — it gains a **`#control` slot** that replaces its
  `<input>` while the box, ring, error and trailing slot stay its own. The calendar button is `PasswordField`'s shape,
  a bare 20px glyph, so the field keeps its height (46 / 38).
- **The panel opens under the field**, in the top layer (`popover`, `useAnchoredSurface`, ADR-0078), entering as
  anything that floats does (`SurfaceTransition`), 300px as drawn. It opens on the value's page, else today's, held
  inside the bounds.
  - **Years**: 4 × 4, cells 64 × 36 six apart, **paged on `min`** — not on a decade (no `min`: on multiples of 16,
    which is what makes 2016–2031). Past `min` / `max`, greyed and refused, and the page arrow goes out.
  - **Days**: six weeks always (the panel never changes height), the locale's first weekday, cells 36 round four
    apart, another month's days receding but choosable. The title « Mars 2026 ⌄ » is `DropdownTrigger`'s chip:
    it opens the same year grid, a year brings back the same month in it, Escape there returns to the month.
  - **Marks**: chosen = the brand's fill and its ink; today / this year = a `border-brand` contour (the owner's
    « filet »); inside a range = `bg-brand-subtle` and its ink.
  - **A range** is two picks in the same grid, in either order; after the first the pointer previews the second;
    the second closes. A made range is summed up over the grid — « 2016 → 2026 · 11 années ».
  - **Keyboard** (WAI-ARIA grid): ← → ± 1, ↑ ↓ ± a row (4 years, 7 days), Page Up / Down ± a page (16 years, a
    month), Enter or Space picks, Escape closes and hands the focus back to the calendar button.
- **Out of bounds is refused**: the value is not taken (the model keeps the last valid one) and **`invalid`** emits
  why — « Entre 2011 et 2031 », « À partir de … », « Jusqu’à … », « La fin précède le début » — and `null` once
  it is accepted. The message is **the `FormField`'s** (ADR-0008): the product binds `@invalid` to its `error`.
  Standalone, the box turns red with no words.
- **Values**: a year is a `number`, a day an ISO `string` (`2026-03-12`), a range `{ start, end }`; `min` / `max`
  take either. No time and no time zone — a calendar day is a label.

## Measured

`Saisie/DatePicker`, four `play` tests: a year picked in the grid becomes the value and closes it; « 1998 » typed is
refused, « Entre 2011 et 2031 » shown, the value kept, then « 2024 » accepted and the message gone; ↑ on a day steps
it, a day picked becomes the value; two years picked in reverse order make `{ start: 2018, end: 2026 }` and close.
Keyboard traced: from 2024, → 2025, ↓ 2029 (next page), Page Down stops at `max` 2031, Page Up 2015, Escape → the
button; in a month ↓ is the next week and Page Down the next month. The panel sits 8px under the field's edge.

## Still open

- The product's three pickers to replace.
- A typed range across a month boundary in a narrow field (two full days need ~330px).
