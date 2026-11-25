import { PageHeading } from '@/components/layout/PageHeading'
import { SetBreadcrumbs } from '@/components/nav/Breadcrumbs'
import { FileList } from '@/components/ui/FileList'
import { getFiles, isPdf, type FileEntry } from '@/content/data'
import { toLocale } from '@/lib/locales'
import { localizedMetadata } from '@/lib/nav'

export const generateMetadata = localizedMetadata('Archive', '/archive')

// The two kinds of thing the Archive holds, in the order they are
// listed. Which kind a row is comes from the file itself (`isPdf`).
const KINDS: ReadonlyArray<{
  title: string
  holds: (file: FileEntry) => boolean
}> = [
  { title: 'PDFs', holds: isPdf },
  { title: 'Images', holds: (file) => !isPdf(file) },
]

// THE ARCHIVE (25 November 2026): the historical documents, which were
// the "Historical" section of /files. They are a shelf of the Library
// now, and /files keeps the site's own downloads. The rows are still
// files.json's (src/content/data/files.ts).
//
// EVERY ROW OPENS THE FILE ITSELF, the PDF or the image, and not a page
// of this site about it: the images had a viewer page, which showed the
// image and a Download button and nothing the image does not.
export default async function ArchiveIndex({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { archive } = getFiles(toLocale((await params).locale))
  return (
    <article className="space-y-8">
      <SetBreadcrumbs items={[{ label: 'Archive' }]} />
      <PageHeading>Archive</PageHeading>
      {KINDS.map(({ title, holds }) => {
        const files = archive.filter(holds)
        if (files.length === 0) return null
        return (
          <section key={title} className="space-y-3">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
              {title}
            </h2>
            <FileList files={files} />
          </section>
        )
      })}
    </article>
  )
}
