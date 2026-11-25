'use client'

import { ErrorFallback } from '@/components/ui/ErrorFallback'

// Segment error boundary for the docs shell. Renders inside (docs)/layout,
// so the header/sidebar stay put. Body shared with (player)/error.tsx.
export default function DocsError(props: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return <ErrorFallback {...props} />
}
