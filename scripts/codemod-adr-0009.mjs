/**
 * ADR-0009 codemod — semantic colour layer rewrite.
 *
 * One-shot. Run once, review the diff, then delete this file.
 *   node scripts/codemod-adr-0009.mjs [--dry]
 *
 * Two passes, in order:
 *   1. SITE_EDITS — per-file edits for the cases a rename cannot decide:
 *      tokens whose new name depends on what the call site is doing
 *      (`bg-brand-primary` is selection here and a tint there), raw primitive
 *      leaks, colour literals, and the tone maps.
 *   2. RENAMES     — the mechanical `--ds-semantic-*` → `--ds-*` pass.
 *
 * SITE_EDITS emit final names, so pass 2 never sees them.
 */
import { readFileSync, writeFileSync } from 'fs'
import { readdirSync, statSync } from 'fs'
import { join, extname } from 'path'

const DRY = process.argv.includes('--dry')
const ROOTS = ['components', 'stories', 'tokens/stories', '.storybook', 'docs']
const EXTS = new Set(['.vue', '.ts', '.mdx', '.js'])

/* ────────────────────────────────────────────────────────────────────
   Pass 1 — site-specific edits
   ──────────────────────────────────────────────────────────────────── */

const c = (n) => `var(--ds-color-${n})`
const t = (n) => `var(--ds-${n})`

