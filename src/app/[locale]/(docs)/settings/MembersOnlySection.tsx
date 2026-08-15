'use client'

import { useT } from '@/content/messages/useT'
import { useState, type FormEvent } from 'react'

import { Button } from '@/components/catalyst/button'
import { ErrorMessage, Field, Label } from '@/components/catalyst/fieldset'
import { Input } from '@/components/catalyst/input'
import { useSecretMode } from '@/lib/useSecretMode'

// Password-gated unlock for the Members Only area, surfaced as a section on
// the Settings page. Unlock state lives in localStorage via useSecretMode, so
// it stays in sync with the sidebar/home-TOC gating without a reload.
export function MembersOnlySection() {
  const { t } = useT()
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
          {t('settings.membersOnly')}
        </h2>
        {unlocked && (
          // Debug-only escape hatch so the maintainer can re-test the
          // locked state without clearing localStorage by hand.
          <Button type="button" outline onClick={lock}>
            {t('settings.lock')}
          </Button>
        )}
      </div>

      {/* Avoid a flicker between locked-form and unlocked-message
          during the brief moment before localStorage is read. */}
      {!hydrated ? null : unlocked ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {t('settings.membersUnlocked')}
        </p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Some content is restricted to members of the Builders of the Adytum.
            {t('settings.membersHelp')}
          </p>
          <Field className="max-w-sm">
            <Label>Password</Label>
            <Input
              type="password"
              autoComplete="off"
              value={input}
              invalid={error || undefined}
              onChange={(e) => {
                setInput(e.target.value)
                if (error) setError(false)
              }}
            />
            {error && (
              <ErrorMessage>{t('settings.incorrectPassword')}</ErrorMessage>
            )}
          </Field>
          <Button type="submit">{t('settings.unlock')}</Button>
        </form>
      )}
    </section>
  )
}
