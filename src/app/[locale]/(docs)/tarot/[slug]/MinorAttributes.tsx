import { DefinitionList, type DefinitionRow } from '@/components/DefinitionList'
import { TextLink } from '@/components/TextLink'
import {
  getNumerology,
  getSephiroth,
  SEPHIROTH_DESCENT_SLUGS,
} from '@/content/data'
import { type Locale } from '@/lib/locales'

// Map the Ace–10 number string to a 1–10 integer. Returns null for the
// court cards (Page/Knight/Queen/King) — they don't have a sephirah or
// numerological attribution.
function asDigit(num: string): number | null {
  if (num === 'Ace') return 1
  const n = Number(num)
  return Number.isInteger(n) && n >= 2 && n <= 10 ? n : null
}

// Numerology meanings for a number (Ace–10). 10 reduces to its digits:
// "1, 0" → ["Beginning", "No-Thing"]. Lookup uses the data file so any
// edit there flows through here automatically.
function numerologyMeanings(locale: Locale, n: number): string[] {
  const { numerology } = getNumerology(locale)
  return String(n)
    .split('')
    .map((d) => numerology.find((e) => e.num === Number(d))?.meaning)
    .filter((m): m is string => Boolean(m))
}

// Renders the minor-arcana attribute table for the detail page —
// Keyword, Sign, Dates, Sephirah, Numerology as a single continuous
// DefinitionList. Sephirah + Numerology only render for Ace–10 (the
// number cards); court cards skip both rows.
export function MinorAttributes({
  locale,
  num,
  keyword,
  sign,
  dates,
}: {
  locale: Locale
  num: string
  keyword?: string
  sign?: string
  dates?: string
}) {
  const { sephirahBySlug } = getSephiroth(locale)
  const digit = asDigit(num)
  const sephirah = digit
    ? sephirahBySlug[SEPHIROTH_DESCENT_SLUGS[digit - 1]]
    : null
  const meanings = digit ? numerologyMeanings(locale, digit) : []

  const rows: Array<DefinitionRow> = []
  if (keyword) rows.push({ label: 'Keyword', value: keyword })
  if (sign) rows.push({ label: 'Sign', value: sign })
  if (dates) rows.push({ label: 'Dates', value: dates })
  if (sephirah) {
    rows.push({
      label: 'Sephirah',
      value: (
        <TextLink href={`/tree-of-life/${sephirah.slug}`}>
          {sephirah.hebrewName}
        </TextLink>
      ),
    })
  }
  if (meanings.length > 0) {
    rows.push({ label: 'Numerology', value: meanings.join(', ') })
  }
  if (rows.length === 0) return null
  return <DefinitionList rows={rows} />
}
