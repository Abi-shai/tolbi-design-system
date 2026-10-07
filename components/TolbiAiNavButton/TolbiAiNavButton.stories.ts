import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import TolbiAiNavButton from './TolbiAiNavButton.vue'

const meta: Meta<typeof TolbiAiNavButton> = {
  title: 'Navigation/TolbiAiNavButton',
  component: TolbiAiNavButton,
  tags: ['autodocs', 'wip'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'L\'entrée de Tolbi AI dans la barre, au-dessus de l\'endroit où le panneau s\'ouvre : le signe ' +
          'et le nom, un `Button` comme « Apprendre », et la marque de l\'élément courant tant que le ' +
          'panneau est ouvert. ⌘J (Ctrl+J ailleurs) fait comme le clic. Elle va dans l\'emplacement ' +
          '`#assistant` de `HorizontalNavigation` (ADR-0062).',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Closed: Story = {
  name: 'Fermé',
  render: () => ({
    components: { TolbiAiNavButton },
    setup: () => ({ open: ref(false) }),
    template: '<TolbiAiNavButton v-model:open="open" :shortcut="false" />',
  }),
}

export const Open: Story = {
  name: 'Ouvert',
  render: () => ({
    components: { TolbiAiNavButton },
    setup: () => ({ open: ref(true) }),
    template: '<TolbiAiNavButton v-model:open="open" :shortcut="false" />',
  }),
}

/** ⌘J ouvre et ferme, d'où que soit le focus. */
export const Shortcut: Story = {
  name: 'Raccourci',
  render: () => ({
    components: { TolbiAiNavButton },
    setup: () => ({ open: ref(false) }),
    template: `
      <div style="display:flex; align-items:center; gap:var(--ds-spacing-lg); font:var(--ds-font-body-sm); color:var(--ds-text-subtle);">
        <TolbiAiNavButton v-model:open="open" />
        <span>Panneau : {{ open ? 'ouvert' : 'fermé' }}</span>
      </div>
    `,
  }),
}
