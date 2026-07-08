import { type Metadata } from 'next'

import { SetBreadcrumbs } from '@/components/Breadcrumbs'

import { QuizCatalog } from './QuizCatalog'

export const metadata: Metadata = {
  title: 'Quiz',
}

export default function QuizIndex() {
  return (
    <>
      <SetBreadcrumbs items={[{ label: 'Quiz' }]} />
      <QuizCatalog />
    </>
  )
}
