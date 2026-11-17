# Módulo: Política de Privacidade e Cookies

## Objetivo

Registrar e aplicar consentimento de cookies/rastreamento antes de carregar scripts não essenciais.

## Implementação

- Página: `src/components/pages/PrivacyPolicyPage.tsx`
- Página de termos: `src/components/pages/TermosPage.tsx`
- Painel: `src/components/panels/PrivacyPolicy/PrivacyPolicyPanel.tsx`
- Banner: `src/components/common/CookieBanner.tsx`
- Provider de consentimento: `src/hooks/CookieConsentProvider.tsx`
- Hook de consumo: `src/hooks/useCookieConsent.ts`
- Persistência localStorage: `src/utils/cookieConsent.ts`
- Ativação condicional de tracking: `src/utils/trackingConsent.ts`

## Descoberta para buscadores

- As rotas legais `/privacidade` e `/termos` fazem parte do `public/sitemap.xml` gerado por script.
- O arquivo `public/prerender-routes.json` inclui as duas rotas para geração de HTML estático sem dependência de JavaScript.
- O fallback prerender entrega título, descrição e contexto textual mínimo para crawlers que não executam hidratação completa.

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
- Anúncios: Google AdSense (`ca-pub-7478664676745892`). O script `adsbygoogle.js` é carregado em `index.html` e `public/ads.txt` declara o publisher.
- Bloco manual de anúncio: `src/components/ads/AdSlot.tsx`, renderizado em `AppLayout` ao fim de cada página (recriado a cada troca de rota). Só aparece se `VITE_ADSENSE_SLOT_ID` estiver definida.
- A CSP em `vercel.json` libera `*.googlesyndication.com`, `*.doubleclick.net`, `*.google.com`, `*.adtrafficquality.google` e `*.gstatic.com`.
- O consentimento para EEE/Reino Unido é tratado pela mensagem de privacidade (CMP) do próprio AdSense; o banner do site controla apenas Analytics/GTM.
- A integração anterior com Adsterra foi removida.
- O link do banner aponta para a rota `/privacidade`.
