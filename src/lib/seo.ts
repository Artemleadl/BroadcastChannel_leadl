import type { ChannelInfo, SeoMeta } from '../types'

export const DEFAULT_SITE_DESCRIPTION
  = 'Блог команды Leadl.ai: делимся опытом создания B2B-продукта и AI-инструментов для поиска клиентов и лидогенерации в Telegram. Новости, кейсы и инсайты.'

const HTML_TAG_REGEX = /<[^>]+>/g
const QUOT_ENTITY_REGEX = /&quot;/g
const QUOT_NUM_ENTITY_REGEX = /&#34;/g
const APOS_ENTITY_REGEX = /&apos;/g
const APOS_NUM_ENTITY_REGEX = /&#39;/g
const AMP_ENTITY_REGEX = /&amp;/g
const LT_ENTITY_REGEX = /&lt;/g
const GT_ENTITY_REGEX = /&gt;/g
const HTTP_URL_REGEX = /https?:\/\/\S+/g
const WHITESPACE_REGEX = /\s+/g
const TRAILING_PUNCTUATION_REGEX = /[,;:.!—–-]+\s*$/

/**
 * Cleans raw text (removes HTML tags, resolves entities, strips URL noise,
 * normalizes whitespace) and trims cleanly to maxLength on a word boundary.
 */
export function cleanMetaDescription(text?: string | null, maxLength = 160): string {
  if (!text) {
    return ''
  }

  const cleaned = text
    .replace(HTML_TAG_REGEX, ' ')
    .replace(QUOT_ENTITY_REGEX, '"')
    .replace(QUOT_NUM_ENTITY_REGEX, '"')
    .replace(APOS_ENTITY_REGEX, '\'')
    .replace(APOS_NUM_ENTITY_REGEX, '\'')
    .replace(AMP_ENTITY_REGEX, '&')
    .replace(LT_ENTITY_REGEX, '<')
    .replace(GT_ENTITY_REGEX, '>')
    .replace(HTTP_URL_REGEX, '')
    .replace(WHITESPACE_REGEX, ' ')
    .trim()

  if (cleaned.length <= maxLength) {
    return cleaned
  }

  let truncated = cleaned.slice(0, maxLength - 1)
  const lastSpace = truncated.lastIndexOf(' ')
  if (lastSpace > 60) {
    truncated = truncated.slice(0, lastSpace)
  }

  truncated = truncated.replace(TRAILING_PUNCTUATION_REGEX, '').trim()
  return `${truncated}…`
}

export interface ResolveDescriptionOptions {
  seo?: SeoMeta
  channel?: ChannelInfo
  envDescription?: string
}

export function resolveSeoDescription(options: ResolveDescriptionOptions): string {
  const { seo, envDescription } = options

  // 1. Explicit SEO text or description (e.g. from post or tag page)
  const explicitText = seo?.text ?? seo?.description
  if (explicitText) {
    return cleanMetaDescription(explicitText)
  }

  // 2. Configured env description (SITE_DESCRIPTION or DESCRIPTION)
  if (envDescription && envDescription.trim()) {
    return cleanMetaDescription(envDescription.trim())
  }

  // 3. Optimized default site description for Leadl.ai
  return DEFAULT_SITE_DESCRIPTION
}
