import { Suspense } from 'react'

import { ToolLayout } from '@/components/layout/ToolLayout'
import { SetBreadcrumbs } from '@/components/nav/Breadcrumbs'

import { cardByGlyph } from '@/lib/glyphCards'
import { toLocale } from '@/lib/locales'
import { localizedMetadata } from '@/lib/nav'
import { toolFor } from '@/lib/tools'
import { GematriaClient } from './GematriaClient'

export const generateMetadata = localizedMetadata('Gematria', '/gematria')

const tool = toolFor('/gematria')

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
//
// THE FALLBACK IS THE TITLE ROW (25 November 2026). Everything under
// that boundary is left out of the exported HTML, which made this a
// page with no heading and no text at all to anything that reads the
// file: the fallback is what the file holds, so it carries the tool's
// name and its tabs, the same row the client draws a moment later.
export default async function Gematria({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const locale = toLocale((await params).locale)
  return (
    <Suspense
      fallback={
        <ToolLayout title={tool.title} tabs={tool.tabs} active="/gematria">
          {null}
        </ToolLayout>
      }
    >
      <SetBreadcrumbs items={[{ label: 'Gematria' }]} />
      <GematriaClient cardByGlyph={cardByGlyph(locale)} />
    </Suspense>
  )
}
