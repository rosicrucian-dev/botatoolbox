import { Suspense } from 'react'

// Full-screen players: no docs chrome, just a Suspense boundary (players
// read search params). Every player route is a server page.tsx (data
// lookup, and generateStaticParams for dynamic routes, both required by
// the static export) that passes plain serializable data to a colocated
// client component (QuizPlayer, WordPlayer, PlanetsPlayClient, …), with
// no exceptions. Errors here fall to error.tsx in this folder.
export default function PlayerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <Suspense>{children}</Suspense>
}
