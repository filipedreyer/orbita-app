# Contrato - Admin

## Canonico

Admin nao e navegacao primaria do usuario final. Deve ser protegido por autorizacao explicita alem de autenticacao simples.

## Regras

- Admin nao entra na TopBar nem BottomNav.
- Admin pode continuar como rota preservada enquanto a seguranca nao for migrada.
- Role/claim/RLS devem ser definidos antes de ampliar capacidades administrativas.

## Fora de escopo nesta fase

- Implementar role admin.
- Alterar RLS.
- Refatorar pagina Admin.

