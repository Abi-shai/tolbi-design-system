# ADR-0156 — The cursor says what the press does

**Status**: accepted (etolbi, 10 Nov. 2026). Supersedes ADR-0155's cursor and keeps its press on the padding.

## Context

ADR-0155 put the hand on every field at the product's request, against the convention, and said so. The product then
measured the cursor shown on hover in 13 design systems: Ant, MUI, Mantine, Nuxt UI, shadcn, Atlassian, Carbon,
React Aria and others. **None** shows the hand over a field that is typed into. The request was withdrawn as wrong.

## Decision

**The cursor says what the press does**:

- you type → the text cursor, `cursor: text`;
- you choose without typing → the hand;
- disabled → `not-allowed`.

| Where | Cursor |
|---|---|
| `InputField` box and `<input>` (`type="search"` included), so `PasswordField` and `PhoneField`'s number | text |
| `TextareaInputField` box and `<textarea>` | text |
| `VerificationCodeInputField` cells (the hand since before ADR-0155) | text |
| `DatePicker` box and segments | text — even though a press anywhere still opens the calendar (ADR-0154): Ant, Carbon, MUI and React Aria show the text cursor on a typed date field that opens a calendar, and the hand appears only where the field *is* a button (Mantine's `DatePickerInput`) |
| `DatePicker` calendar icon | hand |
| `DatePicker multiple` (chosen, never typed) | hand, unchanged |
| `InputDropdown` trigger, `PhoneField`'s country, `PasswordField`'s toggle, list triggers | hand, unchanged |
| A list's filter field (`InputDropdown` searchable, in the trigger or atop the list) | text — it was inheriting the trigger's hand |
| `readonly` | text, as an ordinary field (MUI, Ant); a fake field used as a button is the product's problem, not the package's |
| Disabled, everywhere | `not-allowed`, unchanged |

**Kept from ADR-0155**: a press on the box's padding or a glyph focuses its control. It is not about the cursor: a press
there used to land on nothing.

## Measured

Computed `cursor` over every story of `InputField`, `PasswordField`, `PhoneField`, `TextareaInputField`,
`VerificationCodeInputField`, `DatePicker` and `InputDropdown`, with every dropdown opened so its filter field exists:

| Element | Count | Cursor |
|---|---|---|
| Typed boxes | 42 | text |
| Typed controls | 96 | text |
| Filter fields | 3 | text |
| `multiple` box and list | 2 (box counted once) | hand |
| Calendar icons | 11 | hand |
| Dropdown triggers | 25 | hand |
| Phone countries | 7 | hand |
| Password toggles | 4 | hand |
| Disabled boxes and controls | 17 | `not-allowed` |

No story renders a `readonly` field; the rule covers it through the control's `cursor: text`.
