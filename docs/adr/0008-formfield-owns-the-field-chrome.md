# ADR-0008 — FormField owns the field chrome; controls render their box

**Date:** 2026-08-31
**Status:** Accepted
**Source:** Figma `04 — Product UI`, node 1:4 (`04 · Écart`) and node 75:7 (`A · Saisie`), read against
an audit of our own input components.

## Context

`FormField` came off the missing-atoms list with 8 recorded usages. Reading it as "a component we
have not built yet" turned out to be wrong. The audit that preceded this decision found the pattern
already implemented **ten times inside the design system**, under three prop names and four levels of
accessibility:

| Control | label | helper text | `required` | `destructive` | `aria-describedby` |
|---|---|---|---|---|---|
| `InputField` | yes | `hint` | yes | yes | yes |
| `TextareaInputField` | yes | `hint` | yes | yes | yes |
| `PasswordField` | delegated | `hint` | yes | yes | yes (via `InputField`) |
| `PhoneField` | delegated | `hint` | yes | yes | yes (via `InputField`) |
| `VerificationCodeInputField` | yes | `hint` | no | no | **no** |
| `FileDropzone` | no | `hint` | no | no | **no** |
| `InputDropdown` | yes | **`hintText`** | no | no | **no** |
| `Checkbox` | yes | **`supportingText`** | no | no | **folded into the name** |
| `Toggle` | yes | **`supportingText`** | no | no | **folded into the name** |
| `Slider` | **homonym** | — | no | no | **no** |

Four facts came out of it:

1. **Three names for one concept** — `hint` (6), `supportingText` (2), `hintText` (1). `InputDropdown`
   used `supportingText` for something else entirely: the subtitle of an option.
2. **`Slider.label` was a homonym.** Its type was `SliderLabel`, a display mode — where the value is
   shown, not a caption. Same word, opposite meaning.
3. **No control had an error message.** `destructive` was a boolean and `hint` doubled as the error
   text, so a field could not show help and an error at once — and only four of ten had `destructive`
   at all.
4. **The helper text was correctly associated in four controls of ten.** `Checkbox` and `Toggle`
   folded it into the accessible *name* — a screen reader announced "Recevoir les alertes Par SMS, au
   numéro déclaré" as one name. Three others did not associate it at all, and `InputDropdown` erased
   its helper text on open (`v-if="hintText && !open"`).

Ten components re-implementing one block is ADR-0001's rule broken from the inside.

## Decision

**`FormField` is the sole owner of everything outside the control's box**: the label, the required
marker, the helper text, the error message, and the wiring — `id`, `for`, `aria-describedby`,
`aria-invalid`, and the native `required` attribute.

Controls render their box and nothing else. `label` and `hint` are gone from all of them.

### The wrapper hands down, it does not demand

Transmission is `provide` / `inject`. `useFormField()` returns `null` outside a wrapper, so every
control still works standalone — the wrapper is an override, never a dependency. Where the wrapper
has an opinion it wins, which is what guarantees `for` and `aria-describedby` always resolve:

```ts
const inputId   = computed(() => field?.id.value ?? props.id ?? `input-${uid}`)
const isInvalid = computed(() => field?.invalid.value ?? props.destructive)
```

The consequence is that the id belongs on the wrapper, never on the control. A control that set its
own id inside a wrapper would silently break `for`; the injection winning removes that failure mode
rather than documenting it.

### Invalidity is derived, never declared

There is no `invalid` prop. A field is invalid **because it has an error message**:

```ts
const invalid = computed(() => Boolean(props.error))
```

The defect this removes is the one the audit found: `destructive` and its message were two
independent props, so a red border with no explanation was one forgotten argument away. It is now
unreachable.

`error` replaces `hint` rather than stacking with it — a field says one thing at a time — and both
render into the same element with a stable id, so `aria-describedby` stays valid across the switch.

### The boundary is the box

What renders **inside** the box stays the control's business; what renders above or below is the
wrapper's. That is why `InputField.helpTooltip` did not move: it is a `HelpIcon` in the trailing
position. And why `FileDropzone`'s copy under the call to action did not move either — it was
renamed `hint` → `supportingText`, because it sits inside the drop area.

That leaves exactly two words in the system, each with a crisp definition:

- **`FormField.hint`** — the field's description, outside the control.
- **`<control>.supportingText`** — secondary copy inside or beside the control.

Both names come from Untitled UI, where they are genuinely two elements.

### One glyph per error, and it lives on the message

ADR-0006 requires that tone never carry meaning alone. The error message therefore carries a
`circle-alert` — the only place *every* control can carry one, since `Checkbox`, `Toggle`, `Slider`,
`VerificationCodeInputField` and `InputDropdown` have no icon slot inside their box.

`InputField` does have one, and rendering both produced two identical red glyphs 40 px apart. It now
steps aside when the wrapper is already showing the message, and stays for standalone use, where it
is the only non-chromatic signal available:

```ts
const wrapperShowsError = computed(() => Boolean(field?.invalid.value && field?.describedBy.value))
```

### Inline-label controls keep their label

`Checkbox`, `Toggle` and `Slider` place their caption *beside* the control, not above it. A wrapper
that stacks label-over-control is wrong for them, so they keep their own `label` and enter a
`FormField` only for its message — the caller leaves the wrapper's `label` unset.

Their accessibility defect was fixed at the same time, and without restructuring the DOM: an explicit
`aria-labelledby` on the control overrides the wrapping `<label>`'s name computation, so the name is
the label alone and the supporting text becomes a description. Verified in the browser — the checkbox
now reports the name `J'accepte les conditions` with two descriptions rather than one run-on name.

### `Slider.label` became `valueDisplay`

`SliderLabel` → `SliderValueDisplay`. The prop selects where the current value is shown. Keeping the
name `label` next to a `FormField.label` that means a caption was a trap with no upside.

## Typography, corrected on the way through

The label was `0.875rem / 1.25rem / 500` written as literals, the hint `0.875rem / 1.25rem / 400`.
Those are exactly the `label-lg` and `body-md` roles. `FormField` consumes the roles, which is what
ADR-0003 requires — and has a side effect worth naming: the label and message now follow the mobile
type scale under `[data-typography="mobile"]`. The hard-coded versions were frozen at desktop size.

Rendering is otherwise pixel-identical, with one deliberate change: the label no longer sets
`white-space: nowrap`. A wrapper that can hold any caption should wrap rather than overflow.

## Verified, not assumed

Checked in the browser rather than by eye:

- `for` and `id` resolve, `aria-describedby` points at an element that exists, `aria-invalid` is set,
  and the asterisk is `aria-hidden` with the native `required` carrying the information.
- `Checkbox` and `Toggle` report the label as their name and both texts as descriptions.
- `disabled` on the wrapper reaches the control's native attribute.

`npm run typecheck`, `npm run build` and `npm run build-storybook` all pass. The token audit on the
added lines returns zero literal colours, zero raw primitives and zero hand-rolled focus rings.

## Consequences

- Breaking for the ten controls and every caller. 53 component stories migrated.
- `FormField` is where a future `Form` will attach: field-level errors already have an owner, so form
  submission has something to write into.
- A control the design system does **not** own can now be given a label, a description and an error
  by wrapping it — which the old design could never do.

## Found and deliberately not fixed

`InputField`'s disabled state is visually indistinct: `.ds-input-field__wrapper--disabled` re-declares
the default background and border, so only the shadow drops. The control is genuinely disabled and
the wrapper's label greys correctly — this is a pre-existing visual defect, not a regression, and
`--ds-semantic-bg-disabled` already exists. Left alone because it is a visual decision on a `stable`
component, not part of this change.
