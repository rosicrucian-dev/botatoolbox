import { MovedTo } from '@/components/nav/MovedTo'

// /healing was the Healing group's landing, a card each for the planets
// and the signs. They are two of the Meditations now
// (src/lib/navData.ts) and keep their own /healing/ URLs, which is what
// the practice is called; this page has nothing left to list.
export default function HealingRedirect() {
  return (
    <MovedTo
      to="/meditations"
      what="The healing meditations"
      label="Meditations"
    />
  )
}
