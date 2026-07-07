import type { APIRoute } from 'astro'
import { getEnv } from '../../lib/env'
import { getChannelInfo } from '../../lib/telegram'

const TRAILING_SLASH_RE = /\/$/

// Complements the id-based sitemaps: includes the homepage, tag pages and the
// most recent posts. The cursor sitemaps use `before=<id>`, which excludes the
// newest post; this file guarantees the latest posts are always covered.
export const GET: APIRoute = async (Astro) => {
  const url = new URL(Astro.request.url)
  const origin = (import.meta.env.SITE || url.origin).replace(TRAILING_SLASH_RE, '')
  const channel = await getChannelInfo(Astro)
  const posts = channel.posts || []

  const tags = (getEnv(import.meta.env, Astro, 'TAGS') || '')
    .split(',')
    .map(tag => tag.trim())
    .filter(Boolean)

  const urls: string[] = [`<url><loc>${origin}/</loc></url>`]

  if (tags.length) {
    urls.push(`<url><loc>${origin}/tags</loc></url>`)
    for (const tag of tags) {
      urls.push(`<url><loc>${origin}/tags/${encodeURIComponent(tag)}</loc></url>`)
    }
  }

  for (const post of posts) {
    const lastmod = post.datetime ? `<lastmod>${new Date(post.datetime).toISOString()}</lastmod>` : ''
    urls.push(`<url><loc>${origin}/posts/${post.id}</loc>${lastmod}</url>`)
  }

  return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls.join('\n  ')}
</urlset>`, {
    headers: {
      'Content-Type': 'application/xml',
    },
  })
}
