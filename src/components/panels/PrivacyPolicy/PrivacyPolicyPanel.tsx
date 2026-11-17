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
          até que os dados do site sejam limpos manualmente. Essa escolha controla os scripts de análise
          do site; a exibição de anúncios segue as regras descritas na seção 4.
        </p>
      </article>

      <article className="privacy-panel__section">
        <h2>4. Publicidade (Google AdSense)</h2>
        <p>
          Este site exibe anúncios fornecidos pelo Google AdSense. Fornecedores terceiros, incluindo o Google,
          usam cookies para veicular anúncios com base em visitas anteriores do usuário a este e a outros sites.
        </p>
        <p>
          O uso de cookies de publicidade permite que o Google e seus parceiros veiculem anúncios para você com
          base nas suas visitas a este e/ou a outros sites na Internet.
        </p>
        <p>
          Você pode desativar a publicidade personalizada nas{' '}
          <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">
            Configurações de anúncios do Google
          </a>
          . Também é possível desativar o uso de cookies de fornecedores terceiros para publicidade
          personalizada em{' '}
          <a href="https://www.aboutads.info/choices" target="_blank" rel="noopener noreferrer">
            www.aboutads.info
          </a>
          .
        </p>
        <p>
          Saiba mais sobre como o Google usa dados em{' '}
          <a
            href="https://policies.google.com/technologies/partner-sites"
            target="_blank"
            rel="noopener noreferrer"
          >
            Como o Google usa informações de sites ou apps que utilizam nossos serviços
          </a>
          .
        </p>
      </article>

      <article className="privacy-panel__section">
        <h2>5. Fontes públicas e dados políticos</h2>
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
