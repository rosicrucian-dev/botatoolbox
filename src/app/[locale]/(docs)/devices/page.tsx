import { MovedTo } from '@/components/nav/MovedTo'

// THE DEVICES GROUP IS GONE (November 2026): the Cube of Space and the
// Tree of Life are two of the things a reader looks up, so they are
// rows of the Reference rather than a heading of their own naming how
// they happen to be drawn.

export default function DevicesRedirect() {
  return <MovedTo to="/reference" what="The devices" label="Reference" />
}
