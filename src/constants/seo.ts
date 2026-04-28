export const SITE_NAME = 'Mandato Transparente'
export const SITE_URL = 'https://www.mandatotransparente.com.br'
export const SEO_DEFAULT_OG_IMAGE_PATH = '/og-default.svg'

export const SEO_DEFAULT_DESCRIPTION =
  'Consulte deputados federais e presidência com dados públicos oficiais para votar com mais informação.'

export const SEO_DEFAULT_ROBOTS = 'index,follow,max-image-preview:large'

/**
 * Google Search Console verification token
 * Obtenha em: https://search.google.com/search-console
 * Procurar por "Meta tag" quando adicionar a propriedade
 * Copie o valor do content="xyz" para aqui
 */
export const GSC_VERIFICATION_TOKEN = import.meta.env.VITE_GSC_VERIFICATION_TOKEN || ''
