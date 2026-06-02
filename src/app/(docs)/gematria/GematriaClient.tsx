'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

import { cardImage } from '@/content/data/tarot'
import { ensureAudioContext } from '@/lib/audioContext'
import { cardByGlyph, valueByGlyph } from '@/lib/gematria'

// Keyboard layout — visual order matches the BOTA gematria calculator.
// Aleph alone on top; three rows of seven; the five sofit (final) forms
// centered on the bottom row.
const ROW_TOP = ['א']
const ROW_MAIN: Array<Array<string>> = [
  ['ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח'],
  ['ט', 'י', 'כ', 'ל', 'מ', 'נ', 'ס'],
  ['ע', 'פ', 'צ', 'ק', 'ר', 'ש', 'ת'],
]
const ROW_SOFITS = ['ך', 'ם', 'ן', 'ף', 'ץ']

export function GematriaClient() {
  const router = useRouter()
  const sp = useSearchParams()

  // The user's sequence is mirrored to ?seq=... so it survives a refresh
  // and a back-navigation from the meditation player. URL is the single
  // source of truth; useState seeds from it on mount.
  const initialSeq = sp.get('seq') ?? ''
  const [seq, setSeq] = useState<Array<string>>(() => Array.from(initialSeq))

  // Push every state change back to the URL via replace (no history
  // entry per keypress). Player navigation can then read ?seq= to know
  // what to play.
  useEffect(() => {
    const next = seq.join('')
    const current = sp.get('seq') ?? ''
    if (next === current) return
    const params = new URLSearchParams(sp.toString())
    if (next) params.set('seq', next)
    else params.delete('seq')
    const qs = params.toString()
    router.replace(qs ? `?${qs}` : '?', { scroll: false })
  }, [seq, router, sp])

  const total = useMemo(
    () => seq.reduce((sum, g) => sum + (valueByGlyph[g] ?? 0), 0),
    [seq],
  )
  const word = seq.join('')
  const playableCount = useMemo(
    () => seq.filter((g) => cardByGlyph[g]).length,
    [seq],
  )

  function press(glyph: string) {
    setSeq((s) => [...s, glyph])
  }
  function backspace() {
    setSeq((s) => s.slice(0, -1))
  }
  function clear() {
    setSeq([])
  }

  return (
    <article className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold tracking-tight dark:text-white">
          Gematria
        </h1>
        {playableCount > 0 && (
          <Link
            href={`/gematria/play?seq=${encodeURIComponent(word)}`}
            onClick={() => ensureAudioContext()}
            className="inline-flex h-9 shrink-0 items-center justify-center rounded-md bg-emerald-500 px-3 text-sm font-medium whitespace-nowrap text-white transition hover:bg-emerald-400"
          >
            Play ▶
          </Link>
        )}
      </div>

      {/* Tarot row — flows right-to-left to match Hebrew reading order.
          flex-wrap lets long words spill onto a second / third row. When
          empty, shows a centered prompt instead. */}
      <div
        dir={seq.length === 0 ? 'ltr' : 'rtl'}
        className={`flex min-h-20 flex-wrap justify-center gap-1.5 md:min-h-32 md:gap-2 ${
          seq.length === 0 ? 'items-center' : 'items-end'
        }`}
      >
        {seq.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Use the keyboard below to build a word.
          </p>
        ) : (
          seq.map((glyph, i) => {
            const card = cardByGlyph[glyph]
            if (!card) return null
            return (
              <Link
                key={i}
                href={`/tarot/${card.slug}`}
                className="block transition hover:opacity-80"
              >
                <img
                  src={cardImage(card)}
                  alt={card.name}
                  width={724}
                  height={1200}
                  loading="lazy"
                  className="h-16 w-auto rounded-sm shadow-sm ring-1 ring-zinc-200 md:h-28 dark:ring-zinc-700"
                />
              </Link>
            )
          })
        )}
      </div>

      {/* Number + Hebrew word display. 3-track grid puts the divider on
          the auto-sized middle track so it sits at the visual center;
          the two 1fr tracks give number and word equal halves. */}
      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-6 rounded-2xl bg-zinc-50 px-6 py-6 ring-1 ring-zinc-900/5 md:gap-10 md:py-8 dark:bg-zinc-800/40 dark:ring-white/10">
        <div className="justify-self-end text-4xl font-medium tabular-nums text-zinc-900 md:text-6xl dark:text-white">
          {total}
        </div>
        <div className="h-12 w-px bg-zinc-300 md:h-16 dark:bg-zinc-600" />
        <div
          dir="rtl"
          lang="he"
          className="font-serif text-4xl text-zinc-900 wrap-anywhere md:text-6xl dark:text-white"
        >
          {word || ' '}
        </div>
      </div>

      {/* Hebrew keyboard. */}
      <div className="space-y-1.5 md:space-y-2">
        {/* Row 0 — Aleph centered (col 4 of 7). col-start-4 goes on the
            Key itself so it's a direct grid child and sizes the same as
            keys in the rows below. */}
        <div className="grid grid-cols-7 gap-1.5 md:gap-2">
          <Key
            glyph={ROW_TOP[0]}
            onPress={press}
            className="col-start-4"
          />
        </div>

        {/* Rows 1–3: seven keys each. */}
        {ROW_MAIN.map((row, i) => (
          <div key={i} className="grid grid-cols-7 gap-1.5 md:gap-2">
            {row.map((g) => (
              <Key key={g} glyph={g} onPress={press} />
            ))}
          </div>
        ))}

        {/* Sofits — five keys centered (cols 2–6 of 7). */}
        <div className="grid grid-cols-7 gap-1.5 md:gap-2">
          <div className="col-span-5 col-start-2 grid grid-cols-5 gap-1.5 md:gap-2">
            {ROW_SOFITS.map((g) => (
              <Key key={g} glyph={g} onPress={press} />
            ))}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex justify-between gap-2">
        <ActionKey onClick={() => press(' ')}>Space</ActionKey>
        <ActionKey onClick={backspace}>Backspace</ActionKey>
        <ActionKey onClick={clear}>Clear</ActionKey>
      </div>
    </article>
  )
}

function Key({
  glyph,
  onPress,
  className = '',
}: {
  glyph: string
  onPress: (g: string) => void
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={() => onPress(glyph)}
      className={`flex aspect-square items-center justify-center rounded-md bg-zinc-100 ring-1 ring-zinc-900/5 transition hover:bg-zinc-200 active:bg-zinc-300 dark:bg-zinc-800 dark:ring-white/10 dark:hover:bg-zinc-700 dark:active:bg-zinc-600 ${className}`}
    >
      <span
        dir="rtl"
        lang="he"
        className="font-serif text-xl text-zinc-900 md:text-3xl dark:text-white"
      >
        {glyph}
      </span>
    </button>
  )
}

function ActionKey({
  children,
  onClick,
}: {
  children: React.ReactNode
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-md bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 ring-1 ring-zinc-900/5 transition hover:bg-zinc-200 active:bg-zinc-300 md:text-base dark:bg-zinc-800 dark:text-white dark:ring-white/10 dark:hover:bg-zinc-700 dark:active:bg-zinc-600"
    >
      {children}
    </button>
  )
}
