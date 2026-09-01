import type { Meta, StoryObj } from '@storybook/vue3'
import web from '../src/typography/semantic.web.json'
import mobile from '../src/typography/semantic.mobile.json'

const POPPINS = 'var(--ds-typography-font-family-poppins)'
const MONO = 'var(--ds-typography-font-family-mono)'

/**
 * Derived from the token source, not transcribed. The previous version of this
 * story was a hand-written table, and it silently went stale — still listing
 * `heading-2xl` after ADR-0011 deleted it, and missing the eight roles added.
 */
const step = (ref: string) => ref.split('.').pop()!.replace('}', '')
const WEIGHT: Record<string, string> = { regular: 'Regular', medium: 'Medium', semibold: 'Semibold' }
const roles = Object.keys(web['font-size']).map((role) => ({
  role,
  web:    `${step(web['font-size'][role as keyof typeof web['font-size']].value)} / ${step(web['line-height'][role as keyof typeof web['line-height']].value)}`,
  mobile: `${step(mobile['font-size'][role as keyof typeof mobile['font-size']].value)} / ${step(mobile['line-height'][role as keyof typeof mobile['line-height']].value)}`,
  weight: WEIGHT[step(web['font-weight'][role as keyof typeof web['font-weight']].value)],
  use:    (web['font-size'][role as keyof typeof web['font-size']] as { description?: string }).description ?? '',
}))

const weights = [
  { label: 'Regular 400',  fontWeight: 'var(--ds-typography-font-weight-regular)' },
  { label: 'Medium 500',   fontWeight: 'var(--ds-typography-font-weight-medium)' },
  { label: 'Semibold 600', fontWeight: 'var(--ds-typography-font-weight-semibold)' },
]

const SPECIMEN = `
  <div v-for="r in roles" :key="r.role" style="padding: 1rem 0; border-bottom: 1px solid var(--ds-border-subtlest);">
    <div style="display: flex; justify-content: space-between; align-items: baseline; gap: 1rem; margin-bottom: 0.5rem;">
      <span style="font-family: monospace; font-size: 0.75rem; color: #475467;">{{ r.role }}</span>
      <span style="font-family: monospace; font-size: 0.7rem; color: var(--ds-text-subtlest); white-space: nowrap;">
        web {{ r.web }} · mobile {{ r.mobile }} · {{ r.weight }} · <code>font: var(--ds-font-{{ r.role }})</code>
      </span>
    </div>
    <p
      :style="{
        font: 'var(--ds-font-' + r.role + ')',
        letterSpacing: 'var(--ds-letter-spacing-' + r.role + ')',
        fontVariantNumeric: r.role === 'metric-lg' ? 'tabular-nums' : 'normal',
        color: 'var(--ds-text-strong)',
        margin: '0 0 0.25rem',
      }"
    >{{ r.role === 'metric-lg' ? '1 284 302' : 'Traçabilité du cacao' }}</p>
    <p style="margin: 0; font-size: 0.7rem; color: var(--ds-text-subtlest);">{{ r.use }}</p>
  </div>
`

const meta: Meta = {
  title: 'Foundations/Typography',
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Typeface: Story = {
  render: () => ({
    setup: () => ({ weights, POPPINS, MONO }),
    template: `
      <div style="font-family: ${POPPINS}; padding: 2rem; color: var(--ds-text-strong);">
        <div style="display: flex; gap: 3rem; align-items: flex-end; margin-bottom: 3rem;">
          <div>
            <p style="font-size: 3rem; line-height: 1; margin: 0 0 0.5rem;">Poppins</p>
            <p style="font-size: 8rem; line-height: 1; margin: 0; font-weight: 400;">Ag</p>
          </div>
          <div style="display: flex; flex-direction: column; gap: 1.25rem; padding-bottom: 0.5rem;">
            <div v-for="w in weights" :key="w.label" style="display: flex; align-items: center; gap: 1rem;">
              <span :style="{ fontFamily: POPPINS, fontWeight: w.fontWeight, fontSize: '2.5rem', lineHeight: '1', minWidth: '80px' }">Aa</span>
              <p style="margin: 0; font-size: 0.875rem; font-weight: 600;">{{ w.label }}</p>
            </div>
          </div>
        </div>

        <p style="font-size: 0.8rem; color: var(--ds-text-subtlest); max-width: 46rem; margin: 0 0 2.5rem;">
          Three weights only. Bold 700 is deliberately excluded from product UI — at 14–16px it is
          barely distinguishable from Semibold, and two heavy weights guarantee inconsistent use.
        </p>

        <div style="display: flex; gap: 3rem; align-items: flex-end; border-top: 1px solid var(--ds-border-subtle); padding-top: 2rem;">
          <div>
            <p :style="{ fontFamily: MONO, fontSize: '1.5rem', lineHeight: 1, margin: '0 0 0.5rem' }">JetBrains Mono</p>
            <p :style="{ fontFamily: MONO, fontSize: '5rem', lineHeight: 1, margin: 0, fontWeight: 400 }">Ag</p>
          </div>
          <p style="font-size: 0.8rem; color: var(--ds-text-subtlest); max-width: 20rem; padding-bottom: 0.5rem;">
            Regular only, for <code>code-md</code>. Poppins has no monospace cut.
          </p>
        </div>
      </div>
    `,
  }),
}

export const Roles: Story = {
  name: 'Roles — Web',
  render: () => ({
    setup: () => ({ roles, POPPINS, MONO }),
    template: `
      <div style="padding: 2rem; color: var(--ds-text-strong); font-family: ${POPPINS};">
        ${SPECIMEN}
      </div>
    `,
  }),
}

export const RolesMobile: Story = {
  name: 'Roles — Mobile',
  render: () => ({
    setup: () => ({ roles, POPPINS, MONO }),
    template: `
      <div data-typography="mobile" style="padding: 2rem; color: var(--ds-text-strong); font-family: ${POPPINS};">
        <p style="font-size: 0.8rem; color: var(--ds-text-subtlest); margin: 0 0 1.5rem; padding: 0.75rem 1rem; background: var(--ds-bg-neutral-subtle); border-radius: 6px;">
          This panel carries <code>data-typography="mobile"</code>. The same role tokens re-resolve
          to the mobile scale — nothing below sets a size directly.
        </p>
        ${SPECIMEN}
      </div>
    `,
  }),
}
