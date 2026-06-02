import Link from 'next/link'

import { Prose } from '@/components/Prose'

export const a = Link
export { Button } from '@/components/Button'

export function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <article className="flex h-full flex-col">
      <Prose className="flex-auto">{children}</Prose>
    </article>
  )
}
