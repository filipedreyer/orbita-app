# Plano Operacional Pos-RC

## 1. Supabase remoto

- Criar backup do projeto antes de aplicar migrations.
- Aplicar `supabase/migrations/20260510000000_security_phase_6.sql` em ambiente controlado.
- Validar RLS por usuario autenticado, usuario sem role e Admin.
- Validar que nenhuma service role e usada no browser.
- Registrar resultado em nova auditoria operacional.

## 2. Admin

- Definir operador responsavel pela concessao inicial.
- Inserir primeira role em `user_roles` fora do frontend.
- Testar `AdminRoute` com role concedida, role ausente e falha de consulta.
- Registrar runbook de bootstrap e rollback.

## 3. Storage e anexos

- Criar schema de anexos com `bucket`, `path`, `mime_type`, `owner_id` e timestamps.
- Migrar leitura de `image_url` para resolver signed URL em runtime.
- Manter fallback legado ate inventario completo.
- Validar expiracao e refresh de signed URLs.

## 4. Dados legados

- Inventariar registros `ideia` e `inegociavel`.
- Definir mapeamento por amostra real.
- Executar backup.
- Rodar migracao dry-run.
- Aplicar migracao com rollback documentado.

## 5. Pos-RC de produto

- Integrar asset oficial Olys.
- Implementar busca global.
- Criar destinos canonicos para Menu e Acesso.
- Remover rotas/aliases legados somente apos migracao real validada.
