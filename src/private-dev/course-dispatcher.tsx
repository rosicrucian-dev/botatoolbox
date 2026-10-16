import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

type Loader = () => Promise<unknown>

export type PrivateCourseRoutes = Record<
  string,
  { index: Loader; detail?: Loader; detailParam?: string }
>

type Params = { locale: string; course: string[] }
type PageProps = { params: Promise<Record<string, string>> }
type PageModule = {
  default: (props: PageProps) => React.ReactNode | Promise<React.ReactNode>
  generateMetadata?: (props: PageProps) => Metadata | Promise<Metadata>
}

// The route module is generated from private files during local development.
// Keep its dispatch behavior here so the private source only needs pages and
// data. The cast is confined to this boundary because imported page modules
// each name their own detail parameter (week, path, sephirah, etc.).
export function createPrivateCourseDispatcher(routes: PrivateCourseRoutes) {
  async function resolveCourse(params: Params) {
    const [name, detail, extra] = params.course
    const route = routes[name]
    if (
      !route ||
      extra ||
      (detail && !route.detail) ||
      (!detail && params.course.length !== 1)
    ) {
      notFound()
    }
    const loader = detail ? route.detail : route.index
    if (!loader) notFound()
    const page = (await loader()) as PageModule
    const pageParams = {
      locale: params.locale,
      ...(detail && route.detailParam ? { [route.detailParam]: detail } : {}),
    }
    return { page, pageParams }
  }

  async function generateMetadata({
    params,
  }: {
    params: Promise<Params>
  }): Promise<Metadata> {
    const { page, pageParams } = await resolveCourse(await params)
    return page.generateMetadata?.({ params: Promise.resolve(pageParams) }) ?? {}
  }

  async function Page({ params }: { params: Promise<Params> }) {
    const { page, pageParams } = await resolveCourse(await params)
    return page.default({ params: Promise.resolve(pageParams) })
  }

  return { Page, generateMetadata }
}
