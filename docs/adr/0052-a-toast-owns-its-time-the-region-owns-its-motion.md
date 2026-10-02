# ADR-0052 — A toast owns its time, the region owns its motion

**Date:** 2026-10-02
**Extends:** ADR-0021 (the house entrance; the exit is faster), ADR-0006 (the tone picks the glyph),
ADR-0009 (four tones; `brand` is interactive), ADR-0023 (a mark confirms), ADR-0024 (the container
owns what moves between its children), ADR-0037 (one gesture, one duration; `easing-in-out`
travels), ADR-0049 (an arrival waits for its place; filming by slowing the tokens), ADR-0045 (the
reversal count)
**Amends:** ADR-0021's "`Toast` animates nothing, and correctly so"
**Source:** the design owner's request — the Toast looked "generated randomly"; Mobbin benchmark and
exploration board Sprint 18 `2113:1427` (page `2091:53891`), track A chosen; etolbi's live toasts
**Status:** Accepted
**Breaking:** `title` → `message`, `text` → `detail`, the default slot → `#actions`; `tone` loses
`brand` and `info` (`neutral`, now the default); `icon` is gone; `dismiss` carries a reason. A toast
now asks to be dismissed after 5s unless told otherwise.

## Context

The Toast was a white card with a 3px tone stripe on its left edge, a `heading-sm` title, its
buttons stacked under the text, 384px wide. Its `brand` tone had no CSS at all, which made a black
glyph with no stripe. It had nothing for time or for motion: a product rendered it and removed it
by hand, and it appeared and vanished in one frame. etolbi does not use it. Its toasts come from
another library, with « Succès » or « Erreur » as the title of every toast, a timer bar, no icon and
raw server JSON in the body.

Twenty products were benchmarked on Mobbin, and they fall into four families: **8** light cards on
the page's floating surface, **7** dark bars, **3** tinted or solid cards, and **2** stripes. The
pattern the Toast had was the rarest. Three tracks were drawn in both modes, and on etolbi's welcome
screen:

- **A**, a card laid on the page.
- **B**, a dark bar on `bg-inverse`.
- **C**, a tinted card, `Callout`'s twin.

A was chosen.

## Decisions

### The catalogue's floating surface; the tone is a glyph

`bg-default`, a `border-subtle` hairline, `radius-surface` and `elevation-overlay`. That is the
surface of `Dropdown` and `ModulesList`, so a toast is one more thing that floats rather than a
fourth kind of box. **The surface never takes the tone.** The tone picks the glyph and its ink
(ADR-0006): `circle-check`, `circle-alert`, `triangle-alert` and `info`, in `text-{tone}`, with
`text-subtle` for `neutral`. The stripe is gone. It was the rarest pattern, and it bent in the
rounded corners.

The tones are ADR-0009's four. `brand` is interactive affordance, not a tone, and `info` is what
`neutral` means. There is no `icon` prop: an override could put a check on an error, and the glyph
*is* the tone. The surface works in dark with no rule of its own. Every value it uses has a dark
counterpart (ADR-0029), and the hairline separates where the shadow cannot (ADR-0030).

### One sentence, a detail, the actions on its line

- `message` is required: one sentence, `label-lg-strong`, `text-strong`. It is never a generic
  word, because « Succès » says nothing the glyph does not already say.
- `detail` is the second line: `body-md`, `text-subtle`, `spacing-xxs` below the message.
- `#actions` holds text actions, `Button variant="link" size="sm"`, placed on the message's line.
  They no longer sit as a block of buttons under the text.

Everything sits on the **first line**: `flex-start`, and every item is given that line's height
(`1lh`, 20px). So a toast with a detail keeps its glyph, its action and its close level with the
sentence instead of centring them on the block. The padding is 12 / 12 / 12 / 16 and the gap 12.
The width is the sentence's (`max-content`) up to the frame's 440px (`27.5rem`), a ceiling
(ADR-0031). Measured: a one-line toast is **46px** tall, and « 48 cartes générées pour l’agence de
Kaolack » is **415px** wide, as Figma draws it.

`CloseButton` gains **`xs`**: a 32px box with a 16px glyph, `IconButton xs`'s geometry (ADR-0039).
A 20px cross weighed as much as the 14px sentence beside it. The button hangs 6px into the padding
on every side (`(20 − 32) / 2`), so the target stays 32px while the row keeps the line's 20px. The
lint suppression says so.

While a task runs (`pending`), a spinner holds the glyph's place. When it resolves, the tone's glyph
arrives through `MarkTransition`, because a mark confirms (ADR-0023).

### The time is the toast's

`duration` takes milliseconds, or `null` to stay until dismissed. Left out, the toast decides:

- an **error** stays, because it has to be read;
- a **pending** task stays, because it is not over;
- a toast with **actions** stays 8s, so the action can be reached;
- anything else stays 5s.

The time **pauses** while the pointer or the focus is on the toast, and gives back what was left
when they leave: ten seconds of hovering does not earn a fresh five. The clock restarts when a
pending task resolves. `dismiss` says why it fired, `close` or `timeout`. The toast still never
removes itself: it asks, and the product removes it from its list. There is no countdown bar. Track A draws
none, and how long a message lasts is the component's business, not something to read.

An error is `role="alert"` and interrupts a screen reader. Anything else is `status` and waits its
turn. Both are `aria-atomic`.

### The motion is the region's

ADR-0021 recorded that `Toast` animates nothing, "and correctly so: it does not own its own
visibility". That still holds, because the product decides when a toast goes. But as an outcome it
was wrong: toasts appeared and vanished in one frame. **A component cannot animate its own
removal.** Once the product drops it from its list, it is gone, and only what renders the list can
hold it through its exit. ADR-0024 made the same move when `ButtonGroup` took the selection because
nothing else knew where it sat.

