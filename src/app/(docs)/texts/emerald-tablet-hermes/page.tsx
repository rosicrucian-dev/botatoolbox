import { type Metadata } from 'next'
import { remark } from 'remark'
import remarkHtml from 'remark-html'

import { Prose } from '@/components/Prose'

import source from '@content/texts/emerald-tablet-hermes.md?raw'

export const metadata: Metadata = {
  title: 'The Emerald Tablet of Hermes',
}

// Compile the markdown body to HTML once at module load (build time
// during static export). The page title lives in this file (not the .md)
// so it uses the same heading style as every other docs page.
const html = String(remark().use(remarkHtml).processSync(source))

export default function EmeraldTabletHermes() {
  return (
    <article className="space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight dark:text-white">
        The Emerald Tablet of Hermes
      </h1>
      <Prose>
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </Prose>
    </article>
  )
}
