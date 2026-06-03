import { DefinitionList, type DefinitionRow } from '@/components/DefinitionList'

// Renders the minor-arcana attribute table for the detail page —
// Keyword, Sign, Dates as a single continuous DefinitionList.
export function MinorAttributes({
  keyword,
  sign,
  dates,
}: {
  keyword?: string
  sign?: string
  dates?: string
}) {
  const rows: Array<DefinitionRow> = []
  if (keyword) rows.push({ label: 'Keyword', value: keyword })
  if (sign) rows.push({ label: 'Sign', value: sign })
  if (dates) rows.push({ label: 'Dates', value: dates })
  if (rows.length === 0) return null
  return <DefinitionList rows={rows} />
}
