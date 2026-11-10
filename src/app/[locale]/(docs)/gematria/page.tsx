import { Suspense } from 'react'

import { SetBreadcrumbs } from '@/components/nav/Breadcrumbs'

import { cardByGlyph } from '@/lib/glyphCards'
import { toLocale } from '@/lib/locales'
import { localizedMetadata } from '@/lib/nav'
import { GematriaClient } from './GematriaClient'

export const generateMetadata = localizedMetadata('Gematria')

// THE GEMATRIA TOOL, and its first view: the calculator
// (src/lib/tools.ts). It was /gematria/calculator under a Gematria nav
// group whose landing page listed two cards; the group is one row of
// Tools now and the row lands here, with the Dictionary a tab away.
// /gematria/calculator redirects here.
//
// This address also took `?seq=` for the player's back-link while it
// was the group landing — a redirect stub then, the real thing now, so
// the query lands where it always meant to. useSearchParams (inside
// GematriaClient, for that `?seq=` sync) needs a Suspense boundary
// above it for the static export.
export default async function Gematria({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const locale = toLocale((await params).locale)
  return (
    <Suspense>
      <SetBreadcrumbs items={[{ label: 'Gematria' }]} />
      <GematriaClient cardByGlyph={cardByGlyph(locale)} />
    </Suspense>
  )
}