So **`ToastRegion`** owns the corner, the stack and every movement. It is a fixed `<section>` named
« Notifications », `spacing-xl` from the screen's edges, at `z-overlay`, and it lets clicks through
everywhere except on a toast. Its stack is a `<TransitionGroup>` with toasts `spacing-md` apart and
the newest nearest the edge it comes from. `placement` is `bottom-right` (the default, etolbi's
corner), `bottom-center` or `top-center`. The product renders `<Toast v-for>` inside it and removes
one on `dismiss`, and every product gets the same behaviour from the same two components. The motion
CSS is unscoped for ADR-0021's reason: the classes land on the toast's root, which carries `Toast`'s
scope id.

### A toast rises with the stack

A newcomer starts one height and one gap beyond its place, `translateY(100% + spacing-md)`, and
travels there on the **stack's own duration and curve**, `enter` + `easing-in-out`. It fades in on
`easing-out`. The toasts it pushes travel exactly that distance on that curve, so the gap between it
and the toast above stays **8px** the whole way. From the top, it comes down.

This is not the house entrance. Scaled in place, the newcomer appears where the toast above still
is, because that toast only starts leaving the place as the newcomer arrives. Filmed, the toast above
**sat on the newcomer for 110ms, by up to 44px**. That is ADR-0049's rule seen from the other side:
an arrival must not land on a place that is not free yet. The travel also says where the toast comes
from, which a scale at the corner did not.

### What leaves, leaves first

The departure is ADR-0021's exit, unchanged: a fade and a settle to 96%, `exit` + `easing-in`, in
place. To fade in place, the leaver is taken out of the flow and **pinned where it is seen**, by the
edges that do not move: the bottom (or top) the stack is anchored to, and the side (or centre) its
toasts align to. A pin by `top` in a bottom-anchored stack would drop the leaver by its own height the
moment the stack shrank. Its width is the **used** width with its fractions. `offsetWidth` rounded
328.28px down to 328, the action no longer fitted on the line, and the leaver grew 20px taller while
it faded.

**Only then does the stack close.** The toasts above wait one `exit` (a delay is a duration in
another slot, ADR-0032), then travel into the place on `enter` + `easing-in-out`. Filmed without the
wait, the toast above **slid over the fading one for 50ms, by up to 31px**. A dismissal therefore
takes 300ms from end to end, in two beats: a departure, then a closing. A toast pushed during the
wait waits with the stack, so it still rises in step with it.

The leaver takes **no pointer**. Otherwise a second click on an « Annuler » that is already fading
would undo twice.

### Interrupted, the stack travels on from where it is seen

**A running transition outlives its class.** The group's moves are FLIP: it reads every position,
updates, reads them again, and translates each toast back by the difference. An update that lands
during a move ends that move by removing its class. But `transition-property` falls back to its
initial `all`, which still matches, and the transition keeps running. Probed in Chromium, the offset
is still there a frame later. So the second reading included the remaining offset and the difference
did not, and the toast **snapped by everything it had left to travel**. Measured on a toast pushed
30ms into another's exit, it jumped 54px down onto the one still fading. Two toasts timing out 50ms
apart broke the same way: the second leaver jumped 76px onto the first and slid back up as it faded.

`settle()` cancels the transform transition of every toast that stays. It does so inside the
update, after the group's first reading and before its second, by narrowing `transition-property`
to `opacity` for one style recalculation. The fade continues, and the travel restarts from where the
toast is seen. It runs from the two hooks that fire inside an update, `before-enter` and
`before-leave`. The `--closing` flag is set on the element from the leave hook too, not through a
class binding. A binding would re-render the group mid-update, and the group takes its first reading
during its render.

Two consequences follow:

- A newcomer starts against the edge toast **where that toast is seen**, by adding its remaining
  travel (`--toast-lag`). Pushed 50ms after another, it otherwise started where the previous toast
  *would* be, and the two crossed by 35px.
- A toast dismissed while it still travels stays where it is.

### Reduced motion

Nothing travels and nothing scales: the toast is there from the first frame and gone from the first
frame. Vue swaps its classes a frame late. Filmed, the leaver still covered the toast that had
already jumped into its place, so the reduced styles set the end state on the first class. The waits
go too, because a delay with no movement behind it is only lateness.

### Measured

Ten scenarios were filmed at a tenth of the speed by slowing the duration tokens (ADR-0049), and
every frame sampled each toast's rectangle and composited opacity:

1. an arrival;
2. a second arrival;
3. the bottom toast leaving;
4. the top toast leaving (nothing below moves);
5. a pending task resolving in place;
6. a push during an exit;
7. three toasts closed at once;
8. a dismissal 80ms into an arrival;
9. two exits 50ms apart;
10. two pushes 50ms apart.

In every frame of every scenario, the visible gap between neighbours is at least **8px**, no toast
steps more than 6px between two frames, and the reversal count is **zero**. At real speed:

- 5.1s for a plain toast;
- 8.1s with an action;
- an error still there at 12s;
- 4s of hover or focus giving 9.1s.

## Still open

- Figma: track A exists as the board's drawing, `2113:1427`. The file's component was not touched
  and carries no motion.
- Screen readers: every toast carries its own live role, and nobody has yet checked the announcement
  on insertion with a screen reader. The region is now persistent, which is what a live region
  needs, but it is not one yet.
- No ceiling on the stack: five one-line toasts stand 262px tall. A cap, and what becomes of the
  sixth, waits for a product that needs one.
- No swipe to dismiss: there is no touch product.
