# Tolbi Design System — Claude instructions

## Required reading

Before working on any component, read:

- [`docs/adr/`](docs/adr/) — all ADRs. These record decisions that are non-obvious from the code.

## Key rules (summary — read the ADRs for the full reasoning)

- **ADR-0001**: When a design system component exists for a UI pattern, any other component that hand-rolled that pattern must be updated to import and render the actual component. No visual re-implementations.

## Architecture

- Components live in `components/<Name>/` — each has `<Name>.vue`, `<Name>.stories.ts`, and `index.ts`
- Design tokens live in `tokens/` — run `npm run tokens` after any token change
- All components are exported from `components/index.ts`
- Tokens use the `--ds-` prefix and are exposed as CSS custom properties on `:root`
- Semantic tokens (`--ds-semantic-*`) are what components consume — never raw primitive tokens directly
