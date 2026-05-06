export function formatDate(value?: string) {
  if (!value) return ''
  const date = new Date(value)
  return date.toLocaleDateString('pt-BR')
}

export function normalizeSearchText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function scoreByMatch(text: string, query: string): number {
  if (!query || !text) {
    return 0
  }

  if (text === query) {
    return 100
  }

  if (text.startsWith(query)) {
    return 80
  }

  const words = text.split(/\s+/)

  if (words.some((word) => word.startsWith(query))) {
    return 60
  }

  if (text.includes(query)) {
    return 40
  }

  return 0
}

export function scoreGlobalSearchMatch(params: {
  query: string
  normalizedName: string
  normalizedParty: string
  normalizedOffice: string
}): number {
  const { query, normalizedName, normalizedParty, normalizedOffice } = params

  const nameScore = scoreByMatch(normalizedName, query)
  const partyScore = scoreByMatch(normalizedParty, query)
  const officeScore = scoreByMatch(normalizedOffice, query)

  return nameScore * 3 + partyScore + officeScore
}
