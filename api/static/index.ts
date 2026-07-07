import { createStaticProxyResponse, resolveStaticProxyTarget } from '../../src/lib/static-proxy'

export const config = {
  runtime: 'edge',
}

export default async function handler(request: Request): Promise<Response> {
  try {
    const urlStr = request.url?.split('/static/')?.[1]

    if (!urlStr) {
      return new Response('Not Found', { status: 404 })
    }

    // Use the shared resolver so both the scheme-full (legacy) and scheme-less
    // (/static/host/...) proxy paths are accepted. A bare `new URL(urlStr)` throws
    // on scheme-less input, which returned HTTP 500 for every image.
    const parsed = resolveStaticProxyTarget(urlStr)
    parsed.searchParams.delete('path')

    const rawTarget = parsed.origin + parsed.pathname + parsed.search
    return await createStaticProxyResponse(request, rawTarget)
  }
  catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return new Response(message, { status: 500 })
  }
}
