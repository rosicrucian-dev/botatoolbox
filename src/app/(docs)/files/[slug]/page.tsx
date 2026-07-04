import { type Metadata } from 'next'
import { notFound } from 'next/navigation'

import { MinorTableau } from '@/components/MinorTableau'
import { PageHeading } from '@/components/PageHeading'
import { TarotTableau } from '@/components/TarotTableau'
import { fileBySlug, files } from '@/content/data'

export function generateStaticParams() {
  // `direct` entries are plain download links with no viewer page.
  return files.filter((f) => !f.direct).map((f) => ({ slug: f.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const file = fileBySlug[slug]
  return { title: file?.name ?? 'File' }
}

export default async function FileViewer({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const file = fileBySlug[slug]
  if (!file || file.direct) notFound()

  const downloads = file.downloads ?? [{ label: 'Download', src: file.src }]
  const btn =
    'inline-flex items-center justify-center rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300'

  return (
    <article className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeading>{file.name}</PageHeading>
        <div className="flex flex-wrap gap-2">
          {downloads.map((d) => (
            <a key={d.src} href={encodeURI(d.src)} download className={btn}>
              {d.label}
            </a>
          ))}
        </div>
      </div>
      {file.description && (
        <p className="max-w-2xl text-zinc-600 dark:text-zinc-400">
          {file.description}
        </p>
      )}
      {file.tableau ? (
        <TarotTableau style={file.tableau} link="image" rounded={false} />
      ) : file.minorTableau ? (
        <MinorTableau />
      ) : (
        <img
          src={file.src}
          alt={file.name}
          className={`w-full shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800${file.rounded === false ? '' : 'rounded-lg'}`}
        />
      )}
    </article>
  )
}
