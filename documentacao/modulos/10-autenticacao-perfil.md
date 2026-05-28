# Módulo: Autenticação e Perfil

## Objetivo

Adicionar autenticação de usuário e um perfil protegido para preparar funcionalidades futuras (ex.: favoritos e comparações personalizadas).

## Escopo implementado

- Login em `/login` com:
  - Google (Firebase Auth)
  - E-mail e senha
- Criação automática de conta ao tentar login por e-mail inexistente.
- Contas por e-mail/senha exigem confirmação de e-mail antes de concluir login.
- Proteção da rota `/perfil` com `ProtectedRoute`.
- Redirecionamento para `/login` quando o usuário não possui sessão válida.
- Página `/perfil` com leitura e atualização de nome de exibição.
- Página `/perfil` com leitura, atualização de nome de exibição e exclusão permanente de conta.
- Logout com encerramento de sessão no backend.

## Arquitetura técnica

### Frontend

- `AuthProvider` mantém estado global de autenticação (`loading`, `authenticated`, `unauthenticated`).
- `useAuth` expõe operações de login/logout/refresh.
- O frontend usa Firebase Auth apenas para obter ID token.
- A sessão persistente da aplicação é feita no backend via cookie `mt_session` (httpOnly).

### Backend (Vercel Functions)

- `GET /api/auth/csrf`: emite token CSRF e cookie `mt_csrf`.
- `POST /api/auth/session`: valida ID token no Firebase Admin e cria sessão segura.
- `DELETE /api/auth/session`: encerra sessão e limpa cookies de autenticação.
- `GET /api/auth/me`: retorna usuário autenticado da sessão atual.
- `GET /api/profile`: lê perfil do usuário autenticado.
- `PUT /api/profile`: atualiza perfil do usuário autenticado.
- `DELETE /api/profile`: exclui usuário no Firebase Authentication, remove documento de perfil no Firestore e encerra a sessão.

## Segurança aplicada

- Cookie de sessão com `httpOnly`, `SameSite` e `Secure` em produção.
- CSRF obrigatório em endpoints mutáveis.
- Validação de origem confiável (`Origin`) em endpoints sensíveis.
- Rate limit em memória por IP para autenticação e perfil.
- Validação de sessão no backend com Firebase Admin.

## Limitações atuais

- Sem recuperação de senha.
- Sem MFA.
- Rate limit em memória (por instância), sem storage distribuído.

## Próximas evoluções sugeridas

- Exigir verificação de e-mail também para operações críticas com provedores sem verificação nativa.
- Adicionar recuperação de senha no fluxo de login.
- Persistir auditoria de eventos de segurança.
- Evoluir rate limit para backend distribuído.
