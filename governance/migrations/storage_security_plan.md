# Plano de seguranca de storage - Fase 6

## Objetivo

Remover dependencia de URL publica para anexos pessoais e criar caminho para bucket privado com signed URLs.

## Implementado

- Adapter unico: `src/services/storage.ts`.
- Bucket canonico: `media`.
- Upload novo usa path prefixado por `userId`.
- Upload novo usa `createSignedUrl` com expiracao de 1 hora.
- `itemsService.uploadImage` deixou de chamar `getPublicUrl`.

## Migration

`supabase/migrations/20260510000000_security_phase_6.sql` define:

- `storage.buckets.media.public = false`.
- Policies para select/insert/update/delete em `storage.objects` com prefixo `auth.uid()`.

## Compatibilidade legada

- `image_url` continua lido porque registros antigos dependem dele.
- Nesta fase, a signed URL ainda e retornada para `image_url` por compatibilidade.
- Isso nao e contrato final: signed URL expira e precisa de schema com `bucket/path`.

## Proxima correcao

Criar entidade/metadata de anexos com:

- `bucket`
- `path`
- `name`
- `mime_type`
- `size`
- `owner_user_id`
- `created_at`

Depois disso, a UI pode renovar signed URLs sem persistir URL expirada.
