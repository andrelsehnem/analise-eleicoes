import { useEffect, useRef } from 'react'
import './AdSlot.css'

const ADSENSE_CLIENT = 'ca-pub-7478664676745892'

declare global {
  interface Window {
    adsbygoogle?: unknown[]
  }
}

type AdSlotProps = {
  slot: string
  format?: string
  fullWidthResponsive?: boolean
}

export function AdSlot({ slot, format = 'auto', fullWidthResponsive = true }: AdSlotProps) {
  const insRef = useRef<HTMLModElement | null>(null)

  useEffect(() => {
    const ins = insRef.current
    if (!ins || ins.getAttribute('data-adsbygoogle-status')) {
      return
    }
    try {
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch {
      // Bloqueador de anúncios ou script indisponível: ignora silenciosamente.
    }
  }, [])

  return (
    <aside className="ad-slot" aria-label="Publicidade">
      <span className="ad-slot__label">Publicidade</span>
      <ins
        ref={insRef}
        className="adsbygoogle ad-slot__ins"
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={fullWidthResponsive ? 'true' : 'false'}
      />
    </aside>
  )
}
