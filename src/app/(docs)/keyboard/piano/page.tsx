import { type Metadata } from 'next'

import { Keyboard } from '@/components/Keyboard'
import { KeyboardLayout } from '@/components/KeyboardLayout'

export const metadata: Metadata = {
  title: 'Keyboard',
}

export default function KeyboardPianoPage() {
  return (
    <KeyboardLayout tab="piano">
      <Keyboard />
    </KeyboardLayout>
  )
}
