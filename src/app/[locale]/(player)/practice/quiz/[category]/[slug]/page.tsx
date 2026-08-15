import { type Metadata } from 'next'
import { notFound } from 'next/navigation'

import { getQuizzes } from '@/content/data'
import { DEFAULT_LOCALE, toLocale } from '@/lib/locales'

import { QuizPlayer } from './QuizPlayer'

// Structural (slug) enumeration — English source on purpose.
const { quizzes } = getQuizzes(DEFAULT_LOCALE)

export function generateStaticParams() {
  return quizzes.map((q) => ({ category: q.categorySlug, slug: q.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; category: string; slug: string }>
}): Promise<Metadata> {
  const { locale: rawLocale, category, slug } = await params
  const { quizBySlug } = getQuizzes(toLocale(rawLocale))
  const quiz = quizBySlug(category, slug)
  return { title: quiz ? quiz.title : 'Quiz' }
}

export default async function QuizPlayerPage({
  params,
}: {
  params: Promise<{ locale: string; category: string; slug: string }>
}) {
  const { locale: rawLocale, category, slug } = await params
  const { quizBySlug } = getQuizzes(toLocale(rawLocale))
  const quiz = quizBySlug(category, slug)
  if (!quiz) notFound()
  return <QuizPlayer quiz={quiz} />
}
