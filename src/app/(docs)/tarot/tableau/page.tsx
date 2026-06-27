import { type Metadata } from 'next'

import { TarotTableau } from '@/components/TarotTableau'

export const metadata: Metadata = {
  title: 'Tableau',
}

export default function Tableau() {
  return (
    <article className="space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight dark:text-white">
        Tableau
      </h1>
      <TarotTableau variant="major" linked />
    </article>
  )
}
