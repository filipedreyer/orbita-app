# Contrato - Storage

## Canonico

Storage deve proteger propriedade, anexos e privacidade do usuario.

## Regras

- URLs publicas devem ser auditadas.
- Buckets privados e signed URLs devem ser considerados para anexos sensiveis.
- Ownership deve ser validado por usuario.
- Mudancas de storage exigem plano e confirmacao humana.
- Chamadas de storage devem passar por adapter unico.
- `getPublicUrl` nao deve ser usado fora de fallback legado explicitamente documentado.
- `image_url` permanece campo legado de compatibilidade, nao contrato final.
- Signed URLs devem ter expiracao e plano de refresh quando houver schema de path.

## Enforcement Fase 6

- `src/services/storage.ts` centraliza upload de anexos pessoais.
- Upload novo usa `createSignedUrl` no bucket `media`.
- `src/services/items.ts` deixou de chamar `getPublicUrl` diretamente.
- `supabase/migrations/20260510000000_security_phase_6.sql` define bucket `media` como privado e policies por prefixo de usuario.

## Fora de escopo nesta fase

- Migrar anexos antigos.
- Trocar schema para persistir `bucket/path` em vez de `image_url`.
- Garantir refresh de signed URL para registros legados que so armazenam URL.
