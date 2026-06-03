'use client'

import { useCallback, useEffect, useState } from 'react'

// "Secret mode" is the password-gated unlock state for the Members Only
// area. It's casual obscurity, not real security — anyone who reads the
// JS bundle can find the password, and any sub-page HTML in the static
// export is technically reachable with JavaScript disabled. The gate is
// here to keep accidental visitors out, nothing more.
//
// State lives in localStorage. A custom event syncs every mounted
// useSecretMode() hook so unlocking on /members-only immediately
// updates the sidebar and home TOC without a page reload.

const STORAGE_KEY = 'secret-mode:unlocked'
const CHANGE_EVENT = 'secret-mode-changed'
const PASSWORD = 'perseverantia'

interface SecretModeState {
  unlocked: boolean
  // True once we've read the initial value from localStorage. Use to
  // distinguish "still SSR / not yet hydrated" from "definitely locked".
  hydrated: boolean
}

export function useSecretMode() {
  const [state, setState] = useState<SecretModeState>({
    unlocked: false,
    hydrated: false,
  })

  useEffect(() => {
    let unlocked = false
    try {
      unlocked = localStorage.getItem(STORAGE_KEY) === '1'
    } catch {}
    setState({ unlocked, hydrated: true })

    const handler = () => {
      let next = false
      try {
        next = localStorage.getItem(STORAGE_KEY) === '1'
      } catch {}
      setState((s) => ({ ...s, unlocked: next }))
    }
    window.addEventListener(CHANGE_EVENT, handler)
    return () => window.removeEventListener(CHANGE_EVENT, handler)
  }, [])

  const unlock = useCallback((password: string): boolean => {
    if (password.trim().toLowerCase() !== PASSWORD) return false
    try {
      localStorage.setItem(STORAGE_KEY, '1')
    } catch {}
    window.dispatchEvent(new Event(CHANGE_EVENT))
    return true
  }, [])

  const lock = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {}
    window.dispatchEvent(new Event(CHANGE_EVENT))
  }, [])

  return { ...state, unlock, lock }
}
