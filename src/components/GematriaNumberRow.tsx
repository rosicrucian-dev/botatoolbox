'use client'

import { useState } from 'react'

// Above this many characters the text collapses behind a "Show more" toggle.
// Short notes (Crowley's significance, Occult Fundamentals) show in full; the
// Gematria Notebook blocks can run to pages, so they start clamped.
const COLLAPSE_OVER = 500

// A number-keyed definition row: just the source's prose for this number. The
// number it describes is carried by the "Number N" sub-section heading above,
// so the row itself has no right-hand glyph. Used for Paul Case notes and
// Crowley's per-number significance.
export function GematriaNumberRow({
  text,
  collapsible = false,
}: {
  text: string
  collapsible?: boolean
}) {
  const long = collapsible && text.length > COLLAPSE_OVER
  const [expanded, setExpanded] = useState(false)
  const collapsed = long && !expanded
  return (
    <li className="py-4">
      <p
        className={`text-sm leading-relaxed whitespace-pre-line text-zinc-700 dark:text-zinc-300 ${
          collapsed ? 'line-clamp-6' : ''
        }`}
      >
        {text}
      </p>
      {long && (
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="mt-1.5 text-xs font-medium text-zinc-500 underline-offset-2 transition hover:text-zinc-700 hover:underline dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          {expanded ? 'Show less' : 'Show more'}
        </button>
      )}
    </li>
  )
}
