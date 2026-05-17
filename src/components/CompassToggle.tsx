'use client'

import { useState } from 'react'

import { HeaderChip } from '@/components/HeaderChip'

// Toggles compass / gyroscope-driven camera rotation in the Cube of
// Space scene. The sensor-fusion controller (CompassControls) needs
// BOTH devicemotion (gyro + accelerometer) and deviceorientation
// (compass heading). On iOS 13+ each is a separate permission and
// each must be requested from a user gesture in a secure context.
// We request them back-to-back inside this one tap so the user only
// has to interact once.
type RequestPermissionFn = () => Promise<'granted' | 'denied' | 'default'>

export function CompassToggle({
  pressed,
  onPressedChange,
}: {
  pressed: boolean
  onPressedChange: (next: boolean) => void
}) {
  const [error, setError] = useState<string | null>(null)

  async function handleClick() {
    if (pressed) {
      onPressedChange(false)
      setError(null)
      return
    }
    if (typeof window === 'undefined') return

    if (!('DeviceOrientationEvent' in window) || !('DeviceMotionEvent' in window)) {
      const msg = 'Motion sensors not supported on this browser.'
      console.warn('[CompassToggle]', msg)
      setError(msg)
      return
    }

    if (!window.isSecureContext) {
      const msg =
        'Compass needs HTTPS (or localhost). Open the site over https:// to allow motion access.'
      console.warn('[CompassToggle]', msg)
      setError(msg)
      return
    }

    const DOE = (
      window as unknown as {
        DeviceOrientationEvent: { requestPermission?: RequestPermissionFn }
      }
    ).DeviceOrientationEvent
    const DME = (
      window as unknown as {
        DeviceMotionEvent: { requestPermission?: RequestPermissionFn }
      }
    ).DeviceMotionEvent

    // iOS 13+ requires explicit permission for both. Non-iOS browsers
    // don't expose `requestPermission` — events fire freely on those.
    // Request orientation first, then motion. If either is denied,
    // bail out and surface why.
    try {
      if (typeof DOE.requestPermission === 'function') {
        const state = await DOE.requestPermission()
        if (state !== 'granted') {
          throw new Error(`Orientation access ${state}`)
        }
      }
      if (typeof DME.requestPermission === 'function') {
        const state = await DME.requestPermission()
        if (state !== 'granted') {
          throw new Error(`Motion access ${state}`)
        }
      }
    } catch (err) {
      const msg =
        (err as Error)?.message ??
        'Motion permission request failed for an unknown reason.'
      const fullMsg = `${msg}. Enable in Settings → Safari → Motion & Orientation Access.`
      console.warn('[CompassToggle]', fullMsg, err)
      setError(fullMsg)
      return
    }

    setError(null)
    onPressedChange(true)
  }

  return (
    <HeaderChip
      pressed={pressed}
      onClick={handleClick}
      title={
        error ??
        (pressed
          ? 'Tap to stop compass'
          : 'Tap to align cube to real-world compass')
      }
    >
      Compass
    </HeaderChip>
  )
}
