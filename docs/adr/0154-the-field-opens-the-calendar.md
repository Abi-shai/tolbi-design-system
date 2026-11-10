# ADR-0154 — The field opens the calendar

**Status**: accepted (etolbi feedback on 0.128, 10 Nov. 2026)

## Context

`DatePicker` (ADR-0152) opened its panel from the calendar button only. A press in the middle of the box did nothing,
not even focus a segment, and a press on the text edited the segment with the panel closed. The product tested five
libraries' demos: Ant Design, Atlassian and Carbon open the calendar on a press anywhere in the field and keep typing
possible. React Aria and MUI X open from the button only, but a press in the field at least focuses a segment.

## Decision

**A press anywhere in the box opens the panel**: on a segment, on the empty part, on the icon.

- **On a segment**, the press also focuses it, and **the grid does not take the focus**. The user types with the panel
  open, and a complete, in-bounds value is committed without closing it.
- **Elsewhere in the box** (empty space, separator, the range's arrow), the first segment of the nearest end takes the
  focus. A press used to land on nothing.
- **The icon stays**, as a sign and as a touch target. It keeps its own toggle: it opens with the focus in the grid, and
  closes.
- **`multiple` has no typing**, so the whole box is the trigger. It opens with the focus in the grid, as the button
  does. The cursor is the hand there and the text cursor elsewhere.

**The grid follows what is typed**. `DateCalendar` takes a `follow` key and moves its view there without the focus:

- a year once it has four digits: its page of 16, and the cell is chosen through the draft;
- a day once its month is typed: that month, on the typed day or the 1st.

In a range, it follows the end being typed. A typed year out of bounds pages to the nearest bound. It stays refused, as
before.

**The keyboard decides on its own**:

- **Tab does not open**: a focus is not a request.
- **Alt+↓ or Enter** on a segment opens the panel and puts the focus in the grid. Pressed while it is already open, they
  move the focus into it. Segments ignore Alt combinations, so Alt+↓ is not a step down.
- **Escape** closes the panel and hands the focus back to where it was opened from: the segment, or the button. A pick
  does the same.

The Escape in a segment is cancelled (`preventDefault`), so a `Dialog` around the field does not close with it
(ADR-0077, ADR-0083).

## Measured

`Saisie/DatePicker`, `play` tests:

- **« Le champ ouvre le calendrier »**: a press on the box's empty part opens the panel on today's page (2016 – 2031)
  with the year segment focused. Typing 2008 turns the page to 2000 – 2015 with 2008 `aria-selected`, the focus still
  on the segment. Escape closes the panel and the focus stays. Alt+↓ opens it with the focus on 2008, and Escape gives
  the focus back to the segment.
- **« Jour »**: a press on the day opens « Mars 2026 » and keeps the focus. ↑ gives 13 mars. ← then « 05 » turns the
  grid to « Mai 2026 ». The 20th picked gives `2026-05-20`.
- **« Plusieurs années »**: a press on the listed years opens the grid.
