# Divergencias de Seguranca

| Divergencia | Severidade | Impacto | Risco | Arquivos afetados | Esforco | Dependencias | Recomendacao |
|---|---|---|---|---|---|---|---|
| Admin preservado sem auditoria de role | Alta | Acesso administrativo incerto | Exposicao indevida | `src/features/admin/*`, rotas | Medio | Auth/RLS | Criar gate por role/claim |
| Storage de anexos ainda nao revisado | Alta | Privacidade incerta | URLs publicas indevidas | `src/services/items.ts`, `src/lib/inbox-attachments.ts` | Alto | Supabase | Auditar buckets e signed URLs |
| RLS nao verificado nesta fase | Alta | Ownership depende de configuracao externa | Dados cruzados | `supabase/*` | Alto | Policies | Versionar e testar policies |

