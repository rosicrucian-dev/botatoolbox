import { Suspense } from 'react'

// Full-screen players: no docs chrome, just a Suspense boundary (players
// read search params). Two page shapes coexist here, and the split is
// deliberate:
//   - Dynamic routes ([slug]) are a server page.tsx (generateStaticParams
//     + data lookup, required for the static export) that passes plain
//     serializable data to a colocated client component (QuizPlayer,
//     WordPlayer, TattvaPlayer, LrpPlayer, …).
//   - Static routes with exactly one player (healing, gematria,
//     major-arcana, expand views) are whole-page 'use client' — there is
//     no per-slug data to resolve, so a server wrapper would add nothing.
export default function PlayerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <Suspense>{children}</Suspense>
}
