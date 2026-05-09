// Replays the current slide's tone. Chip-styled to sit alongside the
// PlayerHeader's close button (and FlowToggle on the cube view). Uses
// current-color ring/hover so it works on any slide background.
export function SoundButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Play tone"
      className="relative inline-flex h-9 shrink-0 items-center justify-center rounded-md px-3 text-sm ring-1 ring-current/20 transition hover:bg-current/10"
    >
      <span className="absolute size-12 pointer-fine:hidden" />
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z"
        />
      </svg>
    </button>
  )
}
