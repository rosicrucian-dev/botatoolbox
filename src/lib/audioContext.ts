// Web Audio singleton + iOS gotcha defenses.
//
// One AudioContext per tab. Created the first time `ensureAudioContext()`
// runs inside a user gesture (PlayLink onClick, SoundButton click,
// spacebar keypress). Closed when the tab is hidden so other tabs can
// claim the iOS audio session — recreated on the next gesture.
//
// `useAudioContext` (the React hook) is gone. Player code calls
// `playCurrent()` from `useToneOnIdx`, which itself calls
// `ensureAudioContext()` — so individual components don't need to thread
// `ctx` or `init` around.

let sharedCtx: AudioContext | null = null

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext
  }
}

// Returns the singleton without creating it. Safe to call from any
// context. Returns null until the first successful ensureAudioContext().
export function getAudioContext(): AudioContext | null {
  return sharedCtx
}

// Call from inside a user gesture (click, keypress). Idempotent.
//
// Defends against three iOS Safari failure modes that show up as "Safari
// shows the audio indicator but no sound plays":
//
//   1. Context got hard-closed (state === 'closed') — recreate it. A
//      closed AudioContext can't be resumed; it's effectively dead.
//   2. Context is suspended OR interrupted — call resume() inside this
//      gesture. iOS uses the non-spec 'interrupted' state when audio is
//      taken over by another source (phone call, Bluetooth, another tab);
//      `state !== 'running'` catches both.
//   3. Audio session was unlocked once but later revoked (long
//      backgrounding). Fix: play a 1-sample silent buffer EVERY user
//      gesture, not just the first — that's what re-engages iOS's audio
//      output thread. Cost is negligible.
export function ensureAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null

  // (1) replace a dead context.
  if (sharedCtx && sharedCtx.state === 'closed') {
    sharedCtx = null
  }

  if (!sharedCtx) {
    const Ctor = window.AudioContext || window.webkitAudioContext
    if (!Ctor) return null
    sharedCtx = new Ctor()
  }

  // (2) resume on every gesture — covers 'suspended' and iOS 'interrupted'.
  if (sharedCtx.state !== 'running') {
    void sharedCtx.resume()
  }

  // (3) unlock buffer every time — keeps the audio thread warm. Wrapped
  // in try/catch because creating a buffer on a closed/dying ctx can
  // throw on some iOS versions.
  try {
    const buffer = sharedCtx.createBuffer(1, 1, 22050)
    const source = sharedCtx.createBufferSource()
    source.buffer = buffer
    source.connect(sharedCtx.destination)
    source.start(0)
  } catch {}

  return sharedCtx
}

// iOS Safari serializes Web Audio across tabs of the same domain — only
// one tab can produce actual sound at a time. The "losing" tab's resume()
// reports success and Safari's audio indicator lights up, but no samples
// are emitted. To play nice when the user has multiple tabs of the app
// open, we close our AudioContext when the tab is hidden, releasing the
// audio session. The next user gesture in any tab gets a fresh context
// that grabs the session.
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden' && sharedCtx) {
      void sharedCtx.close().catch(() => {})
      sharedCtx = null
    }
  })
}
