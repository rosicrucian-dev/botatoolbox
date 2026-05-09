'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import { useMemo } from 'react'

import { planets } from '@/content/data'
import { cardByLetter, cardImage } from '@/content/data/tarot'
import { getLetterMeta } from '@/lib/hebrew'
import { ensureAudioContext } from '@/lib/audioContext'
import { useToneOnIdx } from '@/lib/useToneOnIdx'
import { useAutoAdvance } from '@/lib/useAutoAdvance'
import { SlidePlayer } from '@/components/SlidePlayer'
import { SoundButton } from '@/components/SoundButton'
import { getColor, textColorFor, type ThemeId } from '@/lib/colors'
import { useColorTheme } from '@/lib/colorTheme'

// Healing meditation only covers the 7 classical planets — the modern
// triples (Uranus/Neptune/Pluto) have no chakra attribution.
const healingPlanets = planets.filter((p) => p.chakra)

// Module-level: data + color *names*, no hex. Resolved per-scale below.
const planetData = healingPlanets.map((p) => {
  const meta = getLetterMeta(p.letter)
  const card = cardByLetter[p.letter]
  return {
    label: p.name,
    chakra: p.chakra,
    glyph: meta.glyph,
    note: card?.note,
    color: card?.color,
    cardImage: card ? cardImage(card) : undefined,
    cardName: card?.name,
    isSetup: false as const,
  }
})

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

function buildSlides(theme: ThemeId, withTimer: boolean) {
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
    cardImage: undefined,
    cardName: undefined,
    bgColor: undefined,
    textColor: undefined,
  }
  return [setup, ...expanded]
}

export default function PlanetsPlayPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const idxParam = Number(searchParams.get('idx') ?? '0')
  const withTimer = idxParam === 0
  const { colorTheme: theme } = useColorTheme()
  const slides = useMemo(
    () => buildSlides(theme, withTimer),
    [theme, withTimer],
  )
  const startIdx = withTimer ? 0 : Math.max(0, idxParam - 1)

  const [idx, setIdx] = useState(startIdx)
  const current = slides[idx]
  const [phase, setPhase] = useState(withTimer ? 'countdown' : 'iao')

  useEffect(() => {
    if (slides[idx]?.isSetup) return
    setPhase(withTimer ? 'countdown' : 'iao')
  }, [idx, withTimer, slides])

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
      title="Planets"
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
                For each planet, meditate on the card and color for one minute. If you like, breathe with the circle to follow a four-fold breathe cycle. You will then be asked to intone the mantra IAO three times.
              </div>
              <div className="pt-2 text-sm italic opacity-60">
                <span className="pointer-coarse:hidden">Click</span>
                <span className="hidden pointer-coarse:inline">Tap</span> to
                continue
              </div>
            </div>
          )
        }
        return slide.cardImage ? (
          <img
            src={slide.cardImage}
            alt={slide.cardName}
            className="max-h-[33svh] max-w-full rounded-lg object-contain shadow-2xl md:max-h-[50vh] md:max-w-[280px]"
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
                aria-label="Meditate"
                className="size-32 rounded-full bg-current animate-breathe md:size-48"
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
                      Intone three times
                      {withTimer && (
                        <>
                          , then{' '}
                          <span className="pointer-coarse:hidden">click</span>
                          <span className="hidden pointer-coarse:inline">
                            tap
                          </span>{' '}
                          to continue
                        </>
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
