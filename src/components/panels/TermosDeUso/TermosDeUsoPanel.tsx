import { Link } from 'react-router-dom'

import './TermosDeUsoPanel.css'

export function TermosDeUsoPanel() {
  return (
    <section className="privacy-panel termos-panel">
      <header className="privacy-panel__header">
        <span className="privacy-panel__label">Direitos e responsabilidades</span>
        <h1>Termos de Uso</h1>
        <p>
          Estes Termos de Uso regulam o acesso e a utilização do site Mandato Transparente. Ao acessar
          e usar esta plataforma, você concorda com os termos e condiçõnes estabelecidos abaixo.
        </p>
      </header>

      <article className="privacy-panel__section">
        <h2>1. Aceitação dos Termos</h2>
        <p>
          Ao utilizar o site Mandato Transparente, você concorda em cumprir estes Termos de Uso e todas
          as leis e regulamentações aplicáveis. Se você não concordar com qualquer parte destes termos,
          não deve utilizar este site.
        </p>
      </article>

      <article className="privacy-panel__section">
        <h2>2. Fonte dos Dados</h2>
        <p>
          As informações políticas e legislativas disponibilizadas no site são obtidas exclusivamente de
          fontes públicas oficiais, incluindo:
        </p>
        <ul>
          <li>API da Câmara dos Deputados (api.camara.leg.br)</li>
          <li>Portal do Senado Federal</li>
          <li>Portais e APIs das Assembleias Legislativas Estaduais</li>
        </ul>
        <p>
          Todos os dados refletem informações públicas e estão disponíveis sob licenças abertas das
          instituições governamentais.
        </p>
      </article>

      <article className="privacy-panel__section">
        <h2>3. Uso Permitido</h2>
        <p>Você pode utilizar este site para:</p>
        <ul>
          <li>Consultar informações sobre políticos brasileiros e sua atuação legislativa</li>
          <li>Acessar dados sobre proposições, votações e órgãos legislativos</li>
          <li>Realizar pesquisas com finalidades educacionais e cívicas</li>
          <li>Auxiliar sua tomada de decisão como eleitor</li>
        </ul>
      </article>

      <article className="privacy-panel__section">
        <h2>4. Uso Proibido</h2>
        <p>Fica expressamente proibido:</p>
        <ul>
          <li>Reproduzir, copiar ou distribuir o conteúdo do site sem autorização explícita</li>
          <li>Utilizar raspagem (scraping) ou acesso automatizado sem consentimento prévio</li>
          <li>Modificar, adaptar ou criar obras derivadas do conteúdo</li>
          <li>Revender dados obtidos do site para fins comerciais</li>
          <li>Utilizar o site para atividades ilícitas ou que violem direitos de terceiros</li>
          <li>Interferir ou tentar contornar medidas de segurança do site</li>
          <li>Enviar spam, malware ou conteúdo prejudicial</li>
        </ul>
      </article>

      <article className="privacy-panel__section">
        <h2>5. Propriedade Intelectual</h2>
        <p>
          O site Mandato Transparente e seu conteúdo original (textos, design, estrutura) são protegidos
          por direitos autorais. Os dados políticos, sendo públicos, estão disponíveis sob as licenças das
          instituições de origem.
        </p>
        <p>
          Você pode utilizar os dados públicos de acordo com as restrições estabelecidas pelas instituições
          oficiais e pelos termos deste site.
        </p>
      </article>

      <article className="privacy-panel__section">
        <h2>6. Sem Vínculo com Partidos ou Candidatos</h2>
        <p>
          O site Mandato Transparente é uma plataforma independente e neutra. Este site não possui vínculo
          com nenhum partido político, candidato ou organização política.
        </p>
        <p>
          O objetivo é fornecer informações precisas e acessíveis para auxiliar eleitores na tomada de
          decisões informadas.
        </p>
      </article>

      <article className="privacy-panel__section">
        <h2>7. Isenção de Garantias</h2>
        <p>
          O site é fornecido "como está" e "conforme disponível". Embora façamos esforços para manter a
          precisão dos dados, não oferecemos garantias de:
        </p>
        <ul>
          <li>Precisão absoluta ou completude dos dados</li>
          <li>Acesso contínuo e ininterrupto ao site</li>
          <li>Ausência de erros ou omissões</li>
        </ul>
        <p>
          Os dados são atualizados em tempo real a partir de fontes oficiais. Eventuais atrasos ou
          discrepâncias podem ocorrer.
        </p>
      </article>

      <article className="privacy-panel__section">
        <h2>8. Limitação de Responsabilidade</h2>
        <p>
          O site Mandato Transparente não se responsabiliza por:
        </p>
        <ul>
          <li>Decisões tomadas com base nas informações fornecidas</li>
          <li>Danos diretos ou indiretos resultantes do uso do site</li>
          <li>Interrupções ou indisponibilidade do serviço</li>
          <li>Perda de dados ou informações</li>
        </ul>
      </article>

      <article className="privacy-panel__section">
        <h2>9. Privacidade</h2>
        <p>
          Sua privacidade é importante para nós. Consulte nossa <Link to="/privacidade">Política de
          Privacidade e Cookies</Link> para entender como seus dados são tratados e coletados.
        </p>
      </article>

      <article className="privacy-panel__section">
        <h2>10. Modificações dos Termos</h2>
        <p>
          Reservamo-nos o direito de modificar estes Termos de Uso a qualquer momento. Alterações significativas
          serão notificadas no site. O uso continuado do site após alterações indica aceitação dos novos termos.
        </p>
      </article>

      <article className="privacy-panel__section">
        <h2>11. Lei Aplicável</h2>
        <p>
          Estes Termos de Uso são regidos pelas leis da República Federativa do Brasil.
        </p>
      </article>

      <article className="privacy-panel__section">
        <h2>12. Contato</h2>
        <p>
          Para dúvidas, sugestões ou questões sobre estes Termos de Uso, utilize a página de{' '}
          <Link to="/sugestoes">Sugestões</Link>.
        </p>
      </article>

      <p className="privacy-panel__footer">
        <strong>Última atualização:</strong> Agosto de 2026
      </p>
    </section>
  )
}
