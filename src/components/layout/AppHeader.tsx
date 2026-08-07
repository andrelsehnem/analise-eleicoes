import { useNavigate } from 'react-router-dom'

import brazilLogo from '../../assets/brazil-svgrepo-com.svg'

export function AppHeader() {
  const navigate = useNavigate()

  function handleSobre(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault()
    navigate('/sobre')
  }

  function handleSugestoes(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault()
    navigate('/sugestoes')
  }

  function handleInformacoesGerais(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault()
    navigate('/informacoes-gerais')
  }

  function handlePerfil(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault()
    navigate('/perfil')
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

        <nav className="header-nav" aria-label="Navegação principal">
          <a className="header-badge-link" href="/informacoes-gerais" onClick={handleInformacoesGerais}>
            <div className="header-badge">Informações gerais</div>
          </a>
          <a className="header-badge-link" href="/sugestoes" onClick={handleSugestoes}>
            <div className="header-badge">Sugestões</div>
          </a>
          <a className="header-badge-link" href="/sobre" onClick={handleSobre}>
            <div className="header-badge">Sobre</div>
          </a>
          <a
            className="header-profile-link"
            href="/perfil"
            onClick={handlePerfil}
            aria-label="Ir para perfil"
            title="Perfil"
          >
            <span className="header-profile-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="16" height="16" focusable="false">
                <path
                  d="M12 12.8a5.2 5.2 0 1 1 0-10.4 5.2 5.2 0 0 1 0 10.4Zm0-8.8a3.6 3.6 0 1 0 0 7.2 3.6 3.6 0 0 0 0-7.2Zm0 19.6c-4.8 0-8.8-2.2-8.8-4.8 0-2.8 3.2-5.2 7.6-5.8.44-.07.84.25.9.68.06.44-.25.84-.68.9-3.57.5-6.22 2.3-6.22 4.22 0 1.5 2.95 3.2 7.2 3.2s7.2-1.7 7.2-3.2c0-1.93-2.63-3.72-6.2-4.22a.8.8 0 0 1-.68-.9.8.8 0 0 1 .9-.68c4.38.6 7.58 3.04 7.58 5.8 0 2.6-4 4.8-8.8 4.8Z"
                  fill="currentColor"
                />
              </svg>
            </span>
          </a>
        </nav>

        <nav className="header-mobile-links" aria-label="Atalhos principais">
          <a className="header-mobile-link" href="/informacoes-gerais" onClick={handleInformacoesGerais}>
            Informações gerais
          </a>
          <a className="header-mobile-link" href="/sugestoes" onClick={handleSugestoes}>
            Sugestões
          </a>
          <a className="header-mobile-link" href="/sobre" onClick={handleSobre}>
            Sobre
          </a>
        </nav>

      </div>
    </header>
  )
}
