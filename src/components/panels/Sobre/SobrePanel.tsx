import { Link } from 'react-router-dom'
import brazilLogo from '../../../assets/brazil-svgrepo-com.svg'
import { SupportProjectButton } from '../../common/SupportProjectButton'

import './SobrePanel.css'

export function SobrePanel() {
  return (
    <section className="sobre-panel">
      <div className="sobre-hero">
        <img
          className="sobre-hero-icon"
          src={brazilLogo}
          alt=""
          aria-hidden="true"
          width={72}
          height={72}
        />
        <h1>Sobre o Mandato Transparente</h1>
        <p>
          Uma ferramenta aberta para que todo cidadão brasileiro
          possa conhecer o histórico de seus representantes políticos antes
          de ir às urnas.
        </p>
        <SupportProjectButton className="sobre-support-action" />
      </div>

      {/* A ideia */}
      <div className="sobre-section">
        <div className="sobre-section-header">
          <span className="sobre-section-icon">💡</span>
          <h2>A Ideia</h2>
        </div>
        <p>
          O <strong>Mandato Transparente</strong> nasceu da necessidade de
          facilitar o acesso à informação política no Brasil. Em período
          eleitoral — e ao longo de todo o mandato — é fundamental que o
          eleitor saiba o que seus representantes estão fazendo no Congresso.
        </p>
        <p>
          A plataforma permite consultar deputados federais por estado,
          deputados estaduais e senadores, visualizar as proposições que
          apresentaram ou votaram e acompanhar como se posicionaram nas
          principais votações. Também é possível consultar o histórico dos
          presidentes da República e acessar listagens de candidatos para
          todos os cargos.
        </p>
        <p>
          Toda a informação é carregada em tempo real diretamente das
          fontes oficiais do governo, sem intermediários, garantindo
          dados sempre atualizados e confiáveis.
        </p>
      </div>

      {/* Criadores */}
      <div className="sobre-section sobre-section--oculta">
        <div className="sobre-section-header">
          <span className="sobre-section-icon">👥</span>
          <h2>Criadores</h2>
        </div>
        <div className="sobre-creators">
          <div className="sobre-creator-card">
            <div className="sobre-creator-avatar">F</div>
            <div className="sobre-creator-name">Fulano</div>
          </div>
          <div className="sobre-creator-card">
            <div className="sobre-creator-avatar">C</div>
            <div className="sobre-creator-name">Ciclano</div>
          </div>
        </div>
      </div>

      <div className="sobre-github-banner">
        <span className="sobre-github-icon">💻</span>
        <div className="sobre-github-text">
          <a
            href="https://github.com/andrelsehnem/analise-eleicoes"
            target="_blank"
            rel="noopener noreferrer"
            className="sobre-github-link"
          >
            Ver repositório no GitHub
          </a>
        </div>
      </div>

      {/* Fontes de dados */}
      <div className="sobre-section">
        <div className="sobre-section-header">
          <span className="sobre-section-icon">🗄️</span>
          <h2>Fontes de Dados</h2>
        </div>
        <div className="sobre-sources">
          <div className="sobre-source-item">
            <div className="sobre-source-dot" />
            <div className="sobre-source-info">
              <h3>API de Dados Abertos da Câmara dos Deputados</h3>
              <p>
                Dados de deputados federais, proposições legislativas e
                votações são obtidos diretamente da API pública da Câmara.
              </p>
              <p>
                <a
                  href="https://dadosabertos.camara.leg.br/index.html"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  dadosabertos.camara.leg.br
                </a>
              </p>
            </div>
          </div>

          <div className="sobre-source-item">
            <div className="sobre-source-dot" />
            <div className="sobre-source-info">
              <h3>API de Dados Abertos do Senado Federal</h3>
              <p>
                Dados de senadores, mandatos, comissões e cargos são obtidos
                diretamente da API pública do Senado Federal.
              </p>
              <p>
                <a
                  href="https://legis.senado.leg.br/dadosabertos/api-docs/swagger-ui/index.html"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  legis.senado.leg.br/dadosabertos
                </a>
              </p>
            </div>
          </div>

          <div className="sobre-source-item">
            <div className="sobre-source-dot" />
            <div className="sobre-source-info">
              <h3>Assembleias Legislativas Estaduais</h3>
              <p>
                Dados de deputados estaduais são obtidos de fontes oficiais das
                assembleias legislativas já integradas no projeto. Atualmente,
                o sistema consulta fontes de RS, SC, SP, RJ, MG e ES. O PR segue
                em integração gradual por instabilidade da origem oficial.
              </p>
              <p>
                <a
                  href="https://ww4.al.rs.gov.br:5000/listarDestaqueDeputados"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  ALRS (RS)
                </a>
                {' · '}
                <a
                  href="https://www.alesc.sc.gov.br/post_team-sitemap.xml"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  ALESC (SC)
                </a>
                {' · '}
                <a
                  href="https://legis-api-portal.pub.al.sp.gov.br/parlamentar-portal"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  ALESP (SP)
                </a>
              </p>
              <p>
                <a
                  href="https://www.alerj.rj.gov.br/Deputados/QuemSao"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  ALERJ (RJ)
                </a>
                {' · '}
                <a
                  href="https://www.almg.gov.br/a-assembleia/deputados/inicial/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  ALMG (MG)
                </a>
                {' · '}
                <a
                  href="https://www.al.es.gov.br/Deputado/Lista"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  ALES (ES)
                </a>
              </p>
            </div>
          </div>

          <div className="sobre-source-item">
            <div className="sobre-source-dot" />
            <div className="sobre-source-info">
              <h3>Portal do Governo Federal — Presidência da República</h3>
              <p>
                Informações e perfis dos presidentes da República são
                referenciados a partir do portal oficial do governo federal.
              </p>
              <p>
                <a
                  href="https://www.gov.br/planalto/pt-br/presidencia/presidente-da-republica"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  gov.br/planalto
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      <p className="sobre-footer-note">
        Os dados exibidos são de responsabilidade das fontes oficiais citadas acima.
        <br />
        Dúvidas ou sugestões? <Link to="/sugestoes">Entre em contato com a equipe</Link>
      </p>
    </section>
  )
}
