import { Layout } from '@/components/layout/Layout'
import { NavProvider } from '@/components/nav/NavProvider'
import { getDocsNavData } from '@/lib/docsNav'
import { toLocale } from '@/lib/locales'
import { privateModeEnabled } from '@/lib/privatePages'

export default async function DocsLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const locale = toLocale((await params).locale)
  // Assembled server-side so content manifests stay out of the client bundle.
  const nav = getDocsNavData(locale)
  return (
    <NavProvider nav={nav} refreshPrivateNav={privateModeEnabled()}>
      <Layout>{children}</Layout>
    </NavProvider>
  )
}
