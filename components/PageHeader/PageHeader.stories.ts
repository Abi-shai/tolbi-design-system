import type { Meta, StoryObj } from '@storybook/vue3'
import PageHeader from './PageHeader.vue'
import { Button } from '../Button'
import { Card } from '../Card'

// The page's main surface in Figma's frame (2067:5918): a white panel, 16px in.
const SURFACE =
  'background: var(--ds-bg-default); padding: var(--ds-spacing-xl); border-radius: var(--ds-radius-surface);'

const meta: Meta<typeof PageHeader> = {
  title: 'Structure/PageHeader',
  tags: ['wip'],
  component: PageHeader,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          "L'en-tête d'une page : son nom — **le seul `<h1>` de la page** —, une ligne dessous, et les " +
          'actions de la page à droite. Titre en `heading-lg` (20/28), ' +
          'sous-titre en `body-md` `text-subtle`, `spacing-xs` entre les deux et `spacing-xl` jusqu\'aux ' +
          "actions. **Aucune marge externe** : l'écart sous l'en-tête (24 dans la maquette) appartient à " +
          'la page. En colonne étroite, les actions passent sous le texte dès que celui-ci descendrait ' +
          'sous `20rem` — sans point de rupture, c\'est la colonne qui décide.',
      },
    },
  },
  argTypes: {
    title: {
      control: 'text',
      description: 'Le nom de la page — son `<h1>`.',
      table: { category: 'Contenu', type: { summary: 'string' } },
    },
    subtitle: {
      control: 'text',
      description: 'La ligne sous le titre. `#subtitle` la remplace pour un lien ou un mot en gras.',
      table: { category: 'Contenu', type: { summary: 'string' } },
    },
  },
  args: {
    title: 'Rôles et accès',
    subtitle: 'Ce que chaque rôle peut voir et faire, module par module.',
  },
  decorators: [() => ({ template: `<div style="${SURFACE}"><story /></div>` })],
}

export default meta
type Story = StoryObj<typeof meta>

/** La maquette 3A : titre, sous-titre, une action. */
export const Default: Story = {
  render: args => ({
    components: { PageHeader, Button },
    setup: () => ({ args }),
    template: `
      <PageHeader v-bind="args">
        <template #actions>
          <Button label="Créer un rôle" size="lg" />
        </template>
      </PageHeader>
    `,
  }),
}

/** Sans `subtitle` ni `#subtitle` : pas de ligne, et pas d'écart non plus. */
export const WithoutSubtitle: Story = {
  name: 'Sans sous-titre',
  args: { subtitle: undefined },
  render: Default.render,
}

export const TitleOnly: Story = {
  name: 'Titre seul',
  args: { subtitle: undefined },
}

/** `#subtitle` quand la ligne porte un lien ou un mot en gras ; la prop reste son contenu par défaut. */
export const RichSubtitle: Story = {
  name: 'Sous-titre riche — slot',
  render: args => ({
    components: { PageHeader, Button },
    setup: () => ({ args }),
    template: `
      <PageHeader v-bind="args">
        <template #subtitle>
          Ce que chaque rôle peut voir et faire, module par module. Les rôles <strong>système</strong>
          ne se modifient pas — <a href="#" style="color: var(--ds-text-brand);">en savoir plus</a>.
        </template>
        <template #actions>
          <Button label="Créer un rôle" size="lg" />
        </template>
      </PageHeader>
    `,
  }),
}

export const SeveralActions: Story = {
  name: 'Plusieurs actions',
  render: args => ({
    components: { PageHeader, Button },
    setup: () => ({ args }),
    template: `
      <PageHeader v-bind="args">
        <template #actions>
          <Button label="Exporter" variant="secondary-gray" size="lg" />
          <Button label="Créer un rôle" size="lg" />
        </template>
      </PageHeader>
    `,
  }),
}

/**
 * Colonne étroite : le texte descendrait sous `20rem`, donc les actions passent
 * dessous, alignées à gauche, à `spacing-xl`. C'est la colonne qui décide, pas
 * la fenêtre.
 */
export const Narrow: Story = {
  name: 'Colonne étroite',
  render: args => ({
    components: { PageHeader, Button },
    setup: () => ({ args }),
    template: `
      <div style="max-width: 420px;">
        <PageHeader v-bind="args">
          <template #actions>
            <Button label="Exporter" variant="secondary-gray" size="lg" />
            <Button label="Créer un rôle" size="lg" />
          </template>
        </PageHeader>
      </div>
    `,
  }),
}

/** L'écart sous l'en-tête est celui de la page — ici `spacing-3xl`, les 24 de la maquette. */
export const InPage: Story = {
  name: 'Dans la page',
  render: args => ({
    components: { PageHeader, Button, Card },
    setup: () => ({ args }),
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--ds-spacing-3xl);">
        <PageHeader v-bind="args">
          <template #actions>
            <Button label="Créer un rôle" size="lg" />
          </template>
        </PageHeader>
        <Card>Le contenu de la page commence ici.</Card>
      </div>
    `,
  }),
}
