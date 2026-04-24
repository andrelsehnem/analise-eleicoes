import { useNavigate } from 'react-router-dom'

import brazilLogo from '../../assets/brazil-svgrepo-com.svg'

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
          <img
            className="logo-seal"
            src={brazilLogo}
            alt=""
            aria-hidden="true"
            width={44}
            height={44}
          />
          <div className="logo-text">
            <div className="logo-title">Mandato Transparente</div>
            <div className="logo-sub">Análise de Políticos do Brasil</div>
          </div>
        </a>
        
        <div className="header-sep" />

        <nav aria-label="Navegação principal">
          <a className="header-badge-link" href="/sobre" onClick={handleSobre}>
            <div className="header-badge">Sobre</div>
          </a>
        </nav>

      </div>
    </header>
  )
}
