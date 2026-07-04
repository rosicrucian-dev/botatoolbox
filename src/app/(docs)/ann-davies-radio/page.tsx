import { PageHeading } from '@/components/PageHeading'
import { type Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Ann Davies Radio',
}

export default function AnnDaviesRadio() {
  return (
    <article className="space-y-6">
      <PageHeading>Ann Davies Radio</PageHeading>
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
