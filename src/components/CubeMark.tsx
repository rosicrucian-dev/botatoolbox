import clsx from 'clsx'

// Inlined from the canonical vector source — the same file the whole
// icon pipeline (app icons, favicon, splash) renders from, so the
// on-page mark can never drift from the home-screen art. The ?raw
// import needs no fetch and lets the SVG scale crisply at any size.
import cubeSvg from '../../assets/cube.svg?raw'

// The cube mark. Size it by height on the wrapper (e.g. `h-5`); the
// inner SVG keeps its aspect ratio. Decorative — hidden from
// screen readers, the accompanying wordmark carries the name.
export function CubeMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={clsx('inline-block *:h-full *:w-auto', className)}
      dangerouslySetInnerHTML={{ __html: cubeSvg }}
    />
  )
}
