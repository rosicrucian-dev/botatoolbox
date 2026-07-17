import { toLocale } from '@/lib/locales'
import { localizedTitle } from '@/lib/nav'
import { TimerClient } from './TimerClient'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const locale = toLocale((await params).locale)
  return {
    title: localizedTitle(locale, 'Timer'),
  }
}

// Builder for the meditation Timer. The interactive UI (step list + the
// emerald Start button, both driven by client state) lives in
// TimerClient; this server component only hosts metadata.
export default function TimerPage() {
  return <TimerClient />
}
