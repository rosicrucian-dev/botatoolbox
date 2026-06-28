'use client'

import { FreeformClient } from '@/app/(docs)/tarot/freeform/FreeformClient'

// Full-screen Freeform. The spread is shared with the inline view through
// localStorage, so opening here — and closing back — preserves the layout.
export default function FreeformExpandPage() {
  return <FreeformClient variant="expand" />
}
