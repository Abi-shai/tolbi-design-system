# ADR-0062 — The panel is a column

**Date:** 2026-10-07
**Extends:** ADR-0037 (the column owns the easing), ADR-0046 (a panel anchored to the edge it comes
from), ADR-0050 (one mark for the current item), ADR-0053 (the bar's slots: presence decides)
**Source:** Figma Sprint 18, `TolbiAI/Panneau` (`2306:1967`: Accueil, Conversation) with
`TolbiAI/En-tête` (`2306:1682`), `TolbiAI/Suggestion` (`2306:1653`), `TolbiAI/Source` (`2306:1658`),
and `Nav/TolbiAI` (`2305:1450`: Fermé, Ouvert). The seventh of the eight Tolbi AI steps.
**Status:** Accepted

## Context

The product's Tolbi AI floats: a fixed card over the page, its own shadow, a launcher pill in the
corner. Decided on 7 October: docked, not floating — a column of 400px, the height of the surface, that
the page makes room for. And an entry in the bar, which had no place for one.

## Decisions

### Docked, so its opening is a width

`TolbiAiPanel` is a column beside the page in a flex row. It does not float, so it does not take the
house entrance: opening, closing and expanding (400 → 720px) are one width that travels — `enter` on
`easing-in-out`, ADR-0037's column. The surface inside keeps its width the whole way and is anchored to
the screen's edge, so it slides in as a drawer rather than being wiped in place (ADR-0046);
`visibility` lands at the end of the close, which also takes the closed panel out of the tab order.

The 12px between the page and the panel is the panel's own, inside the travelling width: as a gap in
the page's row it would outlive the closed panel. Filmed at a tenth of the speed, page and panel add up
to the same 1256px in every frame — no gap opens, nothing overlaps — and the surface's outer edge does
not move.

Figma's surface: `bg-default`, `radius-surface` on the top corners only, no shadow — it sits in the
page.

**Amended by ADR-0064:** expanding no longer widens the column to 720. The surface takes the page's
whole row, the page staying under it at its width; 720 is the reading column.

### The head says the name

« Tolbi AI » and an `ALPHA` badge (`Badge` `success`), then history, new conversation, expand and
close — `IconButton`s, ClickUp's and Notion's order. The handoff names the sign at 24 here; Figma's
`En-tête` carries it as a **hidden** layer and every validated frame shows the name alone, so the head
shows the name alone. The sign opens the welcome instead: **64px** in the docked panel, **96px** once
expanded — Figma's « accueil agrandi », the reason 96 joined the ladder (ADR-0056).

**Amended (8 Oct.):** the four actions say what they do in a `Tooltip` — the answer's rule (ADR-0066):
after 400ms on hover or focus, through `SurfaceTransition`, presentational, since each button's name
already says it. Pressing an action dismisses its tooltip, and closing the panel takes it along. The
tooltips sit **under** the buttons, as the bar's do: the head is the panel's top edge, and the panel's
clip (ADR-0064) would cut one above it. They end **at the button's right**, all four, because the
panel's edge is close on that side — centred, « Fermer » lost 7.7px to it, the answer's « centred, the
panel's edge cut the first one » mirrored. `Tooltip` had no arrow for that (`top-center` only, where the
bottom row has three), so it gains **`top-left`** and **`top-right`**, the mirrors of `bottom-left` and
`bottom-right`: 12px in from the edge. Measured docked and expanded, in both modes: no tooltip cut, the
arrow's tip on the button's centre to 0.01px. Figma's local set has no `Tooltip` component to follow.

**Amended again (8 Oct.):** the head says no name. Removed at the owner's request — it added little, and
the head is quieter without it: the bar's entry above the panel already says « Tolbi AI », and carries the
current item's mark while the panel is open. `title` stays the region's accessible name (`aria-label` on
the `<aside>`), so a screen reader still meets « Tolbi AI ». The head is the `ALPHA` badge and the four
actions, which keep its end with or without the badge; its height does not change — 61px, the actions
were the tallest thing in it. In Figma the name was already a hidden layer of `TolbiAI/En-tête`; it is
deleted. That component shows the sign at 24px beside `ALPHA`, which the code has never drawn.