const SITE_EDITS = {
  // ── Button: the brand/error text ramps were raw primitives ──────────
  'components/Button/Button.vue': [
    // Primary: label on a brand fill → the paired on-colour
    [`  background-color: var(--ds-semantic-bg-brand-solid);
  border-color: var(--ds-semantic-border-brand-solid);
  color: var(--ds-semantic-fg-white);`,
     `  background-color: var(--ds-bg-brand-solid);
  border-color: var(--ds-border-brand-solid);
  color: var(--ds-text-on-brand-solid);`],
    // Danger: label on an error fill → the paired on-colour
    [`  background-color: var(--ds-semantic-bg-error-solid);
  border-color: var(--ds-semantic-border-error-solid);
  color: var(--ds-semantic-fg-white);`,
     `  background-color: var(--ds-bg-error-solid);
  border-color: var(--ds-border-error-solid);
  color: var(--ds-text-on-error-solid);`],
    [`  border-color: ${c('brand-700')};`, `  border-color: ${t('border-brand-solid-hover')};`],
    [`  background-color: ${c('error-700')};`, `  background-color: ${t('bg-error-solid-hover')};`],
    [`  border-color: ${c('error-700')};`, `  border-color: ${t('border-error-solid-hover')};`],
    // brand text on white, and its hover — 3 sites each, identical strings
    [`  color: ${c('brand-700')};`, `  color: ${t('text-brand')};`, 'all'],
    [`  color: ${c('brand-800')};`, `  color: ${t('text-brand-hover')};`, 'all'],
    [`  color: ${c('error-700')};`, `  color: ${t('text-error')};`],
    [`  color: ${c('error-800')};`, `  color: ${t('text-on-error-subtle')};`],
    // tertiary / secondary-color hover ground is a tint, not a selection
    [`  background-color: var(--ds-semantic-bg-brand-primary);`,
     `  background-color: ${t('bg-brand-subtle')};`, 'all'],
    [`  background-color: var(--ds-semantic-bg-error-primary);`,
     `  background-color: ${t('bg-error-subtle')};`],
  ],

  // ── "Chosen from a list" → bg-selected ──────────────────────────────
  'components/Breadcrumbs/Breadcrumbs.vue': [
    [`  background-color: var(--ds-semantic-bg-brand-primary);`, `  background-color: ${t('bg-selected')};`],
  ],
  'components/Pagination/Pagination.vue': [
    [`  background-color: var(--ds-semantic-bg-brand-primary);`, `  background-color: ${t('bg-selected')};`],
  ],
  'components/ModulesList/ModulesList.vue': [
    [`  background: var(--ds-semantic-bg-brand-primary);`, `  background: ${t('bg-selected')};`],
  ],
  'components/Table/Table.vue': [
    [`  background-color: var(--ds-semantic-bg-brand-primary);`, `  background-color: ${t('bg-selected')};`],
    [`  background-color: var(--ds-semantic-bg-brand-secondary);`, `  background-color: ${t('bg-selected-hover')};`],
  ],
  // Dragover is a tint, not a selection
  'components/FileDropzone/FileDropzone.vue': [
    [`  background-color: var(--ds-semantic-bg-brand-primary);`, `  background-color: ${t('bg-brand-subtle')};`],
  ],

  // ── ADR-0009: brand comes off the status tones ──────────────────────
  'components/Toast/Toast.vue': [
    [`.ds-toast--brand   { --tone-fg: var(--ds-semantic-fg-brand-primary);   --tone-bg: var(--ds-semantic-bg-brand-primary);   --tone-border: var(--ds-semantic-border-brand); }\n`, ''],
    [`.ds-toast--info    { --tone-fg: var(--ds-semantic-fg-quarterary);      --tone-bg: var(--ds-semantic-bg-secondary);       --tone-border: var(--ds-semantic-border-secondary); }`,
     `.ds-toast--info    { --tone-fg: ${t('text-subtlest')};      --tone-bg: ${t('bg-neutral-subtle')};   --tone-border: ${t('border-subtle')}; }`],
    [`.ds-toast--success { --tone-fg: var(--ds-semantic-fg-success-primary); --tone-bg: var(--ds-semantic-bg-success-primary); --tone-border: var(--ds-semantic-utility-success-300); }`,
     `.ds-toast--success { --tone-fg: ${t('text-success')}; --tone-bg: ${t('bg-success-subtle')}; --tone-border: ${t('border-success')}; }`],
    [`.ds-toast--warning { --tone-fg: var(--ds-semantic-fg-warning-primary); --tone-bg: var(--ds-semantic-bg-warning-primary); --tone-border: var(--ds-semantic-utility-warning-300); }`,
     `.ds-toast--warning { --tone-fg: ${t('text-warning')}; --tone-bg: ${t('bg-warning-subtle')}; --tone-border: ${t('border-warning')}; }`],
    [`.ds-toast--error   { --tone-fg: var(--ds-semantic-fg-error-primary);   --tone-bg: var(--ds-semantic-bg-error-primary);   --tone-border: var(--ds-semantic-border-error); }`,
     `.ds-toast--error   { --tone-fg: ${t('text-error')};   --tone-bg: ${t('bg-error-subtle')};   --tone-border: ${t('border-error')}; }`],
  ],
  'components/Callout/Callout.vue': [
    [`.ds-callout--brand   { --tone-fg: var(--ds-semantic-fg-brand-primary);   --tone-bg: var(--ds-semantic-bg-brand-primary);   --tone-border: var(--ds-semantic-border-brand); }\n`, ''],
    [`.ds-callout--info    { --tone-fg: var(--ds-semantic-fg-quarterary);      --tone-bg: var(--ds-semantic-bg-secondary);       --tone-border: var(--ds-semantic-border-secondary); }`,
     `.ds-callout--info    { --tone-fg: ${t('text-subtlest')};      --tone-bg: ${t('bg-neutral-subtle')};   --tone-border: ${t('border-subtle')}; }`],
    [`.ds-callout--success { --tone-fg: var(--ds-semantic-fg-success-primary); --tone-bg: var(--ds-semantic-bg-success-primary); --tone-border: var(--ds-semantic-utility-success-300); }`,
     `.ds-callout--success { --tone-fg: ${t('text-success')}; --tone-bg: ${t('bg-success-subtle')}; --tone-border: ${t('border-success')}; }`],
    [`.ds-callout--warning { --tone-fg: var(--ds-semantic-fg-warning-primary); --tone-bg: var(--ds-semantic-bg-warning-primary); --tone-border: var(--ds-semantic-utility-warning-300); }`,
     `.ds-callout--warning { --tone-fg: ${t('text-warning')}; --tone-bg: ${t('bg-warning-subtle')}; --tone-border: ${t('border-warning')}; }`],
    [`.ds-callout--error   { --tone-fg: var(--ds-semantic-fg-error-primary);   --tone-bg: var(--ds-semantic-bg-error-primary);   --tone-border: var(--ds-semantic-border-error); }`,
     `.ds-callout--error   { --tone-fg: ${t('text-error')};   --tone-bg: ${t('bg-error-subtle')};   --tone-border: ${t('border-error')}; }`],
  ],

  // ── Tone maps: hand-picked primitives → the paired semantic tokens ──
  'components/Badge/Badge.vue': [
    [`  --badge-bg:             ${c('brand-50')};
  --badge-border:         ${c('brand-200')};
  --badge-text:           ${c('brand-700')};
  --badge-dot:            ${c('brand-500')};
  --badge-outline-border: ${c('brand-600')};`,
     `  --badge-bg:             ${t('bg-brand-subtle')};
  --badge-border:         ${t('border-on-brand-subtle')};
  --badge-text:           ${t('text-on-brand-subtle')};
  --badge-dot:            ${t('bg-brand-solid')};
  --badge-outline-border: ${t('border-brand-solid')};`],
    ...['error', 'warning', 'success'].map((tone) => [
     `  --badge-bg:             ${c(tone + '-50')};
  --badge-border:         ${c(tone + '-200')};
  --badge-text:           ${c(tone + '-700')};
  --badge-dot:            ${c(tone + '-500')};
  --badge-outline-border: ${c(tone + '-600')};`,
     `  --badge-bg:             ${t(`bg-${tone}-subtle`)};
  --badge-border:         ${t(`border-on-${tone}-subtle`)};
  --badge-text:           ${t(`text-on-${tone}-subtle`)};
  --badge-dot:            ${t(`bg-${tone}-solid`)};
  --badge-outline-border: ${t(`border-${tone}-solid`)};`]),
    [`  --badge-bg:             ${c('gray-light-100')};
  --badge-border:         ${c('gray-light-300')};
  --badge-text:           ${c('gray-light-700')};
  --badge-dot:            ${c('gray-light-500')};
  --badge-outline-border: ${c('gray-light-600')};`,
     `  --badge-bg:             ${t('bg-neutral')};
  --badge-border:         ${t('border-default')};
  --badge-text:           ${t('text-default')};
  --badge-dot:            ${t('bg-neutral-strong')};
  --badge-outline-border: ${t('border-default')};`],
    // The eight categorical hues below are NOT semantic tones — they are a
    // label palette with no equivalent in the token layer. They stay as
    // component-tier literals pending a categorical-palette decision.
    [`.ds-badge--blue       {`,
     `/* ADR-0009: categorical label palette — component tier, not semantic tones.\n   These eight hues have no primitive ramp. Pending a categorical-palette ADR. */\n.ds-badge--blue       {`],
  ],
  'components/BadgeGroup/BadgeGroup.vue': [
    [`  --bg-default:  ${c('brand-50')};
  --bg-hover:    ${c('brand-100')};
  --border:      ${c('brand-200')};
  --text:        ${c('brand-700')};
  --pill-border: ${c('brand-200')};`,
     `  --bg-default:  ${t('bg-brand-subtle')};
  --bg-hover:    ${t('bg-brand-subtle-hover')};
  --border:      ${t('border-on-brand-subtle')};
  --text:        ${t('text-on-brand-subtle')};
  --pill-border: ${t('border-on-brand-subtle')};`],
    ...['error', 'warning', 'success'].map((tone) => [
     `  --bg-default:  ${c(tone + '-50')};
  --bg-hover:    ${c(tone + '-100')};
  --border:      ${c(tone + '-200')};
  --text:        ${c(tone + '-700')};
  --pill-border: ${c(tone + '-200')};`,
     `  --bg-default:  ${t(`bg-${tone}-subtle`)};
  --bg-hover:    ${t(`bg-${tone}-subtle-hover`)};
  --border:      ${t(`border-on-${tone}-subtle`)};
  --text:        ${t(`text-on-${tone}-subtle`)};
  --pill-border: ${t(`border-on-${tone}-subtle`)};`]),
    [`  --bg-default:  ${c('gray-light-50')};
  --bg-hover:    ${c('gray-light-100')};
  --border:      ${c('gray-light-200')};
  --text:        var(--ds-semantic-fg-secondary);
  --pill-border: ${c('gray-light-200')};`,
     `  --bg-default:  ${t('bg-neutral-subtle')};
  --bg-hover:    ${t('bg-neutral-subtle-hover')};
  --border:      ${t('border-subtle')};
  --text:        ${t('text-default')};
  --pill-border: ${t('border-subtle')};`],
  ],

  // ── Remaining raw primitive leaks ───────────────────────────────────
  'components/Avatar/Avatar.vue': [
    [`  background-color: ${c('gray-light-100')};`, `  background-color: ${t('bg-neutral')};`],
    [`  color: ${c('gray-light-500')};`, `  color: ${t('text-subtlest')};`],
    // gray-400 was 2.58:1 — below the 3:1 non-text floor
    [`  color: ${c('gray-light-400')};`, `  color: ${t('text-subtlest')};`],
    [`  background-color: ${c('brand-600')};`, `  background-color: ${t('bg-brand-solid')};`],
    [`  background-color: var(--ds-semantic-fg-success-secondary, #17b26a);`,
     `  background-color: ${t('bg-success-solid')};`],
  ],
  'components/Toggle/Toggle.vue': [
    [`  background-color: ${c('base-white')};`, `  background-color: ${t('bg-default')};`],
    [`  background-color: ${c('gray-light-50')};`, `  background-color: ${t('bg-neutral-subtle')};`],
  ],
  'components/InputField/InputField.vue': [
    [`  border-color: var(--ds-color-brand-300, #589b7a);`, `  border-color: ${t('border-brand')};`],
    [`  border-color: var(--ds-color-error-300, #fda29b);`, `  border-color: ${t('border-error')};`, 'all'],
  ],
  'components/TextareaInputField/TextareaInputField.vue': [
    [`  border-color: var(--ds-color-error-300, #fda29b);`, `  border-color: ${t('border-error')};`, 'all'],
  ],
  'components/CreditsChip/CreditsChip.vue': [
    [`  background: var(--ds-color-warning-50, #fffaeb);`, `  background: ${t('bg-warning-subtle')};`],
    [`  border: 1.083px solid var(--ds-color-error-700, #b42318);`, `  border: 1.083px solid ${t('border-error-solid')};`],
    [`  color: var(--ds-color-brand-700, #044b28);`, `  color: ${t('text-brand')};`],
    // ADR-0003: Bold 700 is dropped from the system
    [`  font-weight: 700;`, `  font-weight: var(--ds-font-weight-label-lg);`],
  ],
  'components/Tag/Tag.vue': [
    [`  background-color: ${c('gray-light-400')};`, `  background-color: ${t('bg-neutral-strong')};`],
  ],
  // The nav is a bespoke dark-brand surface. ADR-0009 deleted the brand section
  // grounds, so it carries its own component tokens derived from brand-solid
  // and its paired on-colour — no literals, no raw primitives.
  'components/HorizontalNavigation/HorizontalNavigation.vue': [
    [`  background: rgba(5, 96, 51, 0.9);`,
     `  background: color-mix(in srgb, ${t('bg-brand-solid')} 90%, transparent);`, 'all'],
    [`  color: ${c('gray-light-300')};`,
     `  color: color-mix(in srgb, ${t('text-on-brand-solid')} 70%, transparent);`],
    [`  color: var(--ds-color-gray-light-200, #eaecf0);`, `  color: ${t('text-on-brand-solid')};`, 'all'],
    [`  border: 1px solid var(--ds-color-brand-600, #056033);`, `  border: 1px solid ${t('border-brand-solid')};`],
    [`  background: var(--ds-semantic-fg-error-primary, #d92d20);`, `  background: ${t('bg-error-solid')};`],
    [`  border: 1.5px solid var(--ds-color-gray-light-200, #eaecf0);`, `  border: 1.5px solid ${t('border-subtle')};`],
  ],
  'components/ProgressSteps/ProgressSteps.vue': [
    [`.ds-steps__icon--current    .ds-steps__dot { background-color: white; }`,
     `.ds-steps__icon--current    .ds-steps__dot { background-color: ${t('text-on-brand-solid')}; }`],
    [`.ds-steps__icon--incomplete .ds-steps__dot { background-color: var(--ds-semantic-border-disabled-subtle); }`,
     `.ds-steps__icon--incomplete .ds-steps__dot { background-color: ${t('bg-neutral-strong')}; }`],
  ],
  // ADR-0009: the active segment of a control is a component token — a neutral
  // surface, deliberately NOT bg-selected, which is brand-tinted.
  'components/ButtonGroup/ButtonGroupItem.vue': [
    [`.ds-button-group-item--active {
  background-color: var(--ds-semantic-bg-secondary);
  color: var(--ds-semantic-fg-secondary-hover);
}

.ds-button-group-item--active:hover:not(:disabled) {
  background-color: var(--ds-semantic-bg-secondary-hover);
}`,
     `/* Component token (ADR-0009): segmented selection is a neutral raised
   surface. It must not use bg-selected — that one is brand-tinted, and a
   segmented control is a neutral affordance. */
.ds-button-group-item--active {
  --segment-selected-bg:       ${t('bg-neutral-subtle')};
  --segment-selected-bg-hover: ${t('bg-neutral-subtle-hover')};

  background-color: var(--segment-selected-bg);
  color: ${t('text-default-hover')};
}

.ds-button-group-item--active:hover:not(:disabled) {
  background-color: var(--segment-selected-bg-hover);
}`],
  ],
  'components/Tabs/Tabs.vue': [
    [`  background-color: rgba(255, 255, 255, 0.5);`,
     `  background-color: color-mix(in srgb, ${t('bg-default')} 50%, transparent);`],
  ],
  'components/Scrollbar/Scrollbar.vue': [
    [`  background-color: var(--ds-semantic-fg-senary);`, `  background-color: ${t('bg-neutral-strong')};`],
  ],
  // gray-400 icons were 2.58:1 — below the 3:1 non-text floor
  'components/HelpIcon/HelpIcon.vue': [
    [`  color: var(--ds-semantic-fg-quinary);`, `  color: ${t('text-subtlest')};`],
    [`  color: var(--ds-semantic-fg-quinary-hover);`, `  color: ${t('text-subtle')};`],
  ],
}

