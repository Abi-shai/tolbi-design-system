/**
 * Story-only material for the voice note and the voice composer: a recording
 * that sounds like what its waveform draws. Not exported from the package.
 */

/** Speech-shaped levels, one every 100 ms: words and short silences, the same every time. */
export function speechLevels(seconds: number, seed = 7): number[] {
  let state = seed
  const random = () => (state = (state * 16807) % 2147483647) / 2147483647
  const levels: number[] = []
  let left = 0
  let loud = 0
  for (let i = 0; i < Math.round(seconds * 10); i++) {
    if (left <= 0) {
      const pause = random() < 0.22
      left = pause ? 1 + Math.floor(random() * 3) : 3 + Math.floor(random() * 6)
      loud = pause ? 0 : 0.45 + random() * 0.55
    }
    left--
    levels.push(loud === 0 ? random() * 0.06 : Math.min(1, loud * (0.35 + random() * 0.65)))
  }
  return levels
}

/**
 * A quiet hum whose loudness follows the levels — a WAV built in the page, so
 * the story plays something whose bars mean what they draw.
 */
export function humUrl(levels: number[]): string {
  const rate = 8000
  const perLevel = rate / 10
  const samples = levels.length * perLevel
  const buffer = new ArrayBuffer(44 + samples * 2)
  const view = new DataView(buffer)
  const text = (at: number, s: string) => [...s].forEach((c, i) => view.setUint8(at + i, c.charCodeAt(0)))
  text(0, 'RIFF')
  view.setUint32(4, 36 + samples * 2, true)
  text(8, 'WAVEfmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, 1, true)
  view.setUint32(24, rate, true)
  view.setUint32(28, rate * 2, true)
  view.setUint16(32, 2, true)
  view.setUint16(34, 16, true)
  text(36, 'data')
  view.setUint32(40, samples * 2, true)
  for (let i = 0; i < samples; i++) {
    const level = levels[Math.floor(i / perLevel)] ?? 0
    const sample = Math.sin((2 * Math.PI * 180 * i) / rate) * level * 0.06
    view.setInt16(44 + i * 2, Math.round(sample * 32767), true)
  }
  return URL.createObjectURL(new Blob([buffer], { type: 'audio/wav' }))
}
