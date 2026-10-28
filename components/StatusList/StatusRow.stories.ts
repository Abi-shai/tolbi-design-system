import type { Meta, StoryObj } from '@storybook/vue3'
import StatusRow from './StatusRow.vue'
import StatusList from './StatusList.vue'

const meta: Meta<typeof StatusRow> = {
  title: 'Données/StatusList/Row',
  component: StatusRow,
  tags: ['wip'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Une ligne de contrôle (ADR-0092) : le glyphe, le nom, et **le mot dans l’encre du ton** — ' +
          'jamais la couleur seule. C’est une paire `dt`/`dd`, donc le nom et son état sont associés sans ' +
          'qu’un `aria-describedby` ait à le dire ; elle veut un `StatusList` (`<dl>`) autour d’elle.\n\n' +
          '`status` est **obligatoire et au produit** : « En attente » et « Non analysé » sont deux faits ' +
          'sous un seul ton. Le ton choisit le glyphe et l’encre, **sans échappatoire** — qui pourrait ' +
          'échanger le glyphe pourrait casser la paire que la règle existe pour tenir (ADR-0006).\n\n' +
          'L’encre est le partenaire sur teinte, pas `text-{tone}` : mesuré sur `bg-default` en clair, ' +
          '`text-success` tombe à 3,906:1 et `text-warning` à 3,486:1 — sous le seuil AA pour un mot ' +
          '(ADR-0032, deuxième application).',
      },
    },
    controls: { exclude: [] },
  },
  args: { label: 'Déforestation après 2020', tone: 'success', status: 'Conforme' },
  argTypes: {
    tone: { control: 'select', options: ['success', 'warning', 'error', 'neutral'] },
  },
  render: (args) => ({
    components: { StatusRow, StatusList },
    setup: () => ({ args }),
    template: '<div style="width:420px"><StatusList><StatusRow v-bind="args" /></StatusList></div>',
  }),
}

export default meta
type Story = StoryObj<typeof StatusRow>

export const Default: Story = { name: 'Une ligne' }

/** Les quatre tons, un par ligne. Le neutre recule au lieu de réclamer une couleur. */
export const Tones: Story = {
  name: 'Les quatre tons',
  render: () => ({
    components: { StatusRow, StatusList },
    template: `
      <div style="width:420px">
        <StatusList>
          <StatusRow label="Déforestation après 2020" tone="success" status="Conforme" />
          <StatusRow label="Chevauchement de parcelles" tone="warning" status="À vérifier" />
          <StatusRow label="Zone protégée" tone="error" status="Non conforme" />
          <StatusRow label="Analyse satellite" tone="neutral" status="En attente" />
        </StatusList>
      </div>
    `,
  }),
}

/** Un nom long se replie ; le mot, lui, ne se coupe jamais, et le glyphe tient la première ligne. */
export const LongLabel: Story = {
  name: 'Nom long',
  render: () => ({
    components: { StatusRow, StatusList },
    template: `
      <div style="width:320px">
        <StatusList>
          <StatusRow
            label="Absence de déforestation sur l’emprise déclarée depuis le 31 décembre 2020"
            tone="success"
            status="Conforme"
          />
        </StatusList>
      </div>
    `,
  }),
}
