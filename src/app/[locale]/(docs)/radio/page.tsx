import { PageHeading } from '@/components/layout/PageHeading'
import { SetBreadcrumbs } from '@/components/nav/Breadcrumbs'
import { localizedMetadata } from '@/lib/nav'

export const generateMetadata = localizedMetadata('Radio')

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
