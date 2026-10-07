import type { StorybookConfig } from '@storybook/vue3-vite'

const config: StorybookConfig = {
  stories: [
    '../docs/**/*.mdx',
    '../components/**/*.stories.@(ts|tsx)',
    '../tokens/stories/**/*.stories.@(ts|tsx)',
    '../stories/**/*.stories.@(ts|tsx)',
  ],
  addons: ['@storybook/addon-essentials'],
  staticDirs: ['../public'],
  framework: {
    name: '@storybook/vue3-vite',
    options: {},
  },
  // Storybook builds with the project's vite.config.ts, plugins included. The
  // library's declaration plugin has nothing to do here: it wrote `.d.ts` files
  // into storybook-static, and since 0.38.0 its guards stopped the deployment —
  // they check declarations against the library's output, which a Storybook
  // build is not.
  viteFinal: (vite) => ({
    ...vite,
    plugins: (vite.plugins ?? [])
      .flat()
      .filter((p) => !(p && typeof p === 'object' && 'name' in p && p.name === 'vite:dts')),
  }),
}

config.managerHead = (head) => `
  ${head}
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap" rel="stylesheet" />
`

export default config
