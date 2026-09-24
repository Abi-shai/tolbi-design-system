/**
 * The artwork ladder — the one scale every drawing in the system is rendered at.
 *
 * It is Figma's `Size` enum on `ModuleIllustration` (ADR-0041), and it is also
 * `Icon`'s existing `16 | 20 | 24 | 32` with two steps added at the top. Three
 * components had three answers to "what is a size": `Icon` a typed number,
 * `Logo` a two-step `sm | md`, `ModuleIcon` a free number. Nothing could say
 * "the brand mark and the module mark, the same size", because the two were not
 * speaking the same language.
 *
 * **The number is the artwork's height in px**, which is what makes a step mean
 * the same thing across components: `Logo` at 48 puts a 48px-tall Tolbi mark
 * beside its wordmark, `ModuleIcon` at 48 draws a 48×48 module mark, and the
 * two line up.
 *
 * Not a token, deliberately, and for ADR-0020's stated reason: icon sizes are a
 * **typed component API**, not a scale the cascade needs to carry.
 */
export type ArtworkSize = 16 | 20 | 24 | 32 | 48 | 64

/** The ladder as a value — for story controls and iteration. */
export const ARTWORK_SIZES = [16, 20, 24, 32, 48, 64] as const satisfies readonly ArtworkSize[]
