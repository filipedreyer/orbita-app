# Known Issues - Olys V2.2 RC

## Operacionais

- Supabase remoto ainda precisa receber e validar migrations versionadas.
- Primeiro Admin ainda precisa ser concedido por processo controlado.
- RLS real, buckets e policies precisam ser conferidos no projeto remoto.
- Signed URLs novas ainda sao persistidas no campo legado `image_url` por compatibilidade.

## Dados legados

- `ideia` e `inegociavel` continuam legiveis para nao quebrar historico.
- Rota `/planejar/inegociaveis` permanece como compatibilidade visual de Essencial protegido.
- Nomes internos como `focusItems` e aliases de `inegociavel` ainda existem em dominio/IA.

## Produto

- Asset oficial da marca Olys ainda nao esta integrado.
- Busca global dedicada ainda nao existe.
- Menu e Acesso ainda dependem de destinos temporarios.
- Agenda ainda persiste tecnicamente como Evento.
- Templates ainda usam persistencia provisoria.

## IA

- Parte da IA ainda usa mocks locais e adapters.
- Edge functions precisam ser padronizadas para outputs canonicos e estados de capacidade completos.
