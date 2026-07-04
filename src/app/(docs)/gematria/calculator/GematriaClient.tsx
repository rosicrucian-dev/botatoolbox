'use client'

import { Link } from 'next-view-transitions'
import { useMemo } from 'react'

import { MajorImage } from '@/components/CardImage'
import { Button } from '@/components/catalyst/button'
import { GematriaDictStatus } from '@/components/GematriaDictStatus'
import { GematriaActionKey, keypadTileClass } from '@/components/GematriaKeypad'
import { GematriaNoteSection } from '@/components/GematriaNoteSection'
import { GematriaSources } from '@/components/GematriaSources'
import { GematriaWordSection } from '@/components/GematriaWordSection'
import { PageHeading } from '@/components/PageHeading'
import { toolbarButtonSize } from '@/components/toolbarButton'
import {
  GEMATRIA_SOURCES,
  wordMatchesForSpelling,
  wordsForNumber,
} from '@/content/data'
import { ensureAudioContext } from '@/lib/audioContext'
import { cardByGlyph, valueByGlyph } from '@/lib/gematria'
import { letters } from '@/lib/hebrew'
import { useGematriaDict } from '@/lib/useGematriaDict'
import { useQueryParamState } from '@/lib/useQueryParamState'

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

// Accessible name per key glyph: "Aleph", …, "Kaph (final)". Derived from
// the letters table so a screen reader announces the letter name rather
// than the raw Hebrew codepoint.
const NAME_BY_GLYPH: Record<string, string> = {}
for (const [name, meta] of Object.entries(letters)) {
  NAME_BY_GLYPH[meta.glyph] = name
  if (meta.sofit) NAME_BY_GLYPH[meta.sofit] = `${name} (final)`
}

