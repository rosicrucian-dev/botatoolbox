import { type ReactNode } from 'react'

import { SecretGate } from '@/components/SecretGate'

// Every /meditations/* route is gated by secret mode. Unverified
// visitors get redirected to /settings (which holds the unlock form);
// verified visitors see the page as usual.
export default function MeditationsLayout({ children }: { children: ReactNode }) {
  return <SecretGate>{children}</SecretGate>
}
