import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import { within, userEvent, expect, waitFor } from '@storybook/test'
import ZoneField from './ZoneField.vue'
import type { ZoneFieldGlyph } from './ZoneField.vue'
import { FormField } from '../FormField'
import { Toast, ToastRegion } from '../Toast'
import { Button } from '../Button'

const meta: Meta<typeof ZoneField> = {
  title: 'Saisie/ZoneField',
  component: ZoneField,
  /* wip: first release — nine creation panels still draw the block by hand. */
  tags: ['wip'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'La zone d’un projet (ADR-0157, inventaire Figma `4134:1427`). **Un gabarit fixe** — `Card sunk`, le titre, ' +
          'la phrase — et **un seul élément qui change** : « Définir la zone » tant qu’il est vide, puis le résultat — ' +
          'le dessin de la zone (`ProjectGlyph`), **la surface** et **la méthode**. La fenêtre de choix reste au produit : ' +
          'le champ émet `define`, `edit` et `remove`. **`method` décide** qu’il est rempli. La surface s’écrit selon ' +
          '`locale` (« 0,4 ha », « 12 480 ha »), `\'pending\'` pendant le calcul, `null` si elle est inconnue.',
      },
    },
  },
  args: {
    area: 412,
    method: 'Mes producteurs',
    glyph: { kind: 'parcel', count: 3, seed: 'projet-412' },
  },
}

export default meta
type Story = StoryObj<typeof meta>

const column = 'width:420px;display:flex;flex-direction:column;gap:16px'

/** Vide — le seul chemin : « Définir la zone ». */
export const Empty: Story = {
  name: 'Vide',
  render: () => ({
    components: { ZoneField },
    template: `<div style="${column}"><ZoneField /></div>`,
  }),
}

/** Rempli — la surface, puis la méthode en mots, sans chiffre ; le dessin dit le genre de zone. */
export const Filled: Story = {
  name: 'Rempli',
  render: () => ({
    components: { ZoneField },
    setup: () => ({
      rows: [
        { area: 412, method: 'Mes producteurs', glyph: { kind: 'parcel', count: 3, seed: 'a' } },
        { area: 0.4, method: 'Tracé manuel', glyph: { kind: 'parcel', count: 1, seed: 'b' } },
        { area: 12480, method: 'Fichier importé', glyph: { kind: 'parcel', count: 3, seed: 'c' } },
        { area: 1248300, method: 'Zone administrative', glyph: { kind: 'zone', seed: 'd' } },
        { area: 9.96, method: 'Zone éligible', glyph: { kind: 'zone', seed: 'e' } },
      ] as { area: number; method: string; glyph: ZoneFieldGlyph }[],
    }),
    template: `<div style="${column}"><ZoneField v-for="r in rows" :key="r.method" v-bind="r" /></div>`,
  }),
}

/** Les états de la surface — en calcul (le placeholder lisible sur la teinte), inconnue. */
export const AreaStates: Story = {
  name: 'Surface en calcul, inconnue',
  render: () => ({
    components: { ZoneField },
    template: `
      <div style="${column}">
        <ZoneField area="pending" method="Mes producteurs" :glyph="{ kind: 'parcel', count: 3, seed: 'a' }" />
        <ZoneField :area="null" method="Fichier importé" :glyph="{ kind: 'parcel', count: 3, seed: 'c' }" />
      </div>
    `,
  }),
}

/** Lecture seule — la ligne sans ses actions : un projet en modification, une baseline lancée depuis une zone. */
export const Readonly: Story = {
  name: 'Lecture seule',
  render: () => ({
    components: { ZoneField },
    template: `
      <div style="${column}">
        <ZoneField readonly :area="412" method="Zone éligible" :glyph="{ kind: 'zone', seed: 'meagui' }" />
      </div>
    `,
  }),
}

/** Erreur et désactivé — l’erreur est celle du `FormField` autour : le contour du bloc, le message dessous. */
export const ErrorAndDisabled: Story = {
  name: 'Erreur, désactivé',
  render: () => ({
    components: { ZoneField, FormField },
    template: `
      <div style="${column}">
        <FormField error="Définissez la zone du projet."><ZoneField /></FormField>
        <ZoneField disabled />
        <ZoneField disabled :area="412" method="Mes producteurs" :glyph="{ kind: 'parcel', count: 3, seed: 'a' }" />
      </div>
    `,
  }),
}

/**
 * Le parcours — « Définir la zone » ouvre la fenêtre du produit (ici, simulée : 412 ha, Mes producteurs, puis le
 * calcul). **Retirer ne demande rien** : le produit vide le champ et montre « Zone retirée » avec « Annuler ».
 */
export const Flow: Story = {
  name: 'Parcours',
  render: () => ({
    components: { ZoneField, FormField, Toast, ToastRegion, Button },
    setup: () => {
      type Zone = { area: number | 'pending' | null; method: string; glyph: ZoneFieldGlyph }
      const zone = ref<Zone | null>(null)
      const removed = ref<Zone | null>(null)
      const toast = ref(false)
      function define() {
        zone.value = { area: 'pending', method: 'Mes producteurs', glyph: { kind: 'parcel', count: 3, seed: 'p' } }
        setTimeout(() => { if (zone.value) zone.value = { ...zone.value, area: 412 } }, 1200)
      }
      function remove() {
        removed.value = zone.value
        zone.value = null
        toast.value = true
      }
      function undo() {
        zone.value = removed.value
        toast.value = false
      }
      return { zone, toast, define, remove, undo }
    },
    template: `
      <div style="${column}">
        <FormField>
          <ZoneField
            :area="zone?.area ?? null"
            :method="zone?.method"
            :glyph="zone?.glyph"
            @define="define"
            @edit="define"
            @remove="remove"
          />
        </FormField>
        <ToastRegion>
          <Toast v-if="toast" message="Zone retirée" @dismiss="toast = false">
            <template #actions><Button label="Annuler" variant="link" size="sm" @click="undo" /></template>
          </Toast>
        </ToastRegion>
      </div>
    `,
  }),
  /* Guarded: defined → read as one sentence; removed at once → the focus on « Définir la zone »; « Annuler » puts it back. */
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const body = within(canvasElement.ownerDocument.body)
    await userEvent.click(canvas.getByRole('button', { name: 'Définir la zone' }))
    await waitFor(() => expect(canvas.getByText(/^412\sha$/)).toBeVisible(), { timeout: 3000 })
    const group = canvas.getByRole('group', { name: 'Zone du projet' })
    await expect(group).toHaveTextContent(/Zone du projet : 412\sha, Mes producteurs/)
    await userEvent.click(canvas.getByRole('button', { name: 'Retirer la zone' }))
    const define = await canvas.findByRole('button', { name: 'Définir la zone' })
    await waitFor(() => expect(define).toHaveFocus())
    await userEvent.click(await body.findByRole('button', { name: 'Annuler' }))
    await waitFor(() => expect(canvas.getByText('Mes producteurs')).toBeVisible())
  },
}
