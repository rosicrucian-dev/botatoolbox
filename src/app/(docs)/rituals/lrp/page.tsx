import Link from 'next/link'
import { type Metadata } from 'next'

import { IndexLabel } from '@/components/IndexLabel'
import { PlayLink } from '@/components/PlayLink'
import {
  sections,
  type Instruction,
} from '@/content/rituals/lrp'

export const metadata: Metadata = {
  title: 'The Lesser Ritual of the Pentagram',
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
            href={`/words-of-power/${seg.ref}`}
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

export default function LesserPentagram() {
  return (
    <article className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold tracking-tight dark:text-white">
          The Lesser Ritual of the Pentagram
        </h1>
        <PlayLink href="/rituals/lrp/play">Start LRP ▶</PlayLink>
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
