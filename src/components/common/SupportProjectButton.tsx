import { useEffect, useState } from 'react'
import { AppButton } from './AppButton'

import './SupportProjectButton.css'

interface SupportProjectButtonProps {
  className?: string
}

const PIX_KEY = '43432dd2-71af-4286-8724-a5f1a3eb4d21'
const FUTURE_SITE_URL = 'https://mandatotransparente.vercel.app/'

type OpenModal = 'support' | 'migration' | null

export function SupportProjectButton({ className = '' }: SupportProjectButtonProps) {
  const [openModal, setOpenModal] = useState<OpenModal>(null)
  const [copyFeedback, setCopyFeedback] = useState<string>('')

  useEffect(() => {
    if (!openModal) {
      return
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenModal(null)
      }
    }

    window.addEventListener('keydown', onKeyDown)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [openModal])

  const openSupportModal = () => {
    setCopyFeedback('')
    setOpenModal('support')
  }

  const openMigrationModal = () => {
    setOpenModal('migration')
  }

  const closeModal = () => {
    setOpenModal(null)
  }

  const copyPixKey = async () => {
    try {
      await navigator.clipboard.writeText(PIX_KEY)
      setCopyFeedback('Chave Pix copiada com sucesso!')
    } catch {
      setCopyFeedback('Não foi possível copiar automaticamente. Copie a chave manualmente.')
    }
  }

  return (
    <>
      <div className={`support-project-actions ${className}`.trim()}>
        <AppButton
          type="button"
          className="support-project-button"
          onClick={openSupportModal}
          aria-haspopup="dialog"
          aria-expanded={openModal === 'support'}
          aria-controls="support-project-modal"
        >
          Apoie o projeto
        </AppButton>

        <div className="support-project-migration-notice">
          <p>
            A partir de <strong>15/04/2028</strong>, este site será acessível apenas por{' '}
            <span>mandatotransparente.vercel.app</span>.
          </p>
          <AppButton
            type="button"
            className="support-project-migration-button"
            onClick={openMigrationModal}
            aria-haspopup="dialog"
            aria-expanded={openModal === 'migration'}
            aria-controls="migration-notice-modal"
          >
            Saiba mais
          </AppButton>
        </div>
      </div>

      {openModal === 'support' && (
        <div
          className="support-project-modal-overlay"
          role="presentation"
          onClick={(event) => {
            if (event.currentTarget === event.target) {
              closeModal()
            }
          }}
        >
          <div
            id="support-project-modal"
            className="support-project-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="support-project-modal-title"
            aria-describedby="support-project-modal-description"
          >
            <header className="support-project-modal-header">
              <h2 id="support-project-modal-title" className="support-project-modal-title">
                Apoie o Mandato Transparente
              </h2>
              <AppButton
                type="button"
                className="support-project-modal-close"
                autoFocus
                onClick={closeModal}
                aria-label="Fechar modal de apoio ao projeto"
              >
                Fechar
              </AppButton>
            </header>

            <div className="support-project-modal-content">
              <p id="support-project-modal-description" className="support-project-modal-description">
                Sua contribuição ajuda a manter a plataforma no ar e a evoluir novas funcionalidades
                para fortalecer o voto consciente.
              </p>

              <div className="support-project-pix-box">
                <span className="support-project-pix-label">Chave Pix</span>
                <p className="support-project-pix-key" aria-label="Chave Pix para apoio ao projeto">
                  {PIX_KEY}
                </p>
              </div>

              <div className="support-project-modal-actions">
                <AppButton type="button" className="support-project-copy-button" onClick={copyPixKey}>
                  Copiar chave Pix
                </AppButton>
              </div>

              {copyFeedback && (
                <p className="support-project-copy-feedback" role="status" aria-live="polite">
                  {copyFeedback}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {openModal === 'migration' && (
        <div
          className="support-project-modal-overlay"
          role="presentation"
          onClick={(event) => {
            if (event.currentTarget === event.target) {
              closeModal()
            }
          }}
        >
          <div
            id="migration-notice-modal"
            className="support-project-modal support-project-migration-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="migration-notice-modal-title"
            aria-describedby="migration-notice-modal-description"
          >
            <header className="support-project-modal-header">
              <h2 id="migration-notice-modal-title" className="support-project-modal-title">
                Mudança de endereço
              </h2>
              <AppButton
                type="button"
                className="support-project-modal-close"
                autoFocus
                onClick={closeModal}
                aria-label="Fechar aviso sobre mudança de endereço"
              >
                Fechar
              </AppButton>
            </header>

            <div className="support-project-modal-content migration-notice-content">
              <p id="migration-notice-modal-description" className="migration-notice-title">
                Um novo endere&ccedil;o, o mesmo compromisso com a transpar&ecirc;ncia
              </p>

              <p>
                A partir de <strong>15 de abril de 2028</strong>, o Mandato Transparente passar&aacute; a ser
                acess&iacute;vel exclusivamente pelo endere&ccedil;o{' '}
                <a href={FUTURE_SITE_URL} target="_blank" rel="noreferrer">
                  mandatotransparente.vercel.app
                </a>
                . O dom&iacute;nio mandatotransparente.com.br deixar&aacute; de ser mantido, mas o projeto continuar&aacute;
                dispon&iacute;vel para quem deseja acompanhar a plataforma.
              </p>

              <p>
                Essa decis&atilde;o foi tomada por uma necessidade financeira. Manter um projeto dispon&iacute;vel
                envolve custos, e a renova&ccedil;&atilde;o do dom&iacute;nio representa uma despesa que j&aacute; n&atilde;o consigo
                continuar assumindo. Como a vincula&ccedil;&atilde;o de propagandas n&atilde;o &eacute; aceita no projeto e n&atilde;o h&aacute;
                doa&ccedil;&otilde;es para ajudar a cobrir esses gastos, foi necess&aacute;rio encontrar uma forma mais
                sustent&aacute;vel de dar continuidade ao site.
              </p>

              <p>
                Compartilho essa mudan&ccedil;a com sinceridade e com um sentimento de carinho por tudo o que foi
                constru&iacute;do at&eacute; aqui. Por tr&aacute;s de uma plataforma, existem horas de trabalho, dedica&ccedil;&atilde;o e a
                vontade de oferecer algo &uacute;til &agrave;s pessoas. Mesmo sem retorno financeiro, o desejo de manter
                o Mandato Transparente acess&iacute;vel permanece.
              </p>

              <p>
                O endere&ccedil;o faz parte da identidade de um projeto, e deix&aacute;-lo para tr&aacute;s n&atilde;o &eacute; uma decis&atilde;o
                f&aacute;cil. Ainda assim, o que d&aacute; sentido a este trabalho vai al&eacute;m do dom&iacute;nio: est&aacute; na
                possibilidade de facilitar o acesso &agrave; informa&ccedil;&atilde;o e contribuir para que mais pessoas
                acompanhem a atua&ccedil;&atilde;o de seus representantes.
              </p>

              <p className="migration-notice-emphasis">
                O Mandato Transparente seguir&aacute; em frente, em uma nova casa. A mudan&ccedil;a permitir&aacute; reduzir os
                custos e preservar a continuidade da plataforma, mantendo vivo o prop&oacute;sito que motivou sua
                cria&ccedil;&atilde;o.
              </p>

              <p>
                Para continuar acompanhando o site, <strong>salve o novo endere&ccedil;o e atualize seus favoritos</strong>.
              </p>

              <a
                className="support-project-migration-link"
                href={FUTURE_SITE_URL}
                target="_blank"
                rel="noreferrer"
              >
                Acessar mandatotransparente.vercel.app
              </a>

              <p>
                Se voc&ecirc; compartilhou o site em redes sociais, grupos ou outros espa&ccedil;os, pe&ccedil;o tamb&eacute;m que
                atualize o link quando poss&iacute;vel. Esse cuidado ajuda outras pessoas a encontrar a plataforma
                depois da mudan&ccedil;a.
              </p>

              <p>
                Agrade&ccedil;o a cada pessoa que visita, utiliza e compartilha o Mandato Transparente. Saber que
                este trabalho pode ser &uacute;til &eacute; parte importante da motiva&ccedil;&atilde;o para continuar.
              </p>

              <p className="migration-notice-closing">
                Obrigado por fazer parte dessa hist&oacute;ria. Nos encontramos no novo endere&ccedil;o.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
