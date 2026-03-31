import { useNavigate } from 'react-router-dom'

export function AppHeader() {
  const navigate = useNavigate()

  return (
    <header>
      <div className="header-inner">
        <a className="logo" href="/" onClick={(event) => {
          event.preventDefault()
          navigate('/')
        }}>
          <div className="logo-seal">⚖</div>
          <div className="logo-text">
            <div className="logo-title">Mandato Transparente</div>
            <div className="logo-sub">Análise de Políticos do Brasil</div>
          </div>
        </a>
        
        <div className="header-sep" />

        <div className="header-badge">Contato</div>
        <a href="https://dadosabertos.camara.leg.br/index.html" target="_blank" rel="noopener noreferrer">
          <div className="header-badge">Dados: api.camara.leg.br</div>
        </a>
      </div>
    </header>
  )
}
