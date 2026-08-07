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
    <footer className="disclaimer-wrap">
      <div className="disclaimer">
        <strong>Fonte dos Dados:</strong> Todos os dados são obtidos em tempo real da API
        pública da Câmara dos Deputados do Brasil (api.camara.leg.br). As informações refletem
        a legislatura atual (58ª). Este site não possui vínculo com partidos políticos ou
        candidatos. <strong>Objetivo:</strong> Auxiliar o eleitor a tomar uma decisão mais
        informada nas eleições.
      </div>
      <div className="disclaimer-links">
        <a href="/privacidade" onClick={handlePrivacidade} className="disclaimer-link">
          Política de Privacidade
        </a>
        <a href="/termos" onClick={handleTermos} className="disclaimer-link">
          Termos de Uso
        </a>
      </div>
    </footer>
  )
}
