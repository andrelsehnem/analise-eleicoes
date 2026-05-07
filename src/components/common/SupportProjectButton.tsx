import { useEffect, useState } from 'react'
import { AppButton } from './AppButton'

import './SupportProjectButton.css'

interface SupportProjectButtonProps {
  className?: string
}

const PIX_KEY = '43432dd2-71af-4286-8724-a5f1a3eb4d21'

export function SupportProjectButton({ className = '' }: SupportProjectButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [copyFeedback, setCopyFeedback] = useState<string>('')

  useEffect(() => {
    if (!isModalOpen) {
      return
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsModalOpen(false)
      }
    }

    window.addEventListener('keydown', onKeyDown)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [isModalOpen])

  const openModal = () => {
    setCopyFeedback('')
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
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
          onClick={openModal}
          aria-haspopup="dialog"
        >
          Apoie o projeto
        </AppButton>
      </div>

      {isModalOpen && (
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
    </>
  )
}