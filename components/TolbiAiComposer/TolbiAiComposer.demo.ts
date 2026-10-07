/**
 * Story-only: a microphone the stories control, so each of the composer's voice
 * states can be reached on purpose — a permission still to ask, a microphone
 * blocked, one that hears nothing. Patches `navigator` for as long as the story
 * is open and puts it back after. Not exported from the package.
 */
import { speechLevels } from '../TolbiAiVoiceNote/TolbiAiVoiceNote.demo'

export interface FakeMicrophone {
  /** What `navigator.permissions` answers for the microphone. */
  permission?: PermissionState
  /** Whether the browser's own prompt is accepted. */
  grant?: boolean
  /** A microphone that is plugged in and hears nothing. */
  silent?: boolean
}

export function fakeMicrophone(options: FakeMicrophone = {}): () => void {
  const { permission = 'granted', grant = true, silent = false } = options
  const devices = navigator.mediaDevices
  const permissions = navigator.permissions
  const realGetUserMedia = devices.getUserMedia
  const realQuery = permissions.query
  const contexts: AudioContext[] = []

  devices.getUserMedia = async () => {
    if (!grant) throw new DOMException('Permission denied', 'NotAllowedError')
    /* A voice-shaped hum: a tone whose loudness follows speech levels. */
    const context = new AudioContext()
    contexts.push(context)
    void context.resume()
    const tone = context.createOscillator()
    tone.frequency.value = 180
    const gain = context.createGain()
    gain.gain.value = 0
    const destination = context.createMediaStreamDestination()
    tone.connect(gain).connect(destination)
    tone.start()
    if (!silent) {
      const levels = speechLevels(240, 13)
      levels.forEach((level, i) => gain.gain.setValueAtTime(level * 0.5, context.currentTime + i / 10))
    }
    return destination.stream
  }

  permissions.query = (async (descriptor: PermissionDescriptor) =>
    descriptor.name === ('microphone' as PermissionName)
      ? ({ state: permission, name: 'microphone', onchange: null } as unknown as PermissionStatus)
      : realQuery.call(permissions, descriptor)) as Permissions['query']

  return () => {
    devices.getUserMedia = realGetUserMedia
    permissions.query = realQuery
    contexts.forEach((c) => void c.close().catch(() => {}))
  }
}
