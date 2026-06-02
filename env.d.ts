declare module '*.css' {}
declare module '*.svg' {
  const src: string
  export default src
}

declare module '*.png' {
  const src: string
  export default src
}

declare module '*.mdx' {
  import type { ComponentType } from 'vue'
  const component: ComponentType
  export default component
}