/* ────────────────────────────────────────────────────────────────────
   Pass 2 — mechanical renames
   ──────────────────────────────────────────────────────────────────── */

const RENAMES = {
  // text
  'text-primary': 'text-strong',
  'text-secondary': 'text-default',
  'text-tertiary': 'text-subtle',
  'text-quarterary': 'text-subtlest',
  'text-secondary-hover': 'text-default-hover',
  'text-tertiary-hover': 'text-subtle',
  'text-disabled': 'text-disabled',
  'text-placeholder': 'text-placeholder',
  'text-placeholder-subtle': 'text-placeholder',   // gray-300 was 1.47:1
  'text-white': 'text-on-inverse',
  'text-brand-primary': 'text-brand',
  'text-brand-secondary': 'text-on-brand-subtle',
  'text-brand-tertiary': 'text-brand',
  'text-primary-on-brand': 'text-on-brand-solid',
  'text-error-primary': 'text-error',
  'text-warning-primary': 'text-warning',
  'text-success-primary': 'text-success',

  // fg → text (the group is deleted)
  'fg-primary': 'text-strong',
  'fg-secondary': 'text-default',
  'fg-secondary-hover': 'text-default-hover',
  'fg-tertiary': 'text-subtle',
  'fg-tertiary-hover': 'text-subtle',
  'fg-quarterary': 'text-subtlest',
  'fg-quarterary-hover': 'text-subtle',
  'fg-quinary': 'text-subtlest',
  'fg-quinary-hover': 'text-subtle',
  'fg-white': 'text-on-brand-solid',
  'fg-disabled': 'text-disabled',
  'fg-disabled-subtle': 'text-disabled',
  'fg-brand-primary': 'text-brand',
  'fg-brand-secondary': 'text-brand',
  'fg-error-primary': 'text-error',
  'fg-error-secondary': 'text-error',
  'fg-warning-primary': 'text-warning',
  'fg-warning-secondary': 'text-warning',
  'fg-success-primary': 'text-success',

  // bg
  'bg-primary': 'bg-default',
  'bg-primary-hover': 'bg-hover',
  'bg-primary-solid': 'bg-inverse',
  'bg-secondary': 'bg-neutral-subtle',
  'bg-secondary-hover': 'bg-neutral-subtle-hover',
  'bg-secondary-subtle': 'bg-neutral-subtle',
  'bg-tertiary': 'bg-neutral',
  'bg-quaternary': 'bg-neutral-strong',
  'bg-active': 'bg-selected',
  'bg-disabled': 'bg-disabled',
  'bg-disabled-subtle': 'bg-disabled',
  'bg-overlay': 'bg-overlay',
  'bg-brand-primary': 'bg-brand-subtle',
  'bg-brand-secondary': 'bg-selected-hover',
  'bg-brand-solid': 'bg-brand-solid',
  'bg-brand-solid-hover': 'bg-brand-solid-hover',
  'bg-error-primary': 'bg-error-subtle',
  'bg-error-secondary': 'bg-error-subtle-hover',
  'bg-error-solid': 'bg-error-solid',
  'bg-warning-primary': 'bg-warning-subtle',
  'bg-success-primary': 'bg-success-subtle',

  // border
  'border-primary': 'border-default',
  'border-secondary': 'border-subtle',
  'border-tertiary': 'border-subtlest',
  'border-disabled': 'border-disabled',
  'border-disabled-subtle': 'border-subtle',
  'border-brand': 'border-brand',
  'border-brand-solid': 'border-brand-solid',
  'border-error': 'border-error',
  'border-error-solid': 'border-error-solid',

  // the `utility` pseudo-group is retired
  'utility-success-300': 'border-success',
  'utility-warning-300': 'border-warning',
}

