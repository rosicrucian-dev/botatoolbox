'use client'

import { useEffect, useState } from 'react'

// Tells iPhone users they can install via Share → Add to Home Screen.
// Renders nothing on other devices, and nothing once already installed
// (display-mode: standalone, or iOS Safari's legacy navigator.standalone).
// Detection runs after mount — server render is empty so the hint flashes
// in on hydration; that's the cost of keeping the home page statically
// exported.
export function AddToHomeHint() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const isIPhone = /iPhone/i.test(navigator.userAgent)
    if (!isIPhone) return
    const standalone =
      window.matchMedia?.('(display-mode: standalone)').matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true
    if (standalone) return
    setShow(true)
  }, [])

  if (!show) return null

  return (
    <p className="mt-2 text-zinc-600 dark:text-zinc-400">
      For a better experience, you can use Add to Home Screen from the Share
      button on Safari.
    </p>
  )
}
