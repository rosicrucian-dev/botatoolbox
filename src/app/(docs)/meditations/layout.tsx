import { type ReactNode } from 'react'

import { SecretGate } from '@/components/SecretGate'

// Every /meditations/* route is gated by secret mode. Unverified
// visitors get redirected to /members-only; verified visitors see the
// page as usual.
export default function MeditationsLayout({ children }: { children: ReactNode }) {
  return <SecretGate>{children}</SecretGate>
}
