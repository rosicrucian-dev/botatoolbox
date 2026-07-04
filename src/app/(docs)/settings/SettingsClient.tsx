'use client'

import { useState } from 'react'

import { Button } from '@/components/catalyst/button'
import { Field, Label } from '@/components/catalyst/fieldset'
import {
  Listbox,
  ListboxLabel,
  ListboxOption,
} from '@/components/catalyst/listbox'
import { MAJOR_STYLES, MINOR_STYLES } from '@/content/data/tarot-styles'
import { useColorPalette } from '@/lib/colorPalette'
import { COLOR_PALETTES, type ColorPaletteId } from '@/lib/colors'
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
  const { majorStyle, minorStyle } = useTarotStyle()
  const { colorPalette } = useColorPalette()
  const { unlocked } = useSecretMode()
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
        Permalink
      </h2>
      <p className="max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
        A permanent link to the homepage that applies the settings above automatically. 
      </p>
      <div className="flex items-center gap-3">
        <Button href={permalink}>Permalink</Button>
        <Button type="button" plain onClick={copy}>
          Copy
        </Button>
        <span role="status" aria-live="polite" className="text-sm text-emerald-600 dark:text-emerald-400">
          {copied && 'Copied ✓'}
        </span>
      </div>
      {fallbackLink && (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Copying failed — select the link manually:{' '}
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

export function SettingsClient() {
  const { majorStyle, minorStyle, setMajorStyle, setMinorStyle } =
    useTarotStyle()
  const { colorPalette, setColorPalette } = useColorPalette()

  return (
    <div className="space-y-10">
      <section className="space-y-6">
        <h2 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-white">
          Style
        </h2>
        <div className="grid max-w-2xl gap-6 sm:grid-cols-2">
          <SelectField
            label="Major Arcana"
            options={MAJOR_STYLES}
            value={majorStyle}
            onChange={setMajorStyle}
          />
          <SelectField
            label="Minor Arcana"
            options={MINOR_STYLES}
            value={minorStyle}
            onChange={setMinorStyle}
          />
          <SelectField
            label="Colors"
            options={COLOR_PALETTES}
            value={colorPalette}
            onChange={(id) => setColorPalette(id as ColorPaletteId)}
          />
        </div>
      </section>

      <hr className="border-zinc-200 dark:border-zinc-800" />

      <MembersOnlySection />

      <hr className="border-zinc-200 dark:border-zinc-800" />

      <PermalinkSection />
    </div>
  )
}
