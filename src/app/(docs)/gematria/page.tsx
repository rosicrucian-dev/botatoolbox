import { type Metadata } from 'next'

import { GroupPage } from '@/components/GroupPage'
import { GematriaSeqRedirect } from './GematriaSeqRedirect'

export const metadata: Metadata = {
  title: 'Gematria',
}

export default function GematriaIndex() {
  return (
    <>
      <GematriaSeqRedirect />
      <GroupPage title="Gematria" />
    </>
  )
}