**Amended by ADR-0069:** the head names the conversation instead — its title is the switcher to the
project's other conversations, and the clock is gone. The head is the title, `ALPHA`, new conversation,
expand and close.

### The pieces

All of them exist only inside the panel, so they are titled under it (ADR-0007):

- `TolbiAiWelcome` — the sign, « Que voulez-vous savoir sur votre projet ? » in `heading-lg`, and
  suggestions **one per line, left-aligned, wrapping**: today's overflow becomes a longer row.
- `TolbiAiSuggestion` — a whole-row button: the welcome's four, and « Pour continuer » under an answer,
  each with the glyph of where it leads. On white a tint barely says hover (ADR-0044), so the contour
  darkens with it.
- `TolbiAiQuestion` — a question as typed, on the user's side, the text counterpart of the voice note.
- `TolbiAiAnswer` — the words are the product's to render (markdown, in the slot; it takes the answer's
  type through `:deep()`), then the dated sources, copy / useful / not useful / regenerate, and the
  follow-ups. The judgement is `v-model:feedback`; a second press takes it back.
- `TolbiAiSource` — « Rendement estimé · 5 nov. 2025 »: the kind of data, what it is, when. A
  citation, not a status, so not a `Badge`; with `href`, a link to the source.
- `TolbiAiThread` — what arrives comes in 8px from below as it fades, over `enter`; what is there when
  it mounts does not move, so reopening a conversation does not replay it. This is where the voice
  note's entrance lives (ADR-0061 left it here).

**Amended (8 Oct.):** « Pour continuer » is gone — the answer no longer guesses the steps the user might
take next. Removed at the owner's request, the first of several removals from the experience.
`TolbiAiAnswer` loses `followUps`, `followUpsLabel`, the `follow-up` event and the `TolbiAiFollowUp` type;
`TolbiAiSuggestion` loses `icon`, which only the follow-ups used. The answer ends on its sources and its
actions, and the next question is the user's, in the composer. Figma's `TolbiAI/Panneau` (Conversation)
follows.

**Amended again (8 Oct.):** the sources are gone too. They named the product's own data — « Rendement
estimé · 5 nov. 2025 » — not an outside world the user might want to check, so citing them was noise.
`TolbiAiAnswer` loses `sources` and `sourcesLabel`; `TolbiAiSource` and the `TolbiAiSourceItem` type are
deleted. The answer is now its words and its actions. The composer's disclaimer loses « Veuillez vérifier
les sources citées », which pointed at nothing, and balances its two lines. In Figma the block is deleted
from `TolbiAI/Panneau`, the ten `TolbiAI/Saisie` states lose the sentence, and `TolbiAI/Source` moves to
« Explorations — non retenues », where nine exploration frames still use it.

**Amended by ADR-0066:** the actions under an answer step back — `IconButton xs`, a receding ink, 8px under
the words, a tooltip per action, and a copy that confirms itself with a check.

**Amended by ADR-0068:** an answer no longer takes the thread's arrival — it arrives under a light of its
own, a line in the sign's inks passing down it, once. Questions, voice notes and the waiting line keep the
8px and the fade; the thread now tells its children whether they arrived (`settled`).

### The thread follows what arrives — its top, not its bottom

An answer arrives whole: the Yield API does not stream it. Following it to the bottom, as a chat
usually does, landed the reader on « Pour continuer » with the answer's first lines scrolled away. So
what arrives is brought into view whole when it fits, and when it does not, **the question it answers
goes to the top** — the question, then the answer's first lines, where reading starts. Between
arrivals, a reader at the end stays at the end; one who scrolled up to reread is left there.

