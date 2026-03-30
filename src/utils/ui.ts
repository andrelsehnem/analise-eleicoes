export const FALLBACK_AVATAR =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 60 60'%3E%3Ccircle cx='30' cy='30' r='30' fill='%231a3a6e'/%3E%3Ctext x='50%25' y='55%25' text-anchor='middle' fill='%238899bb' font-size='24'%3E%F0%9F%91%A4%3C/text%3E%3C/svg%3E"

export function getPropositionStatusClass(status?: string) {
  const sitLow = (status || 'Em tramitação').toLowerCase()
  if (
    sitLow.includes('aprovad') ||
    sitLow.includes('transform') ||
    sitLow.includes('sancion')
  ) {
    return 'dot-approved'
  }

  if (
    sitLow.includes('rejeitad') ||
    sitLow.includes('arquivad') ||
    sitLow.includes('prejudicad')
  ) {
    return 'dot-archive'
  }

  return 'dot-pending'
}

export function getPropositionBadgeClass(tipo?: string) {
  if (tipo === 'PL') return 'badge-pl'
  if (tipo === 'PEC') return 'badge-pec'
  if (tipo === 'REQ') return 'badge-req'
  if (tipo === 'PDL' || tipo === 'PDC') return 'badge-pdl'
  return 'badge-other'
}

export function getVotePillClass(voto?: string) {
  if (voto === 'Sim') return 'vote-sim'
  if (voto === 'Não') return 'vote-nao'
  if (voto === 'Abstenção') return 'vote-abs'
  return 'vote-obs'
}
