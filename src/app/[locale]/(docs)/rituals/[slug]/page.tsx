import { Link } from '@/components/LocaleLink'
import { type Metadata } from 'next'
import { notFound } from 'next/navigation'

import { SetBreadcrumbs } from '@/components/Breadcrumbs'
import { IndexLabel } from '@/components/IndexLabel'
import { PageHeading } from '@/components/PageHeading'
import { PlayLink } from '@/components/PlayLink'
import { getRituals } from '@/content/data'
import { parseRitual, type Instruction } from '@/content/data/rituals'
import { readLocalizedMarkdown } from '@/content/markdown'
import { DEFAULT_LOCALE, toLocale, type Locale } from '@/lib/locales'

// Structural (slug) enumeration — English source on purpose.
const { rituals } = getRituals(DEFAULT_LOCALE)

// Generic renderer for the rituals. A new ritual is a content/rituals/<slug>.md
// file plus one line in content/data/rituals.json — no code. A guided
// player (hasPlayer) stays a bespoke per-ritual route.

export function generateStaticParams() {
  return rituals.map((r) => ({ slug: r.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params
  const { ritualBySlug } = getRituals(toLocale(rawLocale))
  return { title: ritualBySlug[slug]?.title ?? 'Ritual' }
}

// Read + parse the markdown at build time (static export). Read from disk
// by slug so adding a ritual needs no per-file import; a missing
// translation falls back to the English file (readLocalizedMarkdown).
function ritualSections(locale: Locale, slug: string) {
  let md: string
  try {
    md = readLocalizedMarkdown('rituals', locale, slug)
  } catch {
    throw new Error(
      `rituals.json lists "${slug}" but content/rituals/en/${slug}.md is missing`,
    )
  }
  return parseRitual(md)
}

// Render an instruction as a sequence of plain-text segments and word-
// of-power links, derived directly from the Markdown source. The link
// target uses `ref`; the visible text uses `display`.
function RenderInstruction({ instruction }: { instruction: Instruction }) {
  return (
    <p className="leading-relaxed">
      {instruction.map((seg, i) =>
        typeof seg === 'string' ? (
          <span key={i}>{seg}</span>
        ) : (
          <Link
            key={i}
            href={`/practice/words-of-power/${seg.ref}`}
            className="font-medium text-zinc-900 underline decoration-zinc-300 underline-offset-2 transition hover:decoration-zinc-700 dark:text-zinc-100 dark:decoration-zinc-700 dark:hover:decoration-zinc-300"
          >
            {seg.display}
          </Link>
        ),
      )}
    </p>
  )
}

function Step({ n, children }: { n: string; children: React.ReactNode }) {
  return (
    <li className="flex items-baseline gap-3">
      <IndexLabel>{n}</IndexLabel>
      {children}
    </li>
  )
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-lg font-semibold tracking-tight text-zinc-700 dark:text-zinc-300">
      {children}
    </h2>
  )
}

export default async function RitualPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale: rawLocale, slug } = await params
  const locale = toLocale(rawLocale)
  const ritual = getRituals(locale).ritualBySlug[slug]
  if (!ritual) notFound()

  const sections = ritualSections(locale, slug)
  return (
    <article className="space-y-6">
      <SetBreadcrumbs items={[{ label: ritual.title }]} />
      <div className="flex items-start justify-between gap-4">
        <div>
          <PageHeading truncate>{ritual.title}</PageHeading>
          {ritual.musicFileSlug && (
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              See the{' '}
              <Link
                href={`/files/${ritual.musicFileSlug}`}
                className="font-medium text-zinc-700 underline decoration-zinc-300 underline-offset-2 transition hover:decoration-zinc-700 dark:text-zinc-300 dark:decoration-zinc-700 dark:hover:decoration-zinc-300"
              >
                music sheet
              </Link>{' '}
              for reference.
            </p>
          )}
        </div>
        {ritual.hasPlayer && (
          <PlayLink href={`/rituals/${slug}/play`}>Start ▶</PlayLink>
        )}
      </div>

      <div className="space-y-8 text-zinc-700 dark:text-zinc-400">
        {sections.map((section, i) => (
          <section key={i}>
            <SectionHeading>{section.title}</SectionHeading>
            <ol className="mt-3 max-w-prose space-y-3">
              {section.lines.map((line, j) => (
                <Step key={j} n={line.label}>
                  <RenderInstruction instruction={line.instruction} />
                </Step>
              ))}
            </ol>
          </section>
        ))}
      </div>
    </article>
  )
}
