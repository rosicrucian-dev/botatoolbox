import { Layout } from '@/components/Layout'
import { NavProvider } from '@/components/NavProvider'
import { toLocale } from '@/lib/locales'
import { getNavigation, getNavTitleMap } from '@/lib/nav'

export default async function DocsLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const locale = toLocale((await params).locale)
  // Assembled server-side and passed through context so the content
  // manifests behind the nav stay out of the client bundle.
  const nav = {
    groups: getNavigation(locale),
    titleMap: Object.fromEntries(getNavTitleMap(locale)),
  }
  return (
    <NavProvider nav={nav}>
      <Layout>{children}</Layout>
    </NavProvider>
  )
}
