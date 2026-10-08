# ADR-0069 — The conversation is the head's title

**Date:** 2026-10-08
**Amends:** ADR-0062 (the panel is a column) — the head's history button
**Extends:** ADR-0050 (one mark for the current item), ADR-0046 (a titled run of rows), ADR-0026 (one thing
in place of another), ADR-0021 (anything that floats), ADR-0028 (presence decides)
**Source:** Figma, « Tolbi xAI exploration », `14 · L’historique — retrouver ses conversations`
(`2468:14703`) — Mobbin benchmark, three tracks prototyped with the real components and filmed; track B
chosen by the owner on 8 Oct.
**Status:** Accepted

## Context

The head's clock opened nothing of its own: it emitted `history` and left the product to draw a list
somewhere. The owner wanted a dropdown that says there is a list behind it — the current conversation
and the previous ones — with the whole of its behaviour and motion worked out.

Across the docked assistants on Mobbin there are three families. The menu anchored to the icon (Whop): a
short list under the clock, title and age, the current one greyed. The title as the switcher (Notion,
Linktree): the head names the current conversation and a chevron opens the history, with a search. The
list that takes the panel (Mintlify, ElevenLabs, Grok, Qatalog): the commonest once a history grows long.
Five of the six docked panels observed write the current conversation's title in their head; none puts a
chevron beside a clock. Three tracks were prototyped — A the clock as a menu button, B the title as the
switcher, C the history as a page in the panel — and **B** was chosen.

## Decisions

### The title is the switcher

The head names the current conversation where « Tolbi AI » used to be. That name was removed the same day
because the bar's entry already said it (ADR-0062, amended); a conversation's title says what nothing else
on the screen says. It is a `DropdownTrigger` with a chevron, and the clock is gone: the head is the title,
`ALPHA`, then new conversation, expand and close. Before the first question it reads « Nouvelle
conversation ».

At 400px a title is cut — about 22 characters — and the whole of it comes in a tooltip under it when it is
cut, with its date (« Aujourd’hui · 14:32 »); a whole title needs no second copy. « Nouvelle
conversation » itself was cut by 7px at first (159px of text in 152): the ghost chrome's chevron is 16px
at `spacing-xs` from the title, and the badge follows at 16px rather than 20, and it holds whole. Expanded,
every title is whole.

The button's name is its visible title — what speech input will say — and « Changer de conversation » is
its description (`aria-describedby`), so a reader hears what the button does after what it shows.

### The list is derived from the data

The product passes `conversations` — `id`, `title`, `at`, `pending` — and `v-model:conversation`. Their
**presence decides** (ADR-0028): without `conversations` the head has no switcher; an empty list is a
project with none yet. The panel sorts them by `at` and groups them by calendar day — Aujourd’hui, Hier,
7 derniers jours, Plus ancien — dating each by the hour, the day or the date, with the year when it is not
this one (`Intl`, `locale`). The groups are `DropdownGroup`s, `SideNavGroup`'s title in a menu.

The current conversation is a checked `menuitemradio` carrying the mark of every current item in the
catalogue (ADR-0050). **Amended by ADR-0072:** the rows carry actions of their own, which a menu item
cannot hold, so the list is a `dialog` of buttons and the current one is `aria-current` — the same mark. A conversation still awaiting its answer says « En cours » in place of its time, and
the answer lands in it wherever the reader is.

From eight conversations on, a search sits in the menu's header — outside the scroll, so it stays in reach —
and folds case and accents; when nothing matches the menu says so. `history` now fires as the switcher
opens, for the product to fetch the list; `conversationsLoading` shows five skeleton rows meanwhile. With
no conversation the menu says « Vos conversations sur ce projet apparaîtront ici. », and with only the
current one, « Vos autres conversations… ».

The menu is **320px**, from the title's start: its rows are sentences. It is the one place the catalogue's
240 yields, as a consumer override of `Dropdown`'s panel, the way `WorkspaceSelector` aligns its own.

### Changing conversation

Choosing closes the menu and sets `conversation`; the product loads it, and `loading` puts a skeleton of an
exchange in its place. The body swaps what it holds — the welcome, a conversation, the next one — through
`SwapTransition`, `quick` and out-in (ADR-0026), so the product keys its thread by the conversation. The
conversation opens on its last exchange: the panel's own rule for an answer that arrives (ADR-0062), the
newest message whole if it fits, its question at the top if not. Measured on a two-exchange conversation,
the last question lands 25px under the top. The focus goes to the field — the row that held it is gone,
and the panel hands a lost focus to the field. Nothing replays: neither the thread's arrivals nor the
passing light (ADR-0068), which belong to arrivals.

Sampled every frame through a switch: the head stays 61px, the composer does not move, the old thread and
the skeleton never share a frame (menu out, skeleton at 113ms, thread at 576ms).

### What `Dropdown` gained

- **`#header`** — the footer's twin, outside the scroll. The account menu's user header, which held the
  class, now carries `__user`.
- **`DropdownGroup`** — a titled run of rows, a `role="group"` named by its title.
- **`DropdownItem.meta`** — a time or a count, in a shortcut's place and ink.
- **`DropdownTrigger` `chrome="ghost"`** — for `bg-default`, where `quiet`'s tint measures 1.02:1: nothing
  at rest, the `IconButton`s' own `bg-hover` under the pointer and while open, and a 16px chevron at
  `spacing-xs`, because it carries a title.

## What changes

- `TolbiAiPanel`: `conversations`, `v-model:conversation`, `conversationsLoading`, `loading`,
  `historyLabels`, `locale`; `historyLabel` is now the switcher's description; the clock is gone and
  `history` fires as the switcher opens. The body swaps by `SwapTransition`. New types
  `TolbiAiConversation`, `TolbiAiHistoryLabels`.
- In the product: pass the list and the current id, fetch on `history`, set `loading` while a
  conversation comes, key the thread by its conversation. A product that drew its own history behind the
  clock draws nothing now.
- Stories: « Conversation » and « Dans la page » keep a history; « Historique — la liste se charge » and
  « Historique — la première conversation ».

## Still open

- ~~**Delete and rename** are not in the menu~~ — **closed by ADR-0072**: two icons in each row, the
  list a `dialog` of buttons.
- ~~**A search inside `role="menu"`**~~ — the list is a `dialog` since ADR-0072; no screen reader has
  heard it yet.
- **The times are taken when the menu opens**; one left open across midnight keeps yesterday's groups.
- **Figma** shows the head and the menu (`TolbiAI/En-tête`, section 14); its own `Dropdown` components do
  not exist.
