'use client'

import { Field, Label } from '@/components/catalyst/fieldset'
import { Listbox, ListboxLabel, ListboxOption } from '@/components/catalyst/listbox'
import {
  MAJOR_STYLES,
  MINOR_STYLES,
  type TarotStyle,
} from '@/content/data/tarot-styles'
import { useTarotStyle } from '@/lib/tarotStyle'

import { MembersOnlySection } from './MembersOnlySection'

// A single labelled Catalyst Listbox bound to one art-style preference. Options
// come straight from the registry, so adding a style there adds it here with no
// further wiring.
function StyleField({
  label,
  styles,
  value,
  onChange,
}: {
  label: string
  styles: ReadonlyArray<TarotStyle>
  value: string
  onChange: (id: string) => void
}) {
  return (
    <Field>
      <Label>{label}</Label>
      <Listbox value={value} onChange={onChange} aria-label={label}>
        {styles.map((s) => (
          <ListboxOption key={s.id} value={s.id}>
            <ListboxLabel>{s.label}</ListboxLabel>
          </ListboxOption>
        ))}
      </Listbox>
    </Field>
  )
}

export function SettingsClient() {
  const { majorStyle, minorStyle, setMajorStyle, setMinorStyle } =
    useTarotStyle()

  return (
    <div className="space-y-10">
      <section className="space-y-6">
        <h2 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-white">
          Tarot Image Style
        </h2>
        <div className="grid max-w-2xl gap-6 sm:grid-cols-2">
          <StyleField
            label="Major Arcana"
            styles={MAJOR_STYLES}
            value={majorStyle}
            onChange={setMajorStyle}
          />
          <StyleField
            label="Minor Arcana"
            styles={MINOR_STYLES}
            value={minorStyle}
            onChange={setMinorStyle}
          />
        </div>
      </section>

      <hr className="border-zinc-200 dark:border-zinc-800" />

      <MembersOnlySection />
    </div>
  )
}
