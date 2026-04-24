import { useNavigate } from 'react-router-dom'
import './NotFoundPanel.css'

export function NotFoundPanel() {
  const navigate = useNavigate()

  return (
    <div className="not-found-panel">
      <div className="not-found-content">
        <div className="not-found-code" aria-hidden="true">404</div>
        <h1 className="not-found-title">Página não encontrada</h1>
        <div className="not-found-divider" aria-hidden="true" />
        <p className="not-found-description">
          O endereço que você acessou não existe ou foi removido.
          <br />
          Verifique o link ou volte para continuar sua consulta.
        </p>
        <div className="not-found-actions">
          <button
            className="not-found-btn not-found-btn-primary"
            onClick={() => navigate('/')}
          >
            ← Início
          </button>
          <button
            className="not-found-btn not-found-btn-secondary"
            onClick={() => navigate(-1)}
          >
            Voltar
          </button>
        </div>
      </div>
    </div>
  )
}
