import { notFound } from 'next/navigation'
import { type Metadata } from 'next'

import { fileBySlug, files } from '../files'

export function generateStaticParams() {
  return files.map((f) => ({ slug: f.slug }))
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
  if (!file) notFound()

  return (
    <article className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold tracking-tight dark:text-white">
          {file.name}
        </h1>
        <a
          href={file.src}
          download
          className="inline-flex items-center justify-center rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          Download
        </a>
      </div>
      <img
        src={file.src}
        alt={file.name}
        className="w-full rounded-lg shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800"
      />
    </article>
  )
}
