import { type GematriaMeaningLike } from '@/content/data/gematria-words'

// Strong's glosses are lower-case in the source; capitalize the first letter so
// they read consistently with Crowley's style, without mutating the data.
function capitalize(s: string): string {
  return s.replace(/\p{L}/u, (c) => c.toUpperCase())
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-xs font-medium tracking-wide text-zinc-400 uppercase dark:text-zinc-500">
      {children}
    </div>
  )
}

// Crowley's gloss plus EVERY Strong's word that shares the spelling. A gematria
// tool surfaces possibilities, so the Strong's homographs are listed in full —
// each with its pointed lemma (the vocalization that carries that meaning) —
// rather than the tool picking one. Shared by the Calculator and Dictionary.
export function GematriaMeaning({ word }: { word: GematriaMeaningLike }) {
  const strongs = word.strongs ?? []
  if (!word.crowley && strongs.length === 0) {
    return (
      <p className="text-sm text-zinc-400 italic dark:text-zinc-500">
        No definition.
      </p>
    )
  }
  return (
    <div className="space-y-2">
      {word.crowley && (
        <div>
          <Label>Crowley</Label>
          <p className="text-sm text-zinc-700 dark:text-zinc-300">
            {word.crowley}
          </p>
        </div>
      )}
      {strongs.length > 0 && (
        <div>
          <Label>Strong&rsquo;s</Label>
          <ul className="space-y-0.5">
            {strongs.map((s) => (
              <li
                key={s.num}
                className="flex items-baseline gap-2 text-sm text-zinc-700 dark:text-zinc-300"
              >
                <span
                  dir="rtl"
                  lang="he"
                  className="shrink-0 font-serif text-base leading-tight text-zinc-900 dark:text-white"
                >
                  {s.lemma}
                </span>
                <span>
                  {capitalize(s.def)}{' '}
                  <span className="text-xs text-zinc-300 tabular-nums dark:text-zinc-600">
                    {s.num}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
