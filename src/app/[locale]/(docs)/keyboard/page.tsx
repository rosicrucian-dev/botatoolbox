import { SetBreadcrumbs } from '@/components/Breadcrumbs'
import { Keyboard } from '@/components/Keyboard'
import { keys } from '@/lib/keyboard'
import { KeyboardLayout } from '@/components/KeyboardLayout'
import { toLocale } from '@/lib/locales'
import { localizedTitle } from '@/lib/nav'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const locale = toLocale((await params).locale)
  return {
    title: localizedTitle(locale, 'Keyboard'),
  }
}

export default function KeyboardPage() {
  return (
    <KeyboardLayout tab="piano">
      <SetBreadcrumbs items={[{ label: 'Keyboard' }]} />
      <Keyboard keys={keys} />
    </KeyboardLayout>
  )
}
