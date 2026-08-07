import { useNavigate } from 'react-router-dom'

export function Disclaimer() {
  const navigate = useNavigate()

  function handlePrivacidade(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault()
    navigate('/privacidade')
  }

  function handleTermos(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault()
    navigate('/termos')
  }

  return (
    <footer className="app-footer" data-theme="dark">
      <div className="app-footer-content">
        <p className="app-footer-line">
          © 2026 Mandato Transparente - Por{' '}
          <a
            className="app-footer-link"
            href="https://andre100.dev"
            target="_blank"
            rel="noopener noreferrer"
          >
            andre100.dev
          </a>
          <span className="app-footer-separator" aria-hidden="true">•</span>
          <a href="/privacidade" onClick={handlePrivacidade} className="app-footer-link">
            Política de Privacidade
          </a>
          <span className="app-footer-separator" aria-hidden="true">•</span>
          <a href="/termos" onClick={handleTermos} className="app-footer-link">
            Termos de Uso
          </a>
        </p>
      </div>
    </footer>
  )
}
