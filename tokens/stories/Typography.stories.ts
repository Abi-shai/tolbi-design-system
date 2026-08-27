import type { Meta, StoryObj } from '@storybook/vue3'

const POPPINS = 'var(--ds-typography-font-family-poppins)'
const MONO = 'var(--ds-typography-font-family-mono)'

/**
 * The 13 semantic roles. `web` / `mobile` are documentation only — the live
 * values come from the role tokens, which re-resolve under
 * [data-typography="mobile"].
 */
const roles = [
  { role: 'heading-2xl', web: '32 / 40', mobile: '28 / 36', weight: 'Semibold', use: 'Onboarding, empty states. On iOS = large nav title' },
  { role: 'heading-xl',  web: '24 / 32', mobile: '22 / 28', weight: 'Semibold', use: 'Page title' },
  { role: 'heading-lg',  web: '20 / 28', mobile: '20 / 28', weight: 'Semibold', use: 'Section heading, modal/drawer title' },
  { role: 'heading-md',  web: '16 / 24', mobile: '17 / 24', weight: 'Semibold', use: 'Card title, list-group header' },
  { role: 'heading-sm',  web: '14 / 20', mobile: '15 / 20', weight: 'Semibold', use: 'Dense sub-headers, table column headers' },
  { role: 'body-lg',     web: '16 / 24', mobile: '17 / 24', weight: 'Regular',  use: 'Long-form on web. Default body on mobile' },
  { role: 'body-md',     web: '14 / 20', mobile: '15 / 24', weight: 'Regular',  use: 'Default body on web. Table cells, form values' },
  { role: 'body-sm',     web: '12 / 16', mobile: '13 / 20', weight: 'Regular',  use: 'Helper text, timestamps, tooltips' },
  { role: 'label-lg',    web: '14 / 20', mobile: '16 / 24', weight: 'Medium',   use: 'Buttons, tabs, nav items' },
  { role: 'label-md',    web: '12 / 16', mobile: '13 / 20', weight: 'Medium',   use: 'Field labels, chips, badges' },
  { role: 'label-xs',    web: '11 / 16', mobile: '11 / 16', weight: 'Medium',   use: 'Tab-bar labels, chart axes. Floor — never content' },
  { role: 'metric-lg',   web: '32 / 36', mobile: '28 / 32', weight: 'Semibold', use: 'Dashboard KPI values. Needs tabular-nums' },
  { role: 'code-md',     web: '13 / 20', mobile: '13 / 20', weight: 'Regular',  use: 'IDs, API keys, snippets — JetBrains Mono' },
] as const

const weights = [
  { label: 'Regular 400',  fontWeight: 'var(--ds-typography-font-weight-regular)' },
  { label: 'Medium 500',   fontWeight: 'var(--ds-typography-font-weight-medium)' },
  { label: 'Semibold 600', fontWeight: 'var(--ds-typography-font-weight-semibold)' },
]

const SPECIMEN = `
  <div v-for="r in roles" :key="r.role" style="padding: 1rem 0; border-bottom: 1px solid #F2F4F7;">
    <div style="display: flex; justify-content: space-between; align-items: baseline; gap: 1rem; margin-bottom: 0.5rem;">
      <span style="font-family: monospace; font-size: 0.75rem; color: #475467;">{{ r.role }}</span>
      <span style="font-family: monospace; font-size: 0.7rem; color: #98A2B3; white-space: nowrap;">
        web {{ r.web }} · mobile {{ r.mobile }} · {{ r.weight }}
      </span>
    </div>
    <p
      :style="{
        fontFamily: r.role === 'code-md' ? MONO : POPPINS,
        fontSize: 'var(--ds-font-size-' + r.role + ')',
        lineHeight: 'var(--ds-line-height-' + r.role + ')',
        letterSpacing: 'var(--ds-letter-spacing-' + r.role + ')',
        fontWeight: 'var(--ds-font-weight-' + r.role + ')',
        fontVariantNumeric: r.role === 'metric-lg' ? 'tabular-nums' : 'normal',
        color: '#101828',
        margin: '0 0 0.25rem',
      }"
    >{{ r.role === 'metric-lg' ? '1 284 302' : 'Traçabilité du cacao' }}</p>
    <p style="margin: 0; font-size: 0.7rem; color: #98A2B3;">{{ r.use }}</p>
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
      <div style="font-family: ${POPPINS}; padding: 2rem; color: #101828;">
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

        <p style="font-size: 0.8rem; color: #667085; max-width: 46rem; margin: 0 0 2.5rem;">
          Three weights only. Bold 700 is deliberately excluded from product UI — at 14–16px it is
          barely distinguishable from Semibold, and two heavy weights guarantee inconsistent use.
        </p>

        <div style="display: flex; gap: 3rem; align-items: flex-end; border-top: 1px solid #EAECF0; padding-top: 2rem;">
          <div>
            <p :style="{ fontFamily: MONO, fontSize: '1.5rem', lineHeight: 1, margin: '0 0 0.5rem' }">JetBrains Mono</p>
            <p :style="{ fontFamily: MONO, fontSize: '5rem', lineHeight: 1, margin: 0, fontWeight: 400 }">Ag</p>
          </div>
          <p style="font-size: 0.8rem; color: #667085; max-width: 20rem; padding-bottom: 0.5rem;">
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
      <div style="padding: 2rem; color: #101828; font-family: ${POPPINS};">
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
      <div data-typography="mobile" style="padding: 2rem; color: #101828; font-family: ${POPPINS};">
        <p style="font-size: 0.8rem; color: #667085; margin: 0 0 1.5rem; padding: 0.75rem 1rem; background: #F9FAFB; border-radius: 6px;">
          This panel carries <code>data-typography="mobile"</code>. The same role tokens re-resolve
          to the mobile scale — nothing below sets a size directly.
        </p>
        ${SPECIMEN}
      </div>
    `,
  }),
}
