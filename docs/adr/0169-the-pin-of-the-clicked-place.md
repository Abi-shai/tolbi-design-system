# ADR-0169 — The pin of the clicked place

**Status**: accepted (etolbi, 13 Nov. 2026). This is Google Weather Lab's « point forecast », a scenario validated by the
owner. Every click on a map sets a pin where it landed, and the sheet at the end (`MapPanel lg closable`) gives that
place's data. The place may be an object (a parcel, a point, a zone) or a bare spot. The product stood in with the
`map-pin` icon until the package had one (Carbone, `app/pages/dmrv/[id]/index.vue`).

## Decision

**`MapPin`** (`Données/Map/Pin`) is a component of its own, not a variant of a marker that does not exist.

**The drawing** is a drop in the brand's ink with a white dot at its centre.
- A white edge (a 2px stroke, half of it outside the drop) makes it stand off any ground.
- A short shadow sits under it. It is two `drop-shadow` layers, so it follows the drop's outline; a `box-shadow`
  would draw a rectangle.
- **The inks do not follow the theme**: `brand/500`, `base/white`, the shadow from `gray-light/900`. The map under the
  pin has no dark mode, so neither has what sits on it. These are primitives under ADR-0010's categorical clause, each
  with a named suppression.

**Size and point.**
- **One size**: a 24 × 32 box.
- **Its tip is the point**: the tip sits at the middle of the bottom edge. The product places the pin as it places
  `MapTooltip` and `MapHoverCard`: absolutely on the map, anchored at the bottom centre (`translate(-50%, -100%)`, or
  an engine marker's `anchor: 'bottom'`).
- The pin moves only its inner drawing and never its own box, so an engine that positions the box by `transform`
  keeps it.

**Motion.**
- **When it is set, it drops**: `spacing-md` (8px) down and 0 → 1 opacity, over `enter` + `easing-out`.
- **Set somewhere else, it drops again** where it now stands; it does not glide. `at` names the place (« lng,lat », a
  parcel's id), and the drawing is keyed by it. A glide would draw a path between two places nobody chose. Without
  `at`, a move is a cut.
- **Removed, it fades where it stood** over `exit` + `easing-in`. A component cannot animate its own removal
  (ADR-0052), and in the product the element holding the pin goes with it. So on unmount the pin leaves a copy in the
  nearest positioned ancestor that is still there a microtask later (the map). The copy sits at the place it was seen,
  does not drop again, and leaves when its fade ends. This is `MapPanel`'s ghost (ADR-0168), placed by measure.
- Nothing moves under reduced motion.

**Decorative and without a pointer.**
- The pin is `aria-hidden`: the sheet says the place (name, coordinates).
- It takes no pointer (`pointer-events: none`), so a click through it is a click on the map.

**The lint.**
- `no-colour-literal` read `var(--ds-color-base-white)` as the keyword `white`. `\b` breaks at a hyphen, so a token's
  name tripped the rule.
- The rule now strips custom-property names before looking for the keyword. A primitive is `no-raw-primitive`'s to
  judge, and a real `white` fallback still fires.
- Both directions are tested, and mutation-checked: restoring the old match fails the silent test.

## Measured

| Where | What | Result |
|---|---|---|
| `Données/Map/Pin` | Tip | (616, 216) for a click at (616, 216) |
| `Données/Map/Pin` | Drop | `translateY` −8 → 0px, opacity 0 → 1, eased out over `enter` |
| `Données/Map/Pin` | A click through the drop | reaches the ground and sets the pin again |
| `Données/Map/Pin` | Escape | the copy fades 1 → 0.36 in about 75ms, then nothing is left |
| `Données/Map` « Sélection d’un objet » | Click on the ground | pin + « Lieu » sheet |
| `Données/Map` « Sélection d’un objet » | Click on a parcel | the pin leaves the ground and drops on the parcel at the click (opacity 0.44 at 40ms), then the parcel's sheet |
| `Données/Map` « Sélection d’un objet » | Close | the pin fades with the sheet |
