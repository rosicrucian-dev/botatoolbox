import { getSephiroth, SEPHIROTH_DESCENT_SLUGS } from '@/content/data'
import { getPatternTrestleboard } from '@/content/texts/pattern-trestleboard'
import { toLocale } from '@/lib/locales'
import { progressiveTreeData } from '@/lib/tree-layout'
import {
  TrestleboardPlayClient,
  type TrestleboardSlide,
} from './TrestleboardPlayClient'

// Server shell: pairs each statement with its sephirah at build time
// (statement 1 = intro, statement 2 = Kether, …, statement 11 = Malkuth)
// and hands the slide + tree data to the client player.
export default async function TrestleboardPlayPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const locale = toLocale((await params).locale)
  const { statements } = getPatternTrestleboard(locale)
  const { sephirahBySlug } = getSephiroth(locale)
  const slides: Array<TrestleboardSlide> = statements.map((s, i) => {
    const sephIdx = i - 1
    const slug = sephIdx >= 0 ? SEPHIROTH_DESCENT_SLUGS[sephIdx] : null
    const sephirah = slug ? sephirahBySlug[slug] : null
    return {
      text: s.text,
      filledThrough: sephIdx,
      color: sephirah?.color,
    }
  })
  return (
    <TrestleboardPlayClient statements={slides} tree={progressiveTreeData()} />
  )
}
