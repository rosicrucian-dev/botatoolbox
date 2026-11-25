import { MovedTo } from '@/components/nav/MovedTo'

// A tool's own href is its first view, so the chart is /astrology
// itself (src/lib/tools.ts) and this nested address is retired.
export default function AstrologyChartViewRedirect() {
  return <MovedTo to="/astrology" what="The chart" />
}
