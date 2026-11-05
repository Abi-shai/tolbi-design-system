import { computed, ref } from 'vue'
import type { Meta, StoryObj } from '@storybook/vue3'
import CreditCost from './CreditCost.vue'
import { Button } from '../Button'
import { ButtonGroup, ButtonGroupItem } from '../ButtonGroup'
import { Dialog } from '../Dialog'
import { FormField } from '../FormField'
import { InputField } from '../InputField'

const meta: Meta<typeof CreditCost> = {
  title: 'Étiquettes/CreditCost',
  component: CreditCost,
  tags: ['wip'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Ce qu’une action va coûter, dit **avant le clic** — le motif de toute action qui consomme des crédits ' +
          'et se lance depuis un panneau de création (ADR-0104). Il se pose dans le pied de `Dialog placement="side"`, ' +
          'par le slot `#summary` : le coût à gauche, l’action à droite. `cost` absent = pas encore calculable (« — »), ' +
          '`null` = en calcul, un nombre = le coût. Avec `balance`, un coût au-dessus du solde passe à l’encre d’erreur ' +
          'avec son signe ; ce qu’on y fait (« Acheter des crédits ») est l’action du produit.',
      },
    },
  },
  argTypes: {
    cost: {
      control: 'number',
      description: '`undefined` : pas encore calculable. `null` : en calcul.',
      table: { category: 'Contenu', type: { summary: 'number | null' } },
    },
    balance: { control: 'number', table: { category: 'Contenu' } },
    label: { control: 'text', table: { category: 'Contenu', defaultValue: { summary: "'Coût en crédits'" } } },
    locale: { control: 'text', table: { category: 'Contenu', defaultValue: { summary: "'fr-FR'" } } },
  },
  args: { cost: 4720, balance: 12400 },
}

export default meta
type Story = StoryObj<typeof meta>

/** Assez de crédits : le coût, rien d’autre. */
export const Default: Story = {
  name: 'Assez de crédits',
}

/** Les quatre états, dans l’ordre de la vie du formulaire. */
export const States: Story = {
  name: 'Les quatre états',
  parameters: { layout: 'padded' },
  render: () => ({
    components: { CreditCost },
    template: `
      <div style="display:flex;flex-direction:column;gap:var(--ds-spacing-3xl);align-items:flex-start;">
        <CreditCost />
        <CreditCost :cost="null" />
        <CreditCost :cost="4720" :balance="12400" />
        <CreditCost :cost="4720" :balance="2574" />
      </div>
    `,
  }),
}

/**
 * Où il vit : le pied du panneau de création. Le coût suit le formulaire — tant que la
 * zone n’est pas choisie, il attend ; le temps du calcul, il se tait ; puis il dit le
 * nombre. Sans assez de crédits, l’action principale devient « Acheter des crédits ».
 */
export const InThePanel: Story = {
  name: 'Dans le panneau de création',
  parameters: { layout: 'fullscreen' },
  render: () => ({
    components: { CreditCost, Dialog, Button, ButtonGroup, ButtonGroupItem, FormField, InputField },
    setup() {
      const open = ref(false)
      const zone = ref<'none' | 'soubre'>('none')
      const balance = ref<'12400' | '2574'>('12400')
      const cost = ref<number | null | undefined>(undefined)
      let timer: ReturnType<typeof setTimeout> | undefined
      const pick = (z: 'none' | 'soubre') => {
        zone.value = z
        clearTimeout(timer)
        if (z === 'none') { cost.value = undefined; return }
        cost.value = null
        timer = setTimeout(() => { cost.value = 4720 }, 900)
      }
      const enough = computed(() => typeof cost.value === 'number' && cost.value <= Number(balance.value))
      const short = computed(() => typeof cost.value === 'number' && cost.value > Number(balance.value))
      return { open, zone, balance, cost, pick, enough, short }
    },
    template: `
      <div style="min-height:100vh;padding:var(--ds-spacing-3xl);background:var(--ds-bg-neutral);display:flex;gap:var(--ds-spacing-xl);align-items:center;flex-wrap:wrap;">
        <Button label="Créer un projet Monitoring" variant="primary" icon-leading="plus" @click="open = true" />
        <ButtonGroup v-model="balance" aria-label="Solde">
          <ButtonGroupItem value="12400" label="Solde 12 400" />
          <ButtonGroupItem value="2574" label="Solde 2 574" />
        </ButtonGroup>
        <Dialog v-model:open="open" placement="side" title="Créer un projet Monitoring" description="Un projet suit chaque année le carbone d’une zone, face à sa baseline.">
          <FormField label="Nom du projet" required>
            <InputField model-value="FPH — Agroforesterie cacao" data-autofocus />
          </FormField>
          <FormField label="La baseline" hint="Sa zone fixe le coût du suivi.">
            <ButtonGroup :model-value="zone" @update:model-value="pick" aria-label="Baseline">
              <ButtonGroupItem value="none" label="Aucune" />
              <ButtonGroupItem value="soubre" label="Soubré nord · 236 ha" />
            </ButtonGroup>
          </FormField>
          <template #summary>
            <CreditCost :cost="cost" :balance="Number(balance)" />
          </template>
          <template #actions>
            <Button label="Annuler" variant="secondary-gray" size="sm" @click="open = false" />
            <Button v-if="short" label="Acheter des crédits" variant="primary" size="sm" />
            <Button v-else label="Lancer le suivi" variant="primary" size="sm" :disabled="!enough" @click="open = false" />
          </template>
        </Dialog>
      </div>
    `,
  }),
}
