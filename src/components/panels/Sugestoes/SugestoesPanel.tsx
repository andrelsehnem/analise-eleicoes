import { useEffect, useRef, useState } from 'react'
import { AppButton } from '../../common/AppButton'
import { ErrorBox } from '../../common/ErrorBox'
import { useSuggestionForm } from '../../../hooks/useSuggestionForm'

import './SugestoesPanel.css'

declare global {
  interface Window {
    mtTurnstileSuccess?: (token: string) => void
    mtTurnstileExpired?: () => void
    mtTurnstileError?: () => void
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string
          theme?: 'dark' | 'light' | 'auto'
          callback?: (token: string) => void
          'expired-callback'?: () => void
          'error-callback'?: (errorCode?: string) => void
        },
      ) => string
      reset: (widgetId?: string) => void
      remove: (widgetId: string) => void
    }
  }
}

export function SugestoesPanel() {
  const {
    fields,
    errors,
    submitError,
    successMessage,
    isSubmitting,
    canRenderCaptcha,
    turnstileSiteKey,
    setCaptchaToken,
    setField,
    handleSubmit,
  } = useSuggestionForm()
  const captchaContainerRef = useRef<HTMLDivElement | null>(null)
  const widgetIdRef = useRef<string | null>(null)
  const [captchaStatus, setCaptchaStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [captchaErrorDetail, setCaptchaErrorDetail] = useState('')

  useEffect(() => {
    window.mtTurnstileSuccess = (token: string) => {
      setCaptchaToken(token)
    }

    window.mtTurnstileExpired = () => {
      setCaptchaToken('')
    }

    window.mtTurnstileError = () => {
      setCaptchaToken('')
    }

    return () => {
      delete window.mtTurnstileSuccess
      delete window.mtTurnstileExpired
      delete window.mtTurnstileError
    }
  }, [setCaptchaToken])

  useEffect(() => {
    if (!canRenderCaptcha) {
      return
    }

    const renderTurnstile = () => {
      if (!captchaContainerRef.current || !window.turnstile || !turnstileSiteKey) {
        setCaptchaStatus('error')
        return
      }

      if (widgetIdRef.current) {
        return
      }

      try {
        setCaptchaStatus('loading')
        setCaptchaErrorDetail('')

        widgetIdRef.current = window.turnstile.render(captchaContainerRef.current, {
          sitekey: turnstileSiteKey,
          theme: 'dark',
          callback: (token: string) => {
            setCaptchaToken(token)
            setCaptchaStatus('ready')
          },
          'expired-callback': () => {
            setCaptchaToken('')
          },
          'error-callback': (errorCode?: string) => {
            setCaptchaToken('')
            setCaptchaStatus('error')

            if (errorCode) {
              setCaptchaErrorDetail(`Código do Turnstile: ${errorCode}`)
            }
          },
        })
      } catch {
        setCaptchaStatus('error')
      }
    }

    const scriptId = 'turnstile-script'
    const existingScript = document.getElementById(scriptId) as HTMLScriptElement | null
    let scriptLoadHandler: (() => void) | null = null
    let scriptErrorHandler: (() => void) | null = null

    if (existingScript && window.turnstile) {
      renderTurnstile()
      return
    }

    if (!existingScript) {
      const script = document.createElement('script')
      script.id = scriptId
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
      script.async = true
      script.defer = true
      scriptLoadHandler = () => {
        renderTurnstile()
      }
      scriptErrorHandler = () => {
        setCaptchaStatus('error')
        setCaptchaErrorDetail('Falha ao baixar o script do captcha.')
      }
      script.addEventListener('load', scriptLoadHandler)
      script.addEventListener('error', scriptErrorHandler)
      document.body.appendChild(script)
    } else {
      scriptLoadHandler = () => {
        renderTurnstile()
      }
      scriptErrorHandler = () => {
        setCaptchaStatus('error')
        setCaptchaErrorDetail('Falha ao baixar o script do captcha.')
      }
      existingScript.addEventListener('load', scriptLoadHandler)
      existingScript.addEventListener('error', scriptErrorHandler)
    }

    const timeoutId = window.setTimeout(() => {
      if (!window.turnstile || !widgetIdRef.current) {
        setCaptchaStatus('error')
        setCaptchaErrorDetail('Tempo limite excedido ao carregar o captcha.')
      }
    }, 10000)

    return () => {
      window.clearTimeout(timeoutId)

      const script = document.getElementById(scriptId) as HTMLScriptElement | null

      if (script && scriptLoadHandler) {
        script.removeEventListener('load', scriptLoadHandler)
      }

      if (script && scriptErrorHandler) {
        script.removeEventListener('error', scriptErrorHandler)
      }

      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current)
        widgetIdRef.current = null
      }
    }
  }, [canRenderCaptcha, setCaptchaToken, turnstileSiteKey])

  useEffect(() => {
    if (!successMessage) {
      return
    }

    if (widgetIdRef.current) {
      window.turnstile?.reset(widgetIdRef.current)
    }
  }, [successMessage])

  return (
    <section className="sugestoes-panel" aria-labelledby="titulo-sugestoes">
      <div className="sugestoes-header">
        <h1 id="titulo-sugestoes">Envie sua sugestão</h1>
        <p>
          Sua opinião ajuda a melhorar o Mandato Transparente. Campos com * são obrigatórios.
        </p>
        <p>
          Preencha abaixo ou então encaminhe um e-mail para andrelsehnem@gmail.com
        </p>
      </div>

      <form className="sugestoes-form" onSubmit={handleSubmit} noValidate>
        <div className="sugestoes-grid">
          <div className="sugestoes-field">
            <label htmlFor="nome">Nome *</label>
            <input
              id="nome"
              name="nome"
              type="text"
              autoComplete="name"
              maxLength={100}
              value={fields.nome}
              onChange={(event) => setField('nome', event.target.value)}
              aria-invalid={Boolean(errors.nome)}
              aria-describedby={errors.nome ? 'erro-nome' : undefined}
            />
            {errors.nome ? <p className="sugestoes-error" id="erro-nome">{errors.nome}</p> : null}
          </div>

          <div className="sugestoes-field">
            <label htmlFor="telefone">Telefone (opcional)</label>
            <input
              id="telefone"
              name="telefone"
              type="tel"
              autoComplete="tel"
              maxLength={30}
              value={fields.telefone}
              onChange={(event) => setField('telefone', event.target.value)}
              aria-invalid={Boolean(errors.telefone)}
              aria-describedby={errors.telefone ? 'erro-telefone' : undefined}
            />
            {errors.telefone ? <p className="sugestoes-error" id="erro-telefone">{errors.telefone}</p> : null}
          </div>
        </div>

        <div className="sugestoes-field">
          <label htmlFor="email">E-mail (opcional)</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            maxLength={160}
            value={fields.email}
            onChange={(event) => setField('email', event.target.value)}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'erro-email' : undefined}
          />
          {errors.email ? <p className="sugestoes-error" id="erro-email">{errors.email}</p> : null}
        </div>

        <div className="sugestoes-field">
          <label htmlFor="assunto">Assunto *</label>
          <input
            id="assunto"
            name="assunto"
            type="text"
            maxLength={120}
            value={fields.assunto}
            onChange={(event) => setField('assunto', event.target.value)}
            aria-invalid={Boolean(errors.assunto)}
            aria-describedby={errors.assunto ? 'erro-assunto' : undefined}
          />
          {errors.assunto ? <p className="sugestoes-error" id="erro-assunto">{errors.assunto}</p> : null}
        </div>

        <div className="sugestoes-field">
          <label htmlFor="descricao">Descrição *</label>
          <textarea
            id="descricao"
            name="descricao"
            rows={6}
            maxLength={2000}
            value={fields.descricao}
            onChange={(event) => setField('descricao', event.target.value)}
            aria-invalid={Boolean(errors.descricao)}
            aria-describedby={errors.descricao ? 'erro-descricao' : 'descricao-ajuda'}
          />
          <p className="sugestoes-help" id="descricao-ajuda">Mínimo de 10 e máximo de 2000 caracteres.</p>
          {errors.descricao ? <p className="sugestoes-error" id="erro-descricao">{errors.descricao}</p> : null}
        </div>

        {canRenderCaptcha ? (
          <div className="sugestoes-captcha-wrap">
            <div ref={captchaContainerRef} className="sugestoes-captcha" />
            {captchaStatus === 'loading' ? (
              <p className="sugestoes-help">Carregando verificação anti-spam...</p>
            ) : null}
            {captchaStatus === 'error' ? (
              <ErrorBox
                message={
                  captchaErrorDetail
                    ? `Não foi possível carregar o captcha. ${captchaErrorDetail}`
                    : 'Não foi possível carregar o captcha. Verifique bloqueadores de conteúdo, DNS/rede ou a configuração da chave do Turnstile para este domínio.'
                }
              />
            ) : null}
            {errors.captchaToken ? <p className="sugestoes-error">{errors.captchaToken}</p> : null}
          </div>
        ) : (
          <ErrorBox message="Captcha não configurado. Defina VITE_TURNSTILE_SITE_KEY para habilitar o envio de sugestões." />
        )}

        {submitError ? <ErrorBox message={submitError} /> : null}
        {successMessage ? <p className="sugestoes-success" role="status">{successMessage}</p> : null}

        <div className="sugestoes-actions">
          <AppButton
            className="sugestoes-submit-btn"
            type="submit"
            disabled={isSubmitting || !canRenderCaptcha || captchaStatus !== 'ready'}
          >
            {isSubmitting ? 'Enviando...' : 'Enviar sugestão'}
          </AppButton>
        </div>
      </form>
    </section>
  )
}
