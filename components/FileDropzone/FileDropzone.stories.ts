import type { Meta, StoryObj } from '@storybook/vue3'
import { fn } from '@storybook/test'
import FileDropzone from './FileDropzone.vue'

const meta: Meta<typeof FileDropzone> = {
  title: 'Saisie/FileDropzone',
  tags: ['stable'],
  component: FileDropzone,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Zone de dépôt et liste des fichiers. La zone est un `<label>` enveloppant un input masqué ' +
          '— pas un `div` avec un gestionnaire de clic : c\'est ce qui la rend focusable et opérable au ' +
          'clavier gratuitement. Le composant n\'envoie rien : il émet `select` et affiche la progression ' +
          'qu\'on lui passe.',
      },
    },
  },
  argTypes: {
    accept:   { control: 'text', description: 'Comme l\'attribut natif — `.csv,image/*`.', table: { category: 'Comportement', type: { summary: 'string' } } },
    multiple: { control: 'boolean', table: { category: 'Comportement', type: { summary: 'boolean' }, defaultValue: { summary: 'false' } } },
    disabled: { control: 'boolean', table: { category: 'État', type: { summary: 'boolean' }, defaultValue: { summary: 'false' } } },
    supportingText: { control: 'text', description: 'Texte secondaire **dans** la zone, sous l\'appel à l\'action. Une description de champ appartient à `FormField`.', table: { category: 'Contenu', type: { summary: 'string' } } },
    icon:     { control: 'text', table: { category: 'Apparence', type: { summary: 'IconName' }, defaultValue: { summary: "'cloud-upload'" } } },
    files:    { control: 'object', table: { category: 'Contenu', type: { summary: 'DropzoneFile[]' } } },
    actionLabel: { control: 'text', description: 'L\'appel à l\'action, dans la langue de l\'écran.', table: { category: 'Libellés', type: { summary: 'string' }, defaultValue: { summary: "'Cliquer pour téléverser'" } } },
    dragLabel:   { control: 'text', description: 'Ce qui le suit, en retrait. Vide : rien.', table: { category: 'Libellés', type: { summary: 'string' }, defaultValue: { summary: "'ou glisser-déposer'" } } },
    removeLabel: { control: 'text', description: 'Précède le nom du fichier sur son bouton de retrait : « Retirer rapport.pdf ».', table: { category: 'Libellés', type: { summary: 'string' }, defaultValue: { summary: "'Retirer'" } } },
    locale:      { control: 'text', description: 'Écrit les tailles : `2,4 Mo` en `fr-FR`, `2.4 MB` en `en-US`.', table: { category: 'Libellés', type: { summary: 'string' }, defaultValue: { summary: "'fr-FR'" } } },
  },
  args: {
    accept: '.csv,.xlsx',
    multiple: true,
    disabled: false,
    supportingText: 'CSV ou XLSX, 10 Mo maximum',
    files: [],
    onSelect: fn(),
    onRemove: fn(),
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: args => ({
    components: { FileDropzone },
    setup: () => ({ args }),
    template: `<div style="max-width:32rem"><FileDropzone v-bind="args" /></div>`,
  }),
}

export const WithFiles: Story = {
  name: 'Avec fichiers',
  args: {
    files: [
      { id: '1', name: 'producteurs-kaolack.csv', size: 284_000 },
      { id: '2', name: 'parcelles-2026.xlsx', size: 1_940_000, progress: 62 },
    ],
  },
  render: args => ({
    components: { FileDropzone },
    setup: () => ({ args }),
    template: `<div style="max-width:32rem"><FileDropzone v-bind="args" /></div>`,
  }),
}

export const WithError: Story = {
  name: 'Avec erreur',
  parameters: { docs: { description: { story: 'L\'erreur dit ce qui a échoué, pas seulement que ça a échoué.' } } },
  args: {
    files: [
      { id: '1', name: 'producteurs-kaolack.csv', size: 284_000 },
      { id: '2', name: 'export-brut.txt', error: 'Format non pris en charge — attendu CSV ou XLSX.' },
    ],
  },
  render: args => ({
    components: { FileDropzone },
    setup: () => ({ args }),
    template: `<div style="max-width:32rem"><FileDropzone v-bind="args" /></div>`,
  }),
}

export const Disabled: Story = {
  name: 'Désactivé',
  args: { disabled: true },
  render: args => ({
    components: { FileDropzone },
    setup: () => ({ args }),
    template: `<div style="max-width:32rem"><FileDropzone v-bind="args" /></div>`,
  }),
}

export const InEnglish: Story = {
  name: 'En anglais',
  parameters: { docs: { description: { story: 'Tout ce que la zone écrit est une prop : l\'appel à l\'action, le nom du bouton de retrait, et les tailles, que `locale` écrit à la façon de la langue.' } } },
  args: {
    actionLabel: 'Click to upload',
    dragLabel: 'or drag and drop',
    removeLabel: 'Remove',
    locale: 'en-US',
    supportingText: 'CSV or XLSX, 10 MB max',
    files: [
      { id: '1', name: 'farmers-kaolack.csv', size: 284_000 },
      { id: '2', name: 'plots-2026.xlsx', size: 1_940_000, progress: 62 },
    ],
  },
  render: args => ({
    components: { FileDropzone },
    setup: () => ({ args }),
    template: `<div style="max-width:32rem"><FileDropzone v-bind="args" /></div>`,
  }),
}
