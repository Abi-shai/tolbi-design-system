# ADR-0018 — The linter is tested, and the tests are mutation-checked

**Date:** 2026-09-01
**Status:** Accepted
**Closes:** the last item on the maturity assessment

## Context

`scripts/lint-tokens.mjs` is a build gate for ten rules drawn from five ADRs. It had **four bugs
found by ad-hoc probing** — two in ADR-0012, two in ADR-0013 — and every one of them made a rule
silently report zero rather than fail loudly.

ADR-0012 established the principle: *a linter reporting zero is indistinguishable from a broken
one.* It had no mechanism behind it. Probing by hand caught four bugs and would have kept catching
them one at a time, only ever when someone thought to look.

## Decisions

### The rules are a pure function; the CLI is a wrapper

`lintSource(rel, src)` takes a filename and a source string and returns findings. No filesystem, no
`process.exit`. The CLI walks `components/` and calls it, guarded by an `import.meta.url` check so
importing the module for tests does not run the lint.

This is what makes the rules testable against fixture strings rather than against a repo that
happens to be clean — the state in which every one of the four bugs hid.

### Every rule is asserted in both directions

Sixteen tests. Each rule must **fire on a violation** and **stay silent on the valid form**, because
only the first half was ever checked by hand and the second half is where over-broad rules live.

The silent-case assertions carry the exceptions the ADRs argued for, so they are now executable
rather than prose:

- `no-raw-primitive` is silent on `--ds-color-display-*` — the categorical clause (ADR-0010).
- `no-literal-type` is silent on a unitless `line-height: 1` — a reset, not a scale value.
- `role-completeness` is silent on a lone weight override — a role inherited from an ancestor
  (ADR-0011's scoping refinement).
- `spacing-on-ramp` is silent on `10px 14px` — control padding is a different scale (ADR-0013).
- `no-literal-dimension-js` is silent on `'0px'` — zero is not a decision.

A meta-test asserts that **every rule in the exported `RULES` array has a test that fires it**, so
adding a rule without a test fails the suite.

### The four historical bugs each have a named regression test

Named for the ADR that found them, so the reason survives:

| Test | The bug |
|---|---|
| single-line rule blocks are not skipped | `^\s*` anchoring made two rules blind to anything on one line — the shape `Badge` and `Tag` use |
| a suppression with a reason actually applies | `const sup` in the file loop shadowed the module-level `sup` that `report` read, so no suppression ever applied |
| a bare suppression is ignored | the escape hatch must cost something: name the rule *and* give a reason |
| the JS rule is not keyed on property names | a rule looking for `fontSize` sails past `ProgressCircle`, whose tables are keyed `size:` and `line:` |

### The suite is verified by mutation, not by passing

A green suite is also what a vacuous suite looks like — the same failure mode one level up. Three
deliberate mutations were introduced and the suite was required to fail:

| Mutation | Result |
|---|---|
| re-introduce the `^\s*` anchoring | **4 tests fail** |
| accept a bare `token-lint-disable` | **1 test fails** — the named regression |
| drop the zero exclusion in the JS rule | **1 test fails** |

That is the mechanism ADR-0012's principle was missing. The practice is now: **a new rule ships with
a firing test, a silent test, and a mutation that proves the tests bite.**

### `npm test` runs in the build

`npm run build` is `tokens && lint && test && typecheck && vite build`. The linter guards the
catalogue; the suite guards the linter.

## What changes

- `lint-tokens.mjs` exports `lintSource()` and `RULES`; the CLI is behind an entry-point guard.
- `scripts/lint-tokens.test.mjs` — 16 tests, `node:test`, zero dependencies.
- `npm test` added and wired into `build`.

## Still open

- **Mutation testing is manual.** Three mutations were run by hand for this ADR, not by a tool. At
  ten rules that is proportionate; if the rule set doubles it is worth automating.
- ~~The remaining maturity gaps~~ — the platform gap is closed by ADR-0019. **One colour mode is a
  settled constraint (ADR-0003), not a gap**, and is not to be re-raised as one.
