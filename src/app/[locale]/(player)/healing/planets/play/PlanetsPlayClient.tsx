'use client'

import { useLocaleRouter } from '@/components/LocaleLink'
import { useT } from '@/content/messages/useT'
import { useSearchParams } from 'next/navigation'
import { useMemo, useState } from 'react'

import { MajorImage } from '@/components/CardImage'
import { SlidePlayer } from '@/components/SlidePlayer'
import { SoundButton } from '@/components/SoundButton'
import { ensureAudioContext } from '@/lib/audioContext'
import { useColorPalette } from '@/lib/colorPalette'
import { getColor, textColorFor, type ColorPaletteId } from '@/lib/colors'
import { useAutoAdvance } from '@/lib/useAutoAdvance'
import { useToneOnIdx } from '@/lib/useToneOnIdx'

// One planet's slide data, prepared by the server page (planet +
// tarot-card join done there so the datasets stay out of the bundle).
// Healing meditation only covers the 7 classical planets — the modern
// triples (Uranus/Neptune/Pluto) have no chakra attribution.
export interface PlanetSlideData {
  label: string
  chakra?: string
  glyph: string
  note?: string
  color?: string
  cardNum?: number
  cardSlug?: string
  cardName?: string
  isSetup: false
}

// 4 full box-breath cycles (16s each = 4s inhale + 4s hold + 4s exhale +
// 4s hold). The breathing dot's CSS animation has the same period so the
// last cycle ends exactly when the countdown advances to the IAO phase.
const STOP_DURATION = 64
// Play the planet's tone at two points:
//   - START: when the breath countdown begins (handled by useToneOnIdx's
//     `autoplay`, which fires on idx change).
//   - IAO:   when the breath countdown ends and the IAO chant phase begins
//     (handled by onAdvance below — calls playCurrent() before setPhase).
const TONE_AT_START = true
const TONE_AT_IAO = true

function buildSlides(
  planetData: ReadonlyArray<PlanetSlideData>,
  theme: ColorPaletteId,
  withTimer: boolean,
) {
  const expanded = planetData.map((p) => ({
    ...p,
    bgColor: getColor(p.color, theme),
    textColor: textColorFor(p.color),
  }))
  if (!withTimer) return expanded
  const setup = {
    isSetup: true as const,
    label: null,
    chakra: null,
    glyph: null,
    note: undefined,
    color: undefined,
    cardNum: undefined,
    cardSlug: undefined,
    cardName: undefined,
    bgColor: undefined,
    textColor: undefined,
  }
  return [setup, ...expanded]
}

// Unlike the other players this manages idx by hand instead of via
// usePlayerIndex: handleIdxChange must reset the breath-phase state
// synchronously in the same update as idx (see comment below), which the
// shared hook's fixed handler can't express.
export function PlanetsPlayClient({
  planets,
}: {
  planets: ReadonlyArray<PlanetSlideData>
}) {
  const { t } = useT()
  const router = useLocaleRouter()
  const searchParams = useSearchParams()
  const idxParam = Number(searchParams.get('idx') ?? '0')
  const withTimer = idxParam === 0
  const { colorPalette: theme } = useColorPalette()
  const slides = useMemo(
    () => buildSlides(planets, theme, withTimer),
    [planets, theme, withTimer],
  )
  const startIdx = withTimer ? 0 : Math.max(0, idxParam - 1)

  const [idx, setIdx] = useState(startIdx)
  const current = slides[idx]
  const [phase, setPhase] = useState(withTimer ? 'countdown' : 'iao')

  // Phase is fully driven by two events plus the initial state above:
  // handleIdxChange resets it to 'countdown' when moving to a timed slide,
  // and useAutoAdvance's onAdvance flips it to 'iao' when the countdown
  // ends. (A prior effect also reset phase on every idx/slides change, but
  // handleIdxChange already covers idx, and reacting to the slides identity
  // meant a theme change mid-'iao' would silently restart the countdown.)

  // Reset phase synchronously alongside idx so the new slide renders
  // immediately in countdown phase. Without this, a stale 'iao' phase
  // briefly leaks into the new slide's first render — letting the user
  // click through the breath dot they never actually saw.
  function handleIdxChange(newIdx: number) {
    ensureAudioContext()
    if (withTimer && !slides[newIdx]?.isSetup) {
      setPhase('countdown')
    }
    setIdx(newIdx)
  }

  const { playCurrent } = useToneOnIdx({
    note: current?.note,
    idx,
    autoplay: TONE_AT_START && withTimer && !current?.isSetup,
  })

  useAutoAdvance({
    duration: STOP_DURATION,
    idx,
    enabled: withTimer && phase === 'countdown' && !current?.isSetup,
    onAdvance: () => {
      if (TONE_AT_IAO) playCurrent()
      setPhase('iao')
    },
  })

  return (
    <SlidePlayer
      title={t('player.healing.planetsTitle')}
      slides={slides}
      idx={idx}
      onIdxChange={handleIdxChange}
      onClose={() => router.push('/healing/planets')}
      extraHeaderItem={
        current?.note ? <SoundButton onClick={playCurrent} /> : null
      }
      renderLeft={(slide) => {
        if (slide.isSetup) {
          return (
            <div className="max-w-md space-y-3">
              <div className="text-xl leading-relaxed md:text-2xl">
                {t('player.healing.setup')}
              </div>
              <div className="pt-2 text-sm italic opacity-60">
                <span className="pointer-coarse:hidden">
                  {t('player.common.clickToContinue')}
                </span>
                <span className="hidden pointer-coarse:inline">
                  {t('player.common.tapToContinue')}
                </span>
              </div>
            </div>
          )
        }
        return slide.cardSlug ? (
          <MajorImage
            card={{ num: slide.cardNum!, slug: slide.cardSlug }}
            alt={slide.cardName}
            className="max-h-[33svh] max-w-full object-contain md:max-h-[50vh] md:max-w-[280px]"
          />
        ) : null
      }}
      renderRight={(slide) => {
        if (slide.isSetup) return null
        return (
          <div className="text-center">
            {phase === 'countdown' ? (
              <div
                // `key={idx}` forces React to remount this div on every
                // slide change, which restarts the CSS animation timeline
                // at 0% (the fully-exhaled state) instead of continuing
                // mid-cycle from the previous slide.
                key={idx}
                aria-label={t('player.healing.meditate')}
                className="size-32 animate-breathe rounded-full bg-current md:size-48"
              />
            ) : (
              <>
                <div className="font-serif text-[min(10vh,28vw)] leading-none font-semibold md:text-[min(20vh,40vw)]">
                  IAO
                </div>
                {slide.chakra && (
                  <>
                    <div className="mt-4 text-lg font-medium md:text-xl">
                      {slide.chakra}
                    </div>
                    <div className="mt-6 text-sm italic opacity-70 md:text-base">
                      {withTimer ? (
                        <>
                          <span className="pointer-coarse:hidden">
                            {t('player.healing.intoneThenClick')}
                          </span>
                          <span className="hidden pointer-coarse:inline">
                            {t('player.healing.intoneThenTap')}
                          </span>
                        </>
                      ) : (
                        t('player.healing.intone')
                      )}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        )
      }}
    />
  )
}
