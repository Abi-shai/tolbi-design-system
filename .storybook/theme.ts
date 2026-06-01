import { create } from '@storybook/theming/create'

export default create({
  base: 'light',

  brandTitle: 'Tolbi Design System',
brandTarget: '_self',

  // Brand
  colorPrimary:   '#066938',
  colorSecondary: '#056033',

  // UI chrome
  appBg:          '#F9FAFB',
  appContentBg:   '#FFFFFF',
  appBorderColor: '#EAECF0',
  appBorderRadius: 8,

  // Toolbar & sidebar
  barBg:          '#FFFFFF',
  barTextColor:   '#475467',
  barSelectedColor: '#066938',
  barHoverColor:  '#056033',

  // Typography
  fontBase: '"Poppins", sans-serif',
  fontCode: 'monospace',

  // Inputs
  inputBg:          '#FFFFFF',
  inputBorder:      '#D0D5DD',
  inputTextColor:   '#101828',
  inputBorderRadius: 6,

  // Text
  textColor:        '#101828',
  textMutedColor:   '#667085',
  textInverseColor: '#FFFFFF',
})
