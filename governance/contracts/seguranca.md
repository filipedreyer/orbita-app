# Contrato - Seguranca

## Canonico

Seguranca no Olys nao e detalhe futuro. Autenticacao, ownership, RLS, storage privado e Admin com role real sao pre-condicoes para avancar backend hardening.

## Regras

- Login nao equivale a Admin.
- Admin deve falhar fechado quando role/claim/tabela nao puder ser confirmada.
- Frontend nunca usa service role.
- Anon key do Supabase pode existir no client, mas somente como chave publica esperada.
- Dados pessoais devem ser protegidos por RLS versionada.
- Operacoes por usuario devem depender de `auth.uid()` e ownership.
- Anexos pessoais devem tender a bucket privado com signed URL.
- `image_url` legado pode ser lido temporariamente, mas nao e contrato final.
- Toda excecao de seguranca deve virar divida explicita.

## Enforcement minimo Fase 6

- `AdminRoute` protege a rota Admin por `user_roles`.
- `useAdminRole` consulta role e falha fechado em erro/ausencia de tabela.
- `src/services/storage.ts` centraliza upload de anexos e usa signed URL.
- `supabase/migrations/20260510000000_security_phase_6.sql` versiona user roles, audit log, RLS e storage privado.

## Fora de escopo nesta fase

- Aplicar migration em Supabase remoto sem confirmacao humana.
- Declarar conformidade legal/LGPD.
- Migrar anexos antigos ou apagar `image_url`.
