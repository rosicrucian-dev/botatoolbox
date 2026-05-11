import { type Metadata } from 'next'

import { KeyboardLayout } from '@/components/KeyboardLayout'
import { TarotKeyboard } from '@/components/TarotKeyboard'

export const metadata: Metadata = {
  title: 'Keyboard',
}

export default function KeyboardTableauPage() {
  return (
    <KeyboardLayout tab="tableau">
      <TarotKeyboard />
    </KeyboardLayout>
  )
}
