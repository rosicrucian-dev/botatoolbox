import { MovedTo } from '@/components/nav/MovedTo'

// ONE PAGE OF SEVERAL TABLES BECAME FOUR PAGES (10 November 2026):
// Sephiroth, Grades, Three Veils, Four Worlds.
export default function Redirect() {
  return (
    <MovedTo
      to="/correspondences/sephiroth"
      what="The Qabalah tables"
      label="Sephiroth"
    />
  )
}
