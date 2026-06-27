'use client'

import { TableDrawClient } from '@/app/(docs)/tarot/table-draw/TableDrawClient'

// Full-screen Table Draw. The board's state (the spread) is carried in the
// ?cards= query, so opening here from the inline view — and closing back —
// preserves the layout. The (player) layout supplies the Suspense boundary
// that TableDrawClient's useSearchParams needs.
export default function TableDrawExpandPage() {
  return <TableDrawClient variant="expand" />
}
