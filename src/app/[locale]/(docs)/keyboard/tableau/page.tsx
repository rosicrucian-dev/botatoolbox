import { KeyboardLayout } from '@/components/keyboard/KeyboardLayout'
import { SetBreadcrumbs } from '@/components/nav/Breadcrumbs'
import { TarotKeyboard } from '@/components/tarot/TarotKeyboard'
import { getTarot } from '@/content/data'
import { toLocale } from '@/lib/locales'
import { localizedMetadata } from '@/lib/nav'

export const generateMetadata = localizedMetadata('Keyboard')

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
