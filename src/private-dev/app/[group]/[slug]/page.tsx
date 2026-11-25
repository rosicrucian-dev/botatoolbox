import { notFound } from 'next/navigation'
import { remark } from 'remark'
import remarkHtml from 'remark-html'

import { PageHeading } from '@/components/layout/PageHeading'
import { SetBreadcrumbs } from '@/components/nav/Breadcrumbs'
import { Prose } from '@/components/ui/Prose'
import { toLocale } from '@/lib/locales'
import { privatePage } from '@/lib/privatePages'

export const dynamic = 'force-dynamic'

export default async function LocalPage({
  params,
}: {
  params: Promise<{ locale: string; group: string; slug: string }>
}) {
  const { locale, group, slug } = await params
  const page = privatePage(group, slug, toLocale(locale))
  if (!page) notFound()
  const html = String(remark().use(remarkHtml).processSync(page.body))
  return (
    <article className="space-y-6">
      <SetBreadcrumbs items={[{ label: page.title }]} />
      <PageHeading>{page.title}</PageHeading>
      <Prose>
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </Prose>
    </article>
  )
}
