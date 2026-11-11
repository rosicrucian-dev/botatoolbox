import { MovedTo } from '@/components/nav/MovedTo'

// EAST AND WEST ARE ONE TABLE (10 November 2026), and the gunas left
// it for the Three Principles, which is what keys them.
export default function Redirect() {
  return (
    <MovedTo
      to="/correspondences/phases"
      what="The elements"
      label="Five Phases"
    />
  )
}
