# Supabase policies - Olys V2.2

Este diretorio registra a politica versionavel de RLS/storage usada como base da Fase 6.

## Fonte versionada

- Migration principal: `supabase/migrations/20260510000000_security_phase_6.sql`

## Regras canonicas

- Login nao equivale a Admin.
- Admin exige registro confiavel em `public.user_roles`.
- Tabelas de usuario devem filtrar por `auth.uid()` usando `user_id` ou `id` em `profiles`.
- Storage pessoal deve usar bucket privado e path prefixado por `auth.uid()`.
- Frontend usa apenas anon key publica esperada pelo client Supabase.
- Service role nunca deve ser usada no browser.

## Aplicacao remota

Esta fase nao aplicou migrations em Supabase remoto. A aplicacao real deve acontecer em ambiente controlado com backup e revisao humana.
