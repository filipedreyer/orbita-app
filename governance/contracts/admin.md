# Contrato - Admin

## Canonico

Admin nao e navegacao primaria do usuario final. Deve ser protegido por autorizacao explicita alem de autenticacao simples.

## Regras

- Admin nao entra na TopBar nem BottomNav.
- Admin pode continuar como rota preservada enquanto a seguranca nao for migrada.
- Role/claim/RLS devem ser definidos antes de ampliar capacidades administrativas.
- Login nao equivale a Admin.
- A rota Admin deve usar guard fail closed.
- Quando `user_roles` nao existir ou nao puder ser consultada, o usuario autenticado deve ser tratado como nao admin.
- Central nao deve expor Admin como acesso primario para todo usuario autenticado.

## Enforcement Fase 6

- `src/features/admin/AdminRoute.tsx` bloqueia acesso sem role confirmada.
- `src/features/admin/useAdminRole.ts` consulta `public.user_roles`.
- `src/services/admin.ts` encapsula a verificacao de role e retorna `isAdmin = false` em erro.
- `supabase/migrations/20260510000000_security_phase_6.sql` cria `user_roles` e policies basicas.

## Fora de escopo nesta fase

- Promover usuarios reais a admin em ambiente remoto.
- Criar UI de gestao de roles.
- Declarar seguranca administrativa completa sem aplicar e validar a migration remota.