export function GematriaClient() {
  // The user's sequence (one glyph per char) is mirrored to ?seq=… so it
  // survives a refresh and a back-navigation from the meditation player, which
  // reads ?seq= to know what to play.
  const [seq, setSeq] = useQueryParamState(
    'seq',
    (raw) => Array.from(raw),
    (s) => s.join(''),
  )

  const total = useMemo(
    () => seq.reduce((sum, g) => sum + (valueByGlyph[g] ?? 0), 0),
    [seq],
  )
  const word = seq.join('')
  const playableCount = useMemo(
    () => seq.filter((g) => cardByGlyph[g]).length,
    [seq],
  )
  // What the dictionary holds for the running total. Paul Case's notes are
  // number-keyed (shown for the total regardless of the exact spelling); the
  // Crowley/Strong's matches are for the exact word the user built.
  const { status, dict, retry } = useGematriaDict()
  const notes = useMemo(
    () => (dict ? wordsForNumber(dict, total)?.notes : undefined),
    [dict, total],
  )
  const matches = useMemo(
    () => (dict ? wordMatchesForSpelling(dict, total, word) : {}),
    [dict, total, word],
  )
  // The sources, in registry order, that have something to show for this word.
  const sections = GEMATRIA_SOURCES.filter((s) =>
    s.kind === 'note' ? !!notes?.[s.id] : !!matches[s.id]?.length,
  )

  // Tarot cards are pinned to ⅑ width (matching Freeform's gap scheme)
  // so nine cards exactly fill the row: 9 × width + 8 × gap = 100%. Anything
  // shorter is centered; a tenth card wraps. The gap is set inline below from
  // the same constant so width and gap can't drift.
  const TAROT_GAP_PCT = 3
  const tarotWidth = `${(100 - 8 * TAROT_GAP_PCT) / 9}%`

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
      <div className="flex items-start justify-between gap-4">
        <PageHeading>Calculator</PageHeading>
        {playableCount > 0 && (
          <Button
            href={`/gematria/play?seq=${encodeURIComponent(word)}`}
            color="emerald"
            onClick={() => ensureAudioContext()}
            className={toolbarButtonSize}
          >
            Play ▶
          </Button>
        )}
      </div>

      {/* Number + Hebrew word display. 3-track grid puts the divider on
          the auto-sized middle track so it sits at the visual center;
          the two 1fr tracks give number and word equal halves. */}
      <div
        // Announce the running total + word to screen readers as keys are
        // pressed — the keypad gives no other non-visual feedback.
        aria-live="polite"
        className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-6 rounded-2xl bg-zinc-50 px-6 py-6 ring-1 ring-zinc-900/5 md:gap-10 md:py-8 dark:bg-zinc-800/40 dark:ring-white/10"
      >
        <div className="text-center text-4xl font-medium text-zinc-900 tabular-nums md:text-6xl dark:text-white">
          {/* The total links into the dictionary for that value. Capped at
              4 digits — the dictionary's own input ceiling — so the linked
              number isn't silently truncated there. */}
          {total > 0 && total <= 9999 ? (
            <Link
              href={`/gematria/dictionary?n=${total}`}
              className="underline-offset-4 transition hover:underline"
            >
              {total}
            </Link>
          ) : (
            total
          )}
        </div>
        <div className="h-12 w-px bg-zinc-300 md:h-16 dark:bg-zinc-600" />
        <div
          dir="rtl"
          lang="he"
          className="text-center font-serif text-4xl wrap-anywhere text-zinc-900 md:text-6xl dark:text-white"
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
          <Key glyph={ROW_TOP[0]} onPress={press} className="col-start-4" />
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
        <GematriaActionKey onClick={() => press(' ')}>Space</GematriaActionKey>
        <GematriaActionKey onClick={backspace}>Backspace</GematriaActionKey>
        <GematriaActionKey onClick={clear}>Clear</GematriaActionKey>
      </div>

      {/* Tarot row — flows right-to-left to match Hebrew reading order.
          flex-wrap lets long words spill onto a second / third row. When
          empty, shows a centered prompt instead. */}
      <div
        dir={seq.length === 0 ? 'ltr' : 'rtl'}
        style={{ columnGap: `${TAROT_GAP_PCT}%` }}
        className={`flex flex-wrap justify-center gap-y-2 md:gap-y-4 ${
          seq.length === 0 ? 'min-h-20 items-center md:min-h-32' : 'items-end'
        }`}
      >
        {seq.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Use the keyboard above to build a word.
          </p>
        ) : (
          seq.map((glyph, i) => {
            const card = cardByGlyph[glyph]
            if (!card) return null
            return (
              <Link
                key={i}
                href={`/tarot/${card.slug}`}
                style={{ width: tarotWidth }}
                className="block transition hover:opacity-80"
              >
                <MajorImage
                  card={card}
                  alt={card.name}
                  width={724}
                  height={1200}
                  loading="lazy"
                  className="h-auto w-full shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-700"
                />
              </Link>
            )
          })
        )}
      </div>

      {/* Dictionary pending/error state — only shown once there's a word to
          look up, and mirrored with the dictionary page so the two tools
          present the same states (previously a failed fetch rendered
          nothing at all here). */}
      {total > 0 && status !== 'ready' && (
        <div className="border-t border-zinc-200 pt-4 dark:border-zinc-800">
          <GematriaDictStatus status={status} retry={retry} />
        </div>
      )}

      {/* Each source's take on the built word, in registry order: Paul Case's
          number-keyed notes first, then the matching Crowley / Strong's word. */}
      {sections.length > 0 && (
        <>
          <div className="space-y-6 border-t border-zinc-200 pt-4 dark:border-zinc-800">
            {sections.map((source) =>
              source.kind === 'note' ? (
                <GematriaNoteSection
                  key={source.id}
                  label={source.label}
                  text={notes![source.id]!}
                  number={total}
                />
              ) : (
                <GematriaWordSection
                  key={source.id}
                  label={source.label}
                  words={matches[source.id]!}
                  number={total}
                />
              ),
            )}
          </div>
          <GematriaSources />
        </>
      )}
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
      aria-label={NAME_BY_GLYPH[glyph] ?? glyph}
      className={`aspect-square ${keypadTileClass} ${className}`}
    >
      <span
        aria-hidden
        dir="rtl"
        lang="he"
        className="font-serif text-xl text-zinc-900 md:text-3xl dark:text-white"
      >
        {glyph}
      </span>
    </button>
  )
}
