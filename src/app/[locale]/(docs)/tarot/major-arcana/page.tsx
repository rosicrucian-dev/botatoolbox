import { MovedTo } from '@/components/nav/MovedTo'

// THE TAROT GROUP IS GONE (November 2026). It held four pages of two
// kinds — two tables and two ways of drawing the cards — and they are
// filed by what they are now: the tables under /correspondences, the
// tableau as the Reference's Major Arcana, the draw as a Tool.
//
// This address listed the 22 Keys as text beside a /tarot/tableau that
// drew them. One of the two had to be the index, and the tableau is the
// one a reader recognises a Key from, so this list is retired rather
// than moved.

export default function TarotMajorArcanaRedirect() {
  return <MovedTo to="/major-arcana" what="The Major Arcana" />
}
