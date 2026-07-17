import { SetBreadcrumbs } from '@/components/Breadcrumbs'
import { DataList } from '@/components/DataList'
import { PageHeading } from '@/components/PageHeading'
import { getBookOfTokens } from '@/content/texts/book-of-tokens'
import { toLocale } from '@/lib/locales'
import { localizedTitle } from '@/lib/nav'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const locale = toLocale((await params).locale)
  return {
    title: localizedTitle(locale, 'The Book of Tokens'),
  }
}

// Index of the meditations — the app's standard divided list (DataList),
// each row linking to its own page at /texts/book-of-tokens/<slug>.
export default async function BookOfTokens({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale: rawLocale } = await params
  const { chapters } = getBookOfTokens(toLocale(rawLocale))
  return (
    <article className="space-y-6">
      <SetBreadcrumbs items={[{ label: 'The Book of Tokens' }]} />
      <PageHeading>The Book of Tokens</PageHeading>
      <DataList
        items={chapters}
        getKey={(c) => c.slug}
        getHref={(c) => `/texts/book-of-tokens/${c.slug}`}
        renderRow={(c) => (
          <span className="font-medium text-zinc-900 dark:text-zinc-100">
            {c.title}
          </span>
        )}
      />
    </article>
  )
}
