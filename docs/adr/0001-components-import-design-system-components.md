# Components must import and render design system components, not re-implement their UI

When a component needs a UI pattern that has its own design system component, it must import and render that component directly — not hand-roll a visual approximation. This is a universal rule across the system.

## Why

Visual approximations drift silently. A hard import breaks loudly if the API changes, which forces a conscious update and keeps behavior and accessibility consistent across the system.

## Resolved

`Tag` has been updated to use `<Checkbox visual-only />` for its checkbox indicator now that the `Checkbox` component exists.
