import { type GematriaWord } from '@/content/data/gematria-words'

// Definitions are lower-case in some sources (Strong's); capitalize the first
// letter so they read consistently, without mutating the data.
function capitalize(s: string): string {
  return s.replace(/\p{L}/u, (c) => c.toUpperCase())
}

function SourceLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-xs font-semibold tracking-wide text-zinc-900 uppercase dark:text-white">
      {children}
    </div>
  )
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

// A word-keyed source section: a label and the list of words at this value from
// that one source (Crowley, Strong's). Used by both the Dictionary (full list)
// and the Calculator (the single matching built word). An optional `note` is a
// number-level remark from that source (the Crowley/Sepher Sephiroth
// significance) shown as the first row, above the words.
export function GematriaWordSection({
  label,
  words,
  note,
}: {
  label: string
  words: ReadonlyArray<GematriaWord>
  note?: string
}) {
  return (
    <section>
      <SourceLabel>{label}</SourceLabel>
      <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
        {note && (
          <li className="py-4 text-sm text-zinc-500 italic dark:text-zinc-400">
            {note}
          </li>
        )}
        {words.map((w, i) => (
          <WordRow key={i} word={w} />
        ))}
      </ul>
    </section>
  )
}
