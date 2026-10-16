import { SetBreadcrumbs } from '@/components/nav/Breadcrumbs'

import { getQuizzes } from '@/content/data'
import { toLocale } from '@/lib/locales'
import { localizedMetadata } from '@/lib/nav'
import { QuizCatalog } from './QuizCatalog'

export const generateMetadata = localizedMetadata('Quiz')

export default async function QuizIndex({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { quizzes, quizCategories } = getQuizzes(
    toLocale((await params).locale),
  )
  return (
    <>
      <SetBreadcrumbs items={[{ label: 'Quiz' }]} />
      <QuizCatalog quizzes={quizzes} quizCategories={quizCategories} />
    </>
  )
}
