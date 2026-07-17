import { SetBreadcrumbs } from '@/components/Breadcrumbs'

import { toLocale } from '@/lib/locales'
import { localizedTitle } from '@/lib/nav'
import { QuizCatalog } from './QuizCatalog'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const locale = toLocale((await params).locale)
  return {
    title: localizedTitle(locale, 'Quiz'),
  }
}

export default function QuizIndex() {
  return (
    <>
      <SetBreadcrumbs items={[{ label: 'Quiz' }]} />
      <QuizCatalog />
    </>
  )
}
