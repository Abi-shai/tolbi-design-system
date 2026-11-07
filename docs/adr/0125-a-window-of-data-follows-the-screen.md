# ADR-0125 — A window of data follows the screen

**Date:** 2026-11-07
**Amends:** ADR-0098 (`Dialog size="2xl"`), ADR-0079 (the size scale)
**Source:** etolbi — on a 1880px screen the 82rem window left ~285px of scrim each side, where the owner's frame
(Figma `3610:12923`, at 1440) draws it 64px from the sides and 40px from the top and bottom.
**Status:** Accepted

## Decisions

- **`2xl`, centred, is the screen less its margins** — 64px each side (`spacing-7xl`), 40px above and below
  (`spacing-5xl`) — **with no ceiling**. The other sizes are reading widths, where a ceiling is the point (ADR-0031);
  a window of data is the opposite case: its tables and charts use every pixel they are given, and an empty band of
  scrim on a large screen is room taken from them. No ceiling was asked for and none is set: a ceiling is a claim
  about what the content cannot use, and nothing in it says so yet.
- **The margins give on a small screen** — 5% of the viewport each way, never under the dialog's usual 16px and never
  over the frame's 64 / 40 — so a 1024px screen gets 51px and a 600px one 30px, instead of 128px eaten off 600.
  Measured: 64/64/40/40 at 1440×900 and at 1880×1000 (1752px wide), 51/38 at 1024×768, 30/40 at 600×800.
- The side placement keeps its 82rem: a side panel is a column, not a window.
