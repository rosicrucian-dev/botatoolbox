import { PageHeading } from '@/components/layout/PageHeading'
import { SetBreadcrumbs } from '@/components/nav/Breadcrumbs'
import { DataList } from '@/components/ui/DataList'
import { IndexLabel } from '@/components/ui/IndexLabel'
import { getTarot } from '@/content/data'
import { toLocale } from '@/lib/locales'
import { localizedMetadata } from '@/lib/nav'

export const generateMetadata = localizedMetadata('Major Arcana')

export default async function MajorArcana({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale: rawLocale } = await params
  const { cards } = getTarot(toLocale(rawLocale))
  return (
    <article className="space-y-6">
      <SetBreadcrumbs items={[{ label: 'Major Arcana' }]} />
      <PageHeading>Major Arcana</PageHeading>
      <DataList
        items={cards}
        getKey={(c) => c.slug}
        getHref={(c) => `/tarot/${c.slug}`}
        renderRow={(c) => (
          <>
            <span className="flex items-baseline gap-3">
              {/* Match the Minor Arcana page's wider first column for
                  consistency across the two list pages. */}
              <IndexLabel widthClassName="w-16 md:w-20">{c.num}</IndexLabel>
              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {c.name}
              </span>
            </span>
            <span className="text-zinc-400" aria-hidden>
              →
            </span>
          </>
        )}
      />
    </article>
  )
}
