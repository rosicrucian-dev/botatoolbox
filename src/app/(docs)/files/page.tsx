import { type Metadata } from 'next'
import { Link } from 'next-view-transitions'

import { PageHeading } from '@/components/PageHeading'
import { files, sectionsInOrder } from '@/content/data'

export const metadata: Metadata = {
  title: 'Files',
}

const itemClass =
  '-mx-2 block rounded-sm px-2 py-4 text-zinc-900 transition hover:bg-zinc-50 dark:text-zinc-100 dark:hover:bg-zinc-800/50'

export default function Files() {
  return (
    <article className="space-y-8">
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
