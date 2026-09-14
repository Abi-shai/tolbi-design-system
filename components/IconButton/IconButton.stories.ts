import type { Meta, StoryObj } from '@storybook/vue3'
import IconButton from './IconButton.vue'

const meta: Meta<typeof IconButton> = {
  title: 'Actions/IconButton',
  component: IconButton,
  tags: ['autodocs', 'stable'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          "Bouton d'action rond de la barre de navigation : 8px autour d'un glyphe de 20px, " +
          'soit 36px (Figma `Nav/IconButton`). Une seule taille, parce que le composant ' +
          "n'en a qu'une. Le fond est transparent : il prend la surface derrière lui.",
      },
    },
  },
  argTypes: {
    icon:      { control: 'text', table: { category: 'Contenu' } },
    ariaLabel: { control: 'text', table: { category: 'Contenu' } },
    active:    { control: 'boolean', table: { category: 'État', defaultValue: { summary: 'false' } } },
    disabled:  { control: 'boolean', table: { category: 'État', defaultValue: { summary: 'false' } } },
  },
  args: { icon: 'settings', ariaLabel: 'Paramètres' },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { name: 'Par défaut' }

/** `active` is the trigger holding a surface open — it reads as hovered until it closes. */
export const Active: Story = {
  name: 'Actif (surface ouverte)',
  args: { icon: 'layout-grid', ariaLabel: 'Modules', active: true },
}

export const Disabled: Story = {
  name: 'Désactivé',
  args: { disabled: true },
}

export const TheNavSet: Story = {
  name: 'Le jeu de la barre de navigation',
  render: () => ({
    components: { IconButton },
    template: `
      <div style="display:flex;gap:8px;align-items:center;">
        <IconButton icon="settings"    ariaLabel="Paramètres" />
        <IconButton icon="bell"        ariaLabel="Notifications" />
        <IconButton icon="layout-grid" ariaLabel="Modules" />
      </div>
    `,
  }),
}
