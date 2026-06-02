import { type Metadata } from 'next'

import { DataList } from '@/components/DataList'
import { words } from '@/content/data'
import { expandWord, formatPronunciation } from '@/lib/hebrew'

export const metadata: Metadata = {
  title: 'Words of Power',
}

// items-start + py-4 + gap-6: this list has multi-line content on both
// sides so the spacing differs from the default DataList row.
const ROW_CLASS =
  '-mx-2 flex items-start justify-between gap-6 rounded-sm px-2 py-4 transition hover:bg-zinc-50 dark:hover:bg-zinc-800/50'

export default function WordsOfPower() {
  return (
    <article className="space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight dark:text-white">
        Words of Power
      </h1>
      <DataList
        items={words}
        getKey={(w) => w.slug}
        getHref={(w) => `/words-of-power/${w.slug}`}
        rowClassName={ROW_CLASS}
        renderRow={(word) => {
          const w = expandWord(word)
          const hebrew = w.letters.map((l) => l.glyph).join('')
          const pron = formatPronunciation(w.letters, w.wordSizes)
          return (
            <>
              <div className="min-w-0 flex-1">
                <div className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  {w.name}
                </div>
                <div
                  className={`mt-1 text-sm ${w.english ? 'text-zinc-500 dark:text-zinc-400' : 'invisible'}`}
                  aria-hidden={!w.english}
                >
                  {w.english || 'placeholder'}
                </div>
              </div>
              <div className="text-right">
                <div
                  className="font-serif text-3xl text-zinc-900 dark:text-zinc-100"
                  dir="rtl"
                  lang="he"
                >
                  {hebrew}
                </div>
                <div className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
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
