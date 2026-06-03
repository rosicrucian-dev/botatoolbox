import { type Metadata } from 'next'
import { remark } from 'remark'
import remarkHtml from 'remark-html'

import { Prose } from '@/components/Prose'

import source from '@content/texts/aquarian-doxology.md?raw'

export const metadata: Metadata = {
  title: 'Aquarian Doxology',
}

const html = String(remark().use(remarkHtml).processSync(source))

export default function AquarianDoxology() {
  return (
    <article className="space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight dark:text-white">
        Aquarian Doxology
      </h1>
      <Prose>
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </Prose>
    </article>
  )
}
