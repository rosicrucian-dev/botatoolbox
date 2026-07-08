import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { type Metadata } from 'next'
import { remark } from 'remark'
import remarkHtml from 'remark-html'

import { SetBreadcrumbs } from '@/components/Breadcrumbs'
import { PageHeading } from '@/components/PageHeading'
import { Prose } from '@/components/Prose'

export const metadata: Metadata = {
  title: 'Changelog',
}

// Markdown-driven: edit content/changelog.md to add an entry — no code.
// Convention: newest entry on top, a `## <Month D, YYYY>` heading per
// release day, followed by bullet points of what changed. No version
// numbers. Compiled to HTML at build time (static export).
function changelogHtml(): string {
  const md = readFileSync(join(process.cwd(), 'content/changelog.md'), 'utf8')
  return String(remark().use(remarkHtml).processSync(md))
}

export default function Changelog() {
  const html = changelogHtml()
  return (
    <article className="space-y-6">
      <SetBreadcrumbs items={[{ label: 'Changelog' }]} />
      <PageHeading>Changelog</PageHeading>
      <Prose>
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </Prose>
    </article>
  )
}
