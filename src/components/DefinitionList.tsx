// The detail-page key/value pattern: labeled rows (term + description) used
// by tarot, planet, sign, sephirah, etc. A thin wrapper over Catalyst's
// <DescriptionList> so every detail page renders semantic <dl>/<dt>/<dd>
// (better a11y + document outline) from the same `rows` data shape the pages
// already pass. Rows are spread as <dt>/<dd> via Fragment — not a wrapper
// element — so they stay direct children of the <dl> and Catalyst's
// first-/nth-child border rules line up.
import { Fragment } from 'react'

import {
  DescriptionDetails,
  DescriptionList as CatalystDescriptionList,
  DescriptionTerm,
} from '@/components/catalyst/description-list'

export interface DefinitionRow {
  label: string
  value: React.ReactNode
}

export function DefinitionList({
  rows,
}: {
  rows: ReadonlyArray<DefinitionRow>
}) {
  return (
    <CatalystDescriptionList>
      {rows.map((row, i) => (
        <Fragment key={i}>
          <DescriptionTerm>{row.label}</DescriptionTerm>
          <DescriptionDetails>{row.value}</DescriptionDetails>
        </Fragment>
      ))}
    </CatalystDescriptionList>
  )
}
