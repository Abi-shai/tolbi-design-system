import type { Meta, StoryObj } from '@storybook/vue3'
import semanticLight from '../src/color/semantic.light.json'
import semanticDark from '../src/color/semantic.dark.json'
import SemanticTokenRow from './components/SemanticTokenRow.vue'

function refToCssVar(ref: string): string {
  return '--ds-' + ref.replace(/[{}]/g, '').split('.').join('-')
}

function flattenTokens(obj: Record<string, any>, path: string[] = []): Map<string, string> {
  const result = new Map<string, string>()
  for (const [key, val] of Object.entries(obj)) {
    const currentPath = [...path, key]
    if (val && typeof val === 'object' && 'value' in val) {
      result.set(currentPath.join('.'), val.value as string)
    } else if (val && typeof val === 'object') {
      for (const [k, v] of flattenTokens(val, currentPath)) result.set(k, v)
    }
  }
  return result
}

const lightTokens = flattenTokens(semanticLight)
const darkTokens  = flattenTokens(semanticDark)

function getCategory(category: string) {
  return [...lightTokens.entries()]
    .filter(([path]) => path.startsWith(`semantic.${category}.`))
    .map(([path, lightRef]) => ({
      cssVar: '--ds-' + path.split('.').join('-'),
      lightPrimitiveCssVar: refToCssVar(lightRef),
      darkPrimitiveCssVar:  refToCssVar(darkTokens.get(path) ?? lightRef),
    }))
}

const HEADER = `
  <thead>
    <tr style="border-bottom: 2px solid var(--ds-semantic-border-secondary, #EAECF0);">
      <th style="padding: 0.5rem 1.5rem 0.75rem 0; text-align: left; font-family: var(--ds-typography-font-family-poppins); font-size: 0.7rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: var(--ds-semantic-text-tertiary, #667085);">Token</th>
      <th style="padding: 0.5rem 0.75rem 0.75rem; font-family: var(--ds-typography-font-family-poppins); font-size: 0.7rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: var(--ds-semantic-text-tertiary, #667085);">Light</th>
      <th style="padding: 0.5rem 0.75rem 0.75rem; font-family: var(--ds-typography-font-family-poppins); font-size: 0.7rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: var(--ds-semantic-text-tertiary, #667085);">Dark</th>
      <th style="padding: 0.5rem 0 0.75rem 1rem; text-align: left; font-family: var(--ds-typography-font-family-poppins); font-size: 0.7rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: var(--ds-semantic-text-tertiary, #667085);">Primitive (light / dark)</th>
    </tr>
  </thead>
`

function makeStory(category: string): StoryObj<typeof meta> {
  return {
    render: () => ({
      components: { SemanticTokenRow },
      setup: () => ({ tokens: getCategory(category) }),
      template: `
        <div style="padding: 1.5rem; overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse;">
            ${HEADER}
            <tbody>
              <SemanticTokenRow
                v-for="token in tokens"
                :key="token.cssVar"
                :css-var="token.cssVar"
                :light-primitive-css-var="token.lightPrimitiveCssVar"
                :dark-primitive-css-var="token.darkPrimitiveCssVar"
              />
            </tbody>
          </table>
        </div>
      `,
    }),
  }
}

const meta: Meta = {
  title: 'Tokens/Colors/Colors Semantic',
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Background: Story = makeStory('bg')
export const Foreground:  Story = makeStory('fg')
export const Text:        Story = makeStory('text')
export const Border:      Story = makeStory('border')
