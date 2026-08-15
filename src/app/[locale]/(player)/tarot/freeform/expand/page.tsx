import { FreeformClient } from '@/components/FreeformClient'
import { freeformDeck } from '@/lib/freeformDeck'
import { toLocale } from '@/lib/locales'

// Full-screen Freeform. The spread is shared with the inline view through
// localStorage, so opening here — and closing back — preserves the layout.
export default async function FreeformExpandPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const deck = freeformDeck(toLocale((await params).locale))
  return <FreeformClient deck={deck} variant="expand" />
}
