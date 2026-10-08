/**
 * A CSS `<time>` in milliseconds, however it is written. The source says
 * `1650ms`; a minifier writes the same value `1.65s` — ours does it to a
 * component's private values, and a product's build does it to the tokens
 * (`200ms` → `.2s`). A bare `parseFloat` reads 1.65 and plays a 1.65s turn in
 * 1.65ms, which is no turn at all. `null` when the value is not one time
 * (`calc()`, unitless, empty).
 */
export function cssTime(value: string): number | null {
  const match = /^(-?(?:\d+(?:\.\d*)?|\.\d+))(ms|s)$/i.exec(value.trim())
  if (!match) return null
  const n = Number(match[1])
  return match[2].toLowerCase() === 's' ? Math.round(n * 1e6) / 1e3 : n
}

/**
 * A duration off the cascade, in milliseconds — what Web Animations take.
 * Read on `el`, so a token and a component's own value both resolve where
 * they apply. Unreadable is 0: no motion rather than the wrong one.
 */
export function readDuration(el: Element, name: string): number {
  return cssTime(getComputedStyle(el).getPropertyValue(name)) ?? 0
}
