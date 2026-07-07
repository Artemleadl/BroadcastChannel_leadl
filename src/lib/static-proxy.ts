const TARGET_WHITELIST = [
  't.me',
  'telegram.org',
  'telegram.me',
  'telegram.dog',
  'cdn-telegram.org',
  'telesco.pe',
  'yandex.ru',
]

const PROTOCOL_PREFIX_RE = /^https?:\/\//i
const LEADING_SLASHES_RE = /^\/+/

/**
 * Builds a proxied asset URL.
 *
 * For the internal proxy (a root-relative prefix like `/static/`) the target's
 * scheme is stripped so the generated path contains no `//`. Vercel normalises
 * `//` in a path with a 308 redirect, which added an extra round-trip to every
 * image/video; keeping the path as `/static/host/...` avoids that.
 * `resolveStaticProxyTarget` restores the `https://` scheme on the server side.
 *
 * For an external absolute proxy (configured via STATIC_PROXY) the full target,
 * including its scheme, is preserved.
 */
export function buildStaticProxyUrl(staticProxy: string, target: string): string {
  if (!target) {
    return target
  }

  if (staticProxy.startsWith('/')) {
    const schemeless = target.replace(PROTOCOL_PREFIX_RE, '').replace(LEADING_SLASHES_RE, '')
    return `${staticProxy}${schemeless}`
  }

  return `${staticProxy}${target}`
}

export function resolveStaticProxyTarget(rawTarget: string): URL {
  let normalizedTarget = rawTarget

  if (normalizedTarget.startsWith('//')) {
    normalizedTarget = `https:${normalizedTarget}`
  }
  else if (!PROTOCOL_PREFIX_RE.test(normalizedTarget)) {
    // Scheme-less target produced by buildStaticProxyUrl (e.g. host/path).
    normalizedTarget = `https://${normalizedTarget}`
  }

  return new URL(normalizedTarget)
}

export function isStaticProxyWhitelisted(target: URL): boolean {
  return TARGET_WHITELIST.some(domain => target.hostname.endsWith(domain))
}

export async function createStaticProxyResponse(request: Request, rawTarget: string): Promise<Response> {
  const target = resolveStaticProxyTarget(rawTarget)

  if (!isStaticProxyWhitelisted(target)) {
    return new Response('Proxy target not allowed', { status: 403 })
  }

  const response = await fetch(target.toString(), request)
  return new Response(response.body, response)
}
