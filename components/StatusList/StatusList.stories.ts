import type { Meta, StoryObj } from '@storybook/vue3'
import StatusList from './StatusList.vue'
import StatusRow from './StatusRow.vue'
import { Card } from '../Card'

const meta: Meta<typeof StatusList> = {
  title: 'Données/StatusList',
  component: StatusList,
  tags: ['wip'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Une liste de contrôles : une ligne par contrôle, son état dit par **l’icône, le mot et la couleur** — ' +
          'jamais par la couleur seule (ADR-0092, retour EUDR 43). C’est un `<dl>` : le nom du contrôle est le terme, ' +
          'son état la définition, donc les deux sont associés sans `aria-describedby`. Quatre tons — `success`, ' +
          '`warning`, `error`, `neutral` — et le **mot reste au produit** (`status`), parce que « En attente » et ' +
          '« Non analysé » sont deux faits sous un seul ton. Le ton choisit le glyphe et l’encre, et rien ne permet ' +
          'de les dissocier.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof StatusList>

/** Les trois contrôles EUDR d’une parcelle. */
export const Default: Story = {
  name: 'Les contrôles d’une parcelle',
  render: () => ({
    components: { StatusList, StatusRow },
    template: `
      <div style="width:420px">
        <StatusList>
          <StatusRow label="Déforestation après 2020" tone="success" status="Conforme" />
          <StatusRow label="Chevauchement de parcelles" tone="warning" status="À vérifier" />
          <StatusRow label="Zone protégée" tone="error" status="Non conforme" />
        </StatusList>
      </div>
    `,
  }),
}

/** Les quatre tons. Le neutre ne réclame pas de couleur : il recule. */
export const AllTones: Story = {
  name: 'Les quatre tons',
  render: () => ({
    components: { StatusList, StatusRow },
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

/**
 * Dans une `Card` : la liste ne dessine ni fond ni cadre, et ses filets ne
 * courent qu’**entre** les lignes — aucun ne vient buter sous la dernière.
 */
export const InACard: Story = {
  name: 'Dans une carte',
  render: () => ({
    components: { StatusList, StatusRow, Card },
    template: `
      <div style="width:460px">
        <Card>
          <div style="display:flex;flex-direction:column;gap:4px">
            <p style="margin:0;font:var(--ds-font-label-lg-strong);color:var(--ds-text-strong)">Contrôles RDUE</p>
            <p style="margin:0;font:var(--ds-font-body-sm);color:var(--ds-text-subtle)">Parcelle 62590-014 · analysée le 27 octobre 2026</p>
          </div>
          <StatusList style="margin-top:8px">
            <StatusRow label="Déforestation après 2020" tone="success" status="Conforme" />
            <StatusRow label="Chevauchement de parcelles" tone="warning" status="À vérifier" />
            <StatusRow label="Zone protégée" tone="error" status="Non conforme" />
            <StatusRow label="Analyse satellite" tone="neutral" status="En attente" />
          </StatusList>
        </Card>
      </div>
    `,
  }),
}

/** Un nom long se replie sous lui-même ; le mot, lui, ne se coupe jamais. */
export const LongLabel: Story = {
  name: 'Nom long',
  render: () => ({
    components: { StatusList, StatusRow },
    template: `
      <div style="width:320px">
        <StatusList>
          <StatusRow
            label="Absence de déforestation sur l’emprise déclarée depuis le 31 décembre 2020"
            tone="success"
            status="Conforme"
          />
          <StatusRow label="Zone protégée" tone="error" status="Non conforme" />
        </StatusList>
      </div>
    `,
  }),
}
