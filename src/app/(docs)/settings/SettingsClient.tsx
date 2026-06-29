'use client'

import { Field, Label } from '@/components/catalyst/fieldset'
import { Listbox, ListboxLabel, ListboxOption } from '@/components/catalyst/listbox'
import { MAJOR_STYLES, MINOR_STYLES } from '@/content/data/tarot-styles'
import { COLOR_PALETTES, type ColorPaletteId } from '@/lib/colors'
import { useColorPalette } from '@/lib/colorPalette'
import { useTarotStyle } from '@/lib/tarotStyle'

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
    </div>
  )
}
