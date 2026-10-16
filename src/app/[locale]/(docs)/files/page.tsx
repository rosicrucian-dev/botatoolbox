import { Link } from '@/components/locale/LocaleLink'

import { PageHeading } from '@/components/layout/PageHeading'
import { SetBreadcrumbs } from '@/components/nav/Breadcrumbs'
import { getFiles } from '@/content/data'
import { toLocale } from '@/lib/locales'
import { localizedMetadata } from '@/lib/nav'

export const generateMetadata = localizedMetadata('Files')

const itemClass =
  '-mx-2 block rounded-sm px-2 py-4 text-zinc-900 transition hover:bg-zinc-50 dark:text-zinc-100 dark:hover:bg-zinc-800/50'

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
          <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {files
              .filter((f) => f.section === section)
              .map((f) => (
                <li key={f.slug}>
                  {f.direct ? (
                    // No `download` attr: navigate to the PDF so the browser
                    // renders it inline for viewing. The user can still save
                    // it from the browser's PDF viewer if they want.
                    <a href={encodeURI(f.src)} className={itemClass}>
                      {f.name}
                    </a>
                  ) : (
                    <Link href={`/files/${f.slug}`} className={itemClass}>
                      {f.name}
                    </Link>
                  )}
                </li>
              ))}
          </ul>
        </section>
      ))}
    </article>
  )
}
