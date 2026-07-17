import { SetBreadcrumbs } from '@/components/Breadcrumbs'
import { PageHeading } from '@/components/PageHeading'
import { getAlchemy } from '@/content/data'
import { toLocale } from '@/lib/locales'
import { localizedTitle } from '@/lib/nav'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const locale = toLocale((await params).locale)
  return {
    title: localizedTitle(locale, 'Alchemy'),
  }
}

export default async function AlchemyPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale: rawLocale } = await params
  const { alchemyTerms } = getAlchemy(toLocale(rawLocale))
  return (
    <article className="space-y-6">
      <SetBreadcrumbs items={[{ label: 'Alchemy' }]} />
      <PageHeading>Alchemy</PageHeading>

      <dl className="divide-y divide-zinc-950/5 border-y border-zinc-950/5 text-sm/6 dark:divide-white/5 dark:border-white/5">
        {alchemyTerms.map((t) => (
          <div key={t.slug} className="py-4">
            <dt className="font-medium text-zinc-950 dark:text-white">
              {t.term}
            </dt>
            <dd className="mt-1 text-zinc-500 dark:text-zinc-400">
              {t.definition}
            </dd>
          </div>
        ))}
      </dl>
    </article>
  )
}
