import { type Metadata } from 'next'
import { Suspense } from 'react'

// THE PLAYERS ARE NOINDEX (25 November 2026). A /play, /expand or
// /focus page is the full-screen view of something a docs page
// already describes: it has no text of its own in the HTML, takes its
// state from the query string, and is linked from every row that
// starts it, so a crawler finds all of them. The docs page is the one
// to index; `follow` keeps the links out of here worth something.
export const metadata: Metadata = {
  robots: { index: false, follow: true },
}

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
