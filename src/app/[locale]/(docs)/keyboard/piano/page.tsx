import { MovedTo } from '@/components/nav/MovedTo'

// /keyboard IS the piano — it always rendered it, and /keyboard/piano
// was a second address for the same view, left over from when the tab
// links pointed at two nested routes. A tool's views are one address
// each now (src/lib/tools.ts).
export default function KeyboardPianoRedirect() {
  return <MovedTo to="/keyboard" what="The piano" />
}
