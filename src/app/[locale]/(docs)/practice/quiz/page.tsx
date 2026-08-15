import { SetBreadcrumbs } from '@/components/Breadcrumbs'

import { getQuizzes } from '@/content/data'
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

export default async function QuizIndex({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { quizzes, quizCategories } = getQuizzes(toLocale((await params).locale))
  return (
    <>
      <SetBreadcrumbs items={[{ label: 'Quiz' }]} />
      <QuizCatalog quizzes={quizzes} quizCategories={quizCategories} />
    </>
  )
}
