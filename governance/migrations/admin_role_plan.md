# Plano Admin e roles - Fase 6

## Objetivo

Garantir que Admin nao seja equivalente a usuario autenticado.

## Implementado no frontend

- `src/services/admin.ts`: consulta `public.user_roles` e falha fechado.
- `src/features/admin/useAdminRole.ts`: hook unico de autorizacao Admin.
- `src/features/admin/AdminRoute.tsx`: guard da rota `/central/admin`.
- `src/features/central/CentralPage.tsx`: nao apresenta Admin como link liberado sem role confirmada.

## Implementado em SQL versionado

- Tabela `public.user_roles`.
- Funcao `public.is_admin`.
- Tabela `public.admin_audit_log`.
- Policies para leitura/gestao de roles e auditoria.

## Regras operacionais

- Primeira concessao de Admin deve ocorrer fora do browser, em processo controlado.
- Service role nunca deve ser exposta no frontend.
- Se `user_roles` nao existir ou falhar, o acesso Admin fica bloqueado.

## Dividas

- Criar UI administrativa para ver audit log depois da aplicacao real da migration.
- Definir processo de bootstrap do primeiro Admin.
- Validar claims customizadas somente se o backend passar a emiti-las com confianca.
