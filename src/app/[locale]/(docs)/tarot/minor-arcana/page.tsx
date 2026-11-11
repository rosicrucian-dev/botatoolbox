import { MovedTo } from '@/components/nav/MovedTo'

// THE TAROT GROUP IS GONE (November 2026). It held four pages of two
// kinds — two tables and two ways of drawing the cards — and they are
// filed by what they are now: the tables under /correspondences, the
// tableau as the Reference's Major Arcana, the draw as a Tool.

export default function TarotMinorArcanaRedirect() {
  return <MovedTo to="/correspondences/minor-arcana" what="The Minor Arcana table" />
}
