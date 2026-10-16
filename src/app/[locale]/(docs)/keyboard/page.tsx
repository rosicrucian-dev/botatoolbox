import { Keyboard } from '@/components/keyboard/Keyboard'
import { KeyboardLayout } from '@/components/keyboard/KeyboardLayout'
import { SetBreadcrumbs } from '@/components/nav/Breadcrumbs'
import { keys } from '@/lib/keyboard'
import { localizedMetadata } from '@/lib/nav'

export const generateMetadata = localizedMetadata('Keyboard')

export default function KeyboardPage() {
  return (
    <KeyboardLayout tab="piano">
      <SetBreadcrumbs items={[{ label: 'Keyboard' }]} />
      <Keyboard keys={keys} />
    </KeyboardLayout>
  )
}
