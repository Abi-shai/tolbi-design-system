import type { Meta, StoryObj } from '@storybook/vue3'
import ModuleIconStack from './ModuleIconStack.vue'

const meta: Meta<typeof ModuleIconStack> = {
  title: 'Identité & média/ModuleIconStack',
  component: ModuleIconStack,
  tags: ['wip'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Les modules d’un utilisateur, leurs logos chevauchés (ADR-0208) — la forme d’`AvatarGroup` pour les ' +
          'modules : chaque logo recouvre le précédent d’un quart, le premier dessus, deux au plus par défaut, pas de ' +
          '« +N » (c’est une illustration, pas un compte). Le carreau d’un logo est une teinte à 30 % : chaque logo ' +
          'pose donc sur une découpe au fond où il est, cerclée de 2px du même fond — `--on-plate-ground` sur une ' +
          'plaque, `bg-default` ailleurs. Décoratif.',
      },
    },
  },
  args: { modules: ['Yield', 'Scan', 'Source'], max: 2, size: 24 },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** Sur la plaque d’une ligne d’action : la découpe et le liseré prennent le gris de la plaque. */
export const OnPlate: Story = {
  name: 'Sur une plaque',
  render: args => ({
    components: { ModuleIconStack },
    setup: () => ({ args }),
    template: `
      <span style="--on-plate-ground: var(--ds-bg-neutral-subtle); display:flex; align-items:center; justify-content:center; width:3rem; height:3rem; border-radius:var(--ds-radius-surface); background:var(--on-plate-ground)">
        <ModuleIconStack v-bind="args" />
      </span>`,
  }),
}
