'use client'

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'

import { words } from '@/content/data'
import {
  expandWord,
  formatPronunciation,
  type ExpandedWord,
} from '@/lib/hebrew'
import { useToneOnIdx } from '@/lib/useToneOnIdx'
import { useAutoAdvance } from '@/lib/useAutoAdvance'
import { SlidePlayer } from '@/components/SlidePlayer'
import { SoundButton } from '@/components/SoundButton'
import { CHANT_BEAT_SECONDS } from '@/lib/chant'
import { getColor, textColorFor, type ThemeId } from '@/lib/colors'
import { useColorTheme } from '@/lib/colorTheme'
import { usePlayerIndex } from '@/lib/usePlayerIndex'
import { sections } from '@/content/rituals/lrp'

const expandedBySlug: Record<string, ExpandedWord> = Object.fromEntries(
  words.map((w) => [w.slug, expandWord(w)]),
)

interface LRPSlide {
  section: string
  instruction: string
  glyph: string | null
  pronunciation: string | null
  note?: string
  color?: string
  bgColor?: string | null
  textColor?: string | null
  autoAdvance: boolean
  wordIds?: Array<string>
}

function lineToSlides(
  line: { text: string; wordIds: ReadonlyArray<string> },
  section: string,
): Array<LRPSlide> {
  const setup: LRPSlide = {
    section,
    instruction: line.text,
    glyph: null,
    pronunciation: null,
    note: undefined,
    autoAdvance: false,
    wordIds: [...line.wordIds],
  }
  if (line.wordIds.length === 0) return [setup]

  const out: Array<LRPSlide> = [setup]
  for (const wid of line.wordIds) {
    const word = expandedBySlug[wid]
    if (!word) continue
    for (const l of word.letters) {
      out.push({
        section,
        instruction: line.text,
        glyph: l.glyph,
        pronunciation: l.pronunciation,
        note: l.note,
        color: l.color,
        autoAdvance: true,
      })
    }
  }
  return out
}

const slideTemplate: Array<LRPSlide> = sections.flatMap((section) =>
  section.lines.flatMap((line) => lineToSlides(line, section.title)),
)

function buildSlides(theme: ThemeId): Array<LRPSlide> {
  return slideTemplate.map((s) => ({
    ...s,
    bgColor: s.color ? getColor(s.color, theme) : null,
    textColor: textColorFor(s.color),
  }))
}

export default function LesserPentagramPlayPage() {
  const router = useRouter()

  const { colorTheme: theme } = useColorTheme()
  const slides = useMemo(() => buildSlides(theme), [theme])
  const { idx, setIdx, handleIdxChange } = usePlayerIndex({
    slidesLength: slides.length,
  })
  const current = slides[idx]

  const { playCurrent } = useToneOnIdx({
    note: current?.note,
    idx,
    autoplay: true,
  })

  useAutoAdvance({
    duration: CHANT_BEAT_SECONDS,
    idx,
    enabled: !!current?.autoAdvance,
    onAdvance: () => {
      if (idx < slides.length - 1) {
        setIdx(idx + 1)
      } else {
        router.push('/rituals/lrp')
      }
    },
  })

  return (
    <SlidePlayer
      title="The Lesser Ritual of the Pentagram"
      slides={slides}
      idx={idx}
      onIdxChange={handleIdxChange}
      onClose={() => router.push('/rituals/lrp')}
      extraHeaderItem={
        current?.note && !current?.autoAdvance ? (
          <SoundButton onClick={playCurrent} />
        ) : null
      }
      renderLeft={(slide) => (
        <div className="max-w-md space-y-3">
          <div className="text-xs font-medium tracking-wider uppercase opacity-70">
            {slide.section}
          </div>
          <div className="text-xl leading-relaxed md:text-2xl">
            {slide.instruction}
          </div>
          <div
            className={`pt-2 text-sm italic ${slide.autoAdvance ? 'invisible' : 'opacity-60'}`}
            aria-hidden={slide.autoAdvance}
          >
            Inhale, then{' '}
            <span className="pointer-coarse:hidden">click</span>
            <span className="hidden pointer-coarse:inline">tap</span> to
            continue
          </div>
        </div>
      )}
      renderRight={(slide) => {
        if (slide.glyph) {
          return (
            <div className="text-center">
              <div
                className="font-serif text-[min(20vh,50vw)] leading-none md:text-[min(30vh,60vw)]"
                dir="rtl"
                lang="he"
              >
                {slide.glyph}
              </div>
              {slide.pronunciation && (
                <div className="mt-4 text-3xl leading-tight font-medium md:text-5xl">
                  {slide.pronunciation}
                </div>
              )}
            </div>
          )
        }
        if (slide.wordIds && slide.wordIds.length > 0) {
          return (
            <div className="space-y-6 text-center">
              {slide.wordIds.map((wid) => {
                const word = expandedBySlug[wid]
                if (!word) return null
                const hebrew = word.letters.map((l) => l.glyph).join('')
                const pron = formatPronunciation(
                  word.letters,
                  word.wordSizes,
                )
                return (
                  <div key={wid}>
                    <div
                      className="font-serif text-[clamp(2rem,8vh,4rem)] leading-none md:text-[clamp(2.5rem,10vh,6rem)]"
                      dir="rtl"
                      lang="he"
                    >
                      {hebrew}
                    </div>
                    <div className="mt-3 text-xl font-medium md:text-2xl">
                      {pron}
                    </div>
                  </div>
                )
              })}
            </div>
          )
        }
        return null
      }}
    />
  )
}
