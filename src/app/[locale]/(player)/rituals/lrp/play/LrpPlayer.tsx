'use client'

import { useLocaleRouter } from '@/components/LocaleLink'
import { useMemo } from 'react'

import { useLocale } from '@/components/LocaleProvider'
import { SlidePlayer } from '@/components/SlidePlayer'
import { SoundButton } from '@/components/SoundButton'
import type { RitualSection } from '@/content/data/rituals'
import { tDyn } from '@/content/messages'
import { useT } from '@/content/messages/useT'
import { CHANT_BEAT_SECONDS } from '@/lib/chant'
import { formatPronunciation, type ExpandedWord } from '@/lib/hebrew'
import { type Locale } from '@/lib/locales'
import { useAutoAdvance } from '@/lib/useAutoAdvance'
import { usePlayerIndex } from '@/lib/usePlayerIndex'
import { useToneOnIdx } from '@/lib/useToneOnIdx'

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
  // Visualization cue tied to the archangel being intoned — persists on
  // the setup slide AND across every syllable slide of that name.
  visualization?: string
}

// Visualization text shown beneath the instruction whenever an
// archangel's name is being intoned. Keyed by the word-of-power slug
// used in lrp.md.
// English source; localized at the lookup site via tDyn
// ('player.lrp.vision.<slug>' keys in the message catalog).
const ANGEL_VISUALIZATION: Record<string, string> = {
  rpal: 'Raphael is robed in yellow, hair moving in the wind—a sensation of a cooling breeze from the East. Bathe your aura with a yellow breeze.',
  gbrial:
    'Gabriel is robed in blue, with a stream or sea at its feet. Bathe your aura in a blue, purifying sea of compassion.',
  mikal:
    'Michael is robed in red, standing on parched Earth or desert. Radiates heat. Bathe your aura in a red consecratine fire and glow with the fire of life.',
  avrial:
    'Auriel is robed in citrine, olive, russet and black (an overall impression is a dark robe). Stands in a rich wheat-field. Bathe your aura with the colors and love of Nature.',
}

// Background color for the archangel's setup slide — element
// associations from the Watchtowers. Auriel uses Malkuth's mixed
// citrine/olive/russet/black ("malkuth" palette key) which matches the
// Pattern on the Trestleboard final-statement slide.
const ANGEL_COLOR: Record<string, string> = {
  rpal: 'yellow',
  gbrial: 'blue',
  mikal: 'red',
  avrial: 'malkuth',
}

function lineToSlides(
  line: { text: string; wordIds: ReadonlyArray<string> },
  section: string,
  expandedBySlug: Record<string, ExpandedWord>,
  locale: Locale,
): Array<LRPSlide> {
  // If any of the line's word-ids matches an archangel, carry that
  // visualization through the setup slide and every syllable; also tint
  // the setup slide with the archangel's element color.
  const angelId = line.wordIds.find((id) => id in ANGEL_VISUALIZATION)
  const visualization = angelId
    ? tDyn(locale, `player.lrp.vision.${angelId}`, ANGEL_VISUALIZATION[angelId])
    : undefined
  const setupColor = angelId ? ANGEL_COLOR[angelId] : undefined

  const setup: LRPSlide = {
    section,
    instruction: line.text,
    glyph: null,
    pronunciation: null,
    note: undefined,
    autoAdvance: false,
    wordIds: [...line.wordIds],
    visualization,
    color: setupColor,
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
        visualization,
      })
    }
  }
  return out
}

function buildSlides(
  sections: ReadonlyArray<RitualSection>,
  expandedBySlug: Record<string, ExpandedWord>,
  locale: Locale,
): Array<LRPSlide> {
  // The LRP stays on the default background throughout — unlike other
  // players, we deliberately don't tint the shell per-slide. The `color`
  // field is still carried for any glyph/text styling, but bgColor/textColor
  // are left null so SlidePlayer uses its default background classes.
  return sections.flatMap((section) =>
    section.lines.flatMap((line) =>
      lineToSlides(line, section.title, expandedBySlug, locale),
    ),
  )
}

export function LrpPlayer({
  sections,
  expandedBySlug,
}: {
  sections: ReadonlyArray<RitualSection>
  // Word breakdowns (glyphs, pronunciations, tones), pre-expanded by the
  // server page from the locale's words dataset so translated
  // pronunciations render without bundling the data client-side.
  expandedBySlug: Record<string, ExpandedWord>
}) {
  const router = useLocaleRouter()
  const locale = useLocale()
  const { t } = useT()

  const slides = useMemo(
    () => buildSlides(sections, expandedBySlug, locale),
    [sections, expandedBySlug, locale],
  )
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
      title={t('player.lrp.title')}
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
          {slide.visualization && (
            <div className="pt-2 text-sm leading-relaxed opacity-60">
              {slide.visualization}
            </div>
          )}
          <div
            className={`pt-2 text-sm italic ${slide.autoAdvance ? 'invisible' : 'opacity-60'}`}
            aria-hidden={slide.autoAdvance}
          >
            <span className="pointer-coarse:hidden">
              {t('player.lrp.inhaleClick')}
            </span>
            <span className="hidden pointer-coarse:inline">
              {t('player.lrp.inhaleTap')}
            </span>
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
                const pron = formatPronunciation(word.letters, word.wordSizes)
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
