# ADR-0115 — A timeline read and touched: `MapTimeline` `md`

**Date:** 2026-11-05
**Amends:** ADR-0100 (`MapTimeline`'s geometry), ADR-0114
**Source:** etolbi on 0.95, the dMRV project page: the timeline is the screen's main instrument — the year is chosen and
compared there — and too small for it. Maps that carry a timeline as their instrument (Global Nature Watch, Planet,
Earth Engine timelapse) set it at 14px with targets of 32px or more.
**Status:** Accepted

## Context

Measured in Storybook on the owner's drawing: periods in `label-md` / `label-xs` (11–12px), a period's target
**20px** tall (24 chosen) — under WCAG 2.2's 24px (2.5.8); « Comparer » **18px** tall; the data dot 4px; the bar 42px.
(‹ › were already 32px — `IconButton xs` — not the 26 reported.)

## Decisions

- **`size: 'sm' | 'md'`, `md` the default.** `sm` is the owner's drawing, kept for a narrow map where the timeline is
  secondary. `md` is the instrument:
  - every period is a **32px** target — `label-lg` (14/20) + `spacing-sm` above and below, at least 32px wide (a
    one-digit day is still a square) — and the **chosen one the same**: the pill is the target, only the weight steps
    (`label-lg-strong`);
  - ‹ › and ✕ stay `IconButton xs`, 32px: one height across the bar;
  - the bar is **48px** and **35rem** wide — 480 × 14/12, or five years and « Comparer » no longer fit and the first
    year is cut; hugging (one scale or none, ADR-0114) it may run to **40rem**, where seven years and « Comparer »
    measure 612px;
  - the data dot is **6px**, inside its period's target (its bottom padding), so it never leaves the box it marks;
  - « Comparer » is `Button link sm` (14px) with a 32px target, its range and the one scale's word `label-lg-strong`.
- « Comparer » gets a target at **`sm`** too: 24px, where it measured 18.
- The scale chip stays `DropdownTrigger chip` (24px, 12px) at both sizes: it is a setting of the instrument, not a period.

Measured (story « Tailles md et sm »): every period 32px tall, chosen 32, ‹ › 32, « Comparer » 32, one line for every
label; five years 510px, seven 612px, both whole; twelve months 560px and scrolling as before.
