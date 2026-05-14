# Módulo: Política de Privacidade e Cookies

## Objetivo

Registrar e aplicar consentimento de cookies/rastreamento antes de carregar scripts não essenciais.

## Implementação

- Página: `src/components/pages/PrivacyPolicyPage.tsx`
- Painel: `src/components/panels/PrivacyPolicy/PrivacyPolicyPanel.tsx`
- Banner: `src/components/common/CookieBanner.tsx`
- Provider de consentimento: `src/hooks/CookieConsentProvider.tsx`
- Hook de consumo: `src/hooks/useCookieConsent.ts`
- Persistência localStorage: `src/utils/cookieConsent.ts`
- Ativação condicional de tracking: `src/utils/trackingConsent.ts`

## Regras de negócio

- `ACEITAR`
  - salva em localStorage: `{ "cookieConsent": "accepted", "date": "<ISO>" }`
  - oculta o banner imediatamente
  - habilita scripts de rastreamento
- `REJEITAR`
  - salva em localStorage: `{ "cookieConsent": "rejected" }`
  - oculta o banner imediatamente
  - não habilita scripts de rastreamento
- `X` (fechar)
  - salva em localStorage: `{ "cookieConsent": "dismissed", "dismissUntil": "<ISO+30d>" }`
  - oculta o banner temporariamente
  - reapresenta após 30 dias

## Observações

- O componente `Analytics` da Vercel é renderizado apenas com consentimento aceito.
- O script de anúncios deixou de ser injetado em `index.html` e passou para carregamento condicional.
- O link do banner aponta para a rota `/privacidade`.
