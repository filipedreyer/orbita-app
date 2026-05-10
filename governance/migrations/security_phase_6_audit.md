# Auditoria Fase 6 - Seguranca, Storage, RLS e Admin

## Escopo auditado

- `src/lib/supabase.ts`
- `src/services/*`
- `src/features/admin/*`
- `src/features/central/*`
- `src/lib/inbox-attachments.ts`
- `src/features/memoria/AnexosPage.tsx`
- `supabase/functions/*`
- Uso de `getPublicUrl`, `publicUrl`, `image_url`, `service_role`, `VITE_SUPABASE`, ownership e Admin.

## Aderente

| Item | Evidencia |
|---|---|
| Service role nao esta no frontend | Nenhuma chave service role foi introduzida. |
| Client usa anon key esperada | `src/lib/supabase.ts` usa `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`. |
| Ownership aparece nas leituras principais | `items`, `inbox`, `profiles`, `habit_logs` filtram por `user_id`/`id`. |
| Storage foi centralizado | `src/services/storage.ts` encapsula upload e signed URL. |
| Admin falha fechado | `AdminRoute` bloqueia quando role nao pode ser confirmada. |
| RLS/policies foram versionadas | Migration `20260510000000_security_phase_6.sql` adiciona baseline. |

## Corrigido nesta fase

- `itemsService.uploadImage` deixou de chamar `getPublicUrl` diretamente.
- Upload novo passa por `uploadPersonalAttachment` e usa `createSignedUrl`.
- Rota `/central/admin` foi protegida por `AdminRoute`.
- Central passou a exibir Admin apenas como acesso liberado quando role admin e confirmada.
- Foi criada migration para `user_roles`, `admin_audit_log`, RLS por ownership e bucket `media` privado.

## Aceito temporariamente

| Item | Motivo |
|---|---|
| `image_url` continua existindo | Campo legado necessario para leitura de anexos antigos e compatibilidade da UI atual. |
| Signed URL ainda e persistida no campo legado | Schema ainda nao tem `bucket/path` dedicado para refresh seguro. |
| Admin depende de `user_roles` remota | Migration foi versionada, mas nao aplicada neste ambiente. |
| Edge functions usam `OPENAI_API_KEY` via env | Uso correto em runtime server-side, sem chave no repo. |

## Divida critica

- Aplicar e validar migration no Supabase remoto.
- Criar schema de anexos com `bucket`, `path`, `mime_type`, ownership e refresh de signed URL.
- Criar fluxo administrativo para conceder/revogar roles sem service role no browser.
- Revisar exports para nao incluir campos sensiveis sem confirmacao granular.
- Auditar policies reais existentes no projeto remoto.

## Blockers

- Sem acesso remoto Supabase nesta execucao, nao foi possivel confirmar policies aplicadas, buckets reais ou dados existentes.
- Sem inventario de anexos antigos, nao e seguro remover `image_url`.
