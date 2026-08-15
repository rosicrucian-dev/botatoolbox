import { useEffect } from 'react'

// Keeps the screen awake while the calling component is mounted — for
// full-screen players where the user is meditating on a slide, not
// touching the screen, and iOS would otherwise auto-lock mid-session.
//
// iOS releases the lock whenever the app is backgrounded or the screen
// locks anyway, so we re-acquire on visibilitychange. Failure is
// non-fatal everywhere (Low Power Mode denies the request; older
// browsers lack the API) — the screen just dims on its usual schedule.
export function useWakeLock() {
  useEffect(() => {
    if (!('wakeLock' in navigator)) return

    let sentinel: WakeLockSentinel | null = null
    let unmounted = false

    async function acquire() {
      try {
        const s = await navigator.wakeLock.request('screen')
        // Component unmounted while the request was in flight.
        if (unmounted) void s.release().catch(() => {})
        else sentinel = s
      } catch {
        // Denied (Low Power Mode, document hidden) — screen dims as usual.
      }
    }

    function onVisibilityChange() {
      if (document.visibilityState === 'visible') void acquire()
    }

    void acquire()
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => {
      unmounted = true
      document.removeEventListener('visibilitychange', onVisibilityChange)
      void sentinel?.release().catch(() => {})
    }
  }, [])
}
