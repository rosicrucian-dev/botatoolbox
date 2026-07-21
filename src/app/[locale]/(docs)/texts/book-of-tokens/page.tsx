import { SetBreadcrumbs } from '@/components/Breadcrumbs'
import { CollectionSearch } from '@/components/CollectionSearch'
import { DataList } from '@/components/DataList'
import { PageToolbar } from '@/components/PageToolbar'
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
  const locale = toLocale(rawLocale)
  const { chapters } = getBookOfTokens(locale)
  return (
    <article className="space-y-6">
      <SetBreadcrumbs items={[{ label: 'The Book of Tokens' }]} />
      <PageToolbar
        title="The Book of Tokens"
        primaryAction={
          <CollectionSearch
            indexUrl={`/data/book-of-tokens-search.${locale}.json`}
            placeholder="Search the meditations…"
            nounPlural="meditations"
          />
        }
      />
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
