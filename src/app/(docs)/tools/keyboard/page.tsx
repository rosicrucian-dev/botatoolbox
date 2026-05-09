import { type Metadata } from 'next'

import { Keyboard } from '@/components/Keyboard'

export const metadata: Metadata = {
  title: 'Keyboard',
}

export default function KeyboardPage() {
  return (
    <article className="space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight dark:text-white">
        Keyboard
      </h1>
      <Keyboard />
    </article>
  )
}
