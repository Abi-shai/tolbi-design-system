import type { Meta, StoryObj } from '@storybook/vue3'

const POPPINS = 'var(--ds-typography-font-family-poppins)'

const scale = [
  { name: 'Display 2xl', sizeVar: 'display-2xl', px: '72px', tracking: 'tight' },
  { name: 'Display xl',  sizeVar: 'display-xl',  px: '60px', tracking: 'tight' },
  { name: 'Display lg',  sizeVar: 'display-lg',  px: '48px', tracking: 'tight' },
  { name: 'Display md',  sizeVar: 'display-md',  px: '36px', tracking: 'tight' },
  { name: 'Display sm',  sizeVar: 'display-sm',  px: '30px', tracking: 'normal' },
  { name: 'Display xs',  sizeVar: 'display-xs',  px: '24px', tracking: 'normal' },
  { name: 'Text xl',     sizeVar: 'text-xl',     px: '20px', tracking: 'normal' },
  { name: 'Text lg',     sizeVar: 'text-lg',     px: '18px', tracking: 'normal' },
  { name: 'Text md',     sizeVar: 'text-md',     px: '16px', tracking: 'normal' },
  { name: 'Text sm',     sizeVar: 'text-sm',     px: '14px', tracking: 'normal' },
  { name: 'Text xs',     sizeVar: 'text-xs',     px: '12px', tracking: 'normal' },
] as const

const weights = [
  { label: 'Regular',  fontWeight: 'var(--ds-typography-font-weight-regular)' },
  { label: 'Medium',   fontWeight: 'var(--ds-typography-font-weight-medium)' },
  { label: 'Semibold', fontWeight: 'var(--ds-typography-font-weight-semibold)' },
  { label: 'Bold',     fontWeight: 'var(--ds-typography-font-weight-bold)' },
]

const meta: Meta = {
  title: 'Tokens/Typography',
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Typeface: Story = {
  render: () => ({
    setup: () => ({ weights, POPPINS }),
    template: `
      <div style="font-family: var(--ds-typography-font-family-poppins); padding: 2rem; color: #101828;">
        <div style="display: flex; gap: 3rem; align-items: flex-end; margin-bottom: 3rem;">
          <div>
            <p style="font-size: 3rem; line-height: 1; margin: 0 0 0.5rem;">Poppins</p>
            <p style="font-size: 8rem; line-height: 1; margin: 0; font-weight: 400;">Ag</p>
          </div>
          <div style="display: flex; flex-direction: column; gap: 1.25rem; padding-bottom: 0.5rem;">
            <div v-for="w in weights" :key="w.label" style="display: flex; align-items: center; gap: 1rem;">
              <span :style="{ fontFamily: POPPINS, fontWeight: w.fontWeight, fontSize: '2.5rem', lineHeight: '1', color: '#101828', minWidth: '80px' }">Aa</span>
              <div>
                <p style="margin: 0; font-size: 0.875rem; font-weight: 600; color: #101828;">{{ w.label }}</p>
                <p style="margin: 0; font-size: 0.75rem; color: #667085; font-family: var(--ds-typography-font-family-poppins);">
                  Poppins · {{ w.fontWeight }}
                </p>
              </div>
            </div>
          </div>
        </div>
        <p :style="{ fontFamily: POPPINS, fontWeight: '400', fontSize: '2.25rem', lineHeight: '1.25', color: '#101828', letterSpacing: '-0.02em', wordBreak: 'break-all', margin: 0 }">
          ABCDEFGHIJKLMNOPQRSTUVWXYZ<br>
          abcdefghijklmnopqrstuvwxyz<br>
          0123456789 !@#$%^&amp;*()
        </p>
      </div>
    `,
  }),
}

export const TypeScale: Story = {
  render: () => ({
    setup: () => ({ scale, weights, POPPINS }),
    template: `
      <div style="padding: 2rem; color: #101828; overflow-x: auto;">
        <div v-for="step in scale" :key="step.name" style="margin-bottom: 2.5rem; padding-bottom: 2.5rem; border-bottom: 1px solid #EAECF0;">
          <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 1rem; padding-bottom: 0.75rem; border-bottom: 1px solid #F2F4F7;">
            <span style="font-family: var(--ds-typography-font-family-poppins); font-weight: 500; font-size: 0.875rem; color: #475467;">
              {{ step.name }}
            </span>
            <span style="font-family: var(--ds-typography-font-family-poppins); font-size: 0.8rem; color: #98A2B3;">
              {{ step.px }} · lh {{ 'var(--ds-typography-line-height-' + step.sizeVar + ')' }} · ls {{ step.tracking === 'tight' ? '-2%' : '0' }}
            </span>
          </div>
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem;">
            <div v-for="w in weights" :key="w.label">
              <p
                :style="{
                  fontFamily: POPPINS,
                  fontWeight: w.fontWeight,
                  fontSize: 'var(--ds-typography-font-size-' + step.sizeVar + ')',
                  lineHeight: 'var(--ds-typography-line-height-' + step.sizeVar + ')',
                  letterSpacing: step.tracking === 'tight' ? 'var(--ds-typography-letter-spacing-tight)' : 'var(--ds-typography-letter-spacing-normal)',
                  color: '#101828',
                  margin: '0 0 0.25rem',
                }"
              >{{ step.name }}</p>
              <p style="margin: 0; font-family: var(--ds-typography-font-family-poppins); font-size: 0.7rem; color: #98A2B3;">{{ w.label }}</p>
            </div>
          </div>
        </div>
      </div>
    `,
  }),
}
