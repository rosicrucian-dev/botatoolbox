import { type Metadata } from 'next'

import { QuizCatalog } from './QuizCatalog'

export const metadata: Metadata = {
  title: 'Quiz',
}

export default function QuizIndex() {
  return <QuizCatalog />
}
