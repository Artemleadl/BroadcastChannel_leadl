import type { APIRoute } from 'astro'
import { getChannelInfo } from '../lib/telegram'

const TRAILING_SLASH_RE = /\/$/

export const GET: APIRoute = async (Astro) => {
  const request = Astro.request
  const url = new URL(request.url)
  const origin = (import.meta.env.SITE || url.origin).replace(TRAILING_SLASH_RE, '')
  const channel = await getChannelInfo(Astro)
  const posts = channel.posts || []

  const pageSize = 20
  let count = +posts[0]?.id

  const pages: number[] = []
  pages.push(count)
  while (count > pageSize) {
    count -= pageSize
    pages.push(count)
  }

  const sitemaps = [
    `
<sitemap>
  <loc>${origin}/sitemap/pages.xml</loc>
</sitemap>`,
    ...pages.map((page) => {
      return `
<sitemap>
  <loc>${origin}/sitemap/${page}.xml</loc>
</sitemap>`
    }),
  ]

  return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${sitemaps.join('')}
</sitemapindex>`, {
    headers: {
      'Content-Type': 'application/xml',
    },
  })
}
