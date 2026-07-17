import { SetBreadcrumbs } from '@/components/Breadcrumbs'
import { KeyboardLayout } from '@/components/KeyboardLayout'
import { TarotKeyboard } from '@/components/TarotKeyboard'
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

export default function KeyboardTableauPage() {
  return (
    <KeyboardLayout tab="tableau">
      <SetBreadcrumbs
        items={[{ label: 'Keyboard', href: '/keyboard' }, { label: 'Tableau' }]}
      />
      <TarotKeyboard />
    </KeyboardLayout>
  )
}
