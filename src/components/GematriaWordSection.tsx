import { type GematriaWord } from '@/content/data/gematria-words'
import { GematriaNumberRow } from './GematriaNumberRow'
import { SourceTitle, SubSection } from './GematriaHeadings'

// Definitions are lower-case in some sources (Strong's); capitalize the first
// letter so they read consistently, without mutating the data.
function capitalize(s: string): string {
  return s.replace(/\p{L}/u, (c) => c.toUpperCase())
}

// One word row: the gloss (with a muted reference id when the source has one)
// on the left, the Hebrew word — pointed for Strong's, plain for Crowley — on
// the right. Same layout for every word-keyed source.
function WordRow({ word }: { word: GematriaWord }) {
  return (
    <li className="flex justify-between gap-6 py-4">
      <div className="min-w-0 flex-1">
        {word.text ? (
          <p className="text-sm text-zinc-700 dark:text-zinc-300">
            {capitalize(word.text)}
            {word.ref && (
              <>
                {' '}
                <span className="text-xs text-zinc-300 tabular-nums dark:text-zinc-600">
                  {word.ref}
                </span>
              </>
            )}
          </p>
        ) : (
          <p className="text-sm text-zinc-400 italic dark:text-zinc-500">
            No definition.
          </p>
        )}
      </div>
      <span
        dir="rtl"
        lang="he"
        className="shrink-0 font-serif text-2xl leading-none text-zinc-900 md:text-3xl dark:text-white"
      >
        {word.hebrew}
      </span>
    </li>
  )
}

// A word-keyed source section (Crowley, Strong's): the source title, then up to
// two sub-sections — a "Number N" group for that source's per-number remark
// (the Crowley/Sepher Sephiroth significance, when present) and a "Words" group
// for the Hebrew words at this value. Used by both the Dictionary (full list)
// and the Calculator (the single matching built word).
export function GematriaWordSection({
  label,
  words,
  number,
  note,
}: {
  label: string
  words: ReadonlyArray<GematriaWord>
  number: number
  note?: string
}) {
  return (
    <section>
      <SourceTitle>{label}</SourceTitle>
      <div className="mt-3 space-y-4">
        {note && (
          <SubSection title={`Number ${number}`}>
            <GematriaNumberRow text={note} />
          </SubSection>
        )}
        {words.length > 0 && (
          <SubSection title="Words">
            {words.map((w, i) => (
              <WordRow key={i} word={w} />
            ))}
          </SubSection>
        )}
      </div>
    </section>
  )
}
