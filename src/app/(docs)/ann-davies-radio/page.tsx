import { type Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Ann Davies Radio',
}

export default function AnnDaviesRadio() {
  return (
    <article className="space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight dark:text-white">
        Ann Davies Radio
      </h1>
      <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
        <iframe
          src="https://botanz.airtime.pro/embed/player?stream=auto&skin=2"
          title="Ann Davies Radio"
          className="block h-[396px] w-full"
          allow="autoplay"
        />
      </div>
    </article>
  )
}
