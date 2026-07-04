// 28-day Tarot Fundamentals meditation cycle. Edit
// `meditations-tarot-fundamentals.json` to add content; this file is
// the typed view + small helpers.

import { z } from 'zod'

import dspData from '@content/data/meditations-supersensory-powers.json'
import data from '@content/data/meditations-tarot-fundamentals.json'
import { MeditationDaySchema, SupersensoryMeditationSchema } from './schemas'

export type MeditationDay = z.infer<typeof MeditationDaySchema>

export const tarotFundamentalsDays: ReadonlyArray<MeditationDay> = z
  .array(MeditationDaySchema)
  .parse(data)

export type SupersensoryMeditation = z.infer<
  typeof SupersensoryMeditationSchema
>

export const supersensoryMeditations: ReadonlyArray<SupersensoryMeditation> = z
  .array(SupersensoryMeditationSchema)
  .parse(dspData)

export function supersensoryBySlug(
  slug: string,
): SupersensoryMeditation | undefined {
  return supersensoryMeditations.find((m) => m.slug === slug)
}

export function isRestDay(day: number): boolean {
  return day % 7 === 0
}

export function dayBySlug(slug: string): MeditationDay | undefined {
  const m = /^day-(\d+)$/.exec(slug)
  if (!m) return undefined
  const n = Number(m[1])
  return tarotFundamentalsDays.find((d) => d.day === n)
}

// Next/prev non-rest day numbers, or undefined at the ends. Walks past
// rest days so navigation only lands on days with content.
export function neighborDays(day: number): {
  prev: number | undefined
  next: number | undefined
} {
  let prev: number | undefined
  for (let n = day - 1; n >= 1; n--) {
    if (!isRestDay(n)) {
      prev = n
      break
    }
  }
  let next: number | undefined
  for (let n = day + 1; n <= 28; n++) {
    if (!isRestDay(n)) {
      next = n
      break
    }
  }
  return { prev, next }
}
