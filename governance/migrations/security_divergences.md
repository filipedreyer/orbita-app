# Divergencias de Seguranca

| Divergencia | Severidade | Impacto | Risco | Arquivos afetados | Esforco | Dependencias | Recomendacao |
|---|---|---|---|---|---|---|---|
| Admin preservado sem auditoria de role | Alta | Acesso administrativo incerto | Exposicao indevida | `src/features/admin/*`, rotas | Medio | Auth/RLS | Criar gate por role/claim |
| Storage de anexos ainda nao revisado | Alta | Privacidade incerta | URLs publicas indevidas | `src/services/items.ts`, `src/lib/inbox-attachments.ts` | Alto | Supabase | Auditar buckets e signed URLs |

## Atualizacao Fase 6

| Divergencia | Status | Decisao |
|---|---|---|
| Admin como rota autenticada simples | Mitigada | `AdminRoute` e `useAdminRole` bloqueiam acesso sem role confirmada em `user_roles`. |
| Central expondo Admin para todo autenticado | Mitigada | Link de Admin so fica ativo quando `isAdmin` e verdadeiro. |
| `getPublicUrl` no upload | Mitigada | Upload novo usa adapter `storage.ts` com `createSignedUrl`. |
| `image_url` legado | Divida | Mantido para leitura de anexos antigos e compatibilidade; precisa migrar para `bucket/path`. |
| RLS nao versionada | Mitigada | Migration SQL versiona policies basicas; aplicacao remota segue pendente. |
| Bucket publico | Mitigada por plano | Migration define `media` como privado; aplicacao remota nao validada nesta fase. |
| RLS nao verificado nesta fase | Alta | Ownership depende de configuracao externa | Dados cruzados | `supabase/*` | Alto | Policies | Versionar e testar policies |
