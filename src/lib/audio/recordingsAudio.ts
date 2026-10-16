// Resolve a recording's playable audio URL from its manifest `audioPath`.
//
// The manifest stores only a relative path (e.g. "services/5c-….mp3"); the
// base host is configured via NEXT_PUBLIC_RECORDINGS_AUDIO_BASE so the SAME
// generated manifest works everywhere without regeneration:
//   - production: the R2 CDN (the default below)
//   - local dev:  set NEXT_PUBLIC_RECORDINGS_AUDIO_BASE=/recordings-audio and
//                 drop files under public/recordings-audio/<group>/<slug>.mp3
// Inlined at build (NEXT_PUBLIC_*), so it's safe in both server and client.

const BASE =
  process.env.NEXT_PUBLIC_RECORDINGS_AUDIO_BASE ??
  'https://cdn.botatoolbox.org/recordings'

export function recordingAudioUrl(audioPath: string): string {
  if (!audioPath) return ''
  return `${BASE.replace(/\/+$/, '')}/${audioPath}`
}
