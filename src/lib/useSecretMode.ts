'use client'

import { useEffect } from 'react'
import { create } from 'zustand'

// "Secret mode" is the password-gated unlock state for the Members Only
// area. It's casual obscurity, not real security — anyone who reads the
// JS bundle can find the password, and any sub-page HTML in the static
// export is technically reachable with JavaScript disabled. The gate is
// here to keep accidental visitors out, nothing more.
//
// Same store shape as tarotStyle.ts / colorPalette.ts: default value for
// a stable SSR render, one-shot hydration from localStorage on first
// mount, zustand subscription keeping every consumer (sidebar, home TOC,
// Settings) in sync without a reload.

const STORAGE_KEY = 'secret-mode:unlocked'
const PASSWORD = 'perseverantia'

interface SecretModeStore {
  unlocked: boolean
  // True once the initial value has been read from localStorage. Use to
  // distinguish "still SSR / not yet hydrated" from "definitely locked".
  hydrated: boolean
  unlock: (password: string) => boolean
  lock: () => void
}

const useSecretModeStore = create<SecretModeStore>((set) => ({
  unlocked: false,
  hydrated: false,
  unlock: (password) => {
    if (password.trim().toLowerCase() !== PASSWORD) return false
    set({ unlocked: true })
    try {
      localStorage.setItem(STORAGE_KEY, '1')
    } catch {
      // Private browsing / storage disabled — unlocked for this session only.
    }
    return true
  },
  lock: () => {
    set({ unlocked: false })
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {}
  },
}))

// Read the saved state once for the whole app (module-level flag) — the
// store is global, so a single read suffices.
let didHydrate = false

function hydrateFromStorage() {
  if (typeof window === 'undefined') return
  let unlocked = false
  try {
    unlocked = localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    // Private browsing / storage disabled — stay locked.
  }
  useSecretModeStore.setState({ unlocked, hydrated: true })
}

// Applies an unlock restored from a settings link (src/lib/settingsLink.ts)
// without a password round-trip — the link was generated from an
// already-unlocked session, and the gate is casual obscurity, not
// security (the password ships in the JS bundle anyway). Only ever
// unlocks; a link with u:0 simply doesn't call this.
export function applyRestoredUnlock() {
  useSecretModeStore.setState({ unlocked: true, hydrated: true })
  try {
    localStorage.setItem(STORAGE_KEY, '1')
  } catch {}
}

export function useSecretMode() {
  const unlocked = useSecretModeStore((s) => s.unlocked)
  const hydrated = useSecretModeStore((s) => s.hydrated)
  const unlock = useSecretModeStore((s) => s.unlock)
  const lock = useSecretModeStore((s) => s.lock)

  useEffect(() => {
    if (didHydrate) return
    didHydrate = true
    hydrateFromStorage()
  }, [])

  return { unlocked, hydrated, unlock, lock }
}
