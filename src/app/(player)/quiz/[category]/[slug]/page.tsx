import { notFound } from 'next/navigation'
import { type Metadata } from 'next'

import { quizBySlug, quizzes } from '@/content/data/quizzes'

import { QuizPlayer } from './QuizPlayer'

export function generateStaticParams() {
  return quizzes.map((q) => ({ category: q.categorySlug, slug: q.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; slug: string }>
}): Promise<Metadata> {
  const { category, slug } = await params
  const quiz = quizBySlug(category, slug)
  return { title: quiz ? quiz.title : 'Quiz' }
}

export default async function QuizPlayerPage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>
}) {
  const { category, slug } = await params
  const quiz = quizBySlug(category, slug)
  if (!quiz) notFound()
  return <QuizPlayer quiz={quiz} />
}
