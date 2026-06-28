'use client'

import { FreeformClient } from '@/app/(docs)/tarot/freeform/FreeformClient'

// Full-screen Freeform. The board's state (the spread) is carried in the
// ?cards= query, so opening here from the inline view — and closing back —
// preserves the layout. The (player) layout supplies the Suspense boundary
// that FreeformClient's useSearchParams needs.
export default function FreeformExpandPage() {
  return <FreeformClient variant="expand" />
}
