import { Link } from 'react-router-dom'
import { AppButton } from './AppButton'
import { useCookieConsent } from '../../hooks/useCookieConsent'

import './CookieBanner.css'

export function CookieBanner() {
  const { isBannerVisible, acceptCookies, rejectCookies, dismissBanner } = useCookieConsent()

  if (!isBannerVisible) {
    return null
  }

  return (
    <section className="cookie-banner" aria-label="Aviso de cookies" role="dialog" aria-live="polite">
      <div className="cookie-banner__content">
        <button
          type="button"
          className="cookie-banner__close"
          onClick={dismissBanner}
          aria-label="Fechar aviso de cookies"
        >
          ×
        </button>

        <div className="cookie-banner__text-block">
          <h2 className="cookie-banner__title">Política de Cookies</h2>
          <p className="cookie-banner__description">
            Usamos cookies para medir desempenho e melhorar sua experiência no Mandato Transparente.
            Você pode aceitar ou recusar o rastreamento não essencial.
          </p>
          <Link className="cookie-banner__link" to="/privacidade">
            Leia nossa Política de Privacidade
          </Link>
        </div>

        <div className="cookie-banner__actions">
          <AppButton
            type="button"
            className="cookie-banner__button cookie-banner__button--reject"
            onClick={rejectCookies}
          >
            REJEITAR
          </AppButton>
          <AppButton
            type="button"
            className="cookie-banner__button cookie-banner__button--accept"
            onClick={acceptCookies}
          >
            ACEITAR
          </AppButton>
        </div>
      </div>
    </section>
  )
}
