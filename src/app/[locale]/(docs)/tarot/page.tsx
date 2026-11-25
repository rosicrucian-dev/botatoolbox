import { MovedTo } from '@/components/nav/MovedTo'

// THE TAROT GROUP IS GONE (November 2026). It held four pages of two
// kinds — two tables and two ways of drawing the cards — and they are
// filed by what they are now: the tables under /correspondences, the
// tableau as the Reference's Major Arcana, the draw as a Tool.

export default function TarotRedirect() {
  return <MovedTo to="/major-arcana" what="The Tarot group" label="Major Arcana" />
}
