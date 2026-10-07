import { onBeforeUnmount, ref } from 'vue'

/**
 * The microphone, for `TolbiAiComposer`'s voice half (ADR-0061). The composer's
 * own, kept beside it rather than in `composables/`: its `VoiceRecording` is
 * part of the composer's public types, and a declaration file can only point
 * at what the package ships. The product never touches a MediaRecorder; it
 * receives a recording.
 *
 * What it carries, each easy to get wrong:
 *
 * **Permission is known before it is asked.** The composer explains why it
 * wants the microphone *before* the browser's own prompt, so this reads the
 * permission first (`navigator.permissions`), and a grant seen once in the page
 * is remembered — some engines cannot be asked.
 *
 * **Levels are sampled, not streamed.** One level every 100 ms: the RMS of the
 * analyser's time-domain window, which is what the waveform draws, one bar per
 * level. Not frequency data — speech is loud in time, not in a band.
 *
 * **Time is measured, not counted.** The timer adds real elapsed time while
 * recording, so a throttled interval cannot slow it down, and it stops at the
 * cap: the recording pauses itself at two minutes rather than stopping, so
 * what was said can still be sent.
 *
 * **The microphone is released the moment it is not needed** — on send, on
 * delete, on unmount. A browser shows a recording indicator for as long as a
 * track is live; holding it open behind a deleted note would be a lie.
 */

export type VoicePermission = 'granted' | 'prompt' | 'denied' | 'unknown'
export type VoiceRecorderStatus = 'idle' | 'recording' | 'paused'

export interface VoiceRecording {
  blob: Blob
  /** Seconds. */
  duration: number
  /** 0 to 1, one every 100 ms — the waveform's input. */
  levels: number[]
  /** The container the browser chose, e.g. `audio/webm;codecs=opus`. */
  type: string
}

export interface VoiceRecorderOptions {
  /** The cap, in seconds; recording pauses itself there. */
  maxSeconds?: number
}

const SAMPLE_MS = 100
/*
  Speech peaks around an RMS of 0.2–0.3 on a normal microphone; ×3.5 puts
  ordinary speech in the upper half of the bar's range without clipping it.
  The square root lifts the quiet end, where most of a voice is.
*/
const GAIN = 3.5

let grantedInThisPage = false

export function voiceSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.isSecureContext &&
    !!navigator.mediaDevices?.getUserMedia &&
    typeof MediaRecorder !== 'undefined'
  )
}

/**
 * The browser's answer is authoritative; the page's own memory of a grant only
 * stands in where the browser cannot be asked.
 */
export async function readVoicePermission(): Promise<VoicePermission> {
  try {
    const status = await navigator.permissions.query({ name: 'microphone' as PermissionName })
    return status.state
  } catch {
    return grantedInThisPage ? 'granted' : 'unknown'
  }
}

export function useVoiceRecorder(options: VoiceRecorderOptions = {}) {
  const maxSeconds = options.maxSeconds ?? 120

  const status = ref<VoiceRecorderStatus>('idle')
  const elapsed = ref(0)
  const levels = ref<number[]>([])
  /** The cap was reached and the recording paused itself. */
  const capped = ref(false)

  let stream: MediaStream | null = null
  let recorder: MediaRecorder | null = null
  let context: AudioContext | null = null
  let analyser: AnalyserNode | null = null
  let window_: Float32Array<ArrayBuffer> | null = null
  let chunks: Blob[] = []
  let sampler: ReturnType<typeof setInterval> | undefined
  let lastTick = 0

  function sample() {
    const now = performance.now()
    elapsed.value = Math.min(maxSeconds, elapsed.value + (now - lastTick) / 1000)
    lastTick = now
    if (analyser && window_) {
      analyser.getFloatTimeDomainData(window_)
      let sum = 0
      for (const v of window_) sum += v * v
      const rms = Math.sqrt(sum / window_.length)
      levels.value = [...levels.value, Math.min(1, Math.sqrt(rms * GAIN))]
    }
    if (elapsed.value >= maxSeconds) {
      capped.value = true
      pause()
    }
  }

  function startSampling() {
    lastTick = performance.now()
    sampler = setInterval(sample, SAMPLE_MS)
  }

  function stopSampling() {
    if (sampler !== undefined) clearInterval(sampler)
    sampler = undefined
  }

  function release() {
    stopSampling()
    stream?.getTracks().forEach((t) => t.stop())
    void context?.close().catch(() => {})
    stream = null
    recorder = null
    context = null
    analyser = null
  }

  /**
   * Opens the microphone and starts recording. Resolves `false` when the
   * browser or the user refuses — the caller says so, in the box.
   */
  async function start(): Promise<boolean> {
    release()
    chunks = []
    levels.value = []
    elapsed.value = 0
    capped.value = false
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch {
      return false
    }
    grantedInThisPage = true
    context = new AudioContext()
    /* Created after an await, so make sure it runs: a suspended context feeds
       the analyser silence, and silence is what « Je n'ai rien entendu » says. */
    void context.resume().catch(() => {})
    analyser = context.createAnalyser()
    analyser.fftSize = 2048
    window_ = new Float32Array(new ArrayBuffer(analyser.fftSize * 4))
    context.createMediaStreamSource(stream).connect(analyser)
    recorder = new MediaRecorder(stream)
    recorder.addEventListener('dataavailable', (e) => {
      if (e.data.size) chunks.push(e.data)
    })
    recorder.start()
    status.value = 'recording'
    startSampling()
    return true
  }

  function pause() {
    if (status.value !== 'recording' || !recorder) return
    recorder.pause()
    stopSampling()
    status.value = 'paused'
  }

  function resume() {
    if (status.value !== 'paused' || !recorder || capped.value) return
    recorder.resume()
    status.value = 'recording'
    startSampling()
  }

  /** What has been recorded so far, playable — for listening back while paused. */
  function snapshot(): Promise<Blob> {
    return new Promise((resolve) => {
      if (!recorder || recorder.state === 'inactive') return resolve(new Blob(chunks))
      recorder.addEventListener('dataavailable', () => resolve(new Blob(chunks, { type: recorder?.mimeType })), {
        once: true,
      })
      recorder.requestData()
    })
  }

  /** Stops, releases the microphone and hands the recording over. */
  function stop(): Promise<VoiceRecording | null> {
    return new Promise((resolve) => {
      const active = recorder
      if (!active || active.state === 'inactive') {
        release()
        status.value = 'idle'
        return resolve(null)
      }
      const type = active.mimeType
      active.addEventListener(
        'stop',
        () => {
          const recording = {
            blob: new Blob(chunks, { type }),
            duration: elapsed.value,
            levels: levels.value,
            type,
          }
          release()
          status.value = 'idle'
          resolve(recording)
        },
        { once: true },
      )
      active.stop()
    })
  }

  onBeforeUnmount(release)

  return { status, elapsed, levels, capped, start, pause, resume, snapshot, stop, maxSeconds }
}
