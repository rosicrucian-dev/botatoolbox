import { type Metadata } from 'next'
import { remark } from 'remark'
import remarkHtml from 'remark-html'

import { Prose } from '@/components/Prose'

import source from '@content/texts/adoration-lord-universe.md?raw'

export const metadata: Metadata = {
  title: 'Adoration to the Lord of the Universe',
}

const html = String(remark().use(remarkHtml).processSync(source))

export default function AdorationLordUniverse() {
  return (
    <article className="space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight dark:text-white">
        Adoration to the Lord of the Universe
      </h1>
      <Prose>
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </Prose>
    </article>
  )
}
