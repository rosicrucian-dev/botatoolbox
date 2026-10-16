import { GroupPage } from '@/components/nav/GroupPage'
import { localizedMetadata } from '@/lib/nav'
import { GematriaSeqRedirect } from './GematriaSeqRedirect'

export const generateMetadata = localizedMetadata('Gematria')

export default function GematriaIndex() {
  return (
    <>
      <GematriaSeqRedirect />
      <GroupPage slug="gematria" />
    </>
  )
}
