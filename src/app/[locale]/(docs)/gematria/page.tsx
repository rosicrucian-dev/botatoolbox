import { GroupPage } from '@/components/GroupPage'
import { toLocale } from '@/lib/locales'
import { localizedTitle } from '@/lib/nav'
import { GematriaSeqRedirect } from './GematriaSeqRedirect'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const locale = toLocale((await params).locale)
  return {
    title: localizedTitle(locale, 'Gematria'),
  }
}

export default function GematriaIndex() {
  return (
    <>
      <GematriaSeqRedirect />
      <GroupPage slug="gematria" />
    </>
  )
}
