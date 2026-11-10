# ADR-0155 — The hand on every field

**Status**: accepted (etolbi product decision, 10 Nov. 2026)

## Context

The input fields showed the browser's cursors: the text cursor over a native control, the arrow over the box's padding.
Since ADR-0154, a press anywhere in `DatePicker` opens its calendar. The product asks for **one cursor across the form**:
the hand (`pointer`) on the box and on its native control, for every input.

The convention runs the other way. Most systems leave the text cursor over a field: it says « text goes here », and the
hand usually says « this acts ». The product chose the hand, so that every field reads the same way as the controls
around it. This is a product decision and it is applied as given.

## Decision

`cursor: pointer` on the box and on its control:

- **`InputField`**: `.ds-input-field__wrapper` and `.ds-input-field__input`. `PasswordField` and `PhoneField` (its number)
  render `InputField`, so they follow. `PhoneField`'s country list and `PasswordField`'s toggle already had the hand.
- **`TextareaInputField`**: `.ds-textarea__wrapper` and `.ds-textarea__input`.
- **`VerificationCodeInputField`**: its cells already had the hand. Unchanged.
- **`DatePicker`**: the box and its segments. ADR-0154's text cursor over the segments is gone.

**Disabled is unchanged**: `not-allowed` on the box and on the control. These rules come after the hand, or are more
specific than it, and they win.

**A hand must not point at nothing.** A press on the box's padding, or on a glyph, used to land on no element. It now
puts the focus in the field's control: the `<input>` or the `<textarea>`. The press's default is cancelled, so the
focus does not go to the body first. A control of the box's own keeps its press: a button, a list, a link, a segment,
anything focusable. `DatePicker` has no native control in the box; its own handler opens the calendar (ADR-0154).

## Measured

Computed `cursor` on every `Saisie/` story of the five fields: `pointer` on boxes and controls, `not-allowed` on every
disabled box and control (seven stories). A press 3px inside the left edge of the box puts the focus on
`.ds-input-field__input` in `InputField`, `PasswordField` and `PhoneField`, and on `.ds-textarea__input` in
`TextareaInputField`.
