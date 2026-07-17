'use client'

import { usePathname } from 'next/navigation'
import { useState } from 'react'

import { Button } from '@/components/catalyst/button'
import { Field, Label } from '@/components/catalyst/fieldset'
import {
  Listbox,
  ListboxLabel,
  ListboxOption,
} from '@/components/catalyst/listbox'
import { useLocale } from '@/components/LocaleProvider'
import { MAJOR_STYLES, MINOR_STYLES } from '@/content/data/tarot-styles'
import { useT } from '@/content/messages/useT'
import { useColorPalette } from '@/lib/colorPalette'
import { COLOR_PALETTES, type ColorPaletteId } from '@/lib/colors'
import { useLocalePref } from '@/lib/locale'
import {
  isLocale,
  LOCALE_LABELS,
  localeHref,
  RELEASED_LOCALES,
  stripLocale,
} from '@/lib/locales'
import { usePinnedCards } from '@/lib/pinnedCards'
import { encodeSettingsToken } from '@/lib/settingsLink'
import { useTarotStyle } from '@/lib/tarotStyle'
import { useSecretMode } from '@/lib/useSecretMode'

import { MembersOnlySection } from './MembersOnlySection'

// A single labelled Catalyst Listbox bound to one preference. Options are any
// `{ id, label }` list — the style and palette registries both fit — so adding
// an entry to a registry adds it here with no further wiring.
function SelectField({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: ReadonlyArray<{ id: string; label: string }>
  value: string
  onChange: (id: string) => void
}) {
  return (
    <Field>
      <Label>{label}</Label>
      <Listbox value={value} onChange={onChange} aria-label={label}>
        {options.map((o) => (
          <ListboxOption key={o.id} value={o.id}>
            <ListboxLabel>{o.label}</ListboxLabel>
          </ListboxOption>
        ))}
      </Listbox>
    </Field>
  )
}

// The Permalink — a real link (bookmarkable via right-click / drag to
// the bookmarks bar) carrying a snapshot of the current settings, plus
// a quiet Copy button beside it.
function PermalinkSection() {
  const { t } = useT()
  const { majorStyle, minorStyle } = useTarotStyle()
  const { colorPalette } = useColorPalette()
  const { unlocked } = useSecretMode()
  const { pins } = usePinnedCards()
  const [copied, setCopied] = useState(false)
  // Set when the clipboard API is unavailable/denied — the link is shown
  // for manual copying instead.
  const [fallbackLink, setFallbackLink] = useState<string | null>(null)

  // Points at the home page so it can serve as the user's everyday
  // bookmark: opening it silently applies the snapshot (PermalinkRestore
  // in providers.tsx), reverting any settings changed since. Relative
  // href — SSR-safe, and browsers resolve it to the absolute URL when
  // bookmarking.
  const token = encodeSettingsToken({
    majorStyle,
    minorStyle,
    colorPalette,
    unlocked,
    pins,
  })
  const permalink = `/?restore=${token}`

  async function copy() {
    const link = `${window.location.origin}${permalink}`
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setFallbackLink(null)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setFallbackLink(link)
    }
  }

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-white">
        {t('settings.permalink')}
      </h2>
      <p className="max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
        {t('settings.permalinkHelp')}
      </p>
      <div className="flex items-center gap-3">
        <Button href={permalink}>{t('settings.permalink')}</Button>
        <Button type="button" plain onClick={copy}>
          {t('settings.copy')}
        </Button>
        <span
          role="status"
          aria-live="polite"
          className="text-sm text-emerald-600 dark:text-emerald-400"
        >
          {copied && t('settings.copied')}
        </span>
      </div>
      {fallbackLink && (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {t('settings.copyFailed')}{' '}
          <input
            readOnly
            value={fallbackLink}
            onFocus={(e) => e.target.select()}
            className="mt-2 block w-full max-w-2xl rounded-md border border-zinc-300 bg-transparent px-2 py-1 font-mono text-xs dark:border-zinc-700"
          />
        </p>
      )}
    </section>
  )
}

// Only released locales are offered (see UNRELEASED_LOCALES).
const LANGUAGES = RELEASED_LOCALES.map((id) => ({
  id,
  label: LOCALE_LABELS[id],
}))

// Language preference row. Unlike the other settings (pure client
// state), the language lives in the URL — so changing it both saves the
// preference and navigates to this page's counterpart in the chosen
// locale. Mirrors the header's LanguageToggle.
function LanguageField() {
  const { t } = useT()
  const locale = useLocale()
  const pathname = usePathname()
  const { setLocalePref } = useLocalePref()

  return (
    <SelectField
      label={t('settings.language')}
      options={LANGUAGES}
      value={locale}
      onChange={(id) => {
        if (!isLocale(id) || id === locale) return
        setLocalePref(id)
        // Full navigation on purpose — see LanguageSwitcher: a locale
        // switch swaps the top-level [locale] segment, and a client-side
        // navigation there re-renders the whole tree (view transitions
        // time out on it). The static target page is the fast path.
        window.location.assign(localeHref(id, stripLocale(pathname).path))
      }}
    />
  )
}

export function SettingsClient() {
  const { t } = useT()
  const { majorStyle, minorStyle, setMajorStyle, setMinorStyle } =
    useTarotStyle()
  const { colorPalette, setColorPalette } = useColorPalette()

  return (
    <div className="space-y-10">
      <section className="space-y-6">
        <h2 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-white">
          {t('settings.style')}
        </h2>
        <div className="grid max-w-2xl gap-6 sm:grid-cols-2">
          <SelectField
            label={t('settings.majorArcana')}
            options={MAJOR_STYLES}
            value={majorStyle}
            onChange={setMajorStyle}
          />
          <SelectField
            label={t('settings.minorArcana')}
            options={MINOR_STYLES}
            value={minorStyle}
            onChange={setMinorStyle}
          />
          <SelectField
            label={t('settings.colors')}
            options={COLOR_PALETTES}
            value={colorPalette}
            onChange={(id) => setColorPalette(id as ColorPaletteId)}
          />
          <LanguageField />
        </div>
      </section>

      <hr className="border-zinc-200 dark:border-zinc-800" />

      <MembersOnlySection />

      <hr className="border-zinc-200 dark:border-zinc-800" />

      <PermalinkSection />
    </div>
  )
}
