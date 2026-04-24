import { useMemo, useState } from 'react'
import { submitSuggestion } from '../api/sugestoesApi'
import type { SuggestionPayload } from '../types/camara'

type SuggestionFormFields = {
  nome: string
  telefone: string
  email: string
  assunto: string
  descricao: string
}

type SuggestionFormErrors = Partial<Record<keyof SuggestionFormFields | 'captchaToken', string>>

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const INITIAL_FIELDS: SuggestionFormFields = {
  nome: '',
  telefone: '',
  email: '',
  assunto: '',
  descricao: '',
}

export function useSuggestionForm() {
  const [fields, setFields] = useState<SuggestionFormFields>(INITIAL_FIELDS)
  const [captchaToken, setCaptchaToken] = useState('')
  const [errors, setErrors] = useState<SuggestionFormErrors>({})
  const [submitError, setSubmitError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined

  const canRenderCaptcha = useMemo(
    () => Boolean(turnstileSiteKey && turnstileSiteKey.trim()),
    [turnstileSiteKey],
  )

  function setField<K extends keyof SuggestionFormFields>(key: K, value: SuggestionFormFields[K]) {
    setFields((current) => ({ ...current, [key]: value }))
  }

  function validate(values: SuggestionFormFields, token: string): SuggestionFormErrors {
    const nextErrors: SuggestionFormErrors = {}

    const nome = values.nome.trim()
    const telefone = values.telefone.trim()
    const email = values.email.trim()
    const assunto = values.assunto.trim()
    const descricao = values.descricao.trim()

    if (!nome) {
      nextErrors.nome = 'Informe seu nome.'
    } else if (nome.length < 2 || nome.length > 100) {
      nextErrors.nome = 'O nome deve ter entre 2 e 100 caracteres.'
    }

    if (telefone && telefone.length > 30) {
      nextErrors.telefone = 'O telefone deve ter no máximo 30 caracteres.'
    }

    if (email && !EMAIL_REGEX.test(email)) {
      nextErrors.email = 'Informe um e-mail válido.'
    }

    if (!assunto) {
      nextErrors.assunto = 'Informe o assunto.'
    } else if (assunto.length < 3 || assunto.length > 120) {
      nextErrors.assunto = 'O assunto deve ter entre 3 e 120 caracteres.'
    }

    if (!descricao) {
      nextErrors.descricao = 'Descreva sua sugestão.'
    } else if (descricao.length < 10 || descricao.length > 2000) {
      nextErrors.descricao = 'A descrição deve ter entre 10 e 2000 caracteres.'
    }

    if (!token.trim()) {
      nextErrors.captchaToken = 'Confirme que você não é um robô.'
    }

    return nextErrors
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedFields: SuggestionFormFields = {
      nome: fields.nome.trim(),
      telefone: fields.telefone.trim(),
      email: fields.email.trim(),
      assunto: fields.assunto.trim(),
      descricao: fields.descricao.trim(),
    }

    const validationErrors = validate(trimmedFields, captchaToken)
    setErrors(validationErrors)
    setSubmitError('')
    setSuccessMessage('')

    if (Object.keys(validationErrors).length > 0) {
      return
    }

    const payload: SuggestionPayload = {
      nome: trimmedFields.nome,
      telefone: trimmedFields.telefone || undefined,
      email: trimmedFields.email || undefined,
      assunto: trimmedFields.assunto,
      descricao: trimmedFields.descricao,
      captchaToken,
    }

    setIsSubmitting(true)

    try {
      const response = await submitSuggestion(payload)
      setSuccessMessage(response.message)
      setFields(INITIAL_FIELDS)
      setCaptchaToken('')
      setErrors({})
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : 'Não foi possível enviar sua sugestão. Tente novamente.'
      setSubmitError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    fields,
    errors,
    submitError,
    successMessage,
    isSubmitting,
    canRenderCaptcha,
    turnstileSiteKey,
    captchaToken,
    setCaptchaToken,
    setField,
    handleSubmit,
  }
}
