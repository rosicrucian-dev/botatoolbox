import { getDocsNavData } from '@/lib/docsNav'
import { toLocale } from '@/lib/locales'
import { privateModeEnabled, privatePageIndex } from '@/lib/privatePages'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: Request,
  {
    params,
  }: {
    params: Promise<{ locale: string }>
  },
) {
  if (!privateModeEnabled()) return new Response(null, { status: 404 })
  const locale = toLocale((await params).locale)
  const index = privatePageIndex()
  return Response.json(
    { nav: getDocsNavData(locale, index), revision: index.revision },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}
