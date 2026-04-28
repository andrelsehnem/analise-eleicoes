import { SITE_NAME, SITE_URL } from '../constants/seo'

export type BreadcrumbItem = {
  name: string
  path: string
}

type PersonProfileSchemaOptions = {
  name: string
  jobTitle: string
  path: string
  imageUrl?: string
  party?: string
  sameAs?: string[]
  worksFor?: string
}

function normalizePath(path: string): string {
  if (!path || path === '/') {
    return '/'
  }

  return path.startsWith('/') ? path : `/${path}`
}

export function buildAbsoluteUrl(path: string): string {
  const normalizedPath = normalizePath(path)
  return `${SITE_URL}${normalizedPath}`
}

export function buildWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: 'pt-BR',
  }
}

export function buildOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    sameAs: ['https://github.com/andrelsehnem/analise-eleicoes'],
  }
}

export function buildBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: buildAbsoluteUrl(item.path),
    })),
  }
}

export function buildCollectionPageSchema(name: string, description: string, path: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    description,
    inLanguage: 'pt-BR',
    url: buildAbsoluteUrl(path),
  }
}

export function buildPersonProfileSchema({
  name,
  jobTitle,
  path,
  imageUrl,
  party,
  sameAs,
  worksFor,
}: PersonProfileSchemaOptions) {
  const normalizedSameAs = (sameAs || []).filter((url) => Boolean(url?.trim()))

  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name,
    jobTitle,
    url: buildAbsoluteUrl(path),
    image: imageUrl,
    sameAs: normalizedSameAs.length > 0 ? normalizedSameAs : undefined,
    affiliation: party
      ? {
          '@type': 'Organization',
          name: party,
        }
      : undefined,
    worksFor: worksFor
      ? {
          '@type': 'Organization',
          name: worksFor,
        }
      : undefined,
  }
}
