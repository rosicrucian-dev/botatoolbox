import { localizedMetadata } from '@/lib/nav'
import { TimerClient } from './TimerClient'

export const generateMetadata = localizedMetadata('Timer')

// Builder for the meditation Timer. The interactive UI (step list + the
// emerald Start button, both driven by client state) lives in
// TimerClient; this server component only hosts metadata.
export default function TimerPage() {
  return <TimerClient />
}
