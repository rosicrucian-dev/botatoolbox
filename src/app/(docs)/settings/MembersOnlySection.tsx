'use client'

import { useState, type FormEvent } from 'react'

import { useSecretMode } from '@/lib/useSecretMode'

// Password-gated unlock for the Members Only area, surfaced as a section on
// the Settings page. Unlock state lives in localStorage via useSecretMode, so
// it stays in sync with the sidebar/home-TOC gating without a reload.
export function MembersOnlySection() {
  const { unlocked, hydrated, unlock, lock } = useSecretMode()
  const [input, setInput] = useState('')
  const [error, setError] = useState(false)

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (unlock(input)) {
      setInput('')
      setError(false)
    } else {
      setError(true)
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-white">
          Members Only
        </h2>
        {unlocked && (
          // Debug-only escape hatch so the maintainer can re-test the
          // locked state without clearing localStorage by hand.
          <button
            type="button"
            onClick={lock}
            className="inline-flex h-9 shrink-0 items-center justify-center rounded-md px-3 text-sm font-medium ring-1 ring-zinc-900/10 transition hover:bg-zinc-100 dark:text-white dark:ring-white/15 dark:hover:bg-zinc-800"
          >
            Lock
          </button>
        )}
      </div>

      {/* Avoid a flicker between locked-form and unlocked-message
          during the brief moment before localStorage is read. */}
      {!hydrated ? null : unlocked ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Members only content has been unlocked.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Some content is restricted to members of the Builders of the Adytum.
            Enter the password to unlock all available content.
          </p>
          <input
            type="password"
            autoComplete="off"
            value={input}
            onChange={(e) => {
              setInput(e.target.value)
              if (error) setError(false)
            }}
            aria-invalid={error || undefined}
            aria-label="Password"
            className="block w-full max-w-sm rounded-md border border-zinc-300 bg-white px-3 py-2 text-base text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 aria-invalid:border-red-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
          />
          {error && (
            <p className="text-sm italic text-red-600 dark:text-red-400">
              Incorrect password.
            </p>
          )}
          <button
            type="submit"
            className="inline-flex h-9 shrink-0 items-center justify-center rounded-md bg-emerald-500 px-3 text-sm font-medium whitespace-nowrap text-white transition hover:bg-emerald-400"
          >
            Unlock
          </button>
        </form>
      )}
    </section>
  )
}
