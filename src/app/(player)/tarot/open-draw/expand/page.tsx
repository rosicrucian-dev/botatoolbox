'use client'

import { OpenDrawClient } from '@/app/(docs)/tarot/open-draw/OpenDrawClient'

// Full-screen Open Draw. The board's state (the spread) is carried in the
// ?cards= query, so opening here from the inline view — and closing back —
// preserves the layout. The (player) layout supplies the Suspense boundary
// that OpenDrawClient's useSearchParams needs.
export default function OpenDrawExpandPage() {
  return <OpenDrawClient variant="expand" />
}
