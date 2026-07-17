import { SetBreadcrumbs } from '@/components/Breadcrumbs'
import { IndexLabel } from '@/components/IndexLabel'
import { PageHeading } from '@/components/PageHeading'
import { PlayLink } from '@/components/PlayLink'
import { getPatternTrestleboard } from '@/content/texts/pattern-trestleboard'
import { toLocale } from '@/lib/locales'
import { localizedTitle } from '@/lib/nav'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const locale = toLocale((await params).locale)
  return {
    title: localizedTitle(locale, 'The Pattern on the Trestleboard'),
  }
}

export default async function Trestleboard({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale: rawLocale } = await params
  const { statements } = getPatternTrestleboard(toLocale(rawLocale))
  return (
    <article className="space-y-6">
      <SetBreadcrumbs items={[{ label: 'The Pattern on the Trestleboard' }]} />
      <div className="flex items-start justify-between gap-4">
        <PageHeading truncate>The Pattern on the Trestleboard</PageHeading>
        <PlayLink href="/texts/pattern-trestleboard/play">
          Start Pattern ▶
        </PlayLink>
      </div>
      <ol>
        {statements.map((s, i) => (
          <li key={i}>
            <PlayLink
              href={`/texts/pattern-trestleboard/play?idx=${i}`}
              className="-mx-2 flex items-baseline gap-3 rounded-sm px-2 py-3 transition hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
            >
              <IndexLabel>{s.label}</IndexLabel>
              <p className="max-w-prose leading-relaxed text-zinc-700 dark:text-zinc-400">
                {s.text}
              </p>
            </PlayLink>
          </li>
        ))}
      </ol>
    </article>
  )
}
