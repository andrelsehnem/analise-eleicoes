import { Link } from 'react-router-dom'

import './PrivacyPolicyPanel.css'

export function PrivacyPolicyPanel() {
  return (
    <section className="privacy-panel">
      <header className="privacy-panel__header">
        <span className="privacy-panel__label">Transparência e privacidade</span>
        <h1>Política de Privacidade e Cookies</h1>
        <p>
          Esta política explica quais dados são processados no Mandato Transparente e como você controla
          o uso de cookies de medição e rastreamento.
        </p>
      </header>

      <article className="privacy-panel__section">
        <h2>1. Dados de navegação e consentimento</h2>
        <p>
          O banner de cookies registra sua escolha no navegador (localStorage), com um dos estados:
          <strong> aceito</strong>, <strong>rejeitado</strong> ou <strong>adiado por 30 dias</strong>.
        </p>
        <p>
          O fechamento no ícone “X” apenas adia a decisão por 30 dias. Após esse período, o aviso volta a ser exibido.
        </p>
      </article>

      <article className="privacy-panel__section">
        <h2>2. O que acontece quando você aceita</h2>
        <p>
          Com consentimento explícito, o site pode carregar scripts de mensuração e rastreamento para
          análise de desempenho e melhoria contínua da experiência.
        </p>
      </article>

      <article className="privacy-panel__section">
        <h2>3. O que acontece quando você rejeita</h2>
        <p>
          Ao rejeitar, scripts de rastreamento não são carregados. Sua decisão permanece salva neste navegador
          até que os dados do site sejam limpos manualmente.
        </p>
      </article>

      <article className="privacy-panel__section">
        <h2>4. Fontes públicas e dados políticos</h2>
        <p>
          As informações políticas exibidas pela plataforma são obtidas de APIs e fontes oficiais públicas,
          conforme detalhado na página <Link to="/sobre">Sobre</Link>.
        </p>
      </article>

      <p className="privacy-panel__footer">
        Para dúvidas, sugestões ou solicitações, utilize a página <Link to="/sugestoes">Sugestões</Link>.
      </p>
    </section>
  )
}
