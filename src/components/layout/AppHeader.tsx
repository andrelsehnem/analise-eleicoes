import { useNavigate } from 'react-router-dom'

export function AppHeader() {
  const navigate = useNavigate()

  function handleSobre(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault()
    navigate('/sobre')
  }

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

        <a className="header-badge-link" href="/sobre" onClick={handleSobre}>
          <div className="header-badge">Sobre</div>
        </a>

      </div>
    </header>
  )
}
