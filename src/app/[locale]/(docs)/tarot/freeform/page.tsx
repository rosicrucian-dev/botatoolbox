import { SetBreadcrumbs } from '@/components/Breadcrumbs'
import { FreeformClient } from '@/components/FreeformClient'
import { toLocale } from '@/lib/locales'
import { localizedTitle } from '@/lib/nav'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const locale = toLocale((await params).locale)
  return {
    title: localizedTitle(locale, 'Freeform'),
  }
}

export default function FreeformPage() {
  return (
    <>
      <SetBreadcrumbs items={[{ label: 'Freeform' }]} />
      <FreeformClient />
    </>
  )
}
