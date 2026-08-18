import { Link } from 'react-router-dom'
import './Elections2026GuidePanel.css'

const BALLOT_ORDER = [
  ['01', 'Deputado federal', 'quatro dígitos'],
  ['02', 'Deputado estadual ou distrital no DF', 'cinco dígitos'],
  ['03', 'Senador para a primeira vaga', 'três dígitos'],
  ['04', 'Senador para a segunda vaga', 'três dígitos'],
  ['05', 'Governador e vice', 'dois dígitos'],
  ['06', 'Presidente e vice', 'dois dígitos'],
] as const

export function Elections2026GuidePanel() {
  return (
    <article className="elections-guide panel active" aria-labelledby="elections-guide-title">
      <header className="elections-guide-hero">
        <p className="elections-guide-kicker">Guia oficial para o eleitor</p>
        <h1 id="elections-guide-title">Eleições Gerais <em>2026</em></h1>
        <p className="elections-guide-intro">
          Entenda quando será a eleição, quais cargos estarão em disputa e como será a sequência
          de votação. Esta página não antecipa nomes: uma pessoa só deve ser apresentada como
          candidata após a publicação dos registros oficiais pela Justiça Eleitoral.
        </p>
      </header>

      <section className="elections-guide-overview" aria-labelledby="elections-overview-title">
        <div>
          <p className="elections-guide-eyebrow">O que será decidido</p>
          <h2 id="elections-overview-title">Representação nacional e estadual</h2>
          <p>
            O eleitorado escolherá representantes para a Câmara dos Deputados, assembleias
            legislativas ou Câmara Legislativa do Distrito Federal, Senado Federal, governos
            estaduais e Presidência da República.
          </p>
        </div>
        <div className="elections-guide-dates" aria-label="Datas das Eleições 2026">
          <div><span>1º turno</span><strong>4 de outubro</strong><small>domingo · 2026</small></div>
          <div><span>2º turno, se necessário</span><strong>25 de outubro</strong><small>domingo · 2026</small></div>
        </div>
      </section>

      <section className="elections-guide-section" aria-labelledby="elections-order-title">
        <p className="elections-guide-eyebrow">Na urna eletrônica</p>
        <h2 id="elections-order-title">A ordem das seis escolhas</h2>
        <ol className="elections-guide-ballot">
          {BALLOT_ORDER.map(([number, office, digits]) => (
            <li key={number}>
              <span aria-hidden="true">{number}</span>
              <div><strong>{office}</strong><small>{digits}</small></div>
            </li>
          ))}
        </ol>
      </section>

      <section className="elections-guide-section elections-guide-vote" aria-labelledby="elections-vote-title">
        <p className="elections-guide-eyebrow">Passo a passo</p>
        <h2 id="elections-vote-title">Como votar</h2>
        <div className="elections-guide-steps">
          <div><span>1</span><p>Digite o número da candidatura escolhida.</p></div>
          <div><span>2</span><p>Confira nome, foto, cargo e sigla partidária na tela.</p></div>
          <div><span>3</span><p>Se os dados estiverem corretos, aperte <strong>CONFIRMA</strong>.</p></div>
        </div>
        <p className="elections-guide-legend">
          Nos cargos proporcionais, quando aplicável, é possível votar na legenda digitando
          apenas os dois números do partido. Confira sempre a informação exibida antes de confirmar.
        </p>
      </section>

      <section className="elections-guide-cta" aria-labelledby="elections-search-title">
        <div>
          <p className="elections-guide-eyebrow">Pesquise antes de escolher</p>
          <h2 id="elections-search-title">Conheça os perfis disponíveis</h2>
          <p>Pesquise por nome, partido ou cargo e consulte informações públicas já disponíveis.</p>
        </div>
        <Link to="/candidatos-2026">Ver quem são os candidatos <span aria-hidden="true">→</span></Link>
      </section>

      <p className="elections-guide-source">
        Datas e ordem de votação conforme o{' '}
        <a href="https://www.tse.jus.br/comunicacao/noticias/2026/Marco/eleicoes-2026-conheca-a-ordem-de-votacao-na-urna-eletronica" rel="noopener noreferrer" target="_blank">
          Tribunal Superior Eleitoral (TSE)
        </a>.
      </p>
    </article>
  )
}