/* ──────────────────────────────────────────────────────────────────── */

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (name === 'node_modules' || name === 'dist') continue
    const s = statSync(p)
    if (s.isDirectory()) walk(p, out)
    else if (EXTS.has(extname(p))) out.push(p)
  }
  return out
}

const files = ROOTS.flatMap((r) => { try { return walk(r) } catch { return [] } })
const longestFirst = Object.keys(RENAMES).sort((a, b) => b.length - a.length)

let siteHits = 0, renameHits = 0, missed = []
const changed = new Set()

for (const file of files) {
  const before = readFileSync(file, 'utf8')
  let s = before

  for (const [from, to, mode] of SITE_EDITS[file] ?? []) {
    if (!s.includes(from)) { missed.push(`${file}: ${from.split('\n')[0].trim().slice(0, 70)}`); continue }
    const n = s.split(from).length - 1
    s = mode === 'all' ? s.split(from).join(to) : s.replace(from, to)
    siteHits += mode === 'all' ? n : 1
  }

  for (const old of longestFirst) {
    const re = new RegExp(`--ds-semantic-${old}(?![a-z0-9-])`, 'g')
    const n = (s.match(re) || []).length
    if (n) { s = s.replace(re, `--ds-${RENAMES[old]}`); renameHits += n }
  }

  if (s !== before) { changed.add(file); if (!DRY) writeFileSync(file, s) }
}

console.log(`${DRY ? '[dry] ' : ''}files changed: ${changed.size}`)
console.log(`  site edits applied: ${siteHits}`)
console.log(`  tokens renamed:     ${renameHits}`)
if (missed.length) {
  console.log(`\n  !! ${missed.length} site edit(s) did not match:`)
  for (const m of missed) console.log(`     ${m}`)
}
