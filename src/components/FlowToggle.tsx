'use client'

// Pressable secondary toggle. Uses current-color rings/hovers so it
// matches the other player-header chips (SoundButton, Close) and adapts
// to whatever bg/text color the parent provides. Off = thin outline,
// On = subtle fill (same ring color, distinct fill).
export function FlowToggle({
  pressed,
  onPressedChange,
}: {
  pressed: boolean
  onPressedChange: (next: boolean) => void
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={() => onPressedChange(!pressed)}
      className={
        'inline-flex h-9 shrink-0 items-center justify-center rounded-md px-3 text-sm font-medium whitespace-nowrap ring-1 ring-current/20 transition ' +
        (pressed ? 'bg-current/15' : 'hover:bg-current/10')
      }
    >
      Flow
    </button>
  )
}
