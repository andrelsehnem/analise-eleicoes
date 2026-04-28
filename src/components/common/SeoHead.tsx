import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import {
  GSC_VERIFICATION_TOKEN,
  SEO_DEFAULT_DESCRIPTION,
  SEO_DEFAULT_OG_IMAGE_PATH,
  SEO_DEFAULT_ROBOTS,
  SITE_NAME,
} from '../../constants/seo'
import { buildAbsoluteUrl } from '../../utils/seo'

type JsonLdSchema = Record<string, unknown>

type SeoHeadProps = {
  title?: string
  description?: string
  robots?: string
  canonicalPath?: string
  ogImagePath?: string
  ogType?: 'website' | 'article'
  jsonLd?: JsonLdSchema | JsonLdSchema[]
}

function normalizeTitle(title: string): string {
  if (title === SITE_NAME || title.endsWith(`| ${SITE_NAME}`)) {
    return title
  }

  return `${title} | ${SITE_NAME}`
}

function upsertMetaByName(name: string, content: string) {
  let meta = document.head.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null

  if (!meta) {
    meta = document.createElement('meta')
    meta.setAttribute('name', name)
    document.head.appendChild(meta)
  }

  meta.setAttribute('content', content)
}

function upsertMetaByProperty(property: string, content: string) {
  let meta = document.head.querySelector(
    `meta[property="${property}"]`,
  ) as HTMLMetaElement | null

  if (!meta) {
    meta = document.createElement('meta')
    meta.setAttribute('property', property)
    document.head.appendChild(meta)
  }

  meta.setAttribute('content', content)
}

function upsertCanonical(url: string) {
  let link = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null

  if (!link) {
    link = document.createElement('link')
    link.setAttribute('rel', 'canonical')
    document.head.appendChild(link)
  }

  link.setAttribute('href', url)
}

function upsertJsonLd(schema?: JsonLdSchema | JsonLdSchema[]) {
  const scriptId = 'mt-jsonld'
  const existingScript = document.head.querySelector(
    `script#${scriptId}`,
  ) as HTMLScriptElement | null

  if (!schema) {
    existingScript?.remove()
    return
  }

  const payload = Array.isArray(schema) && schema.length === 1 ? schema[0] : schema
  const content = JSON.stringify(payload)

  if (existingScript) {
    existingScript.textContent = content
    return
  }

  const script = document.createElement('script')
  script.id = scriptId
  script.type = 'application/ld+json'
  script.textContent = content
  document.head.appendChild(script)
}

export function SeoHead({
  title = SITE_NAME,
  description = SEO_DEFAULT_DESCRIPTION,
  robots = SEO_DEFAULT_ROBOTS,
  canonicalPath,
  ogImagePath = SEO_DEFAULT_OG_IMAGE_PATH,
  ogType = 'website',
  jsonLd,
}: SeoHeadProps) {
  const location = useLocation()

  useEffect(() => {
    const canonicalUrl = buildAbsoluteUrl(canonicalPath || location.pathname)
    const socialImageUrl = buildAbsoluteUrl(ogImagePath)
    const finalTitle = normalizeTitle(title)

    document.title = finalTitle

    upsertMetaByName('description', description)
    upsertMetaByName('robots', robots)

    // Google Search Console verification (only on homepage)
    if (location.pathname === '/' && GSC_VERIFICATION_TOKEN) {
      upsertMetaByName('google-site-verification', GSC_VERIFICATION_TOKEN)
    }

    upsertMetaByName('twitter:card', 'summary_large_image')
    upsertMetaByName('twitter:title', finalTitle)
    upsertMetaByName('twitter:description', description)
    upsertMetaByName('twitter:image', socialImageUrl)
    upsertMetaByName('twitter:url', canonicalUrl)

    upsertMetaByProperty('og:locale', 'pt_BR')
    upsertMetaByProperty('og:site_name', SITE_NAME)
    upsertMetaByProperty('og:type', ogType)
    upsertMetaByProperty('og:title', finalTitle)
    upsertMetaByProperty('og:description', description)
    upsertMetaByProperty('og:url', canonicalUrl)
    upsertMetaByProperty('og:image', socialImageUrl)
    upsertMetaByProperty('og:image:alt', finalTitle)

    upsertCanonical(canonicalUrl)
    upsertJsonLd(jsonLd)
  }, [canonicalPath, description, jsonLd, location.pathname, ogImagePath, ogType, robots, title])

  return null
}
