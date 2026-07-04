import { isMajorStyle, isMinorStyle } from '@/content/data/tarot-styles'
import { isColorPalette, type ColorPaletteId } from '@/lib/colors'

// Settings restore links: /settings?restore=<token>, where the token is
// a base64url snapshot of every preference the Settings page manages.
// The Settings page offers "Copy restore link" (encode) and, when opened
// with the parameter, shows a confirm-before-apply banner (decode). The
// token is applied once and stripped from the URL — it's a snapshot to
// bookmark against cleared browser data or for a new device, not live
// state.
//
// Versioned so the format can evolve: unknown versions and any invalid
// ids (e.g. a style that was later removed) decode to null and the
// banner explains the link is stale, rather than half-applying.

export interface SettingsSnapshot {
  majorStyle: string
  minorStyle: string
  colorPalette: ColorPaletteId
  unlocked: boolean
}

function toBase64Url(s: string): string {
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(s: string): string {
  return atob(s.replace(/-/g, '+').replace(/_/g, '/'))
}

export function encodeSettingsToken(snapshot: SettingsSnapshot): string {
  return toBase64Url(
    JSON.stringify({
      v: 1,
      mj: snapshot.majorStyle,
      mn: snapshot.minorStyle,
      cp: snapshot.colorPalette,
      u: snapshot.unlocked ? 1 : 0,
    }),
  )
}

export function decodeSettingsToken(token: string): SettingsSnapshot | null {
  try {
    const raw: unknown = JSON.parse(fromBase64Url(token))
    if (typeof raw !== 'object' || raw === null) return null
    const { v, mj, mn, cp, u } = raw as Record<string, unknown>
    if (v !== 1) return null
    if (typeof mj !== 'string' || !isMajorStyle(mj)) return null
    if (typeof mn !== 'string' || !isMinorStyle(mn)) return null
    if (typeof cp !== 'string' || !isColorPalette(cp)) return null
    return {
      majorStyle: mj,
      minorStyle: mn,
      colorPalette: cp,
      unlocked: u === 1,
    }
  } catch {
    return null
  }
}
