import { PageHeading } from '@/components/layout/PageHeading'
import { SetBreadcrumbs } from '@/components/nav/Breadcrumbs'
import { FileList } from '@/components/ui/FileList'
import { getFiles } from '@/content/data'
import { toLocale } from '@/lib/locales'
import { localizedMetadata } from '@/lib/nav'

export const generateMetadata = localizedMetadata('Files', '/files')

// The site's own downloads, a list per section of files.json. The
// "Historical" section is not one of them: it is the Archive, at /archive
// (src/content/data/files.ts).
export default async function Files({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale: rawLocale } = await params
  const { files, sectionsInOrder } = getFiles(toLocale(rawLocale))
  return (
    <article className="space-y-8">
      <SetBreadcrumbs items={[{ label: 'Files' }]} />
      <PageHeading>Files</PageHeading>
      {sectionsInOrder.map((section) => (
        <section key={section} className="space-y-3">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            {section}
          </h2>
          <FileList files={files.filter((f) => f.section === section)} />
        </section>
      ))}
    </article>
  )
}
