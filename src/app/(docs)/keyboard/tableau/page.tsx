import { type Metadata } from 'next'

import { SetBreadcrumbs } from '@/components/Breadcrumbs'
import { KeyboardLayout } from '@/components/KeyboardLayout'
import { TarotKeyboard } from '@/components/TarotKeyboard'

export const metadata: Metadata = {
  title: 'Keyboard',
}

export default function KeyboardTableauPage() {
  return (
    <KeyboardLayout tab="tableau">
      <SetBreadcrumbs
        items={[
          { label: 'Keyboard', href: '/keyboard' },
          { label: 'Tableau' },
        ]}
      />
      <TarotKeyboard />
    </KeyboardLayout>
  )
}
