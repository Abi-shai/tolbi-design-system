# Components must import and render design system components, not re-implement their UI

When a component needs a UI pattern that has its own design system component, it must import and render that component directly — not hand-roll a visual approximation. This is a universal rule across the system.

## Why

Visual approximations drift silently. A hard import breaks loudly if the API changes, which forces a conscious update and keeps behavior and accessibility consistent across the system.

## Resolved

`Tag` has been updated to use `<Checkbox visual-only />` for its checkbox indicator now that the `Checkbox` component exists.

**Scrollbars (2026-08-25).** `ModulesList`, `Dropdown` and `InputDropdown` each hand-rolled the
same block of `::-webkit-scrollbar` rules while `Scrollbar` existed. All three now render
`<Scrollbar>`, and `components/Scrollbar/Scrollbar.vue` is the only file in the system that styles
a scrollbar.

This is the rule paying for itself. The duplicated CSS carried a defect none of the copies could
fix locally: a *styled* native scrollbar is a classic one, so it permanently claimed 16px of the
content box — and `ModulesList` additionally set `scrollbar-gutter: stable`, reserving that space
even with nothing to scroll. Fixing the pattern once in `Scrollbar` (an absolutely positioned thumb
over the content, native scrolling untouched) fixed every consumer, including `Table`.
