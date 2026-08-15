import { SetBreadcrumbs } from '@/components/Breadcrumbs'
import { KeyboardLayout } from '@/components/KeyboardLayout'
import { TarotKeyboard } from '@/components/TarotKeyboard'
import { getTarot } from '@/content/data'
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

export default async function KeyboardTableauPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { cards } = getTarot(toLocale((await params).locale))
  return (
    <KeyboardLayout tab="tableau">
      <SetBreadcrumbs
        items={[{ label: 'Keyboard', href: '/keyboard' }, { label: 'Tableau' }]}
      />
      <TarotKeyboard cards={cards} />
    </KeyboardLayout>
  )
}
