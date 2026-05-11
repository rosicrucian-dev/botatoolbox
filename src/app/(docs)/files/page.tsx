import Link from 'next/link'
import { type Metadata } from 'next'

import { files, sectionsInOrder } from './files'

export const metadata: Metadata = {
  title: 'Files',
}

export default function Files() {
  return (
    <article className="space-y-8">
      <h1 className="text-3xl font-semibold tracking-tight dark:text-white">
        Files
      </h1>
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
                  <Link
                    href={`/files/${f.slug}`}
                    className="-mx-2 block rounded-sm px-2 py-4 text-zinc-900 transition hover:bg-zinc-50 dark:text-zinc-100 dark:hover:bg-zinc-800/50"
                  >
                    {f.name}
                  </Link>
                </li>
              ))}
          </ul>
        </section>
      ))}
    </article>
  )
}
