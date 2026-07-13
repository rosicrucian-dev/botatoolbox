import { type Metadata } from 'next'

import { TimerClient } from './TimerClient'

export const metadata: Metadata = {
  title: 'Timer',
}

// Builder for the meditation Timer. The interactive UI (step list + the
// emerald Start button, both driven by client state) lives in
// TimerClient; this server component only hosts metadata.
export default function TimerPage() {
  return <TimerClient />
}
