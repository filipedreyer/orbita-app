# Plano RLS e policies - Fase 6

## Objetivo

Versionar a base minima de RLS para impedir que dados pessoais dependam apenas de filtros no frontend.

## Migration

Arquivo: `supabase/migrations/20260510000000_security_phase_6.sql`

## Tabelas cobertas

- `profiles`: ownership por `id = auth.uid()`.
- `items`: ownership por `user_id = auth.uid()`.
- `sub_items`: ownership por `user_id = auth.uid()`.
- `inbox`: ownership por `user_id = auth.uid()`.
- `habit_logs`: ownership por `user_id = auth.uid()`.
- `user_roles`: leitura da propria role e gestao apenas por Admin.
- `admin_audit_log`: leitura/insercao apenas por Admin.

## Regras

- RLS deve ficar habilitada nas tabelas de usuario.
- Select/insert/update/delete usam ownership.
- Admin deve ser role explicita em `user_roles`.
- Policies reais precisam ser aplicadas via ambiente controlado, nao pelo browser.

## Bloqueio atual

Nao houve conexao remota Supabase nesta fase. A migration esta pronta para revisao/aplicacao, mas nao foi executada no banco remoto.
