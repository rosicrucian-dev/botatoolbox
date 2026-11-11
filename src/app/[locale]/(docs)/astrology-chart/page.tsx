import { MovedTo } from '@/components/nav/MovedTo'

// The chart moved to /astrology/chart when the Astrology nav category
// was added (July 2026), and up to /astrology when that category became
// one row of Tools (November 2026). Pointed at the CURRENT address,
// never at the other stub.
export default function AstrologyChartRedirect() {
  return <MovedTo to="/astrology" what="The chart" />
}
