# ADR-0012 — Token discipline is enforced, not documented

**Date:** 2026-09-01
**Status:** Accepted
**Closes:** the "enforcement" item left open by ADR-0009, ADR-0010 and ADR-0011

## Context

Three ADRs wrote rules that are all machine-checkable, and none was checked. The standing proof of
what that costs was spacing: ADR-0009 diagnosed its defect as adoption rather than naming, wrote
that down, and left it — six weeks later adoption was **47%**, unchanged.

Meanwhile the colour and typography layers were only clean because a codemod had just run. Nothing
stopped the next component reintroducing a literal.

## Decisions

### The linter is a script, not stylelint

`scripts/lint-tokens.mjs`, zero dependencies, wired into `npm run build` and `npm run build-storybook`.

Three of the eight rules need a whole rule block at once — role completeness, `font:` ordering, and
on-colour pairing all compare declarations to each other rather than validating one in isolation.
Stylelint can express those only through a custom plugin, which is more machinery than a single
script in a repo that already generates icons, module art and dial codes the same way.

### The eight rules

| Rule | ADR | What it catches |
|---|---|---|
| `no-raw-primitive` | 0009 | `--ds-color-*` in a component. Excepts `--ds-color-display-*`, the categorical clause |
| `no-colour-literal` | 0009 | Hex and `rgb()` outside a small documented allowlist |
| `solid-pairing` | 0009 | A `-solid` fill with a plain `text-*` instead of its `text-on-*` partner |
| `no-shadowing-var` | 0010 | A variant switch named like a semantic token with the prefix filed off |
| `no-literal-type` | 0011 | Literal `font-size` / `font-weight` / `line-height` |
| `role-completeness` | 0011 | A role's size applied without the rest of the role |
| `font-order` | 0011 | `font:` after `font-variant-numeric`, which silently resets it |
| `spacing-on-ramp` | 0012 | A literal that exactly matches a spacing token |

### A linter reporting zero is indistinguishable from a broken one

Every rule was verified against a deliberately broken file before being trusted. That caught a real
defect: `no-shadowing-var` and `no-literal-type` anchored on `^\s*`, so **any declaration written on
a single line slipped through** — which is exactly the shape `Badge`'s and `Tag`'s rules use. Both
now match after `{`, `;` or a line start.

The lesson is the rule: a linter is not adopted until it has failed on purpose.

### The spacing rule is scoped to values on the ramp

Spacing went from **47% to 87%** adoption by codemod. The conversion is mechanical in a way
typography's was not — `8px` is `spacing-md` and nothing else, where `14px` was three different
typographic roles.

The rule only fires on a literal that **exactly matches a token**. It deliberately ignores the 31
survivors, because they are not drift:

```
13 x 10px    3 x 14px    3 x 3px    2 x 1px    2 x -2px    1 x 9px    1 x 36px
```

**Those are control padding, and control padding is a different scale.** The spacing ramp is
2/4/6/8/12/16/20/24 — it contains no 10, 14, 18 or 22, because those values are not layout
rhythm; they are derived from control heights (36/40/44/48/56px) minus the line box. `Button`,
`InputField`, `Dropdown` and `InputDropdown` all land on `10px 14px` independently, which is the
signature of a real shared scale nobody has named.

Naming it is deferred rather than guessed. Forcing those onto the spacing ramp would move controls
by a pixel or two each and call it consistency.

## What changes

- `scripts/lint-tokens.mjs`, eight rules, run by `npm run lint` and both builds.
- Spacing adoption 47% → 87%: 154 declarations tokenised by `scripts/codemod-spacing.mjs`,
  converted per value rather than per declaration so that mixed shorthands like `4px 10px 4px 4px`
  still tokenise the three parts that belong to the ramp.
- All eight rules pass on the current tree.

## Still open

- ~~**The control-padding scale**~~, described above. Closed by ADR-0013. It wants an ADR of its own, and probably a
  `control-padding-{sm,md,lg,xl,2xl}` set derived from the control heights.
- ~~**The linter only reads `.vue` files.**~~ Closed by ADR-0013 — and it immediately found a
  second parallel type ramp, in `Avatar`. `ProgressCircle` proved typography can hide in a
  JavaScript style object, and the linter would not see it. Extending it to `<script>` blocks is
  the obvious next hardening.
- ~~**Radius still has no agreed role for four of its steps**~~ — closed by ADR-0013.
