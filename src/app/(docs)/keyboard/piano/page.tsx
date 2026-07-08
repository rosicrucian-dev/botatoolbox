import { type Metadata } from 'next'

import { SetBreadcrumbs } from '@/components/Breadcrumbs'
import { Keyboard } from '@/components/Keyboard'
import { KeyboardLayout } from '@/components/KeyboardLayout'

export const metadata: Metadata = {
  title: 'Keyboard',
}

export default function KeyboardPianoPage() {
  return (
    <KeyboardLayout tab="piano">
      <SetBreadcrumbs
        items={[
          { label: 'Keyboard', href: '/keyboard' },
          { label: 'Piano' },
        ]}
      />
      <Keyboard />
    </KeyboardLayout>
  )
}
