# ADR-0174 — The map glass, audited

**Status**: accepted (etolbi, 13 Nov. 2026). An audit of 0.145 in the app: Carbone, an ARR zone and the cockpit,
11 states, 725 visible texts and icons, contrast on the real pixels with the blur included. Captures: etolbi
`.context/sig-weatherlab/au-*.png`, `cr-*.png`.

What already held:
- the seven surfaces share one recipe;
- strong, default and subtle pass everywhere;
- reduced transparency makes everything opaque;
- the badges pass on their grounds.

## Decision

### Accessibility

**1. `--ds-text-success` is `success/700`** (was 600).
- 600 measured 3.8:1 on white and 3.1:1 on a sunk card, so the green deltas (« +1,6 », « +10,9 % ») failed AA.
- 700 is 5.69:1 on white and 5.45:1 on `gray-50`.
- This touches the whole app. Dark is unchanged (`success/500`, 6.03:1).

**2. Pilot glass brightens what is under it.**
- `--ds-backdrop-map-control` is now `blur(24px) saturate(1.6) brightness(1.12)`. That lifts the worst ground without
  making the pane more opaque.
- Computed on a dark forest ground (`#1f3a1c`) under 72 % glass, brand text goes 4.49 → **4.57:1** and subtle
  4.48 → **4.56:1**. On a near-black ground the brightening cannot help (×1.12 of almost nothing); the app's blurred
  pixels are the judge there.
- **In dark the backdrop darkens instead** (`brightness(0.88)`): under dark glass the text is light, and a brighter
  map would cost it contrast. The backdrops gain a dark file (`layer.dark.json` → `layer-dark.css`).

**3. Focus on map glass is `--ds-focus-ring-map`**: `0 0 0 2px` white, then `0 0 0 4px` brand-700. In dark it is
the dark ground then brand-200.
- The pale halo was under 3:1 on light glass.
- Every glass surface sets `--on-glass-focus`, and these read it: `IconButton` (primary too), `CloseButton`, the
  `Tabs` tab, `Button` (every variant but the two danger ones, which keep their red), the `OptionCard` focus,
  `HelpIcon`, the zoom gauge's thumb.
- `TolbiAiLauncher placement="map"` takes it directly.

**4. The zoom gauge shows its focus.** The thumb carries the ring; it used to carry the pale halo, which did not read
at all on the column.

**5. Forced colours** (`forced-colors: active`):
- `MapLegend`'s ramp and its preview keep their colours (`forced-color-adjust: none`) and gain a `CanvasText` edge.
  A ramp is data; dropped, the scale vanishes.
- `MapTimeline`'s chosen period (the pill, a compared tick, the current tick) gains a 2px `CanvasText` outline drawn
  inside. An outline, because a border would grow the measured pill.

**6. A disabled `subtle` `IconButton` on glass** takes the whole `text-disabled` (`gray-500`) rather than half of
it. Half measured 1.7:1 and the button no longer read as present. WCAG exempts it; the aim is to see it.

**7. `HelpIcon`'s target is 24 × 24** (WCAG 2.5.8). An invisible pseudo-element, centred; the drawing stays at 16.

### Consistency

**8. `PanelBlock`'s hairline** follows the hollow's rule on glass: no border (`--on-glass-sunk-border`). It was
still computing `gray-200`.

**9. `StatusRow`'s rules** are ink at 8 % on glass (`--on-glass-rule`).

**10. What is filled in, on glass, takes the relief recipe**: white at 94 %, the short shadow, an ink edge at 16 %.
This covers `Button secondary-gray`, the `Checkbox` / radio box, `Tag` (and its checkbox form) and `InputField`
(so `MapSearch`'s field). The variables are `--on-glass-field-bg / -border / -shadow`.
- **Measured, the 16 % ink edge is 1.40:1 on white**, the same as `gray-300` (1.47). It does not give the 3:1 the
  request expected.
- The control is still told by its fill and shadow, so WCAG 1.4.11 does not require its boundary.
- A boundary of 3:1 would need ink at about 47 % (3.4:1 at 50 %), a dark line. Shipped as asked, with the number
  stated; the owner decides.

**11. The tool card cuts what it holds to its curve** (`overflow: clip`). `MapSearch` fades its results by
`Scrollbar`'s mask (ADR-0173), not by a painted band whose square corners showed under the rounded foot.

## Measured (Storybook, computed)

| What | Value |
|---|---|
| A tool, keyboard focus | `0 0 0 2px #fff, 0 0 0 4px #044b28` |
| The gauge thumb, focused | the same ring |
| `MapSearch`'s field, on glass | white 0.94, ink 0.16 edge, `0 1px 2px` ink 0.06, pill |
| `Button secondary-gray` in a panel | the same |
| A disabled column button | `#667085` (gray-500) |
| Forced colours: legend ramp | `forced-color-adjust: none`, image kept, solid outline |
| Forced colours: timeline pill | 2px solid outline |
| Tool card | `overflow: clip` |
