'use client'

import { HeaderChip } from '@/components/HeaderChip'

// Toggle for the cube-of-space scene's animated edge flow particles.
export function FlowToggle({
  pressed,
  onPressedChange,
}: {
  pressed: boolean
  onPressedChange: (next: boolean) => void
}) {
  return (
    <HeaderChip pressed={pressed} onClick={() => onPressedChange(!pressed)}>
      Flow
    </HeaderChip>
  )
}
