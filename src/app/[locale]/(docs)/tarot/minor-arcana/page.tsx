import { MovedTo } from '@/components/nav/MovedTo'

// THE TAROT GROUP IS GONE (November 2026). It held four pages of two
// kinds — two tables and two ways of drawing the cards — and they are
// filed by what they are now: the tables under /correspondences, the
// cards themselves as the Reference's two Arcana, the draw as a Tool.
//
// This page WAS the table — the suits' attributions and every card's
// keyword — so it goes to where that table lives, not to /minor-arcana,
// which is the cards as pictures and is a different page.
export default function TarotMinorArcanaRedirect() {
  return (
    <MovedTo to="/correspondences/minor-arcana" what="The Minor Arcana table" />
  )
}
