// Planetary hours ("hora") computation for /astrology/hora.
//
// The classical scheme: daylight (sunrise → sunset) is divided into
// twelve equal "hours", and night (sunset → next sunrise) into twelve
// more — so a planetary hour is only 60 minutes long at the equinoxes.
// Rulers follow the Chaldean order (slowest to fastest: Saturn →
// Jupiter → Mars → Sun → Venus → Mercury → Moon), repeating in a cycle.
// The first hour of each day (at sunrise) is ruled by the day's ruler —
// Sun on Sunday, Moon on Monday, etc. — and the 24-hour chain continues
// unbroken through the night; that's precisely why the weekdays carry
// their planetary names.
//
// Sunrise/sunset come from astronomy-engine (same ephemeris the chart
// uses). Weekday is taken from the device's local calendar date of the
// sunrise — correct whenever the user's clock timezone matches the
// place they're standing, which is the prototype's assumption.

import { Body, Observer, SearchRiseSet } from 'astronomy-engine'

export const CHALDEAN_ORDER = [
  'saturn',
  'jupiter',
  'mars',
  'sun',
  'venus',
  'mercury',
  'moon',
] as const

export type HoraPlanetSlug = (typeof CHALDEAN_ORDER)[number]

// Indexed by JS Date.getDay() (0 = Sunday).
const DAY_RULER_BY_WEEKDAY: ReadonlyArray<HoraPlanetSlug> = [
  'sun',
  'moon',
  'mars',
  'mercury',
  'jupiter',
  'venus',
  'saturn',
]

export interface PlanetaryHour {
  start: Date
  end: Date
  planet: HoraPlanetSlug
  isDay: boolean
  /** 1–12 within its day/night half. */
  index: number
}

const HOUR_MS = 3_600_000

/**
 * All planetary hours overlapping [from, from + spanMs], earliest
 * first — so hours[0] is the hour in progress at `from`. Returns null
 * where the scheme breaks down (polar day/night: no sunrise or sunset
 * within the search window).
 */
export function planetaryHours(
  latitude: number,
  longitude: number,
  from: Date,
  spanMs = 12 * HOUR_MS,
): PlanetaryHour[] | null {
  const observer = new Observer(latitude, longitude, 0)
  const until = new Date(from.getTime() + spanMs)

  // The planetary day containing `from` began at the most recent
  // sunrise (negative limitDays searches backward).
  const firstRise = SearchRiseSet(Body.Sun, observer, +1, from, -2)
  if (!firstRise) return null

  const hours: PlanetaryHour[] = []
  let dayStart = firstRise.date
  // Each loop emits one full planetary day (sunrise → next sunrise,
  // 24 hours). Two iterations cover any 12-hour window; the guard is
  // just a safety net against pathological rise/set sequences.
  for (let guard = 0; guard < 4 && dayStart < until; guard++) {
    const set = SearchRiseSet(Body.Sun, observer, -1, dayStart, 2)
    const nextRise = SearchRiseSet(
      Body.Sun,
      observer,
      +1,
      new Date(dayStart.getTime() + 60_000),
      2,
    )
    if (!set || !nextRise) return null
    const sunset = set.date
    const sunrise = nextRise.date
    if (!(dayStart < sunset && sunset < sunrise)) return null

    const startIdx = CHALDEAN_ORDER.indexOf(
      DAY_RULER_BY_WEEKDAY[dayStart.getDay()],
    )
    const dayHourMs = (sunset.getTime() - dayStart.getTime()) / 12
    const nightHourMs = (sunrise.getTime() - sunset.getTime()) / 12
    for (let i = 0; i < 12; i++) {
      hours.push({
        start: new Date(dayStart.getTime() + i * dayHourMs),
        end: new Date(dayStart.getTime() + (i + 1) * dayHourMs),
        planet: CHALDEAN_ORDER[(startIdx + i) % 7],
        isDay: true,
        index: i + 1,
      })
    }
    for (let i = 0; i < 12; i++) {
      hours.push({
        start: new Date(sunset.getTime() + i * nightHourMs),
        end: new Date(sunset.getTime() + (i + 1) * nightHourMs),
        planet: CHALDEAN_ORDER[(startIdx + 12 + i) % 7],
        isDay: false,
        index: i + 1,
      })
    }
    dayStart = sunrise
  }

  return hours.filter((h) => h.end > from && h.start < until)
}