The first anchor was the answer's previous sibling — which, at that moment, is the waiting line still
leaving. It took the scroll with it when it went: the question landed 32px above the top. The anchor is
the nearest question or voice note before the answer.

### Focus

Opened, the panel focuses the field: it is where the question is asked. Closed from inside, the focus
returns to the bar's entry. A control that asks and then disappears — a suggestion, as the welcome
makes way for the thread — hands the focus to the field rather than dropping it on the page.

**Amended (8 Oct.):** only when the control has disappeared. The first version handed the focus to the
field whenever it landed on the page, and a click on nothing focusable lands it there too — on the
answer's words, on the page, on the map: the field took the focus back every time, its ring stayed on,
and the panel held the focus hostage. The panel now checks that the element which lost the focus is
**no longer in the document**: an element still there was left, not lost, and a click away is the user's
choice. Measured in Chromium: a click on the answer, the page or the map leaves the focus on the body and
the ring off; a suggestion pressed with Enter still lands the focus in the field, and the composer's own
actions still hand it back; Shift+Tab leaves the field.

### The entry in the bar

`TolbiAiNavButton` is the sign and the name in a `Button` — `secondary-gray` at `sm`, Figma's
`Nav/TolbiAI` at its height (38px rendered) and 4.5px narrower, since `sm`'s padding is symmetric where
Figma gives the text side 14 — so `Button` gains two things rather than being redrawn (ADR-0001):

- a **`#leading` slot**, for a mark that is not a Lucide glyph; the glyph is its fallback;
- **`selected`**, the current item's mark (ADR-0050) — `bg-selected`, the brand tint's hairline and its
  ink — while the panel is open. The state itself is said with `aria-expanded` and `aria-controls`.

⌘J (Ctrl+J elsewhere) opens and closes from anywhere, declared with `aria-keyshortcuts`; the tooltip,
« Interroger Tolbi AI sur ce projet · ⌘J », behaves as the bar's others.

`HorizontalNavigation` gains an **`#assistant` slot**, the first of the controls: the entry is about
this page where the others are about the app, and it stands above where its panel opens. A slot rather
than a prop, ADR-0053's shape: the bar decides the place, the product decides whether the page has an
assistant at all.

**Superseded by ADR-0070:** the entry is not in the bar. A floating disc at the bottom right of the screen,
`TolbiAiLauncher`, opens the panel; `TolbiAiNavButton` and the `#assistant` slot are deleted. `Button`'s
`#leading` and `selected` stay.

### Smaller additions

- `Scrollbar` exposes its `viewport`, for a parent that has to move it, and exports `ScrollbarProps`:
  holding a `Scrollbar` ref put its props in the panel's declaration, an unexported interface cannot
  be named there, and the build's guard (ADR-0061) stopped the build — its first catch.

## What changes

- New: `TolbiAiPanel` (`Structure/TolbiAiPanel`), with `TolbiAiWelcome`, `TolbiAiThread`,
  `TolbiAiQuestion`, `TolbiAiAnswer`, `TolbiAiSuggestion`, `TolbiAiSource`; `TolbiAiNavButton`
  (`Navigation/TolbiAiNavButton`). Types `TolbiAiSourceItem`, `TolbiAiFollowUp`, `TolbiAiFeedback`.
- `Button`: `#leading`, `selected`. `HorizontalNavigation`: `#assistant`. `Scrollbar`: `viewport`
  exposed, `ScrollbarProps` exported.
- In the product: the floating card, its launcher pill and its « Déplacer » go; the history panel the
  history button opens is the product's.

## Still open

- **Figma follows**: `Button` has no `xs`, no `selected`, no leading mark; `IconButton` no `primary`,
  `surface` or `neutral`; the composer's « Arrêter » is a pill.
- **Narrow screens.** 400px beside the page assumes a desktop; there is no breakpoint in the system
  (ADR-0020) and no decision for a phone.
- ~~**The sign in the head.**~~ Closed by ADR-0069: the conversation's title took the place, and Figma's
  `TolbiAI/En-tête` follows.
