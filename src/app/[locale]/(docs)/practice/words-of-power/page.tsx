import { SetBreadcrumbs } from '@/components/Breadcrumbs'
import { DataList } from '@/components/DataList'
import { PageHeading } from '@/components/PageHeading'
import { getTarot, getWords } from '@/content/data'
import { expandWord, formatPronunciation } from '@/lib/hebrew'
import { toLocale } from '@/lib/locales'
import { localizedTitle } from '@/lib/nav'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const locale = toLocale((await params).locale)
  return {
    title: localizedTitle(locale, 'Words of Power'),
  }
}

// items-start + py-4 + gap-6: this list has multi-line content on both
// sides so the spacing differs from the default DataList row.
const ROW_CLASS =
  '-mx-2 flex items-start justify-between gap-6 rounded-sm px-2 py-4 transition hover:bg-zinc-50 dark:hover:bg-zinc-800/50'

// Slice a flat list into per-word chunks per `wordSizes` (each chunk
// joined into one string). Single-word entries (no wordSizes) return the
// whole list joined as one chunk.
function groupByWords(
  items: Array<string>,
  wordSizes?: Array<number>,
): Array<string> {
  if (!wordSizes || wordSizes.length === 0) return [items.join('')]
  const out: Array<string> = []
  let i = 0
  for (const size of wordSizes) {
    out.push(items.slice(i, i + size).join(''))
    i += size
  }
  return out
}

export default async function WordsOfPower({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale: rawLocale } = await params
  const locale = toLocale(rawLocale)
  const { words } = getWords(locale)
  const { cardByLetter } = getTarot(locale)
  return (
    <article className="space-y-6">
      <SetBreadcrumbs items={[{ label: 'Words of Power' }]} />
      <PageHeading>Words of Power</PageHeading>
      <DataList
        items={words}
        getKey={(w) => w.slug}
        getHref={(w) => `/practice/words-of-power/${w.slug}`}
        rowClassName={ROW_CLASS}
        renderRow={(word) => {
          const w = expandWord(word, cardByLetter)
          // Space the glyphs between words (using wordSizes) so multi-word
          // names wrap at word boundaries instead of as one unbreakable run.
          const hebrew = groupByWords(
            w.letters.map((l) => l.glyph),
            w.wordSizes,
          ).join(' ')
          const pron = formatPronunciation(w.letters, w.wordSizes)
          return (
            <>
              {/* Both halves flex-1 + min-w-0: the row splits evenly so a
                  long name (or long Hebrew) can't starve the other column. */}
              <div className="min-w-0 flex-1">
                <div className="text-lg font-semibold break-words text-zinc-900 dark:text-zinc-100">
                  {w.name}
                </div>
                <div
                  className={`mt-1 text-sm ${w.english ? 'text-zinc-500 dark:text-zinc-400' : 'invisible'}`}
                  aria-hidden={!w.english}
                >
                  {w.english || 'placeholder'}
                </div>
              </div>
              <div className="min-w-0 flex-1 text-right">
                <div
                  className="font-serif text-3xl break-words text-zinc-900 dark:text-zinc-100"
                  dir="rtl"
                  lang="he"
                >
                  {hebrew}
                </div>
                <div className="mt-1 text-sm break-words text-zinc-500 dark:text-zinc-400">
                  {pron}
                </div>
              </div>
            </>
          )
        }}
      />
    </article>
  )
}
