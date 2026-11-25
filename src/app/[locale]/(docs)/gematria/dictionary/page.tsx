import { Suspense } from 'react'

import { ToolLayout } from '@/components/layout/ToolLayout'
import { SetBreadcrumbs } from '@/components/nav/Breadcrumbs'

import { localizedMetadata } from '@/lib/nav'
import { toolFor } from '@/lib/tools'
import { NumberDictionaryClient } from './NumberDictionaryClient'

export const generateMetadata = localizedMetadata(
  'Dictionary',
  '/gematria/dictionary',
)

// useSearchParams (used inside the client for ?n= sync) needs a Suspense
// boundary above it for the static export. Page is a server component just
// to host metadata + Suspense. The fallback is the tool's title row, so
// the exported HTML has a heading and the tabs (see ../page.tsx).
const tool = toolFor('/gematria')

export default function GematriaWordsPage() {
  return (
    <Suspense
      fallback={
        <ToolLayout
          title={tool.title}
          tabs={tool.tabs}
          active="/gematria/dictionary"
        >
          {null}
        </ToolLayout>
      }
    >
      <SetBreadcrumbs
        items={[
          { label: 'Gematria', href: '/gematria' },
          { label: 'Dictionary' },
        ]}
      />
      <NumberDictionaryClient />
    </Suspense>
  )
}
