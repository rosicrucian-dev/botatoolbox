import { MovedTo } from '@/components/nav/MovedTo'

// ONE PAGE OF THREE TABLES BECAME THREE PAGES (10 November 2026), so
// the two sites carry the same tables under the same headings. Signs,
// Planets and Houses.
export default function Redirect() {
  return (
    <MovedTo
      to="/correspondences/signs"
      what="The Astrology tables"
      label="Signs"
    />
  )
}
