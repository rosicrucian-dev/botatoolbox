'use client'

import { useEffect, useMemo, useState } from 'react'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/catalyst/table'
import { useLocale } from '@/components/LocaleProvider'
import { PageHeading } from '@/components/PageHeading'
import { getAstrology } from '@/content/data'
import { planetaryHours } from '@/lib/astro/hora'

// Planetary hours for the user's location — prototype. Geolocation is
// requested on mount (the page is useless without a location, so the
// prompt is the page's one question); the last granted position is
// remembered in localStorage as a fallback for when a later request
// fails or times out. All times render in the device's local timezone.

const COORDS_KEY = 'hora-coords-v1'

interface Coords {
  lat: number
  lon: number
}

type LocationState =
  | { status: 'locating' }
  | { status: 'error'; message: string }
  | { status: 'ready'; coords: Coords; approximate?: boolean }

function readStoredCoords(): Coords | null {
  try {
    const raw = localStorage.getItem(COORDS_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<Coords>
    if (typeof parsed.lat === 'number' && typeof parsed.lon === 'number') {
      return { lat: parsed.lat, lon: parsed.lon }
    }
  } catch {}
  return null
}

const timeFormat = new Intl.DateTimeFormat(undefined, {
  hour: 'numeric',
  minute: '2-digit',
})

function formatCoords({ lat, lon }: Coords): string {
  const ns = lat >= 0 ? 'N' : 'S'
  const ew = lon >= 0 ? 'E' : 'W'
  return `${Math.abs(lat).toFixed(1)}°${ns}, ${Math.abs(lon).toFixed(1)}°${ew}`
}

function useLocation(): [LocationState, () => void] {
  const [state, setState] = useState<LocationState>({ status: 'locating' })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setStateFromFallback('This browser has no location support.')
      return
    }
    // Browsers only allow geolocation on HTTPS or localhost. On a plain
    // http:// origin (e.g. the dev server over LAN IP) the request is
    // auto-denied with no prompt — surface that instead of a misleading
    // "permission denied".
    if (!window.isSecureContext) {
      setStateFromFallback(
        'Location is unavailable over an insecure (http://) connection — open the site via https or localhost.',
      )
      return
    }
    let cancelled = false
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (cancelled) return
        const coords = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        }
        try {
          localStorage.setItem(COORDS_KEY, JSON.stringify(coords))
        } catch {}
        setState({ status: 'ready', coords })
      },
      (geoError) => {
        if (cancelled) return
        setStateFromFallback(
          geoError.code === geoError.PERMISSION_DENIED
            ? 'Location permission was denied. If you never saw a prompt, check the site’s location permission in your browser settings — and on a Mac, that Location Services is enabled for your browser in System Settings → Privacy & Security.'
            : 'Your location could not be determined.',
        )
      },
      // Hour boundaries move ~a minute per mile — a cached, low-accuracy
      // fix is plenty and avoids a long GPS wait.
      { enableHighAccuracy: false, timeout: 15_000, maximumAge: 15 * 60_000 },
    )

    function setStateFromFallback(message: string) {
      const stored = readStoredCoords()
      if (stored) {
        setState({ status: 'ready', coords: stored, approximate: true })
      } else {
        setState({ status: 'error', message })
      }
    }
    return () => {
      cancelled = true
    }
  }, [attempt])

  return [state, () => setAttempt((n) => n + 1)]
}

// Ticks `now` forward on a fixed cadence so the current hour, the
// countdown, and the table window stay live while the page sits open.
function useNow(intervalMs: number): Date {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), intervalMs)
    return () => clearInterval(timer)
  }, [intervalMs])
  return now
}

export function HoraClient() {
  const { planetBySlug } = getAstrology(useLocale())
  const [location, retry] = useLocation()
  const now = useNow(30_000)

  const hours = useMemo(() => {
    if (location.status !== 'ready') return null
    return planetaryHours(location.coords.lat, location.coords.lon, now)
  }, [location, now])

  return (
    <article className="space-y-8">
      <header>
        <PageHeading>Hora</PageHeading>
      </header>

      {location.status === 'locating' && (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Finding your location…
        </p>
      )}

      {location.status === 'error' && (
        <div className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
          <p>
            {location.message} The hours depend on local sunrise and sunset, so
            a location is required.
          </p>
          <button
            type="button"
            onClick={retry}
            className="rounded-md bg-emerald-500 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-emerald-400"
          >
            Try again
          </button>
        </div>
      )}

      {location.status === 'ready' && hours === null && (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          The sun doesn’t rise or set at your latitude right now (polar
          day/night), so the planetary hours are undefined here.
        </p>
      )}

      {location.status === 'ready' && hours && hours.length > 0 && (
        <>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader className="w-10" aria-label="Symbol" />
                <TableHeader>Planet</TableHeader>
                <TableHeader className="text-right">Begins</TableHeader>
                <TableHeader className="text-right">Ends</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {hours.map((hour, i) => {
                const planet = planetBySlug[hour.planet]
                const isCurrent = i === 0
                return (
                  <TableRow
                    key={hour.start.getTime()}
                    className={
                      isCurrent
                        ? 'bg-emerald-50 dark:bg-emerald-500/10'
                        : undefined
                    }
                  >
                    <TableCell
                      aria-hidden
                      className="font-serif text-lg text-zinc-500 dark:text-zinc-400"
                    >
                      {planet.glyph}
                    </TableCell>
                    <TableCell className="font-medium">{planet.name}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {timeFormat.format(hour.start)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {isCurrent && (
                        <span className="text-zinc-500 dark:text-zinc-400">
                          {Math.max(
                            1,
                            Math.ceil(
                              (hour.end.getTime() - now.getTime()) / 60_000,
                            ),
                          )}
                          m to{' '}
                        </span>
                      )}
                      {timeFormat.format(hour.end)}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>

          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Hours for the next 12 hours at {formatCoords(location.coords)}
            {location.approximate && ' (last known location)'}, in your local
            time zone.{' '}
            <button
              type="button"
              onClick={retry}
              className="text-emerald-500 underline hover:text-emerald-600"
            >
              Update location
            </button>
          </p>
        </>
      )}
    </article>
  )
}
