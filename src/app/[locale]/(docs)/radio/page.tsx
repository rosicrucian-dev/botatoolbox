import { SetBreadcrumbs } from '@/components/Breadcrumbs'
import { PageHeading } from '@/components/PageHeading'
import { toLocale } from '@/lib/locales'
import { localizedTitle } from '@/lib/nav'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const locale = toLocale((await params).locale)
  return {
    title: localizedTitle(locale, 'Radio'),
  }
}

export default function Radio() {
  return (
    <article className="space-y-6">
      <SetBreadcrumbs items={[{ label: 'Radio' }]} />
      <PageHeading>Radio</PageHeading>
      <div
        className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800"
        style={{ backgroundColor: '#25292c' }}
      >
        <iframe
          src="https://botanz.airtime.pro/embed/player?stream=auto&skin=2"
          title="Ann Davies Radio"
          className="block h-[396px] w-full"
          allow="autoplay"
          style={{ backgroundColor: '#25292c' }}
        />
      </div>
    </article>
  )
}
