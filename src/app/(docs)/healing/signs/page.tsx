import { type Metadata } from 'next'

import { DataList } from '@/components/DataList'
import { signs } from '@/content/data'
import { getLetterMeta } from '@/lib/hebrew'

export const metadata: Metadata = {
  title: 'Signs',
}

// Signs player has no setup card; idx is direct.
const signsWithIdx = signs.map((s, i) => ({ ...s, idx: i }))

export default function Signs() {
  return (
    <article className="space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight dark:text-white">
        Signs
      </h1>

      <DataList
        items={signsWithIdx}
        getKey={(s) => s.name}
        getHref={(s) => `/healing/signs/play?idx=${s.idx}`}
        primeAudio
        renderRow={(s) => {
          const meta = getLetterMeta(s.letter)
          return (
            <>
              <div>
                <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {s.name}
                </div>
                {s.bodyPart && (
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">
                    {s.bodyPart}
                  </div>
                )}
              </div>
              <div
                className="font-serif text-3xl leading-none text-zinc-900 dark:text-zinc-100"
                dir="rtl"
                lang="he"
              >
                {meta.glyph}
              </div>
            </>
          )
        }}
      />
    </article>
  )
}
